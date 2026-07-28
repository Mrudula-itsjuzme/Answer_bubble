import { STTConfig, TranscriptSegment } from '@answer-bubble/shared';
import { STTProvider } from '../types';

export class ElevenLabsSTTProvider implements STTProvider {
  public id = 'elevenlabs';
  public name = 'ElevenLabs Scribe STT';
  public isLocal = false;
  public requiresApiKey = true;

  private listeners: ((segment: Partial<TranscriptSegment>) => void)[] = [];
  private websocket: WebSocket | null = null;

  public async connect(config: STTConfig): Promise<void> {
    if (!config.apiKey) {
      console.warn('[ELEVENLABS_STT]: API key missing. Operating in fallback mode.');
      return;
    }

    try {
      const url = `wss://api.elevenlabs.io/v1/speech-to-text/stream?model_id=scribe_v1`;
      this.websocket = new WebSocket(url);

      this.websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.text) {
            this.emitTranscript({
              text: data.text,
              confidence: data.confidence || 0.96,
              isFinal: data.is_final ?? true,
            });
          }
        } catch (err) {
          console.warn('[ELEVENLABS_STT]: Payload parse warning:', err);
        }
      };

      this.websocket.onerror = (err) => {
        console.error('[ELEVENLABS_STT]: WebSocket connection error:', err);
      };
    } catch (err) {
      console.error('[ELEVENLABS_STT]: Connection failed:', err);
    }
  }

  public sendAudioChunk(chunk: Blob | ArrayBuffer): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(chunk);
    }
  }

  public onTranscript(callback: (segment: Partial<TranscriptSegment>) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private emitTranscript(segment: Partial<TranscriptSegment>): void {
    this.listeners.forEach((cb) => cb(segment));
  }

  public async disconnect(): Promise<void> {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    this.listeners = [];
  }
}
