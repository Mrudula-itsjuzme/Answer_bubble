import React from 'react';
import { Sliders, Mic, Cpu, Bot, Layout, Key, ShieldCheck, Check } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { STTProviderType, LLMProviderType } from '@answer-bubble/shared';

export const SettingsModal: React.FC = () => {
  const { settings, updateSettings } = useAppStore();

  return (
    <div className="h-full overflow-y-auto custom-scrollbar space-y-6 pr-2">
      <div className="pb-2 border-b border-white/10">
        <h1 className="text-lg font-bold text-slate-100">Settings & Provider Preferences</h1>
        <p className="text-xs text-slate-400">Configure native audio, Speech-to-Text providers, LLM endpoints, and overlay behavior</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Audio Capture Settings */}
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

            <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5 space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>VAD Sensitivity Threshold</span>
                <span className="font-mono">{settings.audio.vadThreshold}</span>
              </div>
              <input
                type="range"
                min="0.005"
                max="0.08"
                step="0.005"
                value={settings.audio.vadThreshold}
                onChange={(e) => updateSettings({ audio: { ...settings.audio, vadThreshold: parseFloat(e.target.value) } })}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* 2. Speech-to-Text (STT) Provider Settings */}
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
                <option value="whisper-api">OpenAI Whisper API</option>
                <option value="deepgram">Deepgram Live Streaming API</option>
                <option value="gladia">Gladia Real-time STT</option>
                <option value="whisper-cpp">Whisper.cpp (Local Server)</option>
              </select>
            </div>

            {settings.stt.provider !== 'mock' && settings.stt.provider !== 'webspeech' && (
              <div>
                <label className="block text-slate-400 mb-1">API Key / Auth Token</label>
                <input
                  type="password"
                  value={settings.stt.apiKey || ''}
                  onChange={(e) => updateSettings({ stt: { ...settings.stt, apiKey: e.target.value } })}
                  placeholder="sk-..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>
            )}
          </div>
        </div>

        {/* 3. Intelligent LLM Provider Settings */}
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
                <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
                <option value="anthropic">Anthropic (Claude 3.5 Sonnet / Haiku)</option>
                <option value="openrouter">OpenRouter (Unified APIs)</option>
                <option value="ollama">Ollama (Local Server - Llama 3)</option>
              </select>
            </div>

            {settings.llm.provider !== 'mock' && settings.llm.provider !== 'ollama' && (
              <div>
                <label className="block text-slate-400 mb-1">LLM API Key</label>
                <input
                  type="password"
                  value={settings.llm.apiKey || ''}
                  onChange={(e) => updateSettings({ llm: { ...settings.llm, apiKey: e.target.value } })}
                  placeholder="sk-..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>
            )}
          </div>
        </div>

        {/* 4. Overlay & Appearance Settings */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
            <Layout className="w-4 h-4 text-cyan-400" />
            <span>Floating Overlay & Theme</span>
          </h2>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-white/5 cursor-pointer">
              <span className="text-slate-300">Always On Top (Floating Desktop)</span>
              <input
                type="checkbox"
                checked={settings.overlay.alwaysOnTop}
                onChange={(e) =>
                  updateSettings({ overlay: { ...settings.overlay, alwaysOnTop: e.target.checked } })
                }
                className="rounded bg-slate-800 border-white/20 text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            <div>
              <label className="block text-slate-400 mb-1">Global Hotkey Shortcut</label>
              <input
                type="text"
                value={settings.overlay.shortcut}
                onChange={(e) =>
                  updateSettings({ overlay: { ...settings.overlay, shortcut: e.target.value } })
                }
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-slate-200 font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
