import { LLMConfig } from '@answer-bubble/shared';
import { CompressedContext } from '../context-manager';

export async function generateOllamaSuggestion(
  config: LLMConfig,
  context: CompressedContext,
  prompt: string
): Promise<string> {
  const endpoint = config.endpoint || 'http://localhost:11434/api/generate';
  const model = config.model || 'llama3';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1500);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
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
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Ollama local server error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response?.trim() || 'NONE';
  } catch (err) {
    clearTimeout(timeoutId);
    throw new Error(`Ollama offline / unreachable: ${String(err)}`);
  }
}
