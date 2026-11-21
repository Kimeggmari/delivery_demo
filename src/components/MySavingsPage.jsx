import { useMemo } from "react";
import Footer from "./Footer";
import { ACHIEVEMENTS, earnedBadges } from "../config/achievements";
import { computeStats } from "../lib/storage";
import { fmt } from "../lib/format";
import { pick } from "../config/i18n";
import { nicknameFor } from "../lib/nickname";

function formatDate(ts, lang) {
  const d = new Date(ts);
  return lang === "en"
    ? d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : d.toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

// Restaurants featured in an order, in first-appearance order.
function orderRestaurants(order, allRestaurants) {
  const seen = new Set();
  const list = [];
  order.items.forEach(it => {
    if (seen.has(it.restaurantId)) return;
    seen.add(it.restaurantId);
    const r = allRestaurants.find(x => x.id === it.restaurantId);
    if (r) list.push(r);
  });
  return list;
}

export default function MySavingsPage({ th, t, lang, uid, history, allRestaurants, onWriteReview, onClear, onInfo, onPrivacy, bottomPadding }) {
  const stats = useMemo(() => computeStats(history), [history]);
  const earned = new Set(earnedBadges(stats).map(a => a.id));
  const card = {
    background: "#fff",
    borderRadius: 22, padding: 16, border: "1px solid " + th.cardBorder, boxShadow: th.sectionShadow,
  };

  return (
    <div style={{ minHeight: "100dvh", background: th.phone, color: th.text, fontFamily: 'Inter,"Noto Sans KR",system-ui,sans-serif' }}>
      <div data-ad-clip="top" className="lgHeader" style={{ position: "sticky", top: 0, zIndex: 10, padding: "max(18px, calc(14px + env(safe-area-inset-top, 0px))) 16px 14px" }}>
        <div style={{ maxWidth: 540, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, letterSpacing: -0.3 }}>{t("myPageTitle")}</h2>
          <span style={{
            fontSize: 12, color: "#c2410c", background: "#fff7ed", border: "1px solid #fed7aa",
            borderRadius: 999, padding: "4px 10px", fontWeight: 800,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "56%",
          }}>🙂 {nicknameFor(uid, lang)}</span>
        </div>
      </div>

      <div style={{ maxWidth: 540, margin: "0 auto", padding: "16px 16px " + bottomPadding, display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 14 }}>
        <div style={{ background: "linear-gradient(135deg,#f97316,#ea580c)", color: "#fff", borderRadius: 24, padding: "20px 18px", boxShadow: "0 12px 28px rgba(234,88,12,0.22)" }}>
          <div style={{ fontSize: 13, opacity: 0.9, fontWeight: 700 }}>{t("myHeroLabel")}</div>
          <div className="tnum" style={{ fontSize: 34, fontWeight: 900, marginTop: 6, letterSpacing: -0.6 }}>{fmt(stats.totalSpent, lang)}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
            {[[t("myKcalLabel"), "-" + stats.totalSavedKcal.toLocaleString() + " kcal"], [t("myCountLabel"), t("myCountValue", stats.count)]].map(([k, v]) => (
              <div key={k} style={{ background: "rgba(255,255,255,0.16)", borderRadius: 16, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, opacity: 0.88, fontWeight: 700 }}>{k}</div>
                <div className="tnum" style={{ fontSize: 17, fontWeight: 900, marginTop: 4 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={card}>
          <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 12 }}>🎖️ {t("myBadgesTitle")} <span className="tnum" style={{ color: th.brand, fontSize: 13 }}>{earned.size}/{ACHIEVEMENTS.length}</span></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {ACHIEVEMENTS.map(a => {
              const got = earned.has(a.id);
              return (
                <div key={a.id} style={{
                  borderRadius: 16, padding: "14px 8px", textAlign: "center",
                  display: "flex", flexDirection: "column", alignItems: "center",
                  background: got ? "#fff7ed" : "#fafaf9", border: "1px solid " + (got ? "#fdba74" : "#e7e5e4"),
                }}>
                  <div style={{ fontSize: 28, lineHeight: 1, filter: got ? "none" : "grayscale(1)", opacity: got ? 1 : 0.42 }}>{a.emoji}</div>
                  <div style={{ fontSize: 12, fontWeight: 900, marginTop: 8, color: got ? "#1c1917" : "#a8a29e", lineHeight: 1.25 }}>{pick(a.title, lang)}</div>
                  <div style={{ fontSize: 10, color: "#a8a29e", marginTop: 3, lineHeight: 1.35 }}>{pick(a.desc, lang)}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={card}>
          <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 6 }}>🧾 {t("myHistoryTitle")}</div>
          {history.length === 0 ? (
            <div style={{ padding: "24px 0", textAlign: "center", color: "#6b7280", fontSize: 13, lineHeight: 1.6 }}>{t("historyEmptyTitle")}<br />{t("historyEmptyDesc")}</div>
          ) : history.map(o => {
            const rests = orderRestaurants(o, allRestaurants);
            const first = rests[0];
            const title = rests.map(r => pick(r.name, lang)).join(", ") || (o.items[0] ? pick(o.items[0].restaurantName, lang) : "");
            const summary = o.items.slice(0, 2).map(it => pick(it.name, lang)).join(", ") + (o.items.length > 2 ? t("plusMore", o.items.length - 2) : "");
            return (
              <div key={o.id} style={{ padding: "12px 0", borderTop: "1px solid #f3f4f6" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{first?.emoji || "🍽️"}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 900, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{summary} · {formatDate(o.ts, lang)}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontWeight: 900, fontSize: 14, color: th.brand }}>+{fmt(o.total, lang)}</div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#ea580c", marginTop: 2 }}>-{(o.savedKcal || 0).toLocaleString()} kcal</div>
                  </div>
                </div>
                {rests.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8, paddingLeft: 60 }}>
                    {rests.map(r => (
                      <button key={r.id} onClick={() => onWriteReview(r)} style={{ border: "1px solid " + th.line, background: "#fff", color: th.brandDark, borderRadius: 999, padding: "5px 10px", fontWeight: 800, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>⭐ {t("historyReviewBtn", pick(r.name, lang))}</button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {history.length > 0 && (
            <button onClick={onClear} style={{ marginTop: 8, width: "100%", background: "none", border: "1px dashed #e5e7eb", color: "#9ca3af", padding: "10px", borderRadius: 12, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700 }}>{t("historyClear")}</button>
          )}
        </div>

        <Footer th={th} t={t} onInfo={onInfo} onPrivacy={onPrivacy} />
      </div>
    </div>
  );
}
