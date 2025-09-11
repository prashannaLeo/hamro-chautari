import React, { useEffect } from 'react';
import { useCalling } from '@/hooks/useCalling';
import VideoCall from './VideoCall';
import VoiceCall from './VoiceCall';

const CallManager: React.FC = () => {
  const { currentCall, incomingCall, answerCall, declineCall, endCall, getLocalStream, getRemoteStream } = useCalling();

  // Set up media streams for video elements
  useEffect(() => {
    const setupStreams = async () => {
      const localStream = getLocalStream();
      const remoteStream = getRemoteStream();
      
      // Handle local stream setup
      if (localStream) {
        console.log('Local stream available:', localStream.getTracks());
      }
      
      // Handle remote stream setup  
      if (remoteStream) {
        console.log('Remote stream available:', remoteStream.getTracks());
      }
    };

    if (currentCall) {
      setupStreams();
    }
  }, [currentCall, getLocalStream, getRemoteStream]);

  // Show incoming call if there is one
  if (incomingCall) {
    if (incomingCall.type === 'video') {
      return (
        <VideoCall
          callId={incomingCall.id}
          isIncoming={true}
          callerName={incomingCall.caller_name}
          onEndCall={endCall}
          onAcceptCall={() => answerCall(incomingCall)}
          onDeclineCall={() => declineCall(incomingCall)}
          localStream={getLocalStream() || undefined}
          remoteStream={getRemoteStream() || undefined}
        />
      );
    } else {
      return (
        <VoiceCall
          callId={incomingCall.id}
          isIncoming={true}
          callerName={incomingCall.caller_name}
          callerAvatar={incomingCall.caller_avatar}
          onEndCall={endCall}
          onAcceptCall={() => answerCall(incomingCall)}
          onDeclineCall={() => declineCall(incomingCall)}
          localStream={getLocalStream() || undefined}
          remoteStream={getRemoteStream() || undefined}
        />
      );
    }
  }

  // Show current call if there is one
  if (currentCall && currentCall.status !== 'ended') {
    if (currentCall.type === 'video') {
      return (
        <VideoCall
          callId={currentCall.id}
          callerName={currentCall.caller_name}
          onEndCall={endCall}
          localStream={getLocalStream() || undefined}
          remoteStream={getRemoteStream() || undefined}
        />
      );
    } else {
      return (
        <VoiceCall
          callId={currentCall.id}
          callerName={currentCall.caller_name}
          callerAvatar={currentCall.caller_avatar}
          onEndCall={endCall}
          localStream={getLocalStream() || undefined}
          remoteStream={getRemoteStream() || undefined}
        />
      );
    }
  }

  return null;
};

export default CallManager;