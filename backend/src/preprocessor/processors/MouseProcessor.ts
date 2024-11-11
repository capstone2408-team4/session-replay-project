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
  };
}

interface DOMEvent extends RRWebEvent {
  type: 3;
  data: {
    source: 0;  // Mutation source
  };
}

export class MouseProcessor extends BaseProcessor {
  // Configuration
  private static readonly RAGE_CLICK_THRESHOLD = 5;  // clicks per second
  private static readonly SHAKE_TIMEOUT = 1500;      // ms between shakes
  private static readonly MOUSE_MOVE_THRESHOLD = 8;  // minimum moves for shake
  private static readonly DEAD_CLICK_TIMEOUT = 1000; // ms to wait for DOM change

  processEvents(events: RRWebEvent[], session: ProcessedSession): void {
    // Extract relevant event sequences
    const clickEvents = this.extractEvents<MouseClickEvent>(events, e => 
      e.type === 3 && e.data.source === 2 && e.data.type === 2
    );
    
    const moveEvents = this.extractEvents<MouseMoveEvent>(events, e =>
      e.type === 3 && e.data.source === 1
    );
    
    const domEvents = this.extractEvents<DOMEvent>(events, e =>
      e.type === 3 && e.data.source === 0
    );

    const rageClickTimestamps = new Set<number>();

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
        `Rage click detected - ${MouseProcessor.RAGE_CLICK_THRESHOLD}+ clicks per second`,
        'Possible indication of user frustration',
        'User Frustration'
      );
    });

    // Exclude rage clicks from dead click detection
    const deadClickTimes = this.findDeadClickTimestamps(clickEvents, domEvents);
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

  private findDeadClickTimestamps(clicks: MouseClickEvent[], mutations: DOMEvent[]): number[] {
    const clickTimes = clicks.map(click => click.timestamp);
    const mutationTimes = mutations.map(mutation => mutation.timestamp);
    const deadClicks: number[] = [];

    let clickIndex = 0;
    let mutationIndex = 0;

    while (clickIndex < clickTimes.length && mutationIndex < mutationTimes.length) {
      const click = clickTimes[clickIndex];
      const mutation = mutationTimes[mutationIndex];
      
      if (mutation > click && (mutation - click) > MouseProcessor.DEAD_CLICK_TIMEOUT) {
        deadClicks.push(click);
        clickIndex++;
      } else if (mutation > click) {
        clickIndex++;
      }
      mutationIndex++;
    }
    
    return deadClicks.concat(clickTimes.slice(clickIndex));
  }

  private findRageClickTimestamps(clicks: MouseClickEvent[]): number[] {
    if (clicks.length === 0) return [];
    
    const rageTimes: number[] = [];
    let start = clicks[0].timestamp;
    let millisElapsed = 0;
    let clickCount = 0;

    for (let i = 1; i < clicks.length; i++) {
      millisElapsed += (clicks[i].timestamp - start);
      start = clicks[i].timestamp;

      if (millisElapsed >= 1000) {
        clickCount = 0;
        millisElapsed = 0;
        continue;
      }

      clickCount++;

      if (clickCount === MouseProcessor.RAGE_CLICK_THRESHOLD) {
        rageTimes.push(start - 1000);
        start = clicks[i + 1]?.timestamp ?? start;
        clickCount = 0;
        millisElapsed = 0;
      }
    }

    return rageTimes;
  }

  private detectMouseShaking(moves: MouseMoveEvent[], session: ProcessedSession): void {
    // Extract and process move positions
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
    
    for (let i = 0; i < moves.length - 2; i++) {
      if (moves[i].length >= MouseProcessor.MOUSE_MOVE_THRESHOLD && 
          moves[i + 1].length >= MouseProcessor.MOUSE_MOVE_THRESHOLD && 
          moves[i + 2].length >= MouseProcessor.MOUSE_MOVE_THRESHOLD) {
        consecutive.push(moves[i]);
      }
    }
    
    return consecutive;
  }

  private filterNonLinearMovements(moveSets: MousePosition[][]): MousePosition[][] {
    return moveSets.filter(set => !this.hasLinearMovement(set));
  }

  private hasLinearMovement(positions: MousePosition[]): boolean {
    let xMovement = 0;
    let yMovement = 0;

    for (let i = 0; i < positions.length - 1; i++) {
      const prevX = xMovement;
      const prevY = yMovement;
      
      xMovement += (positions[i + 1].x - positions[i].x);
      yMovement += (positions[i + 1].y - positions[i].y);

      if (Math.abs(xMovement) < Math.abs(prevX) || 
          Math.abs(yMovement) < Math.abs(prevY)) {
        return false;
      }
    }

    return true;
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