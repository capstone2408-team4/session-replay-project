// Basic event types from rrweb
export interface RRWebEvent {
  type: number;
  timestamp: number;
  data: any;
}

// Core processed session structure
export interface ProcessedSession {
  metadata: SessionMetadata;
  events: EventSummary;
  technical: TechnicalData;
}

export interface SessionMetadata {
  sessionId: string;
  startTime: string;
  endTime: string;
  duration: number;
  location?: {
    city?: string;
    state?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  };
  device?: {
    os: string;
    browser: string;
    mobile: boolean;
    viewport?: {
      width: number;
      height: number;
    };
  };
  url?: string;
}

export interface EventSummary {
  total: number;
  byType: Record<number, number>;
  bySource: Record<number, number>;
  significant: SignificantEvent[];
}

export interface SignificantEvent {
  timestamp: string;
  type: number;
  source?: number;
  details: string;
  impact?: string;
}

export interface TechnicalData {
  errors: ErrorEvent[];
  performance: PerformanceMetrics;
  network: NetworkSummary;
}

export interface ErrorEvent {
  timestamp: string;
  type: 'console' | 'network' | 'javascript';
  message: string;
  count?: number;
}

export interface PerformanceMetrics {
  loadTime?: number;
  timeToInteractive?: number;
  domUpdates: number;
  networkRequests: number;
}

export interface NetworkSummary {
  requests: number;
  failures: number;
  averageResponseTime?: number;
}