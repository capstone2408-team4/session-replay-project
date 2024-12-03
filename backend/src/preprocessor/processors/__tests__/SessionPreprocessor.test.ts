import { describe, it, expect, beforeEach } from "vitest";
import { SessionPreprocessor } from "../../SessionPreprocessor";
import { RRWebEvent } from "../../types";

describe("SessionPreprocessor", () => {
  let preprocessor: SessionPreprocessor;
  const timestamp = 1730154000000; // March 21, 2024
  
  const mockEvents: RRWebEvent[] = [
    {
      type: 4, // Meta
      data: {
        href: "https://example.com",
        width: 1920,
        height: 1080
      },
      timestamp
    },
    {
      type: 2, // FullSnapshot
      data: {
        node: {
          type: 0,
          id: 1,
          childNodes: []
        },
        initialOffset: { top: 0, left: 0 }
      },
      timestamp: timestamp + 100
    },
    {
      type: 51, // Context
      data: {
        sessionID: "test-session-123",
        url: "https://example.com",
        datetime: new Date(timestamp).toISOString(),
        userAgent: {
          raw: "Mozilla/5.0",
          mobile: false,
          platform: "macOS",
          brands: [{ brand: "Chrome", version: "120" }]
        },
        geo: {
          city: "San Francisco",
          state: "California", 
          country: "United States",
          timezone: "America/Los_Angeles"
        }
      },
      timestamp: timestamp + 200
    }
  ];

  beforeEach(() => {
    preprocessor = new SessionPreprocessor();
  });

  it("should throw error for empty events array", () => {
    expect(() => preprocessor.process([])).toThrowError("No events provided for processing");
  });

  it("should process session metadata and timing correctly", () => {
    const processed = preprocessor.process(mockEvents);
    const endTime = new Date(timestamp + 200).toISOString();
    const startTime = new Date(timestamp).toISOString();

    expect(processed.metadata).toMatchObject({
      url: "https://example.com",
      sessionId: "test-session-123",
      startTime,
      endTime,
      duration: "0 seconds",
      device: {
        os: "macOS",
        browser: "Chrome 120",
        mobile: false,
        viewport: { width: 1920, height: 1080 }
      },
      location: {
        city: "San Francisco",
        state: "California",
        country: "United States",
        timezone: "America/Los_Angeles"
      }
    });
  });

  it("should track event counts and types", () => {
    const processed = preprocessor.process(mockEvents);

    expect(processed.events.total).toBe(3);
    expect(processed.events.byType).toEqual({
      Meta: 1,
      FullSnapshot: 1,
      SessionContext: 1
    });
  });

  it("should initialize technical metrics", () => {
    const processed = preprocessor.process(mockEvents);

    expect(processed.technical).toEqual({
      errors: [],
      performance: {
        domUpdates: 0,
        networkRequests: 0
      },
      network: {
        requests: 0,
        failures: 0
      }
    });
  });
});