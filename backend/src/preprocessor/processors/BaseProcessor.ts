import { RRWebEvent, ProcessedSession, EVENT_TYPE_NAMES, INCREMENTAL_SOURCE_NAMES } from "../types";

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

    // Update type count with named type
    const eventTypeName = EVENT_TYPE_NAMES[event.type];
    if (eventTypeName) {
      session.events.byType[eventTypeName] =
        (session.events.byType[eventTypeName] || 0) + 1;
    }

    // Update source count if it's an incremental event
    if (event.type === 3 && event.data?.source !== undefined) {
      const sourceName = INCREMENTAL_SOURCE_NAMES[event.data.source];
      if (sourceName) {
      session.events.bySource[sourceName] =
        (session.events.bySource[sourceName] || 0) + 1;
      }
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
      type: EVENT_TYPE_NAMES[event.type],
      source: event.data?.source !== undefined ?
        INCREMENTAL_SOURCE_NAMES[event.data.source] : undefined,
      details,
      impact,
    });
  }
}