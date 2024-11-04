import { describe, it, expect, beforeEach } from "vitest";
import { MetaProcessor } from "../MetaProcessor";
import { ProcessedSession, RRWebEvent } from "../../types";

describe("MetaProcessor", () => {
  let processor: MetaProcessor;
  let mockSession: ProcessedSession;

  beforeEach(() => {
    processor = new MetaProcessor();
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
  });

  it("should process a valid meta event", () => {
    const metaEvent: RRWebEvent = {
      type: 4,
      data: {
        href: "https://www.example.com",
        width: 1280,
        height: 720,
      },
      timestamp: 12345,
    };

    processor.process(metaEvent, mockSession);

    expect(mockSession.metadata.url).toBe("https://www.example.com");
    expect(mockSession.metadata.device?.viewport?.width).toBe(1280); // Optional chaining
    expect(mockSession.metadata.device?.viewport?.height).toBe(720);
    expect(mockSession.events.significant).toHaveLength(1);
    expect(mockSession.events.significant[0].details).toBe(
      "Initial page view: https://www.example.com (viewport: 1280x720)",
    );
    expect(mockSession.events.significant[0].impact).toBe(
      "Page loaded with initial viewport dimensions.",
    );

    expect(mockSession.events.byType.Meta).toEqual(1);
    expect(mockSession.events.total).toEqual(1);


  });

  it("should handle a meta event with missing data", () => {
    const invalidMetaEvent: RRWebEvent = {
      type: 4,
      data: {
        // Missing href and height.
        width: 800,
      },
      timestamp: 1730154000000,
    };

    processor.process(invalidMetaEvent, mockSession);

    expect(mockSession.events.significant).toHaveLength(0); // Should not create an event.
    expect(mockSession.events.total).toEqual(0);
    expect(mockSession.events.byType.Meta).toBeUndefined();
  });

  it("should gracefully handle an invalid meta event type", () => {
    const invalidMetaEvent: RRWebEvent = {
      type: 0, // Invalid type
      data: {
        href: "https://www.example.com",
        width: 1920,
        height: 1080,
      },
      timestamp: 1730154000000,
    };

    processor.process(invalidMetaEvent, mockSession);

    expect(mockSession.events.significant).toHaveLength(0); // No significant event should be added

    expect(mockSession.events.total).toEqual(0);
    expect(mockSession.events.byType.Meta).toBeUndefined();

    expect(mockSession.metadata.url).toBeUndefined();
    expect(mockSession.metadata.device?.viewport).toBeUndefined();
  });

  // Test case with null data
  it("should not add a significant event and not crash if data is null", () => {
    const metaEventNullData: RRWebEvent = {
      type: 4,
      data: null, // Data is explicitly set to null.
      timestamp: 1730154000000,
    };

    processor.process(metaEventNullData, mockSession);

    expect(mockSession.events.significant).toHaveLength(0);
    expect(mockSession.metadata.url).toBeUndefined();
    expect(mockSession.metadata.device?.viewport).toBeUndefined();
    expect(mockSession.events.total).toEqual(0);
    expect(mockSession.events.byType.Meta).toBeUndefined();
  });
});
