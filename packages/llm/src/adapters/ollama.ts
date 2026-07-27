import { LLMConfig } from '@answer-bubble/shared';
import { CompressedContext } from '../context-manager';

export async function generateOllamaSuggestion(
  config: LLMConfig,
  context: CompressedContext,
  prompt: string
): Promise<string> {
  const endpoint = config.endpoint || 'http://localhost:11434/api/generate';
  const model = config.model || 'llama3';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt: `${prompt}\n\nMeeting Mode: ${context.meetingType}\nRecent Dialogue:\n${context.recentDialogue}\n\nResponse:`,
      stream: false,
      options: {
        temperature: config.temperature ?? 0.3,
        num_predict: 60,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama local server error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.response?.trim() || 'NONE';
}
