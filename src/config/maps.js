// Google Maps API key for the native tracking map (Android/iOS app builds
// only — the web build keeps the illustrated fake map, see App.jsx).
//
// This value is only actually used by iOS: the @capacitor/google-maps iOS
// plugin calls GMSServices.provideAPIKey(apiKey) with this JS-passed value
// when the map is created, which overrides whatever AppDelegate.swift set
// at launch. The Android plugin ignores this param entirely and reads its
// key from AndroidManifest.xml's com.google.android.geo.API_KEY instead —
// so keep this in sync with ios/App/App/AppDelegate.swift, not the manifest.
export const GOOGLE_MAPS_API_KEY = "AIzaSyCD1SQFSKxcWoWQnlL_pf-DNACXTbIS0Fs";

// Delivery addresses typed at checkout are fake, so the tracking map always
// shows a made-up route. The destination is the device's real location when
// available (falling back to this fixed demo coordinate otherwise) — the
// "store" is then placed a short, fixed distance away from *that* point
// (rather than at a fixed real-world address) so the map always shows a
// sane, close-by neighborhood delivery no matter where the device actually
// is, instead of potentially spanning half the country.
export const DEMO_HOME_COORD = { lat: 37.5145, lng: 127.0292 };
const STORE_OFFSET = { lat: 0.012, lng: 0.012 }; // ~1.3km north-east, roughly

export function storeCoordNear(destCoord) {
  return { lat: destCoord.lat + STORE_OFFSET.lat, lng: destCoord.lng + STORE_OFFSET.lng };
}
