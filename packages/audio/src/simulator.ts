import { TypedEventEmitter } from '@answer-bubble/shared';

export interface SimulatedDialogueItem {
  speakerName: string;
  isUser: boolean;
  text: string;
  delayMs: number;
}

export const SAMPLE_SIMULATED_MEETINGS: Record<string, SimulatedDialogueItem[]> = {
  technical: [
    { speakerName: 'Alex (Tech Lead)', isUser: false, text: 'Welcome everyone. We need to optimize our backend AI model inference latency.', delayMs: 2500 },
    { speakerName: 'Sarah (ML Engineer)', isUser: false, text: 'Currently our round-trip time is over 1.8 seconds per request.', delayMs: 3000 },
    { speakerName: 'John (DevOps)', isUser: false, text: 'How can we reduce inference cost and latency for peak traffic?', delayMs: 3500 },
    { speakerName: 'You', isUser: true, text: 'We could explore FP16 quantization or vLLM caching.', delayMs: 4000 },
    { speakerName: 'Sarah (ML Engineer)', isUser: false, text: 'What did we decide about vector database indexing last week?', delayMs: 3500 },
    { speakerName: 'Alex (Tech Lead)', isUser: false, text: 'John, can you finish the performance benchmark report by Friday?', delayMs: 3500 },
    { speakerName: 'John (DevOps)', isUser: false, text: "Yes, I'll complete the benchmark report by Friday afternoon.", delayMs: 3000 },
  ],
  interview: [
    { speakerName: 'Interviewer', isUser: false, text: 'Can you tell me about a time you solved a bottleneck in distributed systems?', delayMs: 3000 },
    { speakerName: 'Interviewer', isUser: false, text: 'What trade-offs do you consider when choosing between PostgreSQL and DynamoDB?', delayMs: 3500 },
    { speakerName: 'Interviewer', isUser: false, text: 'How do you handle schema migrations with zero downtime?', delayMs: 3500 },
  ],
  client: [
    { speakerName: 'Client Representative', isUser: false, text: 'We are concerned about data privacy and compliance with SOC2 standard.', delayMs: 3000 },
    { speakerName: 'Client Representative', isUser: false, text: 'Can we get custom SLA guarantees for 99.99% uptime?', delayMs: 3500 },
    { speakerName: 'Client Representative', isUser: false, text: 'What is the projected timeline for the enterprise SSO deployment?', delayMs: 3500 },
  ],
};

export class AudioSimulationEngine {
  private timer: any = null;
  private isRunning: boolean = false;
  private currentStep: number = 0;

  constructor(private eventBus: TypedEventEmitter) {}

  public start(meetingCategory: string = 'technical'): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.currentStep = 0;

    const dialogue = SAMPLE_SIMULATED_MEETINGS[meetingCategory] || SAMPLE_SIMULATED_MEETINGS.technical;

    const executeNextStep = () => {
      if (!this.isRunning) return;

      const item = dialogue[this.currentStep % dialogue.length];
      
      // Emit simulated audio level (waveform meter simulation)
      const level = Math.random() * 0.6 + 0.3;
      this.eventBus.emit('audio-level', { level, isSpeaking: true });

      // Emit simulated transcript payload
      this.eventBus.emit('simulated-transcript-chunk', {
        speakerName: item.speakerName,
        isUser: item.isUser,
        text: item.text,
        isFinal: true,
      });

      this.currentStep++;
      const nextDelay = dialogue[this.currentStep % dialogue.length]?.delayMs || 4000;

      this.timer = setTimeout(executeNextStep, nextDelay);
    };

    executeNextStep();
  }

  public stop(): void {
    this.isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.eventBus.emit('audio-level', { level: 0, isSpeaking: false });
  }
}
