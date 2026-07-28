import React from 'react';
import { Sliders, Mic, Cpu, Bot, Layout, ShieldCheck, Eye, Sparkles } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { STTProviderType, LLMProviderType, AdaptiveProfileType } from '@answer-bubble/shared';

export const SettingsModal: React.FC = () => {
  const { settings, updateSettings } = useAppStore();

  return (
    <div className="h-full overflow-y-auto custom-scrollbar space-y-6 pr-2">
      <div className="pb-2 border-b border-white/10 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-100">Settings & Provider Preferences</h1>
          <p className="text-xs text-slate-400">Configure native audio, Speech-to-Text providers, LLM endpoints, and adaptive profiles</p>
        </div>

        {/* Offline Toggle Badge */}
        <button
          onClick={() => updateSettings({ isOfflineOnly: !settings.isOfflineOnly })}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            settings.isOfflineOnly
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-slate-800 text-slate-400 border border-white/10 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{settings.isOfflineOnly ? 'Strict Offline Mode (Active)' : 'Cloud/Local Hybrid'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Adaptive Persona Profile Settings */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Adaptive Prompting Persona</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">User Preference Profile</label>
              <select
                value={settings.adaptiveProfile}
                onChange={(e) => updateSettings({ adaptiveProfile: e.target.value as AdaptiveProfileType })}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-slate-200"
              >
                <option value="terse-technical">Terse Technical (Direct architecture & code nudges)</option>
                <option value="reminder-coaching">Reminder Coaching (Reminders for open commitments)</option>
                <option value="followup-interrogator">Follow-up Interrogator (Probing questions to ask)</option>
                <option value="star-interview">STAR Interview (Situation, Task, Action, Result)</option>
              </select>
            </div>

            <label className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-white/5 cursor-pointer">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-300">Vision Screen OCR (Read slides & code)</span>
              </div>
              <input
                type="checkbox"
                checked={settings.visionOCR}
                onChange={(e) => updateSettings({ visionOCR: e.target.checked })}
                className="rounded bg-slate-800 border-white/20 text-indigo-600 focus:ring-indigo-500"
              />
            </label>
          </div>
        </div>

        {/* 2. Audio Capture Settings */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
            <Mic className="w-4 h-4 text-indigo-400" />
            <span>Audio & VAD Capture</span>
          </h2>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-white/5 cursor-pointer">
              <span className="text-slate-300">Capture System Desktop Audio</span>
              <input
                type="checkbox"
                checked={settings.audio.captureSystemAudio}
                onChange={(e) => updateSettings({ audio: { ...settings.audio, captureSystemAudio: e.target.checked } })}
                className="rounded bg-slate-800 border-white/20 text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-white/5 cursor-pointer">
              <span className="text-slate-300">Capture Microphone Audio</span>
              <input
                type="checkbox"
                checked={settings.audio.captureMicrophone}
                onChange={(e) => updateSettings({ audio: { ...settings.audio, captureMicrophone: e.target.checked } })}
                className="rounded bg-slate-800 border-white/20 text-indigo-600 focus:ring-indigo-500"
              />
            </label>
          </div>
        </div>

        {/* 3. Speech-to-Text (STT) Provider Settings */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Speech-to-Text (STT) Provider</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">STT Engine</label>
              <select
                value={settings.stt.provider}
                onChange={(e) => updateSettings({ stt: { ...settings.stt, provider: e.target.value as STTProviderType } })}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-slate-200"
              >
                <option value="mock">Mock Engine (Zero Setup / Demo)</option>
                <option value="webspeech">Web Speech API (Browser Native)</option>
                <option value="elevenlabs">ElevenLabs Scribe STT</option>
                <option value="whisper-cpp">Whisper.cpp (Local Server)</option>
                <option value="whisper-api">OpenAI Whisper API</option>
                <option value="deepgram">Deepgram Live Streaming API</option>
                <option value="gladia">Gladia Real-time STT</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. Intelligent LLM Provider Settings */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
            <Bot className="w-4 h-4 text-purple-400" />
            <span>LLM Suggestion Engine</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">LLM Provider</label>
              <select
                value={settings.llm.provider}
                onChange={(e) => updateSettings({ llm: { ...settings.llm, provider: e.target.value as LLMProviderType } })}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-slate-200"
              >
                <option value="mock">Mock Smart Generator (Built-in)</option>
                <option value="elevenlabs">ElevenLabs Conversational AI</option>
                <option value="ollama">Ollama (Local Server - Llama 3)</option>
                <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
                <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
                <option value="openrouter">OpenRouter (Unified APIs)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
