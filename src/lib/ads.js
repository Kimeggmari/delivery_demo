import { Capacitor } from "@capacitor/core";
import { Adrop, ADROP_UNITS, isAdropAvailable, showAdropPopup } from "./adrop";
import { showNativePopupOnce } from "./adropNative";
import { AD_SLOTS_ENABLED, unitIdFor } from "../config/adUnits";

let attRequest = null;

// Apple requires the App Tracking Transparency prompt to appear before any
// data usable for tracking (e.g. IDFA) is collected, and it must not depend on
// whether an ad ends up showing this session (gating it on that is what got
// this app rejected under Guideline 2.1).
async function ensureTrackingAuthorization() {
  // Shared promise: later callers wait for the same prompt to be answered.
  attRequest ??= Adrop.requestTrackingAuthorization().catch(err => {
    console.warn("ATT request failed", err);
  });
  await attRequest;
}

// iOS app only. Ask for ATT at launch, before any ad is shown.
export async function requestAdTracking() {
  if (!isAdropAvailable()) return;
  await ensureTrackingAuthorization();
}

// Home bottom popup, once per launch (the caller decides when). Still waits for
// the ATT answer so the prompt and the popup never overlap.
export async function showLaunchPopupAd() {
  // Android: native popupBottom via the AdropNative plugin (no ATT on Android).
  if (Capacitor.getPlatform() === "android") {
    if (AD_SLOTS_ENABLED) await showNativePopupOnce(unitIdFor("homePopup", "android"));
    return;
  }
  if (!isAdropAvailable()) return;
  await ensureTrackingAuthorization();
  await showAdropPopup(ADROP_UNITS.homePopupBottom);
}
