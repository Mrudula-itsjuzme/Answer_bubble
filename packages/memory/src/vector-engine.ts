export class VectorSearchEngine {
  public static tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);
  }

  public static computeVector(text: string, vocabulary: string[]): number[] {
    const tokens = this.tokenize(text);
    const tfMap: Record<string, number> = {};

    tokens.forEach((t) => {
      tfMap[t] = (tfMap[t] || 0) + 1;
    });

    return vocabulary.map((word) => tfMap[word] || 0);
  }

  public static cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
