import { Meeting, MeetingNote, ActionItem, generateId } from '@answer-bubble/shared';

export class LocalMeetingStore {
  private meetings: Map<string, Meeting> = new Map();
  private storageKey = 'answer_bubble_meetings_v1';

  constructor() {
    this.loadFromStorage();
    if (this.meetings.size === 0) {
      this.seedSampleMeetings();
    }
  }

  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        const parsed: Meeting[] = JSON.parse(raw);
        parsed.forEach((m) => this.meetings.set(m.id, m));
      }
    } catch (e) {
      console.warn('Failed to load stored meetings:', e);
    }
  }

  private saveToStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const array = Array.from(this.meetings.values());
      localStorage.setItem(this.storageKey, JSON.stringify(array));
    } catch (e) {
      console.warn('Failed to persist meetings to storage:', e);
    }
  }

  public saveMeeting(meeting: Meeting): void {
    this.meetings.set(meeting.id, meeting);
    this.saveToStorage();
  }

  public getMeeting(id: string): Meeting | undefined {
    return this.meetings.get(id);
  }

  public getAllMeetings(): Meeting[] {
    return Array.from(this.meetings.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  public deleteMeeting(id: string): void {
    this.meetings.delete(id);
    this.saveToStorage();
  }

  public seedSampleMeetings(): void {
    const sample1Id = generateId('mtg_demo_1');
    const sample1: Meeting = {
      id: sample1Id,
      title: 'Backend AI Architecture Sync',
      date: new Date(Date.now() - 3 * 86400000).toISOString(),
      durationSeconds: 1450,
      meetingType: 'technical',
      isActive: false,
      participants: [
        { id: 'spk_1', name: 'Alex (Tech Lead)', color: '#3B82F6' },
        { id: 'spk_2', name: 'Sarah (ML Engineer)', color: '#10B981' },
        { id: 'spk_3', name: 'John (DevOps)', color: '#F59E0B' },
        { id: 'user_me', name: 'You', color: '#8B5CF6', isUser: true },
      ],
      segments: [
        { id: 'seg_1', meetingId: sample1Id, timestamp: '10:00', timeInSeconds: 0, speaker: { id: 'spk_1', name: 'Alex (Tech Lead)', color: '#3B82F6' }, text: 'How can we reduce inference cost for our real-time models?', confidence: 0.95, isFinal: true },
        { id: 'seg_2', meetingId: sample1Id, timestamp: '10:01', timeInSeconds: 60, speaker: { id: 'spk_2', name: 'Sarah (ML Engineer)', color: '#10B981' }, text: 'We could use FP16 quantization or model distillation to cut VRAM usage by half.', confidence: 0.94, isFinal: true },
        { id: 'seg_3', meetingId: sample1Id, timestamp: '10:02', timeInSeconds: 120, speaker: { id: 'spk_3', name: 'John (DevOps)', color: '#F59E0B' }, text: "I'll complete the performance benchmark report by Friday afternoon.", confidence: 0.96, isFinal: true },
        { id: 'seg_4', meetingId: sample1Id, timestamp: '10:03', timeInSeconds: 180, speaker: { id: 'spk_1', name: 'Alex (Tech Lead)', color: '#3B82F6' }, text: 'What did we decide about vector database indexing last week?', confidence: 0.92, isFinal: true },
      ],
      suggestions: [
        { id: 'sug_1', meetingId: sample1Id, timestamp: '10:01', text: '> Mention quantization.', wordCount: 2, triggeredByQuestion: 'How can we reduce inference cost?', meetingType: 'technical' },
      ],
      actionItems: [
        { id: 'act_1', meetingId: sample1Id, owner: 'John (DevOps)', task: 'Complete performance benchmark report', deadline: 'Friday afternoon', status: 'pending', createdAt: new Date().toISOString() },
        { id: 'act_2', meetingId: sample1Id, owner: 'Sarah (ML Engineer)', task: 'Evaluate FP16 model quantization on test cluster', deadline: 'Next Monday', status: 'in_progress', createdAt: new Date().toISOString() },
      ],
      notes: {
        id: 'note_1',
        meetingId: sample1Id,
        meetingTitle: 'Backend AI Architecture Sync',
        date: new Date(Date.now() - 3 * 86400000).toISOString(),
        meetingType: 'technical',
        participants: [
          { id: 'spk_1', name: 'Alex (Tech Lead)', color: '#3B82F6' },
          { id: 'spk_2', name: 'Sarah (ML Engineer)', color: '#10B981' },
          { id: 'spk_3', name: 'John (DevOps)', color: '#F59E0B' },
        ],
        summary: 'Team discussed strategies to reduce AI model inference latency and VRAM costs.',
        keyDecisions: ['Adopt FP16 quantization for low-latency inference endpoints.'],
        actionItems: [
          { id: 'act_1', meetingId: sample1Id, owner: 'John (DevOps)', task: 'Complete performance benchmark report', deadline: 'Friday afternoon', status: 'pending', createdAt: new Date().toISOString() },
        ],
        risks: ['VRAM budget limits during peak parallel traffic.'],
        openQuestions: ['Is HNSW vector index optimal for Qdrant storage?'],
        deadlines: ['Benchmark report: Friday afternoon'],
      },
    };

    this.saveMeeting(sample1);
  }
}
