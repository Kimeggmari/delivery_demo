// Firebase init + anonymous auth. No login UI in this app — every device
// gets one anonymous uid (persisted by the SDK across restarts), which is
// enough to scope private data (order history/achievements) per install
// while still letting custom restaurants/menus be a shared collection.

import { Capacitor } from "@capacitor/core";
import { FirebaseAppCheck } from "@capacitor-firebase/app-check";
import { initializeApp } from "firebase/app";
import { initializeAppCheck, CustomProvider } from "firebase/app-check";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);

// Play Integrity-based App Check, native Android build only for now — iOS
// needs its own Firebase native setup (GoogleService-Info.plist + App
// Attest), which has to happen during the Mac/Xcode session, see
// IOS_RELEASE_CHECKLIST.md. Firebase App Check enforcement is left OFF
// (monitor mode) in the console until iOS + the plain web build are also
// covered, so this is purely additive for now — nothing breaks if it fails
// to initialize (e.g. sideloaded debug build without a registered debug
// token), it just logs a warning.
if (Capacitor.getPlatform() === "android") {
  FirebaseAppCheck.initialize()
    .then(() => initializeAppCheck(app, {
      provider: new CustomProvider({
        getToken: async () => {
          const result = await FirebaseAppCheck.getToken();
          return {
            token: result.token,
            expireTimeMillis: result.expireTimeMillis ?? Date.now() + 30 * 60 * 1000,
          };
        },
      }),
      isTokenAutoRefreshEnabled: true,
    }))
    .catch(err => console.warn("App Check init failed", err));
}

export const auth = getAuth(app);
export const db = getFirestore(app);

// Resolves once with the signed-in uid. Callers await this before touching
// Firestore so security rules (which check request.auth.uid) always pass.
export const authReady = new Promise((resolve, reject) => {
  const unsub = onAuthStateChanged(
    auth,
    user => {
      if (user) {
        unsub();
        resolve(user.uid);
      }
    },
    reject,
  );
  signInAnonymously(auth).catch(reject);
});
