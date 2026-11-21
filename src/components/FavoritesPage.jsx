import RestaurantCard from "./RestaurantCard";

export default function FavoritesPage({ restaurants, favorites, lang, t, th, onToggleFav, onOpen, onBrowse, reviewCountFor, bottomPadding, selectedId }) {
  const list = favorites.map(id => restaurants.find(r => r.id === id)).filter(Boolean);
  return (
    <div style={{ minHeight: "100%", background: th.phone, color: th.text, fontFamily: 'Inter,"Noto Sans KR",system-ui,sans-serif' }}>
      <div data-ad-clip="top" className="lgHeader" style={{ position: "sticky", top: 0, zIndex: 10, padding: "max(18px, calc(14px + env(safe-area-inset-top, 0px))) 16px 14px" }}>
        <h2 style={{ maxWidth: 540, margin: "0 auto", fontSize: 20, fontWeight: 900, letterSpacing: -0.3 }}>{t("favPageTitle")} {list.length > 0 && <span style={{ color: th.brand, fontVariantNumeric: "tabular-nums" }}>{list.length}</span>}</h2>
      </div>
      <div style={{ maxWidth: 540, margin: "0 auto", padding: "16px 16px " + bottomPadding, display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 12 }}>
        {list.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 20, padding: "48px 20px", textAlign: "center", border: "1px solid " + (th.cardBorder || th.line), boxShadow: th.sectionShadow }}>
            <div style={{ fontSize: 52, marginBottom: 10 }}>🤍</div>
            <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 6 }}>{t("favEmptyTitle")}</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 16, lineHeight: 1.6 }}>{t("favEmptyDesc")}</div>
            <button onClick={onBrowse} style={{ border: "none", background: th.primaryBtn, color: "#fff", borderRadius: 14, padding: "12px 18px", fontWeight: 900, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>{t("cartBrowseBtn")}</button>
          </div>
        ) : list.map(r => (
          <RestaurantCard
            key={r.id} r={r} lang={lang} t={t} th={th}
            isFav onToggleFav={onToggleFav} onOpen={onOpen}
            reviewCount={reviewCountFor(r)} selected={selectedId === r.id}
          />
        ))}
      </div>
    </div>
  );
}
