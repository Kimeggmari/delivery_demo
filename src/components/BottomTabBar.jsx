import { useRef, useState } from "react";

// Floating Liquid Glass capsule tab bar with a sliding, finger-tracking elastic
// glass droplet lens (used on Web / Android / iOS < 26; iOS 26+ swaps in Apple's
// native Metal UIGlassEffect tab bar via LiquidGlassPlugin).

export const TAB_BAR_HEIGHT = 78;

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

export default function BottomTabBar({ active, onSelect, t, th }) {
  const tabs = [
    { key: "order", label: t("tabHome") },
    { key: "search", label: t("tabSearch") },
    { key: "favorites", label: t("tabFavorites") },
    { key: "my", label: t("tabMySavings") },
  ];
  const navRef = useRef(null);
  const [dragFrac, setDragFrac] = useState(null);
  const activeIdx = Math.max(0, tabs.findIndex(tab => tab.key === active));
  const lensPos = dragFrac !== null ? dragFrac : activeIdx;
  const isDragging = dragFrac !== null;

  const indexFromClientX = (clientX) => {
    const rect = navRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return activeIdx;
    const innerW = rect.width - 12;
    const raw = ((clientX - rect.left - 6) / innerW) * tabs.length - 0.5;
    return Math.max(-0.08, Math.min(tabs.length - 0.92, raw));
  };

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDragFrac(indexFromClientX(e.clientX));
  };

  const onPointerMove = (e) => {
    if (dragFrac === null) return;
    setDragFrac(indexFromClientX(e.clientX));
  };

  const finishDrag = (e) => {
    if (dragFrac === null) return;
    const finalFrac = indexFromClientX(e.clientX);
    const targetIdx = Math.max(0, Math.min(tabs.length - 1, Math.round(finalFrac)));
    setDragFrac(null);
    if (tabs[targetIdx]) onSelect(tabs[targetIdx].key);
  };

  return (
    <div
      data-ad-clip="bottom"
      style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 30,
        padding: "0 max(14px, env(safe-area-inset-right, 0px)) calc(10px + env(safe-area-inset-bottom, 0px)) max(14px, env(safe-area-inset-left, 0px))",
        pointerEvents: "none",
      }}
    >
      <nav
        ref={navRef}
        className="lgSurface"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={() => setDragFrac(null)}
        style={{
          pointerEvents: "auto",
          position: "relative",
          display: "grid", gridTemplateColumns: "repeat(4,1fr)",
          maxWidth: 420, margin: "0 auto",
          borderRadius: 999,
          padding: "5px 6px",
          touchAction: "none",
        }}
      >
        {/* Sliding elastic Liquid Glass droplet */}
        <div
          aria-hidden="true"
          className="lgLens"
          style={{
            position: "absolute",
            top: 5,
            bottom: 5,
            left: 6,
            width: "calc((100% - 12px) / 4)",
            borderRadius: 999,
            pointerEvents: "none",
            transform: `translate3d(${lensPos * 100}%, 0, 0) scale(${isDragging ? "1.08, 1.06" : "1, 1"})`,
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
                border: "none",
                background: "transparent",
                borderRadius: 999,
                cursor: "pointer", fontFamily: "inherit",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
                padding: "7px 0",
                color: isActive ? th.brandDark : "rgba(28, 25, 23, 0.72)",
                transition: "color .18s",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={isActive && tab.key === "favorites" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.15" strokeLinecap="round" strokeLinejoin="round">
                {ICONS[tab.key]}
              </svg>
              <span style={{ fontSize: 10.5, fontWeight: isActive ? 900 : 700, letterSpacing: -0.2 }}>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
