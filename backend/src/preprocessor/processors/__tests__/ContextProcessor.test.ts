import { describe, it, expect, beforeEach } from "vitest";
import { ContextProcessor } from "../ContextProcessor";
import { ProcessedSession, RRWebEvent, NodeType } from "../../types";

describe("ContextProcessor", () => {
  let processor: ContextProcessor;
  let mockSession: ProcessedSession;

  beforeEach(() => {
    processor = new ContextProcessor();
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

  it("should process a complete context event with all fields", () => {
    const contextEvent: RRWebEvent = {
      type: 51,
      timestamp: 1730154000000,
      data: {
        sessionID: "test-session-123",
        url: "https://example.com/dashboard",
        datetime: "2024-03-21T12:00:00Z",
        userAgent: {
          raw: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
          mobile: false,
          platform: "macOS",
          brands: [
            { brand: "Chrome", version: "120" },
            { brand: "Chromium", version: "120" },
            { brand: "Not?A_Brand", version: "24" }
          ]
        },
        geo: {
          city: { en: "San Francisco" },
          state: { en: "California" },
          country: { en: "United States" },
          latitude: 37.7749,
          longitude: -122.4194,
          timezone: "America/Los_Angeles"
        }
      }
    };

    processor.process(contextEvent, mockSession);

    // Check session metadata
    expect(mockSession.metadata.sessionId).toBe("test-session-123");
    
    // Check location data
    expect(mockSession.metadata.location).toEqual({
      city: "San Francisco",
      state: "California",
      country: "United States",
      latitude: 37.7749,
      longitude: -122.4194,
      timezone: "America/Los_Angeles"
    });

    // Check device data (should use primary brand excluding Not?A_Brand)
    expect(mockSession.metadata.device).toEqual({
      os: "macOS",
      browser: "Chrome 120",
      mobile: false
    });

    // Check event counting
    expect(mockSession.events.total).toBe(1);
    expect(mockSession.events.byType.SessionContext).toBe(1);

    // Check significant event
    expect(mockSession.events.significant).toHaveLength(1);
    expect(mockSession.events.significant[0]).toMatchObject({
      type: "SessionContext",
      details: expect.stringContaining("Session context captured: City: San Francisco, State: California, Country: United States, Chrome 120 on macOS")
    });
  });

  it("should handle context event with minimal location data", () => {
    const contextEvent: RRWebEvent = {
      type: 51,
      timestamp: 1730154000000,
      data: {
        sessionID: "test-session-456",
        url: "https://example.com",
        datetime: "2024-03-21T12:00:00Z",
        userAgent: {
          raw: "Mozilla/5.0",
          mobile: true,
          platform: "iOS",
          brands: []
        },
        geo: {
          city: "Unknown",
          state: "Unknown",
          country: "Unknown",
          latitude: "Unknown",
          longitude: "Unknown",
          timezone: "UTC"
        }
      }
    };

    processor.process(contextEvent, mockSession);

    expect(mockSession.metadata.location).toEqual({
      city: "Unknown",
      state: "Unknown",
      country: "Unknown",
      timezone: "UTC"
    });

    // Should fall back to raw user agent when brands array is empty
    expect(mockSession.metadata.device?.browser).toBe("Mozilla/5.0");
    expect(mockSession.metadata.device?.mobile).toBe(true);
  });

  it("should handle context event with geo error", () => {
    const contextEvent: RRWebEvent = {
      type: 51,
      timestamp: 1730154000000,
      data: {
        sessionID: "test-session-789",
        url: "https://example.com",
        datetime: "2024-03-21T12:00:00Z",
        userAgent: {
          raw: "Mozilla/5.0",
          mobile: false,
          platform: "Windows",
          brands: [{ brand: "Firefox", version: "115" }]
        },
        geo: {
          city: "Unknown",
          state: "Unknown",
          country: "Unknown",
          timezone: "UTC"
        },
        error: {
          message: "Geo lookup failed: Rate limit exceeded",
          type: "RateLimitError"
        }
      }
    };

    processor.process(contextEvent, mockSession);

    // Should record the error
    expect(mockSession.technical.errors).toHaveLength(1);
    expect(mockSession.technical.errors[0]).toMatchObject({
      type: "network",
      message: "Geo lookup failed: Rate limit exceeded"
    });

    // Should still create significant event with error context
    expect(mockSession.events.significant[0].details).toBe(
      "Context error: Geo lookup failed: Rate limit exceeded"
    );
  });

  it("should handle invalid event types gracefully", () => {
    const invalidEvent: RRWebEvent = {
      type: 3,
      timestamp: 1730154000000,
      data: {
        sessionID: "test-session",
        userAgent: { raw: "test", mobile: false, platform: "test" },
        geo: {}
      }
    };

    processor.process(invalidEvent, mockSession);

    expect(mockSession.metadata.sessionId).toBe("");
    expect(mockSession.metadata.location).toBeUndefined();
    expect(mockSession.metadata.device).toBeUndefined();
    expect(mockSession.events.total).toBe(0);
    expect(mockSession.events.significant).toHaveLength(0);
  });

  it("should handle missing or null event data gracefully", () => {
    const nullDataEvent: RRWebEvent = {
      type: 51,
      timestamp: 1730154000000,
      data: null
    };

    processor.process(nullDataEvent, mockSession);

    expect(mockSession.metadata.sessionId).toBe("");
    expect(mockSession.metadata.location).toBeUndefined();
    expect(mockSession.metadata.device).toBeUndefined();
    expect(mockSession.events.total).toBe(0);
    expect(mockSession.events.significant).toHaveLength(0);
  });
});