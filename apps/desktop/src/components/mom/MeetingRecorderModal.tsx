import React, { useState, useEffect } from 'react';
import { Mic, Square, Download, FileText, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { StructuredNoteGenerator } from '@answer-bubble/notes';

export const MeetingRecorderModal: React.FC = () => {
  const { activeMeeting, isCapturing, startMeeting, stopMeeting } = useAppStore();
  const [recordTimeSeconds, setRecordTimeSeconds] = useState(0);

  useEffect(() => {
    let timer: any;
    if (isCapturing) {
      timer = setInterval(() => setRecordTimeSeconds((prev) => prev + 1), 1000);
    } else {
      setRecordTimeSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isCapturing]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainderSecs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainderSecs.toString().padStart(2, '0')}`;
  };

  const handleToggleRecord = async () => {
    if (isCapturing) {
      await stopMeeting();
    } else {
      await startMeeting('technical', 'simulation');
    }
  };

  const notes = activeMeeting?.notes;

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header Bar */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex items-center justify-between shadow-xl">
        <div>
          <h1 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <Mic className="w-5 h-5 text-indigo-400" />
            <span>Meeting Recorder & Minutes of Meeting (MoM)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Record meeting audio locally and generate formal Minutes of Meeting with decisions, action items, and transcripts
          </p>
        </div>

        {/* Start/Stop Recording Toggle Button */}
        <button
          onClick={handleToggleRecord}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg ${
            isCapturing
              ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
          }`}
        >
          {isCapturing ? (
            <>
              <Square className="w-4 h-4 fill-white" />
              <span>Stop & Generate MoM ({formatTimer(recordTimeSeconds)})</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              <span>Start Recording MoM</span>
            </>
          )}
        </button>
      </div>

      {/* Generated MoM Viewport */}
      {notes ? (
        <div className="flex-1 glass-panel p-6 rounded-2xl border border-white/10 flex flex-col space-y-4 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-slate-100">Formal Minutes of Meeting (MoM)</h2>
            </div>

            <button
              onClick={() => {
                const blob = new Blob([notes.summary], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `MoM_${notes.meetingTitle.replace(/\s+/g, '_')}.md`;
                a.click();
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600/50 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export MoM (.md)</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2 text-xs">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-2">
              <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Executive Summary</h3>
              <p className="text-slate-300 leading-relaxed">{notes.summary}</p>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-2">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">Key Decisions Made</h3>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                {notes.keyDecisions.map((dec, idx) => (
                  <li key={idx}>{dec}</li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-2">
              <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Action Items & Assignees</h3>
              <div className="space-y-1.5">
                {notes.actionItems.map((act) => (
                  <div key={act.id} className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-lg border border-white/5">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-slate-200">{act.task}</span>
                    </div>
                    <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">
                      Owner: {act.owner} (Due: {act.deadline})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 glass-panel p-12 rounded-2xl border border-white/10 text-center flex flex-col items-center justify-center space-y-4 shadow-xl">
          <Clock className="w-12 h-12 text-indigo-400/40 animate-pulse" />
          <h3 className="text-base font-semibold text-slate-200">No Active Meeting Recording</h3>
          <p className="text-xs text-slate-400 max-w-md">
            Click "Start Recording MoM" above to record system audio locally and extract Minutes of Meeting.
          </p>
        </div>
      )}
    </div>
  );
};
