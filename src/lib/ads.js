import { Adrop, ADROP_UNITS, isAdropAvailable, showAdropPopup } from "./adrop";

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
  if (!isAdropAvailable()) return;
  await ensureTrackingAuthorization();
  await showAdropPopup(ADROP_UNITS.homePopupBottom);
}
