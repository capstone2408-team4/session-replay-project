import { RRWebEvent, ProcessedSession } from "../types";

export interface EventProcessor {
  process(event: RRWebEvent, session: ProcessedSession): void;
}

// Util functions for all processors
export abstract class BaseProcessor implements EventProcessor {
  abstract process(event: RRWebEvent, session: ProcessedSession): void;

  protected formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toISOString();
  }

  protected updateEventCounts(event: RRWebEvent, session: ProcessedSession): void {
    // Update total count
    session.events.total += 1;

    // Update type count
    session.events.byType[event.type] = (session.events.byType[event.type] || 0) + 1;

    // Update source count if it's an incremental event
    if (event.type === 3 && event.data?.source !== undefined) {
      session.events.bySource[event.data.source] =
        (session.events.bySource[event.data.source] || 0) + 1;
    }
  }

  protected addSignificantEvent(
    event: RRWebEvent,
    session: ProcessedSession,
    details: string,
    impact?: string
  ): void {
    session.events.significant.push({
      timestamp: this.formatTimestamp(event.timestamp),
      type: event.type,
      details,
      impact,
    });
  }
}