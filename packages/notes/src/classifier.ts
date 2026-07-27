import { MeetingType, TranscriptSegment } from '@answer-bubble/shared';

export class MeetingTypeDetector {
  public static detectMeetingType(segments: TranscriptSegment[]): MeetingType {
    const fullText = segments.map((s) => s.text.toLowerCase()).join(' ');

    if (fullText.includes('standup') || fullText.includes('yesterday') || fullText.includes('blocker') || fullText.includes('today i will')) {
      return 'standup';
    }
    if (fullText.includes('interview') || fullText.includes('candidate') || fullText.includes('resume') || fullText.includes('experience')) {
      return 'interview';
    }
    if (fullText.includes('sla') || fullText.includes('pricing') || fullText.includes('client') || fullText.includes('contract') || fullText.includes('proposal')) {
      return 'client';
    }
    if (fullText.includes('latency') || fullText.includes('database') || fullText.includes('architecture') || fullText.includes('quantization') || fullText.includes('benchmark')) {
      return 'technical';
    }
    if (fullText.includes('brainstorm') || fullText.includes('ideas') || fullText.includes('what if') || fullText.includes('concept')) {
      return 'brainstorm';
    }
    if (fullText.includes('lecture') || fullText.includes('slide') || fullText.includes('chapter') || fullText.includes('course')) {
      return 'lecture';
    }

    return 'technical'; // Default intelligent default
  }
}
