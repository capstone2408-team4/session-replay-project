import { describe, it, expect, beforeEach } from "vitest";
import { IncrementalSnapshotProcessor } from "../IncrementalSnapshotProcessor";
import { ProcessedSession, RRWebEvent, NodeType } from "../../types";

describe("IncrementalSnapshotProcessor", () => {
  let processor: IncrementalSnapshotProcessor;
  let mockSession: ProcessedSession;

  beforeEach(() => {
    processor = new IncrementalSnapshotProcessor();
    mockSession = {
      metadata: {
        sessionId: "",
        startTime: "",
        endTime: "",
        duration: "",
      },
      events: {
        total: 0,
        byType: {},
        bySource: {},
        significant: [],
      },
      technical: {
        errors: [],
        performance: {
          domUpdates: 0,
          networkRequests: 0,
        },
        network: {
          requests: 0,
          failures: 0,
        },
      },
      dom: {
        fullSnapshot: {
          type: NodeType.Document,
          childNodes: [],
          id: 1
        },
        incrementalSnapshots: []
      },
    };
  });

  it("should process DOM mutation events", () => {
    const mutationEvent: RRWebEvent = {
      type: 3,
      timestamp: 1730154000000,
      data: {
        source: 0, // Mutation
        adds: [{
          parentId: 1,
          nextId: null,
          node: {
            type: 2, // Element
            id: 2,
            tagName: "div",
            attributes: { class: "error-message" },
            childNodes: [{
              type: 3, // Text
              id: 3,
              textContent: "An error occurred"
            }]
          }
        }],
        removes: [],
        texts: [],
        attributes: []
      }
    };

    processor.process(mutationEvent, mockSession);

    // Check event counting
    expect(mockSession.events.total).toBe(1);
    expect(mockSession.events.byType.IncrementalSnapshot).toBe(1);
    expect(mockSession.events.bySource.Mutation).toBe(1);

    // Check DOM update counting
    expect(mockSession.technical.performance.domUpdates).toBe(1);

    // Check transformed snapshot storage
    expect(mockSession.dom.incrementalSnapshots).toHaveLength(1);
    const snapshot = mockSession.dom.incrementalSnapshots[0];
    expect(snapshot.source).toBe("Mutation");
    expect(snapshot.data.type).toBe("mutation");
  });

  it("should process input change events", () => {
    const inputEvent: RRWebEvent = {
      type: 3,
      timestamp: 1730154000000,
      data: {
        source: 5, // Input
        id: 5,
        text: "user@example.com",
        isChecked: false,
        userTriggered: true
      }
    };

    processor.process(inputEvent, mockSession);

    // Check event counting
    expect(mockSession.events.total).toBe(1);
    expect(mockSession.events.byType.IncrementalSnapshot).toBe(1);
    expect(mockSession.events.bySource.Input).toBe(1);

    // Check transformed snapshot
    expect(mockSession.dom.incrementalSnapshots).toHaveLength(1);
    const snapshot = mockSession.dom.incrementalSnapshots[0];
    expect(snapshot.source).toBe("Input");
    const inputData = snapshot.data;
    expect(inputData.type).toBe("input");
    if (inputData.type === "input") {
      expect(inputData.text).toBe("user@example.com");
      expect(inputData.userTriggered).toBe(true);
    }
  });

  it("should process mouse interaction events", () => {
    const mouseEvent: RRWebEvent = {
      type: 3,
      timestamp: 1730154000000,
      data: {
        source: 2, // MouseInteraction
        type: 2, // Click
        id: 5,
        x: 100,
        y: 200
      }
    };

    processor.process(mouseEvent, mockSession);

    // Check event counting
    expect(mockSession.events.total).toBe(1);
    expect(mockSession.events.byType.IncrementalSnapshot).toBe(1);
    expect(mockSession.events.bySource.MouseInteraction).toBe(1);

    // Check transformed snapshot
    expect(mockSession.dom.incrementalSnapshots).toHaveLength(1);
    const snapshot = mockSession.dom.incrementalSnapshots[0];
    expect(snapshot.source).toBe("MouseInteraction");
    const mouseData = snapshot.data;
    expect(mouseData.type).toBe("mouseInteraction");
    if (mouseData.type === "mouseInteraction") {
      expect(mouseData.action).toBe("Click");
      expect(mouseData.position).toEqual({ x: 100, y: 200 });
    }
  });

  it("should process viewport resize events", () => {
    const resizeEvent: RRWebEvent = {
      type: 3,
      timestamp: 1730154000000,
      data: {
        source: 4, // ViewportResize
        width: 1024,
        height: 768
      }
    };

    processor.process(resizeEvent, mockSession);

    // Check event counting
    expect(mockSession.events.total).toBe(1);
    expect(mockSession.events.byType.IncrementalSnapshot).toBe(1);
    expect(mockSession.events.bySource.ViewportResize).toBe(1);

    // Check transformed snapshot
    expect(mockSession.dom.incrementalSnapshots).toHaveLength(1);
    const snapshot = mockSession.dom.incrementalSnapshots[0];
    expect(snapshot.source).toBe("ViewportResize");
    const resizeData = snapshot.data;
    expect(resizeData.type).toBe("viewportResize");
    if (resizeData.type === "viewportResize") {
      expect(resizeData.size).toEqual({ width: 1024, height: 768 });
    }
  });

  it("should process media interaction events", () => {
    const mediaEvent: RRWebEvent = {
      type: 3,
      timestamp: 1730154000000,
      data: {
        source: 7, // MediaInteraction
        type: 0, // Play
        id: 10,
        currentTime: 15.5,
        volume: 1,
        muted: false,
        playbackRate: 1.0
      }
    };

    processor.process(mediaEvent, mockSession);

    expect(mockSession.events.total).toBe(1);
    expect(mockSession.events.byType.IncrementalSnapshot).toBe(1);
    expect(mockSession.events.bySource.MediaInteraction).toBe(1);

    expect(mockSession.dom.incrementalSnapshots).toHaveLength(1);
    const snapshot = mockSession.dom.incrementalSnapshots[0];
    expect(snapshot.source).toBe("MediaInteraction");
    const mediaData = snapshot.data;
    expect(mediaData.type).toBe("mediaInteraction");
    if (mediaData.type === "mediaInteraction") {
      expect(mediaData.action).toBe("Play");
      expect(mediaData.currentTime).toBe(15.5);
      expect(mediaData.volume).toBe(1);
      expect(mediaData.muted).toBe(false);
    }
  });

  it("should process scroll events", () => {
    const scrollEvent: RRWebEvent = {
      type: 3,
      timestamp: 1730154000000,
      data: {
        source: 3, // Scroll
        id: 15,
        x: 0,
        y: 250
      }
    };

    processor.process(scrollEvent, mockSession);

    expect(mockSession.events.total).toBe(1);
    expect(mockSession.events.byType.IncrementalSnapshot).toBe(1);
    expect(mockSession.events.bySource.Scroll).toBe(1);

    expect(mockSession.dom.incrementalSnapshots).toHaveLength(1);
    const snapshot = mockSession.dom.incrementalSnapshots[0];
    expect(snapshot.source).toBe("Scroll");
    const scrollData = snapshot.data;
    expect(scrollData.type).toBe("scroll");
    if (scrollData.type === "scroll") {
      expect(scrollData.position).toEqual({ x: 0, y: 250 });
    }
  });

  it("should process style sheet rule changes", () => {
    const styleEvent: RRWebEvent = {
      type: 3,
      timestamp: 1730154000000,
      data: {
        source: 8, // StyleSheetRule
        styleId: 1,
        adds: [{
          rule: ".error { color: red; }",
          index: 0
        }],
        removes: [{
          index: 1
        }]
      }
    };

    processor.process(styleEvent, mockSession);

    expect(mockSession.events.total).toBe(1);
    expect(mockSession.events.byType.IncrementalSnapshot).toBe(1);
    expect(mockSession.events.bySource.StyleSheetRule).toBe(1);

    expect(mockSession.dom.incrementalSnapshots).toHaveLength(1);
    const snapshot = mockSession.dom.incrementalSnapshots[0];
    expect(snapshot.source).toBe("StyleSheetRule");
    const styleData = snapshot.data;
    expect(styleData.type).toBe("styleSheetRule");
    if (styleData.type === "styleSheetRule") {
      expect(styleData.adds?.length).toBe(1);
      expect(styleData.adds?.[0].rule).toBe(".error { color: red; }");
      expect(styleData.removes?.length).toBe(1);
      expect(styleData.removes?.[0].index).toBe(1);
    }
  });

  it("should process touchmove events", () => {
    const touchEvent: RRWebEvent = {
      type: 3,
      timestamp: 1730154000000,
      data: {
        source: 6, // TouchMove
        positions: [
          { x: 100, y: 200, timeOffset: 0 },
          { x: 110, y: 220, timeOffset: 100 }
        ]
      }
    };

    processor.process(touchEvent, mockSession);

    expect(mockSession.events.total).toBe(1);
    expect(mockSession.events.byType.IncrementalSnapshot).toBe(1);
    expect(mockSession.events.bySource.TouchMove).toBe(1);

    expect(mockSession.dom.incrementalSnapshots).toHaveLength(1);
    const snapshot = mockSession.dom.incrementalSnapshots[0];
    expect(snapshot.source).toBe("TouchMove");
    const touchData = snapshot.data;
    expect(touchData.type).toBe("touchMove");
    if (touchData.type === "touchMove") {
      expect(touchData.positions).toHaveLength(2);
      expect(touchData.positions[0]).toEqual({ x: 100, y: 200, timeOffset: 0 });
      expect(touchData.positions[1]).toEqual({ x: 110, y: 220, timeOffset: 100 });
    }
  });
});