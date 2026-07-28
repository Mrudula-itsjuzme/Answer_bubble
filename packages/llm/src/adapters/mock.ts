import { CompressedContext } from '../context-manager';

export async function generateMockSuggestion(
  context: CompressedContext
): Promise<string> {
  const dialogue = context.recentDialogue.toLowerCase();

  if (dialogue.includes('java') || dialogue.includes('jvm') || dialogue.includes('spring')) {
    return 'Java features strongly typed OOP, multi-threaded JVM execution, robust garbage collection (G1/ZGC), and enterprise ecosystem frameworks.';
  }

  if (dialogue.includes('neural') || dialogue.includes('network') || dialogue.includes('deep learning') || dialogue.includes('model')) {
    return 'Neural networks process non-linear vector representations through multi-layer perceptron weights, backpropagation, and self-attention transformers.';
  }

  if (dialogue.includes('record') || dialogue.includes('voice') || dialogue.includes('audio') || dialogue.includes('listen')) {
    return 'Audio is processed ephemerally in local RAM with machine-bound DPAPI encryption and zero audio disk storage.';
  }

  if (dialogue.includes('cost') || dialogue.includes('latency') || dialogue.includes('reduce')) {
    const suggestions = [
      'Explore FP16 quantization or vLLM KV caching.',
      'Consider model distillation.',
      'Enable semantic caching for repeat queries.',
    ];
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  }

  if (dialogue.includes('privacy') || dialogue.includes('compliance') || dialogue.includes('soc2')) {
    return 'Highlight zero data retention SLA and end-to-end encryption.';
  }

  if (dialogue.includes('database') || dialogue.includes('indexing') || dialogue.includes('vector')) {
    return 'Suggest HNSW indexing on Qdrant or PgVector for sub-5ms similarity search.';
  }

  if (dialogue.includes('when') || dialogue.includes('finish') || dialogue.includes('deadline')) {
    return 'Propose sprint planning milestone and async update by Friday.';
  }

  if (dialogue.includes('interview') || dialogue.includes('bottleneck')) {
    return 'Mention STAR technique framework: Situation, Task, Action, and Result.';
  }

  // Fallback answer for general questions
  return 'Outline key technical tradeoffs, benchmark metrics, and immediate implementation steps.';
}
