import { STTConfig, TranscriptSegment } from '@answer-bubble/shared';
import { STTProvider } from '../types';

export class MockSTTProvider implements STTProvider {
  public id = 'mock';
  public name = 'VAD-Reactive Demo (Offline)';
  public isLocal = true;
  public requiresApiKey = false;

  private callback: ((segment: Partial<TranscriptSegment>) => void) | null = null;
  private isSpeaking = false;
  private speechTimeout: any = null;
  private chunkCount = 0;
  
  private phrases = [
    "I think we need to look into optimizing the database queries.",
    "Can you clarify the deployment pipeline steps?",
    "That sounds like a great architectural decision.",
    "What about handling edge cases in the user authentication?",
    "Let's make sure we document these API endpoints clearly.",
    "Could we use Redis to cache these high-frequency requests?",
    "Hi tell me about the polymorphism in our new framework."
  ];

  public async connect(_config: STTConfig): Promise<void> {}

  public sendAudioChunk(_chunk: Blob | ArrayBuffer): void {
    if (!this.callback) return;
    
    // Simulate VAD: chunk received means audio is flowing
    this.chunkCount++;
    
    if (!this.isSpeaking && this.chunkCount > 2) {
      this.isSpeaking = true;
      this.callback({ text: "...", isFinal: false, confidence: 0.5 });
    }

    if (this.speechTimeout) clearTimeout(this.speechTimeout);
    
    // If no chunks received for 1.5s, speech ended
    this.speechTimeout = setTimeout(() => {
      if (this.isSpeaking) {
        this.isSpeaking = false;
        this.chunkCount = 0;
        const text = this.phrases[Math.floor(Math.random() * this.phrases.length)];
        this.callback!({ text, isFinal: true, confidence: 0.99 });
      }
    }, 1500);
  }

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
    if (this.speechTimeout) clearTimeout(this.speechTimeout);
    this.isSpeaking = false;
    this.chunkCount = 0;
    this.callback = null;
  }
}
