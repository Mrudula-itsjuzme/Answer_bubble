import { STTConfig, TranscriptSegment } from '@answer-bubble/shared';
import { STTProvider } from '../types';

export class WebSpeechProvider implements STTProvider {
  public id = 'webspeech';
  public name = 'Web Speech API (Browser Native)';
  public isLocal = true;
  public requiresApiKey = false;

  private recognition: any = null;
  private callback: ((segment: Partial<TranscriptSegment>) => void) | null = null;
  private isListening = false;

  public async connect(config: STTConfig): Promise<void> {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      throw new Error('Web Speech API is not supported in this environment');
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = config.continuous ?? true;
    this.recognition.interimResults = true;
    this.recognition.lang = config.language || 'en-US';

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let finalStr = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalStr += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (this.callback) {
        if (finalStr.trim()) {
          this.callback({
            text: finalStr.trim(),
            isFinal: true,
            confidence: 0.9,
          });
        } else if (interim.trim()) {
          this.callback({
            text: interim.trim(),
            isFinal: false,
            confidence: 0.7,
          });
        }
      }
    };

    this.recognition.onerror = (err: any) => {
      if (err?.error === 'aborted' || err?.error === 'no-speech') {
        return;
      }
      console.warn('[WEBSPEECH_ERROR]:', err?.error || err);
    };

    this.recognition.onend = () => {
      if (this.isListening && this.recognition) {
        try {
          this.recognition.start();
        } catch (_err) {
          setTimeout(() => {
            if (this.isListening && this.recognition) {
              try {
                this.recognition.start();
              } catch (_e) {
                // ignore
              }
            }
          }, 100);
        }
      }
    };

    this.recognition.start();
    this.isListening = true;
  }

  public sendAudioChunk(_chunk: Blob | ArrayBuffer): void {
    // WebSpeech handles mic audio internally
  }

  public onTranscript(callback: (segment: Partial<TranscriptSegment>) => void): () => void {
    this.callback = callback;
    return () => {
      this.callback = null;
    };
  }

  public async disconnect(): Promise<void> {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (_e) {
        // ignore
      }
      this.recognition = null;
    }
    this.callback = null;
  }
}
