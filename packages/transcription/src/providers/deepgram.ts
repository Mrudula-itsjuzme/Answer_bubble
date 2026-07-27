import { STTConfig, TranscriptSegment } from '@answer-bubble/shared';
import { STTProvider } from '../types';

export class DeepgramProvider implements STTProvider {
  public id = 'deepgram';
  public name = 'Deepgram Live Streaming';
  public isLocal = false;
  public requiresApiKey = true;

  private socket: WebSocket | null = null;
  private callback: ((segment: Partial<TranscriptSegment>) => void) | null = null;

  public async connect(config: STTConfig): Promise<void> {
    if (!config.apiKey) throw new Error('Deepgram API Key is required');

    const model = config.model || 'nova-2';
    const url = `wss://api.deepgram.com/v1/listen?model=${model}&punctuate=true&interim_results=true&diarize=true`;

    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(url, ['token', config.apiKey || '']);

        this.socket.onopen = () => {
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const transcript = data.channel?.alternatives?.[0]?.transcript;
            if (transcript && transcript.trim() && this.callback) {
              const isFinal = data.is_final || false;
              const confidence = data.channel?.alternatives?.[0]?.confidence || 0.9;
              const speakerId = data.channel?.alternatives?.[0]?.words?.[0]?.speaker;

              this.callback({
                text: transcript.trim(),
                isFinal,
                confidence,
                speaker: speakerId !== undefined ? { id: `spk_${speakerId}`, name: `Speaker ${speakerId + 1}`, color: '#3B82F6' } : undefined,
              });
            }
          } catch (e) {
            console.error('Deepgram message parsing error:', e);
          }
        };

        this.socket.onerror = (err) => {
          reject(err);
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  public sendAudioChunk(chunk: Blob | ArrayBuffer): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(chunk);
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
