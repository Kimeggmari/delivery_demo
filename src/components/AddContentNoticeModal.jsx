// Consent-style notice shown right before a locally-saved draft
// restaurant/dish is published to the shared server (see App.jsx's
// publishTarget gate). Shown every time (no dismiss-persistence), same as
// the other one-off modals in this app (SponsorModal, InstallAppModal).

export default function AddContentNoticeModal({ onConfirm, onClose, t, th, confirmLabel }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 210, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 24, padding: "24px 22px", width: "100%", maxWidth: 380, boxShadow: "0 24px 60px rgba(15,23,42,0.3)" }}>
        <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 14 }}>{t("addNoticeTitle")}</div>
        <ul style={{ margin: 0, padding: "0 0 0 18px", display: "grid", gap: 8, fontSize: 13, color: "#4b5563", lineHeight: 1.5 }}>
          <li>{t("addNoticeApproval")}</li>
          <li>{t("addNoticeCopyright")}</li>
          <li>{t("addNoticeModeration")}</li>
        </ul>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ border: "1px solid #e5e7eb", background: "#fff", color: "#374151", borderRadius: 14, padding: "13px 10px", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>{t("cancelBtn")}</button>
          <button onClick={onConfirm} style={{ border: "none", background: th.primaryBtn, color: "#fff", borderRadius: 14, padding: "13px 10px", fontWeight: 900, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>{confirmLabel || t("addNoticeConfirm")}</button>
        </div>
      </div>
    </div>
  );
}
