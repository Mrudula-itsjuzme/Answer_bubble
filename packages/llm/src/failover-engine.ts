import { LLMProviderType, AppSettings, logger } from '@answer-bubble/shared';
import { generateOpenAISuggestion } from './adapters/openai';
import { generateAnthropicSuggestion } from './adapters/anthropic';
import { generateOpenRouterSuggestion } from './adapters/openrouter';
import { generateOllamaSuggestion } from './adapters/ollama';
import { generateMockSuggestion } from './adapters/mock';

export interface LLMAdapter {
  name: string;
  generateSuggestion: (systemPrompt: string, userPrompt: string, options?: { maxTokens?: number; temperature?: number }) => Promise<string>;
}

export class LLMFailoverEngine {
  private primaryAdapter: LLMAdapter;
  private fallbackAdapters: LLMAdapter[];

  constructor(settings: AppSettings) {
    this.primaryAdapter = this.createAdapter(settings.llm.provider, settings);
    
    const fallbackTypes: LLMProviderType[] = ['openrouter', 'ollama', 'mock'];
    this.fallbackAdapters = fallbackTypes
      .filter((p) => p !== settings.llm.provider)
      .map((p) => this.createAdapter(p, settings));
  }

  private createAdapter(provider: LLMProviderType, settings: AppSettings): LLMAdapter {
    switch (provider) {
      case 'openai':
        return {
          name: 'OpenAI',
          generateSuggestion: async (systemPrompt, userPrompt) =>
            generateOpenAISuggestion(settings.llm, { meetingType: 'technical', recentDialogue: userPrompt, extractedFacts: [], keyEntities: { people: [], projects: [], companies: [] }, previousSuggestions: [], recentTranscript: [] }, systemPrompt),
        };
      case 'anthropic':
        return {
          name: 'Anthropic',
          generateSuggestion: async (systemPrompt, userPrompt) =>
            generateAnthropicSuggestion(settings.llm, { meetingType: 'technical', recentDialogue: userPrompt, extractedFacts: [], keyEntities: { people: [], projects: [], companies: [] }, previousSuggestions: [], recentTranscript: [] }, systemPrompt),
        };
      case 'openrouter':
        return {
          name: 'OpenRouter',
          generateSuggestion: async (systemPrompt, userPrompt) =>
            generateOpenRouterSuggestion(settings.llm, { meetingType: 'technical', recentDialogue: userPrompt, extractedFacts: [], keyEntities: { people: [], projects: [], companies: [] }, previousSuggestions: [], recentTranscript: [] }, systemPrompt),
        };
      case 'ollama':
        return {
          name: 'Ollama',
          generateSuggestion: async (systemPrompt, userPrompt) =>
            generateOllamaSuggestion(settings.llm, { meetingType: 'technical', recentDialogue: userPrompt, extractedFacts: [], keyEntities: { people: [], projects: [], companies: [] }, previousSuggestions: [], recentTranscript: [] }, systemPrompt),
        };
      case 'mock':
      default:
        return {
          name: 'Mock',
          generateSuggestion: async (systemPrompt, userPrompt) =>
            generateMockSuggestion({ meetingType: 'technical', recentDialogue: userPrompt, extractedFacts: [], keyEntities: { people: [], projects: [], companies: [] }, previousSuggestions: [], recentTranscript: [] }),
        };
    }
  }

  public async executeWithFailover(
    systemPrompt: string,
    userPrompt: string,
    options?: { maxTokens?: number; temperature?: number }
  ): Promise<string> {
    const correlationId = 'llm-' + Date.now();

    try {
      return await this.executeWithRetry(this.primaryAdapter, systemPrompt, userPrompt, options, correlationId);
    } catch (primaryErr) {
      logger.warn('LLM_FAILOVER', `Primary LLM provider (${this.primaryAdapter.name}) failed. Initiating fallback cascade...`, {
        error: String(primaryErr),
      }, correlationId);
    }

    for (const adapter of this.fallbackAdapters) {
      try {
        logger.info('LLM_FAILOVER', `Attempting failover request using ${adapter.name}...`, undefined, correlationId);
        const result = await this.executeWithRetry(adapter, systemPrompt, userPrompt, options, correlationId);
        logger.info('LLM_FAILOVER', `Successfully recovered prompt generation via fallback adapter ${adapter.name}`, undefined, correlationId);
        return result;
      } catch (fallbackErr) {
        logger.warn('LLM_FAILOVER', `Fallback adapter ${adapter.name} failed`, { error: String(fallbackErr) }, correlationId);
      }
    }

    logger.warn('LLM_FAILOVER', 'All remote LLM adapters failed. Falling back to built-in Mock Adapter.', undefined, correlationId);
    return generateMockSuggestion({ meetingType: 'technical', recentDialogue: userPrompt, extractedFacts: [], keyEntities: { people: [], projects: [], companies: [] }, previousSuggestions: [], recentTranscript: [] });
  }

  private async executeWithRetry(
    adapter: LLMAdapter,
    systemPrompt: string,
    userPrompt: string,
    options: { maxTokens?: number; temperature?: number } | undefined,
    correlationId: string
  ): Promise<string> {
    const maxRetries = 2;
    let delay = 500;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await adapter.generateSuggestion(systemPrompt, userPrompt, options);
        clearTimeout(timeoutId);
        return response;
      } catch (err) {
        if (attempt === maxRetries) throw err;
        logger.warn('LLM_RETRY', `Retryable LLM error on ${adapter.name} (Attempt ${attempt}/${maxRetries}): ${String(err)}. Retrying in ${delay}ms...`, undefined, correlationId);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
    }

    throw new Error(`LLM adapter ${adapter.name} exhausted all retry attempts`);
  }
}
