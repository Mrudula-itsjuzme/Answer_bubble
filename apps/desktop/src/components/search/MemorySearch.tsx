import React from 'react';
import { Search, Sparkles, MessageSquare, CheckSquare, Calendar, User } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

export const MemorySearch: React.FC = () => {
  const { searchQuery, searchResults, setSearchQuery } = useAppStore();

  const exampleQueries = [
    'What did John promise last week?',
    'What did we decide about authentication?',
    'How to reduce inference cost?',
    'Quantization benchmarks',
  ];

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Search Input Bar */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-3.5 text-indigo-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search meetings: e.g. 'What did John promise last week?' or 'quantization'..."
            className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        {/* Preset Query Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-400 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Try searching:</span>
          </span>
          {exampleQueries.map((q) => (
            <button
              key={q}
              onClick={() => setSearchQuery(q)}
              className="text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-lg border border-white/5 transition-colors"
            >
              "{q}"
            </button>
          ))}
        </div>
      </div>

      {/* Search Results List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
        {searchResults.length > 0 ? (
          searchResults.map((res, index) => (
            <div
              key={index}
              className="glass-panel p-4 rounded-xl border border-white/10 hover:border-indigo-500/30 transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {res.type === 'action_item' && <CheckSquare className="w-4 h-4 text-emerald-400" />}
                  {res.type === 'transcript' && <MessageSquare className="w-4 h-4 text-indigo-400" />}
                  {res.type === 'decision' && <Sparkles className="w-4 h-4 text-amber-400" />}
                  <span className="text-xs font-semibold text-slate-200">{res.meetingTitle}</span>
                </div>
                <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>{new Date(res.date).toLocaleDateString()}</span>
                  <span className="bg-indigo-500/10 text-indigo-300 px-1.5 py-0.5 rounded">
                    Score: {Math.round(res.score * 100)}%
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-white/5 text-xs text-slate-300">
                <p className="italic">{res.highlightSnippet}</p>
              </div>

              {res.speakerName && (
                <div className="flex items-center space-x-1 text-[10px] text-slate-400">
                  <User className="w-3 h-3 text-indigo-400" />
                  <span>Speaker: {res.speakerName}</span>
                </div>
              )}
            </div>
          ))
        ) : searchQuery ? (
          <div className="glass-panel p-12 rounded-2xl border border-white/10 text-center text-slate-400 text-xs">
            No matching memory results found for "{searchQuery}".
          </div>
        ) : (
          <div className="glass-panel p-12 rounded-2xl border border-white/10 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
            <Search className="w-8 h-8 text-indigo-400/30" />
            <p>Type a question above to perform natural language hybrid search across past meeting transcripts, commitments, and decisions.</p>
          </div>
        )}
      </div>
    </div>
  );
};
