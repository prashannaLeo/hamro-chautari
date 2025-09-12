import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { playRingtone, stopRingtone, playNotificationSound, showCallNotification } from '@/utils/audioUtils';
import { WebRTCService } from '@/utils/webrtc';

export interface CallData {
  id: string;
  type: 'video' | 'voice';
  caller_id: string;
  caller_name: string;
  caller_avatar?: string;
  receiver_id: string;
  receiver_name: string;
  receiver_avatar?: string;
  status: 'initiating' | 'ringing' | 'answered' | 'ended' | 'declined';
  offer?: any;
  answer?: any;
  ice_candidates?: any[];
  created_at: string;
  updated_at: string;
}

export const useCalling = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentCall, setCurrentCall] = useState<CallData | null>(null);
  const [incomingCall, setIncomingCall] = useState<CallData | null>(null);
  const [webrtcService] = useState(() => new WebRTCService());
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const callTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<any>(null);
  const processedCandidatesRef = useRef<Set<string>>(new Set());
  const lastProcessedOfferSdpRef = useRef<string | null>(null);
  const lastLocalOfferSdpRef = useRef<string | null>(null);

  // Initialize realtime subscription for calls
  useEffect(() => {
    if (!user) return;

    console.info('Setting up realtime subscription for calls...');

    // using processedCandidatesRef from hook scope

    const channel = supabase
      .channel('calls_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'calls' }, async (payload) => {
        const callData = payload.new as CallData;
        // Only react to calls involving current user
        if (callData.receiver_id !== user.id && callData.caller_id !== user.id) return;

        console.log('Call INSERT received:', callData);
        if (callData.receiver_id === user.id && callData.status === 'ringing') {
          // Incoming call
          setIncomingCall(callData);
          playRingtone();
          playNotificationSound();
          showCallNotification(callData.caller_name, callData.type);
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'calls' }, async (payload) => {
        const callData = payload.new as CallData;
        if (callData.receiver_id !== user.id && callData.caller_id !== user.id) return;

        console.log('Call UPDATE received:', callData.status);
        if (callData.status === 'answered' && callData.answer) {
          if (callData.caller_id === user.id) {
            try {
              await webrtcService.setRemoteDescription(callData.answer as RTCSessionDescriptionInit);
              setCurrentCall({
                ...callData,
                type: callData.type as 'video' | 'voice',
                status: callData.status as 'initiating' | 'ringing' | 'answered' | 'ended' | 'declined'
              } as CallData);
              setIncomingCall(null);
              setLocalStream(webrtcService.getLocalStream());
              stopRingtone();
            } catch (error) {
              console.error('Error setting remote description:', error);
            }
          }
        } else if (callData.status === 'declined' || callData.status === 'ended') {
          // Call ended or declined
          setCurrentCall(null);
          setIncomingCall(null);
          stopRingtone();
          webrtcService.closeConnection();
        }

        // Renegotiation: if already answered and a new offer arrives (from either side)
        if (
          callData.status === 'answered' &&
          callData.offer &&
          (callData.offer as any).sdp &&
          lastProcessedOfferSdpRef.current !== (callData.offer as any).sdp &&
          lastLocalOfferSdpRef.current !== (callData.offer as any).sdp
        ) {
          try {
            await webrtcService.setRemoteDescription(callData.offer as RTCSessionDescriptionInit);
            const answer = await webrtcService.createAnswer(callData.type === 'video');
            setLocalStream(webrtcService.getLocalStream());
            lastProcessedOfferSdpRef.current = (callData.offer as any).sdp;
            await supabase
              .from('calls')
              .update({
                answer: JSON.parse(JSON.stringify(answer)),
                updated_at: new Date().toISOString()
              })
              .eq('id', callData.id);
          } catch (err) {
            console.error('Renegotiation failed:', err);
          }
        }

        // Handle ICE candidates (dedupe)
        const candidates = (callData.ice_candidates as any[]) || [];
        for (const candidate of candidates) {
          const key = JSON.stringify(candidate);
          if (!processedCandidatesRef.current.has(key)) {
            processedCandidatesRef.current.add(key);
            try {
              await webrtcService.addIceCandidate(candidate);
            } catch (err) {
              console.error('Error adding ICE candidate:', err);
            }
          }
        }
      })
      .subscribe((status) => {
        console.info('Realtime subscription status:', status);
      });

    channelRef.current = channel;

    // Fallback polling if realtime fails
    const pollInterval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('calls')
          .select('*')
          .eq('receiver_id', user.id)
          .eq('status', 'ringing')
          .order('created_at', { ascending: false })
          .limit(1);

        if (!error && data && data.length > 0) {
          const call = data[0] as CallData;
          if (!incomingCall || incomingCall.id !== call.id) {
            setIncomingCall(call);
            playRingtone();
            playNotificationSound();
          }
        }
      } catch (e) {
        // silent
      }
    }, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
      stopRingtone();
    };
  }, [user, webrtcService, incomingCall]);

  // Fallback polling for active call updates (answer and ICE) in case realtime not available
  useEffect(() => {
    const activeId = currentCall?.id || incomingCall?.id;
    if (!user || !activeId) return;

    const interval = setInterval(async () => {
      try {
        const { data } = await supabase
          .from('calls')
          .select('*')
          .eq('id', activeId)
          .single();

        const callData = data as unknown as CallData | null;
        if (!callData) return;

        // Process status changes
        if (callData.status === 'answered' && callData.answer) {
          if (callData.caller_id === user.id) {
            try {
              await webrtcService.setRemoteDescription(callData.answer as RTCSessionDescriptionInit);
              setCurrentCall({
                ...callData,
                type: callData.type as 'video' | 'voice',
                status: callData.status as 'initiating' | 'ringing' | 'answered' | 'ended' | 'declined'
              } as CallData);
              setIncomingCall(null);
              setLocalStream(webrtcService.getLocalStream());
              stopRingtone();
            } catch (err) {
              console.error('Polling: setRemoteDescription failed', err);
            }
          }
        } else if (callData.status === 'declined' || callData.status === 'ended') {
          setCurrentCall(null);
          setIncomingCall(null);
          stopRingtone();
          webrtcService.closeConnection();
          setLocalStream(null);
          setRemoteStream(null);
        }

        // Renegotiation (polling): detect a new remote offer
        if (
          callData.status === 'answered' &&
          (callData as any).offer &&
          (callData as any).offer.sdp &&
          lastProcessedOfferSdpRef.current !== (callData as any).offer.sdp &&
          lastLocalOfferSdpRef.current !== (callData as any).offer.sdp
        ) {
          try {
            await webrtcService.setRemoteDescription((callData as any).offer as RTCSessionDescriptionInit);
            const answer = await webrtcService.createAnswer(callData.type === 'video');
            setLocalStream(webrtcService.getLocalStream());
            lastProcessedOfferSdpRef.current = (callData as any).offer.sdp;
            await supabase
              .from('calls')
              .update({
                answer: JSON.parse(JSON.stringify(answer)),
                updated_at: new Date().toISOString()
              })
              .eq('id', callData.id);
          } catch (err) {
            console.error('Polling renegotiation failed', err);
          }
        }

        // Process ICE candidates with dedupe
        const candidates = (callData.ice_candidates as any[]) || [];
        for (const candidate of candidates) {
          const key = JSON.stringify(candidate);
          if (!processedCandidatesRef.current.has(key)) {
            processedCandidatesRef.current.add(key);
            try {
              await webrtcService.addIceCandidate(candidate);
            } catch (err) {
              console.error('Polling: addIceCandidate failed', err);
            }
          }
        }
      } catch (e) {
        // silent
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [currentCall, incomingCall, user, webrtcService]);

  // WebRTC event handlers
  useEffect(() => {
    webrtcService.onIceCandidate = async (candidate) => {
      const activeCallId = currentCall?.id || incomingCall?.id;
      if (!activeCallId) return;
      try {
        // Read latest candidates to avoid overwrite races
        const { data: callRow } = await supabase
          .from('calls')
          .select('ice_candidates')
          .eq('id', activeCallId)
          .single();
        const latest: any[] = (callRow?.ice_candidates as any[]) || [];
        const set = new Set(latest.map((c) => JSON.stringify(c)));
        const candidatePayload: any = (candidate as any)?.toJSON ? (candidate as any).toJSON() : candidate;
        const key = JSON.stringify(candidatePayload);
        if (!set.has(key)) latest.push(candidatePayload);

        await supabase
          .from('calls')
          .update({
            ice_candidates: latest,
            updated_at: new Date().toISOString()
          })
          .eq('id', activeCallId);
      } catch (e) {
        console.warn('Failed to push ICE candidate:', e);
      }
    };

    webrtcService.onConnectionStateChange = (state) => {
      console.log('WebRTC connection state:', state);
      if (state === 'failed') {
        // Fallback local cleanup if connection fails
        setCurrentCall(null);
        setIncomingCall(null);
        stopRingtone();
        webrtcService.closeConnection();
        setLocalStream(null);
        setRemoteStream(null);
      }
    };

    webrtcService.onRemoteStream = (stream) => {
      setRemoteStream(stream);
    };
  }, [currentCall, incomingCall, webrtcService]);

  const endCall = useCallback(async () => {
    const activeCall = currentCall || incomingCall;
    if (!activeCall) return;

    try {
      await supabase
        .from('calls')
        .update({
          status: 'ended',
          updated_at: new Date().toISOString()
        })
        .eq('id', activeCall.id);

      setCurrentCall(null);
      setIncomingCall(null);
      stopRingtone();
      webrtcService.closeConnection();
      setLocalStream(null);
      setRemoteStream(null);

      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }

      toast({
        title: "Call Ended",
        description: "The call has been ended"
      });
    } catch (error) {
      console.error('Error ending call:', error);
      // Still clean up local state even if database update fails
      setCurrentCall(null);
      setIncomingCall(null);
      stopRingtone();
      webrtcService.closeConnection();
      setLocalStream(null);
      setRemoteStream(null);
    }
  }, [currentCall, incomingCall, webrtcService]);

  const initiateCall = useCallback(async (
    receiverId: string, 
    receiverName: string, 
    callType: 'video' | 'voice',
    receiverAvatar?: string
  ): Promise<CallData | undefined> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to make calls",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create WebRTC offer
      const offer = await webrtcService.createOffer(callType === 'video');
      // Reset candidate/process state for new call
      processedCandidatesRef.current.clear();
      lastProcessedOfferSdpRef.current = null;
      lastLocalOfferSdpRef.current = (offer as any).sdp || null;
      // Capture local stream for UI
      setLocalStream(webrtcService.getLocalStream());

      // Create call record in database
      const { data: callData, error } = await supabase
        .from('calls')
        .insert({
          type: callType,
          caller_id: user.id,
          caller_name: user.user_metadata?.display_name || user.email || 'Unknown User',
          caller_avatar: user.user_metadata?.avatar_url,
          receiver_id: receiverId,
          receiver_name: receiverName,
          receiver_avatar: receiverAvatar,
          status: 'ringing',
          offer: JSON.parse(JSON.stringify(offer))
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating call:', error);
        toast({
          title: "Error",
          description: "Failed to initiate call",
          variant: "destructive"
        });
        return;
      }

      setCurrentCall(callData as CallData);

      // Set timeout for call (30 seconds)
      callTimeoutRef.current = setTimeout(() => {
        endCall();
      }, 30000);

      toast({
        title: `${callType === 'video' ? 'Video' : 'Voice'} Call`,
        description: `Calling ${receiverName}...`,
      });

      return {
        ...callData,
        type: callData.type as 'video' | 'voice',
        status: callData.status as 'initiating' | 'ringing' | 'answered' | 'ended' | 'declined'
      } as CallData;
    } catch (error) {
      console.error('Error initiating call:', error);
      toast({
        title: "Error",
        description: "Failed to initiate call",
        variant: "destructive"
      });
    }
  }, [user, webrtcService]);

  const answerCall = useCallback(async (callData: CallData) => {
    if (!callData.offer) {
      console.error('No offer found in call data');
      return;
    }

    try {
      // Set remote description and create answer
      await webrtcService.setRemoteDescription(callData.offer as RTCSessionDescription);
      lastProcessedOfferSdpRef.current = (callData.offer as any)?.sdp || null;
      const answer = await webrtcService.createAnswer(callData.type === 'video');
      // Capture local stream for UI
      setLocalStream(webrtcService.getLocalStream());

      // Update call status to answered
      const { error } = await supabase
        .from('calls')
        .update({
          status: 'answered',
          answer: JSON.parse(JSON.stringify(answer)),
          updated_at: new Date().toISOString()
        })
        .eq('id', callData.id);

      if (error) {
        console.error('Error answering call:', error);
        return;
      }

      setIncomingCall(null);
      setCurrentCall({ ...callData, status: 'answered', answer: JSON.parse(JSON.stringify(answer)) } as CallData);
      stopRingtone();

      toast({
        title: "Call Answered",
        description: `Connected to ${callData.caller_name}`
      });
    } catch (error) {
      console.error('Error answering call:', error);
      toast({
        title: "Error",
        description: "Failed to answer call",
        variant: "destructive"
      });
    }
  }, [webrtcService]);

  const declineCall = useCallback(async (callData: CallData) => {
    try {
      await supabase
        .from('calls')
        .update({
          status: 'declined',
          updated_at: new Date().toISOString()
        })
        .eq('id', callData.id);

      setIncomingCall(null);
      stopRingtone();
      
      toast({
        title: "Call Declined",
        description: `Declined call from ${callData.caller_name}`
      });
    } catch (error) {
      console.error('Error declining call:', error);
    }
  }, []);


  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
      }
      stopRingtone();
      webrtcService.closeConnection();
      setLocalStream(null);
      setRemoteStream(null);
    };
  }, [webrtcService]);

  const getLocalStream = useCallback(() => {
    return webrtcService.getLocalStream();
  }, [webrtcService]);

  const getRemoteStream = useCallback(() => {
    return webrtcService.getRemoteStream();
  }, [webrtcService]);

  const toggleMicrophone = useCallback(() => {
    return webrtcService.toggleMicrophone();
  }, [webrtcService]);

  const toggleCamera = useCallback(() => {
    return webrtcService.toggleCamera();
  }, [webrtcService]);

  const switchToVideo = useCallback(async () => {
    const activeCall = currentCall || incomingCall;
    if (!activeCall || activeCall.type !== 'voice') return;

    try {
      // Upgrade local media and create a renegotiation offer that includes video
      const offer = await webrtcService.upgradeToVideoAndCreateOffer();
      processedCandidatesRef.current.clear();
      lastLocalOfferSdpRef.current = (offer as any)?.sdp || null;
      setLocalStream(webrtcService.getLocalStream());

      // Update call row with new type and new offer; keep status as answered
      await supabase
        .from('calls')
        .update({
          type: 'video',
          offer: JSON.parse(JSON.stringify(offer)),
          updated_at: new Date().toISOString()
        })
        .eq('id', activeCall.id);

      // Update local state
      if (currentCall) setCurrentCall({ ...currentCall, type: 'video' });

      toast({
        title: 'Switched to Video',
        description: 'Negotiating video upgrade...'
      });
    } catch (error) {
      console.error('Error switching to video:', error);
      toast({
        title: 'Error',
        description: 'Failed to switch to video call',
        variant: 'destructive'
      });
    }
  }, [currentCall, incomingCall, webrtcService]);

  return {
    currentCall,
    incomingCall,
    localStream,
    remoteStream,
    initiateCall,
    answerCall,
    declineCall,
    endCall,
    switchToVideo,
    getLocalStream,
    getRemoteStream,
    toggleMicrophone,
    toggleCamera
  };
};

const generateCallId = (): string => {
  return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};