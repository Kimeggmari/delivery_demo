import { useState, useMemo } from "react";
import Footer from "./Footer";
import ReceiptModal from "./ReceiptModal";
import { ACHIEVEMENTS, TIER_COLORS } from "../config/achievements";
import { computeStats } from "../lib/storage";
import { fmt } from "../lib/format";
import { pick } from "../config/i18n";

function formatDate(ts, lang) {
  const d = new Date(ts);
  if (lang === "en") {
    return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function HistoryTab({ history, lang, t, th, onShowReceipt, onClear }) {
  if (history.length === 0) {
    return (
      <div style={{ background: "#fff", borderRadius: 20, padding: "48px 20px", textAlign: "center", boxShadow: th.sectionShadow }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🧾</div>
        <div style={{ fontSize: 16, fontWeight: 900, color: th.text, marginBottom: 6 }}>{t("historyEmptyTitle")}</div>
        <div style={{ fontSize: 13, color: th.muted, lineHeight: 1.6 }}>{t("historyEmptyDesc")}</div>
      </div>
    );
  }
  return (
    <>
      <div style={{ display: "grid", gap: 10 }}>
        {history.map(o => (
          <div key={o.id} style={{ background: "#fff", borderRadius: 18, padding: "14px 16px", boxShadow: th.sectionShadow, border: "1px solid " + th.line }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, color: th.muted, fontWeight: 700 }}>{formatDate(o.ts, lang)} · {o.deliveryMode === "rabbit" ? "🐇" : "🐢"} {o.deliveryMode === "rabbit" ? (lang === "en" ? "Rabbit" : "토끼배달") : (lang === "en" ? "Turtle" : "거북이배달")}</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: th.text, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {o.items.slice(0, 2).map(it => pick(it.name, lang)).join(", ")}{o.items.length > 2 ? t("plusMore", o.items.length - 2) : ""}
                </div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 900, color: th.brand, whiteSpace: "nowrap" }}>{fmt(o.total, lang)}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 11, color: th.muted }}>🔥 {o.savedKcal.toLocaleString()} {t("kcal")} · {t("itemsCount", o.itemCount)}</div>
              <button onClick={() => onShowReceipt(o)} style={{
                border: "none", background: th.activeBg, color: th.brandDark,
                borderRadius: 10, padding: "7px 12px", fontWeight: 800, fontSize: 12,
                cursor: "pointer", fontFamily: "inherit",
              }}>{t("historyReceiptBtn")} →</button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={onClear} style={{
        marginTop: 14, width: "100%",
        background: "none", border: "1px dashed " + th.line,
        color: th.muted, padding: "10px", borderRadius: 12,
        cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700,
      }}>{t("historyClear")}</button>
    </>
  );
}

function AchievementsTab({ history, unlocked, lang, t, th }) {
  const stats = useMemo(() => computeStats(history), [history]);
  const unlockedCount = ACHIEVEMENTS.filter(a => !!unlocked[a.id]).length;
  return (
    <>
      <div style={{
        background: "linear-gradient(135deg," + th.heroStart + "," + th.heroEnd + ")",
        color: "#fff", borderRadius: 20, padding: "18px 20px", marginBottom: 12,
      }}>
        <div style={{ fontSize: 12, opacity: 0.85, fontWeight: 700 }}>{t("achProgressTitle")}</div>
        <div style={{ fontSize: 28, fontWeight: 900, marginTop: 4 }}>{unlockedCount} / {ACHIEVEMENTS.length}</div>
        <div style={{ display: "flex", gap: 14, marginTop: 10, fontSize: 12, opacity: 0.94, flexWrap: "wrap" }}>
          <span>📦 {t("achStatOrders", stats.count)}</span>
          <span>🔥 {stats.totalSavedKcal.toLocaleString()} {t("kcal")}</span>
          <span>💰 {fmt(stats.totalSpent, lang)}</span>
        </div>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {ACHIEVEMENTS.map(a => {
          const got = !!unlocked[a.id];
          const tier = TIER_COLORS[a.tier] || TIER_COLORS.bronze;
          return (
            <div key={a.id} style={{
              background: "#fff", borderRadius: 16, padding: "14px 14px",
              boxShadow: th.sectionShadow, border: "1px solid " + th.line,
              display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "center",
              opacity: got ? 1 : 0.5,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: got ? tier.bg : "#f3f4f6",
                border: "1px solid " + (got ? tier.border : "#e5e7eb"),
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, filter: got ? "none" : "grayscale(1)",
              }}>{got ? a.emoji : "🔒"}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 900, fontSize: 14, color: th.text }}>{pick(a.title, lang)}</div>
                <div style={{ fontSize: 12, color: th.muted, marginTop: 3, lineHeight: 1.45 }}>{pick(a.desc, lang)}</div>
              </div>
              <div style={{
                fontSize: 10, fontWeight: 900, letterSpacing: 0.5,
                color: tier.color, background: tier.bg, border: "1px solid " + tier.border,
                padding: "4px 8px", borderRadius: 999, textTransform: "uppercase",
              }}>{a.tier}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default function HistoryPage({ onBack, th, t, lang, history, unlocked, onClear, onInfo, onPrivacy, brand }) {
  const [tab, setTab] = useState("history");
  const [receiptTarget, setReceiptTarget] = useState(null);

  return (
    <div style={{ minHeight: "100vh", background: th.phone, fontFamily: 'Inter,"Noto Sans KR",system-ui,sans-serif', color: th.text }}>
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "linear-gradient(180deg," + th.headerStart + "," + th.headerEnd + ")", color: "#fff", padding: "14px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, maxWidth: 540, margin: "0 auto" }}>
          <button onClick={onBack} style={{ width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, fontSize: 18, border: "none", cursor: "pointer", background: "rgba(255,255,255,0.18)", color: "#fff" }}>←</button>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>{t("historyPageTitle")}</h2>
        </div>
      </div>

      <div style={{ maxWidth: 540, margin: "0 auto", padding: "16px 16px 60px" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          background: "#fff", borderRadius: 14, padding: 4, marginBottom: 14,
          boxShadow: th.sectionShadow,
        }}>
          {[
            ["history", "🧾 " + t("tabHistory")],
            ["achievements", "🏆 " + t("tabAchievements")],
          ].map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} style={{
              border: "none", borderRadius: 10, padding: "10px 8px",
              background: tab === k ? th.brand : "transparent",
              color: tab === k ? "#fff" : th.text,
              fontWeight: 900, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
              transition: ".15s",
            }}>{label}</button>
          ))}
        </div>

        {tab === "history" ? (
          <HistoryTab history={history} lang={lang} t={t} th={th} onShowReceipt={setReceiptTarget} onClear={onClear} />
        ) : (
          <AchievementsTab history={history} unlocked={unlocked} lang={lang} t={t} th={th} />
        )}

        <Footer th={th} t={t} onInfo={onInfo} onPrivacy={onPrivacy} />
      </div>

      {receiptTarget && (
        <ReceiptModal
          record={receiptTarget}
          lang={lang}
          brand={brand}
          th={th}
          t={t}
          onClose={() => setReceiptTarget(null)}
        />
      )}
    </div>
  );
}
