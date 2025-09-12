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

  async createOffer(includeVideo: boolean = false): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    try {
      // Get user media
      const stream = await this.getUserMedia(includeVideo);
      this.localStream = stream;

      // Add tracks to peer connection
      stream.getTracks().forEach(track => {
        if (this.peerConnection) {
          this.peerConnection.addTrack(track, stream);
        }
      });

      // Create offer
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: includeVideo
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
      // Get user media
      const stream = await this.getUserMedia(includeVideo);
      this.localStream = stream;

      // Add tracks to peer connection
      stream.getTracks().forEach(track => {
        if (this.peerConnection) {
          this.peerConnection.addTrack(track, stream);
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

    // Ensure we have a local stream
    if (!this.localStream) {
      // Get both audio and video if no stream yet
      this.localStream = await this.getUserMedia(true);
      this.localStream.getTracks().forEach(track => this.peerConnection!.addTrack(track, this.localStream!));
    } else if (this.localStream.getVideoTracks().length === 0) {
      // Get only video and add it to existing stream
      const videoOnly = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } }, audio: false });
      const vTrack = videoOnly.getVideoTracks()[0];
      if (vTrack) {
        this.localStream.addTrack(vTrack);
        this.peerConnection.addTrack(vTrack, this.localStream);
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

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Reset remote stream
    this.remoteStream = null;

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