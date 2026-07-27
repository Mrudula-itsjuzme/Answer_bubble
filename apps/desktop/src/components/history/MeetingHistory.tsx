import React from 'react';
import { Clock, Calendar, Users, FileText, Trash2, ArrowRight } from 'lucide-react';
import { useAppStore, localStore } from '../../stores/appStore';

export const MeetingHistory: React.FC = () => {
  const { setSelectedMeetingId, setActiveView, deleteMeeting } = useAppStore();
  const meetings = localStore.getAllMeetings();

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div>
          <h1 className="text-lg font-bold text-slate-100">Meeting History & Archive</h1>
          <p className="text-xs text-slate-400">View past recorded meetings, transcripts, and notes</p>
        </div>
        <span className="text-xs font-mono bg-slate-800 text-indigo-300 px-3 py-1 rounded-lg border border-white/10">
          {meetings.length} Total Saved
        </span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
        {meetings.length > 0 ? (
          meetings.map((mtg) => (
            <div
              key={mtg.id}
              className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-indigo-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <h3 className="text-sm font-semibold text-slate-100">{mtg.title}</h3>
                  <span className="bg-indigo-500/20 text-indigo-300 text-[10px] uppercase px-2 py-0.5 rounded font-mono">
                    {mtg.meetingType}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{new Date(mtg.date).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>{mtg.participants.length} Participants</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>{mtg.segments.length} Segments</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    useAppStore.setState({ activeMeeting: mtg, selectedMeetingId: mtg.id });
                    setActiveView('notes');
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl transition-colors shadow-lg shadow-indigo-600/20"
                >
                  <span>Inspect Notes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => deleteMeeting(mtg.id)}
                  className="p-2 rounded-xl hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                  title="Delete meeting"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-panel p-12 rounded-2xl border border-white/10 text-center text-slate-400 text-xs">
            No meeting history found.
          </div>
        )}
      </div>
    </div>
  );
};
