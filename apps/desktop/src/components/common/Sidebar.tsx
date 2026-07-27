import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Search,
  History,
  Settings,
  Sparkles,
  Clock,
  GitGraph,
  Mail,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, isCapturing, settings } = useAppStore();

  const navItems = [
    { id: 'dashboard', label: 'Live Dashboard', icon: LayoutDashboard },
    { id: 'timeline', label: 'Scrubber Timeline', icon: Clock },
    { id: 'graph', label: 'Conversation Graph', icon: GitGraph },
    { id: 'followup', label: 'Follow-Up Assistant', icon: Mail },
    { id: 'notes', label: 'Meeting Notes', icon: FileText },
    { id: 'search', label: 'Memory Search', icon: Search },
    { id: 'history', label: 'Archive & History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-white/10 p-4 flex flex-col justify-between h-[calc(100vh-4rem)] select-none">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center justify-between">
          <span>Navigation</span>
          {settings.isOfflineOnly && (
            <span className="text-emerald-400 flex items-center space-x-1" title="Offline mode active">
              <ShieldCheck className="w-3 h-3" />
              <span className="text-[9px]">OFFLINE</span>
            </span>
          )}
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

      {/* Dynamic Vision & Profile Status Box */}
      <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-indigo-300 font-semibold text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="capitalize">{settings.adaptiveProfile.replace('-', ' ')}</span>
          </div>
          {settings.visionOCR && (
            <span className="text-[9px] bg-indigo-500/20 text-cyan-300 px-1.5 py-0.5 rounded flex items-center space-x-1">
              <Eye className="w-2.5 h-2.5" />
              <span>OCR ON</span>
            </span>
          )}
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          Adaptive prompts tailoring suggestions for maximum contextual clarity.
        </p>
      </div>
    </aside>
  );
};
