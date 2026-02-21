"use client";

export type AnalyticsValue = string | number | boolean | null;
export type AnalyticsProperties = Record<string, AnalyticsValue | undefined>;

export type KnownAnalyticsEvent =
  | "page_viewed"
  | "page_left"
  | "cta_clicked"
  | "experiment_exposed"
  | "practice_started"
  | "question_answered"
  | "practice_submitted"
  | "practice_scored"
  | "practice_abandoned"
  | "subscription_checkout_started"
  | "subscription_checkout_completed"
  | "subscription_portal_opened"
  | "checkout_started"
  | "checkout_completed"
  | "paywall_viewed";

interface PostHogClient {
  capture: (eventName: string, properties?: Record<string, AnalyticsValue>) => void;
  identify: (distinctId: string, userProperties?: Record<string, AnalyticsValue>) => void;
  reset: () => void;
  getFeatureFlag?: (key: string) => string | boolean | undefined;
  isFeatureEnabled?: (key: string) => boolean | undefined;
  onFeatureFlags?: (callback: () => void) => unknown;
}

declare global {
  interface Window {
    posthog?: PostHogClient;
  }
}

function getPostHogClient(): PostHogClient | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.posthog ?? null;
}

function sanitizeProperties(
  properties?: AnalyticsProperties
): Record<string, AnalyticsValue> | undefined {
  if (!properties) {
    return undefined;
  }

  const cleanProperties: Record<string, AnalyticsValue> = {};

  Object.entries(properties).forEach(([key, value]) => {
    if (value !== undefined) {
      cleanProperties[key] = value;
    }
  });

  return cleanProperties;
}

export function captureEvent(
  eventName: KnownAnalyticsEvent | (string & {}),
  properties?: AnalyticsProperties
): void {
  const client = getPostHogClient();
  if (!client) {
    return;
  }

  client.capture(eventName, sanitizeProperties(properties));
}

export function captureEventOnce(
  eventName: KnownAnalyticsEvent | (string & {}),
  dedupeKey: string,
  properties?: AnalyticsProperties
): void {
  if (typeof window === "undefined") {
    return;
  }

  const sessionKey = `analytics_once:${eventName}:${dedupeKey}`;

  try {
    const alreadySent = window.sessionStorage.getItem(sessionKey);
    if (alreadySent === "1") {
      return;
    }

    captureEvent(eventName, properties);
    window.sessionStorage.setItem(sessionKey, "1");
  } catch {
    // Storage can be blocked in some browsers/settings; still emit event once best-effort.
    captureEvent(eventName, properties);
  }
}

export function identifyUser(
  distinctId: string,
  userProperties?: AnalyticsProperties
): void {
  const client = getPostHogClient();
  if (!client) {
    return;
  }

  client.identify(distinctId, sanitizeProperties(userProperties));
}

export function resetAnalyticsIdentity(): void {
  const client = getPostHogClient();
  if (!client) {
    return;
  }

  client.reset();
}

export function getFeatureFlagVariant(flagKey: string): string | boolean | undefined {
  const client = getPostHogClient();
  return client?.getFeatureFlag?.(flagKey);
}

export function onFeatureFlagsLoaded(callback: () => void): (() => void) | undefined {
  const client = getPostHogClient();
  if (!client?.onFeatureFlags) {
    return undefined;
  }

  const maybeUnsubscribe = client.onFeatureFlags(callback);
  if (typeof maybeUnsubscribe === "function") {
    return maybeUnsubscribe as () => void;
  }

  return undefined;
}
