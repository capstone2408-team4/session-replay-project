export interface RRWebEvent {
  type: RRWebEventType;
  timestamp: number;
  data: any;
}

export interface SemanticFullSnapshot {
  node: SemanticRRWebNode;
}

export interface SemanticRRWebNode {
  type: NodeType;
  id?: number;
  tagName?: string;
  textContent?: string | null;
  attributes?: { [key: string]: string | null };
  childNodes?: SemanticRRWebNode[];
  // Adding properties for DOM Traversal.
  // previousSibling?: number | null
  // nextSibling?: number | null
  // parentNode?: number | null
  // isShadow?: boolean;
  // isShadowHost?: boolean;
  // isStyle?: boolean;
}

export type RRWebEventType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 50 | 51;
export type IncrementalSourceType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;

export interface RRWebNode {
  type: NodeType;
  id?: number;
  tagName?: string;
  textContent?: string | null;
  attributes?: { [key: string]: string | null };
  childNodes?: RRWebNode[];
  // Adding properties for DOM Traversal.
  // previousSibling?: number | null
  // nextSibling?: number | null
  // parentNode?: number | null
  // isShadow?: boolean;
  // isShadowHost?: boolean;
  // isStyle?: boolean;
}

export enum NodeType {
  Document = 'Document',
  DocumentType = 'DocumentType',
  Element = 'Element',
  Text = 'Text',
  CDATA = 'CDATA',
  Comment = 'Comment'
}

export interface ProcessedSession {
  metadata: SessionMetadata;
  events: EventSummary;
  technical: TechnicalData;
  dom: {
    fullSnapshot: SemanticRRWebNode;
    incrementalSnapshots: SemanticIncrementalSnapshot[];
  }
}

export interface SessionMetadata {
  sessionId: string;
  startTime: string;
  endTime: string;
  duration: string;
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
  summary?: string;
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
  when?: string;
  impact?: string;
}

export interface TechnicalData {
  errors: ErrorEvent[];
  performance: PerformanceMetrics;
  network: NetworkSummary;
  fullSnapshot?: RRWebEvent;
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
  '0': 'DOMContentLoaded',
  '1': 'Load',
  '2': 'FullSnapshot',
  '3': 'IncrementalSnapshot',
  '4': 'Meta',
  '5': 'Custom',
  '6': 'Console',
  '50': 'Network',
  '51': 'SessionContext'
};

// Event type 3 sources
export const INCREMENTAL_SOURCE_NAMES = {
  '0': 'Mutation',
  '1': 'MouseMove',
  '2': 'MouseInteraction',
  '3': 'Scroll',
  '4': 'ViewportResize',
  '5': 'Input',
  '6': 'TouchMove',
  '7': 'MediaInteraction',
  '8': 'StyleSheetRule',
  '9': 'CanvasMutation',
  '10': 'Font',
  '11': 'Log',
  '12': 'Drag',
  '13': 'StyleDeclaration',
  '14': 'Selection',
  '15': 'AdoptedStyleSheet'
};

export type EventTypeName = typeof EVENT_TYPE_NAMES[keyof typeof EVENT_TYPE_NAMES];
export type IncrementalSourceName = typeof INCREMENTAL_SOURCE_NAMES[keyof typeof INCREMENTAL_SOURCE_NAMES];

export interface SemanticIncrementalSnapshot {
  timestamp: string;
  source: IncrementalSourceName;
  data: SemanticIncrementalData;
}

export type SemanticIncrementalData = 
  | SemanticMutation
  | SemanticMouseMove
  | SemanticMouseInteraction
  | SemanticScroll
  | SemanticViewportResize
  | SemanticInput
  | SemanticTouchMove
  | SemanticMediaInteraction
  | SemanticStyleSheetRule
  | SemanticCanvasMutation
  | SemanticFont
  | SemanticLog
  | SemanticDrag
  | SemanticStyleDeclaration
  | SemanticSelection
  | SemanticAdoptedStyleSheet;

export interface SemanticMutation {
  type: 'mutation';
  adds?: {
    parentDescription: string;
    addedNodeDescription: string;
    position: string;
  }[];
  removes?: {
    parentDescription: string;
    removedNodeDescription: string;
  }[];
  attributes?: {
    nodeDescription: string;
    changes: {
      attribute: string;
      value: string | null;
    }[];
  }[];
  texts?: {
    nodeDescription: string;
    oldText: string | null;
    newText: string | null;
  }[];
}

export enum PointerTypes {
  Mouse = 0,
  Pen = 1,
  Touch = 2
}

export enum CanvasContext {
  '2D' = 0,
  WebGL = 1,
  WebGL2 = 2
}

export interface SemanticMouseMove {
  type: 'mouseMove';
  positions: {
    x: number;
    y: number;
    timeOffset: number;
  }[];
}


export interface SemanticMouseInteraction {
  type: 'mouseInteraction';
  pointerType: keyof typeof PointerTypes;
  action: keyof typeof MouseInteractions;
  position: {
    x: number;
    y: number;
  };
}

export interface SemanticScroll {
  type: 'scroll';
  position: {
    x: number;
    y: number;
  };
}

export interface SemanticViewportResize {
  type: 'viewportResize';
  size: {
    width: number;
    height: number;
  };
}

export interface SemanticInput {
  type: 'input';
  text: string;
  isChecked: boolean;
  userTriggered: boolean;
}

export interface SemanticCanvasMutation {
  type: 'canvasMutation';
  contextType: keyof typeof CanvasContext;
  commands: {
    property: string;
    args: Array<unknown>;
    setter?: boolean;
  }[];
}

export const POINTER_TYPE_NAMES: Record<number, keyof typeof PointerTypes> = {
  0: 'Mouse',
  1: 'Pen',
  2: 'Touch'
};

export const CANVAS_CONTEXT_NAMES: Record<number, keyof typeof CanvasContext> = {
  0: '2D',
  1: 'WebGL',
  2: 'WebGL2'
};

export enum MouseInteractions {
  MouseUp = 0,
  MouseDown = 1,
  Click = 2,
  ContextMenu = 3,
  DblClick = 4,
  Focus = 5,
  Blur = 6,
  TouchStart = 7,
  TouchMove_Departed = 8,
  TouchEnd = 9,
  TouchCancel = 10
}

export enum MediaInteractions {
  Play = 0,
  Pause = 1,
  Seeked = 2,
  VolumeChange = 3,
  RateChange = 4
}

export const MOUSE_INTERACTION_NAMES: Record<number, keyof typeof MouseInteractions> = {
  0: 'MouseUp',
  1: 'MouseDown',
  2: 'Click',
  3: 'ContextMenu',
  4: 'DblClick',
  5: 'Focus',
  6: 'Blur',
  7: 'TouchStart',
  8: 'TouchMove_Departed',
  9: 'TouchEnd',
  10: 'TouchCancel'
};

export const MEDIA_INTERACTION_NAMES: Record<number, keyof typeof MediaInteractions> = {
  0: 'Play',
  1: 'Pause',
  2: 'Seeked',
  3: 'VolumeChange',
  4: 'RateChange'
};

export interface SemanticTouchMove {
  type: 'touchMove';
  positions: {
    x: number;
    y: number;
    timeOffset: number;
  }[];
}

export interface SemanticMediaInteraction {
  type: 'mediaInteraction';
  action: keyof typeof MediaInteractions;
  currentTime?: number;
  volume?: number;
  muted?: boolean;
  playbackRate?: number;
}

export interface SemanticStyleSheetRule {
  type: 'styleSheetRule';
  adds?: {
    rule: string;
    index?: number | number[];
  }[];
  removes?: {
    index: number | number[];
  }[];
  replace?: string;
  replaceSync?: string;
}

export interface SemanticFont {
  type: 'font';
  family: string;
  source: string;
  descriptors?: FontFaceDescriptors;
  buffer: boolean;
}

export interface SemanticLog {
  type: 'log';
  level: 'log' | 'info' | 'warn' | 'error';
  args: unknown[];
}

export interface SemanticDrag {
  type: 'drag';
  positions: {
    x: number;
    y: number;
    timeOffset: number;
  }[];
}

export interface SemanticStyleDeclaration {
  type: 'styleDeclaration';
  index: number[];
  set?: {
    property: string;
    value: string | null;
    priority?: string;
  };
  remove?: {
    property: string;
  };
}

export interface SemanticSelection {
  type: 'selection';
  ranges: {
    start: number;
    startOffset: number;
    end: number;
    endOffset: number;
  }[];
}

export interface SemanticAdoptedStyleSheet {
  type: 'adoptedStyleSheet';
  id: number; // Host element node id
  styles?: {
    styleId: number;
    rules: {
      rule: string;
      index?: number[];
    }[];
  }[];
  styleIds: number[];
}