import { Capacitor, registerPlugin } from "@capacitor/core";

// App-local native plugin (ios/App/App/AdropPlugin.swift). iOS only for now —
// Android has no Adrop integration yet.
export const Adrop = registerPlugin("Adrop");

export const isAdropAvailable = () => Capacitor.getPlatform() === "ios";

// Ad units from the Adrop console (app: 음식만안와요, iOS). The splash unit
// is wired natively in AppDelegate.swift.
export const ADROP_UNITS = {
  homeBanner: "01M7RV2VP6165FMZ9V8XNKAEZF",     // iOS_홈_안내문구하단_banner 320×100
  homePopupBottom: "01M7RV27DCWC1ETF2K47YAAJQ6", // iOS_홈_하단_popupBottom
  trackingBanner: "01M7RV3P9S5TD6TW9QC7SWT99S", // iOS_주문대기_라이더정보하단_banner 320×50
  completeNative: "01M7RV4GA95PHSNPAH6BBPNEH2", // iOS_주문완료_최하단_native 320×180
};

// Resolves true if the popup was actually shown.
export async function showAdropPopup(unitId) {
  if (!isAdropAvailable()) return false;
  try {
    const { shown } = await Adrop.showPopup({ unitId });
    return !!shown;
  } catch (err) {
    console.warn("Adrop popup failed", err);
    return false;
  }
}
