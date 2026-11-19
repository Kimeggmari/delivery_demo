import { Adrop, ADROP_UNITS, isAdropAvailable, showAdropPopup } from "./adrop";

let attRequested = false;

// Apple requires the App Tracking Transparency prompt to appear before any
// data usable for tracking (e.g. IDFA) is collected, and it must not depend on
// whether an ad ends up showing this session (gating it on that is what got
// this app rejected under Guideline 2.1).
async function ensureTrackingAuthorization() {
  if (attRequested) return;
  attRequested = true;
  try {
    await Adrop.requestTrackingAuthorization();
  } catch (err) {
    console.warn("ATT request failed", err);
  }
}

// Cold-start ads (iOS app only): ATT prompt, then the Adrop home bottom popup.
export async function showLaunchAds() {
  if (!isAdropAvailable()) return;
  await ensureTrackingAuthorization();
  await showAdropPopup(ADROP_UNITS.homePopupBottom);
}
