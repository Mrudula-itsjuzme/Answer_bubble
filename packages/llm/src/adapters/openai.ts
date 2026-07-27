import { LLMConfig } from '@answer-bubble/shared';
import { CompressedContext } from '../context-manager';

export async function generateOpenAISuggestion(
  config: LLMConfig,
  context: CompressedContext,
  prompt: string
): Promise<string> {
  if (!config.apiKey && !config.endpoint) {
    throw new Error('OpenAI API Key is required');
  }

  const endpoint = config.endpoint || 'https://api.openai.com/v1/chat/completions';
  const model = config.model || 'gpt-4o-mini';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: prompt },
        {
          role: 'user',
          content: `Meeting Mode: ${context.meetingType}\nRecent Dialogue:\n${context.recentDialogue}\nExtracted Facts:\n${context.extractedFacts.join('\n')}`,
        },
      ],
      temperature: config.temperature ?? 0.3,
      max_tokens: 80,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || 'NONE';
}
