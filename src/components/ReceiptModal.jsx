import { useEffect, useRef, useState, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { Media } from "@capacitor-community/media";
import { fmt } from "../lib/format";
import { pick } from "../config/i18n";

// Android's savePhoto() requires an existing directory path as the album
// identifier (unlike iOS, where it's optional) — see @capacitor-community/media's
// android source, isStoragePermissionGranted() there returns true with no
// runtime permission prompt as long as androidGalleryMode isn't enabled
// (it isn't here), since we're only writing to the app's own scoped
// external-media directory, not browsing the whole device gallery.
const GALLERY_ALBUM_NAME = "FoodNeverArrives";

async function ensureAndroidAlbumDir() {
  const { path } = await Media.getAlbumsPath();
  const albumDir = `${path}/${GALLERY_ALBUM_NAME}`;
  try {
    await Media.createAlbum({ name: GALLERY_ALBUM_NAME });
  } catch {
    // Already exists — fine, savePhoto just needs the directory to be there.
  }
  return albumDir;
}

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

// Deterministic PRNG (mulberry32) seeded from a string — same order id
// always draws the same barcode, no Math.random() needed.
function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed;
  return function rand() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Decorative barcode — visually plausible bar pattern, not a real
// scannable code (there's nothing to scan it into).
function drawBarcode(ctx, x, y, width, height, seedStr) {
  const rand = mulberry32(hashSeed(seedStr));
  ctx.fillStyle = "#111827";
  let bx = x;
  while (bx < x + width - 2) {
    const barW = 1 + Math.floor(rand() * 3);
    if (rand() > 0.45) ctx.fillRect(bx, y, barW, height);
    bx += barW;
  }
}

function barcodeNumberFromId(id) {
  const digits = String(hashSeed(id)).padStart(10, "0").slice(-10);
  return digits.match(/.{1,4}/g).join(" ");
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
  const baseHeight = 470;
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

  // Plain breakdown, ending with the formal total as just another line —
  // the flashy focal point is the SAVED callout below, not this: since the
  // order never really happened, that "total" is money that stayed in
  // your pocket, which is the whole point of the app.
  const totalRows = [
    [t("productPrice"), fmt(record.subtotal, lang)],
    [t("deliveryFee"), fmt(record.deliveryFee, lang)],
    [t("serviceFee"), fmt(record.serviceFee, lang)],
    [t("totalLabel"), fmt(record.total, lang)],
  ];
  totalRows.forEach(([k, v], i) => {
    const isTotal = i === totalRows.length - 1;
    ctx.font = (isTotal ? "800" : "600") + " 12px Inter, 'Noto Sans KR', system-ui, sans-serif";
    ctx.fillStyle = "#6b7280";
    ctx.fillText(k, x, y);
    ctx.fillStyle = "#111827";
    ctx.textAlign = "right";
    ctx.fillText(v, WIDTH - PADDING, y);
    ctx.textAlign = "left";
    y += 18;
  });
  y += 10;

  // Saved callout — the real focal point of the receipt.
  const calloutH = 72;
  const calloutGrad = ctx.createLinearGradient(x, y, x, y + calloutH);
  calloutGrad.addColorStop(0, "#dcfce7");
  calloutGrad.addColorStop(1, "#bbf7d0");
  ctx.fillStyle = calloutGrad;
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(x, y, contentW, calloutH, 12);
    ctx.fill();
  } else {
    ctx.fillRect(x, y, contentW, calloutH);
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#166534";
  ctx.font = "800 11px Inter, 'Noto Sans KR', system-ui, sans-serif";
  ctx.fillText(t("receiptSavedLabel"), WIDTH / 2, y + 12);

  ctx.fillStyle = "#15803d";
  ctx.font = "900 26px Inter, 'Noto Sans KR', system-ui, sans-serif";
  ctx.fillText(fmt(record.total, lang), WIDTH / 2, y + 28);

  ctx.fillStyle = "#166534";
  ctx.font = "700 11px Inter, 'Noto Sans KR', system-ui, sans-serif";
  ctx.fillText(`🔥 ${record.savedKcal.toLocaleString()} ${t("kcal")} ${t("completeSavedSuffix")}`, WIDTH / 2, y + 56);
  ctx.textAlign = "left";
  y += calloutH + 20;

  // Barcode — decorative, gives it that real-receipt feel.
  const barcodeH = 38;
  drawBarcode(ctx, x, y, contentW, barcodeH, record.id);
  y += barcodeH + 6;

  ctx.fillStyle = "#9ca3af";
  ctx.font = "600 10px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.fillText(barcodeNumberFromId(record.id), WIDTH / 2, y);
  ctx.textAlign = "left";
  y += 22;

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
      if (Capacitor.isNativePlatform()) {
        // The web <a download> approach below is a no-op in a native
        // WebView — it doesn't reach the system Download Manager or the
        // gallery, so nothing appeared to happen when tapping the button.
        const dataUri = canvasRef.current?.toDataURL("image/png");
        if (!dataUri) throw new Error("canvas");
        const albumIdentifier = Capacitor.getPlatform() === "android"
          ? await ensureAndroidAlbumDir()
          : undefined;
        await Media.savePhoto({
          path: dataUri,
          ...(albumIdentifier ? { albumIdentifier } : {}),
          fileName: `foodneverarrives_${record.id}`,
        });
      } else {
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
      }
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
