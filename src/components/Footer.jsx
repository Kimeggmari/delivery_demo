export default function Footer({ th, onInfo, onPrivacy }) {
  return (
    <div style={{ textAlign: "center", padding: "24px 20px 12px", fontSize: 12, color: th.muted, lineHeight: 2 }}>
      <div>
        <button onClick={onInfo} style={{ background: "none", border: "none", color: th.muted, cursor: "pointer", fontFamily: "inherit", fontSize: 12, textDecoration: "underline", marginRight: 12 }}>앱 소개</button>
        <button onClick={onPrivacy} style={{ background: "none", border: "none", color: th.muted, cursor: "pointer", fontFamily: "inherit", fontSize: 12, textDecoration: "underline" }}>개인정보처리방침</button>
      </div>
      <div style={{ marginTop: 4, fontSize: 11, opacity: 0.6 }}>© 2025 폭식말고안돼 · 데모 앱</div>
    </div>
  );
}
