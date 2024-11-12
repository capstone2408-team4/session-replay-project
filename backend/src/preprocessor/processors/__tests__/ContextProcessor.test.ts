// import { describe, it, expect, beforeEach } from "vitest";
// import { ContextProcessor } from "../ContextProcessor.js";
// import { ProcessedSession, RRWebEvent } from "../../types.js";

// describe("ContextProcessor", () => {
//   let processor: ContextProcessor;
//   let mockSession: ProcessedSession;

//   beforeEach(() => {
//     processor = new ContextProcessor();
//     mockSession = {
//       metadata: {
//         sessionId: "",
//         startTime: "",
//         endTime: "",
//         duration: 0,
//       },
//       events: {
//         total: 0,
//         byType: {},
//         bySource: {},
//         significant: [],
//       },
//       technical: {
//         errors: [],
//         performance: {
//           domUpdates: 0,
//           networkRequests: 0,
//         },
//         network: {
//           requests: 0,
//           failures: 0,
//         },
//       },
//       dom: {
//         fullSnapshot: undefined,
//         allNodes: [],
//       },
//     };
//   });

//   it("should process a valid context event with full geolocation data", () => {
//     const contextEvent: RRWebEvent = {
//       type: 51,
//       timestamp: 1730133342836,
//       data: {
//         sessionID: "366fbcbb-e55b-4ca4-8090-af6b12e62c26",
//         url: "https://conduit.jjjones.dev/", // Use a fixed URL for testing
//         datetime: "2024-10-28T16:35:42.836Z",
//         userAgent: {
//           raw: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
//           mobile: false,
//           platform: "macOS",
//           brands: [
//             {
//               brand: "Chromium",
//               version: "130",
//             },
//             {
//               brand: "Google Chrome",
//               version: "130",
//             },
//             {
//               brand: "Not?A_Brand",
//               version: "99",
//             },
//           ],
//         },
//         geo: {
//           city: {
//             en: "Atlanta", // Simplified for testing
//           },
//           state: {
//             en: "Georgia",
//           },
//           country: {
//             en: "United States",
//           },
//           latitude: 33.7488,
//           longitude: -84.3877,
//           timezone: "America/New_York",
//         },
//       },
//     };

//     processor.process(contextEvent, mockSession);

//     expect(mockSession.metadata.sessionId).toBe(
//       "366fbcbb-e55b-4ca4-8090-af6b12e62c26",
//     );
//     expect(mockSession.metadata.location?.city).toBe("Atlanta");
//     expect(mockSession.metadata.location?.state).toBe("Georgia");
//     expect(mockSession.metadata.location?.country).toBe("United States");
//     expect(mockSession.metadata.device?.os).toBe("macOS");
//     expect(mockSession.metadata.device?.browser).toBe("Chromium 130"); // Check without NotABrand
//     expect(mockSession.metadata.device?.mobile).toBe(false);
//     expect(mockSession.events.significant).toHaveLength(1);
//     expect(mockSession.events.significant[0].details).toBe(
//       "Session context captured: City: Atlanta, State: Georgia, Country: United States, Chromium 130 on macOS",
//     );

//     expect(mockSession.events.byType.SessionContext).toEqual(1);
//     expect(mockSession.events.total).toEqual(1);
//   });

//   it("should process a valid context event with minimal geolocation data", () => {
//     const contextEvent: RRWebEvent = {
//       type: 51,
//       timestamp: 1730135766754,
//       data: {
//         sessionID: "some session ID",
//         url: "https://some-url.com",
//         datetime: "2024-10-28T17:16:06.754Z",
//         userAgent: {
//           raw: "Some User Agent",
//           mobile: true, // Now mobile
//           platform: "iOS",
//           brands: [], // no brands available
//         },
//         geo: {
//           city: "Unknown",
//           state: "Unknown",
//           country: "Unknown",
//           latitude: "Unknown",
//           longitude: "Unknown",
//           timezone: "America/New_York",
//         },
//         error: {
//           message: "Geo lookup failed: 500 Internal Server Error",
//           type: "Error",
//         },
//       },
//     };

//     processor.process(contextEvent, mockSession);

//     expect(mockSession.metadata.sessionId).toBe("some session ID");
//     expect(mockSession.metadata.location?.city).toBe("Unknown");
//     expect(mockSession.metadata.location?.country).toBe("Unknown"); // Check unknown values
//     expect(mockSession.metadata.device?.os).toBe("iOS");
//     expect(mockSession.metadata.device?.browser).toBe("Some User Agent"); // Correctly grabs raw if brands isn't there
//     expect(mockSession.metadata.device?.mobile).toBe(true);

//     expect(mockSession.events.significant[0].details).toBe(
//       "Context error: Geo lookup failed: 500 Internal Server Error",
//     ); // Checks for error message

//     expect(mockSession.technical.errors[0].message).toBe(
//       "Geo lookup failed: 500 Internal Server Error",
//     ); // Check if error is added to array

//     expect(mockSession.events.byType.SessionContext).toEqual(1);
//     expect(mockSession.events.total).toEqual(1);
//   });

//   it("should gracefully handle invalid event types", () => {
//     const invalidEvent: RRWebEvent = {
//       type: 3, // Invalid type
//       data: {},
//       timestamp: 1730154000000,
//     };

//     processor.process(invalidEvent, mockSession);

//     // Assertions for invalid type handling
//     expect(mockSession.events.significant).toHaveLength(0); // Should not add significant events

//     expect(mockSession.events.total).toEqual(0); // Counts should not be incremented
//     expect(mockSession.events.byType.SessionContext).toBeUndefined();
//     expect(mockSession.metadata.location).toBeUndefined();
//     expect(mockSession.metadata.device).toBeUndefined(); // Should not set device metadata
//   });

//   // Test case with null data
//   it("should not add a significant event or crash if data is null", () => {
//     const contextEventNullData: RRWebEvent = {
//       type: 51,
//       data: null, // Data is explicitly null
//       timestamp: 1730154000000,
//     };

//     processor.process(contextEventNullData, mockSession);

//     expect(mockSession.events.significant).toHaveLength(0);
//     expect(mockSession.metadata.location).toBeUndefined();
//     expect(mockSession.metadata.device).toBeUndefined(); // Device metadata not set
//     expect(mockSession.events.total).toEqual(0);
//     expect(mockSession.events.byType.SessionContext).toBeUndefined();
//   });
// });