import { CompressedContext } from '../context-manager';

export async function generateMockSuggestion(
  context: CompressedContext
): Promise<string> {
  const dialogue = context.recentDialogue.toLowerCase();

  if (dialogue.includes('cost') || dialogue.includes('latency') || dialogue.includes('reduce')) {
    const suggestions = [
      'Mention quantization.',
      'Consider model distillation.',
      "Don't forget caching.",
    ];
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  }

  if (dialogue.includes('privacy') || dialogue.includes('compliance') || dialogue.includes('soc2')) {
    return 'Highlight zero data retention SLA.';
  }

  if (dialogue.includes('database') || dialogue.includes('indexing') || dialogue.includes('vector')) {
    return 'Suggest HNSW indexing on Qdrant.';
  }

  if (dialogue.includes('when') || dialogue.includes('finish') || dialogue.includes('deadline')) {
    return 'Propose Friday afternoon milestone.';
  }

  if (dialogue.includes('interview') || dialogue.includes('bottleneck')) {
    return 'Mention STAR technique framework.';
  }

  return 'NONE';
}
