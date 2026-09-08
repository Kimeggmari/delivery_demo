import { nicknameFor } from "../lib/nickname";
import { deliveryModes } from "../config/ordering";
import { pick } from "../config/i18n";

const rowStyle = {
  width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "14px 16px", background: "#f9fafb", border: "1px solid #f3f4f6", borderRadius: 14,
  marginBottom: 10, fontSize: 14, fontWeight: 800, color: "#111827", cursor: "pointer", fontFamily: "inherit",
};

export default function SettingsModal({
  onClose, t, lang, uid,
  onToggleLang, onShowInfo, onPrivacy,
  deliveryTimeOverrides, onChangeDeliveryTime,
}) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 140, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: "20px 20px 32px", width: "100%", maxWidth: 540, maxHeight: "85vh", overflowY: "auto", animation: "slideUp .3s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>{t("settingsTitle")}</h3>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 12, border: "none", background: "#f3f4f6", fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#f9fafb", borderRadius: 16, padding: "14px 16px", marginBottom: 14, border: "1px solid #f3f4f6" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🙂</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 700 }}>{t("myNicknameLabel")}</div>
            <div style={{ fontSize: 15, fontWeight: 900, color: "#111827" }}>{nicknameFor(uid, lang)}</div>
          </div>
        </div>

        <button onClick={onToggleLang} style={rowStyle}>
          <span>{t("settingsLanguageLabel")}</span>
          <span style={{ color: "#9ca3af", fontWeight: 800 }}>{lang === "ko" ? "한국어" : "English"} ›</span>
        </button>

        <button onClick={onShowInfo} style={rowStyle}>
          <span>{t("settingsAppInfoLabel")}</span>
          <span style={{ color: "#9ca3af" }}>›</span>
        </button>

        <button onClick={onPrivacy} style={rowStyle}>
          <span>{t("privacyTitle")}</span>
          <span style={{ color: "#9ca3af" }}>›</span>
        </button>

        <div style={{ marginTop: 18 }}>
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>{t("settingsDeliveryTimeTitle")}</div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 14, lineHeight: 1.5 }}>{t("settingsDeliveryTimeDesc")}</div>
          {["rabbit", "turtle"].map(key => (
            <div key={key} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 800, marginBottom: 6 }}>
                <span>{deliveryModes[key].emoji} {pick(deliveryModes[key].label, lang)}</span>
                <span>{deliveryTimeOverrides[key]}{t("minutes")}</span>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                value={deliveryTimeOverrides[key]}
                onChange={e => onChangeDeliveryTime(key, Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
