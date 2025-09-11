import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  Monitor,
  MonitorOff,
  Settings,
  Users
} from 'lucide-react';

interface VideoCallProps {
  callId: string;
  isIncoming?: boolean;
  isOutgoing?: boolean;
  callerName?: string;
  callerAvatar?: string;
  callStatus?: 'initiating' | 'ringing' | 'answered' | 'ended' | 'declined';
  onEndCall: () => void;
  onAcceptCall?: () => void;
  onDeclineCall?: () => void;
  localStream?: MediaStream;
  remoteStream?: MediaStream;
}

const VideoCall: React.FC<VideoCallProps> = ({
  callId,
  isIncoming = false,
  isOutgoing = false,
  callerName = "Unknown",
  callerAvatar,
  callStatus = 'ringing',
  onEndCall,
  onAcceptCall,
  onDeclineCall,
  localStream,
  remoteStream,
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(!isIncoming);
  const [callStartTime, setCallStartTime] = useState<number | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive && callStatus === 'answered') {
      if (!callStartTime) {
        setCallStartTime(Date.now());
      }
      interval = setInterval(() => {
        if (callStartTime) {
          setCallDuration(Math.floor((Date.now() - callStartTime) / 1000));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive, callStatus, callStartTime]);

  // Attach provided streams
  useEffect(() => {
    if (!isCallActive) return;
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current
        .play()
        .catch(() => {
          // Autoplay might be blocked until user interaction
        });
    }
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.muted = false;
      remoteVideoRef.current
        .play()
        .catch(() => {
          // Autoplay might be blocked until user interaction
        });
    }
  }, [isCallActive, localStream, remoteStream]);

  const toggleVideo = () => {
    const track = localStream?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsVideoEnabled(track.enabled);
    } else {
      toast({ title: 'Video', description: 'No local video track available', variant: 'destructive' });
    }
  };

  const toggleAudio = () => {
    const track = localStream?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsAudioEnabled(track.enabled);
    } else {
      toast({ title: 'Microphone', description: 'No local audio track available', variant: 'destructive' });
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
          }
        };
      } else {
        if (localVideoRef.current && localStream) {
          localVideoRef.current.srcObject = localStream;
        }
        setIsScreenSharing(false);
      }
    } catch (error) {
      toast({ title: 'Screen Share Error', description: 'Failed to start screen sharing', variant: 'destructive' });
    }
  };

  const handleAcceptCall = () => {
    setIsCallActive(true);
    // Ensure playback starts within user gesture
    try { localVideoRef.current?.play(); } catch {}
    try {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.muted = false;
        remoteVideoRef.current.play();
      }
    } catch {}
    onAcceptCall?.();
  };

  const handleDeclineCall = () => {
    onDeclineCall?.();
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    onEndCall();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCallStatusText = () => {
    if (isOutgoing) {
      switch (callStatus) {
        case 'ringing':
        case 'initiating':
          return 'Calling...';
        case 'answered':
          return formatDuration(callDuration);
        default:
          return 'Connecting...';
      }
    }
    return formatDuration(callDuration);
  };

  if (isIncoming && !isCallActive) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="w-96 p-8 text-center bg-card border-border shadow-large">
          <div className="mb-6">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Incoming Video Call</h2>
            <p className="text-muted-foreground text-lg">{callerName}</p>
          </div>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleDeclineCall} variant="destructive" size="lg" className="rounded-full w-16 h-16">
              <PhoneOff className="w-6 h-6" />
            </Button>
            <Button onClick={handleAcceptCall} className="bg-green-500 hover:bg-green-600 rounded-full w-16 h-16">
              <Phone className="w-6 h-6" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-white" />
          <span className="text-white font-medium">{callerName}</span>
          <span className="text-white/70 text-sm">{getCallStatusText()}</span>
        </div>
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Video container */}
      <div className="flex-1 relative">
        {/* Remote video or placeholder */}
        {remoteStream && callStatus === 'answered' ? (
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover bg-gray-900" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-16 h-16 text-white/60" />
              </div>
              <h3 className="text-white text-xl font-medium mb-2">{callerName}</h3>
              <p className="text-white/70">{getCallStatusText()}</p>
            </div>
          </div>
        )}
        
        {/* Local video */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <VideoOff className="w-8 h-8 text-white/60" />
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-black/50 backdrop-blur-sm p-6 flex justify-center items-center gap-4">
        <Button onClick={toggleAudio} variant={isAudioEnabled ? 'secondary' : 'destructive'} size="lg" className="rounded-full w-14 h-14">
          {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </Button>
        <Button onClick={toggleVideo} variant={isVideoEnabled ? 'secondary' : 'destructive'} size="lg" className="rounded-full w-14 h-14">
          {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </Button>
        <Button onClick={toggleScreenShare} variant={isScreenSharing ? 'default' : 'secondary'} size="lg" className="rounded-full w-14 h-14">
          {isScreenSharing ? <MonitorOff className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
        </Button>
        <Button onClick={handleEndCall} variant="destructive" size="lg" className="rounded-full w-14 h-14 ml-4">
          <PhoneOff className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};

export default VideoCall;
