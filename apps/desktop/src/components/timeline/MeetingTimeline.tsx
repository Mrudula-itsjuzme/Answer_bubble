import React, { useState } from 'react';
import { Clock, Play, Sparkles, CheckSquare, MessageSquare, Eye, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

export const MeetingTimeline: React.FC = () => {
  const { activeMeeting, setActiveView } = useAppStore();
  const [selectedTimestamp, setSelectedTimestamp] = useState<string | null>(null);

  if (!activeMeeting || activeMeeting.segments.length === 0) {
    return (
      <div className="glass-panel p-12 rounded-2xl border border-white/10 text-center flex flex-col items-center justify-center space-y-4">
        <Clock className="w-12 h-12 text-indigo-400/40 animate-pulse" />
        <h3 className="text-base font-semibold text-slate-200">No Timeline Data Recorded</h3>
        <p className="text-xs text-slate-400 max-w-md">
          Start a copilot meeting to record real-time speech segments, decision markers, action items, and screen OCR keyframes on an interactive timeline.
        </p>
      </div>
    );
  }

  const segments = activeMeeting.segments;
  const decisions = activeMeeting.notes?.keyDecisions || [];
  const actionItems = activeMeeting.actionItems || [];

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header Bar */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex items-center justify-between shadow-xl">
        <div>
          <h1 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <span>Interactive Meeting Scrubber Timeline</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Scrub through speech events, key decisions, commitments, and visual OCR frame snapshots
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono bg-slate-900 px-3 py-1.5 rounded-xl border border-white/10">
          <span className="text-slate-400">Total Duration:</span>
          <span className="text-emerald-400 font-bold">{Math.round(activeMeeting.durationSeconds / 60)}m {activeMeeting.durationSeconds % 60}s</span>
        </div>
      </div>

      {/* Visual Timeline Scrubber Axis */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6 shadow-xl">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>00:00 (Start)</span>
          <span>Timeline Events: {segments.length + decisions.length + actionItems.length}</span>
          <span>{segments[segments.length - 1]?.timestamp || 'End'}</span>
        </div>

        {/* Timeline Bar Track */}
        <div className="relative w-full h-4 bg-slate-900 rounded-full border border-white/10 flex items-center px-2">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/30 via-purple-600/30 to-emerald-600/30 rounded-full" />

          {/* Event Pins on Track */}
          {segments.map((seg, idx) => {
            const percent = ((idx + 1) / segments.length) * 96;
            return (
              <button
                key={seg.id}
                onClick={() => setSelectedTimestamp(seg.timestamp)}
                className={`absolute w-3 h-3 rounded-full transition-transform hover:scale-150 ${
                  selectedTimestamp === seg.timestamp
                    ? 'bg-amber-400 ring-4 ring-amber-400/30 z-20'
                    : 'bg-indigo-400 hover:bg-white z-10'
                }`}
                style={{ left: `${percent}%` }}
                title={`[${seg.timestamp}] ${seg.speaker.name}: ${seg.text.substring(0, 30)}...`}
              />
            );
          })}
        </div>

        {/* Timeline Key Legend */}
        <div className="flex items-center justify-center space-x-6 text-xs text-slate-400 pt-2">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
            <span>Speech Event</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Action Commitment</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Key Decision</span>
          </div>
        </div>
      </div>

      {/* Timeline Event Feed Stream */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
        {segments.map((seg) => (
          <div
            key={seg.id}
            className={`glass-panel p-4 rounded-xl border transition-all flex items-start justify-between space-x-4 ${
              selectedTimestamp === seg.timestamp
                ? 'border-indigo-500 bg-indigo-950/40 shadow-lg'
                : 'border-white/10 hover:border-white/20 bg-slate-900/60'
            }`}
          >
            <div className="flex items-start space-x-3">
              <span className="text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">
                {seg.timestamp}
              </span>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.speaker.color }} />
                  <span className="text-xs font-semibold text-slate-200">{seg.speaker.name}</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">{seg.text}</p>
              </div>
            </div>

            <button
              onClick={() => setActiveView('dashboard')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 font-medium"
            >
              <span>Jump</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
