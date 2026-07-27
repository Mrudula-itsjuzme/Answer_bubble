import { describe, it, expect } from 'vitest';
import { LocalMeetingStore } from '../local-store';
import { MemorySearchEngine } from '../search-engine';

describe('Memory Storage & Search Retrieval Test Suite', () => {
  it('should seed and retrieve local meetings', () => {
    const store = new LocalMeetingStore();
    const meetings = store.getAllMeetings();
    expect(meetings.length).toBeGreaterThan(0);
    expect(meetings[0].title).toBeTruthy();
  });

  it('should perform semantic search and return relevant meeting segments', () => {
    const store = new LocalMeetingStore();
    const searchEngine = new MemorySearchEngine(store);

    const results = searchEngine.search('quantization FP16');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].score).toBeGreaterThan(0);
    expect(results[0].content).toContain('quantization');
  });
});
