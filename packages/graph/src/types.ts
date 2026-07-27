export type GraphNodeType = 'speaker' | 'proposal' | 'decision' | 'topic';
export type GraphEdgeType = 'PROPOSED' | 'AGREED' | 'DISAGREED' | 'RESOLVED' | 'MENTIONED';

export interface GraphNode {
  id: string;
  label: string;
  type: GraphNodeType;
  metadata?: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relation: GraphEdgeType;
  timestamp: string;
}

export interface ConversationGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
