import { Capacitor } from "@capacitor/core";
import AdSlot from "./AdSlot";
import AdropSlot from "./AdropSlot";
import { ADROP_UNITS } from "../lib/adrop";

// One ad placement, whichever SDK the platform uses:
// - iOS: native Adrop view laid over the WebView (AdropSlot, units in lib/adrop.js)
// - Android (and web/dev preview): Adrop web SDK inside the WebView (AdSlot,
//   units + sizes in config/adUnits.js, matching the Android console units)
// Both only draw their frame (`style`, `label`) once an ad is actually shown.
const IOS_UNIT = {
  homeBanner: ADROP_UNITS.homeBanner,
  trackingBanner: ADROP_UNITS.trackingBanner,
  completeNative: ADROP_UNITS.completeNative,
};

export default function PlatformAd({ slot, type = "banner", width, height, hidden, label, style }) {
  if (Capacitor.getPlatform() === "ios") {
    return <AdropSlot unitId={IOS_UNIT[slot]} type={type} width={width} height={height} hidden={hidden} label={label} style={style} />;
  }
  return <AdSlot slot={slot} label={label} frameStyle={style} />;
}
