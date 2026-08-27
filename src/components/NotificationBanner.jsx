import { useEffect, useState } from "react";

// Mimics a native OS notification banner so the "delivery complete" moment
// reads as a real push even while the app is in the foreground (most
// platforms suppress the actual system banner in that case).
export default function NotificationBanner({ appName, title, body, onDone, onTap }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const dismiss = setTimeout(() => setLeaving(true), 4200);
    return () => clearTimeout(dismiss);
  }, []);

  useEffect(() => {
    if (!leaving) return;
    const remove = setTimeout(() => onDone?.(), 260);
    return () => clearTimeout(remove);
  }, [leaving, onDone]);

  return (
    <div
      onClick={() => { onTap?.(); setLeaving(true); }}
      style={{
        position: "fixed", left: "50%", top: leaving ? -140 : 12,
        transform: "translateX(-50%)",
        width: "calc(100% - 20px)", maxWidth: 420,
        zIndex: 300, cursor: "pointer",
        transition: "top .32s cubic-bezier(.34,1.4,.64,1)",
      }}
    >
      <div style={{
        display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 10,
        alignItems: "flex-start",
        background: "rgba(255,255,255,0.92)", backdropFilter: "blur(18px)",
        border: "1px solid rgba(0,0,0,0.06)",
        borderRadius: 18, padding: "12px 14px",
        boxShadow: "0 12px 36px rgba(15,23,42,0.28)",
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          background: "#111827", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
        }}>🍱</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#111827" }}>{appName}</span>
            <span style={{ fontSize: 10, color: "#9ca3af" }}>· now</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 900, color: "#0f172a", marginTop: 2 }}>{title}</div>
          <div style={{ fontSize: 12, color: "#4b5563", marginTop: 2, lineHeight: 1.4 }}>{body}</div>
        </div>
        <div style={{ width: 8, height: 8, borderRadius: 999, background: "#f97316", marginTop: 4, flexShrink: 0 }} />
      </div>
    </div>
  );
}
