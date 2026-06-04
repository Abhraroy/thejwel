/**
 * Client-side Meta Pixel helpers.
 *
 * The Pixel is bootstrapped in `MetaPixel.tsx`. Here we expose a typed
 * `trackPurchase` that fires `fbq('track','Purchase', ..., { eventID })`.
 *
 * IMPORTANT: always pass `eventId = order_id` (the same id used by the server
 * Conversions API) so Meta deduplicates the two events into one conversion.
 * Only call this AFTER the order API has returned success, so the Pixel can
 * never fire for an order that was not actually written to the DB.
 */

type Fbq = (
  action: string,
  event: string,
  params?: Record<string, unknown>,
  options?: { eventID?: string }
) => void;

export interface TrackPurchaseArgs {
  eventId: string;
  value: number;
  currency?: string;
  contentIds?: string[];
}

export function trackPurchase({
  eventId,
  value,
  currency = "INR",
  contentIds,
}: TrackPurchaseArgs): void {
  if (typeof window === "undefined") return;
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  if (typeof fbq !== "function") return;

  const params: Record<string, unknown> = {
    value: Number(value) || 0,
    currency,
  };
  if (contentIds && contentIds.length > 0) {
    params.content_ids = contentIds;
    params.content_type = "product";
  }

  try {
    fbq("track", "Purchase", params, { eventID: eventId });
  } catch {
    // Never let analytics throw into the checkout flow.
  }
}
