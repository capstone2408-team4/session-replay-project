// import { describe, test, expect, beforeEach } from 'vitest';
// import { NetworkProcessor } from '../NetworkProcessor.js';
// import { ProcessedSession } from '../../types.js';

// describe('NetworkProcessor', () => {
//   let processor: NetworkProcessor;
//   let mockSession: ProcessedSession;

//   beforeEach(() => {
//     processor = new NetworkProcessor();
//     mockSession = {
//       metadata: {
//         sessionId: 'test-session',
//         startTime: '',
//         endTime: '',
//         duration: 0
//       },
//       events: {
//         total: 0,
//         byType: {},
//         bySource: {},
//         significant: []
//       },
//       technical: {
//         errors: [],
//         performance: {
//           domUpdates: 0,
//           networkRequests: 0
//         },
//         network: {
//           requests: 0,
//           failures: 0
//         }
//       }
//     };
//   });

//   test('processes successful HTTP fetch request with proper metrics', () => {
//     const fetchEvent = {
//       type: 50,
//       data: {
//         url: "https://jsonplaceholder.typicode.com/todos/1",
//         type: "FETCH",
//         requestMadeAt: 1730135778555,
//         method: "GET",
//         responseReceivedAt: 1730135778624,
//         latency: 69,
//         status: 200
//       },
//       timestamp: 1730135778624
//     };

//     processor.process(fetchEvent, mockSession);

//     // Test event counting
//     expect(mockSession.events.total).toBe(1);
//     expect(mockSession.events.byType['Network']).toBe(1);

//     // Test network stats
//     expect(mockSession.technical.network.requests).toBe(1);
//     expect(mockSession.technical.network.failures).toBe(0);
//     expect(mockSession.technical.network.averageResponseTime).toBe(69);
    
//     // Test performance metrics
//     expect(mockSession.technical.performance.networkRequests).toBe(1);

//     // Non-significant endpoint shouldn't create significant event
//     expect(mockSession.events.significant).toHaveLength(0);
//   });

//   test('processes POST request with 201 status', () => {
//     const postEvent = {
//       type: 50,
//       data: {
//         url: "https://jsonplaceholder.typicode.com/posts",
//         type: "FETCH",
//         requestMadeAt: 1730135778625,
//         method: "POST",
//         responseReceivedAt: 1730135778764,
//         latency: 139,
//         status: 201
//       },
//       timestamp: 1730135778764
//     };

//     processor.process(postEvent, mockSession);

//     expect(mockSession.technical.network.requests).toBe(1);
//     expect(mockSession.technical.network.averageResponseTime).toBe(139);
//     expect(mockSession.technical.errors).toHaveLength(0);
//     expect(mockSession.technical.performance.networkRequests).toBe(1);
//   });

//   test('processes complete WebSocket lifecycle with proper metrics', () => {
//     const wsEvents = [
//       {
//         type: 50,
//         timestamp: 1730135778911,
//         data: {
//           url: "wss://ws.postman-echo.com/raw",
//           type: "WebSocket",
//           event: "open"
//         }
//       },
//       {
//         type: 50,
//         timestamp: 1730135778912,
//         data: {
//           url: "wss://ws.postman-echo.com/raw",
//           type: "WebSocket",
//           event: "send",
//           message: "Hello WebSocket!"
//         }
//       },
//       {
//         type: 50,
//         timestamp: 1730135778962,
//         data: {
//           url: "wss://ws.postman-echo.com/raw",
//           type: "WebSocket",
//           event: "close",
//           code: 1000,
//           reason: ""
//         }
//       }
//     ];

//     wsEvents.forEach(event => processor.process(event, mockSession));

//     // Test event counting
//     expect(mockSession.events.total).toBe(3);
//     expect(mockSession.events.byType['Network']).toBe(3);

//     // Test performance metrics
//     expect(mockSession.technical.performance.networkRequests).toBe(3);

//     // Test significant events (open should be significant)
//     expect(mockSession.events.significant).toHaveLength(1);
//     expect(mockSession.events.significant[0]).toMatchObject({
//       type: 'Network',
//       details: expect.stringContaining('WebSocket connection opened'),
//       impact: 'Real-time communication established'
//     });

//     // Normal close (1000) shouldn't create an error
//     expect(mockSession.technical.errors).toHaveLength(0);

//     // WebSocket events shouldn't affect average response time
//     expect(mockSession.technical.network.averageResponseTime).toBeUndefined();

//     console.log(JSON.stringify(mockSession));
//   });

//   test('processes failed WebSocket events with proper error handling', () => {
//     const failedWsEvent = {
//       type: 50,
//       timestamp: 1730135778962,
//       data: {
//         url: "wss://ws.postman-echo.com/raw",
//         type: "WebSocket",
//         event: "close",
//         code: 1006,
//         reason: "Abnormal closure"
//       }
//     };

//     processor.process(failedWsEvent, mockSession);

//     // Test performance metrics
//     expect(mockSession.technical.performance.networkRequests).toBe(1);

//     // Should record error and significant event
//     expect(mockSession.technical.errors).toHaveLength(1);
//     expect(mockSession.technical.errors[0]).toMatchObject({
//       type: 'network',
//       message: expect.stringContaining('Abnormal closure')
//     });

//     expect(mockSession.events.significant).toHaveLength(1);
//     expect(mockSession.events.significant[0]).toMatchObject({
//       details: expect.stringContaining('WebSocket close'),
//       impact: 'Real-time communication interrupted'
//     });
//   });

//   test('processes significant API endpoint requests', () => {
//     const apiEvent = {
//       type: 50,
//       data: {
//         url: "/api/v1/auth/login",
//         type: "XHR",
//         method: "POST",
//         requestMadeAt: 1730135784104,
//         responseReceivedAt: 1730135784263,
//         latency: 159,
//         status: 200
//       },
//       timestamp: 1730135784263
//     };

//     processor.process(apiEvent, mockSession);

//     // Test performance metrics
//     expect(mockSession.technical.performance.networkRequests).toBe(1);

//     // Should be marked as significant due to being an auth endpoint
//     expect(mockSession.events.significant).toHaveLength(1);
//     expect(mockSession.events.significant[0]).toMatchObject({
//       details: expect.stringContaining('Successful POST request to /api/v1/auth/login'),
//       impact: 'Key application interaction'
//     });
//   });

//   test('processes failed network requests with proper error handling', () => {
//     const failedRequest = {
//       type: 50,
//       data: {
//         url: "https://api.example.com/data",
//         type: "FETCH",
//         method: "GET",
//         requestMadeAt: 1730135784104,
//         error: "Failed to fetch",
//         status: 404
//       },
//       timestamp: 1730135784263
//     };

//     processor.process(failedRequest, mockSession);

//     // Test performance metrics
//     expect(mockSession.technical.performance.networkRequests).toBe(1);

//     // Should increment failure count
//     expect(mockSession.technical.network.failures).toBe(1);
    
//     // Should record error
//     expect(mockSession.technical.errors).toHaveLength(1);
//     expect(mockSession.technical.errors[0]).toMatchObject({
//       type: 'network',
//       message: expect.stringContaining('Failed to fetch')
//     });

//     // Should be marked as significant due to failure
//     expect(mockSession.events.significant).toHaveLength(1);
//     expect(mockSession.events.significant[0]).toMatchObject({
//       details: expect.stringContaining('Failed GET request'),
//       impact: 'Network request failure may impact functionality'
//     });

//     // Failed request shouldn't affect average response time
//     expect(mockSession.technical.network.averageResponseTime).toBeUndefined();
//   });

//   test('calculates correct average response time excluding requests without latency', () => {
//     const events = [
//       // Request with latency
//       {
//         type: 50,
//         data: {
//           url: "/api/data/1",
//           type: "FETCH",
//           method: "GET",
//           latency: 100,
//           status: 200
//         },
//         timestamp: 1000
//       },
//       // Failed request without latency
//       {
//         type: 50,
//         data: {
//           url: "/api/data/2",
//           type: "FETCH",
//           method: "GET",
//           error: "Failed to fetch",
//           status: 404
//         },
//         timestamp: 2000
//       },
//       // WebSocket event (no latency)
//       {
//         type: 50,
//         data: {
//           url: "ws://example.com",
//           type: "WebSocket",
//           event: "open"
//         },
//         timestamp: 3000
//       },
//       // Another request with latency
//       {
//         type: 50,
//         data: {
//           url: "/api/data/3",
//           type: "FETCH",
//           method: "GET",
//           latency: 300,
//           status: 200
//         },
//         timestamp: 4000
//       }
//     ];

//     events.forEach(event => processor.process(event, mockSession));

//     // Should have 4 total requests
//     expect(mockSession.technical.network.requests).toBe(4);
    
//     // But average should only consider the 2 requests with latency
//     expect(mockSession.technical.network.averageResponseTime).toBe(200); // (100 + 300) / 2
    
//     // Verify other metrics
//     expect(mockSession.technical.network.failures).toBe(1);
//     expect(mockSession.technical.performance.networkRequests).toBe(4);
//   });

//   test('properly handles URL parsing and path extraction', () => {
//     const events = [
//       // Full URL with query parameters
//       {
//         type: 50,
//         data: {
//           url: "https://api.example.com/api/v1/auth/login?redirect=dashboard",
//           type: "FETCH",
//           method: "GET",
//           status: 200
//         },
//         timestamp: 1000
//       },
//       // Relative URL
//       {
//         type: 50,
//         data: {
//           url: "/api/v1/users",
//           type: "FETCH",
//           method: "GET",
//           status: 200
//         },
//         timestamp: 2000
//       },
//       // Malformed URL
//       {
//         type: 50,
//         data: {
//           url: "not-a-url",
//           type: "FETCH",
//           method: "GET",
//           status: 200
//         },
//         timestamp: 3000
//       }
//     ];

//     events.forEach(event => processor.process(event, mockSession));

//     // Check significant events for proper URL handling
//     expect(mockSession.events.significant).toHaveLength(2); // Only API endpoints
//     expect(mockSession.events.significant[0].details).toContain('/api/v1/auth/login?redirect=dashboard');
//     expect(mockSession.events.significant[1].details).toContain('/api/v1/users');
//   });
// });