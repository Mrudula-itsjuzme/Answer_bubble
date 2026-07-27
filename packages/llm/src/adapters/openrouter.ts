import { LLMConfig } from '@answer-bubble/shared';
import { CompressedContext } from '../context-manager';

export async function generateOpenRouterSuggestion(
  config: LLMConfig,
  context: CompressedContext,
  prompt: string
): Promise<string> {
  if (!config.apiKey) throw new Error('OpenRouter API Key is required');

  const endpoint = config.endpoint || 'https://openrouter.ai/api/v1/chat/completions';
  const model = config.model || 'meta-llama/llama-3.1-8b-instruct:free';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
      'HTTP-Referer': 'https://answer-bubble.app',
      'X-Title': 'AnswerBubble AI Copilot',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: `Dialogue:\n${context.recentDialogue}` },
      ],
      temperature: config.temperature ?? 0.3,
      max_tokens: 80,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || 'NONE';
}
