import { useState } from "react";
import InstallAppModal from "./InstallAppModal";

// Replaces the full ordering demo on the public website now that the web
// version of the service has ended — only privacy policy access and an
// app-install nudge remain here. The native (Capacitor) app is unaffected;
// see main.jsx for the Capacitor.isNativePlatform() branch that skips this.
const copy = {
  ko: {
    title: "음식만안와요",
    heading: "웹 버전 서비스가 종료되었습니다",
    body: "그동안 웹에서 음식만안와요를 이용해주셔서 감사합니다. 앞으로는 앱에서 계속 이용하실 수 있어요.",
    install: "앱 설치 안내 보기",
    privacy: "개인정보처리방침 보기",
    contactLabel: "문의",
  },
  en: {
    title: "FoodNeverArrives",
    heading: "The web version has ended",
    body: "Thanks for using FoodNeverArrives on the web. You can keep using it in the app.",
    install: "See install options",
    privacy: "Privacy Policy",
    contactLabel: "Contact",
  },
};

export default function ServiceEndedPage() {
  const lang = (navigator.language || "ko").toLowerCase().startsWith("en") ? "en" : "ko";
  const c = copy[lang];
  const [showInstall, setShowInstall] = useState(true);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb", fontFamily: 'Inter,"Noto Sans KR",system-ui,-apple-system,sans-serif', padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: "36px 28px", width: "100%", maxWidth: 420, textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
        <img src="/icon_600x600.png" alt="" style={{ width: 72, height: 72, borderRadius: 18, marginBottom: 16, boxShadow: "0 8px 20px rgba(15,23,42,0.15)" }} />
        <div style={{ fontSize: 13, fontWeight: 700, color: "#9ca3af", marginBottom: 4 }}>{c.title}</div>
        <div style={{ fontSize: 19, fontWeight: 900, color: "#111827", marginBottom: 10 }}>{c.heading}</div>
        <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7, marginBottom: 24 }}>{c.body}</div>

        <div style={{ display: "grid", gap: 10 }}>
          <button
            onClick={() => setShowInstall(true)}
            style={{ border: "none", borderRadius: 14, padding: "13px 16px", background: "#0ea768", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}
          >{c.install}</button>
          <a
            href="/privacy.html"
            style={{ display: "block", border: "1px solid #e5e7eb", borderRadius: 14, padding: "12px 16px", color: "#374151", fontWeight: 700, fontSize: 13, textDecoration: "none" }}
          >{c.privacy}</a>
        </div>

        <div style={{ marginTop: 20, fontSize: 12, color: "#9ca3af" }}>
          {c.contactLabel}: <a href="mailto:eggmari5713@gmail.com" style={{ color: "#ea580c", fontWeight: 700, textDecoration: "none" }}>eggmari5713@gmail.com</a>
        </div>
      </div>

      {showInstall && <InstallAppModal onClose={() => setShowInstall(false)} />}
    </div>
  );
}
