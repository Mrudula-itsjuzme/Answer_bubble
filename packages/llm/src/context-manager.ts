import { TranscriptSegment, Suggestion, MeetingType } from '@answer-bubble/shared';

export interface CompressedContext {
  meetingType: MeetingType;
  recentDialogue: string;
  extractedFacts: string[];
  keyEntities: { people: string[]; projects: string[]; companies: string[] };
  previousSuggestions: string[];
}

export class RollingContextManager {
  private segments: TranscriptSegment[] = [];
  private maxSegments: number = 15;
  private extractedFacts: Set<string> = new Set();
  private people: Set<string> = new Set();
  private projects: Set<string> = new Set();
  private companies: Set<string> = new Set();
  private previousSuggestions: string[] = [];
  private meetingType: MeetingType = 'technical';

  constructor(meetingType: MeetingType = 'technical') {
    this.meetingType = meetingType;
  }

  public setMeetingType(type: MeetingType): void {
    this.meetingType = type;
  }

  public addSegment(segment: TranscriptSegment): void {
    this.segments.push(segment);
    if (this.segments.length > this.maxSegments) {
      const removed = this.segments.shift();
      if (removed) {
        this.extractEntitiesAndFacts(removed);
      }
    }
  }

  public addSuggestion(suggestion: Suggestion): void {
    this.previousSuggestions.push(suggestion.text);
    if (this.previousSuggestions.length > 5) {
      this.previousSuggestions.shift();
    }
  }

  private extractEntitiesAndFacts(segment: TranscriptSegment): void {
    const text = segment.text;
    if (segment.speaker?.name && segment.speaker.name !== 'You') {
      this.people.add(segment.speaker.name);
    }

    // Simple entity pattern detection
    const words = text.split(/\s+/);
    words.forEach((w) => {
      if (w.match(/^[A-Z][a-z]{3,}$/)) {
        if (['PostgreSQL', 'DynamoDB', 'Docker', 'Kubernetes', 'Python', 'React', 'Tauri'].includes(w)) {
          this.projects.add(w);
        }
      }
    });

    if (text.length > 30 && (text.includes('decide') || text.includes('agree') || text.includes('promise'))) {
      this.extractedFacts.add(`${segment.speaker.name}: "${text.slice(0, 60)}..."`);
    }
  }

  public getFormattedContext(): CompressedContext {
    const recentDialogue = this.segments
      .map((s) => `${s.speaker.name} (${s.timestamp}): ${s.text}`)
      .join('\n');

    return {
      meetingType: this.meetingType,
      recentDialogue,
      extractedFacts: Array.from(this.extractedFacts).slice(-5),
      keyEntities: {
        people: Array.from(this.people),
        projects: Array.from(this.projects),
        companies: Array.from(this.companies),
      },
      previousSuggestions: this.previousSuggestions,
    };
  }

  public reset(): void {
    this.segments = [];
    this.extractedFacts.clear();
    this.people.clear();
    this.projects.clear();
    this.companies.clear();
    this.previousSuggestions = [];
  }
}
