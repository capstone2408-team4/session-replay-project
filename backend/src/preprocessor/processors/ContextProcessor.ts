import { RRWebEvent, ProcessedSession } from "../types.js";
import { BaseProcessor } from "./BaseProcessor.js";

interface RRWebContextEvent extends RRWebEvent {
  type: 51;
  data: {
    sessionID: string;
    url: string;
    datetime: string;
    userAgent: {
      raw: string;
      mobile: boolean;
      platform: string;
      brands?: { brand: string; version: string }[];
    };
    geo: {
      ip?: string;
      city?: string | { [key: string]: string };
      state?: string | { [key: string]: string };
      country?: string | { [key: string]: string };
      latitude?: number | string;
      longitude?: number | string;
      timezone?: string;
    };
    error?: {
      message: string;
      type: string;
    };
  };
}

export class ContextProcessor extends BaseProcessor {
  process(event: RRWebEvent, session: ProcessedSession): void {
    if (!this.isContextEvent(event)) return;

    this.updateEventCounts(event, session);

    const { sessionID, url, userAgent, geo, error } = event.data;

    session.metadata.sessionId = sessionID;

    session.metadata.location = {
      city: typeof geo.city === "string" ? geo.city : geo.city?.en,
      state: typeof geo.state === "string" ? geo.state : geo.state?.en,
      country: typeof geo.country === "string" ? geo.country : geo.country?.en,
      latitude: typeof geo?.latitude === "number" ? geo.latitude : undefined,
      longitude: typeof geo?.longitude === "number" ? geo.longitude : undefined,
      timezone: geo?.timezone,
    };

    session.metadata.device = {
      ...session.metadata.device, // Preserve any existing device data (e.g., from Meta event)
      os: userAgent.platform,
      browser: this.getBrowserName(userAgent),
      mobile: userAgent.mobile,
    };

    session.metadata.url = url;

    if (error) {
      this.addSignificantEvent(
        event,
        session,
        `Context error: ${error.message}`,
        `Full user geolocation details not available for this session`
      );
      session.technical.errors.push({
        timestamp: this.formatTimestamp(event.timestamp),
        type: "network",
        message: error.message,
      });
    } else {
      this.addSignificantEvent(
        event,
        session,
        `Session context captured: ${this.formatLocation(session.metadata.location)}, ${this.formatDevice(session.metadata.device)}`,
      );
    }
  }

  private isContextEvent(event: RRWebEvent): event is RRWebContextEvent {
    return (
      event.type === 51 &&
      event.data?.sessionID &&
      event.data?.url &&
      event.data?.datetime &&
      event.data?.userAgent &&
      event.data?.geo
    );
  }

  private getBrowserName(
    userAgent: RRWebContextEvent["data"]["userAgent"],
  ): string {
    if (!userAgent.brands || userAgent.brands.length === 0) return userAgent.raw || "Unknown Browser"; // Fallback to raw user agent string

    const primaryBrand = userAgent.brands.find(
      (brand) => brand.brand !== "Not?A_Brand",
    ); // Exclude Not?A_Brand
    return primaryBrand
      ? `${primaryBrand.brand} ${primaryBrand.version}`
      : "Unknown Browser";
  }

  private formatLocation(
    location: ProcessedSession["metadata"]["location"],
  ): string | undefined {
    if (!location) return;
    const { city, state, country } = location;

    let formatted = "";

    if (city) formatted += `City: ${city}, `;
    if (state) formatted += `State: ${state}, `;
    if (country) formatted += `Country: ${country}`;

    return formatted;
  }

  private formatDevice(
    device: ProcessedSession["metadata"]["device"],
  ): string | undefined {
    if (!device) return;

    const { browser, os, mobile } = device;

    return `${browser} on ${os}${mobile ? " (mobile)" : ""}`;
  }
}