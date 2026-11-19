import { fmt } from "../lib/format";

// Floating "View cart" button that appears once something is in the cart.
// `bottom` is a CSS length for how far above the screen edge it sits (above
// the tab bar on tab screens). Also marked as an ad clip edge.
export default function CartFab({ count, total, onClick, bottom, lang, t, th }) {
  if (!count) return null;
  return (
    <div
      data-ad-clip="bottom"
      style={{ position: "fixed", left: 16, right: 16, bottom, zIndex: 31, display: "flex", justifyContent: "center", pointerEvents: "none" }}
    >
      <button
        onClick={onClick}
        style={{
          pointerEvents: "auto", width: "100%", maxWidth: 508, border: "none", cursor: "pointer", fontFamily: "inherit",
          display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderRadius: 18,
          background: th.primaryBtn, color: "#fff", boxShadow: "0 10px 24px " + th.primaryBtn + "55",
          animation: "slideUp .25s ease",
        }}
      >
        <span style={{ width: 24, height: 24, borderRadius: 999, background: "#fff", color: th.brand, fontSize: 13, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{count}</span>
        <span style={{ flex: 1, textAlign: "left", fontSize: 15, fontWeight: 900 }}>{t("cartFabLabel")}</span>
        <span style={{ fontSize: 15, fontWeight: 900 }}>{fmt(total, lang)}</span>
      </button>
    </div>
  );
}

// Short-lived message bubble shown just above the floating cart button.
export function Toast({ message, bottom }) {
  if (!message) return null;
  return (
    <div style={{ position: "fixed", left: 16, right: 16, bottom, zIndex: 32, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{
        maxWidth: 508, width: "100%", background: "rgba(17,24,39,0.92)", color: "#fff",
        borderRadius: 14, padding: "12px 16px", fontSize: 13, fontWeight: 700, lineHeight: 1.4,
        boxShadow: "0 10px 24px rgba(0,0,0,0.2)", animation: "pop .25s ease",
      }}>{message}</div>
    </div>
  );
}
