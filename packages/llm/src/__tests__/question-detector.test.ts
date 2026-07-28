import { describe, it, expect } from 'vitest';
import { QuestionDetector } from '../question-detector';

describe('QuestionDetector Unit Tests', () => {
  it('should identify direct questions with question marks', () => {
    const res = QuestionDetector.detect('How do we scale vector indexing?');
    expect(res.isQuestion).toBe(true);
    expect(res.confidence).toBeGreaterThan(0.8);
    expect(res.category).toBe('technical');
  });

  it('should identify interrogative questions without explicit question marks', () => {
    const res = QuestionDetector.detect('What trade-offs do you consider when choosing between Postgres and DynamoDB');
    expect(res.isQuestion).toBe(true);
    expect(res.confidence).toBeGreaterThan(0.5);
  });

  it('should identify modal verb inverted questions', () => {
    const res = QuestionDetector.detect('Can we reduce inference cost and latency for peak traffic');
    expect(res.isQuestion).toBe(true);
    expect(res.category).toBe('cost');
  });

  it('should identify timeline and deadline questions', () => {
    const res = QuestionDetector.detect('When will the benchmark report be finished by Friday');
    expect(res.isQuestion).toBe(true);
    expect(res.category).toBe('timeline');
  });

  it('should return false for declarative non-question statements', () => {
    const res = QuestionDetector.detect('We are currently optimizing the backend inference pipeline.');
    expect(res.isQuestion).toBe(false);
  });
});
