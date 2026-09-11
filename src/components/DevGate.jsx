import { useState } from "react";

const STORAGE_KEY = "fna_dev_access";

// Simple client-side passcode gate for the hidden /dev route — not real
// security, just enough friction to keep the link from being casually
// stumbled on. See main.jsx for how this is wired to the route.
export default function DevGate({ passcode, children }) {
  const [unlocked, setUnlocked] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === passcode; } catch { return false; }
  });
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  if (unlocked) return children;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input === passcode) {
      try { localStorage.setItem(STORAGE_KEY, passcode); } catch { /* ignore */ }
      setUnlocked(true);
    } else {
      setError(true);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a", fontFamily: 'Inter,"Noto Sans KR",system-ui,-apple-system,sans-serif', padding: 20 }}>
      <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: 20, padding: "28px 24px", width: "100%", maxWidth: 320, boxShadow: "0 20px 50px rgba(0,0,0,0.35)" }}>
        <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 14, color: "#111827" }}>접근 코드</div>
        <input
          type="password"
          autoFocus
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(false); }}
          style={{ width: "100%", boxSizing: "border-box", border: "1px solid " + (error ? "#dc2626" : "#e5e7eb"), borderRadius: 10, padding: "11px 12px", fontSize: 14, marginBottom: 12, fontFamily: "inherit" }}
        />
        {error && <div style={{ color: "#dc2626", fontSize: 12, marginBottom: 12, fontWeight: 700 }}>코드가 올바르지 않습니다.</div>}
        <button type="submit" style={{ width: "100%", border: "none", borderRadius: 10, padding: "12px 16px", background: "#111827", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>확인</button>
      </form>
    </div>
  );
}
