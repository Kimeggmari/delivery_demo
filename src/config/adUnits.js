// Ad slot definitions (from the ad network's unit sheet).
// Unit name pattern: {OS}_{페이지}_{지면 위치}_{format}  e.g. iOS_홈_안내문구하단_banner
//
// Until AD_APP_ID and a slot's unit id are filled in, AdSlot only reserves the
// space (placeholder box). Once both are set, banner/native slots render real
// ads through the Adrop web SDK inside the app WebView. splash / popupBottom are
// native-only formats (see the AdropNative Capacitor plugin).

// Flip to false to hide every ad slot (no space reserved).
export const AD_SLOTS_ENABLED = true;

// Adrop Web SDK App ID (console > Admin > App), used by the web SDK to request
// banner/native ads. NOT the Google Mobile Ads backfill APPLICATION_ID
// (ca-app-pub-...~..., which lives only in AndroidManifest.xml meta-data) -
// decoded from android/app/src/main/assets/adrop_service.json's app_key JWT.
export const AD_APP_ID = { ios: "", android: "01M60HA750030M7WWPGPS2BT6M:01M62N89MMHK3AB92DQBAVR329" };

// Public test unit ids (Adrop docs). Only used in dev builds.
const TEST_UNIT_ID = {
  splash: "PUBLIC_TEST_UNIT_ID_SPLASH",
  homePopup: "PUBLIC_TEST_UNIT_ID_POPUP_BOTTOM",
  homeBanner: "PUBLIC_TEST_UNIT_ID_320_100",
  trackingBanner: "PUBLIC_TEST_UNIT_ID_320_50",
  completeNative: "PUBLIC_TEST_UNIT_ID_NATIVE",
};

// Real unit ids per OS, from the console's Ad Unit tab. Leave "" until issued.
// Android units issued 2026-11-18 (console shows them as 처리중 for backfill until Adrop finishes setup).
const UNIT_ID = {
  splash:         { ios: "", android: "01M7PX64ASWYR7RGTXEQSF0YTB" },
  homePopup:      { ios: "", android: "01M7PX8F4CS6VB1M15HSWKJYTC" },
  homeBanner:     { ios: "", android: "01M7PX9HQFSQ1JFRPQEHB9N2MV" },
  trackingBanner: { ios: "", android: "01M7PXA8MT4NYQA8FZT3QTRTRN" },
  completeNative: { ios: "", android: "01M7PXBDDDZQ5P6FE0931QA00C" },
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
  // Console registered these with Adrop's fixed sizes: popup 360x240, native 600x314.
  homePopup:      unit("homePopup",      "popupBottom", "홈",       "하단",         360, 240, false),
  homeBanner:     unit("homeBanner",     "banner",      "홈",       "안내문구하단", 320, 100, true),
  trackingBanner: unit("trackingBanner", "banner",      "주문대기", "라이더정보하단", 320, 50,  true),
  completeNative: unit("completeNative", "native",      "주문완료", "최하단",       600, 314, true),
};

// Unit id to request for a slot on this OS, or "" when the slot isn't wired yet.
// Dev builds fall back to the public test id so the flow can be tried early.
export function unitIdFor(slot, os) {
  return UNIT_ID[slot]?.[os] || (import.meta.env.DEV ? TEST_UNIT_ID[slot] : "") || "";
}
