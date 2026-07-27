import { Speaker, getSpeakerColor } from '@answer-bubble/shared';

export class SpeakerDiarizationEngine {
  private speakers: Map<string, Speaker> = new Map();
  private userSpeakerId: string = 'user_me';

  constructor() {
    // Default user speaker
    this.speakers.set(this.userSpeakerId, {
      id: this.userSpeakerId,
      name: 'You',
      color: '#3B82F6', // Blue
      isUser: true,
    });
  }

  public getOrCreateSpeaker(rawNameOrId?: string, isUser: boolean = false): Speaker {
    if (isUser || rawNameOrId === 'You' || rawNameOrId === 'user') {
      return this.speakers.get(this.userSpeakerId)!;
    }

    const key = (rawNameOrId || 'Speaker').trim();
    
    // Check if matching speaker exists by name
    for (const speaker of this.speakers.values()) {
      if (speaker.name.toLowerCase() === key.toLowerCase()) {
        return speaker;
      }
    }

    // Create new speaker record with unique color
    const index = this.speakers.size;
    const newSpeaker: Speaker = {
      id: `spk_${Date.now()}_${index}`,
      name: key.length > 0 ? key : `Speaker ${index}`,
      color: getSpeakerColor(index),
      isUser: false,
    };

    this.speakers.set(newSpeaker.id, newSpeaker);
    return newSpeaker;
  }

  public getAllSpeakers(): Speaker[] {
    return Array.from(this.speakers.values());
  }

  public renameSpeaker(id: string, newName: string): void {
    const speaker = this.speakers.get(id);
    if (speaker) {
      speaker.name = newName;
    }
  }

  public reset(): void {
    this.speakers.clear();
    this.speakers.set(this.userSpeakerId, {
      id: this.userSpeakerId,
      name: 'You',
      color: '#3B82F6',
      isUser: true,
    });
  }
}
