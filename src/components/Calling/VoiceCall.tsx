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
  UserCircle
} from 'lucide-react';

interface VoiceCallProps {
  callId: string;
  isIncoming?: boolean;
  callerName?: string;
  callerAvatar?: string;
  onEndCall: () => void;
  onAcceptCall?: () => void;
  onDeclineCall?: () => void;
}

const VoiceCall: React.FC<VoiceCallProps> = ({
  callId,
  isIncoming = false,
  callerName = "Unknown",
  callerAvatar,
  onEndCall,
  onAcceptCall,
  onDeclineCall
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(!isIncoming);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive && callStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive, callStatus]);

  useEffect(() => {
    if (isCallActive) {
      initializeAudio();
      // Simulate connection after 2 seconds
      setTimeout(() => {
        setCallStatus('connected');
      }, 2000);
    }
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCallActive]);

  const initializeAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });
      
      setLocalStream(stream);
      toast({
        title: "Audio Access",
        description: "Microphone access granted"
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Audio Error",
        description: "Failed to access microphone",
        variant: "destructive"
      });
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerEnabled(!isSpeakerEnabled);
    toast({
      title: isSpeakerEnabled ? "Speaker Off" : "Speaker On",
      description: isSpeakerEnabled ? "Audio switched to earpiece" : "Audio switched to speaker"
    });
  };

  const handleAcceptCall = () => {
    setIsCallActive(true);
    onAcceptCall?.();
  };

  const handleDeclineCall = () => {
    onDeclineCall?.();
  };

  const handleEndCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    setIsCallActive(false);
    setCallStatus('ended');
    onEndCall();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    if (isIncoming && !isCallActive) return 'Incoming call...';
    if (callStatus === 'connecting') return 'Connecting...';
    if (callStatus === 'connected') return formatDuration(callDuration);
    return 'Call ended';
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
                  {callerName.split(' ').map(n => n[0]).join('').toUpperCase()}
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
            <Button
              onClick={handleDeclineCall}
              variant="destructive"
              size="lg"
              className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600"
            >
              <PhoneOff className="w-6 h-6" />
            </Button>
            <Button
              onClick={handleAcceptCall}
              className="bg-green-500 hover:bg-green-600 rounded-full w-16 h-16"
            >
              <Phone className="w-6 h-6" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 z-50 flex flex-col">
      {/* Call Interface */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center mb-12">
          <div className="relative mb-8">
            <Avatar className="w-40 h-40 mx-auto ring-4 ring-white/30 shadow-2xl">
              <AvatarImage src={callerAvatar} alt={callerName} />
              <AvatarFallback className="bg-primary/20 text-white text-3xl">
                {callerName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {callStatus === 'connected' && (
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-green-500 w-8 h-8 rounded-full animate-pulse flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            )}
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">{callerName}</h1>
          <p className="text-white/70 text-xl">{getStatusText()}</p>
          
          {callStatus === 'connecting' && (
            <div className="mt-4 flex justify-center">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Audio Element for Remote Audio */}
        <audio ref={audioRef} autoPlay />
      </div>

      {/* Controls */}
      <div className="bg-black/30 backdrop-blur-sm p-8 flex justify-center items-center gap-6">
        <Button
          onClick={toggleSpeaker}
          variant={isSpeakerEnabled ? "secondary" : "outline"}
          size="lg"
          className="rounded-full w-16 h-16 bg-white/10 hover:bg-white/20 border-white/30"
        >
          {isSpeakerEnabled ? 
            <Volume2 className="w-6 h-6 text-white" /> : 
            <VolumeX className="w-6 h-6 text-white" />
          }
        </Button>
        
        <Button
          onClick={toggleAudio}
          variant={isAudioEnabled ? "secondary" : "destructive"}
          size="lg"
          className="rounded-full w-16 h-16"
        >
          {isAudioEnabled ? 
            <Mic className="w-6 h-6" /> : 
            <MicOff className="w-6 h-6" />
          }
        </Button>
        
        <Button
          onClick={handleEndCall}
          variant="destructive"
          size="lg"
          className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600"
        >
          <PhoneOff className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};

export default VoiceCall;