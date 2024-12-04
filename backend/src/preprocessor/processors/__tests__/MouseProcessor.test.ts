import { describe, it, expect, beforeEach } from "vitest";
import { MouseProcessor } from "../MouseProcessor";
import { ProcessedSession, RRWebEvent, NodeType } from "../../types";

describe("MouseProcessor", () => {
  let processor: MouseProcessor;
  let mockSession: ProcessedSession;

  beforeEach(() => {
    processor = new MouseProcessor();
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

  it("should detect rage clicks (5+ clicks per second)", () => {
    const baseTimestamp = 1730154000000;
    const events: RRWebEvent[] = [
      // 5 clicks within 1 second in the same area
      {
        type: 3,
        timestamp: baseTimestamp,
        data: {
          source: 2, // MouseInteraction
          type: 2,  // Click
          id: 5,
          x: 100,
          y: 200
        }
      },
      {
        type: 3,
        timestamp: baseTimestamp + 200, // 200ms later
        data: {
          source: 2,
          type: 2,
          id: 5,
          x: 101,
          y: 201
        }
      },
      {
        type: 3,
        timestamp: baseTimestamp + 400,
        data: {
          source: 2,
          type: 2,
          id: 5,
          x: 99,
          y: 199
        }
      },
      {
        type: 3,
        timestamp: baseTimestamp + 600,
        data: {
          source: 2,
          type: 2,
          id: 5,
          x: 100,
          y: 200
        }
      },
      {
        type: 3,
        timestamp: baseTimestamp + 800,
        data: {
          source: 2,
          type: 2,
          id: 5,
          x: 102,
          y: 202
        }
      }
    ];

    processor.processEvents(events, mockSession);

    expect(mockSession.events.significant).toHaveLength(1);
    expect(mockSession.events.significant[0]).toMatchObject({
      type: "Mouse Click: User Frustration",
      details: expect.stringContaining("Rage click detected"),
      impact: expect.stringContaining("user frustration")
    });
  });

  it("should detect dead clicks (no DOM response within 1000ms)", () => {
    const baseTimestamp = 1730154000000;
    const events: RRWebEvent[] = [
      // Click event
      {
        type: 3,
        timestamp: baseTimestamp,
        data: {
          source: 2,
          type: 2,
          id: 5,
          x: 100,
          y: 200
        }
      },
      // DOM mutation after dead click threshold (1000ms)
      {
        type: 3,
        timestamp: baseTimestamp + 1100,
        data: {
          source: 0,
          adds: [{
            parentId: 1,
            nextId: null,
            node: {
              type: 2,
              id: 6,
              tagName: "div",
              attributes: {},
              childNodes: []
            }
          }]
        }
      }
    ];

    processor.processEvents(events, mockSession);

    expect(mockSession.events.significant).toHaveLength(1);
    expect(mockSession.events.significant[0]).toMatchObject({
      type: "Mouse Click: User Frustration",
      details: expect.stringContaining("Dead click detected"),
      impact: expect.stringContaining("UI unresponsiveness")
    });
  });

  it("should detect mouse shaking (8+ non-linear moves)", () => {
    const baseTimestamp = 1730154000000;
    const events: RRWebEvent[] = [
      {
        type: 3,
        timestamp: baseTimestamp,
        data: {
          source: 1, // MouseMove
          positions: [
            // 8+ non-linear movements
            { x: 100, y: 100, id: 1, timeOffset: 0 },
            { x: 200, y: 50, id: 2, timeOffset: 20 },
            { x: 50, y: 150, id: 3, timeOffset: 40 },
            { x: 180, y: 30, id: 4, timeOffset: 60 },
            { x: 40, y: 160, id: 5, timeOffset: 80 },
            { x: 190, y: 40, id: 6, timeOffset: 100 },
            { x: 30, y: 170, id: 7, timeOffset: 120 },
            { x: 160, y: 60, id: 8, timeOffset: 140 }
          ]
        }
      }
    ];

    processor.processEvents(events, mockSession);

    expect(mockSession.events.significant).toHaveLength(1);
    expect(mockSession.events.significant[0]).toMatchObject({
      type: "Mouse Movement: User Frustration",
      details: expect.stringContaining("Mouse shaking detected"),
      impact: expect.stringContaining("user frustration or uncertainty")
    });
  });

  it("should handle normal click patterns (clicks with response)", () => {
    const baseTimestamp = 1730154000000;
    const events: RRWebEvent[] = [
      // Normal click with timely DOM response
      {
        type: 3,
        timestamp: baseTimestamp,
        data: {
          source: 2,
          type: 2,
          id: 5,
          x: 100,
          y: 200,
          tag: 'button'
        }
      },
      {
        type: 3,
        timestamp: baseTimestamp + 100, // Quick 100ms response
        data: {
          source: 0,
          adds: [{
            parentId: 1,
            nextId: null,
            node: {
              type: 2,
              id: 6,
              tagName: "div",
              attributes: {},
              childNodes: []
            }
          }]
        }
      },
      // Another normal click 2 seconds later
      {
        type: 3,
        timestamp: baseTimestamp + 2000,
        data: {
          source: 2,
          type: 2,
          id: 7,
          x: 300,
          y: 400,
          tag: 'button'
        }
      },
      {
        type: 3,
        timestamp: baseTimestamp + 2100,
        data: {
          source: 0,
          adds: [{
            parentId: 1,
            nextId: null,
            node: {
              type: 2,
              id: 8,
              tagName: "span",
              attributes: {},
              childNodes: []
            }
          }]
        }
      }
    ];

    processor.processEvents(events, mockSession);
    expect(mockSession.events.significant).toHaveLength(0);
  });

  it("should handle normal mouse movements (linear path)", () => {
    const baseTimestamp = 1730154000000;
    const events: RRWebEvent[] = [
      {
        type: 3,
        timestamp: baseTimestamp,
        data: {
          source: 1,
          positions: [
            // Linear movement from left to right
            { x: 100, y: 100, id: 1, timeOffset: 0 },
            { x: 120, y: 100, id: 2, timeOffset: 20 },
            { x: 140, y: 100, id: 3, timeOffset: 40 },
            { x: 160, y: 100, id: 4, timeOffset: 60 },
            { x: 180, y: 100, id: 5, timeOffset: 80 },
            { x: 200, y: 100, id: 6, timeOffset: 100 }
          ]
        }
      }
    ];

    processor.processEvents(events, mockSession);
    expect(mockSession.events.significant).toHaveLength(0);
  });

  it("should not double-count rage clicks as dead clicks", () => {
    const baseTimestamp = 1730154000000;
    const events: RRWebEvent[] = [
      // Rage clicks (no DOM response needed since they're rage clicks)
      {
        type: 3,
        timestamp: baseTimestamp,
        data: {
          source: 2,
          type: 2,
          id: 5,
          x: 100,
          y: 200
        }
      },
      {
        type: 3,
        timestamp: baseTimestamp + 200,
        data: {
          source: 2,
          type: 2,
          id: 5,
          x: 101,
          y: 201
        }
      },
      {
        type: 3,
        timestamp: baseTimestamp + 400,
        data: {
          source: 2,
          type: 2,
          id: 5,
          x: 99,
          y: 199
        }
      },
      {
        type: 3,
        timestamp: baseTimestamp + 600,
        data: {
          source: 2,
          type: 2,
          id: 5,
          x: 100,
          y: 200
        }
      },
      {
        type: 3,
        timestamp: baseTimestamp + 800,
        data: {
          source: 2,
          type: 2,
          id: 5,
          x: 102,
          y: 202
        }
      }
    ];

    processor.processEvents(events, mockSession);

    // Should only have one significant event (rage click) not additional dead clicks
    expect(mockSession.events.significant).toHaveLength(1);
    expect(mockSession.events.significant[0].details).toContain("Rage click");
  });

  it("should not detect dead clicks when focus events occur", () => {
    const baseTimestamp = 1730154000000;
    const events: RRWebEvent[] = [
      // Click event on input
      {
        type: 3,
        timestamp: baseTimestamp,
        data: {
          source: 2,
          type: 2, // Click
          id: 5,
          x: 100,
          y: 200
        }
      },
      // Focus event within timeout
      {
        type: 3,
        timestamp: baseTimestamp + 100,
        data: {
          source: 2,
          type: 5, // Focus
          id: 5
        }
      }
    ];

    processor.processEvents(events, mockSession);
    expect(mockSession.events.significant).toHaveLength(0);
  });

  it("should not detect dead clicks when blur events occur", () => {
    const baseTimestamp = 1730154000000;
    const events: RRWebEvent[] = [
      // Click event 
      {
        type: 3,
        timestamp: baseTimestamp,
        data: {
          source: 2,
          type: 2, // Click
          id: 5,
          x: 100,
          y: 200
        }
      },
      // Blur event within timeout
      {
        type: 3,
        timestamp: baseTimestamp + 100,
        data: {
          source: 2,
          type: 6, // Blur
          id: 5
        }
      }
    ];

    processor.processEvents(events, mockSession);
    expect(mockSession.events.significant).toHaveLength(0);
  });

  it("should detect dead clicks when no DOM or focus/blur events occur", () => {
    const baseTimestamp = 1730154000000;
    const events: RRWebEvent[] = [
      // Click event with no response
      {
        type: 3,
        timestamp: baseTimestamp,
        data: {
          source: 2,
          type: 2,
          id: 5,
          x: 100,
          y: 200
        }
      }
    ];

    processor.processEvents(events, mockSession);
    expect(mockSession.events.significant).toHaveLength(1);
    expect(mockSession.events.significant[0].details).toContain("Dead click");
  });

  it("should ignore clicks on form elements", () => {
    const baseTimestamp = 1730154000000;
    const events: RRWebEvent[] = [
      // Click on input field
      {
        type: 3,
        timestamp: baseTimestamp,
        data: {
          source: 2,
          type: 2,
          id: 5,
          x: 100,
          y: 200,
          tag: 'input'
        }
      },
      // Click on regular element with no response
      {
        type: 3,
        timestamp: baseTimestamp + 2000,
        data: {
          source: 2,
          type: 2,
          id: 6,
          x: 300,
          y: 400,
          tag: 'div'
        }
      }
    ];
  
    processor.processEvents(events, mockSession);
    expect(mockSession.events.significant).toHaveLength(1);
    expect(mockSession.events.significant[0].details).toContain("Dead click");
    expect(mockSession.events.significant[0].details).not.toContain("input");
  });
});