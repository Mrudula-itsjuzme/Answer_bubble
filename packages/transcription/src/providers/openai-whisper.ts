import { STTConfig, TranscriptSegment } from '@answer-bubble/shared';
import { STTProvider } from '../types';

export class OpenAIWhisperProvider implements STTProvider {
  public id = 'whisper-api';
  public name = 'OpenAI Whisper API';
  public isLocal = false;
  public requiresApiKey = true;

  private config: STTConfig | null = null;
  private callback: ((segment: Partial<TranscriptSegment>) => void) | null = null;
  private isConnected = false;

  public async connect(config: STTConfig): Promise<void> {
    this.config = config;
    if (!config.apiKey && !config.endpoint) {
      throw new Error('OpenAI API Key is required');
    }
    this.isConnected = true;
  }

  public async sendAudioChunk(chunk: Blob | ArrayBuffer): Promise<void> {
    if (!this.isConnected || !this.config || !this.callback) return;

    try {
      const blob = chunk instanceof Blob ? chunk : new Blob([chunk], { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('file', blob, 'audio.webm');
      formData.append('model', this.config.model || 'whisper-1');
      if (this.config.language) {
        formData.append('language', this.config.language);
      }

      const endpoint = this.config.endpoint || 'https://api.openai.com/v1/audio/transcriptions';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('Whisper API error:', errText);
        return;
      }

      const data = await response.json();
      if (data.text && data.text.trim().length > 0) {
        this.callback({
          text: data.text.trim(),
          isFinal: true,
          confidence: 0.95,
        });
      }
    } catch (err) {
      console.error('Error sending audio to OpenAI Whisper API:', err);
    }
  }

  public onTranscript(callback: (segment: Partial<TranscriptSegment>) => void): () => void {
    this.callback = callback;
    return () => {
      this.callback = null;
    };
  }

  public async disconnect(): Promise<void> {
    this.isConnected = false;
    this.callback = null;
  }
}
