import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import App from './App.jsx'
import InstallAppModal from './components/InstallAppModal.jsx'
import DevGate from './components/DevGate.jsx'
import ServiceEndedPage from './components/ServiceEndedPage.jsx'

// Change this before sharing the dev site link with anyone.
const DEV_PASSCODE = "fna_0911";

// This same codebase is deployed as two separate Vercel projects (same repo
// and branch, different projects, different domains): the public one leaves
// VITE_SITE_MODE unset and gets the "service ended" notice, while a second,
// unlisted project sets VITE_SITE_MODE=dev in its env vars and gets the full
// app behind a passcode — see DEV_SITE_SETUP.md for how to wire that up.
const isDevSite = import.meta.env.VITE_SITE_MODE === "dev";

function FullApp() {
  const [showInstall, setShowInstall] = useState(true);
  return (
    <>
      <App />
      {showInstall && <InstallAppModal onClose={() => setShowInstall(false)} />}
    </>
  );
}

// The native app always gets the real experience regardless of site mode.
function Root() {
  if (Capacitor.isNativePlatform()) return <FullApp />;

  if (isDevSite) {
    document.title = "음식만안와요 (dev)";
    return (
      <DevGate passcode={DEV_PASSCODE}>
        <FullApp />
      </DevGate>
    );
  }

  return <ServiceEndedPage />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js")
      .then((registration) => {
        console.log("SW registered:", registration);
      })
      .catch((error) => {
        console.error("SW registration failed:", error);
      });
  });
}
