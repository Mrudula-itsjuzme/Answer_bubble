export interface QuestionDetectionResult {
  isQuestion: boolean;
  confidence: number;
  category: 'technical' | 'process' | 'decision' | 'timeline' | 'cost' | 'general';
  detectedQuestion: string;
  matchedPattern?: string;
}

export class QuestionDetector {
  private static INTERROGATIVE_WORDS = [
    'what', 'why', 'how', 'when', 'where', 'who', 'which', 'whose', 'whom',
    "what's", "how's", "why's", "who's", "where's", "when's"
  ];

  private static AUXILIARY_INVERSIONS = [
    'can we', 'can you', 'could you', 'could we', 'would you', 'would it',
    'should we', 'should i', 'is there', 'are there', 'are we', 'do you',
    'does it', 'did we', 'did you', 'have you', 'has anyone', 'will this',
    'will we', 'might we', 'shall we', 'is it', 'isn\'t it', 'aren\'t we',
    'don\'t you', 'doesn\'t it', 'can\'t we', 'won\'t this'
  ];

  private static INQUIRY_PHRASES = [
    'tell me about', 'wondering if', 'could someone clarify', 'do we know whether',
    'any thoughts on', 'what about', 'how about', 'can anyone explain',
    'what did we decide', 'what is', 'how do', 'how can', 'why did', 'why is'
  ];

  private static CATEGORY_KEYWORDS: Record<string, string[]> = {
    cost: ['cost', 'price', 'pricing', 'budget', 'expense', 'cheap', 'expensive', 'dollar', 'spent', 'billing'],
    timeline: ['when', 'deadline', 'eta', 'schedule', 'by friday', 'timeline', 'release', 'launch', 'due', 'today', 'tomorrow'],
    decision: ['decide', 'decision', 'choose', 'choice', 'select', 'agreed', 'vote', 'approve', 'confirm'],
    technical: ['latency', 'architecture', 'quantization', 'database', 'api', 'server', 'code', 'bug', 'performance', 'indexing', 'cache', 'vllm', 'fp16', 'gpu', 'vector', 'model', 'memory', 'cpu'],
    process: ['how to', 'workflow', 'process', 'step', 'policy', 'documentation', 'guide', 'sop', 'onboarding']
  };

  /**
   * Instantly evaluates if a text string is a question asked during meeting speech.
   */
  public static detect(text: string): QuestionDetectionResult {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length < 3) {
      return {
        isQuestion: false,
        confidence: 0,
        category: 'general',
        detectedQuestion: trimmed,
      };
    }

    const lower = trimmed.toLowerCase();
    const hasQuestionMark = lower.includes('?');

    // 1. Check direct question mark
    let score = hasQuestionMark ? 0.70 : 0.0;
    let matchedPattern = hasQuestionMark ? 'question_mark' : '';

    // 2. Check interrogative word at start or clause boundary
    const startsWithInterrogative = this.INTERROGATIVE_WORDS.some((word) =>
      lower.startsWith(word + ' ') || lower.includes('. ' + word + ' ') || lower.includes(', ' + word + ' ')
    );
    if (startsWithInterrogative) {
      score += 0.55;
      matchedPattern = matchedPattern ? `${matchedPattern}+interrogative` : 'interrogative_word';
    }

    // 3. Check auxiliary inversions
    const hasAuxInversion = this.AUXILIARY_INVERSIONS.some((inv) => lower.includes(inv));
    if (hasAuxInversion) {
      score += 0.50;
      matchedPattern = matchedPattern ? `${matchedPattern}+aux_inversion` : 'auxiliary_inversion';
    }

    // 4. Check inquiry phrases
    const hasInquiryPhrase = this.INQUIRY_PHRASES.some((phrase) => lower.includes(phrase));
    if (hasInquiryPhrase) {
      score += 0.50;
      matchedPattern = matchedPattern ? `${matchedPattern}+inquiry_phrase` : 'inquiry_phrase';
    }

    // Cap confidence score at 0.99
    const confidence = Math.min(0.99, Number(score.toFixed(2)));
    const isQuestion = confidence >= 0.50 || hasQuestionMark;

    // Determine Question Category
    let category: 'technical' | 'process' | 'decision' | 'timeline' | 'cost' | 'general' = 'general';
    for (const [catKey, keywords] of Object.entries(this.CATEGORY_KEYWORDS)) {
      if (keywords.some((kw) => lower.includes(kw))) {
        category = catKey as any;
        break;
      }
    }

    return {
      isQuestion,
      confidence,
      category,
      detectedQuestion: trimmed,
      matchedPattern,
    };
  }
}
