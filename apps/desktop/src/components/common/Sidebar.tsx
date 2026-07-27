import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Search,
  History,
  Settings,
  Sparkles,
  Radio,
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, isCapturing } = useAppStore();

  const navItems = [
    { id: 'dashboard', label: 'Live Dashboard', icon: LayoutDashboard },
    { id: 'notes', label: 'Meeting Notes', icon: FileText },
    { id: 'search', label: 'Memory Search', icon: Search },
    { id: 'history', label: 'Archive & History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-white/10 p-4 flex flex-col justify-between h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as any)}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
              {item.id === 'dashboard' && isCapturing && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-auto" />
              )}
            </button>
          );
        })}
      </div>

      <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/20 space-y-2">
        <div className="flex items-center space-x-2 text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Floating Overlay</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-tight">
          The assistant bubble runs on top of your meetings and presents ultra-concise suggestions (&lt;25 words).
        </p>
      </div>
    </aside>
  );
};
