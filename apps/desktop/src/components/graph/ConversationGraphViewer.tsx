import React, { useMemo } from 'react';
import { GitGraph, User, CheckCircle2, MessageSquare } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { ConversationGraphBuilder, GraphNode, GraphEdge } from '@answer-bubble/graph';

export const ConversationGraphViewer: React.FC = () => {
  const { activeMeeting } = useAppStore();

  // Dynamically compute the conversation graph from live meeting transcripts & speaker segments
  const graphData = useMemo(() => {
    const builder = new ConversationGraphBuilder();

    if (!activeMeeting || activeMeeting.segments.length === 0) {
      return { nodes: [], edges: [], threads: [] };
    }

    activeMeeting.segments.forEach((seg) => {
      builder.processSegment(seg.speaker.name, seg.text);
    });

    const graph = builder.getGraph();

    // Group proposals and consensus dynamically
    const proposalNodes = graph.nodes.filter((n: GraphNode) => n.type === 'proposal');

    const threads = proposalNodes.map((propNode: GraphNode) => {
      const proposeEdge = graph.edges.find((e: GraphEdge) => e.targetId === propNode.id && e.relation === 'PROPOSED');
      const proposeSpeakerNode = proposeEdge ? graph.nodes.find((n: GraphNode) => n.id === proposeEdge.sourceId) : null;
      const speakerName = proposeSpeakerNode ? proposeSpeakerNode.label : 'Speaker';

      const agreementEdges = graph.edges.filter((e: GraphEdge) => e.targetId === propNode.id && e.relation === 'AGREED');
      const agreedByNames = agreementEdges
        .map((e: GraphEdge) => graph.nodes.find((n: GraphNode) => n.id === e.sourceId)?.label)
        .filter(Boolean) as string[];

      const isResolved = graph.edges.some((e: GraphEdge) => e.targetId === propNode.id && e.relation === 'RESOLVED');

      return {
        id: propNode.id,
        speaker: speakerName,
        targetText: propNode.label,
        agreedBy: agreedByNames,
        status: isResolved ? 'RESOLVED' : agreedByNames.length > 0 ? 'AGREED' : 'OPEN PROPOSAL',
      };
    });

    return { ...graph, threads };
  }, [activeMeeting]);

  if (!activeMeeting || activeMeeting.segments.length === 0) {
    return (
      <div className="glass-panel p-12 rounded-2xl border border-white/10 text-center flex flex-col items-center justify-center space-y-4">
        <GitGraph className="w-12 h-12 text-indigo-400/40 animate-pulse" />
        <h3 className="text-base font-semibold text-slate-200">No Graph Data Recorded</h3>
        <p className="text-xs text-slate-400 max-w-md">
          Start a copilot meeting to dynamically extract speaker proposals, agreements, counter-arguments, and consensus resolutions in real-time.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex items-center justify-between shadow-xl">
        <div>
          <h1 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <GitGraph className="w-5 h-5 text-indigo-400" />
            <span>Dynamic Conversation Graph & Consensus Tracker</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time DAG tracking proposals, speaker agreements, and decision resolutions from audio transcript
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-lg border border-indigo-500/30">
          <span>{graphData.nodes.length} Nodes</span>
          <span>•</span>
          <span>{graphData.edges.length} Edges</span>
        </div>
      </div>

      {/* Graph Threads Feed */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
        {graphData.threads.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl border border-white/10 text-center space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-xs text-slate-400">
              No proposal or agreement patterns detected yet in speech. Speak key proposal phrases like "I propose..." or "We should..." to build consensus nodes.
            </p>
          </div>
        ) : (
          graphData.threads.map((node: { id: string; speaker: string; targetText: string; agreedBy: string[]; status: string }) => (
            <div
              key={node.id}
              className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-indigo-500/30 transition-all space-y-3 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-slate-200">{node.speaker}</span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-mono px-2 py-0.5 rounded font-bold uppercase">
                    PROPOSED
                  </span>
                </div>

                <span
                  className={`text-[10px] font-mono px-2.5 py-0.5 rounded font-semibold ${
                    node.status === 'RESOLVED'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : node.status === 'AGREED'
                      ? 'bg-indigo-500/20 text-indigo-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  STATUS: {node.status}
                </span>
              </div>

              <p className="text-xs text-slate-100 font-medium bg-slate-900/80 p-3 rounded-xl border border-white/5">
                "{node.targetText}"
              </p>

              {node.agreedBy.length > 0 && (
                <div className="flex items-center space-x-2 text-xs text-slate-400 pt-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Consensus Agreed By:</span>
                  <div className="flex items-center space-x-1">
                    {node.agreedBy.map((person: string) => (
                      <span
                        key={person}
                        className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded font-semibold"
                      >
                        {person}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
