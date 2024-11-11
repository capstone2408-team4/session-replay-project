import {
  RRWebEvent,
  ProcessedSession,
  EVENT_TYPE_NAMES,
  INCREMENTAL_SOURCE_NAMES,
  RRWebNode,
  NodeType
} from "../types.js";

interface EventProcessor {
  process?(event: RRWebEvent, session: ProcessedSession): void;
  processEvents?(events: RRWebEvent[], session: ProcessedSession): void;
}

// Util functions for all processors
export abstract class BaseProcessor implements EventProcessor {
  // Processors must implement at least one of these methods
  process?(event: RRWebEvent, session: ProcessedSession): void;
  processEvents?(events: RRWebEvent[], session: ProcessedSession): void {
    // Default implementation if process exists
    if (this.process) {
      events.forEach(event => this.process!(event, session));
    }
  }

  protected formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toISOString();
  }

  protected updateEventCounts(event: RRWebEvent, session: ProcessedSession): void {
    // Update total count
    session.events.total += 1;

    // Update type count with named type
    const eventTypeName = EVENT_TYPE_NAMES[String(event.type) as keyof typeof EVENT_TYPE_NAMES];
    if (eventTypeName) {
      session.events.byType[eventTypeName] = (session.events.byType[eventTypeName] || 0) + 1;
    }

    // Update source count if it's an incremental event
    if (event.type === 3 && event.data?.source !== undefined) {
      const sourceName = INCREMENTAL_SOURCE_NAMES[String(event.data.source) as keyof typeof INCREMENTAL_SOURCE_NAMES];
      if (sourceName) {
      session.events.bySource[sourceName] = (session.events.bySource[sourceName] || 0) + 1;
      }
    }
  }

  protected addSignificantEvent(
    event: RRWebEvent,
    session: ProcessedSession,
    details: string,
    impact?: string,
    detailsExtension?: string
  ): void {
    const eventType = this.getDetailedEventType(event, detailsExtension);
    const sessionStartTime = new Date(session.metadata.startTime).getTime();
    const elapsedSeconds = Math.round((event.timestamp - sessionStartTime) / 1000);

    session.events.significant.push({
      timestamp: this.formatTimestamp(event.timestamp),
      type: eventType,
      details,
      when: `${elapsedSeconds} seconds into the session`,
      impact,
    });
  }

  // protected getNodeById(id: number, session: ProcessedSession): RRWebNode | null {
  //   return session.dom?.allNodes?.find(node => node.id === id) || null;
  // }

  protected getDetailedEventType(event: RRWebEvent, details?: string): string {
    let type = EVENT_TYPE_NAMES[String(event.type) as keyof typeof EVENT_TYPE_NAMES] || 'Unknown Event';

    if (event.type === 3 && event.data?.source !== undefined) {
      type = INCREMENTAL_SOURCE_NAMES[String(event.data.source) as keyof typeof INCREMENTAL_SOURCE_NAMES] || 'Unknown Source';

      if (details) {
        if (event.data.source === 0) type = `DOM Mutation: ${details}`;
        if (event.data.source === 1) type = `Mouse Movement: ${details}`;
        if (event.data.source === 2) type = `Mouse Click: ${details}`;
        if (event.data.source === 3) type = `Scroll: ${details}`;
        if (event.data.source === 4) type = `Viewport Resize: ${details}`;
        if (event.data.source === 5) type = `Input Change: ${details}`;
        if (event.data.source === 6) type = `Touch Movement: ${details}`;
        if (event.data.source === 7) type = `Media Interaction: ${details}`;
        if (event.data.source === 8) type = `Style Sheet Rule: ${details}`;
        if (event.data.source === 9) type = `Canvas Mutation: ${details}`;
        if (event.data.source === 10) type = `Font Load: ${details}`;
        if (event.data.source === 11) type = `Log: ${details}`;
        if (event.data.source === 12) type = `Drag and Drop: ${details}`;
        if (event.data.source === 13) type = `Style Declaration: ${details}`;
        if (event.data.source === 14) type = `Selection: ${details}`;
        if (event.data.source === 15) type = `Adopted Stylesheet: ${details}`;
      }
    }

    if (event.type === 50) {
      if (event.data.error) {
        type = `${event.data.method} Request Failed (${event.data.status})`;
      } else if (event.data.event === 'open') {
        type = 'WebSocket Connection Opened';
      } else {
        type = `${event.data.method} Request (${event.data.status})`;
      }
    }

    return type;
  }

  protected getNodeDescription(node: RRWebNode): string {
    if (!node) return 'unknown element';
  
    // For Element nodes (type 2)
    if (node.type === NodeType.Element) {
      const tag = node.tagName?.toLowerCase() || 'unknown';
      const id = node.attributes?.id ? `#${node.attributes.id}` : '';
      const className = node.attributes?.class ? `.${node.attributes.class.replace(/\s+/g, '.')}` : '';
      
      // Special handling for semantic elements
      switch (tag) {
        case 'button':
          return `button "${this.getButtonText(node)}"`;
        case 'input':
          return this.getInputDescription(node);
        case 'form':
          return `form${id}${className}`;
        case 'nav':
          return 'navigation section';
        case 'header':
          return 'page header';
        case 'footer':
          return 'page footer';
        case 'dialog':
          return 'modal dialog';
        case 'article':
          return 'content article';
        case 'section':
          return `section${id}${className}`;
        default:
          return `${tag}${id}${className}`;
      }
    }
    
    // For Text nodes (type 3)
    if (node.type === NodeType.Text) {
      const text = node.textContent?.trim();
      if (!text) return 'empty text node';
      return `text "${text.length > 20 ? text.substring(0, 20) + '...' : text}"`;
    }
    
    // For Document nodes (type 0)
    if (node.type === NodeType.Document) return 'document';
  
    // For DocumentType nodes (type 1)
    if (node.type === NodeType.DocumentType) return 'doctype';
    
    return `node type ${node.type}`;
  }

  private getButtonText(node: RRWebNode): string {
    // Look for text content in button's children
    const textNode = node.childNodes?.find(child => 
      child.type === NodeType.Text && child.textContent?.trim()
    );
    return textNode?.textContent?.trim() || 'unnamed button';
  }

  private getInputDescription(node: RRWebNode): string {
    const type = node.attributes?.type || 'text';
    const name = node.attributes?.name ? ` name="${node.attributes.name}"` : '';
    const placeholder = node.attributes?.placeholder ? 
      ` placeholder="${node.attributes.placeholder}"` : '';
    return `${type} input${name}${placeholder}`;
  }
}