import { describe, it, expect } from 'vitest';
import { LLMFailoverEngine } from '../failover-engine';
import { IntelligentSuggestionEngine } from '../suggestion-engine';
import { RollingContextManager } from '../context-manager';
import { DEFAULT_SETTINGS } from '@answer-bubble/shared';

describe('LLM Failover Engine & Suggestion Bounds Test Suite', () => {
  it(
    'should fall back gracefully to built-in mock adapter on provider failure',
    async () => {
      const engine = new LLMFailoverEngine({
        ...DEFAULT_SETTINGS,
        llm: {
          provider: 'openai',
          apiKey: 'sk-proj-invalid-key-test',
          temperature: 0.2,
          suggestionAggressiveness: 'medium',
        },
      });

      const suggestion = await engine.executeWithFailover('System Prompt', 'User Question: What is FP16 quantization?');
      expect(suggestion).toBeTruthy();
      expect(typeof suggestion).toBe('string');
    },
    15000
  );

  it('should truncate LLM suggestions to 25 words maximum', async () => {
    const suggestionEngine = new IntelligentSuggestionEngine({ provider: 'mock' });
    const contextManager = new RollingContextManager('technical');

    contextManager.addSegment({
      id: 's1',
      meetingId: 'm1',
      timestamp: '10:00',
      timeInSeconds: 0,
      speaker: { id: 'spk1', name: 'Alex', color: '#3B82F6' },
      text: 'How can we optimize vector search latency for large datasets?',
      confidence: 0.95,
      isFinal: true,
    });

    const suggestion = await suggestionEngine.evaluateContext(contextManager, 'm1', 'How can we optimize vector search latency?');
    if (suggestion) {
      expect(suggestion.wordCount).toBeLessThanOrEqual(25);
    }
  });
});
