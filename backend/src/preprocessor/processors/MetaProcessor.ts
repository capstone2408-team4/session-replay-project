import { RRWebEvent, ProcessedSession } from '../types.js';
import { BaseProcessor } from './BaseProcessor.js';

interface RRWebMetaEvent extends RRWebEvent {
  type: 4;
  data: {
    href: string;
    width: number;
    height: number;
  };
}

export class MetaProcessor extends BaseProcessor {
  process(event: RRWebEvent, session: ProcessedSession): void {
    if (!this.isMetaEvent(event)) return;

    const { href, width, height } = event.data;

    session.metadata.url = href;
    session.metadata.device = session.metadata.device ||
      { os: '', browser: '', mobile: false };
    session.metadata.device.viewport = { width, height };

    this.updateEventCounts(event, session);

    this.addSignificantEvent(event, session,
      `Initial page view: ${href} (viewport: ${width}x${height})`,
      `Page loaded with initial viewport dimensions.`,
      `Initial Page View`
    );
  }

  private isMetaEvent(event: RRWebEvent): event is RRWebMetaEvent {
    return event.type === 4 && event.data?.href && event.data?.width && event.data?.height;
  }
}