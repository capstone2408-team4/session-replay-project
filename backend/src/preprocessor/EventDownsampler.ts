import { RRWebEvent } from './types';

export class EventDownsampler {
  private readonly SCROLL_THRESHOLD = 20;      // Minimum pixels scrolled
  private readonly TIME_THRESHOLD = 50;        // Minimum ms between events
  
  downsample(events: RRWebEvent[]): RRWebEvent[] {
    return events.reduce((acc: RRWebEvent[], event: RRWebEvent, index: number) => {
      // Keep non-incremental events
      if (event.type !== 3) {
        acc.push(event);
        return acc;
      }

      switch (event.data.source) {
        case 1: // MouseMove
          // Only downsample "stable" mouse movements
          // Keep rapid movements that might indicate frustration
          if (this.isStableMouseMovement(event, events[index - 1])) {
            if (this.shouldKeepMovement(event, events[index - 1])) {
              acc.push(event);
            }
          } else {
            // Keep all potentially erratic movements for frustration detection
            acc.push(event);
          }
          break;

        case 3: // Scroll
          if (this.shouldKeepScroll(event, events[index - 1])) {
            acc.push(event);
          }
          break;

        case 4: // ViewportResize
          if (this.shouldKeepResize(event, events[index - 1])) {
            acc.push(event);
          }
          break;

        case 12: // Drag - keep all drag events as they're user-intentional
          acc.push(event);
          break;

        default:
          // Keep all other event types (especially MouseInteraction for rage/dead clicks)
          acc.push(event);
      }

      return acc;
    }, []);
  }

  private isStableMouseMovement(current: RRWebEvent, previous: RRWebEvent): boolean {
    if (!previous || !current.data.positions || !previous.data.positions) {
      return true;
    }

    const currentPositions = current.data.positions;
    const prevPositions = previous.data.positions;

    // Check if movement is relatively linear and slow
    // Fast or erratic movements might indicate frustration
    const isSlowMovement = 
      current.timestamp - previous.timestamp > 100; // More than 100ms between events

    const isLinearMovement = this.isLinearPath(
      [...prevPositions, ...currentPositions]
    );

    return isSlowMovement && isLinearMovement;
  }

  private isLinearPath(positions: Array<{x: number, y: number}>): boolean {
    if (positions.length < 3) return true;

    // Calculate average direction change
    let directionChanges = 0;
    for (let i = 2; i < positions.length; i++) {
      const prev = positions[i - 2];
      const curr = positions[i - 1];
      const next = positions[i];

      const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
      const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x);
      const change = Math.abs(angle2 - angle1);

      if (change > Math.PI / 4) { // More than 45 degree change
        directionChanges++;
      }
    }

    // Consider path linear if less than 33% of movements involve sharp turns
    return directionChanges / positions.length < 0.33;
  }

  // Original methods remain same
  private shouldKeepMovement(current: RRWebEvent, previous: RRWebEvent): boolean {
    if (!previous || previous.data?.source !== current.data?.source) {
      return true;
    }

    if (current.timestamp - previous.timestamp < this.TIME_THRESHOLD) {
      return false;
    }

    // Only filter very small movements
    if (current.data.positions && previous.data.positions) {
      const currentPos = current.data.positions[current.data.positions.length - 1];
      const previousPos = previous.data.positions[previous.data.positions.length - 1];

      const distance = Math.sqrt(
        Math.pow(currentPos.x - previousPos.x, 2) + 
        Math.pow(currentPos.y - previousPos.y, 2)
      );

      return distance >= 5; // Very small threshold to keep most meaningful movements
    }

    return true;
  }

  private shouldKeepScroll(current: RRWebEvent, previous: RRWebEvent): boolean {
    if (!previous || previous.data?.source !== 3) {
      return true;
    }

    if (current.timestamp - previous.timestamp < this.TIME_THRESHOLD) {
      return false;
    }

    const scrollDiff = Math.abs(current.data.y - previous.data.y);
    return scrollDiff >= this.SCROLL_THRESHOLD;
  }

  private shouldKeepResize(current: RRWebEvent, previous: RRWebEvent): boolean {
    if (!previous || previous.data?.source !== 4) {
      return true;
    }

    if (current.timestamp - previous.timestamp < this.TIME_THRESHOLD) {
      return false;
    }

    const widthDiff = Math.abs(current.data.width - previous.data.width);
    const heightDiff = Math.abs(current.data.height - previous.data.height);

    return widthDiff > 20 || heightDiff > 20;
  }
}