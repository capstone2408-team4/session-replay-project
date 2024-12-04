import { describe, it, expect, beforeEach } from "vitest";
import { FullSnapshotProcessor } from "../FullSnapshotProcessor";
import { ProcessedSession, RRWebEvent, NodeType } from "../../types";

describe("FullSnapshotProcessor", () => {
  let processor: FullSnapshotProcessor;
  let mockSession: ProcessedSession;

  beforeEach(() => {
    processor = new FullSnapshotProcessor();
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

  it("should process a valid full snapshot event with typical DOM structure", () => {
    const mockSnapshotEvent: RRWebEvent = {
      type: 2,
      data: {
        node: {
          type: 0, // Document
          id: 1,
          childNodes: [
            {
              type: 2, // Element
              id: 2,
              tagName: "html",
              attributes: {},
              childNodes: [
                {
                  type: 2, // Element
                  id: 3,
                  tagName: "head",
                  attributes: {},
                  childNodes: []
                },
                {
                  type: 2, // Element
                  id: 4,
                  tagName: "body",
                  attributes: { class: "main-content" },
                  childNodes: [
                    {
                      type: 2, // Element
                      id: 5,
                      tagName: "div",
                      attributes: { id: "app-root" },
                      childNodes: []
                    }
                  ]
                }
              ]
            }
          ]
        },
        initialOffset: {
          top: 0,
          left: 0
        }
      },
      timestamp: 1730154000000
    };

    processor.process(mockSnapshotEvent, mockSession);

    // Check that DOM tree was transformed and stored
    expect(mockSession.dom.fullSnapshot).toBeDefined();
    expect(mockSession.dom.fullSnapshot.type).toBe(NodeType.Document);
    
    // Verify HTML node
    const htmlNode = mockSession.dom.fullSnapshot.childNodes?.[0];
    expect(htmlNode?.type).toBe(NodeType.Element);
    expect(htmlNode?.tagName).toBe("html");
    
    // Verify body node and its attributes
    const bodyNode = htmlNode?.childNodes?.[1];
    expect(bodyNode?.type).toBe(NodeType.Element);
    expect(bodyNode?.tagName).toBe("body");
    expect(bodyNode?.attributes?.class).toBe("main-content");

    // Check event counting
    expect(mockSession.events.total).toBe(1);
    expect(mockSession.events.byType.FullSnapshot).toBe(1);

    // Check significant event creation
    expect(mockSession.events.significant).toHaveLength(1);
    expect(mockSession.events.significant[0]).toMatchObject({
      type: "FullSnapshot",
      details: "Initial DOM snapshot captured",
      impact: "Document structure initialized"
    });
  });

  it("should handle a snapshot with text nodes and mixed content", () => {
    const mockSnapshotEvent: RRWebEvent = {
      type: 2,
      data: {
        node: {
          type: 0,
          id: 1,
          childNodes: [
            {
              type: 2,
              id: 2,
              tagName: "div",
              attributes: {},
              childNodes: [
                {
                  type: 3, // Text node
                  id: 3,
                  textContent: "Hello",
                },
                {
                  type: 2, // Element
                  id: 4,
                  tagName: "span",
                  attributes: {},
                  childNodes: [
                    {
                      type: 3, // Text node
                      id: 5,
                      textContent: "World",
                    }
                  ]
                }
              ]
            }
          ]
        },
        initialOffset: { top: 0, left: 0 }
      },
      timestamp: 1730154000000
    };

    processor.process(mockSnapshotEvent, mockSession);

    const divNode = mockSession.dom.fullSnapshot.childNodes?.[0];
    expect(divNode?.type).toBe(NodeType.Element);
    
    // Check text node
    const textNode = divNode?.childNodes?.[0];
    expect(textNode?.type).toBe(NodeType.Text);
    expect(textNode?.textContent).toBe("Hello");

    // Check mixed content handling
    const spanNode = divNode?.childNodes?.[1];
    expect(spanNode?.type).toBe(NodeType.Element);
    expect(spanNode?.childNodes?.[0]?.type).toBe(NodeType.Text);
    expect(spanNode?.childNodes?.[0]?.textContent).toBe("World");
  });

  it("should handle invalid node types gracefully", () => {
    const mockSnapshotEvent: RRWebEvent = {
      type: 2,
      data: {
        node: {
          type: 999, // Invalid node type
          id: 1,
          childNodes: []
        },
        initialOffset: { top: 0, left: 0 }
      },
      timestamp: 1730154000000
    };

    processor.process(mockSnapshotEvent, mockSession);

    // Should default to Element type for unknown node types
    expect(mockSession.dom.fullSnapshot.type).toBe(NodeType.Element);
    expect(mockSession.events.total).toBe(1);
  });

  it("should handle missing or null event data gracefully", () => {
    const invalidEvent: RRWebEvent = {
      type: 2,
      data: null,
      timestamp: 1730154000000
    };

    processor.process(invalidEvent, mockSession);

    // Should not modify the existing fullSnapshot
    expect(mockSession.dom.fullSnapshot).toEqual({
      type: NodeType.Document,
      childNodes: [],
      id: 1
    });
    expect(mockSession.events.total).toBe(0);
    expect(mockSession.events.significant).toHaveLength(0);
  });
});