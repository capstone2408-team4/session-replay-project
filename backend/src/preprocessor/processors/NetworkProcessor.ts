import { RRWebEvent, ProcessedSession } from '../types';
import { BaseProcessor } from './BaseProcessor';

interface RRWebNetworkEvent extends RRWebEvent {
  type: 50;
  data: {
    type: 'FETCH' | 'XHR' | 'WebSocket';
    url: string;
    status?: number;
    method?: string;
    requestMadeAt?: number;
    responseReceivedAt?: number;
    latency?: number;
    error?: string;
    event?: 'open' | 'message' | 'close' | 'error' | 'send';
    message?: string;
    code?: number;
    reason?: string;
  };
  timestamp: number;
}

export class NetworkProcessor extends BaseProcessor {
  private requestCounts: Map<string, number> = new Map();
  private failureCounts: Map<string, number> = new Map();
  private latencyTotals: Map<string, number> = new Map();

  process(event: RRWebEvent, session: ProcessedSession): void {
    if (!this.isNetworkEvent(event)) return;

    this.updateEventCounts(event, session);
    
    switch (event.data.type) {
      case 'FETCH':
      case 'XHR':
        this.processHttpRequest(event, session);
        break;
      case 'WebSocket':
        this.processWebSocket(event, session);
        break;
    }

    this.updateNetworkStats(session);
  }

  private isNetworkEvent(event: RRWebEvent): event is RRWebNetworkEvent {
    return event.type === 50 && 
           event.data?.type !== undefined &&
           ['FETCH', 'XHR', 'WebSocket'].includes(event.data.type);
  }

  private processHttpRequest(event: RRWebNetworkEvent, session: ProcessedSession): void {
    const { url, status, method, error, latency } = event.data;
    const urlPath = this.getUrlPath(url);

    // Update request counts
    this.incrementMapCount(this.requestCounts, urlPath);
    
    if (error || (status && status >= 400)) {
      this.incrementMapCount(this.failureCounts, urlPath);
      
      this.addSignificantEvent(
        event,
        session,
        `Failed ${method || 'HTTP'} request to ${urlPath}: ${error || `Status ${status}`}`,
        'Network request failure may impact functionality'
      );

      session.technical.errors.push({
        timestamp: this.formatTimestamp(event.timestamp),
        type: 'network',
        message: `${method || 'HTTP'} request to ${urlPath} failed: ${error || `Status ${status}`}`
      });
    }

    // Track latency for performance metrics
    if (latency) {
      const currentTotal = this.latencyTotals.get(urlPath) || 0;
      this.latencyTotals.set(urlPath, currentTotal + latency);
    }

    // Track potentially significant successful requests
    if (status && status >= 200 && status < 300 && this.isSignificantEndpoint(urlPath)) {
      this.addSignificantEvent(
        event,
        session,
        `Successful ${method || 'HTTP'} request to ${urlPath}`,
        'Key application interaction'
      );
    }
  }

  private processWebSocket(event: RRWebNetworkEvent, session: ProcessedSession): void {
    const { url, event: wsEvent, code, reason } = event.data;
    const urlPath = this.getUrlPath(url);

    switch (wsEvent) {
      case 'open':
        this.addSignificantEvent(
          event,
          session,
          `WebSocket connection opened to ${urlPath}`,
          'Real-time communication established'
        );
        break;

      case 'error':
      case 'close':
        if (wsEvent === 'error' || (code && code !== 1000)) {
          this.incrementMapCount(this.failureCounts, urlPath);
          
          const detail = reason ? `: ${reason}` : '';
          this.addSignificantEvent(
            event,
            session,
            `WebSocket ${wsEvent} for ${urlPath}${detail}`,
            'Real-time communication interrupted'
          );

          session.technical.errors.push({
            timestamp: this.formatTimestamp(event.timestamp),
            type: 'network',
            message: `WebSocket ${wsEvent} for ${urlPath}${detail}`
          });
        }
        break;
    }
  }

  private updateNetworkStats(session: ProcessedSession): void {
    const totalRequests = Array.from(this.requestCounts.values())
      .reduce((sum, count) => sum + count, 0);
    
    const totalFailures = Array.from(this.failureCounts.values())
      .reduce((sum, count) => sum + count, 0);
    
    const totalLatency = Array.from(this.latencyTotals.values())
      .reduce((sum, latency) => sum + latency, 0);
    
    session.technical.network = {
      requests: totalRequests,
      failures: totalFailures,
      averageResponseTime: totalRequests ? totalLatency / totalRequests : undefined
    };
  }

  private incrementMapCount(map: Map<string, number>, key: string): void {
    map.set(key, (map.get(key) || 0) + 1);
  }

  private getUrlPath(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname;
    } catch {
      return url; // Return original if parsing fails
    }
  }

  private isSignificantEndpoint(path: string): boolean {
    const significantPatterns = [
      /^\/api\/v\d+\//i,    // API version endpoints
      /\/(auth|login|logout)/i,  // Auth-related
      /\/upload/i,          // File uploads
      /\/webhook/i,         // Webhooks
      /\/subscribe/i,       // Subscriptions
      /\/payment/i,         // Payment endpoints
    ];

    return significantPatterns.some(pattern => pattern.test(path));
  }
}