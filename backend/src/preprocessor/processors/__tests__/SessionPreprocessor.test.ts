// import { describe, it, expect, beforeEach } from "vitest";
// import { SessionPreprocessor } from "../../SessionPreprocessor.js";
// import { RRWebEvent } from "../../types.js";

// describe("SessionPreprocessor", () => {
//   let preprocessor: SessionPreprocessor;

//   beforeEach(() => {
//     preprocessor = new SessionPreprocessor();
//   });

//   it("should process a session with meta, full snapshot, and context events", () => {
//     const events: RRWebEvent[] = [];

//     const processedSession = preprocessor.process(events);

//     // Assertions

//     // Meta event and Context (geo) event processing
//     expect(processedSession.metadata.url).toBe("https://providenceapp.jjjones.dev/");
//     expect(processedSession.metadata.sessionId).toBe("6b1138f4-48ea-49c6-9623-173ea3ad3948");
//     expect(processedSession.metadata.startTime).toBe(
//       "2024-10-29T15:37:56.791Z",
//     );
//     expect(processedSession.metadata.endTime).toBe('2024-10-29T15:38:03.377Z');
//     expect(processedSession.metadata.duration).toEqual(6);

//     expect(processedSession.metadata.device?.viewport?.width).toBe(1440);
//     expect(processedSession.metadata.device?.viewport?.height).toBe(788);

//     expect(processedSession.metadata.location?.country).toBe("United States");

//     expect(processedSession.metadata.device?.os).toBe("macOS");
//     expect(processedSession.metadata.device?.browser).toBe("Chromium 130");
//     expect(processedSession.metadata.device?.mobile).toBe(false);

//     // FullSnapshot event processing & BaseProcessor testing
//     if (processedSession.dom && processedSession.dom.fullSnapshot) {
//       // expect(processedSession.dom.fullSnapshot).toEqual(events[1]);
//       expect(processedSession.dom?.allNodes).toHaveLength(437);
//     }
//     expect(processedSession.events.total).toBe(3); // 17
//     expect(processedSession.events.byType.Meta).toEqual(1);
//     expect(processedSession.events.byType.FullSnapshot).toEqual(1);
//     expect(processedSession.events.byType.IncrementalSnapshot).toEqual(undefined); // 13
//     expect(processedSession.events.byType.SessionContext).toEqual(1);
//     expect(processedSession.events.bySource.MouseMove).toEqual(undefined); // 5
//     // expect(processedSession.events.bySource.MouseInteraction).toEqual(undefined); // NONE
//   });

//   it("should handle an empty events array", () => {
//     expect(() => preprocessor.process([])).toThrowError(
//       "No events provided for processing",
//     );
//   });

//   it("should handle a session with no meta, full snapshot, or context events", () => {
//     const processedSession = preprocessor.process([
//       { type: 0, data: {}, timestamp: 123 },
//     ]); // Arbitrary event

//     expect(processedSession.metadata.url).toBeUndefined();
//     expect(processedSession.metadata.sessionId).toBe("");
//     expect(processedSession.metadata.startTime).toBe('1970-01-01T00:00:00.123Z');
//     expect(processedSession.metadata.endTime).toBe('1970-01-01T00:00:00.123Z');

//     expect(processedSession.metadata.duration).toEqual(0);

//     expect(processedSession.metadata.device).toBeUndefined();
//     expect(processedSession.metadata.location).toBeUndefined();
//     expect(processedSession.dom?.allNodes).toEqual([]);
//   });

//   // Future processor tests
// });