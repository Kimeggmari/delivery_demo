import { Capacitor } from "@capacitor/core";
import { AdMob } from "@capacitor-community/admob";

const INTERSTITIAL_AD_UNIT_ID = {
  android: "ca-app-pub-5173827714526228/4241115991",
  ios: "ca-app-pub-5173827714526228/5469889411",
};
const COLD_START_SHOW_PROBABILITY = 0.3;

let initialized = false;

export async function maybeShowColdStartInterstitial() {
  if (!Capacitor.isNativePlatform()) return;
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
