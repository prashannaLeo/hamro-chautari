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

    toast({
      title: `${callType === 'video' ? 'Video' : 'Voice'} Call`,
      description: `Calling ${receiverName}...`
    });

    // In a real app, you would send this call data to your signaling server
    // For demo purposes, we'll simulate the call
    console.log('Initiating call:', callData);

    return callData;
  }, [user]);

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
  }, [currentCall]);

  // Simulate receiving an incoming call
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
      duration: 10000
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