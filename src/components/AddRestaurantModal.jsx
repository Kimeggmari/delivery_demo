import { useState } from "react";
import { compressImageFile } from "../lib/imageCompress";
import { pick } from "../config/i18n";

// Bottom-sheet form for the "add your own restaurant" feature. Creates a
// restaurant object shaped exactly like the built-in catalog entries
// (config/restaurants.js) plus isCustom:true, so it merges in seamlessly.

const fieldStyle = {
  width: "100%", padding: "12px 14px", border: "1px solid #e5e7eb", outline: "none",
  borderRadius: 12, fontFamily: "inherit", fontSize: 16, boxSizing: "border-box",
};

// Curated from the built-in catalog's own categories (config/restaurants.js)
// so custom restaurants stay consistent with the existing filter/badge set
// instead of accumulating one-off free-text spellings.
const CATEGORY_OPTIONS = [
  { ko: "치킨", en: "Chicken" },
  { ko: "일식", en: "Japanese" },
  { ko: "양식", en: "Italian" },
  { ko: "샐러드", en: "Salad" },
  { ko: "한식", en: "Korean" },
  { ko: "중식", en: "Chinese" },
  { ko: "분식", en: "Street Food" },
  { ko: "카페", en: "Cafe" },
  { ko: "마라탕", en: "Mala" },
  { ko: "아이스크림", en: "Ice Cream" },
  { ko: "곱창", en: "Tripe" },
  { ko: "초밥", en: "Sushi" },
  { ko: "햄버거", en: "Burger" },
  { ko: "피자", en: "Pizza" },
  { ko: "타코야끼", en: "Takoyaki" },
  { ko: "빙수", en: "Bingsu" },
  { ko: "와플", en: "Waffle" },
  { ko: "기타", en: "Other" },
];

function makeCustomId(prefix) {
  return prefix + "_" + Date.now().toString(36) + "_" + Math.floor(Math.random() * 1e6).toString(36);
}

export default function AddRestaurantModal({ onClose, onCreate, brand, t, lang }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🍴");
  const [category, setCategory] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [fee, setFee] = useState("3000");
  const [minOrder, setMinOrder] = useState("12000");
  const [menuName, setMenuName] = useState("");
  const [menuDesc, setMenuDesc] = useState("");
  const [menuPrice, setMenuPrice] = useState("");
  const [menuCalorie, setMenuCalorie] = useState("");
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
    const isOtherCategory = category === "기타";
    const finalCategory = isOtherCategory && customCategory.trim()
      ? { ko: customCategory.trim(), en: customCategory.trim() }
      : (() => {
          const opt = CATEGORY_OPTIONS.find(o => o.ko === category) || CATEGORY_OPTIONS[CATEGORY_OPTIONS.length - 1];
          return { ko: opt.ko, en: opt.en };
        })();
    const calorie = parseInt(menuCalorie, 10);
    onCreate({
      id: restaurantId,
      name: { ko: nm, en: nm },
      emoji: emoji.trim() || "🍴",
      time: "20~30",
      rating: 5.0,
      reviews: 1,
      fee: Math.max(0, parseInt(fee, 10) || 0),
      minOrder: Math.max(0, parseInt(minOrder, 10) || 0),
      category: finalCategory,
      isCustom: true,
      menus: [{
        id: makeCustomId("custom_m"),
        restaurantId,
        name: { ko: mName, en: mName },
        desc: { ko: menuDesc.trim(), en: menuDesc.trim() },
        price: mPrice,
        options: {},
        isCustom: true,
        ...(calorie > 0 ? { calories: calorie } : {}),
        ...(photo ? { photo } : {}),
      }],
    });
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: "20px 20px calc(32px + env(safe-area-inset-bottom))", width: "100%", maxWidth: 540, maxHeight: "86vh", overflowY: "auto", animation: "slideUp .25s ease" }}>
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
            <button
              type="button"
              onClick={() => setCategoryOpen(o => !o)}
              style={{
                ...fieldStyle, display: "flex", alignItems: "center", justifyContent: "space-between",
                cursor: "pointer", background: "#fff", textAlign: "left",
              }}
            >
              <span style={{ color: category ? "#111827" : "#9ca3af", fontWeight: category ? 700 : 400 }}>
                {category === "기타" ? t("restaurantCategoryOtherLabel") : (category || t("restaurantCategoryPh"))}
              </span>
              <span style={{ color: "#9ca3af", fontSize: 12, flexShrink: 0, marginLeft: 8 }}>{categoryOpen ? "▲" : "▼"}</span>
            </button>
            {categoryOpen && (
              <div style={{ maxHeight: 206, overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: 12, background: "#fff", marginTop: 6 }}>
                {CATEGORY_OPTIONS.map((opt, i) => {
                  const active = category === opt.ko;
                  const isOther = opt.ko === "기타";
                  return (
                    <button
                      key={opt.ko}
                      type="button"
                      onClick={() => { setCategory(opt.ko); setCategoryOpen(false); }}
                      style={{
                        display: "block", width: "100%", textAlign: "left",
                        padding: "10px 14px", border: "none",
                        borderBottom: i === CATEGORY_OPTIONS.length - 1 ? "none" : "1px solid #f3f4f6",
                        background: active ? "#fff7ed" : "#fff",
                        color: active ? "#c2410c" : "#111827",
                        fontWeight: active ? 900 : 600, fontSize: 14,
                        cursor: "pointer", fontFamily: "inherit",
                      }}
                    >{active ? "✓ " : ""}{isOther ? t("restaurantCategoryOtherLabel") : pick(opt, lang)}</button>
                  );
                })}
              </div>
            )}
            {category === "기타" && (
              <input
                value={customCategory}
                onChange={e => setCustomCategory(e.target.value)}
                placeholder={t("restaurantCategoryOtherPh")}
                style={{ ...fieldStyle, marginTop: 8 }}
              />
            )}
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
                <label style={{ fontSize: 12, fontWeight: 800, color: "#374151", display: "block", marginBottom: 6 }}>{t("menuCalorieLabel")}</label>
                <input value={menuCalorie} onChange={e => setMenuCalorie(e.target.value)} placeholder={t("menuCaloriePh")} type="number" inputMode="numeric" style={fieldStyle} />
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
                <div style={{ fontSize: 11, color: "#b45309", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "8px 10px", marginTop: 8, lineHeight: 1.5 }}>{t("menuPhotoCopyrightWarning")}</div>
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
