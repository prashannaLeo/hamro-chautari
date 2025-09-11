import React, { useEffect } from 'react';
import { useCalling } from '@/hooks/useCalling';
import VideoCall from './VideoCall';
import VoiceCall from './VoiceCall';

const CallManager: React.FC = () => {
  const { currentCall, incomingCall, answerCall, declineCall, endCall, localStream, remoteStream } = useCalling();

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
          localStream={localStream || undefined}
          remoteStream={remoteStream || undefined}
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
          localStream={localStream || undefined}
          remoteStream={remoteStream || undefined}
        />
      );
    } else {
      return (
        <VoiceCall
          callId={currentCall.id}
          callerName={currentCall.caller_name}
          callerAvatar={currentCall.caller_avatar}
          onEndCall={endCall}
          localStream={localStream || undefined}
          remoteStream={remoteStream || undefined}
        />
      );
    }
  }

  return null;
};

export default CallManager;