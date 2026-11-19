import MenuImage from "./MenuImage";
import { HeartButton } from "./RestaurantCard";
import RestaurantLogo, { brandBannerFor } from "./RestaurantLogo";
import { fmt } from "../lib/format";
import { pick } from "../config/i18n";
import { taglineFor } from "../config/visuals";
import { getMenuImageSrc } from "../config/menuImages";
import { baseKcal, distanceKm } from "../lib/savings";

// Menus under this price are treated as sides / add-ons.
const SIDE_PRICE_LIMIT = 8000;

function splitMenus(menus) {
  const main = menus.filter(m => m.price >= SIDE_PRICE_LIMIT);
  const side = menus.filter(m => m.price < SIDE_PRICE_LIMIT);
  // A shop with only cheap items (cafe, dessert) shows them all as main.
  return main.length ? { main, side } : { main: side, side: [] };
}

function MenuRow({ m, tag, lang, t, th, onAdd, justAdded, uid, isCustomMenu, onDelete, onReport }) {
  const hasOpts = m.options && (m.options.spicy || m.options.size || (m.options.toppings && m.options.toppings.length > 0));
  const reported = (m.reportedBy || []).includes(uid);
  return (
    <div
      onClick={() => onAdd(m)}
      role="button"
      style={{ display: "flex", gap: 12, alignItems: "center", padding: "14px 0", borderTop: "1px solid #f3f4f6", cursor: "pointer" }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        {tag && (
          <span style={{ display: "inline-block", fontSize: 10, fontWeight: 900, color: tag.color, background: tag.bg, borderRadius: 6, padding: "2px 6px", marginBottom: 5 }}>{tag.label}</span>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
          <div style={{ fontWeight: 900, fontSize: 15, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pick(m.name, lang)}</div>
          {m.status === "pending" && <span style={{ fontSize: 9, fontWeight: 800, color: "#d97706", background: "#fef3c7", borderRadius: 999, padding: "1px 6px", flexShrink: 0 }}>{t("pendingBadge")}</span>}
        </div>
        <div style={{ color: "#6b7280", fontSize: 12, marginTop: 3, lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{pick(m.desc, lang)}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>
          <span style={{ fontWeight: 900, fontSize: 15, color: "#1c1917" }}>{fmt(m.price, lang)}</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#ea580c" }}>🔥 {baseKcal(m).toLocaleString()} kcal</span>
        </div>
        {hasOpts && <div style={{ fontSize: 10, color: th.brand, fontWeight: 700, marginTop: 3 }}>{t("optionAvail")}</div>}
        {isCustomMenu && m.addedBy === uid && (
          <button onClick={(e) => { e.stopPropagation(); onDelete(m.id); }} style={{ border: "none", background: "none", color: "#dc2626", fontSize: 10, fontWeight: 800, cursor: "pointer", padding: "4px 0 0", fontFamily: "inherit" }}>🗑 {t("deleteCustomAria")}</button>
        )}
        {isCustomMenu && m.addedBy !== uid && (
          <button disabled={reported} onClick={(e) => { e.stopPropagation(); onReport(m.id); }} style={{ border: "none", background: "none", color: "#6b7280", fontSize: 10, fontWeight: 800, cursor: reported ? "default" : "pointer", opacity: reported ? 0.4 : 1, padding: "4px 0 0", fontFamily: "inherit" }}>🚩 {t("reportAria")}</button>
        )}
      </div>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <MenuImage src={m.photo || getMenuImageSrc(m.id)} alt={pick(m.name, lang)} width={88} height={88} borderRadius={16} />
        <div style={{
          position: "absolute", right: -4, bottom: -4, width: 28, height: 28, borderRadius: 999,
          background: justAdded ? "#16a34a" : th.primaryBtn, color: "#fff", fontSize: 16, fontWeight: 900, lineHeight: 1,
          display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff",
          boxShadow: "0 2px 8px rgba(249,115,22,0.32)",
          animation: justAdded ? "pop .3s ease" : "none",
        }}>{justAdded ? "✓" : "+"}</div>
      </div>
    </div>
  );
}

export default function RestaurantDetailPage({
  r, lang, t, th, onBack, isFav, onToggleFav, onAddMenu, addedMenuId, reviewCount, onOpenReviews,
  uid, customMenuIds, onDeleteMenu, onReportMenu, onDeleteRestaurant, onReportRestaurant, bottomPadding,
}) {
  const { main, side } = splitMenus(r.menus);
  const nightPick = main.length > 1
    ? main.slice(1).reduce((best, m) => (baseKcal(m) > baseKcal(best) ? m : best), main[1])
    : null;
  const tagFor = (m, i) => {
    if (i === 0) return { label: t("detailTagTop1"), color: "#dc2626", bg: "#fee2e2" };
    if (nightPick && m.id === nightPick.id) return { label: t("detailTagNight"), color: "#7c3aed", bg: "#ede9fe" };
    return null;
  };
  const restReported = (r.reportedBy || []).includes(uid);
  const section = { background: "#fff", borderRadius: 20, padding: "16px 16px 4px", border: "1px solid " + (th.cardBorder || th.line), boxShadow: th.sectionShadow };
  const infoRow = (k, v) => (
    <div key={k} style={{ display: "flex", gap: 14, fontSize: 13, padding: "5px 0", fontVariantNumeric: "tabular-nums" }}>
      <span style={{ color: "#78716c", width: 84, flexShrink: 0 }}>{k}</span>
      <span style={{ fontWeight: 800, color: "#1c1917" }}>{v}</span>
    </div>
  );
  const rowProps = (m) => ({
    m, lang, t, th, uid,
    onAdd: onAddMenu,
    justAdded: addedMenuId === m.id,
    isCustomMenu: !!m.isCustom && customMenuIds.has(m.id),
    onDelete: onDeleteMenu, onReport: onReportMenu,
  });

  return (
    <div style={{ minHeight: "100dvh", background: th.phone, color: th.text, fontFamily: 'Inter,"Noto Sans KR",system-ui,sans-serif' }}>
      <div style={{ height: 214, background: brandBannerFor(r), position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", left: "50%", bottom: 18, transform: "translateX(-50%)",
          width: 176, height: 176, borderRadius: 999,
          background: "rgba(255,255,255,0.34)", pointerEvents: "none",
        }} />
        <div style={{ position: "absolute", left: "50%", bottom: 48, transform: "translateX(-50%)" }}>
          <RestaurantLogo restaurant={r} size={92} />
        </div>
        <div data-ad-clip="top" style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "calc(10px + env(safe-area-inset-top)) 16px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={onBack} aria-label={t("backAria")} style={{ width: 38, height: 38, borderRadius: 999, border: "none", background: "rgba(255,255,255,0.92)", color: "#1c1917", fontSize: 18, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>←</button>
          <HeartButton active={isFav} onToggle={() => onToggleFav(r.id)} t={t} size={38} />
        </div>
      </div>
      <div style={{ maxWidth: 540, margin: "-36px auto 0", padding: "0 16px " + bottomPadding, position: "relative", display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 14 }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: 18, border: "1px solid " + (th.cardBorder || th.line), boxShadow: "0 8px 24px rgba(15,23,42,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, padding: "4px 9px", borderRadius: 999, background: "#f3f4f6", color: "#374151", fontWeight: 800 }}>{pick(r.category, lang)}</span>
            {r.status === "pending" && <span style={{ fontSize: 10, padding: "4px 8px", borderRadius: 999, background: "#fef3c7", color: "#d97706", fontWeight: 800 }}>{t("pendingBadge")}</span>}
          </div>
          <h1 style={{ margin: "10px 0 4px", fontSize: 22, fontWeight: 900 }}>{pick(r.name, lang)}</h1>
          <div style={{ fontSize: 13, color: "#6b7280" }}>{taglineFor(r, lang)}</div>
          <button onClick={() => onOpenReviews(r)} style={{ marginTop: 10, border: "none", background: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 800, color: "#111827" }}>
            <span style={{ color: "#f59e0b" }}>★</span> {r.rating} <span style={{ color: "#9ca3af", fontWeight: 600 }}>({reviewCount})</span> <span style={{ color: th.brand }}>{t("seeReviews")}</span>
          </button>
          <div style={{ marginTop: 12, background: "#f9fafb", borderRadius: 14, padding: "10px 14px" }}>
            {infoRow(t("detailEtaLabel"), t("detailEtaValue", r.time))}
            {infoRow(t("detailFeeLabel"), t("detailFeeValue", fmt(r.fee, lang)))}
            {r.minOrder > 0 && infoRow(t("minOrderPrefix"), fmt(r.minOrder, lang))}
            {infoRow(t("detailDistanceLabel"), distanceKm(r) + "km")}
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "flex-start", background: "#fff7ed", border: "1px solid #fed7aa", color: "#c2410c", borderRadius: 14, padding: "10px 12px", fontSize: 12, fontWeight: 800, lineHeight: 1.5 }}>
            <span>🛡️</span><span>{t("detailNotice")}</span>
          </div>
        </div>

        <div style={section}>
          <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 4 }}>🔥 {t("detailPopularTitle")}</div>
          {main.map((m, i) => <MenuRow key={m.id} tag={tagFor(m, i)} {...rowProps(m)} />)}
        </div>

        {side.length > 0 && (
          <div style={section}>
            <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 4 }}>🍽️ {t("detailSideTitle")}</div>
            {side.map(m => <MenuRow key={m.id} {...rowProps(m)} />)}
          </div>
        )}

        {r.isCustom && (
          <div style={{ textAlign: "center" }}>
            {r.addedBy === uid ? (
              <button onClick={() => onDeleteRestaurant(r.id)} style={{ border: "none", background: "none", color: "#dc2626", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>🗑 {t("deleteCustomAria")}</button>
            ) : (
              <button disabled={restReported} onClick={() => onReportRestaurant(r.id)} style={{ border: "none", background: "none", color: "#6b7280", fontSize: 12, fontWeight: 800, cursor: restReported ? "default" : "pointer", opacity: restReported ? 0.4 : 1, fontFamily: "inherit" }}>🚩 {t("reportAria")}</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
