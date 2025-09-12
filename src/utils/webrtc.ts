// WebRTC service for handling peer-to-peer connections for video and audio calls

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private candidateBuffer: RTCIceCandidateInit[] = [];

  // Event handlers
  public onIceCandidate: ((candidate: RTCIceCandidate) => void) | null = null;
  public onConnectionStateChange: ((state: RTCPeerConnectionState) => void) | null = null;
  public onRemoteStream: ((stream: MediaStream) => void) | null = null;

  private configuration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' }
    ]
  };

  constructor() {
    this.initializePeerConnection();
  }

  private ensureTransceivers(includeVideo: boolean) {
    if (!this.peerConnection) return;
    const existingKinds = (this.peerConnection.getTransceivers?.() || []).map(t => t.receiver.track?.kind).filter(Boolean);
    if (!existingKinds.includes('audio')) {
      this.peerConnection.addTransceiver('audio', { direction: 'sendrecv' });
    }
    if (includeVideo && !existingKinds.includes('video')) {
      this.peerConnection.addTransceiver('video', { direction: 'sendrecv' });
    }
  }

  private initializePeerConnection() {
    this.peerConnection = new RTCPeerConnection(this.configuration);

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.onIceCandidate) {
        console.log('New ICE candidate:', event.candidate);
        this.onIceCandidate(event.candidate);
      }
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      if (this.peerConnection && this.onConnectionStateChange) {
        console.log('Connection state changed:', this.peerConnection.connectionState);
        this.onConnectionStateChange(this.peerConnection.connectionState);
      }
    };

    // Helpful negotiation logs
    this.peerConnection.onnegotiationneeded = () => {
      console.log('Negotiation needed. Signaling state:', this.peerConnection?.signalingState);
    };

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      console.log('Received remote track');
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
      }
      this.remoteStream.addTrack(event.track);
      if (this.onRemoteStream) {
        this.onRemoteStream(this.remoteStream);
      }
    };

    // Handle ICE connection state changes
    this.peerConnection.oniceconnectionstatechange = () => {
      if (this.peerConnection) {
        console.log('ICE connection state:', this.peerConnection.iceConnectionState);
      }
    };
  }

  async createOffer(includeVideo: boolean = false, opts?: { iceRestart?: boolean }): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    try {
      // Prepare transceivers for recv
      this.ensureTransceivers(includeVideo);
      
      // Get user media - reuse existing stream if compatible
      if (!this.localStream || 
          (includeVideo && this.localStream.getVideoTracks().length === 0) ||
          (!includeVideo && this.localStream.getVideoTracks().length > 0)) {
        // Stop existing tracks to prevent conflicts
        if (this.localStream) {
          this.localStream.getTracks().forEach(track => track.stop());
        }
        this.localStream = await this.getUserMedia(includeVideo);
      }

      // Clear existing senders to prevent duplicates
      const senders = this.peerConnection.getSenders();
      for (const sender of senders) {
        if (sender.track) {
          this.peerConnection.removeTrack(sender);
        }
      }

      // Add fresh tracks
      this.localStream.getTracks().forEach(track => {
        if (this.peerConnection) {
          this.peerConnection.addTrack(track, this.localStream!);
        }
      });

      // Create offer
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: includeVideo,
        iceRestart: opts?.iceRestart === true
      });

      await this.peerConnection.setLocalDescription(offer);
      return offer;
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }

  async createAnswer(includeVideo: boolean = false): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    try {
      // Ensure we are in the correct state to answer
      let attempts = 0;
      while (this.peerConnection.signalingState !== 'have-remote-offer' && attempts < 10) {
        await new Promise((r) => setTimeout(r, 50));
        attempts++;
      }
      if (this.peerConnection.signalingState !== 'have-remote-offer') {
        throw new Error(`createAnswer called in invalid state: ${this.peerConnection.signalingState}`);
      }

      // Prepare transceivers for recv
      this.ensureTransceivers(includeVideo);
      
      // Get user media - reuse existing stream if compatible
      if (!this.localStream || 
          (includeVideo && this.localStream.getVideoTracks().length === 0) ||
          (!includeVideo && this.localStream.getVideoTracks().length > 0)) {
        // Stop existing tracks to prevent conflicts
        if (this.localStream) {
          this.localStream.getTracks().forEach(track => track.stop());
        }
        this.localStream = await this.getUserMedia(includeVideo);
      }

      // Clear existing senders to prevent duplicates
      const senders = this.peerConnection.getSenders();
      for (const sender of senders) {
        if (sender.track) {
          this.peerConnection.removeTrack(sender);
        }
      }

      // Add fresh tracks
      this.localStream.getTracks().forEach((track) => {
        if (this.peerConnection) {
          this.peerConnection.addTrack(track, this.localStream!);
        }
      });

      // Create answer
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      return answer;
    } catch (error) {
      console.error('Error creating answer:', error);
      throw error;
    }
  }

async setRemoteDescription(description: RTCSessionDescriptionInit | RTCSessionDescription) {
  if (!this.peerConnection) {
    throw new Error('Peer connection not initialized');
  }

  try {
    const current = this.peerConnection.remoteDescription;
    const descType = (description as any)?.type;
    const descSdp = (description as any)?.sdp;

    // Avoid duplicate or invalid state sets (common during realtime flaps)
    if (
      current?.sdp && descSdp && current.sdp === descSdp
    ) {
      return;
    }
    if (descType === 'answer' && this.peerConnection.signalingState === 'stable') {
      // Already in stable; don't apply another answer
      return;
    }

    await this.peerConnection.setRemoteDescription(description);
    // Drain any buffered ICE candidates now that remote description is set
    if (this.candidateBuffer.length > 0) {
      console.log(`Draining ${this.candidateBuffer.length} buffered ICE candidates`);
      for (const cand of this.candidateBuffer) {
        try {
          await this.peerConnection.addIceCandidate(cand);
        } catch (e) {
          console.error('Error adding buffered ICE candidate:', e);
        }
      }
      this.candidateBuffer = [];
    }
  } catch (error) {
    console.error('Error setting remote description:', error);
    throw error;
  }
}

async addIceCandidate(candidate: RTCIceCandidateInit) {
  if (!this.peerConnection) {
    throw new Error('Peer connection not initialized');
  }

  try {
    // Ignore empty or malformed candidates
    if (!candidate || !(candidate as any).candidate) {
      return;
    }
    // If remote description not yet set, buffer the candidate
    if (!this.peerConnection.remoteDescription || !this.peerConnection.remoteDescription.type) {
      this.candidateBuffer.push(candidate);
      return;
    }
    await this.peerConnection.addIceCandidate(candidate);
  } catch (error) {
    console.error('Error adding ICE candidate:', error);
    throw error;
  }
}

  private async getUserMedia(includeVideo: boolean): Promise<MediaStream> {
    try {
      // Start with simpler audio constraints to avoid feedback
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: includeVideo ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Apply additional audio processing after stream creation
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        const audioTrack = audioTracks[0];
        const settings = audioTrack.getSettings();
        console.log('Audio track settings:', settings);
      }
      
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw new Error('Failed to access camera/microphone');
    }
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  toggleMicrophone(): boolean {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }

  toggleCamera(): boolean {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }

  // Upgrade an existing voice call to video without duplicating audio tracks
  async upgradeToVideoAndCreateOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    // Ensure we have proper transceivers for video
    this.ensureTransceivers(true);

    // Ensure we have a local stream
    if (!this.localStream) {
      // Get both audio and video if no stream yet
      this.localStream = await this.getUserMedia(true);
      const senders = this.peerConnection.getSenders();
      this.localStream.getTracks().forEach(track => {
        const existing = senders.find(s => s.track && s.track.kind === track.kind);
        if (existing) existing.replaceTrack(track); else this.peerConnection!.addTrack(track, this.localStream!);
      });
    } else if (this.localStream.getVideoTracks().length === 0) {
      // Get only video and add it to existing stream
      const videoOnly = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } }, audio: false });
      const vTrack = videoOnly.getVideoTracks()[0];
      if (vTrack) {
        this.localStream.addTrack(vTrack);
        const videoSender = this.peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
        if (videoSender) videoSender.replaceTrack(vTrack); else this.peerConnection.addTrack(vTrack, this.localStream);
      }
    }

    // Create a renegotiation offer requesting video
    const offer = await this.peerConnection.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  closeConnection() {
    console.log('Closing WebRTC connection');

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
      });
      this.localStream = null;
    }

    // Stop remote stream  
    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach(track => {
        track.stop();
      });
      this.remoteStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Clear candidate buffer
    this.candidateBuffer = [];

    // Re-initialize for next call
    this.initializePeerConnection();
  }

  // Get connection statistics
  async getStats(): Promise<RTCStatsReport | null> {
    if (this.peerConnection) {
      return await this.peerConnection.getStats();
    }
    return null;
  }
}