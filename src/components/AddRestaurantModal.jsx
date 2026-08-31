import { useState } from "react";
import { compressImageFile } from "../lib/imageCompress";

// Bottom-sheet form for the "add your own restaurant" feature. Creates a
// restaurant object shaped exactly like the built-in catalog entries
// (config/restaurants.js) plus isCustom:true, so it merges in seamlessly.

const fieldStyle = {
  width: "100%", padding: "12px 14px", border: "1px solid #e5e7eb", outline: "none",
  borderRadius: 12, fontFamily: "inherit", fontSize: 14, boxSizing: "border-box",
};

function makeCustomId(prefix) {
  return prefix + "_" + Date.now().toString(36) + "_" + Math.floor(Math.random() * 1e6).toString(36);
}

export default function AddRestaurantModal({ onClose, onCreate, brand, t }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🍴");
  const [category, setCategory] = useState("");
  const [fee, setFee] = useState("3000");
  const [minOrder, setMinOrder] = useState("12000");
  const [menuName, setMenuName] = useState("");
  const [menuDesc, setMenuDesc] = useState("");
  const [menuPrice, setMenuPrice] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const pickPhoto = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const submit = async () => {
    const nm = name.trim();
    const mName = menuName.trim();
    const mPrice = parseInt(menuPrice, 10);
    if (!nm || !mName || !mPrice || mPrice <= 0) {
      alert(t("restaurantFormRequiredAlert"));
      return;
    }
    setSubmitting(true);
    const photo = photoFile ? await compressImageFile(photoFile).catch(() => null) : null;
    const restaurantId = makeCustomId("custom_r");
    onCreate({
      id: restaurantId,
      name: { ko: nm, en: nm },
      emoji: emoji.trim() || "🍴",
      time: "20~30",
      rating: 5.0,
      reviews: 1,
      fee: Math.max(0, parseInt(fee, 10) || 0),
      minOrder: Math.max(0, parseInt(minOrder, 10) || 0),
      category: { ko: category.trim() || "기타", en: category.trim() || "Other" },
      isCustom: true,
      menus: [{
        id: makeCustomId("custom_m"),
        restaurantId,
        name: { ko: mName, en: mName },
        desc: { ko: menuDesc.trim(), en: menuDesc.trim() },
        price: mPrice,
        options: {},
        isCustom: true,
        ...(photo ? { photo } : {}),
      }],
    });
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: "20px 20px 32px", width: "100%", maxWidth: 540, maxHeight: "86vh", overflowY: "auto", animation: "slideUp .25s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>{t("addRestaurantTitle")}</h3>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 12, border: "none", background: "#f3f4f6", fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 84px", gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 800, color: "#374151", display: "block", marginBottom: 6 }}>{t("restaurantNameLabel")}</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder={t("restaurantNamePh")} style={fieldStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 800, color: "#374151", display: "block", marginBottom: 6 }}>{t("restaurantEmojiLabel")}</label>
              <input value={emoji} onChange={e => setEmoji(e.target.value)} placeholder={t("restaurantEmojiPh")} style={{ ...fieldStyle, textAlign: "center" }} maxLength={4} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: "#374151", display: "block", marginBottom: 6 }}>{t("restaurantCategoryLabel")}</label>
            <input value={category} onChange={e => setCategory(e.target.value)} placeholder={t("restaurantCategoryPh")} style={fieldStyle} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 800, color: "#374151", display: "block", marginBottom: 6 }}>{t("restaurantFeeLabel")}</label>
              <input value={fee} onChange={e => setFee(e.target.value)} placeholder={t("restaurantFeePh")} type="number" inputMode="numeric" style={fieldStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 800, color: "#374151", display: "block", marginBottom: 6 }}>{t("restaurantMinOrderLabel")}</label>
              <input value={minOrder} onChange={e => setMinOrder(e.target.value)} placeholder={t("restaurantMinOrderPh")} type="number" inputMode="numeric" style={fieldStyle} />
            </div>
          </div>

          <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 14, marginTop: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 900, marginBottom: 10 }}>{t("firstMenuTitle")}</div>
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
              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: "#374151", display: "block", marginBottom: 6 }}>{t("menuPhotoLabel")}</label>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <div style={{ width: 56, height: 56, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: "#f3f4f6", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {photoPreview ? (
                      <img src={photoPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontSize: 20 }}>📷</span>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 700 }}>{photoPreview ? t("menuPhotoChange") : t("menuPhotoHint")}</span>
                  <input type="file" accept="image/*" onChange={pickPhoto} style={{ display: "none" }} />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ border: "1px solid #e5e7eb", background: "#fff", color: "#374151", borderRadius: 14, padding: "13px 10px", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>{t("cancelBtn")}</button>
          <button onClick={submit} disabled={submitting} style={{ border: "none", background: brand, color: "#fff", borderRadius: 14, padding: "13px 10px", fontWeight: 900, fontSize: 14, cursor: submitting ? "default" : "pointer", opacity: submitting ? 0.7 : 1, fontFamily: "inherit" }}>{t("createBtn")}</button>
        </div>
      </div>
    </div>
  );
}
