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
  HelpCircle,
  Zap,
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
          <div className="flex items-center space-x-2">
            <button
              onClick={() => (isCapturing ? stopMeeting() : startMeeting(activeMeeting?.meetingType || 'technical', 'real'))}
              className={`flex items-center space-x-3 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg ${
                isCapturing
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-600/30'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
              }`}
            >
              {isCapturing ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>Stop Real GMeet Capture</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Real GMeet / Mic</span>
                </>
              )}
            </button>

            {!isCapturing && (
              <button
                onClick={() => startMeeting(activeMeeting?.meetingType || 'technical', 'simulation')}
                className="px-4 py-3.5 rounded-xl font-medium text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-white/10 flex items-center space-x-2"
                title="Run simulated sample meeting stream"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Demo Simulation</span>
              </button>
            )}
          </div>

          {/* Audio Signal Level Bar */}
          <div className="flex items-center space-x-3 bg-slate-900/60 px-4 py-2.5 rounded-xl border border-white/10">
            <Radio className={`w-4 h-4 ${isCapturing ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                {isCapturing ? 'Real-Time Audio Feed' : 'Inactive'}
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
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono bg-purple-500/10 text-purple-300 px-2.5 py-1 rounded-md border border-purple-500/20">
                {activeMeeting?.segments.filter((s) => s.isQuestion).length || 0} Questions Detected
              </span>
              <span className="text-xs font-mono bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-md">
                {activeMeeting?.segments.length || 0} Segments
              </span>
            </div>
          </div>

          {isCapturing && (
            <div className="mt-3 px-4 py-2 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between text-xs text-indigo-200">
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-indigo-400 animate-pulse shrink-0" />
                <span>
                  <strong>Google Meet Multi-Speaker Tip:</strong> In Chrome's popup, pick <em>"Chrome Tab"</em> and check <strong>"Share tab audio"</strong> at bottom left to transcribe all participants!
                </span>
              </div>
            </div>
          )}

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
                  className={`p-3.5 rounded-xl border transition-all ${
                    seg.isQuestion
                      ? 'bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900/60 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                      : 'bg-slate-900/60 border-white/5 hover:border-white/10'
                  }`}
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
                      {seg.isQuestion && (
                        <span className="text-[10px] bg-purple-500/25 text-purple-200 border border-purple-400/40 px-2 py-0.5 rounded-full font-mono font-bold flex items-center space-x-1 animate-pulse">
                          <HelpCircle className="w-3 h-3 text-purple-300" />
                          <span>QUESTION DETECTED • {seg.questionCategory?.toUpperCase() || 'GENERAL'}</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{seg.timestamp}</span>
                  </div>
                  <p className={`text-xs leading-relaxed pl-4 border-l-2 ${seg.isQuestion ? 'text-purple-100 font-medium border-purple-500' : 'text-slate-300 border-slate-700'}`}>
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

        {/* Live Instant Q&A Answers Sidebar Card (1 col) */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col justify-between shadow-xl bg-gradient-to-b from-slate-900/80 to-slate-950/80">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
              <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                Instant Q&A Copilot
              </h2>
            </div>
            <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded font-mono">
              Real-Time Answers
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
                    className="p-4 rounded-xl bg-gradient-to-tr from-indigo-950/50 via-purple-950/30 to-slate-900/80 border border-indigo-500/40 text-xs text-slate-100 space-y-2.5 shadow-lg"
                  >
                    {sug.triggeredByQuestion && (
                      <div className="text-[11px] text-purple-200 bg-purple-950/60 p-2.5 rounded-lg border border-purple-500/30 font-medium flex flex-col space-y-1">
                        <div className="flex items-center justify-between text-[9px] uppercase font-mono text-purple-300">
                          <span>Identified Question</span>
                          {sug.questionCategory && <span>{sug.questionCategory}</span>}
                        </div>
                        <p className="italic text-slate-200">"{sug.triggeredByQuestion}"</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[10px] text-indigo-300/80 font-mono">
                      <span className="flex items-center space-x-1 text-emerald-400">
                        <Sparkles className="w-3 h-3" />
                        <span>Instant Answer</span>
                      </span>
                      <span>{sug.wordCount} words • {sug.timestamp}</span>
                    </div>
                    <p className="font-semibold text-slate-100 leading-relaxed text-sm bg-slate-950/40 p-2.5 rounded-lg border border-indigo-500/20">{sug.text}</p>
                  </motion.div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                  <Brain className="w-8 h-8 text-indigo-400/30 animate-pulse" />
                  <p className="text-xs">Listening to meeting speech... Questions and instant answers pop up automatically in real-time.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
