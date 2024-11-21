import { describe, it, expect, beforeEach } from "vitest";
import { MetaProcessor } from "../MetaProcessor";
import { ProcessedSession, RRWebEvent, NodeType } from "../../types";

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

  it("should process a valid meta event with complete data", () => {
    const metaEvent: RRWebEvent = {
      type: 4,
      data: {
        href: "https://example.com/dashboard",
        width: 1920,
        height: 1080,
      },
      timestamp: 1730154000000,
    };

    processor.process(metaEvent, mockSession);

    // Check URL was set
    expect(mockSession.metadata.url).toBe("https://example.com/dashboard");

    // Check viewport dimensions were set
    expect(mockSession.metadata.device?.viewport?.width).toBe(1920);
    expect(mockSession.metadata.device?.viewport?.height).toBe(1080);

    // Check event counting
    expect(mockSession.events.total).toBe(1);
    expect(mockSession.events.byType.Meta).toBe(1);

    // Check significant event creation
    expect(mockSession.events.significant).toHaveLength(1);
    expect(mockSession.events.significant[0]).toMatchObject({
      type: "Meta",
      details: expect.stringContaining("Initial page view: https://example.com/dashboard (viewport: 1920x1080)"),
      impact: "Page loaded with initial viewport dimensions.",
    });
  });

  it("should process a valid meta event with minimum required data", () => {
    const metaEvent: RRWebEvent = {
      type: 4,
      data: {
        href: "https://example.com",
        width: 800,
        height: 600,
      },
      timestamp: 1730154000000,
    };

    processor.process(metaEvent, mockSession);

    expect(mockSession.metadata.url).toBe("https://example.com");
    expect(mockSession.metadata.device?.viewport?.width).toBe(800);
    expect(mockSession.metadata.device?.viewport?.height).toBe(600);
    expect(mockSession.events.significant).toHaveLength(1);
  });

  it("should handle invalid meta event types gracefully", () => {
    const invalidEvent: RRWebEvent = {
      type: 3, // Wrong type
      data: {
        href: "https://example.com",
        width: 1024,
        height: 768,
      },
      timestamp: 1730154000000,
    };

    processor.process(invalidEvent, mockSession);

    // Should not process invalid event type
    expect(mockSession.metadata.url).toBeUndefined();
    expect(mockSession.metadata.device?.viewport).toBeUndefined();
    expect(mockSession.events.significant).toHaveLength(0);
    expect(mockSession.events.total).toBe(0);
    expect(mockSession.events.byType.Meta).toBeUndefined();
  });

  it("should handle meta event with missing data gracefully", () => {
    const incompleteEvent: RRWebEvent = {
      type: 4,
      data: {
        // Missing required fields
      },
      timestamp: 1730154000000,
    };

    processor.process(incompleteEvent, mockSession);

    // Should not process event with missing required data
    expect(mockSession.metadata.url).toBeUndefined();
    expect(mockSession.metadata.device?.viewport).toBeUndefined();
    expect(mockSession.events.significant).toHaveLength(0);
    expect(mockSession.events.total).toBe(0);
  });

  it("should handle null event data gracefully", () => {
    const nullDataEvent: RRWebEvent = {
      type: 4,
      data: null,
      timestamp: 1730154000000,
    };

    processor.process(nullDataEvent, mockSession);

    // Should not process event with null data
    expect(mockSession.metadata.url).toBeUndefined();
    expect(mockSession.metadata.device?.viewport).toBeUndefined();
    expect(mockSession.events.significant).toHaveLength(0);
    expect(mockSession.events.total).toBe(0);
  });
});