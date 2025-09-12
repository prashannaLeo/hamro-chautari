import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Video
} from 'lucide-react';

interface VoiceCallProps {
  callId: string;
  isIncoming?: boolean;
  isOutgoing?: boolean;
  callerName?: string;
  callerAvatar?: string;
  callStatus?: 'initiating' | 'ringing' | 'answered' | 'ended' | 'declined';
  onEndCall: () => void;
  onAcceptCall?: () => void;
  onDeclineCall?: () => void;
  onSwitchToVideo?: () => void;
  localStream?: MediaStream;
  remoteStream?: MediaStream;
}

const VoiceCall: React.FC<VoiceCallProps> = ({
  callId,
  isIncoming = false,
  isOutgoing = false,
  callerName = 'Unknown',
  callerAvatar,
  callStatus = 'ringing',
  onEndCall,
  onAcceptCall,
  onDeclineCall,
  onSwitchToVideo,
  localStream,
  remoteStream,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(!isIncoming || callStatus === 'answered');
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

  // Attach remote audio
  useEffect(() => {
    if (audioRef.current && remoteStream) {
      audioRef.current.srcObject = remoteStream;
      audioRef.current
        .play()
        .catch(() => {
          // Autoplay might be blocked until user interaction
        });
    }
  }, [remoteStream]);


  const toggleAudio = () => {
    const track = localStream?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsAudioEnabled(track.enabled);
    } else {
      toast({ title: 'Microphone', description: 'No local audio track available', variant: 'destructive' });
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerEnabled((prev) => !prev);
    toast({
      title: !isSpeakerEnabled ? 'Speaker On' : 'Speaker Off',
      description: !isSpeakerEnabled ? 'Audio switched to speaker' : 'Audio switched to earpiece',
    });
  };

  const handleAcceptCall = () => {
    setIsCallActive(true);
    try { audioRef.current?.play(); } catch {}
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
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    if (isIncoming && !isCallActive) return 'Incoming call...';
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
    if (callStatus === 'answered') return formatDuration(callDuration);
    return 'Connecting...';
  };

  if (isIncoming && !isCallActive) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 z-50 flex items-center justify-center">
        <Card className="w-96 p-8 text-center bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
          <div className="mb-8">
            <div className="relative mx-auto mb-6">
              <Avatar className="w-32 h-32 mx-auto ring-4 ring-white/30">
                <AvatarImage src={callerAvatar} alt={callerName} />
                <AvatarFallback className="bg-primary/20 text-white text-2xl">
                  {callerName.split(' ').map((n) => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="bg-green-500 w-6 h-6 rounded-full animate-pulse"></div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{callerName}</h2>
            <p className="text-white/70 text-lg">Incoming voice call</p>
          </div>

          <div className="flex gap-6 justify-center">
            <Button onClick={handleDeclineCall} variant="destructive" size="lg" className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600">
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
    <div className="video-call-mobile">
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center mb-12">
          <div className="relative mb-8">
            <Avatar className="w-32 h-32 sm:w-40 sm:h-40 mx-auto ring-4 ring-white/30 shadow-2xl">
              <AvatarImage src={callerAvatar} alt={callerName} />
              <AvatarFallback className="bg-primary/20 text-white text-2xl sm:text-3xl">
                {callerName.split(' ').map((n) => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {callStatus === 'answered' && (
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-green-500 w-6 h-6 sm:w-8 sm:h-8 rounded-full animate-pulse flex items-center justify-center">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full"></div>
                </div>
              </div>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{callerName}</h1>
          <p className="text-white/70 text-lg sm:text-xl">{getStatusText()}</p>
        </div>

        {/* Remote Audio */}
        <audio ref={audioRef} autoPlay />
      </div>

      {/* Controls */}
      <div className="video-call-controls">
        <Button onClick={toggleSpeaker} variant={isSpeakerEnabled ? 'secondary' : 'outline'} size="lg" className="btn-ghost-mobile rounded-full bg-white/10 hover:bg-white/20 border-white/30">
          {isSpeakerEnabled ? <Volume2 className="w-6 h-6 text-white" /> : <VolumeX className="w-6 h-6 text-white" />}
        </Button>
        {callStatus === 'answered' && onSwitchToVideo && (
          <Button onClick={onSwitchToVideo} variant="secondary" size="lg" className="btn-ghost-mobile rounded-full">
            <Video className="w-6 h-6" />
          </Button>
        )}
        <Button onClick={toggleAudio} variant={isAudioEnabled ? 'secondary' : 'destructive'} size="lg" className="btn-ghost-mobile rounded-full">
          {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </Button>
        <Button onClick={handleEndCall} variant="destructive" size="lg" className="btn-ghost-mobile rounded-full bg-red-500 hover:bg-red-600">
          <PhoneOff className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};

export default VoiceCall;
