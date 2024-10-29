import { RRWebEvent, ProcessedSession } from '../types';
import { BaseProcessor } from './BaseProcessor';

export class ConsoleProcessor extends BaseProcessor {
  process(event: RRWebEvent, session: ProcessedSession): void {
    // Update basic event counts
    this.updateEventCounts(event, session);

    const { level, payload } = event.data;

    // Process based on console level
    switch (level) {
      case 'error':
        this.processError(event, session);
        break;
      case 'warn':
        this.processWarning(event, session);
        break;
      case 'log':
      case 'info':
        this.processInfo(event, session);
        break;
    }
  }

  private processError(event: RRWebEvent, session: ProcessedSession): void {
    const { payload } = event.data;

    // Add to technical errors
    session.technical.errors.push({
      timestamp: this.formatTimestamp(event.timestamp),
      type: 'console',
      message: payload
    });

    // Add as significant event
    this.addSignificantEvent(
      event,
      session,
      `Console Error: ${payload}`,
      'Technical error may impact user experience'
    );
  }

  private processWarning(event: RRWebEvent, session: ProcessedSession): void {
    const { payload } = event.data;

    // Only add warnings as significant events if they match certain patterns
    if (this.isSignificantWarning(payload)) {
      this.addSignificantEvent(
        event,
        session,
        `Console Warning: ${payload}`,
        'Potential performance or user experience impact'
      );
    }
  }

  private processInfo(event: RRWebEvent, session: ProcessedSession): void {
    // Only process info logs if they contain valuable information
    if (this.isSignificantInfo(event.data.payload)) {
      this.addSignificantEvent(
        event,
        session,
        `Info: ${event.data.payload}`,
        'System state information'
      );
    }
  }

  private isSignificantWarning(payload: string): boolean {
    const significantPatterns = [
      /performance/i,
      /deprecated/i,
      /memory/i,
      /timeout/i,
      /failed to load/i
    ];

    return significantPatterns.some(pattern => pattern.test(payload));
  }

  private isSignificantInfo(payload: string): boolean {
    const significantPatterns = [
      /initialized/i,
      /loaded/i,
      /complete/i,
      /success/i,
      /started/i
    ];

    return significantPatterns.some(pattern => pattern.test(payload));
  }
}