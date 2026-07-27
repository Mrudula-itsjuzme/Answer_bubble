import { Meeting, TranscriptSegment, ActionItem } from '@answer-bubble/shared';
import { LocalMeetingStore } from './local-store';
import { VectorSearchEngine } from './vector-engine';

export interface SearchResult {
  type: 'transcript' | 'action_item' | 'decision' | 'summary';
  meetingId: string;
  meetingTitle: string;
  date: string;
  speakerName?: string;
  content: string;
  score: number;
  highlightSnippet: string;
}

export class MemorySearchEngine {
  constructor(private store: LocalMeetingStore) {}

  public search(query: string): SearchResult[] {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return [];

    const queryTokens = VectorSearchEngine.tokenize(cleanQuery);
    const meetings = this.store.getAllMeetings();
    const results: SearchResult[] = [];

    meetings.forEach((meeting) => {
      // 1. Search Action Items
      meeting.actionItems.forEach((action) => {
        const text = `${action.owner} ${action.task} ${action.deadline}`.toLowerCase();
        let matchCount = 0;
        queryTokens.forEach((t) => {
          if (text.includes(t)) matchCount++;
        });

        if (matchCount > 0) {
          const score = (matchCount / queryTokens.length) * 0.9;
          results.push({
            type: 'action_item',
            meetingId: meeting.id,
            meetingTitle: meeting.title,
            date: meeting.date,
            speakerName: action.owner,
            content: `Task: ${action.task} (Deadline: ${action.deadline})`,
            score,
            highlightSnippet: `${action.owner} promised: "${action.task}" by ${action.deadline}`,
          });
        }
      });

      // 2. Search Transcript Segments
      meeting.segments.forEach((segment) => {
        const text = segment.text.toLowerCase();
        let matchCount = 0;
        queryTokens.forEach((t) => {
          if (text.includes(t)) matchCount++;
        });

        if (matchCount > 0) {
          const score = (matchCount / queryTokens.length) * 0.8;
          results.push({
            type: 'transcript',
            meetingId: meeting.id,
            meetingTitle: meeting.title,
            date: meeting.date,
            speakerName: segment.speaker?.name,
            content: segment.text,
            score,
            highlightSnippet: `"${segment.text}"`,
          });
        }
      });

      // 3. Search Key Decisions & Summary in Notes
      if (meeting.notes) {
        meeting.notes.keyDecisions.forEach((decision) => {
          const text = decision.toLowerCase();
          let matchCount = 0;
          queryTokens.forEach((t) => {
            if (text.includes(t)) matchCount++;
          });

          if (matchCount > 0) {
            results.push({
              type: 'decision',
              meetingId: meeting.id,
              meetingTitle: meeting.title,
              date: meeting.date,
              content: decision,
              score: (matchCount / queryTokens.length) * 0.85,
              highlightSnippet: `Decision: ${decision}`,
            });
          }
        });
      }
    });

    // Sort by relevance score descending
    return results.sort((a, b) => b.score - a.score).slice(0, 15);
  }
}
