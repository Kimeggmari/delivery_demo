import { Capacitor } from "@capacitor/core";
import { AdMob } from "@capacitor-community/admob";

const INTERSTITIAL_AD_UNIT_ID = "ca-app-pub-5173827714526228/4241115991";
const COLD_START_SHOW_PROBABILITY = 0.3;

let initialized = false;

export async function maybeShowColdStartInterstitial() {
  if (!Capacitor.isNativePlatform()) return;
  if (Math.random() >= COLD_START_SHOW_PROBABILITY) return;

  try {
    if (!initialized) {
      await AdMob.initialize();
      initialized = true;
    }
    await AdMob.prepareInterstitial({ adId: INTERSTITIAL_AD_UNIT_ID });
    await AdMob.showInterstitial();
  } catch (err) {
    console.warn("AdMob interstitial failed", err);
  }
}
