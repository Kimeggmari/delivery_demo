// Bottom navigation for the four main tabs. Marked as an ad clip edge so
// native inline ads never draw over it.

export const TAB_BAR_HEIGHT = 64;

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
  return (
    <nav
      data-ad-clip="bottom"
      style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 30,
        background: "rgba(255,255,255,0.96)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
        borderTop: "1px solid rgba(254,215,170,0.55)", boxShadow: "0 -4px 20px rgba(17,24,39,0.05)",
        padding: "6px 8px calc(6px + env(safe-area-inset-bottom))",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", maxWidth: 540, margin: "0 auto", height: TAB_BAR_HEIGHT - 12 }}>
        {tabs.map(tab => {
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onSelect(tab.key)}
              aria-current={isActive ? "page" : undefined}
              style={{
                border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3,
                color: isActive ? th.brandDark : "#78716c",
              }}
            >
              <span style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 48, height: 28, borderRadius: 999,
                background: isActive ? th.activeBg : "transparent", transition: "background-color .2s",
              }}>
                <svg width="21" height="21" viewBox="0 0 24 24" fill={isActive && tab.key === "favorites" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                  {ICONS[tab.key]}
                </svg>
              </span>
              <span style={{ fontSize: 11, fontWeight: isActive ? 900 : 700, letterSpacing: -0.2 }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
