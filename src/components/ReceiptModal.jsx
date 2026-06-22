import { useEffect, useRef, useState, useCallback } from "react";
import { fmt } from "../lib/format";
import { pick } from "../config/i18n";

// Draws a shareable receipt to canvas (no extra deps), then offers
// Web Share (mobile) and PNG download fallbacks.
//
// Canvas units are physical pixels at 2x density so the exported image
// stays crisp on retina screens and after social-app re-encoding.

const SCALE = 2;
const WIDTH = 360;          // logical width
const PADDING = 24;

function formatDateTime(ts, lang) {
  const d = new Date(ts);
  if (lang === "en") {
    return d.toLocaleString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }
  return d.toLocaleString("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

// Plain-text receipt summary used as the clipboard fallback when image
// clipboard write is blocked (common on Android WebView / older browsers).
function buildReceiptText(record, lang, t) {
  const lines = [];
  lines.push(`🍱 ${t("appName")} · DEMO`);
  lines.push(formatDateTime(record.ts, lang));
  lines.push("");
  for (const it of record.items) {
    const nm = pick(it.name, lang) || "";
    lines.push(`- ${nm} × ${it.qty}  ${fmt((it.price || 0) * (it.qty || 1), lang)}`);
  }
  lines.push("");
  lines.push(`${t("totalLabel")}: ${fmt(record.total, lang)}`);
  lines.push(`🔥 ${record.savedKcal.toLocaleString()} ${t("kcal")}`);
  lines.push("");
  lines.push(t("receiptShareFooter"));
  return lines.join("\n");
}

async function writeTextLegacy(text) {
  return new Promise((resolve, reject) => {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.top = "0";
      ta.style.left = "0";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      ok ? resolve() : reject(new Error("execCommand failed"));
    } catch (e) {
      reject(e);
    }
  });
}

function wrapText(ctx, text, maxWidth) {
  // Simple greedy line wrapper (works for both KR and EN).
  if (!text) return [""];
  const out = [];
  let line = "";
  for (const ch of String(text)) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line) {
      out.push(line);
      line = ch;
    } else {
      line = test;
    }
  }
  if (line) out.push(line);
  return out;
}

function drawReceipt(canvas, { record, lang, brand, t }) {
  const ctx = canvas.getContext("2d");
  const itemLines = record.items.length;
  // Measured layout — height grows with item count.
  const baseHeight = 460;
  const perItem = 44;
  const height = baseHeight + perItem * itemLines;

  canvas.width = WIDTH * SCALE;
  canvas.height = height * SCALE;
  canvas.style.width = WIDTH + "px";
  canvas.style.height = height + "px";
  ctx.scale(SCALE, SCALE);

  // Background card with subtle gradient.
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, "#fffaf2");
  grad.addColorStop(1, "#ffffff");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, WIDTH, height);

  // Watermark stripe (top).
  ctx.fillStyle = brand;
  ctx.fillRect(0, 0, WIDTH, 6);

  let y = PADDING + 6;
  const x = PADDING;
  const contentW = WIDTH - PADDING * 2;

  // Header — title + DEMO badge.
  ctx.fillStyle = "#111827";
  ctx.font = "900 19px Inter, 'Noto Sans KR', system-ui, sans-serif";
  ctx.textBaseline = "top";
  ctx.fillText(`🍱 ${t("appName")}`, x, y);

  ctx.fillStyle = "#ef4444";
  ctx.font = "800 10px Inter, system-ui, sans-serif";
  const demoLabel = "DEMO";
  const demoW = ctx.measureText(demoLabel).width + 12;
  const demoX = WIDTH - PADDING - demoW;
  ctx.fillStyle = "#fee2e2";
  ctx.fillRect(demoX, y + 2, demoW, 16);
  ctx.fillStyle = "#dc2626";
  ctx.textAlign = "center";
  ctx.fillText(demoLabel, demoX + demoW / 2, y + 5);
  ctx.textAlign = "left";

  y += 28;

  // Date/time
  ctx.fillStyle = "#6b7280";
  ctx.font = "500 11px Inter, 'Noto Sans KR', system-ui, sans-serif";
  ctx.fillText(formatDateTime(record.ts, lang), x, y);
  y += 18;

  // Dashed divider
  ctx.strokeStyle = "#e5e7eb";
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(WIDTH - PADDING, y);
  ctx.stroke();
  ctx.setLineDash([]);
  y += 14;

  // Info rows
  const rows = [
    [t("receiptOrderer"), record.customerName || "-"],
    [t("sumMode"), (record.deliveryMode === "rabbit" ? "🐇 " : "🐢 ") + (lang === "en" ? (record.deliveryMode === "rabbit" ? "Rabbit" : "Turtle") : (record.deliveryMode === "rabbit" ? "토끼배달" : "거북이배달"))],
    [t("sumPay"), record.payment || "-"],
  ];
  ctx.font = "700 12px Inter, 'Noto Sans KR', system-ui, sans-serif";
  for (const [k, v] of rows) {
    ctx.fillStyle = "#6b7280";
    ctx.fillText(k, x, y);
    ctx.fillStyle = "#111827";
    ctx.textAlign = "right";
    const wrapped = wrapText(ctx, v, contentW * 0.55);
    wrapped.forEach((ln, i) => {
      ctx.fillText(ln, WIDTH - PADDING, y + i * 14);
    });
    ctx.textAlign = "left";
    y += 18 + Math.max(0, (wrapped.length - 1) * 14);
  }

  // Items header
  y += 8;
  ctx.strokeStyle = "#e5e7eb";
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(WIDTH - PADDING, y);
  ctx.stroke();
  ctx.setLineDash([]);
  y += 12;

  ctx.fillStyle = "#111827";
  ctx.font = "900 13px Inter, 'Noto Sans KR', system-ui, sans-serif";
  ctx.fillText(t("receiptItemsTitle"), x, y);
  y += 20;

  // Items
  ctx.font = "600 12px Inter, 'Noto Sans KR', system-ui, sans-serif";
  for (const it of record.items) {
    const nm = pick(it.name, lang) || "";
    const lineTotal = (it.price || 0) * (it.qty || 1);
    ctx.fillStyle = "#111827";
    const nameLines = wrapText(ctx, nm + ` × ${it.qty}`, contentW * 0.62);
    nameLines.forEach((ln, i) => ctx.fillText(ln, x, y + i * 14));
    ctx.textAlign = "right";
    ctx.fillStyle = "#111827";
    ctx.fillText(fmt(lineTotal, lang), WIDTH - PADDING, y);
    ctx.textAlign = "left";

    // Restaurant (small grey line)
    ctx.fillStyle = "#9ca3af";
    ctx.font = "500 10px Inter, 'Noto Sans KR', system-ui, sans-serif";
    ctx.fillText(pick(it.restaurantName, lang) || "", x, y + nameLines.length * 14);
    ctx.font = "600 12px Inter, 'Noto Sans KR', system-ui, sans-serif";

    y += nameLines.length * 14 + 16;
  }

  // Totals
  ctx.strokeStyle = "#e5e7eb";
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(WIDTH - PADDING, y);
  ctx.stroke();
  ctx.setLineDash([]);
  y += 14;

  const totalRows = [
    [t("productPrice"), fmt(record.subtotal, lang)],
    [t("deliveryFee"), fmt(record.deliveryFee, lang)],
    [t("serviceFee"), fmt(record.serviceFee, lang)],
  ];
  ctx.font = "600 12px Inter, 'Noto Sans KR', system-ui, sans-serif";
  for (const [k, v] of totalRows) {
    ctx.fillStyle = "#6b7280";
    ctx.fillText(k, x, y);
    ctx.fillStyle = "#111827";
    ctx.textAlign = "right";
    ctx.fillText(v, WIDTH - PADDING, y);
    ctx.textAlign = "left";
    y += 18;
  }

  y += 4;
  ctx.fillStyle = "#111827";
  ctx.font = "900 16px Inter, 'Noto Sans KR', system-ui, sans-serif";
  ctx.fillText(t("totalLabel"), x, y);
  ctx.textAlign = "right";
  ctx.fillStyle = brand;
  ctx.fillText(fmt(record.total, lang), WIDTH - PADDING, y);
  ctx.textAlign = "left";
  y += 26;

  // Saved kcal callout
  ctx.fillStyle = "#dcfce7";
  ctx.fillRect(x, y, contentW, 44);
  ctx.fillStyle = "#15803d";
  ctx.font = "900 14px Inter, 'Noto Sans KR', system-ui, sans-serif";
  ctx.fillText(`🔥 ${record.savedKcal.toLocaleString()} ${t("kcal")} ${t("completeSavedSuffix")}`, x + 12, y + 14);
  y += 56;

  // Footer
  ctx.fillStyle = "#9ca3af";
  ctx.font = "500 10px Inter, 'Noto Sans KR', system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(t("receiptShareFooter"), WIDTH / 2, y);
}

export default function ReceiptModal({ record, lang, brand, t, th, onClose }) {
  const canvasRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (canvasRef.current) {
      drawReceipt(canvasRef.current, { record, lang, brand, t });
    }
  }, [record, lang, brand, t]);

  const flash = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  }, []);

  const getBlob = useCallback(() => new Promise(resolve => {
    canvasRef.current?.toBlob(b => resolve(b), "image/png");
  }), []);

  const handleDownload = useCallback(async () => {
    setBusy(true);
    try {
      const blob = await getBlob();
      if (!blob) throw new Error("blob");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `foodneverarrives_${record.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 500);
      flash(t("receiptDownloaded"));
    } catch {
      flash(t("receiptError"));
    } finally {
      setBusy(false);
    }
  }, [getBlob, record.id, flash, t]);

  const handleShare = useCallback(async () => {
    setBusy(true);
    try {
      const blob = await getBlob();
      if (!blob) throw new Error("blob");
      const file = new File([blob], `foodneverarrives_${record.id}.png`, { type: "image/png" });
      const shareData = {
        title: t("appName"),
        text: t("receiptShareText"),
        files: [file],
      };
      if (navigator.canShare?.(shareData) && navigator.share) {
        await navigator.share(shareData);
        flash(t("receiptShared"));
      } else {
        // Fallback for desktop browsers.
        await handleDownload();
      }
    } catch (err) {
      if (err && err.name !== "AbortError") flash(t("receiptError"));
    } finally {
      setBusy(false);
    }
  }, [getBlob, record.id, flash, t, handleDownload]);

  const handleCopy = useCallback(async () => {
    setBusy(true);
    // Try image clipboard first (desktop browsers). If anything in that path
    // throws or is missing — common on Android WebView and older Safari —
    // silently fall back to copying the receipt as text so the button still
    // produces something useful.
    try {
      const blob = await getBlob();
      if (blob && navigator.clipboard?.write && typeof ClipboardItem !== "undefined") {
        try {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          flash(t("receiptCopied"));
          setBusy(false);
          return;
        } catch {
          // fall through to text
        }
      }
      const text = buildReceiptText(record, lang, t);
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(text);
          flash(t("receiptCopiedText"));
          setBusy(false);
          return;
        } catch {
          // fall through to legacy
        }
      }
      await writeTextLegacy(text);
      flash(t("receiptCopiedText"));
    } catch {
      flash(t("receiptCopyUnsupported"));
    } finally {
      setBusy(false);
    }
  }, [getBlob, record, lang, flash, t]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 220,
        background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 540,
          background: "#f3f4f6",
          borderRadius: "24px 24px 0 0",
          padding: "20px 16px 28px",
          maxHeight: "92vh",
          overflowY: "auto",
          animation: "slideUp .25s ease",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, padding: "0 4px" }}>
          <div style={{ fontWeight: 900, fontSize: 16, color: "#111827" }}>{t("receiptShareTitle")}</div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 12, border: "none", background: "#e5e7eb", fontSize: 16, cursor: "pointer", fontFamily: "inherit" }}>✕</button>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <div style={{
            background: "#fff", borderRadius: 20, padding: 8,
            boxShadow: "0 10px 30px rgba(15,23,42,0.12)",
            border: "1px solid #e5e7eb",
          }}>
            <canvas ref={canvasRef} style={{ display: "block", borderRadius: 14 }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
          <button onClick={handleShare} disabled={busy} style={{
            padding: "13px 8px", border: "none", borderRadius: 14,
            background: brand, color: "#fff",
            fontWeight: 900, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
            opacity: busy ? 0.6 : 1,
          }}>📤 {t("receiptShareBtn")}</button>
          <button onClick={handleDownload} disabled={busy} style={{
            padding: "13px 8px", border: "none", borderRadius: 14,
            background: "#111827", color: "#fff",
            fontWeight: 900, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
            opacity: busy ? 0.6 : 1,
          }}>⬇️ {t("receiptDownloadBtn")}</button>
          <button onClick={handleCopy} disabled={busy} style={{
            padding: "13px 8px", border: "none", borderRadius: 14,
            background: "#fff", color: "#111827", border: "1px solid #d1d5db",
            fontWeight: 900, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
            opacity: busy ? 0.6 : 1,
          }}>📋 {t("receiptCopyBtn")}</button>
        </div>

        <div style={{ textAlign: "center", fontSize: 11, color: "#9ca3af", padding: "4px 8px 0" }}>
          {t("receiptShareHint")}
        </div>

        {toast && (
          <div style={{
            position: "fixed", left: "50%", bottom: 40, transform: "translateX(-50%)",
            background: th?.text || "#111827", color: "#fff",
            padding: "10px 18px", borderRadius: 999, fontSize: 13, fontWeight: 800,
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)", zIndex: 230,
          }}>{toast}</div>
        )}
      </div>
    </div>
  );
}
