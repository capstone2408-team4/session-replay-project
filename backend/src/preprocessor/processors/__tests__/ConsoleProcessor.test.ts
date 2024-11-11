import { describe, test, expect, beforeEach } from 'vitest';
import { ConsoleProcessor } from '../ConsoleProcessor.js';
import { ProcessedSession, EVENT_TYPE_NAMES } from '../../types.js';

describe('ConsoleProcessor', () => {
  let processor: ConsoleProcessor;
  let mockSession: ProcessedSession;

  beforeEach(() => {
    processor = new ConsoleProcessor();
    // Initialize a mock session with required structure
    mockSession = {
      metadata: {
        sessionId: 'test-session',
        startTime: '',
        endTime: '',
        duration: '0'
      },
      events: {
        total: 0,
        byType: {},
        bySource: {},
        significant: []
      },
      technical: {
        errors: [],
        performance: {
          domUpdates: 0,
          networkRequests: 0
        },
        network: {
          requests: 0,
          failures: 0
        }
      },
      dom: {
        fullSnapshot: {},
        incrementalSnapshots: SemanticIncrementalSnapshot[],
      }
    };
  });

  test('processes console log event', () => {
    // Example console event
    const consoleEvent = {
      "type": 6,
      "data": {
        "plugin": "rrweb/console@1",
        "payload": {
          "level": "log",
          "trace": [
            "u (https://conduit.jjjones.dev/assets/index-616d3f06.js:69:18696)",
            "Object.wE (https://conduit.jjjones.dev/assets/index-616d3f06.js:37:9855)",
            "SE (https://conduit.jjjones.dev/assets/index-616d3f06.js:37:10009)"
          ],
          "payload": [
            "\"Running network tests\""
          ]
        }
      },
      "timestamp": 1730135778555
    };

    // Process the event
    processor.process(consoleEvent, mockSession);

    // Verify results
    expect(mockSession.events.total).toBe(1);
    expect(mockSession.events.byType['Console']).toBe(1);
    expect(mockSession.events.byType[EVENT_TYPE_NAMES[6]]).toBe(1);

    // Verify no numeric types exist in byType
    const hasNumericKeys = Object.keys(mockSession.events.byType).some(
      key => !isNaN(Number(key))
    );
    expect(hasNumericKeys).toBe(false);
    
    // Test significant event structure
    expect(mockSession.events.significant).toHaveLength(1);
    const significantEvent = mockSession.events.significant[0];
    
    expect(significantEvent).toMatchObject({
      type: 'Console',
      details: expect.stringContaining('Running network tests'),
      impact: 'System diagnostic activity',
      timestamp: expect.any(String)
    });

    // Test timestamp format
    expect(Date.parse(significantEvent.timestamp)).not.toBeNaN();
  });

  test('processes a console error event with proper type naming', () => {
    const errorEvent = {
      type: 6,
      data: {
        plugin: "rrweb/console@1",
        payload: {
          level: "error",
          trace: [
            "u (https://conduit.jjjones.dev/assets/index-616d3f06.js:69:18696)"
          ],
          payload: [
            "\"Failed to load resource\""
          ]
        }
      },
      timestamp: 1730135778555
    };

    processor.process(errorEvent, mockSession);

    // Test type naming in event counts
    expect(mockSession.events.byType['Console']).toBe(1);
    expect(Object.keys(mockSession.events.byType)).toContain('Console');
    
    // Test error recording
    expect(mockSession.technical.errors).toHaveLength(1);
    expect(mockSession.technical.errors[0]).toMatchObject({
      type: 'console',
      message: 'Failed to load resource'
    });

    // Test significant event for error
    expect(mockSession.events.significant).toHaveLength(1);
    expect(mockSession.events.significant[0]).toMatchObject({
      type: 'Console',
      details: expect.stringContaining('Failed to load resource')
    });
  });

  test('processes a console warning event with proper type naming', () => {
    const warningEvent = {
      type: 6,
      data: {
        plugin: "rrweb/console@1",
        payload: {
          level: "warn",
          trace: [
            "u (https://conduit.jjjones.dev/assets/index-616d3f06.js:69:18696)"
          ],
          payload: [
            "\"Performance warning: slow operation\""
          ]
        }
      },
      timestamp: 1730135778555
    };

    processor.process(warningEvent, mockSession);

    // Test type naming
    expect(mockSession.events.byType['Console']).toBe(1);
    
    // Test warning handling
    const significantEvent = mockSession.events.significant[0];
    expect(significantEvent).toMatchObject({
      type: 'Console',
      details: expect.stringContaining('Performance warning'),
    });
  });

  test('ignores non-significant console logs', () => {
    const nonSignificantEvent = {
      type: 6,
      data: {
        plugin: "rrweb/console@1",
        payload: {
          level: "log",
          trace: [],
          payload: [
            "\"Some random log\""
          ]
        }
      },
      timestamp: 1730135778555
    };

    processor.process(nonSignificantEvent, mockSession);

    // Should count the event but not mark as significant
    expect(mockSession.events.total).toBe(1);
    expect(mockSession.events.byType['Console']).toBe(1);
    expect(mockSession.events.significant).toHaveLength(0);
  });
});