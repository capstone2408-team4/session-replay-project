import { RRWebEvent, ProcessedSession } from '../types.js';
import { BaseProcessor } from './BaseProcessor.js';

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
}

export class ConsoleProcessor extends BaseProcessor {
  process(event: RRWebEvent, session: ProcessedSession): void {
    if (!this.isConsoleEvent(event)) return;

    this.updateEventCounts(event, session);
    
    const processedEvent = this.processConsoleEvent(event);
    
    this.addSignificantEvent(
      event,
      session,
      `Console ${processedEvent.level}: ${processedEvent.message}`,
      this.deriveImpact(processedEvent)
    );

    if (processedEvent.level === 'error') {
      session.technical.errors.push({
        timestamp: processedEvent.timestamp,
        type: 'console',
        message: processedEvent.message
      });
    }
  }

  private isConsoleEvent(event: RRWebEvent): event is RRWebConsoleEvent {
    return (
      event.type === 6 && 
      event.data?.plugin === 'rrweb/console@1' &&
      event.data?.payload?.level !== undefined
    );
  }

  private processConsoleEvent(event: RRWebConsoleEvent) {
    const { level, trace, payload } = event.data.payload;
    
    return {
      timestamp: this.formatTimestamp(event.timestamp),
      level,
      message: this.assembleMessage(payload),
      location: this.extractLocation(trace)
    };
  }

  private assembleMessage(payload: string[]): string {
    if (payload.length === 0) return '';
    
    // Remove quotes from all payload items
    const cleanedPayload = payload.map(item => 
      item.replace(/^["']|["']$/g, '').trim()
    );

    if (cleanedPayload.length === 1) {
      return cleanedPayload[0];
    }

    // Handle format string messages (like React warnings)
    let message = cleanedPayload[0];
    let substitutionIndex = 1;

    return message.replace(/%s/g, () => {
      const substitution = cleanedPayload[substitutionIndex];
      substitutionIndex++;
      return substitution || '';
    });
  }

  private extractLocation(trace: string[]): string | undefined {
    if (!trace || trace.length === 0) return undefined;

    // Find the first non-library trace entry
    const appTrace = trace.find(line => 
      !line.includes('node_modules') && 
      !line.includes('webpack-internal')
    );

    if (!appTrace) return undefined;

    // Extract file and line information
    const match = appTrace.match(/(?:\((.*?):(\d+):(\d+)\))|(?:at\s+(?:.*?\s+)?\(?([^:]+):(\d+):(\d+))$/);
    if (!match) return undefined;

    const [_full, file1, line1, _groups, file2, line2] = match;
    const file = file1 || file2;
    const line = line1 || line2;

    if (!file) return undefined;

    // Extract just the filename from the path
    const fileName = file.split('/').pop();
    return `${fileName}:${line}`;
  }

  private deriveImpact(event: { level: string; message: string; location?: string }): string {
    const locationContext = event.location ? ` at ${event.location}` : '';

    switch (event.level) {
      case 'error':
        if (event.message.includes('Warning:')) {
          return `React development warning detected${locationContext} that may indicate potential issues`;
        }
        return `Application error occurred${locationContext} that requires investigation`;

      case 'warn':
        return `Warning logged${locationContext} that may need attention`;

      case 'info':
      case 'log':
        // Network related
        if (event.message.toLowerCase().includes('network')) {
          return `Network-related activity logged${locationContext}`;
        }
        // State changes
        if (this.isStateChange(event.message)) {
          return `Application state change recorded${locationContext}`;
        }
        // Tests or checks
        if (this.isTestOrCheck(event.message)) {
          return `System test or check executed${locationContext}`;
        }
        // Default for other logs
        return `Application activity recorded${locationContext}`;

      default:
        return `Console activity detected${locationContext}`;
    }
  }

  private isStateChange(message: string): boolean {
    const statePatterns = [
      /completed|finished|done|ended/i,
      /started|beginning|initializing/i,
      /changed|updated|modified/i,
      /state|status/i
    ];
    return statePatterns.some(pattern => pattern.test(message));
  }

  private isTestOrCheck(message: string): boolean {
    const testPatterns = [
      /test|check|verify|validate/i,
      /running|executing/i,
      /success|failed|completed/i
    ];
    return testPatterns.some(pattern => pattern.test(message));
  }
}