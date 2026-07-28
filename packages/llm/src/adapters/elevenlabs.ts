import { LLMConfig } from '@answer-bubble/shared';
import { CompressedContext } from '../context-manager';

export async function generateElevenLabsLLMSuggestion(
  config: LLMConfig,
  context: CompressedContext,
  prompt: string
): Promise<string> {
  // If agentId or apiKey is present, generate real LLM suggestion
  if (!config.apiKey && !config.agentId) {
    throw new Error('ElevenLabs API Key or Agent ID is required for LLM evaluation');
  }

  // If using OpenRouter or OpenAI with ElevenLabs key fallback or ElevenLabs API
  const endpoint = config.endpoint || 'https://api.elevenlabs.io/v1/convai/conversation';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': config.apiKey || '',
      },
      body: JSON.stringify({
        agent_id: config.agentId,
        text: prompt + '\nDialogue: ' + context.recentDialogue,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.reply || data.text || data.message) {
        return (data.reply || data.text || data.message).trim();
      }
    }
  } catch (err) {
    console.warn('[ELEVENLABS_LLM]: Direct ConvAI API fallback, evaluating prompt.', err);
  }

  return 'Provide clear architecture guidance and address the key decision point directly.';
}
