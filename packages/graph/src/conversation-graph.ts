import { ConversationGraphData, GraphNode, GraphEdge, GraphEdgeType } from './types';
import { generateId, formatTimestamp } from '@answer-bubble/shared';

export class ConversationGraphBuilder {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: GraphEdge[] = [];

  public getOrCreateNode(id: string, label: string, type: GraphNode['type']): GraphNode {
    if (this.nodes.has(id)) {
      return this.nodes.get(id)!;
    }
    const node: GraphNode = { id, label, type };
    this.nodes.set(id, node);
    return node;
  }

  public addEdge(sourceId: string, targetId: string, relation: GraphEdgeType): GraphEdge {
    const edge: GraphEdge = {
      id: generateId('edge'),
      sourceId,
      targetId,
      relation,
      timestamp: formatTimestamp(Date.now()),
    };
    this.edges.push(edge);
    return edge;
  }

  public processSegment(speakerName: string, text: string): void {
    const speakerNode = this.getOrCreateNode(`speaker_${speakerName}`, speakerName, 'speaker');

    const lower = text.toLowerCase();

    // Check for proposals
    if (lower.includes('propose') || lower.includes('should use') || lower.includes('recommend') || lower.includes('suggest')) {
      const proposalText = text.length > 50 ? text.substring(0, 47) + '...' : text;
      const proposalNode = this.getOrCreateNode(`prop_${Date.now()}`, proposalText, 'proposal');
      this.addEdge(speakerNode.id, proposalNode.id, 'PROPOSED');
    }

    // Check for agreements
    if (lower.includes('agree') || lower.includes('sounds good') || lower.includes('makes sense') || lower.includes('yes, definitely')) {
      // Find latest proposal node
      const proposals = Array.from(this.nodes.values()).filter((n) => n.type === 'proposal');
      if (proposals.length > 0) {
        const latestProposal = proposals[proposals.length - 1];
        this.addEdge(speakerNode.id, latestProposal.id, 'AGREED');
      }
    }

    // Check for resolutions / decisions
    if (lower.includes('decision') || lower.includes('we decided') || lower.includes('let\'s go with') || lower.includes('finalized')) {
      const decisionText = text.length > 50 ? text.substring(0, 47) + '...' : text;
      const decisionNode = this.getOrCreateNode(`dec_${Date.now()}`, decisionText, 'decision');
      this.addEdge(speakerNode.id, decisionNode.id, 'RESOLVED');
    }
  }

  public getGraph(): ConversationGraphData {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: this.edges,
    };
  }

  public generateMermaidDiagram(): string {
    let mermaid = 'graph TD\n';
    this.nodes.forEach((n) => {
      const shape = n.type === 'speaker' ? `((${n.label}))` : n.type === 'decision' ? `[/${n.label}/]` : `[${n.label}]`;
      mermaid += `  ${n.id}${shape}\n`;
    });
    this.edges.forEach((e) => {
      mermaid += `  ${e.sourceId} -->|${e.relation}| ${e.targetId}\n`;
    });
    return mermaid;
  }
}
