import React from 'react';
import { BrainCircuit, Command, Radio, Sparkles, Volume2 } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

export const Header: React.FC = () => {
  const { isCapturing, setIsCommandPaletteOpen, activeMeeting } = useAppStore();

  return (
    <header className="h-16 px-6 border-b border-white/10 glass-panel flex items-center justify-between shadow-lg">
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <BrainCircuit className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-slate-100 flex items-center space-x-2">
            <span>AnswerBubble</span>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono font-semibold">
              AI MEETING COPILOT
            </span>
          </h1>
          <p className="text-[11px] text-slate-400">Real-time desktop copilot & structured memory</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Status Indicator */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/10 text-xs">
          <div
            className={`w-2 h-2 rounded-full ${
              isCapturing ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
            }`}
          />
          <span className="text-slate-300 font-medium">
            {isCapturing ? `Listening (${activeMeeting?.meetingType})` : 'Standby'}
          </span>
        </div>

        {/* Command Palette Trigger */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-white/10 transition-colors"
        >
          <Command className="w-3.5 h-3.5" />
          <span className="font-mono text-[11px]">Cmd + K</span>
        </button>
      </div>
    </header>
  );
};
