import { RRWebEvent, ProcessedSession } from '../types';
import { BaseProcessor } from './BaseProcessor';

interface RRWebConsoleEvent extends RRWebEvent {
  type: 6;
  data: {
    plugin: string;
    payload: {
      level: 'log' | 'info' | 'warn' | 'error';
      trace: string[];
      payload: string[];
    };
  };
  timestamp: number;
}

interface ProcessedConsoleEvent {
  timestamp: string;
  level: 'log' | 'info' | 'warn' | 'error';
  message: string;
  trace: string[];
  source?: string;
}

export class ConsoleProcessor extends BaseProcessor {
  process(event: RRWebEvent, session: ProcessedSession): void {
    if (!this.isConsoleEvent(event)) return;

    this.updateEventCounts(event, session);

    const processedEvent = this.processConsoleEvent(event);

    switch (processedEvent.level) {
      case 'error':
        this.processError(processedEvent, session);
        break;
      case 'warn':
        this.processWarning(processedEvent, session);
        break;
      case 'log':
      case 'info':
        this.processInfo(processedEvent, session);
        break;
    }
  }

  private isConsoleEvent(event: RRWebEvent): event is RRWebConsoleEvent {
    return (
      event.type === 6 && 
      event.data?.plugin === 'rrweb/console@1' &&
      event.data?.payload?.level !== undefined
    );
  }

  private processConsoleEvent(event: RRWebConsoleEvent): ProcessedConsoleEvent {
    const { level, trace, payload } = event.data.payload;
    
    return {
      timestamp: this.formatTimestamp(event.timestamp),
      level,
      message: this.cleanPayload(payload[0]),
      trace: trace,
      source: this.extractSourceFromTrace(trace)
    };
  }

  private processError(
    consoleEvent: ProcessedConsoleEvent,
    session: ProcessedSession
  ): void {
    session.technical.errors.push({
      timestamp: consoleEvent.timestamp,
      type: 'console',
      message: consoleEvent.message,
      trace: consoleEvent.trace
    });

    this.addSignificantEvent(
      { type: 6, timestamp: new Date(consoleEvent.timestamp).getTime() },
      session,
      `Console Error: ${consoleEvent.message}`,
      `Technical error${consoleEvent.source ? ` at ${consoleEvent.source}` : ''}`
    );
  }

  private processWarning(
    consoleEvent: ProcessedConsoleEvent,
    session: ProcessedSession
  ): void {
    if (this.isSignificantWarning(consoleEvent.message)) {
      this.addSignificantEvent(
        { type: 6, timestamp: new Date(consoleEvent.timestamp).getTime() },
        session,
        `Console Warning: ${consoleEvent.message}`,
        `Warning${consoleEvent.source ? ` at ${consoleEvent.source}` : ''}`
      );
    }
  }

  private processInfo(
    consoleEvent: ProcessedConsoleEvent,
    session: ProcessedSession
  ): void {
    if (this.isSignificantInfo(consoleEvent.message)) {
      this.addSignificantEvent(
        { type: 6, timestamp: new Date(consoleEvent.timestamp).getTime() },
        session,
        `Info: ${consoleEvent.message}`,
        this.getInfoImpact(consoleEvent.message)
      );
    }
  }

  private extractSourceFromTrace(trace: string[]): string | undefined {
    if (!trace || trace.length === 0) return undefined;
    
    // Get the first trace entry that's not from a library
    const relevantTrace = trace.find(line => !line.includes('node_modules'));
    if (!relevantTrace) return undefined;

    const match = relevantTrace.match(/\((.*?):(\d+):(\d+)\)/);
    if (match) {
      const [_, file, line, col] = match;
      return `${file.split('/').pop()}:${line}`;
    }
    return undefined;
  }

  private cleanPayload(payload: string): string {
    return payload.replace(/^["']|["']$/g, '').trim();
  }

  private isSignificantWarning(message: string): boolean {
    const significantPatterns = [
      /performance/i,
      /deprecated/i,
      /memory/i,
      /timeout/i,
      /failed to load/i,
      /error/i,
      /invalid/i,
      /warning/i
    ];

    return significantPatterns.some(pattern => pattern.test(message));
  }

  private isSignificantInfo(message: string): boolean {
    const significantPatterns = [
      /initialized/i,
      /loaded/i,
      /complete/i,
      /success/i,
      /started/i,
      /running/i,
      /test/i,
      /checking/i,
      /verified/i
    ];

    return significantPatterns.some(pattern => pattern.test(message));
  }

  private getInfoImpact(message: string): string {
    if (message.match(/test|running|checking/i)) {
      return 'System diagnostic activity';
    }
    if (message.match(/initialized|started/i)) {
      return 'System initialization event';
    }
    if (message.match(/complete|success/i)) {
      return 'Operation completed successfully';
    }
    return 'System state information';
  }
}