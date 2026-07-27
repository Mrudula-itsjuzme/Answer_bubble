import React, { useEffect, useState } from 'react';
import { Search, Play, Square, FileText, Settings, History, Sparkles, X } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setActiveView,
    isCapturing,
    startMeeting,
    stopMeeting,
  } = useAppStore();

  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const actions = [
    {
      id: 'toggle-copilot',
      label: isCapturing ? 'Stop Copilot Capture' : 'Start Copilot Meeting',
      icon: isCapturing ? Square : Play,
      color: isCapturing ? 'text-red-400' : 'text-emerald-400',
      perform: () => (isCapturing ? stopMeeting() : startMeeting('technical', 'simulation')),
    },
    {
      id: 'nav-dashboard',
      label: 'Go to Live Meeting Dashboard',
      icon: Sparkles,
      color: 'text-indigo-400',
      perform: () => setActiveView('dashboard'),
    },
    {
      id: 'nav-notes',
      label: 'Go to Structured Meeting Notes',
      icon: FileText,
      color: 'text-amber-400',
      perform: () => setActiveView('notes'),
    },
    {
      id: 'nav-search',
      label: 'Search Past Meeting Memory',
      icon: Search,
      color: 'text-cyan-400',
      perform: () => setActiveView('search'),
    },
    {
      id: 'nav-history',
      label: 'View Meeting Archive History',
      icon: History,
      color: 'text-blue-400',
      perform: () => setActiveView('history'),
    },
    {
      id: 'nav-settings',
      label: 'Open Settings & Preferences',
      icon: Settings,
      color: 'text-purple-400',
      perform: () => setActiveView('settings'),
    },
  ];

  const filteredActions = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 p-4">
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-indigo-500/30 overflow-hidden shadow-2xl bg-slate-950/90 text-slate-100">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <Search className="w-5 h-5 text-indigo-400" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search..."
              className="bg-transparent border-none text-sm text-slate-100 placeholder-slate-500 focus:outline-none w-full"
            />
          </div>
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-2 space-y-1 max-h-72 overflow-y-auto custom-scrollbar">
          {filteredActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => {
                  action.perform();
                  setIsCommandPaletteOpen(false);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-indigo-600/20 text-xs font-medium text-slate-200 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${action.color}`} />
                  <span>{action.label}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">⌘K</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
