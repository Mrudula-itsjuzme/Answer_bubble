import { LLMConfig, MeetingType, Suggestion, countWords, truncateToWordLimit, generateId } from '@answer-bubble/shared';
import { CompressedContext, RollingContextManager } from './context-manager';
import { generateOpenAISuggestion } from './adapters/openai';
import { generateAnthropicSuggestion } from './adapters/anthropic';
import { generateOpenRouterSuggestion } from './adapters/openrouter';
import { generateOllamaSuggestion } from './adapters/ollama';
import { generateMockSuggestion } from './adapters/mock';

export class IntelligentSuggestionEngine {
  private config: LLMConfig;

  constructor(initialConfig?: Partial<LLMConfig>) {
    this.config = {
      provider: 'mock',
      temperature: 0.2,
      suggestionAggressiveness: 'medium',
      ...initialConfig,
    };
  }

  public updateConfig(newConfig: Partial<LLMConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getSystemPrompt(meetingType: MeetingType): string {
    return `You are a real-time AI Meeting Copilot providing discreet live assistance to the user.
Goal: Provide ultra-concise, actionable advice ONLY when directly useful or when a direct question/problem was raised.

RULES:
1. First ask: Was the user directly asked a question or is there an urgent decision point?
2. If NO question or relevant topic -> Output ONLY "NONE".
3. If YES -> Output ONE super concise suggestion.
4. STRICT LIMITS: Maximum 1 to 3 short bullet points/lines. MAXIMUM 25 WORDS TOTAL.
5. NEVER write paragraphs, intros, or chatter.
6. Tailor advice to meeting mode: ${meetingType.toUpperCase()}.
Examples:
> Mention quantization.
> Consider model distillation.
> Don't forget caching.`;
  }

  public async evaluateContext(
    contextManager: RollingContextManager,
    meetingId: string,
    currentQuestionText: string = ''
  ): Promise<Suggestion | null> {
    const context = contextManager.getFormattedContext();
    const systemPrompt = this.getSystemPrompt(context.meetingType);

    let rawOutput = 'NONE';

    try {
      switch (this.config.provider) {
        case 'openai':
          rawOutput = await generateOpenAISuggestion(this.config, context, systemPrompt);
          break;
        case 'anthropic':
          rawOutput = await generateAnthropicSuggestion(this.config, context, systemPrompt);
          break;
        case 'openrouter':
          rawOutput = await generateOpenRouterSuggestion(this.config, context, systemPrompt);
          break;
        case 'ollama':
          rawOutput = await generateOllamaSuggestion(this.config, context, systemPrompt);
          break;
        case 'mock':
        default:
          rawOutput = await generateMockSuggestion(context);
          break;
      }
    } catch (err) {
      console.warn(`LLM provider ${this.config.provider} failed. Falling back to Mock generator:`, err);
      rawOutput = await generateMockSuggestion(context);
    }

    const cleanOutput = rawOutput.trim();

    if (!cleanOutput || cleanOutput.toUpperCase() === 'NONE' || cleanOutput.includes('NO_SUGGESTION')) {
      return null;
    }

    // Enforce 25 words maximum constraint
    const constrainedText = truncateToWordLimit(cleanOutput, 25);
    const wordNum = countWords(constrainedText);

    const suggestion: Suggestion = {
      id: generateId('sug'),
      meetingId,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: constrainedText,
      wordCount: wordNum,
      triggeredByQuestion: currentQuestionText,
      meetingType: context.meetingType,
    };

    contextManager.addSuggestion(suggestion);
    return suggestion;
  }
}
