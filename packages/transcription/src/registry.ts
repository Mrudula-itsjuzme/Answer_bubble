import { STTConfig, STTProviderType, TranscriptSegment } from '@answer-bubble/shared';
import { STTProvider } from './types';
import { OpenAIWhisperProvider } from './providers/openai-whisper';
import { DeepgramProvider } from './providers/deepgram';
import { GladiaProvider } from './providers/gladia';
import { ElevenLabsSTTProvider } from './providers/elevenlabs';
import { WhisperCppProvider } from './providers/whisper-cpp';
import { WebSpeechProvider } from './providers/webspeech';
import { MockSTTProvider } from './providers/mock';

export class STTProviderRegistry {
  private providers: Map<string, STTProvider> = new Map();
  private activeProvider: STTProvider | null = null;

  constructor() {
    this.registerProvider(new OpenAIWhisperProvider());
    this.registerProvider(new DeepgramProvider());
    this.registerProvider(new GladiaProvider());
    this.registerProvider(new ElevenLabsSTTProvider());
    this.registerProvider(new WhisperCppProvider());
    this.registerProvider(new WebSpeechProvider());
    this.registerProvider(new MockSTTProvider());
  }

  public registerProvider(provider: STTProvider): void {
    this.providers.set(provider.id, provider);
  }

  public getAvailableProviders(): STTProvider[] {
    return Array.from(this.providers.values());
  }

  public async selectProvider(
    type: STTProviderType,
    config: STTConfig
  ): Promise<STTProvider> {
    if (this.activeProvider) {
      await this.activeProvider.disconnect();
    }

    const provider = this.providers.get(type) || this.providers.get('mock')!;
    try {
      await provider.connect(config);
      this.activeProvider = provider;
      return provider;
    } catch (err) {
      console.warn(`Failed to connect to ${type} provider. Falling back to Mock/WebSpeech:`, err);
      const fallback = this.providers.get('mock')!;
      await fallback.connect(config);
      this.activeProvider = fallback;
      return fallback;
    }
  }

  public getActiveProvider(): STTProvider | null {
    return this.activeProvider;
  }
}
