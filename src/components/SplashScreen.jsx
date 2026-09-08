import { useEffect, useState } from "react";

const copy = {
  ko: { tagline: "배달비와 칼로리를 아끼는 가짜배달앱" },
  en: { tagline: "The fake delivery app that saves you fees and calories" },
};

const VISIBLE_MS = 1200;
const FADE_MS = 300;

// Brief branded loading screen shown once on app start (native + dev site,
// wherever FullApp mounts — see main.jsx). Purely cosmetic, no data
// dependency, so it always dismisses on a timer rather than waiting on
// anything to load.
export default function SplashScreen({ onDone }) {
  const [leaving, setLeaving] = useState(false);
  const lang = (navigator.language || "ko").toLowerCase().startsWith("en") ? "en" : "ko";
  const c = copy[lang];

  useEffect(() => {
    const leaveTimer = setTimeout(() => setLeaving(true), VISIBLE_MS);
    const doneTimer = setTimeout(onDone, VISIBLE_MS + FADE_MS);
    return () => { clearTimeout(leaveTimer); clearTimeout(doneTimer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(160deg,#fb923c,#f97316)",
        opacity: leaving ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease`,
        pointerEvents: leaving ? "none" : "auto",
      }}
    >
      <img
        src="/icon_600x600.png"
        alt=""
        style={{ width: 96, height: 96, borderRadius: 24, boxShadow: "0 12px 32px rgba(0,0,0,0.2)", marginBottom: 18 }}
      />
      <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 6 }}>음식만안와요</div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: 700 }}>{c.tagline}</div>
    </div>
  );
}
