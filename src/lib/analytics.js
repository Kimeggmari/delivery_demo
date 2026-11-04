import { Capacitor } from "@capacitor/core";
import { FirebaseAnalytics } from "@capacitor-firebase/analytics";

// The app is a single Activity with an in-webview page state, so Firebase
// can't see page changes on its own — report each one as a screen_view.
// Android only, same as the collection switch in firebase.js.
export function trackScreen(screenName) {
  if (Capacitor.getPlatform() !== "android") return;
  FirebaseAnalytics.setCurrentScreen({ screenName, screenClassOverride: screenName })
    .catch(err => console.warn("Screen tracking failed", err));
}
