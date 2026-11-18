// Ad slot definitions (from the ad network's unit sheet).
// Unit name pattern: {OS}_{페이지}_{지면 위치}_{format}  e.g. iOS_홈_안내문구하단_banner
//
// Until AD_APP_ID and a slot's unit id are filled in, AdSlot only reserves the
// space (placeholder box). Once both are set, banner/native slots render real
// ads through the Adrop web SDK inside the app WebView. splash / popupBottom are
// native-only formats (see the AdropNative Capacitor plugin).

// Flip to false to hide every ad slot (no space reserved).
export const AD_SLOTS_ENABLED = true;

// 광고 App ID, issued per platform by the ad network (console > Admin > App).
export const AD_APP_ID = { ios: "", android: "" };

// Public test unit ids (Adrop docs). Only used in dev builds.
const TEST_UNIT_ID = {
  splash: "PUBLIC_TEST_UNIT_ID_SPLASH",
  homePopup: "PUBLIC_TEST_UNIT_ID_POPUP_BOTTOM",
  homeBanner: "PUBLIC_TEST_UNIT_ID_320_100",
  trackingBanner: "PUBLIC_TEST_UNIT_ID_320_50",
  completeNative: "PUBLIC_TEST_UNIT_ID_NATIVE",
};

// Real unit ids per OS, from the console's Ad Unit tab. Leave "" until issued.
const UNIT_ID = {
  splash:         { ios: "", android: "" },
  homePopup:      { ios: "", android: "" },
  homeBanner:     { ios: "", android: "" },
  trackingBanner: { ios: "", android: "" },
  completeNative: { ios: "", android: "" },
};

const unit = (key, format, page, position, width, height, backfill) => ({
  key, format, page, position, width, height, backfill,
  names: {
    ios: `iOS_${page}_${position}_${format}`,
    android: `Android_${page}_${position}_${format}`,
  },
});

export const AD_UNITS = {
  // Sheet says 320x480, but Adrop's splash ad area is 360x270dp (docs), so follow the SDK.
  splash:         unit("splash",         "splash",      "시작",     "하단",         360, 270, false),
  homePopup:      unit("homePopup",      "popupBottom", "홈",       "하단",         320, 100, false),
  homeBanner:     unit("homeBanner",     "banner",      "홈",       "안내문구하단", 320, 100, true),
  trackingBanner: unit("trackingBanner", "banner",      "주문대기", "라이더정보하단", 320, 50,  true),
  completeNative: unit("completeNative", "native",      "주문완료", "최하단",       320, 50,  true),
};

// Unit id to request for a slot on this OS, or "" when the slot isn't wired yet.
// Dev builds fall back to the public test id so the flow can be tried early.
export function unitIdFor(slot, os) {
  return UNIT_ID[slot]?.[os] || (import.meta.env.DEV ? TEST_UNIT_ID[slot] : "") || "";
}
