import { LLMConfig, MeetingType, Suggestion, AdaptiveProfileType, countWords, truncateToWordLimit, generateId } from '@answer-bubble/shared';
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

  public getSystemPrompt(meetingType: MeetingType, profile: AdaptiveProfileType = 'terse-technical', visualContext = ''): string {
    let personaGuidance = '';
    switch (profile) {
      case 'terse-technical':
        personaGuidance = 'Style: Extremely terse, direct technical architecture & code nudges.';
        break;
      case 'reminder-coaching':
        personaGuidance = 'Style: Friendly reminders about unaddressed questions or open commitments.';
        break;
      case 'followup-interrogator':
        personaGuidance = 'Style: Suggest sharp follow-up questions for the user to ask the speaker.';
        break;
      case 'star-interview':
        personaGuidance = 'Style: STAR format (Situation, Task, Action, Result) concise bullet points.';
        break;
    }

    return `You are a real-time AI Meeting Copilot providing live assistance.
Goal: Provide ultra-concise, actionable advice combining speech transcript AND visual screen OCR.
${personaGuidance}
${visualContext ? `Active Visual Screen Context: ${visualContext}` : ''}

RULES:
1. Was a question asked or is an urgent decision point pending? If NO -> Output ONLY "NONE".
2. If YES -> Output ONE super concise suggestion.
3. STRICT LIMITS: Maximum 1 to 3 short lines. MAXIMUM 25 WORDS TOTAL.
4. Tailor advice to meeting mode: ${meetingType.toUpperCase()}.`;
  }

  public async evaluateContext(
    contextManager: RollingContextManager,
    meetingId: string,
    currentQuestionText: string = '',
    profile: AdaptiveProfileType = 'terse-technical',
    visualContext = ''
  ): Promise<Suggestion | null> {
    const context = contextManager.getFormattedContext();
    const systemPrompt = this.getSystemPrompt(context.meetingType, profile, visualContext);

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
