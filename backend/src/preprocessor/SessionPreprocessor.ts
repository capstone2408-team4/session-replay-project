import {
  RRWebEvent,
  ProcessedSession,
  SessionMetadata,
  EventSummary,
  TechnicalData
} from './types';

export class SessionPreprocessor {
  private initializeProcessedSession(): ProcessedSession {
    return {
      metadata: {
        sessionId: '',
        startTime: '',
        endTime: '',
        duration: 0,
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
      }
    };
  }

  public process(events: RRWebEvent[]): ProcessedSession {
    if (!events || events.length === 0) {
      throw new Error('No events provided for processing');
    }

    // Initialize processed session
    const processed = this.initializeProcessedSession();

    try {
      // Calculate basic metadata
      this.processMetadata(events, processed);

      // Process all events
      this.processEvents(events, processed);

    } catch (error) {
      console.error('Error processing session:', error);
      throw error;
    }
  }

  private processMetadata(events: RRWebEvent[], processed: ProcessedSession): void {
    // Find first and last timestamps
    const timestamps = events.map(event => event.timestamp);
    const startTime = Math.min(...timestamps);
    const endTime = Math.max(...timestamps);

    processed.metadata.startTime = new Date(startTime).toISOString();
    processed.metadata.endTime = new Date(endTime).toISOString();
    processed.metadata.duration = endTime - startTime;

    // Look for session context event (type 51)
    const contextEvent = events.find(event => event.type === 51);
    if (contextEvent) {
      this.processContextEvent(contextEvent, processed);
    }
  }

  private processContextEvent(event: RRWebEvent, processed: ProcessedSession): void {
    if (event.data) {
      processed.metadata.sessionId = event.data.sessionId || '';

      if (event.data.geo) {
        processed.metadata.location = {
          city: event.data.geo.city || '',
          state: event.data.geo.state || '',
          country: event.data.geo.country || '',
          latitude: event.data.geo.latitude || 0,
          longitude: event.data.geo.longitude || 0,
          timezone: event.data.geo.timezone || ''
        };
      }

      if (event.data.userAgent) {
        processed.metadata.device = {
          os: event.data.userAgent.platform || '',
          browser: event.data.userAgent.browser || '',
          mobile: event.data.userAgent.mobile || false
        };
      }

      processed.metadata.url = event.data.url || '';
    }
  }

  private getBrowserInfo(userAgent: any): string {
    if (!userAgent.brands) return 'Unknown';

    const brand = userAgent.brands[0];

    return brand ? brand.brand + ' ' + brand.version : 'Unknown';
  }

  private processEvents(events: RRWebEvent[], processed: ProcessedSession): void {
    
  }
}