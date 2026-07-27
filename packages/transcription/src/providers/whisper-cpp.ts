import { STTConfig, TranscriptSegment } from '@answer-bubble/shared';
import { STTProvider } from '../types';

export class WhisperCppProvider implements STTProvider {
  public id = 'whisper-cpp';
  public name = 'Whisper.cpp (Local Server)';
  public isLocal = true;
  public requiresApiKey = false;

  private config: STTConfig | null = null;
  private callback: ((segment: Partial<TranscriptSegment>) => void) | null = null;

  public async connect(config: STTConfig): Promise<void> {
    this.config = config;
  }

  public async sendAudioChunk(chunk: Blob | ArrayBuffer): Promise<void> {
    if (!this.config || !this.callback) return;

    try {
      const endpoint = this.config.endpoint || 'http://localhost:8080/inference';
      const blob = chunk instanceof Blob ? chunk : new Blob([chunk], { type: 'audio/wav' });
      const formData = new FormData();
      formData.append('file', blob, 'audio.wav');
      formData.append('temperature', '0.0');

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.text && data.text.trim()) {
          this.callback({
            text: data.text.trim(),
            isFinal: true,
            confidence: 0.92,
          });
        }
      }
    } catch (err) {
      console.warn('Local Whisper.cpp endpoint error:', err);
    }
  }

  public onTranscript(callback: (segment: Partial<TranscriptSegment>) => void): () => void {
    this.callback = callback;
    return () => {
      this.callback = null;
    };
  }

  public async disconnect(): Promise<void> {
    this.callback = null;
  }
}
