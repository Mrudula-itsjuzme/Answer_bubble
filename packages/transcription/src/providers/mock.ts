import { STTConfig, TranscriptSegment } from '@answer-bubble/shared';
import { STTProvider } from '../types';

export class MockSTTProvider implements STTProvider {
  public id = 'mock';
  public name = 'Mock Simulation STT Engine';
  public isLocal = true;
  public requiresApiKey = false;

  private callback: ((segment: Partial<TranscriptSegment>) => void) | null = null;

  public async connect(_config: STTConfig): Promise<void> {}

  public sendAudioChunk(_chunk: Blob | ArrayBuffer): void {}

  public emitMockTranscript(payload: Partial<TranscriptSegment>): void {
    if (this.callback) {
      this.callback(payload);
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
