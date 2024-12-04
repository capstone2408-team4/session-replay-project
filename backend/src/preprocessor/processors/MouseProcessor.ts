import { RRWebEvent, ProcessedSession } from '../types.js';
import { BaseProcessor } from './BaseProcessor.js';

interface MousePosition {
  x: number;
  y: number;
  id: number;
  timeOffset?: number;
  timestamp?: number;
}

interface MouseMoveEvent extends RRWebEvent {
  type: 3;
  data: {
    source: 1;
    positions: MousePosition[];
  };
}

interface MouseClickEvent extends RRWebEvent {
  type: 3;
  data: {
    source: 2;
    type: 2;  // Click type
    id: number;
    x: number;
    y: number;
    tag?: string;
  };
}

interface MouseInteractionEvent extends RRWebEvent {
  type: 3;
  data: {
    source: 2;
    type: number;  // All mouse interaction types
    id: number;
  };
}

interface DOMEvent extends RRWebEvent {
  type: 3;
  data: {
    source: 0;  // Mutation source
  };
}

enum MouseEventTypes {
  MouseUp = 0,
  MouseDown = 1,
  Click = 2,
  ContextMenu = 3,
  DblClick = 4,
  Focus = 5,
  Blur = 6,
  TouchStart = 7,
  TouchMove = 8,
  TouchEnd = 9
}

export class MouseProcessor extends BaseProcessor {
  // Configuration
  private static readonly RAGE_CLICK_THRESHOLD = 5;  // clicks per second
  private static readonly SHAKE_TIMEOUT = 5000;      // ms between shakes
  private static readonly MOUSE_MOVE_THRESHOLD = 8;  // minimum moves for shake
  private static readonly DEAD_CLICK_TIMEOUT = 1000; // ms to wait for DOM change

  processEvents(events: RRWebEvent[], session: ProcessedSession): void {
    // Extract relevant event sequences
    const clickEvents = this.extractEvents<MouseClickEvent>(events, e => 
      e.type === 3 && e.data.source === 2 && e.data.type === MouseEventTypes.Click
    );
    
    const moveEvents = this.extractEvents<MouseMoveEvent>(events, e =>
      e.type === 3 && e.data.source === 1
    );
    
    const domEvents = this.extractEvents<DOMEvent>(events, e =>
      e.type === 3 && e.data.source === 0
    );

    // Extract focus/blur events
    const interactionEvents = this.extractEvents<MouseInteractionEvent>(events, e =>
      e.type === 3 && e.data.source === 2 && 
      [MouseEventTypes.Focus, MouseEventTypes.Blur].includes(e.data.type)
    );

    // Track which timestamps have been marked as rage clicks
    const rageClickTimestamps = new Set<number>();

    // Process rage clicks first
    const rageClickTimes = this.findRageClickTimestamps(clickEvents);
    rageClickTimes.forEach(timestamp => {
      // Add all clicks within 1 second of rage click detection
      clickEvents.forEach(click => {
        if (Math.abs(click.timestamp - timestamp) <= 1000) {
          rageClickTimestamps.add(click.timestamp);
        }
      });

      this.addSignificantEvent(
        { type: 3, data: { source: 2 }, timestamp } as RRWebEvent,
        session,
        'Rage click detected - 5+ clicks per second',
        'Possible indication of user frustration',
        'User Frustration'
      );
    });

    // Then process dead clicks, excluding those already marked as rage clicks
    const deadClickTimes = this.findDeadClickTimestamps(clickEvents, domEvents, interactionEvents);
    deadClickTimes.forEach(timestamp => {
      if (!rageClickTimestamps.has(timestamp)) {
        this.addSignificantEvent(
          { type: 3, data: { source: 2 }, timestamp } as RRWebEvent,
          session,
          'Dead click detected - no DOM response to user interaction',
          'Possible user frustration or UI unresponsiveness',
          'User Frustration'
        );
      }
    });

    this.detectMouseShaking(moveEvents, session);
  }

  private findDeadClickTimestamps(
    clicks: MouseClickEvent[], 
    mutations: DOMEvent[],
    interactions: MouseInteractionEvent[]
  ): number[] {
    const deadClicks: number[] = [];
  
    clickLoop:
    for (const click of clicks) {
      // Skip if this is a click on form elements
      if (click.data.tag && ['input', 'textarea', 'select'].includes(click.data.tag.toLowerCase())) {
        continue;
      }
  
      // Look for any response within timeout window
      const hasResponse = [...mutations, ...interactions].some(event => {
        const timeDiff = event.timestamp - click.timestamp;
        return timeDiff > 0 && timeDiff <= MouseProcessor.DEAD_CLICK_TIMEOUT;
      });
  
      if (!hasResponse) {
        deadClicks.push(click.timestamp);
      }
    }
  
    return deadClicks;
  }

  private findRageClickTimestamps(clicks: MouseClickEvent[]): number[] {
    if (clicks.length === 0) return [];
    
    const rageTimes: number[] = [];
    let start = clicks[0].timestamp;
    let millisElapsed = 0;
    let clickCount = 1;

    for (let i = 1; i < clicks.length; i++) {
      millisElapsed = clicks[i].timestamp - start;

      if (millisElapsed >= 1000) {
        clickCount = 1;
        start = clicks[i].timestamp;
        continue;
      }

      clickCount++;

      if (clickCount >= MouseProcessor.RAGE_CLICK_THRESHOLD) {
        rageTimes.push(start);
        start = clicks[i + 1]?.timestamp ?? start;
        clickCount = 0;
      }
    }

    return rageTimes;
  }

  private detectMouseShaking(moves: MouseMoveEvent[], session: ProcessedSession): void {
    const movePositions = this.extractMovePositions(moves);
    const consecutiveMoves = this.findConsecutiveMovements(movePositions);
    const nonLinearMoves = this.filterNonLinearMovements(consecutiveMoves);
    const shakeTimestamps = this.findShakeTimestamps(nonLinearMoves);

    shakeTimestamps.forEach(timestamp => {
      this.addSignificantEvent(
        { type: 3, data: { source: 1 }, timestamp } as RRWebEvent,
        session,
        'Mouse shaking detected - rapid non-linear movements',
        'Possible user frustration or uncertainty',
        'User Frustration'
      );
    });
  }

  private extractMovePositions(moves: MouseMoveEvent[]): MousePosition[][] {
    return moves.map(move => {
      const positions = move.data.positions;
      positions[0].timestamp = move.timestamp;
      return positions;
    });
  }

  private findConsecutiveMovements(moves: MousePosition[][]): MousePosition[][] {
    const consecutive: MousePosition[][] = [];
    
    for (const moveSet of moves) {
      if (moveSet.length >= MouseProcessor.MOUSE_MOVE_THRESHOLD) {
        consecutive.push(moveSet);
      }
    }
    
    return consecutive;
  }

  private filterNonLinearMovements(moveSets: MousePosition[][]): MousePosition[][] {
    return moveSets.filter(set => !this.hasLinearMovement(set));
  }

  private hasLinearMovement(positions: MousePosition[]): boolean {
    if (positions.length < 3) return true;
    
    let shakeCount = 0;
    const ANGLE_THRESHOLD = 140; // degrees
    
    for (let i = 1; i < positions.length - 1; i++) {
      const prev = positions[i-1];
      const curr = positions[i];
      const next = positions[i+1];
      
      const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
      const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x);
      
      const change = Math.abs(angle2 - angle1) * (180/Math.PI);
      
      if (change > ANGLE_THRESHOLD) {
        shakeCount++;
      }
    }
    
    return shakeCount < 3;
  }

  private findShakeTimestamps(moveSets: MousePosition[][]): number[] {
    const timestamps = moveSets.map(set => set[0].timestamp!);
    const shakeTimestamps: number[] = [];
    
    let anchor = 0;
    let runner = 1;

    while (runner < timestamps.length) {
      const elapsed = timestamps[runner] - timestamps[anchor];
      
      if (elapsed > MouseProcessor.SHAKE_TIMEOUT) {
        shakeTimestamps.push(timestamps[anchor]);
        anchor = runner;
      }
      runner++;
    }

    if (shakeTimestamps[shakeTimestamps.length - 1] !== 
        timestamps[timestamps.length - 1]) {
      shakeTimestamps.push(timestamps[timestamps.length - 1]);
    }

    return shakeTimestamps;
  }

  private extractEvents<T extends RRWebEvent>(
    events: RRWebEvent[], 
    predicate: (event: RRWebEvent) => boolean
  ): T[] {
    return events.filter(predicate) as T[];
  }
}