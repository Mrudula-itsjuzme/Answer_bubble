import { STTConfig, TranscriptSegment } from '@answer-bubble/shared';

export interface STTProvider {
  id: string;
  name: string;
  isLocal: boolean;
  requiresApiKey: boolean;

  connect(config: STTConfig): Promise<void>;
  sendAudioChunk(chunk: Blob | ArrayBuffer): void;
  onTranscript(callback: (segment: Partial<TranscriptSegment>) => void): () => void;
  disconnect(): Promise<void>;
}
