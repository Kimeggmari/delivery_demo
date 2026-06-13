export default function Footer({ th, onInfo, onPrivacy, t }) {
  const tr = t || ((k) => k);
  return (
    <div style={{ textAlign: "center", padding: "24px 20px 12px", fontSize: 12, color: th.muted, lineHeight: 2 }}>
      <div>
        <button onClick={onInfo} style={{ background: "none", border: "none", color: th.muted, cursor: "pointer", fontFamily: "inherit", fontSize: 12, textDecoration: "underline", marginRight: 12 }}>{tr("footerAppInfo")}</button>
        <button onClick={onPrivacy} style={{ background: "none", border: "none", color: th.muted, cursor: "pointer", fontFamily: "inherit", fontSize: 12, textDecoration: "underline" }}>{tr("footerPrivacy")}</button>
      </div>
      <div style={{ marginTop: 4, fontSize: 11, opacity: 0.6 }}>{tr("footerCopy")}</div>
    </div>
  );
}
