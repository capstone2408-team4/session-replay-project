import { describe, it, expect, beforeEach } from "vitest";
import { FullSnapshotProcessor } from "../FullSnapshotProcessor";
import { ProcessedSession, RRWebEvent, RRWebNode, NodeType } from "../../types";

describe("FullSnapshotProcessor", () => {
  let processor: FullSnapshotProcessor;
  let mockSession: ProcessedSession;
  let mockSnapshotEvent: RRWebEvent;

  beforeEach(() => {
    processor = new FullSnapshotProcessor();
    mockSession = {
      metadata: {
        sessionId: "",
        startTime: "",
        endTime: "",
        duration: 0,
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
        fullSnapshot: undefined,
        allNodes: [],
      },
    };

    // Create a mock full snapshot event
    mockSnapshotEvent = {};
  });

  it("should process a valid full snapshot event", () => {
    processor.process(mockSnapshotEvent, mockSession);

    // expect(mockSession.dom?.fullSnapshot).toEqual(mockSnapshotEvent);
    expect(mockSession.dom?.allNodes).toHaveLength(140); // Document and HTML nodes
    expect(mockSession.events.significant).toHaveLength(1);
    expect(mockSession.events.significant[0].details).toBe(
      "Initial DOM snapshot captured",
    );

    expect(mockSession.events.byType.FullSnapshot).toEqual(1);
    expect(mockSession.events.total).toEqual(1);
  });

  it("should handle a full snapshot event with missing data", () => {
    delete mockSnapshotEvent.data.node; // Remove the node property

    processor.process(mockSnapshotEvent, mockSession);

    expect(mockSession.dom?.fullSnapshot).toBeUndefined(); // Should not store the snapshot
    expect(mockSession.dom?.allNodes).toEqual([]); // allNodes should be an empty array
    expect(mockSession.events.significant).toHaveLength(0); // Should not create an event
    expect(mockSession.events.byType.FullSnapshot).toBeUndefined();
    expect(mockSession.events.total).toEqual(0);
  });

  it("should gracefully handle an invalid event type", () => {
    const invalidEvent: RRWebEvent = {
      type: 3, // Invalid type
      data: {},
      timestamp: 1730154000000,
    };

    processor.process(invalidEvent, mockSession);

    expect(mockSession.dom?.fullSnapshot).toBeUndefined();
    expect(mockSession.dom?.allNodes).toEqual([]); // allNodes should be an empty array
    expect(mockSession.events.significant).toHaveLength(0); // No significant event
    expect(mockSession.events.byType.FullSnapshot).toBeUndefined();
    expect(mockSession.events.total).toEqual(0);
  });

  it("should not add a significant event or crash if data is null", () => {
    const snapshotEventNullData: RRWebEvent = {
      type: 2,
      data: null,
      timestamp: 1730154000000,
    };

    processor.process(snapshotEventNullData, mockSession);

    expect(mockSession.dom?.fullSnapshot).toBeUndefined();
    expect(mockSession.dom?.allNodes).toEqual([]);
    expect(mockSession.events.significant).toHaveLength(0);
    expect(mockSession.events.total).toEqual(0);
    expect(mockSession.events.byType.FullSnapshot).toBeUndefined();
  });
});