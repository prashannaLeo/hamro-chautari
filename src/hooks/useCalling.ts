import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface CallData {
  id: string;
  type: 'video' | 'voice';
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  receiverId: string;
  status: 'ringing' | 'answered' | 'ended' | 'declined';
  startTime?: Date;
  endTime?: Date;
}

export const useCalling = () => {
  const { user } = useAuth();
  const [currentCall, setCurrentCall] = useState<CallData | null>(null);
  const [incomingCall, setIncomingCall] = useState<CallData | null>(null);

  // Simulate receiving an incoming call (for demo purposes)
  const simulateReceiverCall = useCallback((
    callData: CallData,
    receiverName: string,
    receiverAvatar?: string
  ) => {
    // In a real app, this would be triggered by a socket message or push notification
    // For demo: simulate receiving a call FROM the person we're calling
    const incomingCallData: CallData = {
      ...callData,
      callerName: receiverName, // Show the name of who we called
      callerAvatar: receiverAvatar
    };

    // Clear current call and show as incoming (to simulate receiving the callback)
    setCurrentCall(null);
    setIncomingCall(incomingCallData);

    toast({
      title: `Incoming ${callData.type === 'video' ? 'Video' : 'Voice'} Call`,
      description: `${receiverName} is calling you back`,
      duration: 30000
    });
  }, []);

  const initiateCall = useCallback(async (
    receiverId: string, 
    receiverName: string, 
    callType: 'video' | 'voice',
    receiverAvatar?: string
  ) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to make calls",
        variant: "destructive"
      });
      return;
    }

    const callData: CallData = {
      id: generateCallId(),
      type: callType,
      callerId: user.id,
      callerName: user.email || 'Unknown User',
      receiverId,
      status: 'ringing',
      startTime: new Date()
    };

    setCurrentCall(callData);

    // Show outgoing call toast for caller
    toast({
      title: `${callType === 'video' ? 'Video' : 'Voice'} Call`,
      description: `Calling ${receiverName}...`,
      duration: 30000
    });

    // Simulate incoming call for receiver (in real app, this would be sent via socket/server)
    // For demo purposes, simulate the person calling you back after 3 seconds
    setTimeout(() => {
      console.log('Simulating callback from:', receiverName);
      simulateReceiverCall(callData, receiverName, receiverAvatar);
    }, 3000);

    return callData;
  }, [user, simulateReceiverCall]);

  const answerCall = useCallback((callData: CallData) => {
    setIncomingCall(null);
    setCurrentCall({
      ...callData,
      status: 'answered',
      startTime: new Date()
    });

    toast({
      title: "Call Answered",
      description: `Connected to ${callData.callerName}`
    });
  }, []);

  const declineCall = useCallback((callData: CallData) => {
    setIncomingCall(null);
    
    toast({
      title: "Call Declined",
      description: `Declined call from ${callData.callerName}`
    });

    // In a real app, send decline signal to caller
    console.log('Call declined:', callData);
  }, []);

  const endCall = useCallback(() => {
    if (currentCall) {
      setCurrentCall({
        ...currentCall,
        status: 'ended',
        endTime: new Date()
      });

      setTimeout(() => {
        setCurrentCall(null);
      }, 1000);

      toast({
        title: "Call Ended",
        description: "The call has been ended"
      });
    }
    
    // Also clear incoming call if ending during ring
    if (incomingCall) {
      setIncomingCall(null);
    }
  }, [currentCall, incomingCall]);

  // Simulate receiving an incoming call (public method for testing)
  const simulateIncomingCall = useCallback((
    callerId: string,
    callerName: string,
    callType: 'video' | 'voice',
    callerAvatar?: string
  ) => {
    if (!user) return;

    const incomingCallData: CallData = {
      id: generateCallId(),
      type: callType,
      callerId,
      callerName,
      callerAvatar,
      receiverId: user.id,
      status: 'ringing'
    };

    setIncomingCall(incomingCallData);

    toast({
      title: `Incoming ${callType === 'video' ? 'Video' : 'Voice'} Call`,
      description: `${callerName} is calling you`,
      duration: 30000
    });
  }, [user]);

  return {
    currentCall,
    incomingCall,
    initiateCall,
    answerCall,
    declineCall,
    endCall,
    simulateIncomingCall
  };
};

const generateCallId = (): string => {
  return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};