import { useState } from "react";
import { pick } from "../config/i18n";

// Standalone page for "add your own restaurant/dish" — split out of the
// main restaurant list so browsing stays uncluttered. A new restaurant or
// dish is created into a device-local draft first (see lib/localDrafts.js);
// this page lists those drafts with a publish button ("내식당 공유하기" /
// "최애메뉴 입점시키기") that actually sends the draft to the server.
// Picking a restaurant under the "add dish" tab hands it off to
// AddMenuModal via onOpenAddMenu; the actual create forms still live in
// AddRestaurantModal/AddMenuModal.

function DraftCard({ emoji, title, subtitle, onPublish, onDelete, publishLabel, t, th }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid #e5e7eb", borderRadius: 14, padding: "10px 12px", background: "#fcfcfd" }}>
      {emoji && <span style={{ fontSize: 22 }}>{emoji}</span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: th.muted, marginTop: 2 }}>{subtitle}</div>}
        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>{t("localSavedBadge")}</div>
      </div>
      <button
        onClick={onDelete}
        aria-label={t("deleteCustomAria")}
        style={{ width: 30, height: 30, flexShrink: 0, border: "none", borderRadius: 10, background: "#f3f4f6", color: "#6b7280", fontSize: 14, cursor: "pointer" }}
      >✕</button>
      <button
        onClick={onPublish}
        style={{ flexShrink: 0, border: "none", borderRadius: 12, padding: "9px 12px", background: th.primaryBtn, color: "#fff", fontWeight: 900, fontSize: 12, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
      >{publishLabel}</button>
    </div>
  );
}

export default function AddContentPage({
  onBack, allRestaurants, lang, t, th,
  onOpenAddRestaurant, onOpenAddMenu,
  localRestaurants, localMenus,
  onPublishRestaurant, onPublishMenu,
  onDeleteLocalRestaurant, onDeleteLocalMenu,
}) {
  const [tab, setTab] = useState("restaurant");
  const [search, setSearch] = useState("");

  const filtered = allRestaurants.filter(r =>
    pick(r.name, lang).toLowerCase().includes(search.trim().toLowerCase())
  );

  const restaurantNameFor = (restaurantId) => {
    const r = allRestaurants.find(x => x.id === restaurantId) ||
      localRestaurants.find(x => x.id === restaurantId);
    return r ? pick(r.name, lang) : "";
  };

  const tabBtnStyle = (active) => ({
    flex: 1, border: "none", borderRadius: 14, padding: "12px 10px", fontWeight: 900, fontSize: 14,
    cursor: "pointer", fontFamily: "inherit",
    background: active ? th.primaryBtn : "#f3f4f6",
    color: active ? "#fff" : "#374151",
  });

  return (
    <div style={{ minHeight: "100dvh", background: th.phone, fontFamily: 'Inter,"Noto Sans KR",system-ui,sans-serif', color: th.text }}>
      <div data-ad-clip="top" style={{ position: "sticky", top: 0, zIndex: 10, background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "calc(10px + env(safe-area-inset-top)) 16px 10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, maxWidth: 540, margin: "0 auto" }}>
          <button onClick={onBack} aria-label={t("backAria")} style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, fontSize: 18, border: "none", cursor: "pointer", background: "#f3f4f6", color: "#1c1917", padding: 0, flexShrink: 0 }}>←</button>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>{t("addContentPageTitle")}</h2>
        </div>
      </div>

      <div style={{ maxWidth: 540, margin: "0 auto", padding: "16px 16px calc(48px + env(safe-area-inset-bottom))", display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setTab("restaurant")} style={tabBtnStyle(tab === "restaurant")}>{t("addRestaurantTab")}</button>
          <button onClick={() => setTab("menu")} style={tabBtnStyle(tab === "menu")}>{t("addMenuTab")}</button>
        </div>

        {tab === "restaurant" ? (
          <>
            <div style={{ background: "#fff", borderRadius: 20, padding: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", display: "grid", gap: 16 }}>
              <p style={{ margin: 0, fontSize: 13, color: th.muted, lineHeight: 1.6 }}>{t("addRestaurantPageDesc")}</p>
              <button
                onClick={onOpenAddRestaurant}
                style={{ border: "none", borderRadius: 14, padding: "14px 16px", background: th.primaryBtn, color: "#fff", fontWeight: 900, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}
              >{t("addRestaurantBtn")}</button>
            </div>

            {localRestaurants.length > 0 && (
              <div style={{ background: "#fff", borderRadius: 20, padding: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", display: "grid", gap: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 900 }}>{t("myLocalRestaurantsTitle")}</div>
                {localRestaurants.map(r => (
                  <DraftCard
                    key={r.id}
                    emoji={r.emoji}
                    title={pick(r.name, lang)}
                    subtitle={pick(r.category, lang)}
                    publishLabel={t("shareRestaurantBtn")}
                    onPublish={() => onPublishRestaurant(r)}
                    onDelete={() => { if (window.confirm(t("discardDraftConfirm"))) onDeleteLocalRestaurant(r.id); }}
                    t={t}
                    th={th}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ background: "#fff", borderRadius: 20, padding: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", display: "grid", gap: 14 }}>
              <p style={{ margin: 0, fontSize: 13, color: th.muted, lineHeight: 1.6 }}>{t("addMenuPageDesc")}</p>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t("addMenuSearchPh")}
                style={{ width: "100%", padding: "12px 14px", border: "1px solid #e5e7eb", outline: "none", borderRadius: 12, fontFamily: "inherit", fontSize: 14, boxSizing: "border-box" }}
              />
              <div style={{ display: "grid", gap: 8 }}>
                {filtered.length === 0 ? (
                  <div style={{ fontSize: 13, color: th.muted, padding: "8px 2px" }}>{t("addMenuNoRestaurants")}</div>
                ) : filtered.map(r => (
                  <button
                    key={r.id}
                    onClick={() => onOpenAddMenu(r)}
                    aria-label={t("addMenuBtn")}
                    style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid #e5e7eb", borderRadius: 14, padding: "10px 12px", background: "#fcfcfd", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
                  >
                    <span style={{ fontSize: 22 }}>{r.emoji}</span>
                    <span style={{ flex: 1, minWidth: 0, fontWeight: 800, fontSize: 14 }}>{pick(r.name, lang)}</span>
                    <span style={{ fontSize: 18, color: th.brand, fontWeight: 900 }}>+</span>
                  </button>
                ))}
              </div>
            </div>

            {localMenus.length > 0 && (
              <div style={{ background: "#fff", borderRadius: 20, padding: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", display: "grid", gap: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 900 }}>{t("myLocalMenusTitle")}</div>
                {localMenus.map(m => (
                  <DraftCard
                    key={m.id}
                    title={pick(m.name, lang)}
                    subtitle={restaurantNameFor(m.restaurantId)}
                    publishLabel={t("publishMenuBtn")}
                    onPublish={() => onPublishMenu(m)}
                    onDelete={() => { if (window.confirm(t("discardDraftConfirm"))) onDeleteLocalMenu(m.id); }}
                    t={t}
                    th={th}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
