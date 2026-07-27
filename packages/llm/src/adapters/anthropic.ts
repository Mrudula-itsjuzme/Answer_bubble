import { LLMConfig } from '@answer-bubble/shared';
import { CompressedContext } from '../context-manager';

export async function generateAnthropicSuggestion(
  config: LLMConfig,
  context: CompressedContext,
  prompt: string
): Promise<string> {
  if (!config.apiKey) throw new Error('Anthropic API Key is required');

  const endpoint = config.endpoint || 'https://api.anthropic.com/v1/messages';
  const model = config.model || 'claude-3-5-haiku-20241022';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      system: prompt,
      messages: [
        {
          role: 'user',
          content: `Meeting Mode: ${context.meetingType}\nRecent Dialogue:\n${context.recentDialogue}`,
        },
      ],
      max_tokens: 80,
      temperature: config.temperature ?? 0.3,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text?.trim() || 'NONE';
}
