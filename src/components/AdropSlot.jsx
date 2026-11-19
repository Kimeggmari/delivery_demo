import { useEffect, useId, useRef, useState } from "react";
import { Adrop, isAdropAvailable } from "../lib/adrop";

// Native height of the native-ad card's headline/CTA strip (NativeAdCard.stripHeight).
const NATIVE_STRIP_HEIGHT = 52;

// Viewport band ads may draw in: below sticky headers and above fixed bottom
// bars, which are marked with data-ad-clip="top" / data-ad-clip="bottom".
function readClipBand() {
  let top = 0;
  let bottom = 0;
  const vh = window.innerHeight;
  document.querySelectorAll("[data-ad-clip]").forEach(el => {
    const r = el.getBoundingClientRect();
    if (el.dataset.adClip === "top") top = Math.max(top, r.bottom);
    else bottom = Math.max(bottom, vh - r.top);
  });
  return { clipTop: Math.max(0, top), clipBottom: Math.max(0, bottom) };
}

/**
 * Reserves space in the page for a native Adrop ad (iOS app only) and keeps
 * the native view lined up with it. Collapses to nothing until an ad is
 * received, and stays collapsed on no-fill / errors.
 *
 * type: "banner" (fixed width × height) or "native" (full width, 16:9 media + strip).
 * hidden: hide the native view while a web modal/sheet is covering the page —
 * native views always draw above web content.
 * label: small caption shown above the ad (e.g. "광고"), inside the frame.
 */
export default function AdropSlot({ unitId, type = "banner", width = 320, height = 50, hidden = false, label, style }) {
  const enabled = isAdropAvailable() && !!unitId;
  const reactId = useId();
  const slotId = "adrop" + reactId.replace(/[^a-zA-Z0-9]/g, "");
  const ref = useRef(null);
  const [status, setStatus] = useState("loading"); // loading | received | failed
  const hiddenRef = useRef(hidden);
  const statusRef = useRef(status);
  useEffect(() => {
    hiddenRef.current = hidden;
    statusRef.current = status;
  }, [hidden, status]);

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    let frame = 0;
    let last = "";
    let listener;

    const measure = () => {
      const el = ref.current;
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const w = type === "native" ? r.width : Math.min(width, r.width);
      const h = type === "native" ? Math.round(w * 9 / 16) + NATIVE_STRIP_HEIGHT : height;
      return {
        id: slotId,
        x: r.left + (r.width - w) / 2 + window.scrollX,
        y: r.top + window.scrollY,
        width: w,
        height: h,
        ...readClipBand(),
        visible: statusRef.current === "received" && !hiddenRef.current && r.width > 0,
      };
    };

    const tick = () => {
      if (cancelled) return;
      const layout = measure();
      if (layout) {
        const key = JSON.stringify(layout);
        if (key !== last) {
          last = key;
          Adrop.updateInline(layout).catch(() => {});
        }
      }
      frame = requestAnimationFrame(tick);
    };

    (async () => {
      listener = await Adrop.addListener("adEvent", e => {
        if (e.id !== slotId) return;
        if (e.type === "received") setStatus("received");
        else if (e.type === "failed") setStatus("failed");
      });
      if (cancelled) { listener.remove(); return; }
      const layout = measure() || { id: slotId };
      try {
        await Adrop.showInline({ ...layout, unitId, type });
      } catch (err) {
        console.warn("Adrop inline ad failed", err);
        setStatus("failed");
        return;
      }
      if (!cancelled) frame = requestAnimationFrame(tick);
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      listener?.remove();
      Adrop.removeInline({ id: slotId }).catch(() => {});
    };
  }, [enabled, slotId, unitId, type, width, height]);

  // Until an ad arrives the slot renders nothing (the native view loads
  // hidden), so a no-fill never leaves a blank gap or grid gap in the page.
  if (!enabled || status !== "received") return null;

  // `style` dresses the outer frame (card background, padding, margins); the
  // native view is lined up with the inner placeholder only.
  return (
    <div style={{ width: "100%", boxSizing: "border-box", ...style }}>
      {label && <div style={LABEL_STYLE}>{label}</div>}
      <div ref={ref} aria-hidden="true" style={{ width: "100%" }}>
        {type === "native" ? (
          // Same height the native card uses: 16:9 media + headline/CTA strip.
          <>
            <div style={{ width: "100%", aspectRatio: "16 / 9" }} />
            <div style={{ height: NATIVE_STRIP_HEIGHT }} />
          </>
        ) : (
          <div style={{ height }} />
        )}
      </div>
    </div>
  );
}

const LABEL_STYLE = {
  fontSize: 10, fontWeight: 800, color: "#9ca3af", letterSpacing: 0.4,
  marginBottom: 6, lineHeight: 1, padding: "0 14px",
};
