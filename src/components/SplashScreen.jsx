import { useEffect, useState } from "react";

const copy = {
  ko: {
    eyebrow: "0원 · 0 kcal",
    line1: "음식만",
    line2: "안와요",
    tagline: "배달비와 칼로리를 아끼는 가짜배달앱",
    footer: "FOOD NEVER ARRIVES",
  },
  en: {
    eyebrow: "$0 · 0 kcal",
    line1: "Food",
    line2: "Never Arrives",
    tagline: "The fake delivery app that saves fees & calories",
    footer: "NO FOOD DELIVERY",
  },
};

const VISIBLE_MS = 1200;
const FADE_MS = 300;

// Typography-first branded launch screen shown once on app start (native + dev
// site, wherever FullApp mounts — see main.jsx). Purely cosmetic, no data
// dependency, so it always dismisses on a timer.
export default function SplashScreen({ onDone }) {
  const [leaving, setLeaving] = useState(false);
  const lang = (navigator.language || "ko").toLowerCase().startsWith("en") ? "en" : "ko";
  const c = copy[lang];
  const isKo = lang === "ko";

  useEffect(() => {
    const leaveTimer = setTimeout(() => setLeaving(true), VISIBLE_MS);
    const doneTimer = setTimeout(onDone, VISIBLE_MS + FADE_MS);
    return () => { clearTimeout(leaveTimer); clearTimeout(doneTimer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px 7vh",
        background: "linear-gradient(180deg, #fffaf5 0%, #fff7ed 60%, #ffedd5 100%)",
        fontFamily: 'Inter, "Noto Sans KR", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
        opacity: leaving ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease`,
        pointerEvents: leaving ? "none" : "auto",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 13px",
            borderRadius: 999,
            background: "#ffedd5",
            border: "1px solid #fed7aa",
            color: "#ea580c",
            fontSize: 11.5,
            fontWeight: 800,
            letterSpacing: "0.04em",
            fontVariantNumeric: "tabular-nums",
            marginBottom: 18,
          }}
        >
          {c.eyebrow}
        </div>

        <div
          style={{
            fontSize: isKo ? 46 : 36,
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: isKo ? "-0.045em" : "-0.03em",
            color: "#1c1917",
          }}
        >
          <div>{c.line1}</div>
          <div style={{ color: "#f97316", display: "inline-flex", alignItems: "baseline", gap: 3 }}>
            <span>{c.line2}</span>
            <span
              aria-hidden="true"
              style={{
                display: "inline-block",
                width: 9,
                height: 9,
                borderRadius: 999,
                border: "2.6px solid #f97316",
                marginLeft: 1,
                transform: "translateY(-1px)",
              }}
            />
          </div>
        </div>

        {/* Minimal delivery-route motif: departed ● - - - ○ never arrives */}
        <svg
          width="116"
          height="14"
          viewBox="0 0 116 14"
          fill="none"
          aria-hidden="true"
          style={{ marginTop: 18 }}
        >
          <circle cx="7" cy="7" r="4" fill="#f97316" />
          <line x1="16" y1="7" x2="99" y2="7" stroke="#fdba74" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="4 6" />
          <circle cx="108" cy="7" r="4.5" stroke="#f97316" strokeWidth="2.2" fill="#fff7ed" />
        </svg>

        <div
          style={{
            marginTop: 16,
            fontSize: 13.5,
            fontWeight: 600,
            color: "#78716c",
            letterSpacing: "-0.02em",
            lineHeight: 1.45,
          }}
        >
          {c.tagline}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "calc(30px + env(safe-area-inset-bottom))",
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.22em",
          color: "rgba(154, 52, 18, 0.38)",
        }}
      >
        {c.footer}
      </div>
    </div>
  );
}
