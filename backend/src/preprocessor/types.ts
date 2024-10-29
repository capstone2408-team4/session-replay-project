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
  byType: Partial<Record<EventTypeName, number>>;
  bySource: Partial<Record<IncrementalSourceName, number>>;
  significant: SignificantEvent[];
}

export interface SignificantEvent {
  timestamp: string;
  type: EventTypeName;
  source?: IncrementalSourceName;
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

// Event types
export const EVENT_TYPE_NAMES = {
  0: 'DOMContentLoaded',
  1: 'Load',
  2: 'FullSnapshot',
  3: 'IncrementalSnapshot',
  4: 'Meta',
  5: 'Custom',
  6: 'Console',
  50: 'Network',
  51: 'SessionContext'
} as const;

// Event type 3 sources
export const INCREMENTAL_SOURCE_NAMES = {
  0: 'Mutation',
  1: 'MouseMove',
  2: 'MouseInteraction',
  3: 'Scroll',
  4: 'ViewportResize',
  5: 'Input',
  6: 'TouchMove',
  7: 'MediaInteraction',
  8: 'StyleSheetRule',
  9: 'CanvasMutation',
  10: 'Font',
  11: 'Log',
  12: 'Drag',
  13: 'StyleDeclaration',
  14: 'Selection',
  15: 'AdoptedStyleSheet'
} as const;

export type EventTypeName = typeof EVENT_TYPE_NAMES[keyof typeof EVENT_TYPE_NAMES];
export type IncrementalSourceName = typeof INCREMENTAL_SOURCE_NAMES[keyof typeof INCREMENTAL_SOURCE_NAMES];