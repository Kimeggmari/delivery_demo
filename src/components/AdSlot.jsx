import { useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { AD_APP_ID, AD_SLOTS_ENABLED, AD_UNITS, unitIdFor } from "../config/adUnits";
import { Adrop, initAdrop } from "../lib/adrop";
import { showNativePopupOnce } from "../lib/adropNative";

// Reserves a fixed-ratio space for an ad unit (see config/adUnits.js).
// Banner/native slots render real ads via the Adrop web SDK once the App ID and
// the slot's unit id are set; until then (and on the public web build) they show
// a placeholder box. Web has no ad SDK of its own, so it previews as Android.
export default function AdSlot({ slot, style }) {
  const unit = AD_UNITS[slot];
  if (!AD_SLOTS_ENABLED || !unit) return null;

  const os = Capacitor.getPlatform() === "ios" ? "ios" : "android";
  const appId = AD_APP_ID[os];
  const unitId = unitIdFor(slot, os);
  // The web SDK only serves banner/native; splash and popupBottom are native-only.
  const webFormat = unit.format === "banner" || unit.format === "native";
  const live = webFormat && !!(appId && unitId) && (Capacitor.isNativePlatform() || import.meta.env.DEV);

  const box = {
    width: "100%",
    maxWidth: unit.width,
    aspectRatio: `${unit.width} / ${unit.height}`,
    margin: "0 auto",
    boxSizing: "border-box",
    overflow: "hidden",
    ...style,
  };

  return live
    ? <LiveAd unit={unit} appId={appId} unitId={unitId} box={box} />
    : <PlaceholderAd unit={unit} name={unit.names[os]} box={box} />;
}

function PlaceholderAd({ unit, name, box }) {
  const isNative = unit.format === "native";
  return (
    <div
      data-ad-unit={name}
      style={{
        ...box,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
        background: isNative ? "#fff" : "#f3f4f6",
        border: isNative ? "1px solid #e5e7eb" : "1px dashed #d1d5db",
        borderRadius: isNative ? 14 : 10,
        color: "#9ca3af", fontSize: 11, fontWeight: 700,
      }}
    >
      <span>AD</span>
      {import.meta.env.DEV && (
        <span style={{ fontSize: 9, fontWeight: 500, opacity: 0.8 }}>{name} · {unit.width}×{unit.height}</span>
      )}
    </div>
  );
}

function LiveAd({ unit, appId, unitId, box }) {
  const ref = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !initAdrop(appId)) return undefined;

    const adrop = Adrop.instance();
    // With backfill the direct "no fill" isn't final; only the backfill result is.
    const failEvents = unit.backfill
      ? [Adrop.Events.AD_FAILED, Adrop.Events.AD_BACKFILL_NO_FILL]
      : [Adrop.Events.AD_FAILED, Adrop.Events.AD_NO_FILL];
    const onFail = () => setFailed(true);
    const onOk = () => setFailed(false);
    failEvents.forEach(ev => adrop.on(ev, onFail, { unit: unitId }));
    adrop.on(Adrop.Events.AD_RECEIVED, onOk, { unit: unitId });

    adrop.renderAd(el, { unit: unitId, backfillMode: "fixed" })
      .catch(err => { console.warn("Adrop renderAd failed", err); setFailed(true); });

    return () => {
      failEvents.forEach(ev => adrop.off(ev, onFail));
      adrop.off(Adrop.Events.AD_RECEIVED, onOk);
      adrop.clear(el);
    };
  }, [appId, unitId, unit.backfill]);

  // Collapse when nothing can be shown so no empty box is left behind.
  if (failed) return null;
  return <div ref={ref} data-ad-unit={unitId} style={box} />;
}

// popupBottom is a native dialog (AdropNative plugin). On native with a unit id
// set we hand off to it and render nothing; otherwise (web, or not wired yet)
// show a dismissible placeholder pinned above the bottom bar.
export function PopupBottomAd({ onClose, bottom = 84 }) {
  const os = Capacitor.getPlatform() === "ios" ? "ios" : "android";
  const unitId = unitIdFor("homePopup", os);
  const native = AD_SLOTS_ENABLED && Capacitor.isNativePlatform() && !!unitId;

  useEffect(() => {
    if (native) showNativePopupOnce(unitId);
  }, [native, unitId]);

  if (!AD_SLOTS_ENABLED || native) return null;
  return (
    <div style={{ position: "fixed", left: 0, right: 0, bottom, zIndex: 15, display: "flex", justifyContent: "center", padding: "0 16px", pointerEvents: "none" }}>
      <div style={{ position: "relative", width: "100%", maxWidth: 320, background: "#fff", borderRadius: 14, boxShadow: "0 8px 24px rgba(0,0,0,0.18)", padding: 4, pointerEvents: "auto" }}>
        <AdSlot slot="homePopup" />
        <button
          onClick={onClose}
          aria-label="close"
          style={{ position: "absolute", top: -10, right: -6, width: 24, height: 24, borderRadius: 999, border: "none", background: "#111827", color: "#fff", fontSize: 11, cursor: "pointer", lineHeight: 1 }}
        >✕</button>
      </div>
    </div>
  );
}
