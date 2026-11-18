import { Adrop } from "@adrop/ads-web-sdk";

let initialized = false;

// Initializes the Adrop web SDK once. Returns false when no App ID is set yet.
// `fixed` backfill mode fills the slot's inline aspect-ratio box (see AdSlot).
export function initAdrop(appId) {
  if (!appId) return false;
  if (!initialized) {
    Adrop.observe({ appId, debug: import.meta.env.DEV, backfillMode: "fixed" });
    initialized = true;
  }
  return true;
}

export { Adrop };
