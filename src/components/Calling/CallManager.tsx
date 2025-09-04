import React from 'react';
import { useCalling } from '@/hooks/useCalling';
import VideoCall from './VideoCall';
import VoiceCall from './VoiceCall';

const CallManager: React.FC = () => {
  const { currentCall, incomingCall, answerCall, declineCall, endCall } = useCalling();

  // Show incoming call if there is one
  if (incomingCall) {
    if (incomingCall.type === 'video') {
      return (
        <VideoCall
          callId={incomingCall.id}
          isIncoming={true}
          callerName={incomingCall.callerName}
          onEndCall={endCall}
          onAcceptCall={() => answerCall(incomingCall)}
          onDeclineCall={() => declineCall(incomingCall)}
        />
      );
    } else {
      return (
        <VoiceCall
          callId={incomingCall.id}
          isIncoming={true}
          callerName={incomingCall.callerName}
          callerAvatar={incomingCall.callerAvatar}
          onEndCall={endCall}
          onAcceptCall={() => answerCall(incomingCall)}
          onDeclineCall={() => declineCall(incomingCall)}
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
          callerName={currentCall.callerName}
          onEndCall={endCall}
        />
      );
    } else {
      return (
        <VoiceCall
          callId={currentCall.id}
          callerName={currentCall.callerName}
          callerAvatar={currentCall.callerAvatar}
          onEndCall={endCall}
        />
      );
    }
  }

  return null;
};

export default CallManager;