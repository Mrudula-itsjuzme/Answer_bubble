import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Radio,
  Play,
  Square,
  Sparkles,
  User,
  Clock,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileText,
  Copy,
  Brain,
  Volume2,
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { MeetingType } from '@answer-bubble/shared';

export const LiveMeetingDashboard: React.FC = () => {
  const {
    isCapturing,
    audioLevel,
    isSpeaking,
    activeMeeting,
    startMeeting,
    stopMeeting,
    setMeetingType,
    currentSuggestions,
    generateCurrentNotes,
    setActiveView,
  } = useAppStore();

  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [activeMeeting?.segments]);

  const meetingTypes: { key: MeetingType; label: string; desc: string }[] = [
    { key: 'technical', label: 'Technical Discussion', desc: 'Focus on architecture, caching, quantization' },
    { key: 'interview', label: 'Interview', desc: 'Prioritize concise STAR format answers' },
    { key: 'client', label: 'Client Meeting', desc: 'Professional, SLA & compliance responses' },
    { key: 'standup', label: 'Standup', desc: 'Brief updates & blocker resolutions' },
    { key: 'brainstorm', label: 'Brainstorm', desc: 'Creative, innovative idea generation' },
    { key: 'lecture', label: 'Lecture', desc: 'Note generation focus without suggestions' },
  ];

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Top Controller Bar */}
      <div className="glass-panel p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4 border border-white/10 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => (isCapturing ? stopMeeting() : startMeeting(activeMeeting?.meetingType || 'technical', 'simulation'))}
              className={`flex items-center space-x-3 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg ${
                isCapturing
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-600/30'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/30'
              }`}
            >
              {isCapturing ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>Stop Capture</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Copilot</span>
                </>
              )}
            </button>
          </div>

          {/* Audio Signal Level Bar */}
          <div className="flex items-center space-x-3 bg-slate-900/60 px-4 py-2.5 rounded-xl border border-white/10">
            <Radio className={`w-4 h-4 ${isCapturing ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                {isCapturing ? 'Audio Feed' : 'Inactive'}
              </span>
              <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-75"
                  style={{ width: `${Math.min(100, Math.max(5, audioLevel * 100))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Meeting Mode Selector Dropdown */}
        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-400 font-medium">Meeting Mode:</span>
          <select
            value={activeMeeting?.meetingType || 'technical'}
            onChange={(e) => setMeetingType(e.target.value as MeetingType)}
            className="bg-slate-900 border border-white/10 text-xs text-indigo-300 font-semibold py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            {meetingTypes.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>

          {activeMeeting && (
            <button
              onClick={() => {
                generateCurrentNotes();
                setActiveView('notes');
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-white/10 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Generate Notes</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Transcript & Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[480px]">
        {/* Real-time Streaming Transcript Panel (2 cols) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-white/10 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <Mic className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                Live Speech Transcript
              </h2>
            </div>
            <span className="text-xs font-mono bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-md">
              {activeMeeting?.segments.length || 0} Segments Recorded
            </span>
          </div>

          <div
            ref={transcriptContainerRef}
            className="flex-1 overflow-y-auto custom-scrollbar my-4 space-y-4 pr-2 max-h-[500px]"
          >
            {activeMeeting?.segments && activeMeeting.segments.length > 0 ? (
              activeMeeting.segments.map((seg) => (
                <motion.div
                  key={seg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: seg.speaker?.color || '#3B82F6' }}
                      />
                      <span className="text-xs font-semibold text-slate-200">{seg.speaker?.name}</span>
                      {seg.speaker?.isUser && (
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{seg.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pl-4 border-l-2 border-slate-700">
                    {seg.text}
                  </p>
                </motion.div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-3">
                <Radio className="w-8 h-8 text-indigo-500/40 animate-pulse" />
                <p className="text-xs">No active transcript stream. Click "Start Copilot" above to begin real-time speech capture.</p>
              </div>
            )}
          </div>
        </div>

        {/* Live Floating Suggestion Sidebar Card (1 col) */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col justify-between shadow-xl bg-gradient-to-b from-slate-900/80 to-slate-950/80">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                Copilot Suggestions
              </h2>
            </div>
            <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded font-mono">
              Max 25 Words
            </span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar my-4 space-y-3 pr-1">
            <AnimatePresence>
              {currentSuggestions.length > 0 ? (
                currentSuggestions.map((sug) => (
                  <motion.div
                    key={sug.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 rounded-xl bg-gradient-to-tr from-indigo-950/40 to-slate-900/60 border border-indigo-500/30 text-xs text-slate-100 space-y-2 shadow-lg"
                  >
                    <div className="flex items-center justify-between text-[10px] text-indigo-300/80 font-mono">
                      <span>{sug.timestamp}</span>
                      <span>{sug.wordCount} words</span>
                    </div>
                    <p className="font-medium leading-relaxed">{sug.text}</p>
                  </motion.div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                  <Brain className="w-8 h-8 text-indigo-400/30" />
                  <p className="text-xs">Suggestions appear automatically when questions or key decisions are detected in speech.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
