import { AudioDeviceConfig, TypedEventEmitter } from '@answer-bubble/shared';
import { VoiceActivityDetector } from './vad';
import { AudioSimulationEngine } from './simulator';

export class AudioStreamManager {
  private config: AudioDeviceConfig;
  private audioContext: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private systemStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private vad: VoiceActivityDetector;
  private simulationEngine: AudioSimulationEngine;
  private isCapturing: boolean = false;
  private animationFrameId: number | null = null;

  constructor(
    private eventBus: TypedEventEmitter,
    initialConfig?: Partial<AudioDeviceConfig>
  ) {
    this.config = {
      captureSystemAudio: true,
      captureMicrophone: true,
      sampleRate: 16000,
      vadThreshold: 0.015,
      noiseSuppression: true,
      ...initialConfig,
    };
    this.vad = new VoiceActivityDetector(this.config.vadThreshold);
    this.simulationEngine = new AudioSimulationEngine(this.eventBus);
  }

  public updateConfig(newConfig: Partial<AudioDeviceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.vad.setThreshold(this.config.vadThreshold);
  }

  public async startCapture(mode: 'real' | 'simulation' = 'real', scenario: string = 'technical'): Promise<void> {
    if (this.isCapturing) return;

    if (mode === 'simulation') {
      this.isCapturing = true;
      this.simulationEngine.start(scenario);
      this.eventBus.emit('audio-stream-status', { status: 'capturing', mode: 'simulation' });
      return;
    }

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: this.config.sampleRate,
      });

      const audioTracks: MediaStreamTrack[] = [];

      // 1. Microphone capture (Reuse existing live stream if available to skip permission prompt)
      const isMicLive = this.micStream && this.micStream.getAudioTracks().some((t) => t.readyState === 'live');
      if (isMicLive && this.micStream) {
        audioTracks.push(...this.micStream.getAudioTracks());
      } else if (this.config.captureMicrophone && navigator.mediaDevices) {
        try {
          this.micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              deviceId: this.config.inputDeviceId ? { exact: this.config.inputDeviceId } : undefined,
              echoCancellation: true,
              noiseSuppression: this.config.noiseSuppression,
            },
          });
          audioTracks.push(...this.micStream.getAudioTracks());
        } catch (err) {
          console.warn('Microphone permission denied or not available:', err);
        }
      }

      // 2. System Audio (Reuse existing live display stream if available)
      const isSysLive = this.systemStream && this.systemStream.getAudioTracks().some((t) => t.readyState === 'live');
      if (isSysLive && this.systemStream) {
        audioTracks.push(...this.systemStream.getAudioTracks());
      } else if (this.config.captureSystemAudio && navigator.mediaDevices?.getDisplayMedia) {
        try {
          this.systemStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true,
          });
          
          this.systemStream.getVideoTracks().forEach((track) => track.stop());
          const sysAudioTracks = this.systemStream.getAudioTracks();
          if (sysAudioTracks.length > 0) {
            audioTracks.push(...sysAudioTracks);
          }
        } catch (err) {
          console.warn('System audio loopback fallback:', err);
        }
      }

      if (audioTracks.length === 0) {
        console.warn('No physical audio input streams active. Audio Manager will run in visual-only mode.');
        this.isCapturing = true;
        this.eventBus.emit('audio-stream-status', { status: 'capturing', mode: 'real' });
        return;
      }

      const combinedStream = new MediaStream(audioTracks);
      const source = this.audioContext.createMediaStreamSource(combinedStream);
      const analyser = this.audioContext.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);

      const buffer = new Uint8Array(analyser.frequencyBinCount);

      // Start VAD processing loop
      const checkVAD = () => {
        if (!this.isCapturing) return;
        const { isSpeaking, rms } = this.vad.processAnalyser(analyser, buffer);
        this.eventBus.emit('audio-level', { level: rms, isSpeaking });
        this.animationFrameId = requestAnimationFrame(checkVAD);
      };

      // Set up MediaRecorder for streaming PCM/WebM audio chunks
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      this.mediaRecorder = new MediaRecorder(combinedStream, { mimeType });
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.eventBus.emit('audio-chunk', event.data);
        }
      };
      this.mediaRecorder.start(1000); // 1-second timeslice chunks

      this.isCapturing = true;
      checkVAD();
      this.eventBus.emit('audio-stream-status', { status: 'capturing', mode: 'real' });
    } catch (err) {
      console.error('Failed to initialize audio capture:', err);
      this.eventBus.emit('audio-stream-status', { status: 'stopped', mode: 'none' });
    }
  }

  public stopCapture(): void {
    this.isCapturing = false;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.mediaRecorder = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.simulationEngine.stop();
    this.eventBus.emit('audio-stream-status', { status: 'stopped', mode: 'none' });
  }

  public getIsCapturing(): boolean {
    return this.isCapturing;
  }
}
