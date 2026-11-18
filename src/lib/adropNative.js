import { Capacitor, registerPlugin } from "@capacitor/core";

// Native-only Adrop formats (popupBottom now, splash later). See AdropNativePlugin.java.
const AdropNative = registerPlugin("AdropNative");

let popupRequested = false;

// Shows the native bottom popup at most once per app launch.
// Rejections (no fill, "hide for today", SDK not configured) are expected and ignored.
export async function showNativePopupOnce(unitId) {
  if (popupRequested || !Capacitor.isNativePlatform() || !unitId) return;
  popupRequested = true;
  try {
    await AdropNative.showPopup({ unitId });
  } catch (err) {
    console.info("Adrop popup not shown:", err?.message || err);
  }
}
