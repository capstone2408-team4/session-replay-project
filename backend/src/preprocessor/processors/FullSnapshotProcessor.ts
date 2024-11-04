import { RRWebEvent, ProcessedSession, RRWebNode, NodeType } from "../types";
import { BaseProcessor } from "./BaseProcessor";

interface RRWebFullSnapshotEvent extends RRWebEvent {
  type: 2;
  data: {
    node: RRWebNode;
    initialOffset: {
      left: number;
      top: number;
    };
  };
}

export class FullSnapshotProcessor extends BaseProcessor {
  process(event: RRWebEvent, session: ProcessedSession): void {
    if (!this.isFullSnapshotEvent(event)) return;

    this.updateEventCounts(event, session);

    const semanticEvent = event;
    this.transformNodeTypes(semanticEvent.data.node);

    session.dom.fullSnapshot = semanticEvent.data.node;

    this.addSignificantEvent(event, session, "Initial DOM snapshot captured", "Document structure initialized");
  }

  private transformNodeTypes(node: any): void {
    if (!node) return;

    // Convert numeric type to NodeType enum
    node.type = this.getNodeType(node.type);

    // Recursively transform child nodes
    if (node.childNodes) {
      node.childNodes.forEach((child: any) => {
        this.transformNodeTypes(child);
      });
    }
  }

  private getNodeType(numericType: number): NodeType {
    switch (numericType) {
      case 0:
        return NodeType.Document;
      case 1:
        return NodeType.DocumentType;
      case 2:
        return NodeType.Element;
      case 3:
        return NodeType.Text;
      case 4:
        return NodeType.CDATA;
      case 5:
        return NodeType.Comment;
      default:
        console.warn(`Unknown node type: ${numericType}`);
        return NodeType.Element; // Default fallback
    }
  }

  private isFullSnapshotEvent(event: RRWebEvent): event is RRWebFullSnapshotEvent {
    if (event) {
      return event.type === 2 && event.data?.node && event.data?.initialOffset;
    } else {
      return false;
    }
  }
}