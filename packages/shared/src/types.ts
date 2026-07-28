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
  isQuestion?: boolean;
  questionCategory?: string;
  questionConfidence?: number;
}

export interface Suggestion {
  id: string;
  meetingId: string;
  timestamp: string;
  text: string; // 1-3 lines, max 25 words
  wordCount: number;
  triggeredByQuestion: string;
  questionCategory?: string;
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
  | 'elevenlabs'
  | 'whisper-cpp'
  | 'webspeech'
  | 'mock';

export type LLMProviderType =
  | 'openai'
  | 'anthropic'
  | 'openrouter'
  | 'elevenlabs'
  | 'ollama'
  | 'mock';

export interface STTConfig {
  provider: STTProviderType;
  apiKey?: string;
  agentId?: string;
  model?: string;
  endpoint?: string;
  language?: string;
  continuous?: boolean;
}

export interface LLMConfig {
  provider: LLMProviderType;
  apiKey?: string;
  agentId?: string;
  model?: string;
  temperature?: number;
  endpoint?: string;
  ollamaEndpoint?: string;
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

export type AdaptiveProfileType =
  | 'terse-technical'
  | 'reminder-coaching'
  | 'followup-interrogator'
  | 'star-interview';

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
  adaptiveProfile: AdaptiveProfileType;
  isOfflineOnly: boolean;
  visionOCR: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  audio: {
    captureSystemAudio: true,
    captureMicrophone: true,
    sampleRate: 16000,
    vadThreshold: 0.15,
    noiseSuppression: true,
  },
  stt: {
    provider: 'webspeech',
    continuous: true,
    language: 'en-US',
  },
  llm: {
    provider: 'mock',
    temperature: 0.2,
    suggestionAggressiveness: 'medium',
  },
  overlay: {
    alwaysOnTop: true,
    opacity: 0.95,
    fontSize: 'md',
    position: { x: 20, y: 20 },
    isCollapsed: false,
    shortcut: 'Ctrl+Shift+Space',
  },
  theme: 'glass-dark',
  autoGenerateNotes: true,
  adaptiveProfile: 'terse-technical',
  isOfflineOnly: false,
  visionOCR: true,
};
