import { Capacitor } from "@capacitor/core";

// Nudges web visitors toward the native app. Only makes sense on the plain
// website — Capacitor.isNativePlatform() is false there and true inside the
// wrapped Android/iOS app, so this never renders for someone who already has
// the app installed. Shown on every page load (no dismiss-persistence).

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.eggmari.foodneverarrives";
const APP_STORE_URL = "https://apps.apple.com/kr/app/%EC%9D%8C%EC%8B%9D%EB%A7%8C%EC%95%88%EC%99%80%EC%9A%94/id6805903190";

const copy = {
  ko: {
    title: "앱으로 더 편하게",
    body: "배달 추적 지도, 알림 등 앱 전용 기능도 있어요. 무료로 설치해보세요.",
    play: "▶ Google Play에서 설치",
    apple: "🍎 App Store에서 설치",
    later: "나중에",
  },
  en: {
    title: "Get the app",
    body: "The app adds extras like live delivery-tracking and notifications. Free to install.",
    play: "▶ Get it on Google Play",
    apple: "🍎 Download on the App Store",
    later: "Not now",
  },
};

function detectOS() {
  const ua = navigator.userAgent || "";
  if (/android/i.test(ua)) return "android";
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  return "other";
}

export default function InstallAppModal({ onClose }) {
  if (Capacitor.isNativePlatform()) return null;

  const lang = (navigator.language || "ko").toLowerCase().startsWith("en") ? "en" : "ko";
  const c = copy[lang];
  const os = detectOS();

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 500,
        background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 24, padding: "28px 24px 24px",
          width: "100%", maxWidth: 340, textAlign: "center", position: "relative",
          boxShadow: "0 24px 60px rgba(15,23,42,0.35)",
        }}
      >
        <button
          onClick={onClose}
          aria-label="close"
          style={{
            position: "absolute", top: 12, right: 12, width: 30, height: 30,
            border: "none", borderRadius: "50%", background: "#f3f4f6", color: "#6b7280",
            fontSize: 16, fontWeight: 700, cursor: "pointer", lineHeight: "30px",
          }}
        >×</button>

        <img
          src="/icon_600x600.png"
          alt=""
          style={{ width: 68, height: 68, borderRadius: 18, boxShadow: "0 8px 20px rgba(15,23,42,0.18)", marginBottom: 14 }}
        />
        <div style={{ fontSize: 17, fontWeight: 900, color: "#0f172a", marginBottom: 6 }}>{c.title}</div>
        <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5, marginBottom: 20 }}>{c.body}</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {os !== "ios" && (
            <a
              href={PLAY_STORE_URL}
              style={{
                display: "block", textDecoration: "none", border: "none", borderRadius: 14,
                background: "#0ea768", color: "#fff", padding: "13px 16px",
                fontSize: 14, fontWeight: 800, cursor: "pointer",
              }}
            >{c.play}</a>
          )}
          {os !== "android" && (
            <a
              href={APP_STORE_URL}
              style={{
                display: "block", textDecoration: "none", border: "none", borderRadius: 14,
                background: "#111827", color: "#fff", padding: "13px 16px",
                fontSize: 14, fontWeight: 800, cursor: "pointer",
              }}
            >{c.apple}</a>
          )}
          <button
            onClick={onClose}
            style={{
              border: "none", background: "transparent", color: "#9ca3af",
              padding: "8px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            }}
          >{c.later}</button>
        </div>
      </div>
    </div>
  );
}
