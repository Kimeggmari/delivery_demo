import { useRef, useState } from "react";

// Floating Liquid Glass vertical navigation rail with sliding glass droplet lens
// (fallback for Web / Android / iOS < 26; iOS 26+ renders native UIGlassEffect rail).

const ICONS = {
  order: (
    <path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4.5v-5.5h-5V21H5a1 1 0 0 1-1-1z" />
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  favorites: (
    <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z" />
  ),
  my: (
    <>
      <path d="M5 12.5c0-3.6 3.1-6.5 7-6.5 2.2 0 4.2.9 5.5 2.4l1.8-.9-.3 2.3c.6.8 1 1.7 1 2.7 0 2.2-1.4 4.1-3.5 5.1V20h-2.5v-1.3a8 8 0 0 1-3 0V20H8.5v-2a6.4 6.4 0 0 1-3.5-5.5z" />
      <circle cx="15.5" cy="11" r=".6" fill="currentColor" />
    </>
  ),
};

export default function DuoNavRail({ active, cartCount, cartActive, onSelect, onOpenCart, onOpenSettings, t, th }) {
  const tabs = [
    { key: "order", label: t("tabHome") },
    { key: "search", label: t("tabSearch") },
    { key: "favorites", label: t("tabFavorites") },
    { key: "my", label: t("tabMySavings") },
  ];
  const groupRef = useRef(null);
  const [dragFrac, setDragFrac] = useState(null);
  const activeIdx = Math.max(0, tabs.findIndex(tab => tab.key === active));
  const lensPos = dragFrac !== null ? dragFrac : activeIdx;
  const isDragging = dragFrac !== null;

  const indexFromClientY = (clientY) => {
    const rect = groupRef.current?.getBoundingClientRect();
    if (!rect || rect.height <= 0) return activeIdx;
    const raw = ((clientY - rect.top) / rect.height) * tabs.length - 0.5;
    return Math.max(-0.08, Math.min(tabs.length - 0.92, raw));
  };

  return (
    <div
      style={{
        paddingLeft: "max(12px, env(safe-area-inset-left, 0px))",
        paddingRight: 8,
        paddingTop: "max(20px, calc(12px + env(safe-area-inset-top, 0px)))",
        paddingBottom: "max(20px, calc(12px + env(safe-area-inset-bottom, 0px)))",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
        zIndex: 20,
      }}
    >
      <nav
        aria-label="Primary"
        className="lgSurface"
        style={{
          width: 68,
          borderRadius: 28,
          padding: "6px 5px",
        }}
      >
        <div
          ref={groupRef}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture?.(e.pointerId);
            setDragFrac(indexFromClientY(e.clientY));
          }}
          onPointerMove={(e) => {
            if (dragFrac !== null) setDragFrac(indexFromClientY(e.clientY));
          }}
          onPointerUp={(e) => {
            if (dragFrac === null) return;
            const idx = Math.max(0, Math.min(tabs.length - 1, Math.round(indexFromClientY(e.clientY))));
            setDragFrac(null);
            if (tabs[idx]) onSelect(tabs[idx].key);
          }}
          onPointerCancel={() => setDragFrac(null)}
          style={{ position: "relative", display: "grid", gridTemplateRows: "repeat(4, 56px)", touchAction: "none" }}
        >
          <div
            aria-hidden="true"
            className="lgLens"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: 56,
              borderRadius: 20,
              pointerEvents: "none",
              transform: `translate3d(0, ${lensPos * 100}%, 0) scale(${isDragging ? "1.06, 1.08" : "1, 1"})`,
              transition: isDragging ? "transform 90ms ease-out" : undefined,
            }}
          />
          {tabs.map((tab, i) => {
            const isActive = Math.round(lensPos) === i;
            return (
              <button
                key={tab.key}
                onClick={() => onSelect(tab.key)}
                aria-current={active === tab.key ? "page" : undefined}
                style={{
                  position: "relative",
                  zIndex: 1,
                  width: "100%",
                  height: 56,
                  border: "none",
                  borderRadius: 20,
                  background: "transparent",
                  color: isActive ? th.brandDark : "rgba(28, 25, 23, 0.72)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  padding: "6px 2px",
                }}
              >
                <svg width="21" height="21" viewBox="0 0 24 24" fill={isActive && tab.key === "favorites" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {ICONS[tab.key]}
                </svg>
                <span style={{ fontSize: 10.5, fontWeight: isActive ? 900 : 700, letterSpacing: -0.2 }}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <button
          onClick={onOpenCart}
          aria-label={t("cartTitle")}
          className={cartCount > 0 || cartActive ? undefined : "lgPillBtn"}
          style={{
            position: "relative",
            width: 52,
            height: 52,
            borderRadius: 999,
            border: cartCount > 0 || cartActive ? "1px solid rgba(255,255,255,0.45)" : undefined,
            background: cartCount > 0 || cartActive ? "linear-gradient(180deg, rgba(251,146,60,0.92), rgba(234,88,12,0.88))" : undefined,
            color: cartCount > 0 || cartActive ? "#fff" : th.brandDark,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            boxShadow: cartCount > 0 || cartActive ? "0 8px 20px rgba(249, 115, 22, 0.34), inset 0 1.5px 1px rgba(255,255,255,0.48)" : undefined,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="9" cy="20" r="1.5" />
            <circle cx="18" cy="20" r="1.5" />
            <path d="M2 3h3l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.8a1.5 1.5 0 0 0 1.4-1.1L21 7H6.2" />
          </svg>
          {cartCount > 0 && (
            <span
              className="tnum"
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                minWidth: 20,
                height: 20,
                borderRadius: 999,
                background: "#1c1917",
                color: "#fff",
                fontSize: 10.5,
                fontWeight: 900,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 4px",
                border: "2px solid #fff",
              }}
            >
              {cartCount}
            </span>
          )}
        </button>

        <button
          onClick={onOpenSettings}
          aria-label={t("settingsAria")}
          title={t("settingsTitle")}
          className="lgPillBtn"
          style={{
            width: 48,
            height: 48,
            borderRadius: 999,
            color: "rgba(28, 25, 23, 0.72)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
          }}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
