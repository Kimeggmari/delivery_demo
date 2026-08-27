import { useState } from "react";
import { pick } from "../config/i18n";

// Bottom-sheet form for adding one extra menu item to an existing
// restaurant (built-in or custom) — the second half of the
// "add your own restaurant/menu" feature.

const fieldStyle = {
  width: "100%", padding: "12px 14px", border: "1px solid #e5e7eb", outline: "none",
  borderRadius: 12, fontFamily: "inherit", fontSize: 14, boxSizing: "border-box",
};

function makeCustomId(prefix) {
  return prefix + "_" + Date.now().toString(36) + "_" + Math.floor(Math.random() * 1e6).toString(36);
}

export default function AddMenuModal({ restaurant, onClose, onCreate, brand, t, lang }) {
  const [menuName, setMenuName] = useState("");
  const [menuDesc, setMenuDesc] = useState("");
  const [menuPrice, setMenuPrice] = useState("");

  const submit = () => {
    const mName = menuName.trim();
    const mPrice = parseInt(menuPrice, 10);
    if (!mName || !mPrice || mPrice <= 0) {
      alert(t("menuFormRequiredAlert"));
      return;
    }
    onCreate({
      id: makeCustomId("custom_m"),
      restaurantId: restaurant.id,
      name: { ko: mName, en: mName },
      desc: { ko: menuDesc.trim(), en: menuDesc.trim() },
      price: mPrice,
      options: {},
      isCustom: true,
    });
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: "20px 20px 32px", width: "100%", maxWidth: 540, maxHeight: "80vh", overflowY: "auto", animation: "slideUp .25s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900 }}>{restaurant.emoji} {t("addMenuTitle", pick(restaurant.name, lang))}</h3>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 12, border: "none", background: "#f3f4f6", fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: "#374151", display: "block", marginBottom: 6 }}>{t("menuNameLabel")}</label>
            <input value={menuName} onChange={e => setMenuName(e.target.value)} placeholder={t("menuNamePh")} style={fieldStyle} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: "#374151", display: "block", marginBottom: 6 }}>{t("menuDescLabel")}</label>
            <input value={menuDesc} onChange={e => setMenuDesc(e.target.value)} placeholder={t("menuDescPh")} style={fieldStyle} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: "#374151", display: "block", marginBottom: 6 }}>{t("menuPriceLabel")}</label>
            <input value={menuPrice} onChange={e => setMenuPrice(e.target.value)} placeholder={t("menuPricePh")} type="number" inputMode="numeric" style={fieldStyle} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ border: "1px solid #e5e7eb", background: "#fff", color: "#374151", borderRadius: 14, padding: "13px 10px", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>{t("cancelBtn")}</button>
          <button onClick={submit} style={{ border: "none", background: brand, color: "#fff", borderRadius: 14, padding: "13px 10px", fontWeight: 900, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>{t("createBtn")}</button>
        </div>
      </div>
    </div>
  );
}
