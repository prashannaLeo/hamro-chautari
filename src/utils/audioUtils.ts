// Audio utilities for calls - ringtones, notifications, and sound management

let currentRingtone: HTMLAudioElement | null = null;
let notificationAudio: HTMLAudioElement | null = null;

// Create ringtone audio (using data URL for a simple beep tone)
const createRingtone = (): HTMLAudioElement => {
  const audio = new Audio();
  // Create a simple beep sound using Web Audio API
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // Create a ringtone pattern
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.5);
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 1);
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  
  // For simplicity, we'll use a data URL for a beep sound
  audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApMo+LyvmwhBjuY2vLNfyoFLH/M8diJNwgZaLvt559NEAxPqOPwtmIcBzuY2vLMeysELH/M8diJNwgZaLvt559NEAxPqOPwtmIcB';
  audio.loop = true;
  audio.volume = 0.7;
  
  return audio;
};

// Create notification sound
const createNotificationSound = (): HTMLAudioElement => {
  const audio = new Audio();
  // Simple notification beep
  audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApMo+LyvmwhBjuY2vLNfyoFLH/M8diJNwgZaLvt559NEAxPqOPwtmIcBzuY2vLMeysELH/M8diJNwgZaLvt559NEAxPqOPwtmIcB';
  audio.volume = 0.5;
  
  return audio;
};

export const playRingtone = () => {
  try {
    if (!currentRingtone) {
      currentRingtone = createRingtone();
    }
    currentRingtone.currentTime = 0;
    currentRingtone.play().catch(error => {
      console.warn('Could not play ringtone:', error);
    });
  } catch (error) {
    console.warn('Error creating ringtone:', error);
  }
};

export const stopRingtone = () => {
  if (currentRingtone) {
    currentRingtone.pause();
    currentRingtone.currentTime = 0;
  }
};

export const playNotificationSound = () => {
  try {
    if (!notificationAudio) {
      notificationAudio = createNotificationSound();
    }
    notificationAudio.currentTime = 0;
    notificationAudio.play().catch(error => {
      console.warn('Could not play notification sound:', error);
    });
  } catch (error) {
    console.warn('Error creating notification sound:', error);
  }
};

export const showCallNotification = (callerName: string, callType: 'video' | 'voice') => {
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(`Incoming ${callType} call`, {
        body: `${callerName} is calling you`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'call-notification',
        requireInteraction: true
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(`Incoming ${callType} call`, {
            body: `${callerName} is calling you`,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'call-notification',
            requireInteraction: true
          });
        }
      });
    }
  }
};

// Request notification permission on app load
export const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.warn('Error requesting notification permission:', error);
      return false;
    }
  }
  return Notification.permission === 'granted';
};