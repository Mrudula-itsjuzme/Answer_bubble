export type MeetingType =
  | 'standup'
  | 'client'
  | 'interview'
  | 'technical'
  | 'lecture'
  | 'brainstorm'
  | 'casual';

export interface Speaker {
  id: string;
  name: string;
  color: string;
  isUser?: boolean;
}

export interface TranscriptSegment {
  id: string;
  meetingId: string;
  timestamp: string; // HH:MM:SS or ISO
  timeInSeconds: number;
  speaker: Speaker;
  text: string;
  confidence: number;
  isFinal: boolean;
}

export interface Suggestion {
  id: string;
  meetingId: string;
  timestamp: string;
  text: string; // 1-3 lines, max 25 words
  wordCount: number;
  triggeredByQuestion: string;
  accepted?: boolean;
  meetingType: MeetingType;
}

export interface ActionItem {
  id: string;
  meetingId: string;
  owner: string;
  task: string;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
}

export interface MeetingNote {
  id: string;
  meetingId: string;
  meetingTitle: string;
  date: string;
  meetingType: MeetingType;
  participants: Speaker[];
  summary: string;
  keyDecisions: string[];
  actionItems: ActionItem[];
  risks: string[];
  openQuestions: string[];
  deadlines: string[];
}

export interface Meeting {
  id: string;
  title: string;
  date: string; // ISO String
  durationSeconds: number;
  meetingType: MeetingType;
  participants: Speaker[];
  segments: TranscriptSegment[];
  suggestions: Suggestion[];
  notes?: MeetingNote;
  actionItems: ActionItem[];
  isActive: boolean;
}

export type STTProviderType =
  | 'whisper-api'
  | 'deepgram'
  | 'gladia'
  | 'whisper-cpp'
  | 'webspeech'
  | 'mock';

export type LLMProviderType =
  | 'openai'
  | 'anthropic'
  | 'openrouter'
  | 'ollama'
  | 'mock';

export interface STTConfig {
  provider: STTProviderType;
  apiKey?: string;
  model?: string;
  endpoint?: string;
  language?: string;
  continuous?: boolean;
}

export interface LLMConfig {
  provider: LLMProviderType;
  apiKey?: string;
  model?: string;
  temperature?: number;
  endpoint?: string;
  suggestionAggressiveness?: 'low' | 'medium' | 'high';
}

export interface AudioDeviceConfig {
  captureSystemAudio: boolean;
  captureMicrophone: boolean;
  inputDeviceId?: string;
  sampleRate: number;
  vadThreshold: number; // 0 to 1
  noiseSuppression: boolean;
}

export interface AppSettings {
  audio: AudioDeviceConfig;
  stt: STTConfig;
  llm: LLMConfig;
  overlay: {
    alwaysOnTop: boolean;
    opacity: number;
    fontSize: 'sm' | 'md' | 'lg';
    position: { x: number; y: number };
    isCollapsed: boolean;
    shortcut: string;
  };
  theme: 'dark' | 'glass-dark' | 'cyberpunk-dark';
  autoGenerateNotes: boolean;
}
