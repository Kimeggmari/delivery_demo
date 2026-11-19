import { fmt } from "../lib/format";
import { pick } from "../config/i18n";
import { badgeColors, taglineFor } from "../config/visuals";
import { distanceKm } from "../lib/savings";
import RestaurantLogo, { brandBannerFor } from "./RestaurantLogo";

export function HeartButton({ active, onToggle, t, size = 34 }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      aria-label={active ? t("favRemoveAria") : t("favAddAria")}
      aria-pressed={active}
      style={{
        width: size, height: size, borderRadius: 999, border: "none", cursor: "pointer",
        background: "rgba(255,255,255,0.92)", boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0,
      }}
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill={active ? "#f43f5e" : "none"} stroke={active ? "#f43f5e" : "#9ca3af"} strokeWidth="2.2" strokeLinejoin="round">
        <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z" />
      </svg>
    </button>
  );
}

// Compact list card: thumbnail with fake-delivery badge, favorite heart and
// "real payment 0원" strip, then name, rating, tagline and info chips.
export default function RestaurantCard({ r, lang, t, th, isFav, onToggleFav, onOpen, reviewCount }) {
  const badgeKey = r.badge?.ko || "";
  const bColor = badgeColors[badgeKey];
  const chip = {
    fontSize: 11, color: "#57534e", background: "#fafaf9", border: "1px solid #f1f5f9",
    borderRadius: 999, padding: "4px 9px", fontWeight: 700, whiteSpace: "nowrap",
    fontVariantNumeric: "tabular-nums",
  };
  return (
    <div
      onClick={() => onOpen(r)}
      role="button"
      style={{
        borderRadius: 20, overflow: "hidden", background: "#fff",
        border: "1px solid " + (th.cardBorder || th.line),
        boxShadow: th.sectionShadow, cursor: "pointer",
      }}
    >
      <div style={{ height: 136, position: "relative", background: brandBannerFor(r), overflow: "hidden" }}>
        <div style={{
          position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)",
          width: 148, height: 148, borderRadius: 999,
          background: "rgba(255,255,255,0.34)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", right: 48, top: "50%", transform: "translateY(-50%)",
        }}>
          <RestaurantLogo restaurant={r} size={78} />
        </div>
        <div style={{
          position: "absolute", top: 10, left: 10, background: "rgba(255,255,255,0.95)", color: th.brandDark,
          borderRadius: 999, padding: "5px 11px", fontSize: 11, fontWeight: 900,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)", fontVariantNumeric: "tabular-nums",
        }}>
          ⚡ {t("cardVirtualEta", r.time)}
        </div>
        <div style={{ position: "absolute", top: 10, right: 10 }}>
          <HeartButton active={isFav} onToggle={() => onToggleFav(r.id)} t={t} />
        </div>
        <div style={{
          position: "absolute", left: 10, bottom: 10, background: "rgba(17,24,39,0.58)",
          backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
          color: "#fff", borderRadius: 999, padding: "5px 10px", fontSize: 11, fontWeight: 800,
          letterSpacing: -0.1,
        }}>
          {t("cardZeroStrip")}
        </div>
      </div>
      <div style={{ padding: "14px 16px 15px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: "#1c1917", minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: -0.2 }}>{pick(r.name, lang)}</h3>
          {bColor && (
            <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 999, background: bColor.bg, color: bColor.color, border: "1px solid " + bColor.border, fontWeight: 800, flexShrink: 0 }}>{pick(r.badge, lang)}</span>
          )}
          {r.status === "pending" && (
            <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 999, background: "#fef3c7", color: "#d97706", fontWeight: 800, flexShrink: 0 }}>{t("pendingBadge")}</span>
          )}
          <span style={{ marginLeft: "auto", fontSize: 13, fontWeight: 900, color: "#1c1917", flexShrink: 0, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
            <span style={{ color: "#f59e0b" }}>★</span> {r.rating} <span style={{ color: "#9ca3af", fontWeight: 600, fontSize: 12 }}>({reviewCount})</span>
          </span>
        </div>
        <div style={{ fontSize: 12.5, color: "#78716c", marginTop: 5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{taglineFor(r, lang)}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          {r.minOrder > 0 && <span style={chip}>{t("minOrderPrefix")} {fmt(r.minOrder, lang)}</span>}
          <span style={chip}>{t("cardFeeChip")} {fmt(r.fee, lang)}</span>
          <span style={chip}>{distanceKm(r)}km</span>
        </div>
      </div>
    </div>
  );
}
