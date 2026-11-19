import { Capacitor } from "@capacitor/core";
import { AdMob } from "@capacitor-community/admob";

const INTERSTITIAL_AD_UNIT_ID = {
  android: "ca-app-pub-5173827714526228/4241115991",
  ios: "ca-app-pub-5173827714526228/5469889411",
};
const COLD_START_SHOW_PROBABILITY = 0.3;

let initialized = false;
let attRequested = false;

// Apple requires the App Tracking Transparency prompt to appear before any
// data usable for tracking (e.g. IDFA) is collected — it must not depend on
// whether an ad ends up showing this session (interstitials are gated behind
// COLD_START_SHOW_PROBABILITY below, so gating ATT on that too would mean
// most launches never show the prompt, which is what got this app rejected
// under Guideline 2.1).
async function ensureTrackingAuthorization() {
  if (attRequested) return;
  attRequested = true;
  if (Capacitor.getPlatform() !== "ios") return;
  try {
    await AdMob.requestTrackingAuthorization();
  } catch (err) {
    console.warn("ATT request failed", err);
  }
}

export async function maybeShowColdStartInterstitial() {
  if (!Capacitor.isNativePlatform()) return;
  await ensureTrackingAuthorization();
  if (Math.random() >= COLD_START_SHOW_PROBABILITY) return;

  const adId = INTERSTITIAL_AD_UNIT_ID[Capacitor.getPlatform()];
  if (!adId) return;

  try {
    if (!initialized) {
      await AdMob.initialize();
      initialized = true;
    }
    await AdMob.prepareInterstitial({ adId });
    await AdMob.showInterstitial();
  } catch (err) {
    console.warn("AdMob interstitial failed", err);
  }
}
