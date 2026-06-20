import { useEffect, useState } from "react";
import { TIER_COLORS } from "../config/achievements";
import { pick } from "../config/i18n";

// Stacks newly-unlocked achievements as transient pop-up cards on the
// completion screen. Each card auto-dismisses; tapping dismisses immediately.

export default function AchievementToast({ items, lang, t, onDone }) {
  const [shown, setShown] = useState(items || []);

  useEffect(() => {
    setShown(items || []);
  }, [items]);

  useEffect(() => {
    if (!shown.length) {
      onDone?.();
      return;
    }
    const tm = setTimeout(() => {
      setShown(prev => prev.slice(1));
    }, 2600);
    return () => clearTimeout(tm);
  }, [shown, onDone]);

  if (!shown.length) return null;
  const current = shown[0];
  const tier = TIER_COLORS[current.tier] || TIER_COLORS.bronze;

  return (
    <div style={{
      position: "fixed", left: "50%", top: 28,
      transform: "translateX(-50%)",
      zIndex: 250,
      pointerEvents: "auto",
    }}>
      <div
        onClick={() => setShown(prev => prev.slice(1))}
        style={{
          background: "#fff",
          border: "2px solid " + tier.border,
          borderRadius: 18,
          padding: "12px 16px",
          minWidth: 280, maxWidth: 360,
          boxShadow: "0 14px 40px rgba(15,23,42,0.22)",
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: 12,
          alignItems: "center",
          cursor: "pointer",
          animation: "slideUp .3s ease",
        }}
      >
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: tier.bg,
          border: "1px solid " + tier.border,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26,
        }}>{current.emoji}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: tier.color, letterSpacing: 0.5, textTransform: "uppercase" }}>
            {t("achUnlocked")}
          </div>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#111827", marginTop: 2 }}>
            {pick(current.title, lang)}
          </div>
          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2, lineHeight: 1.4 }}>
            {pick(current.desc, lang)}
          </div>
        </div>
      </div>
      {shown.length > 1 && (
        <div style={{ textAlign: "center", marginTop: 6, fontSize: 11, color: "#fff", fontWeight: 800, textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}>
          +{shown.length - 1}
        </div>
      )}
    </div>
  );
}
