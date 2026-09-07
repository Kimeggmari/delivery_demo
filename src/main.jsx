import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import InstallAppModal from './components/InstallAppModal.jsx'

function Root() {
  const [showInstall, setShowInstall] = useState(true);
  return (
    <>
      <App />
      {showInstall && <InstallAppModal onClose={() => setShowInstall(false)} />}
    </>
  );
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
