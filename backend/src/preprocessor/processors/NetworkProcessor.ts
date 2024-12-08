import { RRWebEvent, ProcessedSession } from '../types.js';
import { BaseProcessor } from './BaseProcessor.js';

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
  private validRequestCount: number = 0;

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

    this.incrementMapCount(this.requestCounts, urlPath);

    session.technical.performance.networkRequests += 1;
    
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

    if (latency !== undefined && !isNaN(latency)) {
      this.validRequestCount += 1;
      const currentTotal = this.latencyTotals.get(urlPath) || 0;
      this.latencyTotals.set(urlPath, currentTotal + latency);
    }

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

    session.technical.performance.networkRequests += 1;

    if (wsEvent === 'open' || wsEvent === 'message' || wsEvent === 'send') {
      this.incrementMapCount(this.requestCounts, urlPath);
    }

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
      // Only calculate if 1 or more requests have valid latency data
      averageResponseTime: this.validRequestCount > 0 ?
        totalLatency / this.validRequestCount :
        undefined
    };
  }

  private incrementMapCount(map: Map<string, number>, key: string): void {
    map.set(key, (map.get(key) || 0) + 1);
  }

  private getUrlPath(url: string): string {
    try {
      const urlObj = new URL(url);
      // Preserve query parameters
      return this.isSignificantEndpoint(urlObj.pathname) ?
        urlObj.pathname + urlObj.search :
        urlObj.pathname;
    } catch {
      // Try to extract path
      const pathMatch = url.match(/^(?:https?:\/\/[^\/]+)?([^?#]+)/);
      return pathMatch ? pathMatch[1] : url;
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