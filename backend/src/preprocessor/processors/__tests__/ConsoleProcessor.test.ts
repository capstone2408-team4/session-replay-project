import { ConsoleProcessor } from '../ConsoleProcessor';
import { ProcessedSession } from '../../types';

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
        duration: 0
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
    expect(mockSession.events.byType[6]).toBe(1);
    
    // Check if it was considered significant
    expect(mockSession.events.significant.length).toBe(1);
    expect(mockSession.events.significant[0].details).toBe('Info: Running network tests');
  });
});