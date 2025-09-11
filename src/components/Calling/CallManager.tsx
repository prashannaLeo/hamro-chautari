import React, { useEffect } from 'react';
import { useCalling } from '@/hooks/useCalling';
import VideoCall from './VideoCall';
import VoiceCall from './VoiceCall';

const CallManager: React.FC = () => {
  const { currentCall, incomingCall, answerCall, declineCall, endCall, switchToVideo, localStream, remoteStream } = useCalling();

  // Set up media streams for video elements
  useEffect(() => {
    if (currentCall) {
      if (localStream) {
        console.log('Local stream available:', localStream.getTracks());
      }
      if (remoteStream) {
        console.log('Remote stream available:', remoteStream.getTracks());
      }
    }
  }, [currentCall, localStream, remoteStream]);

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
          localStream={localStream || undefined}
          remoteStream={remoteStream || undefined}
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
          onSwitchToVideo={switchToVideo}
          localStream={localStream || undefined}
          remoteStream={remoteStream || undefined}
        />
      );
    }
  }

  // Show current call if there is one
  if (currentCall && currentCall.status !== 'ended') {
    const isOutgoing = currentCall.status === 'ringing' || currentCall.status === 'initiating';
    const contactName = isOutgoing ? currentCall.receiver_name : currentCall.caller_name;
    const contactAvatar = isOutgoing ? currentCall.receiver_avatar : currentCall.caller_avatar;
    
    if (currentCall.type === 'video') {
      return (
        <VideoCall
          callId={currentCall.id}
          callerName={contactName}
          callerAvatar={contactAvatar}
          isOutgoing={isOutgoing}
          callStatus={currentCall.status}
          onEndCall={endCall}
          localStream={localStream || undefined}
          remoteStream={remoteStream || undefined}
        />
      );
    } else {
      return (
        <VoiceCall
          callId={currentCall.id}
          callerName={contactName}
          callerAvatar={contactAvatar}
          isOutgoing={isOutgoing}
          callStatus={currentCall.status}
          onEndCall={endCall}
          onSwitchToVideo={switchToVideo}
          localStream={localStream || undefined}
          remoteStream={remoteStream || undefined}
        />
      );
    }
  }

  return null;
};

export default CallManager;