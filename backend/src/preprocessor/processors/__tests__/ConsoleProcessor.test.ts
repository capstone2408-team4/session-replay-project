import { describe, it, expect, beforeEach } from "vitest";
import { ConsoleProcessor } from "../ConsoleProcessor";
import { ProcessedSession, RRWebEvent, NodeType } from "../../types";

describe("ConsoleProcessor", () => {
  let processor: ConsoleProcessor;
  let mockSession: ProcessedSession;

  beforeEach(() => {
    processor = new ConsoleProcessor();
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

  it("should process console error events correctly", () => {
    const errorEvent: RRWebEvent = {
      type: 6,
      timestamp: 1730154000000,
      data: {
        plugin: "rrweb/console@1",
        payload: {
          level: "error",
          trace: [
            "app.js:42:15",
            "vendor.js:1337:10"
          ],
          payload: [
            "Failed to load user data: Network timeout"
          ]
        }
      }
    };

    processor.process(errorEvent, mockSession);

    // Check error recording
    expect(mockSession.technical.errors).toHaveLength(1);
    expect(mockSession.technical.errors[0]).toMatchObject({
      type: "console",
      message: "Failed to load user data: Network timeout",
      timestamp: expect.any(String)
    });

    // Check event counting
    expect(mockSession.events.total).toBe(1);
    expect(mockSession.events.byType.Console).toBe(1);

    // Check significant event creation
    expect(mockSession.events.significant).toHaveLength(1);
    expect(mockSession.events.significant[0]).toMatchObject({
      type: "Console",
      details: "Console error: Failed to load user data: Network timeout",
      impact: "Application error occurred that requires investigation"
    });
  });

  it("should process warning events with proper significance", () => {
    const warningEvent: RRWebEvent = {
      type: 6,
      timestamp: 1730154000000,
      data: {
        plugin: "rrweb/console@1",
        payload: {
          level: "warn",
          trace: [
            "components/form.js:156:22"
          ],
          payload: [
            "Performance warning: form submission taking longer than expected"
          ]
        }
      }
    };

    processor.process(warningEvent, mockSession);

    expect(mockSession.events.significant).toHaveLength(1);
    expect(mockSession.events.significant[0]).toMatchObject({
      type: "Console",
      details: "Console warn: Performance warning: form submission taking longer than expected",
      impact: "Warning logged that may need attention"
    });
  });

  it("should handle React development warnings specially", () => {
    const reactWarningEvent: RRWebEvent = {
      type: 6,
      timestamp: 1730154000000,
      data: {
        plugin: "rrweb/console@1",
        payload: {
          level: "error",
          trace: ["react-dom.development.js:42:15"],
          payload: [
            "Warning: Each child in a list should have a unique \"key\" prop"
          ]
        }
      }
    };

    processor.process(reactWarningEvent, mockSession);

    expect(mockSession.events.significant[0].impact).toBe(
      "React development warning detected that may indicate potential issues"
    );
  });

  it("should process info events about state changes", () => {
    const stateEvent: RRWebEvent = {
      type: 6,
      timestamp: 1730154000000,
      data: {
        plugin: "rrweb/console@1",
        payload: {
          level: "info",
          trace: ["store.js:89:12"],
          payload: [
            "User preferences state updated"
          ]
        }
      }
    };

    processor.process(stateEvent, mockSession);

    expect(mockSession.events.significant[0].impact).toBe(
      "Application state change recorded"
    );
  });

  it("should process network-related logs specially", () => {
    const networkEvent: RRWebEvent = {
      type: 6,
      timestamp: 1730154000000,
      data: {
        plugin: "rrweb/console@1",
        payload: {
          level: "log",
          trace: ["api.js:123:45"],
          payload: [
            "Network request retrying after timeout"
          ]
        }
      }
    };

    processor.process(networkEvent, mockSession);

    expect(mockSession.events.significant[0].impact).toBe(
      "Network-related activity logged"
    );
  });

  it("should handle console events with multiple payload items", () => {
    const multiPayloadEvent: RRWebEvent = {
      type: 6,
      timestamp: 1730154000000,
      data: {
        plugin: "rrweb/console@1",
        payload: {
          level: "log",
          trace: ["debug.js:1:1"],
          payload: [
            "User %s logged in successfully",
            "john.doe@example.com"
          ]
        }
      }
    };

    processor.process(multiPayloadEvent, mockSession);

    expect(mockSession.events.significant[0].details).toBe(
      "Console log: User john.doe@example.com logged in successfully"
    );
  });

  it("should handle malformed console events gracefully", () => {
    const malformedEvent: RRWebEvent = {
      type: 6,
      timestamp: 1730154000000,
      data: {
        plugin: "rrweb/console@1",
        payload: {
          // Missing required level
          trace: [],
          // Malformed or missing payload
          payload: null
        }
      }
    };

    processor.process(malformedEvent, mockSession);

    // Malformed events are not counted or processed
    expect(mockSession.events.total).toBe(0);
    expect(mockSession.events.byType.Console).toBeUndefined();
    expect(mockSession.events.significant).toHaveLength(0);
  });

  it("should not process non-console events", () => {
    const nonConsoleEvent: RRWebEvent = {
      type: 3,
      timestamp: 1730154000000,
      data: {
        plugin: "rrweb/console@1",
        payload: {
          level: "error",
          trace: [],
          payload: ["This should be ignored"]
        }
      }
    };

    processor.process(nonConsoleEvent, mockSession);

    expect(mockSession.events.total).toBe(0);
    expect(mockSession.events.significant).toHaveLength(0);
    expect(mockSession.technical.errors).toHaveLength(0);
  });
});