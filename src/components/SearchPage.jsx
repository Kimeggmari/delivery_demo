import { useEffect, useRef } from "react";
import RestaurantCard from "./RestaurantCard";
import { pick } from "../config/i18n";
import { matchesQuery } from "../lib/search";

const HASHTAGS = [
  { ko: "치킨", en: "chicken" }, { ko: "마라탕", en: "mala" }, { ko: "로제", en: "rosé" },
  { ko: "피자", en: "pizza" }, { ko: "족발", en: "jokbal" }, { ko: "라멘", en: "ramen" },
  { ko: "제육", en: "jeyuk" }, { ko: "빙수", en: "bingsu" },
];

export default function SearchPage({ query, onQueryChange, restaurants, lang, t, th, favorites, onToggleFav, onOpen, reviewCountFor, bottomPadding }) {
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  const results = restaurants.filter(r => matchesQuery(r, query));
  // Only offer hashtags that actually find something.
  const tags = HASHTAGS.filter(tag => restaurants.some(r => matchesQuery(r, tag.ko) || matchesQuery(r, tag.en)));

  return (
    <div style={{ minHeight: "100dvh", background: th.phone, color: th.text, fontFamily: 'Inter,"Noto Sans KR",system-ui,sans-serif' }}>
      <div data-ad-clip="top" style={{ position: "sticky", top: 0, zIndex: 10, background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "calc(12px + env(safe-area-inset-top)) 16px 12px" }}>
        <div style={{ maxWidth: 540, margin: "0 auto" }}>
          <h2 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 900, letterSpacing: -0.3 }}>{t("searchPageTitle")}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f5f5f4", borderRadius: 14, padding: "0 12px" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#78716c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={e => onQueryChange(e.target.value)}
              placeholder={t("searchPagePh")}
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", padding: "12px 0", fontSize: 16, fontFamily: "inherit", color: "#1c1917", minWidth: 0 }}
            />
            {query && (
              <button
                onClick={() => onQueryChange("")}
                aria-label={t("searchClearAria")}
                style={{
                  border: "none", background: "#d6d3d1", color: "#fff", width: 22, height: 22,
                  borderRadius: 999, fontSize: 11, cursor: "pointer", padding: 0, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
                }}
              >✕</button>
            )}
          </div>
          <div className="balancedWrap" style={{ gap: 7, marginTop: 12 }}>
            {tags.map(tag => {
              const value = pick(tag, lang);
              const active = query.trim().toLowerCase() === value.toLowerCase();
              return (
                <button
                  key={tag.ko}
                  onClick={() => onQueryChange(active ? "" : value)}
                  style={{ border: "1px solid " + (active ? th.brand : "#e7e5e4"), background: active ? th.activeBg : "#fff", color: active ? th.brandDark : "#44403c", borderRadius: 999, padding: "6px 12px", fontSize: 12.5, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}
                >#{value}</button>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 540, margin: "0 auto", padding: "16px 16px " + bottomPadding, display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 12 }}>
        {query.trim() && <div style={{ fontSize: 13, color: "#78716c", fontWeight: 700 }}>{t("searchResultCount", results.length)}</div>}
        {results.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 20, padding: "44px 20px", textAlign: "center", color: "#78716c", fontSize: 13, lineHeight: 1.6, border: "1px solid " + (th.cardBorder || th.line), boxShadow: th.sectionShadow }}>{t("noResults")}<br />{t("noResultsHint")}</div>
        ) : results.map(r => (
          <RestaurantCard
            key={r.id} r={r} lang={lang} t={t} th={th}
            isFav={favorites.includes(r.id)} onToggleFav={onToggleFav} onOpen={onOpen}
            reviewCount={reviewCountFor(r)}
          />
        ))}
      </div>
    </div>
  );
}
