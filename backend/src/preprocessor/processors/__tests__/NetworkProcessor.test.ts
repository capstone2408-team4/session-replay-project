import { describe, it, expect, beforeEach } from "vitest";
import { NetworkProcessor } from "../NetworkProcessor";
import { ProcessedSession, RRWebEvent, NodeType } from "../../types";

describe("NetworkProcessor", () => {
  let processor: NetworkProcessor;
  let mockSession: ProcessedSession;

  beforeEach(() => {
    processor = new NetworkProcessor();
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
        }
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

  it("should process successful HTTP fetch requests correctly", () => {
    const fetchEvent: RRWebEvent = {
      type: 50,
      timestamp: 1730154000000,
      data: {
        type: "FETCH",
        url: "/api/v1/users",
        method: "GET",
        status: 200,
        requestMadeAt: 1730154000000,
        responseReceivedAt: 1730154000100,
        latency: 100
      }
    };

    processor.process(fetchEvent, mockSession);

    // Check request counting
    expect(mockSession.events.total).toBe(1);
    expect(mockSession.events.byType.Network).toBe(1);
    expect(mockSession.technical.performance.networkRequests).toBe(1);
    expect(mockSession.technical.network.requests).toBe(1);
    expect(mockSession.technical.network.failures).toBe(0);
    expect(mockSession.technical.network.averageResponseTime).toBe(100);
  });

  it("should process successful XHR requests correctly", () => {
    const xhrEvent: RRWebEvent = {
      type: 50,
      timestamp: 1730154000000,
      data: {
        type: "XHR",
        url: "/api/v1/auth/login",
        method: "POST",
        status: 200,
        requestMadeAt: 1730154000000,
        responseReceivedAt: 1730154000150,
        latency: 150
      }
    };

    processor.process(xhrEvent, mockSession);

    // Should create significant event for auth endpoint
    expect(mockSession.events.significant).toHaveLength(1);
    expect(mockSession.events.significant[0]).toMatchObject({
      type: "POST Request (200)",
      details: expect.stringContaining("Successful POST request to /api/v1/auth/login"),
      impact: "Key application interaction"
    });
  });

  it("should handle failed HTTP requests properly", () => {
    const failedRequest: RRWebEvent = {
      type: 50,
      timestamp: 1730154000000,
      data: {
        type: "FETCH",
        url: "/api/v1/data",
        method: "GET",
        status: 404,
        error: "Not Found",
        requestMadeAt: 1730154000000
      }
    };

    processor.process(failedRequest, mockSession);

    // Check error recording
    expect(mockSession.technical.errors).toHaveLength(1);
    expect(mockSession.technical.errors[0]).toMatchObject({
      type: "network",
      message: expect.stringContaining("GET request to /api/v1/data failed: Not Found")
    });

    // Check failure counting
    expect(mockSession.technical.network.failures).toBe(1);
    
    // Should create significant event for failure
    expect(mockSession.events.significant).toHaveLength(1);
    expect(mockSession.events.significant[0]).toMatchObject({
      type: "GET Request Failed (404)",
      details: expect.stringContaining("Failed GET request"),
      impact: "Network request failure may impact functionality"
    });

    // Failed request should not affect average response time
    expect(mockSession.technical.network.averageResponseTime).toBeUndefined();
  });

  it("should handle WebSocket lifecycle events", () => {
    const wsOpenEvent: RRWebEvent = {
      type: 50,
      timestamp: 1730154000000,
      data: {
        type: "WebSocket",
        url: "wss://api.example.com/ws",
        event: "open"
      }
    };

    const wsMessageEvent: RRWebEvent = {
      type: 50,
      timestamp: 1730154000100,
      data: {
        type: "WebSocket",
        url: "wss://api.example.com/ws",
        event: "message",
        message: "Hello"
      }
    };

    const wsCloseEvent: RRWebEvent = {
      type: 50,
      timestamp: 1730154000200,
      data: {
        type: "WebSocket",
        url: "wss://api.example.com/ws",
        event: "close",
        code: 1000,
        reason: ""
      }
    };

    // Process WebSocket lifecycle events
    processor.process(wsOpenEvent, mockSession);
    processor.process(wsMessageEvent, mockSession);
    processor.process(wsCloseEvent, mockSession);

    // Check all events were counted
    expect(mockSession.events.total).toBe(3);
    expect(mockSession.technical.performance.networkRequests).toBe(3);

    // Check significant events
    expect(mockSession.events.significant).toHaveLength(1);
    expect(mockSession.events.significant[0]).toMatchObject({
      type: "WebSocket Connection Opened",
      details: expect.stringContaining("WebSocket connection opened"),
      impact: "Real-time communication established"
    });
  });

  it("should handle WebSocket errors properly", () => {
    const wsErrorEvent: RRWebEvent = {
      type: 50,
      timestamp: 1730154000000,
      data: {
        type: "WebSocket",
        url: "wss://api.example.com/ws",
        event: "close",
        code: 1006,
        reason: "Abnormal closure"
      }
    };

    processor.process(wsErrorEvent, mockSession);

    // Check error recording
    expect(mockSession.technical.errors).toHaveLength(1);
    expect(mockSession.technical.errors[0]).toMatchObject({
      type: "network",
      message: expect.stringContaining("Abnormal closure")
    });

    // Check significant event
    expect(mockSession.events.significant).toHaveLength(1);
    expect(mockSession.events.significant[0]).toMatchObject({
      type: "WebSocket Connection Closed",
      details: expect.stringContaining("WebSocket close"),
      impact: "Real-time communication interrupted"
    });
  });

  it("should calculate average response time correctly across multiple requests", () => {
    const requests: RRWebEvent[] = [
      {
        type: 50,
        timestamp: 1730154000000,
        data: {
          type: "FETCH",
          url: "/api/v1/data/1",
          method: "GET",
          status: 200,
          latency: 100
        }
      },
      {
        type: 50,
        timestamp: 1730154000200,
        data: {
          type: "FETCH",
          url: "/api/v1/data/2",
          method: "GET",
          status: 200,
          latency: 300
        }
      }
    ];

    requests.forEach(request => processor.process(request, mockSession));

    expect(mockSession.technical.network.averageResponseTime).toBe(200); // (100 + 300) / 2
  });

  it("should not process non-network events", () => {
    const nonNetworkEvent: RRWebEvent = {
      type: 3,
      timestamp: 1730154000000,
      data: {
        source: 0,
        payload: {}
      }
    };

    processor.process(nonNetworkEvent, mockSession);

    expect(mockSession.events.total).toBe(0);
    expect(mockSession.events.byType.Network).toBeUndefined();
    expect(mockSession.technical.network.requests).toBe(0);
  });
});