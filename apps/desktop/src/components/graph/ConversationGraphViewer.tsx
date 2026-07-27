import React from 'react';
import { GitGraph, User, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

export const ConversationGraphViewer: React.FC = () => {
  const { activeMeeting } = useAppStore();

  const mockGraphData = [
    {
      id: 'n1',
      speaker: 'Alex (Tech Lead)',
      action: 'PROPOSED',
      nodeType: 'proposal',
      targetText: 'Adopt Redis caching layer to lower endpoint latency below 200ms',
      agreedBy: ['Sarah (ML Engineer)', 'John (DevOps)'],
      status: 'RESOLVED',
    },
    {
      id: 'n2',
      speaker: 'Sarah (ML Engineer)',
      action: 'PROPOSED',
      nodeType: 'proposal',
      targetText: 'Use FP16 to INT8 post-training quantization for 3x speedup',
      agreedBy: ['Alex (Tech Lead)'],
      status: 'AGREED',
    },
    {
      id: 'n3',
      speaker: 'John (DevOps)',
      action: 'PROPOSED',
      nodeType: 'proposal',
      targetText: 'Deploy Whisper.cpp local inference server on dedicated GPU worker',
      agreedBy: ['Alex (Tech Lead)', 'Sarah (ML Engineer)'],
      status: 'RESOLVED',
    },
  ];

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex items-center justify-between shadow-xl">
        <div>
          <h1 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <GitGraph className="w-5 h-5 text-indigo-400" />
            <span>Conversation Graph & Consensus Tracker</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Tracks proposals, speaker agreements, counter-arguments, and finalized decisions
          </p>
        </div>

        <span className="text-xs font-mono bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-lg border border-indigo-500/30">
          {mockGraphData.length} Graph Threads
        </span>
      </div>

      {/* Graph Visual Nodes Container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
        {mockGraphData.map((node) => (
          <div
            key={node.id}
            className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-indigo-500/30 transition-all space-y-3 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-slate-200">{node.speaker}</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-mono px-2 py-0.5 rounded font-bold uppercase">
                  {node.action}
                </span>
              </div>

              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2.5 py-0.5 rounded font-semibold">
                STATUS: {node.status}
              </span>
            </div>

            <p className="text-xs text-slate-100 font-medium bg-slate-900/80 p-3 rounded-xl border border-white/5">
              "{node.targetText}"
            </p>

            <div className="flex items-center space-x-2 text-xs text-slate-400 pt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Consensus Agreed By:</span>
              <div className="flex items-center space-x-1">
                {node.agreedBy.map((person) => (
                  <span
                    key={person}
                    className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded font-semibold"
                  >
                    {person}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
