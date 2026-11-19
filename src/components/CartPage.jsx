import { fmt } from "../lib/format";
import { pick } from "../config/i18n";
import { cartItemKcal, cartKcal } from "../lib/savings";

export default function CartPage({
  cart, totals, lang, t, th, onBack, onChangeQty, onRemove, onClearAll, onCheckout, onBrowse,
  unmetMinOrders, buildOptLabel,
}) {
  const kcal = cartKcal(cart);
  const qtyBtn = {
    width: 30, height: 30, borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff",
    cursor: "pointer", fontWeight: 900, fontFamily: "inherit", fontSize: 15, color: "#374151",
    display: "flex", alignItems: "center", justifyContent: "center", padding: 0, lineHeight: 1,
  };
  const cardBorder = "1px solid " + (th.cardBorder || th.line);
  const blocked = unmetMinOrders.length > 0;

  return (
    <div style={{ minHeight: "100dvh", background: th.phone, color: th.text, fontFamily: 'Inter,"Noto Sans KR",system-ui,sans-serif' }}>
      <div data-ad-clip="top" style={{ position: "sticky", top: 0, zIndex: 10, background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "calc(10px + env(safe-area-inset-top)) 16px 10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, maxWidth: 540, margin: "0 auto" }}>
          <button onClick={onBack} aria-label={t("backAria")} style={{ width: 36, height: 36, borderRadius: 12, border: "none", background: "#f3f4f6", color: "#1c1917", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0 }}>←</button>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, flex: 1 }}>{t("cartTitle")}</h2>
          {cart.length > 0 && (
            <button onClick={onClearAll} style={{ border: "none", background: "none", color: "#78716c", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{t("cartClearAll")}</button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 540, margin: "0 auto", padding: "16px 16px calc(110px + env(safe-area-inset-bottom))", display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 14 }}>
        {cart.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 20, padding: "48px 20px", textAlign: "center", border: cardBorder, boxShadow: th.sectionShadow }}>
            <div style={{ fontSize: 52, marginBottom: 10 }}>🛒</div>
            <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 6 }}>{t("cartEmptyTitle")}</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>{t("cartEmptyDesc")}</div>
            <button onClick={onBrowse} style={{ border: "none", background: th.primaryBtn, color: "#fff", borderRadius: 14, padding: "12px 18px", fontWeight: 900, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>{t("cartBrowseBtn")}</button>
          </div>
        ) : (
          <>
            {blocked && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 16, padding: "14px 16px" }}>
                <div style={{ fontWeight: 900, color: "#dc2626", marginBottom: 8, fontSize: 13 }}>⚠️ {t("minOrderBannerTitle")}</div>
                {unmetMinOrders.map(u => (
                  <div key={u.id} style={{ fontSize: 12, color: "#7f1d1d", fontWeight: 700 }}>{t("minOrderShortfallLine", u.name, fmt(u.subtotal, lang), fmt(u.minOrder, lang))}</div>
                ))}
              </div>
            )}

            <div style={{ background: "#fff", borderRadius: 20, padding: "6px 16px", border: cardBorder, boxShadow: th.sectionShadow }}>
              {cart.map((item, idx) => {
                const label = buildOptLabel(item);
                return (
                  <div key={item.cartKey} style={{ padding: "14px 0", borderTop: idx ? "1px solid #f3f4f6" : "none" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 700 }}>{pick(item.restaurantName, lang)}</div>
                        <div style={{ fontWeight: 900, fontSize: 15, marginTop: 2 }}>{pick(item.name, lang)}</div>
                        {label && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{t("cartOptionsPrefix")} {label}</div>}
                        <div style={{ fontSize: 12, color: "#ea580c", fontWeight: 800, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>🔥 {t("cartItemKcal", cartItemKcal(item).toLocaleString())}</div>
                      </div>
                      <button onClick={() => onRemove(item.cartKey)} aria-label={t("cartRemoveAria")} style={{ border: "none", background: "none", color: "#9ca3af", fontSize: 18, cursor: "pointer", padding: 2, lineHeight: 1 }}>✕</button>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10, fontVariantNumeric: "tabular-nums" }}>
                      <strong style={{ fontSize: 16 }}>{fmt(item.price * item.qty, lang)}</strong>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button onClick={() => onChangeQty(item.cartKey, -1)} style={qtyBtn}>−</button>
                        <strong style={{ fontSize: 14, minWidth: 18, textAlign: "center" }}>{item.qty}</strong>
                        <button onClick={() => onChangeQty(item.cartKey, 1)} style={qtyBtn}>＋</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ background: "#fff", borderRadius: 20, padding: 16, border: cardBorder, boxShadow: th.sectionShadow, display: "grid", gap: 8, fontVariantNumeric: "tabular-nums" }}>
              {[[t("cartSubtotal"), fmt(totals.sub, lang)], [t("cartFeeVirtual"), fmt(totals.del, lang)]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6b7280" }}><span>{k}</span><strong style={{ color: "#1c1917" }}>{v}</strong></div>
              ))}
              <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontWeight: 900, fontSize: 15 }}>{t("cartTotalLabel")}</span>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 900, fontSize: 20, color: th.brand }}>{fmt(totals.total, lang)}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{t("cartRealCharge")}</div>
                </div>
              </div>
              <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, padding: "10px 12px", fontSize: 12, fontWeight: 800, color: "#c2410c", textAlign: "center" }}>
                🔥 {t("cartSavingsHint", fmt(totals.total, lang), kcal.toLocaleString())}
              </div>
            </div>
          </>
        )}
      </div>

      {cart.length > 0 && (
        <div data-ad-clip="bottom" style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 20, background: "rgba(255,255,255,0.96)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderTop: "1px solid rgba(254,215,170,0.55)", boxShadow: "0 -4px 20px rgba(17,24,39,0.06)", padding: "12px 16px calc(12px + env(safe-area-inset-bottom))" }}>
          <button
            onClick={onCheckout}
            disabled={blocked}
            style={{ display: "block", width: "100%", maxWidth: 508, margin: "0 auto", border: "none", borderRadius: 16, padding: "16px", background: th.primaryBtn, color: "#fff", fontWeight: 900, fontSize: 16, cursor: blocked ? "default" : "pointer", opacity: blocked ? 0.5 : 1, fontFamily: "inherit", boxShadow: "0 8px 20px " + th.primaryBtn + "44" }}
          >{t("cartCheckoutBtn", fmt(totals.total, lang))}</button>
        </div>
      )}
    </div>
  );
}
