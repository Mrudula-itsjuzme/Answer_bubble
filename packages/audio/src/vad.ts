/**
 * WebAudio VAD (Voice Activity Detector)
 * Analyzes Float32Array PCM frames or AnalyserNode audio frequency data
 * to detect speech activity based on root-mean-square (RMS) energy threshold.
 */
export class VoiceActivityDetector {
  private threshold: number;
  private isSpeakingState: boolean = false;
  private speechHoldMs: number;
  private lastSpeechTime: number = 0;
  private resultBuffer = { isSpeaking: false, rms: 0 };

  constructor(threshold: number = 0.015, speechHoldMs: number = 500) {
    this.threshold = threshold;
    this.speechHoldMs = speechHoldMs;
  }

  public setThreshold(threshold: number): void {
    this.threshold = threshold;
  }

  public processPCM(pcmData: Float32Array): { isSpeaking: boolean; rms: number } {
    let sum = 0;
    for (let i = 0; i < pcmData.length; i++) {
      sum += pcmData[i] * pcmData[i];
    }
    const rms = Math.sqrt(sum / pcmData.length);
    const now = Date.now();

    if (rms > this.threshold) {
      this.lastSpeechTime = now;
      this.isSpeakingState = true;
    } else if (now - this.lastSpeechTime > this.speechHoldMs) {
      this.isSpeakingState = false;
    }

    this.resultBuffer.isSpeaking = this.isSpeakingState;
    this.resultBuffer.rms = rms;
    return this.resultBuffer;
  }

  public processAnalyser(analyser: AnalyserNode, buffer: Uint8Array): { isSpeaking: boolean; rms: number } {
    analyser.getByteFrequencyData(buffer as any);
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i];
    }
    const average = sum / buffer.length;
    const normalizedRMS = average / 255;
    const now = Date.now();

    if (normalizedRMS > this.threshold) {
      this.lastSpeechTime = now;
      this.isSpeakingState = true;
    } else if (now - this.lastSpeechTime > this.speechHoldMs) {
      this.isSpeakingState = false;
    }

    this.resultBuffer.isSpeaking = this.isSpeakingState;
    this.resultBuffer.rms = normalizedRMS;
    return this.resultBuffer;
  }
}
