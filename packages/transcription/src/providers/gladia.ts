import { STTConfig, TranscriptSegment } from '@answer-bubble/shared';
import { STTProvider } from '../types';

export class GladiaProvider implements STTProvider {
  public id = 'gladia';
  public name = 'Gladia Real-time STT';
  public isLocal = false;
  public requiresApiKey = true;

  private socket: WebSocket | null = null;
  private callback: ((segment: Partial<TranscriptSegment>) => void) | null = null;

  public async connect(config: STTConfig): Promise<void> {
    if (!config.apiKey) throw new Error('Gladia API Key is required');

    const url = 'wss://api.gladia.io/audio/text/audio-transcription';
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(url);
        this.socket.onopen = () => {
          this.socket?.send(
            JSON.stringify({
              x_gladia_key: config.apiKey,
              frames_format: 'bytes',
              sample_rate: 16000,
            })
          );
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.transcription && this.callback) {
              this.callback({
                text: data.transcription,
                isFinal: data.type === 'final',
                confidence: data.confidence || 0.9,
              });
            }
          } catch (e) {
            console.error('Gladia payload parse error:', e);
          }
        };

        this.socket.onerror = (err) => reject(err);
      } catch (err) {
        reject(err);
      }
    });
  }

  public sendAudioChunk(chunk: Blob | ArrayBuffer): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      if (chunk instanceof Blob) {
        chunk.arrayBuffer().then((buf) => this.socket?.send(buf));
      } else {
        this.socket.send(chunk);
      }
    }
  }

  public onTranscript(callback: (segment: Partial<TranscriptSegment>) => void): () => void {
    this.callback = callback;
    return () => {
      this.callback = null;
    };
  }

  public async disconnect(): Promise<void> {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.callback = null;
  }
}
