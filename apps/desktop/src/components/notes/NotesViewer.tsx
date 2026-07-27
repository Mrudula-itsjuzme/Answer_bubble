import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  CheckSquare,
  Square,
  Download,
  Copy,
  Check,
  Calendar,
  UserCheck,
  AlertTriangle,
  HelpCircle,
  Clock,
  Sparkles,
  Share2,
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { MeetingNoteExporter } from '@answer-bubble/notes';

export const NotesViewer: React.FC = () => {
  const { activeMeeting, toggleActionItemStatus } = useAppStore();
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const notes = activeMeeting?.notes;

  if (!notes) {
    return (
      <div className="glass-panel p-12 rounded-2xl border border-white/10 text-center flex flex-col items-center justify-center space-y-4">
        <FileText className="w-12 h-12 text-indigo-400/40 animate-pulse" />
        <h3 className="text-base font-semibold text-slate-200">No Notes Generated Yet</h3>
        <p className="text-xs text-slate-400 max-w-md">
          Start a meeting capture or click "Generate Notes" in the dashboard to extract key decisions, action items, and executive summaries.
        </p>
      </div>
    );
  }

  const handleDownload = (format: 'md' | 'html' | 'json') => {
    let content = '';
    let type = 'text/plain';
    if (format === 'md') {
      content = MeetingNoteExporter.toMarkdown(notes);
    } else if (format === 'html') {
      content = MeetingNoteExporter.toHTML(notes);
      type = 'text/html';
    } else {
      content = MeetingNoteExporter.toJSON(notes);
      type = 'application/json';
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting_notes_${notes.meetingId}.${format}`;
    a.click();
  };

  const handleCopyMarkdown = () => {
    const md = MeetingNoteExporter.toMarkdown(notes);
    navigator.clipboard.writeText(md);
    setCopiedFormat('md');
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar space-y-6 pr-2">
      {/* Top Header Actions */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-slate-100">{notes.meetingTitle}</h1>
            <span className="bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-2.5 py-1 rounded-md uppercase">
              {notes.meetingType}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Recorded on {new Date(notes.date).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-white/10 transition-colors"
          >
            {copiedFormat === 'md' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedFormat === 'md' ? 'Copied' : 'Copy MD'}</span>
          </button>

          <button
            onClick={() => handleDownload('md')}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl transition-colors shadow-lg shadow-indigo-600/30"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Markdown</span>
          </button>

          <button
            onClick={() => handleDownload('html')}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-white/10 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export HTML / PDF</span>
          </button>
        </div>
      </div>

      {/* Grid Layout for Structured Notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          {/* Executive Summary */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Executive Summary</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">{notes.summary}</p>
          </div>

          {/* Action Items Interactive Table */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              <span>Action Items & Commitments ({notes.actionItems.length})</span>
            </h2>

            <div className="space-y-2">
              {notes.actionItems.map((act) => (
                <div
                  key={act.id}
                  onClick={() => toggleActionItemStatus(notes.meetingId, act.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between space-x-3 ${
                    act.status === 'completed'
                      ? 'bg-emerald-950/20 border-emerald-500/20 text-slate-400 line-through'
                      : 'bg-slate-900/60 border-white/5 hover:border-white/20 text-slate-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <button className="mt-0.5 text-slate-400 hover:text-emerald-400">
                      {act.status === 'completed' ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                    <div>
                      <p className="text-xs font-medium">{act.task}</p>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-1">
                        <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                          Owner: {act.owner}
                        </span>
                        <span className="text-amber-400/90 font-mono">
                          Deadline: {act.deadline}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Decisions */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <CheckSquare className="w-4 h-4 text-indigo-400" />
              <span>Key Decisions</span>
            </h2>
            <ul className="space-y-2">
              {notes.keyDecisions.map((dec, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start space-x-2">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>{dec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sidebar Info (1 col) */}
        <div className="space-y-6">
          {/* Participants */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-blue-400" />
              <span>Participants</span>
            </h2>
            <div className="space-y-2">
              {notes.participants.map((p) => (
                <div key={p.id} className="flex items-center space-x-2 text-xs text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span>{p.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Risks & Considerations */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Risks & Considerations</span>
            </h2>
            <ul className="space-y-2">
              {notes.risks.map((r, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start space-x-2">
                  <span className="text-amber-400">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Open Questions */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>Open Questions</span>
            </h2>
            <ul className="space-y-2">
              {notes.openQuestions.map((q, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start space-x-2">
                  <span className="text-cyan-400">•</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
