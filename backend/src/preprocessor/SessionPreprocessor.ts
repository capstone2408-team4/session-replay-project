import { RRWebEvent, ProcessedSession, NodeType } from './types.js';
import { MetaProcessor } from './processors/MetaProcessor.js';
import { FullSnapshotProcessor } from './processors/FullSnapshotProcessor.js';
import { IncrementalSnapshotProcessor } from './processors/IncrementalSnapshotProcessor.js';
import { ContextProcessor } from './processors/ContextProcessor.js';
import { NetworkProcessor } from './processors/NetworkProcessor.js';
import { ConsoleProcessor } from './processors/ConsoleProcessor.js';
import { MouseProcessor } from './processors/MouseProcessor.js';

import {
  EVENT_TYPE_NAMES,
  INCREMENTAL_SOURCE_NAMES,
} from "./types.js";

export class SessionPreprocessor {
  private metaProcessor = new MetaProcessor();
  private fullSnapshotProcessor = new FullSnapshotProcessor();
  private incrementalSnapshotProcessor = new IncrementalSnapshotProcessor();
  private contextProcessor = new ContextProcessor();
  private networkProcessor = new NetworkProcessor();
  private consoleProcessor = new ConsoleProcessor();
  private mouseProcessor = new MouseProcessor();

  private initializeProcessedSession(): ProcessedSession {
    return {
      metadata: {
        sessionId: '',
        startTime: '',
        endTime: '',
        duration: '',
      },
      events: {
        total: 0,
        byType: {},
        bySource: {},
        significant: []
      },
      technical: {
        errors: [],
        performance: {
          domUpdates: 0,
          networkRequests: 0
        },
        network: {
          requests: 0,
          failures: 0
        }
      },
      dom: {
        fullSnapshot: {
          type: NodeType.Document,
          childNodes: [],
          id: 1
        },
        incrementalSnapshots: []
      }
    };
  }

  public process(events: RRWebEvent[]) {
    if (!events || events.length === 0) {
      throw new Error('No events provided for processing');
    }

    const processed = this.initializeProcessedSession();

    try {
      // 1. Calculate timestamps and duration
      const timestamps = events.map(event => event.timestamp);
      if (timestamps.length > 0) {
        const startTime = Math.min(...timestamps);
        const endTime = Math.max(...timestamps);

        processed.metadata.startTime = new Date(startTime).toISOString();
        processed.metadata.endTime = new Date(endTime).toISOString();
        processed.metadata.duration = `${Math.floor((endTime - startTime) / 1000)} seconds`;
      }

      // 2. Meta event
      this.metaProcessor.process(events[0], processed);

      // 3. Full Snapshot event
      this.fullSnapshotProcessor.process(events[1], processed);

      // 4. Remaining events including Context
      this.processEvents(events.slice(2), processed);

    } catch (error) {
      console.error('Error processing session:', error);
      throw error;
    }

    return processed;
  }

  private processEvents(events: RRWebEvent[], processed: ProcessedSession): void {
    for (const event of events) {
      switch(event.type) {
        case 0:
          this.updateEventCounts(event, processed);
          break;
        case 1:
          this.updateEventCounts(event, processed);
          break;
        case 3:
          this.incrementalSnapshotProcessor.process(event, processed);
          break;
        case 5:
          this.updateEventCounts(event, processed);
          break;
        case 6:
          this.consoleProcessor.process(event, processed);
          break;
        case 50:
          this.networkProcessor.process(event, processed);
          break;
        case 51:
          this.contextProcessor.process(event, processed);
        default:
          continue;
      }
    }

    // Mouse frustration processing  
    this.mouseProcessor.processEvents(events, processed);
  }

  private updateEventCounts(event: RRWebEvent, session: ProcessedSession): void {
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
}