import { create } from 'zustand';
import {
  AppSettings,
  Meeting,
  MeetingNote,
  MeetingType,
  Speaker,
  Suggestion,
  TranscriptSegment,
  ActionItem,
  generateId,
  globalEventBus,
} from '@answer-bubble/shared';
import { AudioStreamManager } from '@answer-bubble/audio';
import { SpeakerDiarizationEngine } from '@answer-bubble/diarization';
import { RollingContextManager, IntelligentSuggestionEngine } from '@answer-bubble/llm';
import { StructuredNoteGenerator, MeetingTypeDetector } from '@answer-bubble/notes';
import { LocalMeetingStore, MemorySearchEngine, SearchResult } from '@answer-bubble/memory';

interface AppState {
  // Navigation & View
  activeView: 'dashboard' | 'history' | 'search' | 'notes' | 'settings' | 'timeline' | 'followup' | 'graph' | 'audit' | 'mom';
  setActiveView: (view: 'dashboard' | 'history' | 'search' | 'notes' | 'settings' | 'timeline' | 'followup' | 'graph' | 'audit' | 'mom') => void;

  // Settings
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;

  // Overlay state
  isOverlayCollapsed: boolean;
  setIsOverlayCollapsed: (collapsed: boolean) => void;
  overlayPosition: { x: number; y: number };
  setOverlayPosition: (pos: { x: number; y: number }) => void;

  // Audio & Meeting State
  isCapturing: boolean;
  audioLevel: number;
  isSpeaking: boolean;
  captureMode: 'real' | 'simulation';
  
  activeMeeting: Meeting | null;
  selectedMeetingId: string | null;
  setSelectedMeetingId: (id: string | null) => void;

  // Real-time suggestions & transcripts
  currentSuggestions: Suggestion[];
  pinnedSuggestion: Suggestion | null;
  setPinnedSuggestion: (sug: Suggestion | null) => void;
  dismissSuggestion: (id: string) => void;

  // Search
  searchQuery: string;
  searchResults: SearchResult[];
  setSearchQuery: (query: string) => void;

  // Command Palette
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;

  // Actions
  startMeeting: (meetingType?: MeetingType, mode?: 'real' | 'simulation') => Promise<void>;
  stopMeeting: () => Promise<void>;
  setMeetingType: (type: MeetingType) => void;
  generateCurrentNotes: () => void;
  toggleActionItemStatus: (meetingId: string, actionId: string) => void;
  deleteMeeting: (id: string) => void;
  exportNotesFormat: (format: 'md' | 'html' | 'json') => void;
}

// Singletons
const diarizer = new SpeakerDiarizationEngine();
const contextManager = new RollingContextManager('technical');
const suggestionEngine = new IntelligentSuggestionEngine();
const localStore = new LocalMeetingStore();
const searchEngine = new MemorySearchEngine(localStore);
const audioManager = new AudioStreamManager(globalEventBus);

export const useAppStore = create<AppState>((set, get) => {
  // Global Event Listeners Setup
  globalEventBus.on<{ level: number; isSpeaking: boolean }>('audio-level', ({ level, isSpeaking }) => {
    set({ audioLevel: level, isSpeaking });
  });

  globalEventBus.on<{ speakerName: string; isUser: boolean; text: string; isFinal: boolean }>('simulated-transcript-chunk', async (data) => {
    const { activeMeeting, settings } = get();
    if (!activeMeeting || !activeMeeting.isActive) return;

    const speaker = diarizer.getOrCreateSpeaker(data.speakerName, data.isUser);
    const newSegment: TranscriptSegment = {
      id: generateId('seg'),
      meetingId: activeMeeting.id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      timeInSeconds: Math.floor((Date.now() - new Date(activeMeeting.date).getTime()) / 1000),
      speaker,
      text: data.text,
      confidence: 0.95,
      isFinal: data.isFinal,
    };

    contextManager.addSegment(newSegment);

    const updatedSegments = [...activeMeeting.segments, newSegment];
    set({
      activeMeeting: {
        ...activeMeeting,
        segments: updatedSegments,
        participants: diarizer.getAllSpeakers(),
      },
    });

    // Intelligent Suggestion Engine Evaluation with Adaptive Profile
    if (data.text.includes('?') || data.text.toLowerCase().includes('how') || data.text.toLowerCase().includes('cost')) {
      const suggestion = await suggestionEngine.evaluateContext(
        contextManager,
        activeMeeting.id,
        data.text,
        settings.adaptiveProfile,
        settings.visionOCR ? '[SHARED SCREEN: "Architecture & Quantization Benchmarks"]' : ''
      );
      if (suggestion) {
        set((state) => ({
          currentSuggestions: [suggestion, ...state.currentSuggestions].slice(0, 5),
          activeMeeting: state.activeMeeting
            ? { ...state.activeMeeting, suggestions: [suggestion, ...state.activeMeeting.suggestions] }
            : null,
        }));
      }
    }
  });

  return {
    activeView: 'dashboard',
    setActiveView: (view) => set({ activeView: view }),

    settings: {
      audio: {
        captureSystemAudio: true,
        captureMicrophone: true,
        sampleRate: 16000,
        vadThreshold: 0.015,
        noiseSuppression: true,
      },
      stt: {
        provider: 'mock',
      },
      llm: {
        provider: 'mock',
        suggestionAggressiveness: 'medium',
      },
      overlay: {
        alwaysOnTop: true,
        opacity: 0.9,
        fontSize: 'md',
        position: { x: 20, y: 80 },
        isCollapsed: false,
        shortcut: 'CommandOrControl+Shift+M',
      },
      theme: 'dark',
      autoGenerateNotes: true,
      adaptiveProfile: 'terse-technical',
      isOfflineOnly: false,
      visionOCR: true,
    },

    updateSettings: (partial) =>
      set((state) => {
        const newSettings = { ...state.settings, ...partial };
        audioManager.updateConfig(newSettings.audio);
        suggestionEngine.updateConfig(newSettings.llm);
        return { settings: newSettings };
      }),

    isOverlayCollapsed: false,
    setIsOverlayCollapsed: (collapsed) => set({ isOverlayCollapsed: collapsed }),
    overlayPosition: { x: 20, y: 80 },
    setOverlayPosition: (pos) => set({ overlayPosition: pos }),

    isCapturing: false,
    audioLevel: 0,
    isSpeaking: false,
    captureMode: 'simulation',

    activeMeeting: null,
    selectedMeetingId: null,
    setSelectedMeetingId: (id) => set({ selectedMeetingId: id }),

    currentSuggestions: [],
    pinnedSuggestion: null,
    setPinnedSuggestion: (sug) => set({ pinnedSuggestion: sug }),
    dismissSuggestion: (id) =>
      set((state) => ({
        currentSuggestions: state.currentSuggestions.filter((s) => s.id !== id),
      })),

    searchQuery: '',
    searchResults: [],
    setSearchQuery: (query) => {
      const results = searchEngine.search(query);
      set({ searchQuery: query, searchResults: results });
    },

    isCommandPaletteOpen: false,
    setIsCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),

    startMeeting: async (meetingType = 'technical', mode = 'simulation') => {
      diarizer.reset();
      contextManager.reset();
      contextManager.setMeetingType(meetingType);

      const meetingId = generateId('mtg');
      const newMeeting: Meeting = {
        id: meetingId,
        title: `${meetingType.toUpperCase()} Meeting - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        date: new Date().toISOString(),
        durationSeconds: 0,
        meetingType,
        participants: diarizer.getAllSpeakers(),
        segments: [],
        suggestions: [],
        actionItems: [],
        isActive: true,
      };

      set({
        activeMeeting: newMeeting,
        selectedMeetingId: meetingId,
        isCapturing: true,
        captureMode: mode,
        currentSuggestions: [],
      });

      await audioManager.startCapture(mode, meetingType);
    },

    stopMeeting: async () => {
      const { activeMeeting } = get();
      audioManager.stopCapture();

      if (activeMeeting) {
        const finalMeeting: Meeting = { ...activeMeeting, isActive: false };
        const notes = StructuredNoteGenerator.generateNotes(finalMeeting);
        finalMeeting.notes = notes;
        finalMeeting.actionItems = notes.actionItems;

        localStore.saveMeeting(finalMeeting);

        set({
          activeMeeting: finalMeeting,
          isCapturing: false,
        });
      }
    },

    setMeetingType: (type) => {
      contextManager.setMeetingType(type);
      set((state) =>
        state.activeMeeting
          ? { activeMeeting: { ...state.activeMeeting, meetingType: type } }
          : state
      );
    },

    generateCurrentNotes: () => {
      const { activeMeeting } = get();
      if (!activeMeeting) return;
      const notes = StructuredNoteGenerator.generateNotes(activeMeeting);
      const updatedMeeting = { ...activeMeeting, notes, actionItems: notes.actionItems };
      localStore.saveMeeting(updatedMeeting);
      set({ activeMeeting: updatedMeeting });
    },

    toggleActionItemStatus: (meetingId, actionId) => {
      const meeting = localStore.getMeeting(meetingId) || get().activeMeeting;
      if (!meeting) return;

      const updatedActions = meeting.actionItems.map((act) => {
        if (act.id === actionId) {
          const nextStatus = act.status === 'completed' ? 'pending' : 'completed';
          return { ...act, status: nextStatus as any };
        }
        return act;
      });

      const updatedMeeting = { ...meeting, actionItems: updatedActions };
      if (updatedMeeting.notes) {
        updatedMeeting.notes.actionItems = updatedActions;
      }

      localStore.saveMeeting(updatedMeeting);
      set((state) => (state.activeMeeting?.id === meetingId ? { activeMeeting: updatedMeeting } : state));
    },

    deleteMeeting: (id) => {
      localStore.deleteMeeting(id);
      set((state) => ({
        selectedMeetingId: state.selectedMeetingId === id ? null : state.selectedMeetingId,
      }));
    },

    exportNotesFormat: (format) => {
      const { activeMeeting } = get();
      if (!activeMeeting || !activeMeeting.notes) return;
      
      let content = '';
      let filename = `meeting_notes_${activeMeeting.id}.${format}`;

      if (format === 'md') {
        content = StructuredNoteGenerator.generateNotes(activeMeeting).summary;
      }
      
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
    },
  };
});

export { localStore };
