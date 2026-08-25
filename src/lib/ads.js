import { Capacitor } from "@capacitor/core";
import { AdMob } from "@capacitor-community/admob";

const INTERSTITIAL_AD_UNIT_ID = {
  android: "ca-app-pub-5173827714526228/4241115991",
  // TODO_IOS_ADMOB: replace with the real iOS interstitial ad unit ID from
  // the AdMob console once the iOS app is registered there.
  ios: "ca-app-pub-3940256099942544/4411468910", // Google's public iOS test interstitial unit
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
