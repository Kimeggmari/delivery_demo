import { useState } from "react";
import { pick } from "../config/i18n";
import MenuImage from "./MenuImage";

// Moderation bottom-sheet: lists every pending custom restaurant/menu
// (visible to the admin device only, via firestore.rules) with per-item
// approve/reject actions. Rejecting just deletes the submission.

export default function AdminPanel({
  pendingRestaurants, pendingMenus, restaurantNameById,
  onApproveRestaurant, onRejectRestaurant, onApproveMenu, onRejectMenu,
  onClose, t, lang, th,
}) {
  const [zoomSrc, setZoomSrc] = useState(null);
  const rowStyle = { display: "flex", gap: 10, alignItems: "flex-start", padding: 12, border: "1px solid #e5e7eb", borderRadius: 14, background: "#fcfcfd" };
  const btnBase = { border: "none", borderRadius: 10, padding: "7px 10px", fontWeight: 800, fontSize: 12, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      {zoomSrc && (
        <div
          onClick={(e) => { e.stopPropagation(); setZoomSrc(null); }}
          style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.86)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
        >
          <img src={zoomSrc} alt="" style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 12, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }} />
          <button
            onClick={(e) => { e.stopPropagation(); setZoomSrc(null); }}
            style={{ position: "fixed", top: 20, right: 20, width: 40, height: 40, borderRadius: 20, border: "none", background: "rgba(255,255,255,0.92)", fontSize: 18, cursor: "pointer" }}
          >✕</button>
        </div>
      )}
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: "20px 20px 32px", width: "100%", maxWidth: 540, maxHeight: "86vh", overflowY: "auto", animation: "slideUp .25s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>{t("adminPanelTitle")}</h3>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 12, border: "none", background: "#f3f4f6", fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ fontSize: 13, fontWeight: 900, marginBottom: 10, color: th.text }}>{t("adminPendingRestaurantsTitle", pendingRestaurants.length)}</div>
        <div style={{ display: "grid", gap: 10, marginBottom: 22 }}>
          {pendingRestaurants.length === 0 ? (
            <div style={{ fontSize: 13, color: th.muted, padding: "8px 2px" }}>{t("adminEmptyRestaurants")}</div>
          ) : pendingRestaurants.map(r => (
            <div key={r.id} style={rowStyle}>
              {r.menus && r.menus[0] && r.menus[0].photo ? (
                <div onClick={() => setZoomSrc(r.menus[0].photo)} style={{ cursor: "zoom-in" }}>
                  <MenuImage src={r.menus[0].photo} alt="" width={56} height={56} borderRadius={12} />
                </div>
              ) : (
                <div style={{ fontSize: 28, flexShrink: 0 }}>{r.emoji}</div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{pick(r.name, lang)}</div>
                <div style={{ fontSize: 12, color: th.muted, marginTop: 2 }}>{pick(r.category, lang)}</div>
                {r.menus && r.menus[0] && (
                  <div style={{ fontSize: 12, color: th.muted, marginTop: 4 }}>{pick(r.menus[0].name, lang)} · {r.menus[0].price?.toLocaleString()}원</div>
                )}
              </div>
              <div style={{ display: "grid", gap: 6, flexShrink: 0 }}>
                <button onClick={() => onApproveRestaurant(r.id)} style={{ ...btnBase, background: "#dcfce7", color: "#16a34a" }}>{t("approveBtn")}</button>
                <button onClick={() => onRejectRestaurant(r.id)} style={{ ...btnBase, background: "#fef2f2", color: "#dc2626" }}>{t("rejectBtn")}</button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 13, fontWeight: 900, marginBottom: 10, color: th.text }}>{t("adminPendingMenusTitle", pendingMenus.length)}</div>
        <div style={{ display: "grid", gap: 10 }}>
          {pendingMenus.length === 0 ? (
            <div style={{ fontSize: 13, color: th.muted, padding: "8px 2px" }}>{t("adminEmptyMenus")}</div>
          ) : pendingMenus.map(m => (
            <div key={m.id} style={rowStyle}>
              {m.photo ? (
                <div onClick={() => setZoomSrc(m.photo)} style={{ cursor: "zoom-in" }}>
                  <MenuImage src={m.photo} alt="" width={56} height={56} borderRadius={12} />
                </div>
              ) : (
                <MenuImage src={null} alt="" width={56} height={56} borderRadius={12} label={t("adminNoPhotoLabel")} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{pick(m.name, lang)}</div>
                <div style={{ fontSize: 12, color: th.muted, marginTop: 2 }}>{restaurantNameById[m.restaurantId] || m.restaurantId}</div>
                {pick(m.desc, lang) && <div style={{ fontSize: 12, color: th.muted, marginTop: 2 }}>{pick(m.desc, lang)}</div>}
                <div style={{ fontSize: 12, color: th.muted, marginTop: 2 }}>{m.price?.toLocaleString()}원</div>
              </div>
              <div style={{ display: "grid", gap: 6, flexShrink: 0 }}>
                <button onClick={() => onApproveMenu(m.id)} style={{ ...btnBase, background: "#dcfce7", color: "#16a34a" }}>{t("approveBtn")}</button>
                <button onClick={() => onRejectMenu(m.id)} style={{ ...btnBase, background: "#fef2f2", color: "#dc2626" }}>{t("rejectBtn")}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
