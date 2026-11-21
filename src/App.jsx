import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Capacitor } from "@capacitor/core";
import Footer from "./components/Footer";
import MenuImage from "./components/MenuImage";
import Stars from "./components/Stars";
import ReceiptModal from "./components/ReceiptModal";
import AchievementToast from "./components/AchievementToast";
import NotificationBanner from "./components/NotificationBanner";
import AddRestaurantModal from "./components/AddRestaurantModal";
import AddMenuModal from "./components/AddMenuModal";
import AddContentPage from "./components/AddContentPage";
import AddContentNoticeModal from "./components/AddContentNoticeModal";
import AdminPanel from "./components/AdminPanel";
import SettingsModal from "./components/SettingsModal";
import { getMenuImageSrc } from "./config/menuImages";
import { nicknameFor } from "./lib/nickname";
import { deliveryModes, RABBIT_SURCHARGE, SIZE_OPTIONS, SPICY_OPTIONS, SPICY_LABELS, theme } from "./config/ordering";
import { calcTotals, fmt } from "./lib/format";
import { dict, makeT, pick } from "./config/i18n";
import { restaurants } from "./config/restaurants";
import { isAdminUid } from "./config/admin";
import {
  HISTORY_LIMIT, loadHistory, saveOrderRecord, clearHistory,
  loadUnlocked, saveUnlocked,
  computeStats, buildOrderRecord,
  subscribeCustomRestaurants, addCustomRestaurant, deleteCustomRestaurant, reportCustomRestaurant, approveCustomRestaurant,
  subscribeCustomMenus, addCustomMenu, deleteCustomMenu, reportCustomMenu, approveCustomMenu,
  subscribeReviews, subscribeAllReviews, submitReview, deleteReview, reportReview,
  REPORT_HIDE_THRESHOLD, REVIEW_TEXT_MAX,
} from "./lib/storage";
import { authReady } from "./lib/firebase";
import { computeNewUnlocks, earnedBadges } from "./config/achievements";
import { requestAdTracking, showLaunchPopupAd } from "./lib/ads";
import PlatformAd from "./components/PlatformAd";
import BottomTabBar, { TAB_BAR_HEIGHT } from "./components/BottomTabBar";
import DuoNavRail from "./components/DuoNavRail";
import useDuoLayout from "./lib/useDuoLayout";
import useEdgeRailSide from "./lib/useEdgeRailSide";
import useMediaQuery from "./lib/useMediaQuery";
import { LiquidGlass, useNativeLiquidGlass } from "./lib/liquidGlass";
import CartFab, { Toast } from "./components/CartFab";
import RestaurantCard from "./components/RestaurantCard";
import HomeEventCarousel from "./components/HomeEventCarousel";
import RestaurantDetailPage from "./components/RestaurantDetailPage";
import CartPage from "./components/CartPage";
import SearchPage from "./components/SearchPage";
import FavoritesPage from "./components/FavoritesPage";
import MySavingsPage from "./components/MySavingsPage";
import { categoryEmoji, firstGrapheme } from "./config/visuals";
import {
  MENU_CALORIES, baseKcal, unitKcal, sizeKcalDelta, toppingKcal, cartKcal,
  distanceKm, runningMinutes, eulReul,
} from "./lib/savings";
import { ensureNotificationPermission, notifyDeliveryComplete } from "./lib/notifications";
import {
  getLocalRestaurants, saveLocalRestaurant, removeLocalRestaurant,
  getLocalMenus, saveLocalMenu, removeLocalMenu,
} from "./lib/localDrafts";

// Every order spends this long "cooking" (real time) before the courier
// timers start, regardless of delivery mode or the configured delivery time.
const COOK_TIME_MS = 15000;

const PAYMENT_OPTIONS = [
  { val: "카드", labelKey: "payCard" },
  { val: "간편결제", labelKey: "payEasy" },
  { val: "현장결제", labelKey: "payCash" },
];

// Returns a copy of `items` with `node` inserted at `index` (or appended when
// the list is shorter) — used to drop an ad card between list items.
const insertAt = (items, index, node) => [...items.slice(0, index), node, ...items.slice(index)];

const paymentLabel = (val, t) => {
  const found = PAYMENT_OPTIONS.find(o => o.val === val);
  return found ? t(found.labelKey) : val;
};

// Strip trailing "+1500원" markers from topping labels
function toppingDisplay(topping, lang) {
  if (!topping) return "";
  if (typeof topping === "object") {
    const raw = pick(topping, lang) || topping.ko || "";
    return raw.replace(/\+\d+원$/, "").trim();
  }
  return String(topping).replace(/\+\d+원$/, "").trim();
}

function toppingPrice(topping) {
  const raw = typeof topping === "object" ? (topping.ko || topping.en || "") : String(topping);
  const m = raw.match(/\+(\d+)원/);
  return m ? parseInt(m[1], 10) : 0;
}

// Display localized cart option label
function buildOptLabel(item, t, lang) {
  const spicy = item.spicy ? (SPICY_LABELS[lang]?.[item.spicy] || item.spicy) : null;
  const size = item.size || null;
  const tops = (item.toppings || []).map(top => toppingDisplay(top, lang));
  return [spicy, size, ...tops].filter(Boolean).join(", ");
}

function ReviewModal({ restaurant, onClose, t, lang, uid, th }) {
  const reviews = dict[lang]?.sampleReviews || dict.ko.sampleReviews;
  const revs = reviews.slice(0, 3 + (restaurant.id % 3));

  const [realReviews, setRealReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => subscribeReviews(restaurant.id, setRealReviews), [restaurant.id]);

  const myReview = realReviews.find(r => r.uid === uid);
  useEffect(() => {
    setRating(myReview?.rating || 0);
    setText(myReview?.text || "");
  }, [myReview?.rating, myReview?.text]);

  const visibleReviews = realReviews.filter(r => (r.reportedBy || []).length < REPORT_HIDE_THRESHOLD);
  const canSubmit = rating >= 1 && text.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    submitReview(restaurant.id, rating, text)
      .catch(err => console.warn("Failed to submit review", err))
      .finally(() => setSubmitting(false));
  };

  const handleDelete = () => {
    if (typeof window !== "undefined" && !window.confirm(t("deleteCustomConfirm"))) return;
    deleteReview(restaurant.id, uid).catch(err => console.warn("Failed to delete review", err));
  };

  const handleReport = (id) => {
    if (typeof window !== "undefined" && !window.confirm(t("reportConfirm"))) return;
    reportReview(id).catch(err => console.warn("Failed to report review", err));
  };

  return (
    <div onClick={onClose} className="lgBackdrop" style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} className="lgSheet" style={{ borderRadius: "28px 28px 0 0", padding: "14px 20px calc(32px + env(safe-area-inset-bottom))", width: "100%", maxWidth: 540, maxHeight: "82dvh", overflowY: "auto", overscrollBehavior: "contain", animation: "slideUp .3s ease" }}>
        <div style={{ width: 38, height: 4, borderRadius: 999, background: "#e5e7eb", margin: "0 auto 14px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>{restaurant.emoji} {pick(restaurant.name, lang)}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
              <span style={{ color: "#f59e0b" }}><Stars rating={restaurant.rating} size={14} /></span>
              <span className="tnum" style={{ fontWeight: 900, fontSize: 15 }}>{restaurant.rating}</span>
              <span style={{ color: "#9ca3af", fontSize: 12 }}>{t("reviewCountSuffix", visibleReviews.length)}</span>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ width: 36, height: 36, borderRadius: 12, border: "none", background: "#f3f4f6", color: "#374151", fontSize: 17, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>✕</button>
        </div>

        <div style={{ border: "1px solid #fde68a", background: "#fffbeb", borderRadius: 16, padding: 14, marginBottom: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 8 }}>{myReview ? t("editReviewTitle") : t("writeReviewTitle")}</div>
          <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setRating(n)}
                aria-label={String(n)}
                style={{ border: "none", background: "none", fontSize: 24, lineHeight: 1, cursor: "pointer", padding: 0, color: n <= rating ? "#f59e0b" : "#d1d5db" }}
              >★</button>
            ))}
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value.slice(0, REVIEW_TEXT_MAX))}
            placeholder={t("reviewPlaceholder")}
            rows={2}
            style={{ width: "100%", boxSizing: "border-box", border: "1px solid #e5e7eb", borderRadius: 10, padding: "8px 10px", fontSize: 13, fontFamily: "inherit", resize: "vertical" }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12, marginTop: 8 }}>
            {myReview && (
              <button onClick={handleDelete} style={{ border: "none", background: "none", color: "#dc2626", fontSize: 12, fontWeight: 800, cursor: "pointer", padding: 0, fontFamily: "inherit" }}>{t("deleteCustomAria")}</button>
            )}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              style={{ border: "none", borderRadius: 10, padding: "8px 16px", background: !canSubmit ? "#d1d5db" : th.brand, color: "#fff", fontWeight: 800, fontSize: 12, cursor: !canSubmit || submitting ? "default" : "pointer", fontFamily: "inherit" }}
            >{myReview ? t("updateReviewBtn") : t("reviewSubmit")}</button>
          </div>
        </div>

        {visibleReviews.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#6b7280", marginBottom: 10 }}>{t("realReviewsTitle", visibleReviews.length)}</div>
            <div style={{ display: "grid", gap: 10 }}>
              {visibleReviews.map(r => (
                <div key={r.uid} style={{ background: "#f9fafb", borderRadius: 16, padding: "14px 16px", border: "1px solid #f3f4f6" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontWeight: 800, fontSize: 13 }}>{nicknameFor(r.uid, lang)}</span>
                    <span style={{ color: "#f59e0b", fontSize: 11 }}>{"★".repeat(r.rating)}<span style={{ color: "#d1d5db" }}>{"★".repeat(5 - r.rating)}</span></span>
                  </div>
                  {r.text && <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.5, marginBottom: 6 }}>{r.text}</div>}
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    {r.uid === uid ? (
                      <span style={{ fontSize: 10, fontWeight: 800, color: th.brand }}>{t("myReviewLabel")}</span>
                    ) : (
                      <button
                        onClick={() => handleReport(`${restaurant.id}_${r.uid}`)}
                        disabled={(r.reportedBy || []).includes(uid)}
                        aria-label={t("reportAria")}
                        title={t("reportAria")}
                        style={{ border: "none", background: "none", color: "#9ca3af", fontSize: 10, fontWeight: 800, cursor: (r.reportedBy || []).includes(uid) ? "default" : "pointer", opacity: (r.reportedBy || []).includes(uid) ? 0.4 : 1, padding: 0, fontFamily: "inherit" }}
                      >🚩 {t("reportAria")}</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ fontSize: 12, fontWeight: 800, color: "#6b7280", marginBottom: 10 }}>{t("sampleReviewsTitle")}</div>
        <div style={{ display: "grid", gap: 10 }}>
          {revs.map((r, i) => (
            <div key={i} style={{ background: "#f9fafb", borderRadius: 16, padding: "14px 16px", border: "1px solid #f3f4f6" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontWeight: 800, fontSize: 13 }}>{r.user}</span>
                <span style={{ color: "#f59e0b", fontSize: 11 }}>{"★".repeat(r.star)}<span style={{ color: "#d1d5db" }}>{"★".repeat(5 - r.star)}</span></span>
              </div>
              <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>{r.text}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 14, fontSize: 12, color: "#9ca3af" }}>{t("reviewSample")}</div>
      </div>
    </div>
  );
}

function InfoModal({ onClose, email = "eggmari5713@gmail.com", onPrivacy, t, lang }) {
  return (
    <div
      onClick={onClose}
      className="lgBackdrop"
      style={{
        position: "fixed", inset: 0, zIndex: 120,
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        padding: "0",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="lgSheet"
        style={{
          width: "100%", maxWidth: 540,
          borderRadius: "28px 28px 0 0",
          padding: "14px 20px calc(40px + env(safe-area-inset-bottom))",
          maxHeight: "92dvh",
          overflowY: "auto",
          overscrollBehavior: "contain",
          animation: "slideUp .3s ease",
        }}
      >
        <div style={{ width: 38, height: 4, borderRadius: 999, background: "#e5e7eb", margin: "0 auto 16px" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.2 }}>{t("appName")} 🍱</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>{t("infoSubtitle")}</div>
          </div>
          <button onClick={onClose} aria-label="Close" className="lgPillBtn" style={{ width: 36, height: 36, borderRadius: 999, color: "#374151", fontSize: 16, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>✕</button>
        </div>

        <div style={{ background: "linear-gradient(135deg,#fff7ed,#ffedd5)", border: "1px solid #fed7aa", borderRadius: 18, padding: "16px 18px", marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: "#9a3412", marginBottom: 6 }}>
            {t("appQuote")}
          </div>
          <div style={{ fontSize: 13, color: "#78350f", lineHeight: 1.7 }}>
            {t("appIntro")}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 12, color: "#111827" }}>{t("infoReasonTitle")}</div>
          <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.8 }}>
            {t("infoReason")} <br /><br />
            {t("infoReason2")}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 12, color: "#111827" }}>{t("infoFeaturesTitle")}</div>
          <div style={{ display: "grid", gap: 10 }}>
            {(dict[lang]?.infoFeatures || dict.ko.infoFeatures).map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 14px", background: "#f9fafb", borderRadius: 14, border: "1px solid #f3f4f6" }}>
                <div style={{ fontSize: 22, flexShrink: 0 }}>{item.emoji}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#111827", marginBottom: 3 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 12, color: "#111827" }}>{t("infoHowToTitle")}</div>
          <div style={{ display: "grid", gap: 8 }}>
            {(dict[lang]?.infoSteps || dict.ko.infoSteps).map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#111827", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, paddingTop: 2 }}>{step}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 16, padding: "14px 16px", marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: "#dc2626", marginBottom: 6 }}>{t("infoWarnTitle")}</div>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: "#7f1d1d", lineHeight: 1.9 }}>
            {(dict[lang]?.infoWarns || dict.ko.infoWarns).map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>

        <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 16, padding: "14px 16px", marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: "#9a3412", marginBottom: 6 }}>{t("infoAdsTitle")}</div>
          <div style={{ fontSize: 12, color: "#78350f", lineHeight: 1.7 }}>
            {t("infoAds")}
          </div>
        </div>

        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 16, padding: "14px 16px", marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: "#0f172a", marginBottom: 6 }}>{t("infoContactTitle")}</div>
          <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.7, marginBottom: 8 }}>
            {t("infoContact")}
          </div>
          <a href={`mailto:${email}`} style={{ fontSize: 14, fontWeight: 900, color: "#ea580c", textDecoration: "none", wordBreak: "break-all" }}>{email}</a>
        </div>

        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <button
            onClick={() => { onClose(); onPrivacy(); }}
            style={{ background: "none", border: "none", color: "#6b7280", fontSize: 12, textDecoration: "underline", cursor: "pointer", fontFamily: "inherit" }}
          >
            {t("infoSeePrivacy")}
          </button>
        </div>

        <button
          onClick={onClose}
          style={{ width: "100%", border: "none", borderRadius: 16, padding: "15px 16px", background: "#111827", color: "#fff", fontWeight: 900, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}
        >
          {t("infoConfirm")}
        </button>
      </div>
    </div>
  );
}

function SponsorModal({ onClose, t, th }) {
  const accountDisplay = "3333-22-7346954";
  const accountRaw = "3333227346954";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(accountRaw);
      } else {
        const ta = document.createElement("textarea");
        ta.value = accountRaw;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* ignore */ }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 130,
        background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 380,
          background: "#fff",
          borderRadius: 24,
          padding: "26px 22px 22px",
          boxShadow: "0 20px 50px rgba(15,23,42,0.25)",
          animation: "pop .25s ease",
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: -8 }}>
          <button
            onClick={onClose}
            aria-label={t("sponsorClose")}
            style={{ width: 32, height: 32, borderRadius: 10, border: "none", background: "#f3f4f6", fontSize: 16, cursor: "pointer" }}
          >✕</button>
        </div>

        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 54, lineHeight: 1, marginBottom: 10 }}>☕</div>
          <div style={{ fontSize: 19, fontWeight: 900, color: "#111827", marginBottom: 6 }}>{t("sponsorTitle")}</div>
          <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>{t("sponsorSubtitle")}</div>
        </div>

        <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, marginBottom: 16, padding: "0 4px" }}>
          {t("sponsorBody")}
        </div>

        <div style={{ background: "linear-gradient(135deg,#fff7ed,#ffedd5)", border: "1px solid #fed7aa", borderRadius: 16, padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, fontSize: 13 }}>
              <span style={{ color: "#9a3412", fontWeight: 700 }}>{t("sponsorBankLabel")}</span>
              <strong style={{ color: "#111827", fontWeight: 900 }}>{t("sponsorBankValue")}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, fontSize: 13 }}>
              <span style={{ color: "#9a3412", fontWeight: 700 }}>{t("sponsorAccountLabel")}</span>
              <strong style={{ color: "#111827", fontWeight: 900, fontVariantNumeric: "tabular-nums", letterSpacing: 0.3 }}>{accountDisplay}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, fontSize: 13 }}>
              <span style={{ color: "#9a3412", fontWeight: 700 }}>{t("sponsorHolderLabel")}</span>
              <strong style={{ color: "#111827", fontWeight: 900 }}>{t("sponsorHolderValue")}</strong>
            </div>
          </div>
        </div>

        <button
          onClick={handleCopy}
          style={{
            width: "100%", border: "none", borderRadius: 14, padding: "13px 16px",
            background: copied ? "#16a34a" : th.primaryBtn,
            color: "#fff", fontWeight: 900, fontSize: 14, cursor: "pointer",
            fontFamily: "inherit", marginBottom: 8, transition: ".2s",
          }}
        >
          {copied ? t("sponsorCopied") : t("sponsorCopy")}
        </button>

        <button
          onClick={onClose}
          style={{
            width: "100%", border: "none", borderRadius: 14, padding: "12px 16px",
            background: "#f3f4f6", color: "#374151", fontWeight: 800, fontSize: 13,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          {t("sponsorClose")}
        </button>

        <div style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: "#9ca3af" }}>{t("sponsorThanks")}</div>
      </div>
    </div>
  );
}

function PrivacyPage({ onBack, th, t, lang }) {
  const sections = lang === "en" ? [
    {
      title: "1. Information we collect",
      content: (
        <>
          <p>FoodNeverArrives has <strong>no sign-up or login</strong>. It stores a limited set of data on a server (Google Firebase / Firestore), listed below.</p>
          <p>Each device is identified only by a randomly-generated <strong>anonymous ID</strong> that contains no name, email, or other identifying information.</p>
          <p>· <strong>Order history and achievements</strong> — items, prices, delivery mode, and timestamps from demo orders. Tied only to your anonymous ID and never shown to other users.<br />
          · <strong>Restaurants/menus you submit yourself</strong> (the "Add your own restaurant" feature) — name, description, price, and any photo you attach. Once approved, this content is <strong>public to all users</strong>, and is automatically hidden once enough users report it as inappropriate.</p>
          <p><strong>The name, address, and phone number you type on the checkout form are never sent to or stored on a server — they stay on your device only</strong> and disappear as soon as you refresh or close the app.</p>
          <p>The Android app may use Google Play Integrity (Firebase App Check) to verify requests come from a genuine, unmodified copy of the app. This does not identify you or your device.</p>
        </>
      ),
    },
    {
      title: "2. Cookies & ads",
      content: (
        <>
          <p>The web version may show ads via <strong>Google AdSense</strong>, which can use cookies or similar technologies to personalize them.</p>
          <p><strong>The iOS app may show ads via Adrop</strong> (launch screen, banner, popup and native ads). When Adrop has no ad to show, an ad from Google's ad network or its partner networks (Pangle, Unity Ads, Liftoff, AppLovin, ironSource, InMobi) may be shown instead. These may use the advertising identifier (iOS IDFA) to personalize ads. The Android app does not show ads.</p>
          <p>On iOS, the app requests App Tracking Transparency (ATT) permission before using this identifier. The app works the same whether or not you grant this permission.</p>
          <p>For how ad data is used on the web version (Google AdSense), see <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb" }}>Google's advertising policies</a>.</p>
        </>
      ),
    },
    {
      title: "3. Third-party services",
      content: (
        <>
          <p>The web version is hosted on <strong>Vercel</strong>, which automatically captures basic server logs (IP, timestamps, browser info) per its own policy. The operator does not collect these directly.</p>
          <p>The order history, achievements, and user-submitted content described in Section 1 are stored using <strong>Google Firebase</strong> (Firestore, Authentication). The iOS app also communicates with Adrop and the ad networks above to display ads. See <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb" }}>Firebase's privacy policy</a> for details.</p>
        </>
      ),
    },
    {
      title: "4. Children's data",
      content: (
        <>
          <p>This Service does not target children under 14 and does not knowingly collect data from anyone in that age range.</p>
        </>
      ),
    },
    {
      title: "5. Policy changes",
      content: (
        <>
          <p>This policy may be updated to reflect legal or product changes. Any update will be announced in-app or on this page.</p>
        </>
      ),
    },
    {
      title: "6. Contact",
      content: (
        <>
          <p>For privacy questions, email:</p>
          <a href="mailto:eggmari5713@gmail.com" style={{ color: "#ea580c", fontWeight: 900, fontSize: 15, textDecoration: "none" }}>eggmari5713@gmail.com</a>
        </>
      ),
    },
  ] : [
    {
      title: "1. 수집하는 정보",
      content: (
        <>
          <p>음식만안와요는 <strong>회원가입·로그인 없이</strong> Google Firebase(Firestore)를 통해 아래 정보만 서버에 저장합니다.</p>
          <p>기기마다 이름 등 신원 정보 없이 임의로 발급되는 <strong>익명 식별자</strong>로 구분되며, 이 식별자에는 실명·이메일 등 신원을 알 수 있는 정보가 전혀 포함되지 않습니다.</p>
          <p>· <strong>주문 기록·업적</strong> — 데모 주문 시 담은 메뉴, 가격, 배달 방식, 시간 등. 익명 식별자에만 연결되며 다른 이용자에게 공개되지 않습니다.<br />
          · <strong>이용자가 직접 등록한 음식점·메뉴 정보</strong>("내 식당 추가" 기능) — 이름, 설명, 가격, 첨부한 사진 등. 관리자 승인 후 <strong>모든 이용자에게 공개</strong>되며, 부적절한 신고가 누적되면 자동으로 숨김 처리됩니다.</p>
          <p><strong>주문서 작성 화면에서 입력하는 이름, 주소, 연락처는 서버로 전송되거나 저장되지 않고 기기에만 남습니다.</strong> 앱을 새로고침하거나 종료하면 즉시 사라집니다.</p>
          <p>Android 앱은 정상적으로 배포된 앱에서의 요청인지 확인하기 위해 Google Play Integrity(Firebase App Check)를 사용할 수 있습니다. 이는 기기나 이용자를 식별하는 목적이 아닙니다.</p>
        </>
      ),
    },
    {
      title: "2. 쿠키 및 광고",
      content: (
        <>
          <p>웹 버전(음식만안와요.com)은 <strong>Google AdSense</strong>를 통해 광고를 제공할 수 있습니다. Google AdSense는 쿠키 또는 유사 기술을 사용하여 광고를 맞춤화할 수 있습니다.</p>
          <p><strong>iOS 앱 버전은 Adrop을 통해 광고(앱 시작 화면, 배너, 팝업, 네이티브 광고)를 표시할 수 있습니다.</strong> Adrop에 표시할 광고가 없을 때는 Google 광고 네트워크와 그 제휴 네트워크(Pangle, Unity Ads, Liftoff, AppLovin, ironSource, InMobi)의 광고가 대신 표시될 수 있습니다. 이들은 광고 개인화를 위해 광고 식별자(iOS IDFA)를 사용할 수 있습니다. Android 앱 버전에는 광고가 표시되지 않습니다.</p>
          <p>iOS에서는 앱이 광고 식별자를 사용하기 전에 iOS의 App Tracking Transparency(ATT) 권한 요청을 통해 동의를 구하며, 동의하지 않아도 앱의 다른 기능은 동일하게 이용할 수 있습니다.</p>
          <p>웹 버전 광고(Google AdSense)의 데이터 사용에 관한 자세한 내용은 <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb" }}>Google 광고 정책</a>을 참고하세요.</p>
        </>
      ),
    },
    {
      title: "3. 제3자 서비스",
      content: (
        <>
          <p>웹 버전은 <strong>Vercel</strong>을 통해 호스팅됩니다. Vercel은 서비스 운영을 위해 서버 접속 로그(IP 주소, 접속 시간, 브라우저 정보 등)를 자동으로 수집할 수 있습니다. 이는 서비스 운영자가 직접 수집하는 것이 아니며, Vercel의 개인정보처리방침에 따라 관리됩니다.</p>
          <p>1번 항목에 안내된 주문 기록·업적·이용자 등록 콘텐츠는 <strong>Google Firebase</strong>(Firestore, Authentication)에 저장됩니다. iOS 앱은 광고 표시를 위해 Adrop 및 위 광고 네트워크와 통신합니다. Firebase의 개인정보 처리에 대한 자세한 내용은 <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb" }}>Firebase 개인정보처리방침</a>을 참고하세요.</p>
        </>
      ),
    },
    {
      title: "4. 아동의 개인정보",
      content: (
        <>
          <p>본 서비스는 만 14세 미만 아동을 대상으로 개인정보를 수집하지 않으며, 해당 연령대의 이용자로부터 의도적으로 정보를 수집하지 않습니다.</p>
        </>
      ),
    },
    {
      title: "5. 개인정보처리방침 변경",
      content: (
        <>
          <p>본 방침은 법령 또는 서비스 정책의 변경에 따라 업데이트될 수 있습니다. 변경 사항이 있을 경우 앱 내 공지 또는 본 페이지를 통해 안내합니다.</p>
        </>
      ),
    },
    {
      title: "6. 문의",
      content: (
        <>
          <p>개인정보 관련 문의 사항이 있으시면 아래 이메일로 연락해 주세요.</p>
          <a href="mailto:eggmari5713@gmail.com" style={{ color: "#ea580c", fontWeight: 900, fontSize: 15, textDecoration: "none" }}>eggmari5713@gmail.com</a>
        </>
      ),
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: th.phone, fontFamily: 'Inter,"Noto Sans KR",system-ui,sans-serif', color: th.text }}>
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "linear-gradient(180deg," + th.headerStart + "," + th.headerEnd + ")", color: "#fff", padding: "calc(14px + env(safe-area-inset-top)) 20px 14px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, maxWidth: 540, margin: "0 auto" }}>
          <button onClick={onBack} style={{ width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, fontSize: 18, border: "none", cursor: "pointer", background: "rgba(255,255,255,0.18)", color: "#fff" }}>←</button>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>{t("privacyTitle")}</h2>
        </div>
      </div>

      <div style={{ maxWidth: 540, margin: "0 auto", padding: "24px 20px 60px", display: "grid", gap: 24 }}>

        <div style={{ background: "#fff", borderRadius: 20, padding: "20px 20px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
          <p style={{ margin: "0 0 12px", fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
            <strong style={{ color: "#111827" }}>{t("appName")}</strong>{t("privacyIntro")}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>{t("privacyUpdated")}</p>
        </div>

        {sections.map((section, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 20, padding: "20px 20px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: "#111827", marginBottom: 12 }}>{section.title}</div>
            <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.85 }}>
              {section.content}
            </div>
          </div>
        ))}

        <button
          onClick={onBack}
          style={{ width: "100%", border: "none", borderRadius: 16, padding: "15px 16px", background: "#111827", color: "#fff", fontWeight: 900, fontSize: 15, cursor: "pointer", fontFamily: 'Inter,"Noto Sans KR",system-ui,sans-serif' }}
        >
          {t("privacyBack")}
        </button>
      </div>
    </div>
  );
}

function OptionSheet({ menu, onClose, onConfirm, brand, t, lang }) {
  const opts = menu.options || {};
  const [spicy, setSpicy] = useState("보통");
  const [size, setSize] = useState("Regular");
  const [toppings, setToppings] = useState([]); // array of { ko, en } topping objects

  const [qty, setQty] = useState(1);

  const isSelected = (top) => toppings.some(x => (x.ko || x) === (top.ko || top));
  const toggleTopping = (top) =>
    setToppings(prev =>
      isSelected(top) ? prev.filter(x => (x.ko || x) !== (top.ko || top)) : [...prev, top]
    );

  const sizeExtra = SIZE_OPTIONS.find(s => s.label === size)?.price || 0;
  const toppingExtra = toppings.reduce((s, x) => s + toppingPrice(x), 0);
  const totalPrice = (menu.price + (opts.size ? sizeExtra : 0) + toppingExtra) * qty;
  const kcalPerUnit = unitKcal(menu, opts.size ? size : null, toppings);

  return (
    <div onClick={onClose} className="lgBackdrop" style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} className="lgSheet" style={{ borderRadius: "28px 28px 0 0", padding: "14px 20px calc(24px + env(safe-area-inset-bottom))", width: "100%", maxWidth: 540, maxHeight: "86dvh", overflowY: "auto", overscrollBehavior: "contain", animation: "slideUp .25s ease" }}>
        <div style={{ width: 38, height: 4, borderRadius: 999, background: "#e5e7eb", margin: "0 auto 14px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 14, minWidth: 0, flex: 1 }}>
            <MenuImage src={menu.photo || getMenuImageSrc(menu.id)} alt={pick(menu.name, lang)} width={88} height={88} borderRadius={18} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 900, fontSize: 18 }}>{pick(menu.name, lang)}</div>
              <div style={{ color: "#6b7280", fontSize: 13, marginTop: 4, lineHeight: 1.45 }}>{pick(menu.desc, lang)}</div>
              <div className="tnum" style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <span style={{ fontWeight: 900, fontSize: 16 }}>{fmt(menu.price, lang)}</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#ea580c", background: "#fff7ed", borderRadius: 8, padding: "3px 7px" }}>🔥 {t("optKcalBadge", baseKcal(menu).toLocaleString())}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ width: 36, height: 36, borderRadius: 12, border: "none", background: "#f3f4f6", color: "#374151", fontSize: 17, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>✕</button>
        </div>
        {opts.spicy && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>{t("flavorTitle")} <span style={{ color: "#ef4444", fontSize: 12 }}>{t("required")}</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {SPICY_OPTIONS.map(s => (
                <div key={s} onClick={() => setSpicy(s)} style={{ padding: "12px 8px", borderRadius: 14, border: "2px solid " + (spicy === s ? brand : "#e5e7eb"), background: spicy === s ? brand + "18" : "#fff", textAlign: "center", cursor: "pointer", fontWeight: 800, fontSize: 13, color: spicy === s ? brand : "#374151", transition: ".15s" }}>{SPICY_LABELS[lang]?.[s] || s}</div>
              ))}
            </div>
          </div>
        )}
        {opts.size && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>{t("sizeTitle")}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {SIZE_OPTIONS.map(s => {
                const dk = sizeKcalDelta(menu, s.label);
                return (
                  <div key={s.label} onClick={() => setSize(s.label)} style={{ padding: "12px 8px", borderRadius: 14, border: "2px solid " + (size === s.label ? brand : "#e5e7eb"), background: size === s.label ? brand + "18" : "#fff", textAlign: "center", cursor: "pointer", transition: ".15s" }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: size === s.label ? brand : "#374151" }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{s.price === 0 ? t("sizeBase") : (s.price > 0 ? "+" : "") + fmt(s.price, lang)}</div>
                    {dk !== 0 && <div style={{ fontSize: 10, color: "#ea580c", marginTop: 2, fontWeight: 700 }}>{(dk > 0 ? "+" : "") + dk}kcal</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {opts.toppings && opts.toppings.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>{t("toppingsTitle")} <span style={{ color: "#9ca3af", fontSize: 12, fontWeight: 500 }}>{t("toppingsHint")}</span></div>
            <div style={{ display: "grid", gap: 8 }}>
              {opts.toppings.map(top => {
                const sel = isSelected(top);
                const priceN = toppingPrice(top);
                const kcalN = toppingKcal(top);
                return (
                  <div key={top.ko || top} onClick={() => toggleTopping(top)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: 14, border: "2px solid " + (sel ? brand : "#e5e7eb"), background: sel ? brand + "18" : "#fff", cursor: "pointer", transition: ".15s" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: sel ? brand : "#374151" }}>{toppingDisplay(top, lang)}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {kcalN > 0 && <span style={{ fontSize: 11, color: "#9ca3af" }}>+{kcalN}kcal</span>}
                      <span style={{ fontSize: 12, color: "#10b981", fontWeight: 700 }}>{priceN ? "+" + fmt(priceN, lang) : ""}</span>
                      <div style={{ width: 22, height: 22, borderRadius: 8, background: sel ? brand : "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: sel ? "#fff" : "#9ca3af", transition: ".15s" }}>✓</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, padding: "14px 16px", background: "#f9fafb", borderRadius: 16 }}>
          <span style={{ fontWeight: 800, fontSize: 14 }}>{t("quantity")}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 34, height: 34, borderRadius: 10, border: "none", background: "#e5e7eb", color: "#1c1917", fontWeight: 900, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, lineHeight: 1 }}>−</button>
            <span className="tnum" style={{ fontWeight: 900, fontSize: 16, minWidth: 24, textAlign: "center" }}>{qty}</span>
            <button onClick={() => setQty(q => q + 1)} style={{ width: 34, height: 34, borderRadius: 10, border: "none", background: "#e5e7eb", color: "#1c1917", fontWeight: 900, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, lineHeight: 1 }}>＋</button>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 4px 14px", fontSize: 13 }}>
          <span style={{ color: "#6b7280", fontWeight: 700 }}>{t("optDefendKcalLabel")}</span>
          <strong style={{ color: "#ea580c", fontSize: 15 }}>-{(kcalPerUnit * qty).toLocaleString()} kcal</strong>
        </div>
        <button onClick={() => onConfirm({ spicy: opts.spicy ? spicy : null, size: opts.size ? size : null, toppings, qty, extraPrice: (opts.size ? sizeExtra : 0) + toppingExtra, kcal: kcalPerUnit })}
          style={{ width: "100%", padding: "16px", background: brand, color: "#fff", border: "none", borderRadius: 16, fontWeight: 900, fontSize: 16, cursor: "pointer", fontFamily: "inherit" }}>
          {t("optAddBtn", fmt(totalPrice, lang))}
        </button>
      </div>
    </div>
  );
}

// Geometry of the stylized delivery route (percent of the map box):
// store → right → down → right → home.
const ROUTE = [[16, 26], [58, 26], [58, 72], [84, 72]];
const ROUTE_ASPECT = 1.7; // map box is ~1.7× wider than tall

function routePoint(p) {
  const segs = ROUTE.slice(1).map((pt, i) => {
    const [x1, y1] = ROUTE[i];
    const [x2, y2] = pt;
    return { x1, y1, x2, y2, len: Math.hypot((x2 - x1) * ROUTE_ASPECT, y2 - y1) };
  });
  const total = segs.reduce((s, x) => s + x.len, 0);
  let left = Math.max(0, Math.min(1, p)) * total;
  for (const s of segs) {
    if (left <= s.len) {
      const f = s.len ? left / s.len : 0;
      return { x: s.x1 + (s.x2 - s.x1) * f, y: s.y1 + (s.y2 - s.y1) * f, segs, total };
    }
    left -= s.len;
  }
  const last = ROUTE[ROUTE.length - 1];
  return { x: last[0], y: last[1], segs, total };
}

function RouteMap({ progress, storeEmoji, storeLabel, homeLabel, pill }) {
  const pos = routePoint(progress);
  const coveredLen = Math.max(0, Math.min(1, progress)) * pos.total;
  const fills = pos.segs.map((s, i) => {
    const before = pos.segs.slice(0, i).reduce((sum, x) => sum + x.len, 0);
    return Math.max(0, Math.min(1, (coveredLen - before) / s.len));
  });
  const line = (s, color, fraction) => {
    const horizontal = s.y1 === s.y2;
    return horizontal
      ? { position: "absolute", left: s.x1 + "%", top: s.y1 + "%", width: (s.x2 - s.x1) * fraction + "%", height: 6, marginTop: -3, background: color, borderRadius: 999 }
      : { position: "absolute", left: s.x1 + "%", top: s.y1 + "%", height: (s.y2 - s.y1) * fraction + "%", width: 6, marginLeft: -3, background: color, borderRadius: 999 };
  };
  const marker = (x, y) => ({ position: "absolute", left: x + "%", top: y + "%", transform: "translate(-50%,-50%)" });
  return (
    <div style={{ position: "relative", height: 200, borderRadius: 20, overflow: "hidden", background: "#f1f5f9", border: "1px solid rgba(254,215,170,0.72)", boxShadow: "0 4px 18px rgba(28,25,23,0.05)" }}>
      {[{ l: 4, t: 46, w: 30, h: 18, c: "#dcfce7" }, { l: 68, t: 6, w: 26, h: 40, c: "#e2e8f0" }, { l: 22, t: 84, w: 28, h: 12, c: "#e2e8f0" }, { l: 64, t: 82, w: 14, h: 14, c: "#dcfce7" }].map((b, i) => (
        <div key={i} style={{ position: "absolute", left: b.l + "%", top: b.t + "%", width: b.w + "%", height: b.h + "%", background: b.c, borderRadius: 14 }} />
      ))}
      {pos.segs.map((s, i) => <div key={"b" + i} style={line(s, "#fed7aa", 1)} />)}
      {pos.segs.map((s, i) => (fills[i] > 0 ? <div key={"p" + i} style={line(s, "#f97316", fills[i])} /> : null))}
      <div style={{ ...marker(ROUTE[0][0], ROUTE[0][1]), textAlign: "center" }}>
        <div style={{ width: 40, height: 40, borderRadius: 999, background: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{storeEmoji}</div>
        <div style={{ position: "absolute", left: "50%", top: 44, transform: "translateX(-50%)", fontSize: 10, fontWeight: 800, color: "#374151", whiteSpace: "nowrap" }}>{storeLabel}</div>
      </div>
      <div style={{ ...marker(ROUTE[3][0], ROUTE[3][1]), textAlign: "center" }}>
        <div style={{ width: 40, height: 40, borderRadius: 999, background: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏠</div>
        <div style={{ position: "absolute", left: "50%", top: 44, transform: "translateX(-50%)", fontSize: 10, fontWeight: 800, color: "#374151", whiteSpace: "nowrap" }}>{homeLabel}</div>
      </div>
      <div style={{ ...marker(pos.x, pos.y), transition: "left .8s ease, top .8s ease", zIndex: 2 }}>
        <div style={{ width: 44, height: 44, borderRadius: 999, background: "#f97316", border: "3px solid #fff", boxShadow: "0 6px 16px rgba(249,115,22,0.45)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, animation: "floatBike 2.2s ease-in-out infinite" }}>🛵</div>
      </div>
      <div style={{ position: "absolute", left: 12, bottom: 12, background: "rgba(255,255,255,0.95)", borderRadius: 10, padding: "6px 10px", fontSize: 11, fontWeight: 800, color: "#111827", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>{pill}</div>
    </div>
  );
}

const SORT_OPTIONS = [
  { val: "default", labelKey: "sortRecommended" },
  { val: "rating", labelKey: "sortRatingHigh" },
  { val: "minOrder", labelKey: "sortMinOrderLow" },
  { val: "distance", labelKey: "sortNearest" },
];

const TAB_PAGES = ["order", "search", "favorites", "my"];

export default function App() {
  const [deliveryMode, setDeliveryMode] = useState("rabbit");
  const [page, setPage] = useState("order");
  const [cart, setCart] = useState([]);
  const [payment, setPayment] = useState("카드");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [nm, setNm] = useState("");
  const [ph, setPh] = useState("");
  const [ad, setAd] = useState("");
  const [rq, setRq] = useState("");
  const [requestPreset, setRequestPreset] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [trackState, setTrackState] = useState(0);
  const [cooking, setCooking] = useState(false);
  const [orderAccepted, setOrderAccepted] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [optionTarget, setOptionTarget] = useState(null);
  const [addedAnim, setAddedAnim] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [detailReturnPage, setDetailReturnPage] = useState("order");
  const [cartReturnPage, setCartReturnPage] = useState("order");
  const isDuo = useDuoLayout();
  const nativeLiquidGlass = useNativeLiquidGlass();
  // iPhone Duo (cover screen, or inner display in landscape): native nav lives
  // in the camera/status-bar side column, per the HIG's vertical controls.
  const edgeRailSide = useEdgeRailSide();
  const edgeRail = nativeLiquidGlass && !!edgeRailSide;
  // Unfolded inner display held in portrait has room vertically, so the HIG
  // keeps the standard horizontal tab bar there instead of a side rail.
  const isPortrait = useMediaQuery("(orientation: portrait)");
  const duoBottomBar = nativeLiquidGlass && isDuo && !edgeRail && isPortrait;
  const [duoRightMode, setDuoRightMode] = useState("restaurant"); // "restaurant" | "cart"
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const listRef = useRef(null);
  const completeRef = useRef(null);
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("favoriteRestaurants"));
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });
  // Doubles as the first-launch onboarding screen — same content as the "?"
  // info button, just auto-opened once per device via the localStorage flag.
  const [showInfoModal, setShowInfoModal] = useState(() => {
    try {
      if (localStorage.getItem("hasSeenIntro")) return false;
      localStorage.setItem("hasSeenIntro", "1");
      return true;
    } catch {
      return false;
    }
  });
  const [showSponsorModal, setShowSponsorModal] = useState(true);
  const [history, setHistory] = useState([]);
  const [unlocked, setUnlocked] = useState({});
  const [uid, setUid] = useState(null);

  useEffect(() => {
    authReady.then(setUid);
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadHistory(), loadUnlocked()]).then(([h, u]) => {
      if (!cancelled) { setHistory(h); setUnlocked(u); }
    }).catch(err => console.warn("Failed to load history/achievements", err));
    return () => { cancelled = true; };
  }, []);
  const [newlyUnlocked, setNewlyUnlocked] = useState([]);
  const [shareRecord, setShareRecord] = useState(null);
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem("lang");
      if (saved === "ko" || saved === "en") return saved;
    } catch { /* localStorage unavailable */ }
    return typeof navigator !== "undefined" && /^en/i.test(navigator.language || "") ? "en" : "ko";
  });

  useEffect(() => {
    try { localStorage.setItem("lang", lang); } catch { /* ignore */ }
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang === "en" ? "en" : "ko";
    }
  }, [lang]);

  // Every screen change starts at the top, like a native navigation push
  // (skipped in Duo split mode when simply switching the right-pane restaurant).
  useEffect(() => {
    if (typeof window !== "undefined" && !isDuo) window.scrollTo(0, 0);
  }, [page, detailId, isDuo]);

  const [customRestaurants, setCustomRestaurants] = useState([]);
  const [customMenus, setCustomMenus] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [showAddRestaurant, setShowAddRestaurant] = useState(false);
  const [addMenuTarget, setAddMenuTarget] = useState(null);
  const [localRestaurants, setLocalRestaurants] = useState(() => getLocalRestaurants());
  const [localMenus, setLocalMenus] = useState(() => getLocalMenus());
  const [publishTarget, setPublishTarget] = useState(null); // { type: "restaurant" | "menu", item }
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [deliveryNotif, setDeliveryNotif] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  // Values are real seconds — the tracking screen genuinely takes this long
  // to complete (see mode/trackData below), not a compressed simulation.
  const [deliveryTimeOverrides, setDeliveryTimeOverrides] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("deliveryTimeSeconds"));
      if (saved && typeof saved.rabbit === "number" && typeof saved.turtle === "number") return saved;
    } catch { /* ignore */ }
    return { rabbit: deliveryModes.rabbit.defaultSeconds, turtle: deliveryModes.turtle.defaultSeconds };
  });

  const handleChangeDeliveryTime = (key, seconds) => {
    setDeliveryTimeOverrides(prev => {
      const next = { ...prev, [key]: seconds };
      try { localStorage.setItem("deliveryTimeSeconds", JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  useEffect(() => {
    const unsubR = subscribeCustomRestaurants(setCustomRestaurants);
    const unsubM = subscribeCustomMenus(setCustomMenus);
    const unsubRev = subscribeAllReviews(setAllReviews);
    return () => { unsubR(); unsubM(); unsubRev(); };
  }, []);

  // Real, non-hidden review count per restaurant — replaces the static
  // seed `reviews` field on restaurant cards.
  const reviewCountByRestaurant = useMemo(() => {
    const map = {};
    allReviews.forEach(r => {
      if ((r.reportedBy || []).length >= REPORT_HIDE_THRESHOLD) return;
      map[r.restaurantId] = (map[r.restaurantId] || 0) + 1;
    });
    return map;
  }, [allReviews]);
  const reviewCountFor = (r) => reviewCountByRestaurant[String(r.id)] || 0;

  const t = useMemo(() => makeT(lang), [lang]);
  const inquiryEmail = "eggmari5713@gmail.com";
  const timersRef = useRef([]);

  const th = theme;
  const modeConfig = deliveryModes[deliveryMode];
  const modeTotalSeconds = deliveryTimeOverrides[deliveryMode];
  const mode = {
    ...modeConfig,
    etaStart: Math.max(1, Math.round(modeTotalSeconds / modeConfig.stepSeconds)),
    intervalMs: modeConfig.stepSeconds * 1000,
  };
  const totals = calcTotals(cart, deliveryMode);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const showToast = (message) => {
    clearTimeout(toastTimerRef.current);
    setToast(message);
    toastTimerRef.current = setTimeout(() => setToast(null), 2000);
  };
  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [id, ...prev];
      try { localStorage.setItem("favoriteRestaurants", JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  // Merge user-created restaurants/menus into the built-in catalog so the
  // rest of the app (search, cart, checkout, history) treats them the same.
  const customMenuIds = useMemo(() => new Set(customMenus.map(m => m.id)), [customMenus]);

  const isReported = (item) => (item.reportedBy || []).length >= REPORT_HIDE_THRESHOLD;

  // A pending submission (anything not yet approved by the admin) only
  // shows in the main list to the person who submitted it — everyone else,
  // including the admin's own regular browsing, sees it once approved.
  // Approved items and legacy ones with no status field (pre-dating this
  // moderation step) are always visible.
  const isVisibleToMainList = (item) => {
    if (isReported(item)) return false;
    if (item.status === "pending") return item.addedBy === uid;
    return true;
  };

  const allRestaurants = useMemo(() => {
    const visibleCustomRestaurants = customRestaurants.filter(isVisibleToMainList);
    const visibleCustomMenus = customMenus.filter(isVisibleToMainList);
    return [...restaurants, ...visibleCustomRestaurants].map(r => ({
      ...r,
      menus: [...r.menus, ...visibleCustomMenus.filter(m => m.restaurantId === r.id)],
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customRestaurants, customMenus, uid]);

  // Categories actually present in the current catalog, most common first.
  const categoryCounts = useMemo(() => {
    const map = new Map();
    allRestaurants.forEach(r => {
      const key = r.category?.ko;
      if (!key) return;
      if (!map.has(key)) map.set(key, { key, ko: r.category.ko, en: r.category.en, count: 0, emoji: categoryEmoji[key] || firstGrapheme(r.emoji) || "🍴" });
      map.get(key).count += 1;
    });
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [allRestaurants]);

  const categoryTabs = useMemo(() => [
    { key: "all", label: t("categoryAll"), emoji: "🍽️" },
    ...categoryCounts.map(c => ({ key: c.key, label: pick({ ko: c.ko, en: c.en }, lang), emoji: c.emoji })),
  ], [categoryCounts, lang, t]);

  // Pending queues for the admin moderation panel.
  const pendingRestaurants = useMemo(
    () => customRestaurants.filter(r => r.status === "pending"),
    [customRestaurants],
  );
  const pendingMenus = useMemo(
    () => customMenus.filter(m => m.status === "pending"),
    [customMenus],
  );
  const restaurantNameById = useMemo(() => {
    const map = {};
    restaurants.forEach(r => { map[r.id] = pick(r.name, lang); });
    customRestaurants.forEach(r => { map[r.id] = pick(r.name, lang); });
    return map;
  }, [customRestaurants, lang]);

  const restaurantSubtotals = useMemo(() => {
    const map = {};
    cart.forEach(i => { map[i.restaurantId] = (map[i.restaurantId] || 0) + i.price * i.qty; });
    return map;
  }, [cart]);

  const unmetMinOrders = useMemo(() => {
    return Object.entries(restaurantSubtotals)
      .map(([ridStr, subtotal]) => {
        const r = allRestaurants.find(x => String(x.id) === ridStr);
        return r && r.minOrder && subtotal < r.minOrder
          ? { id: r.id, name: pick(r.name, lang), subtotal, minOrder: r.minOrder }
          : null;
      })
      .filter(Boolean);
  }, [restaurantSubtotals, allRestaurants, lang]);

  const stats = useMemo(() => computeStats(history), [history]);

  const clearTimers = useCallback(() => { timersRef.current.forEach(clearTimeout); timersRef.current = []; }, []);
  useEffect(() => () => clearTimers(), [clearTimers]);

  useEffect(() => {
    requestAdTracking();
    ensureNotificationPermission();
  }, []);

  // Launch popup ad: wait until the home screen is visible and the first-launch
  // intro modal has been closed, so the two never stack on top of each other.
  const launchPopupShownRef = useRef(false);
  useEffect(() => {
    if (launchPopupShownRef.current || page !== "order" || showInfoModal) return;
    launchPopupShownRef.current = true;
    showLaunchPopupAd();
  }, [page, showInfoModal]);

  const openRestaurant = (r) => {
    setDetailId(r.id);
    if (isDuo && TAB_PAGES.includes(page)) {
      setDuoRightMode("restaurant");
      return;
    }
    if (TAB_PAGES.includes(page)) setDetailReturnPage(page);
    setPage("restaurant");
  };

  const openCart = () => {
    if (isDuo && TAB_PAGES.includes(page)) {
      setDuoRightMode("cart");
      return;
    }
    if (page !== "cart" && page !== "checkout") setCartReturnPage(page);
    setPage("cart");
  };

  const openOption = (rid, mid) => {
    const r = allRestaurants.find(x => x.id === rid);
    const m = r.menus.find(x => x.id === mid);
    const opts = m.options || {};
    if (!opts.spicy && !opts.size && (!opts.toppings || opts.toppings.length === 0)) {
      addToCartDirect(rid, mid, 1, 0, null, null, []);
    } else {
      setOptionTarget({ rid, mid });
    }
  };

  const addToCartDirect = (rid, mid, qty, extraPrice, spicy, size, toppings, kcal) => {
    const r = allRestaurants.find(x => x.id === rid);
    const m = r.menus.find(x => x.id === mid);
    const unitPrice = m.price + extraPrice;
    // Normalize toppings into [{ko, en}] shape to keep cart language-agnostic
    const normToppings = (toppings || []).map(t =>
      typeof t === "object" ? { ko: t.ko || "", en: t.en || t.ko || "" } : { ko: t, en: t }
    );
    setCart(prev => {
      const key = mid + JSON.stringify({ spicy, size, toppings: normToppings.map(t => t.ko) });
      const ex = prev.find(x => x.cartKey === key);
      if (ex) return prev.map(x => x.cartKey === key ? { ...x, qty: x.qty + qty } : x);
      return [...prev, {
        cartKey: key, restaurantId: rid, menuId: mid,
        restaurantName: r.name, // bilingual object
        name: m.name, // bilingual object
        price: unitPrice, fee: r.fee, qty,
        spicy, size, toppings: normToppings,
        calories: kcal ?? unitKcal(m, size, normToppings),
      }];
    });
    setAddedAnim(mid);
    setTimeout(() => setAddedAnim(null), 900);
    setOptionTarget(null);
    const name = pick(m.name, lang);
    showToast(t("toastAddedToCart", name, eulReul(name)));
  };

  const changeQty = (key, d) => setCart(prev => prev.map(x => x.cartKey === key ? { ...x, qty: x.qty + d } : x).filter(x => x.qty > 0));
  const removeCartItem = (key) => setCart(prev => prev.filter(x => x.cartKey !== key));
  const clearCart = () => {
    if (typeof window !== "undefined" && !window.confirm(t("cartClearConfirm"))) return;
    setCart([]);
  };

  const resetAll = () => {
    clearTimers();
    completeRef.current = null;
    setCart([]);
    setPayment("카드");
    setNm(""); setPh(""); setAd(""); setRq(""); setRequestPreset(0);
    setShowReceipt(false);
    setReceiptData(null);
    setTrackState(0);
    setCooking(false);
    setOrderAccepted(false);
    setOrderInfo(null);
    setPage("order");
    setDeliveryMode("rabbit");
    setShowInfoModal(false);
    setDeliveryNotif(null);
  };

  const persistOrder = useCallback((info, cartSnapshot, totalsSnapshot) => {
    const record = buildOrderRecord({
      cart: cartSnapshot,
      orderInfo: info,
      totals: totalsSnapshot,
      deliveryMode: info.deliveryMode,
      lang,
      menuCalories: MENU_CALORIES,
      restaurants: allRestaurants,
    });
    const nextHistory = [record, ...history].slice(0, HISTORY_LIMIT);
    setHistory(nextHistory);
    const nextStats = computeStats(nextHistory);
    const { newly, nextMap } = computeNewUnlocks(nextStats, unlocked);
    if (newly.length) {
      setUnlocked(nextMap);
      saveUnlocked(nextMap).catch(err => console.warn("Failed to save achievements", err));
      setNewlyUnlocked(newly);
    }
    saveOrderRecord(record).catch(err => console.warn("Failed to save order record", err));
    return record;
  }, [lang, unlocked, allRestaurants, history]);

  const requestPresets = dict[lang]?.requestPresets || dict.ko.requestPresets;
  const customRequestIndex = requestPresets.length - 1;

  const simulateOrder = () => {
    if (unmetMinOrders.length > 0) { alert(t("minOrderBlockedAlert")); return; }
    clearTimers();
    setShowReceipt(false);
    const firstRestaurant = allRestaurants.find(r => r.id === cart[0]?.restaurantId);
    const request = requestPreset === customRequestIndex ? rq : requestPresets[requestPreset];
    const info = {
      customerName: nm || (lang === "en" ? "Customer" : "주문자"),
      address: ad || (lang === "en" ? "No address provided" : "입력된 주소 없음"),
      phone: ph || (lang === "en" ? "No phone" : "연락처 없음"),
      request: request || (lang === "en" ? "None" : "없음"),
      payment, total: totals.total, deliveryMode,
      savedKcal: cartKcal(cart),
      storeEmoji: firstRestaurant?.emoji || "🍽️",
      storeNames: [...new Set(cart.map(i => pick(i.restaurantName, lang)))].join(", "),
      itemsSummary: cart.slice(0, 2).map(i => pick(i.name, lang)).join(", ") + (cart.length > 2 ? t("plusMore", cart.length - 2) : ""),
      distanceKm: firstRestaurant ? distanceKm(firstRestaurant) : 1,
    };
    // Snapshot cart & totals at submit time — they're cleared on resetAll later.
    const cartSnapshot = cart;
    const totalsSnapshot = totals;
    timersRef.current.push(setTimeout(() => {
      setReceiptData(info);
      setShowReceipt(true);
      timersRef.current.push(setTimeout(() => {
        setOrderInfo(info);
        setTrackState(0);
        setCooking(true);
        setOrderAccepted(true);
        setPage("tracking");
        completeRef.current = () => {
          completeRef.current = null;
          const rec = persistOrder(info, cartSnapshot, totalsSnapshot);
          setReceiptData({ ...info, _record: rec });
          setPage("complete");
          const notif = { title: t("notifDeliveryTitle"), body: t("notifDeliveryBody") };
          notifyDeliveryComplete(notif);
          setDeliveryNotif(notif);
        };
        // "Order accepted" shows briefly before the kitchen starts cooking.
        timersRef.current.push(setTimeout(() => setOrderAccepted(false), 3500));
        // Cooking always takes COOK_TIME_MS in real time, regardless of
        // delivery mode/time — the courier timers only start once it ends.
        timersRef.current.push(setTimeout(() => {
          setCooking(false);
          Array.from({ length: mode.etaStart }, (_, i) =>
            timersRef.current.push(setTimeout(() => setTrackState(i + 1), (i + 1) * mode.intervalMs))
          );
          timersRef.current.push(setTimeout(() => completeRef.current?.(), mode.etaStart * mode.intervalMs + mode.completeDelayMs));
        }, COOK_TIME_MS));
      }, 1500));
    }, 900));
  };

  // "바로 도착": skip the remaining wait and finish the delivery now.
  const skipToArrival = () => {
    if (!completeRef.current) return;
    clearTimers();
    setCooking(false);
    setOrderAccepted(false);
    setTrackState(mode.etaStart);
    completeRef.current();
  };

  const clearAllActivity = () => {
    if (typeof window !== "undefined" && !window.confirm(t("historyClearConfirm"))) return;
    setHistory([]);
    setUnlocked({});
    clearHistory().catch(err => console.warn("Failed to clear history", err));
    saveUnlocked({}).catch(err => console.warn("Failed to clear achievements", err));
  };

  const trackData = Array.from({ length: mode.etaStart }, (_, i) => {
    const min = Math.max(1, Math.ceil((mode.etaStart - i) * mode.intervalMs / 60000));
    const isRabbit = deliveryMode === "rabbit";
    return {
      eta: min + t("minutes"),
      bottom: isRabbit ? t("bottomRabbit", min) : t("bottomTurtle", min),
      finalDone: false,
    };
  }).concat([{ eta: t("arrived"), bottom: t("deliveryDoneFull"), finalDone: true }]);

  const td = trackData[trackState] || trackData[0];
  // 0 accepted · 1 cooking · 2 on the way · 3 arrived
  const trackStage = cooking ? (orderAccepted ? 0 : 1) : (td.finalDone ? 3 : 2);
  const routeProgress = trackStage < 2 ? 0 : trackStage === 3 ? 1 : Math.min(1, trackState / mode.etaStart);
  const isNativeApp = Capacitor.isNativePlatform();

  const handleDeleteRestaurant = (id) => {
    if (typeof window !== "undefined" && !window.confirm(t("deleteCustomConfirm"))) return;
    deleteCustomRestaurant(id).catch(err => console.warn("Failed to delete restaurant", err));
    setPage(detailReturnPage);
  };

  const handleDeleteMenu = (id) => {
    if (typeof window !== "undefined" && !window.confirm(t("deleteCustomConfirm"))) return;
    deleteCustomMenu(id).catch(err => console.warn("Failed to delete menu", err));
  };

  const handleReportRestaurant = (id) => {
    if (typeof window !== "undefined" && !window.confirm(t("reportConfirm"))) return;
    reportCustomRestaurant(id).catch(err => console.warn("Failed to report restaurant", err));
  };

  const handleReportMenu = (id) => {
    if (typeof window !== "undefined" && !window.confirm(t("reportConfirm"))) return;
    reportCustomMenu(id).catch(err => console.warn("Failed to report menu", err));
  };

  const handleApproveRestaurant = (id) => {
    approveCustomRestaurant(id).catch(err => console.warn("Failed to approve restaurant", err));
  };

  const handleRejectRestaurant = (id) => {
    if (typeof window !== "undefined" && !window.confirm(t("adminRejectConfirm"))) return;
    deleteCustomRestaurant(id).catch(err => console.warn("Failed to reject restaurant", err));
  };

  const handleApproveMenu = (id) => {
    approveCustomMenu(id).catch(err => console.warn("Failed to approve menu", err));
  };

  const handleRejectMenu = (id) => {
    if (typeof window !== "undefined" && !window.confirm(t("adminRejectConfirm"))) return;
    deleteCustomMenu(id).catch(err => console.warn("Failed to reject menu", err));
  };

  const filtered = allRestaurants
    .filter(r => categoryFilter === "all" || r.category?.ko === categoryFilter)
    .sort((a, b) => {
      switch (sortBy) {
        case "rating": return b.rating - a.rating;
        case "minOrder": return (a.minOrder || 0) - (b.minOrder || 0);
        case "distance": return distanceKm(a) - distanceKm(b);
        default: return 0;
      }
    });

  const css = {
    wrap: { minHeight: "100dvh", background: th.phone, fontFamily: 'Inter,"Noto Sans KR",system-ui,sans-serif', color: th.text, display: "flex", flexDirection: "column" },
    header: { position: "sticky", top: 0, zIndex: 10, color: th.headerColor, padding: "max(18px, calc(12px + env(safe-area-inset-top, 0px))) 18px 14px" },
    // Side safe-area insets are applied on #root (see index.css), so the
    // header only needs its own 18px gutter here.
    plainHeader: { position: "sticky", top: 0, zIndex: 10, padding: "max(18px, calc(12px + env(safe-area-inset-top, 0px))) 18px 12px" },
    content: { flex: 1, padding: "16px 18px 100px", display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 14, alignContent: "start", maxWidth: 540, width: "100%", margin: "0 auto", boxSizing: "border-box" },
    section: { background: "#fff", borderRadius: 22, padding: 16, border: "1px solid " + th.cardBorder, boxShadow: th.sectionShadow, minWidth: 0 },
    input: { width: "100%", padding: "14px 16px", border: "1px solid rgba(229,231,235,0.9)", outline: "none", borderRadius: 14, background: "#fff", color: th.text, fontFamily: "inherit", fontSize: 16, boxSizing: "border-box" },
    bottomBar: { position: "fixed", left: 0, right: 0, bottom: 0, background: th.bottomBarBg, borderTop: "1px solid " + th.bottomBarBorder, backdropFilter: "blur(26px) saturate(210%)", WebkitBackdropFilter: "blur(26px) saturate(210%)", boxShadow: "0 -6px 24px rgba(17,24,39,0.06), inset 0 1px 0 rgba(255,255,255,0.92)", padding: "12px max(18px, env(safe-area-inset-right, 0px)) calc(12px + env(safe-area-inset-bottom)) max(18px, env(safe-area-inset-left, 0px))", display: "flex", justifyContent: "center", zIndex: 20 },
    bottomInner: { display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center", maxWidth: 540, width: "100%" },
    orderBtn: { border: "1px solid rgba(255,255,255,0.35)", background: "linear-gradient(180deg, #fb923c, #ea580c)", color: "#fff", padding: "14px 20px", borderRadius: 999, fontSize: 14, fontWeight: 900, cursor: "pointer", minWidth: 140, boxShadow: "0 8px 20px rgba(234,88,12,0.32), inset 0 1px 0 rgba(255,255,255,0.42)", fontFamily: "inherit" },
    iconBtn: { width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 999, fontSize: 16, color: "#1c1917", cursor: "pointer", padding: 0 },
    backBtn: { width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 999, fontSize: 18, cursor: "pointer", color: "#1c1917", flexShrink: 0, padding: 0 },
    langBtn: { border: "none", borderRadius: 10, background: "rgba(255,255,255,0.18)", color: th.headerColor, padding: "5px 7px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", fontSize: 11, letterSpacing: 0.3 },
  };

  const globalStyle = "@keyframes floatBike{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}} @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}} @keyframes pop{0%{transform:scale(1)}50%{transform:scale(1.2)}100%{transform:scale(1)}} *{box-sizing:border-box} body,html{margin:0;padding:0} .noScrollbar{scrollbar-width:none} .noScrollbar::-webkit-scrollbar{display:none}";

  const optRestaurant = optionTarget ? allRestaurants.find(x => x.id === optionTarget.rid) : null;
  const optMenu = optRestaurant ? optRestaurant.menus.find(x => x.id === optionTarget.mid) : null;

  const toggleLang = () => setLang(prev => prev === "ko" ? "en" : "ko");
  const adLabel = lang === "ko" ? "광고" : "Ad";

  // Bottom spacing for tab screens: tab bar + floating cart button.
  const tabFabBottom = "calc(" + (TAB_BAR_HEIGHT + 10) + "px + env(safe-area-inset-bottom))";
  // With the edge rail there is no bottom tab bar or cart pill to clear.
  const tabToastBottom = edgeRail
    ? "calc(16px + env(safe-area-inset-bottom))"
    : "calc(" + (TAB_BAR_HEIGHT + (cartCount ? 82 : 12)) + "px + env(safe-area-inset-bottom))";
  // Duo 2-pane: clear the native bottom tab bar (and cart pill) when the inner
  // display is held in portrait; otherwise nav is on the side.
  const duoBottomPadding = (extra) => duoBottomBar
    ? "calc(" + (TAB_BAR_HEIGHT + (cartCount ? 64 : 6) + extra) + "px + env(safe-area-inset-bottom))"
    : "calc(" + extra + "px + env(safe-area-inset-bottom))";
  const tabBottomPadding = edgeRail
    ? "calc(28px + env(safe-area-inset-bottom))"
    : "calc(" + (TAB_BAR_HEIGHT + (cartCount ? 90 : 28)) + "px + env(safe-area-inset-bottom))";

  // Sync React navigation / cart / modal state to native iOS 26/27 Liquid Glass chrome
  const anyModalOpen = !!(
    reviewTarget || optionTarget || showInfoModal || showSettings ||
    showAdminPanel || showAddRestaurant || addMenuTarget ||
    publishTarget || shareRecord || showReceipt
  );

  useEffect(() => {
    if (!nativeLiquidGlass) return undefined;
    let active = true;
    const handles = [];
    (async () => {
      const h1 = await LiquidGlass.addListener("tabSelected", ({ tab }) => {
        if (active && tab) setPage(tab);
      });
      const h2 = await LiquidGlass.addListener("cartTapped", () => {
        if (!active) return;
        if (isDuo) {
          setDuoRightMode(prev => (prev === "cart" ? "restaurant" : "cart"));
        } else {
          openCart();
        }
      });
      const h3 = await LiquidGlass.addListener("settingsTapped", () => {
        if (active) setShowSettings(true);
      });
      if (active) handles.push(h1, h2, h3);
      else { h1.remove(); h2.remove(); h3.remove(); }
    })();
    return () => {
      active = false;
      handles.forEach(h => h.remove());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nativeLiquidGlass, isDuo, page]);

  useEffect(() => {
    if (!nativeLiquidGlass) return;
    const isTab = TAB_PAGES.includes(page);
    const showChrome = !anyModalOpen && (
      isTab ||
      (!isDuo && page === "restaurant") ||
      (isDuo && (page === "restaurant" || page === "cart"))
    );
    LiquidGlass.updateState({
      visible: showChrome,
      mode: edgeRail ? "edgeRail" : isDuo && !duoBottomBar ? "rail" : "bottom",
      edge: edgeRailSide || "right",
      showTabs: isDuo ? true : isTab,
      activeTab: isTab ? page : "order",
      labels: [t("tabHome"), t("tabSearch"), t("tabFavorites"), t("tabMySavings")],
      cartCount,
      cartLabel: t("cartFabLabel"),
      cartTotal: fmt(totals.total, lang),
      cartActive: isDuo && (duoRightMode === "cart" || page === "cart"),
    }).catch(() => {});
  }, [
    nativeLiquidGlass, anyModalOpen, isDuo, edgeRail, edgeRailSide, duoBottomBar, page, duoRightMode,
    cartCount, totals.total, lang, t,
  ]);

  const tabChrome = (active) => (
    <>
      {nativeLiquidGlass ? (
        <div
          data-ad-clip="bottom"
          style={{
            position: "fixed", left: 0, right: 0, bottom: 0,
            height: edgeRail
              ? "env(safe-area-inset-bottom)"
              : "calc(" + (TAB_BAR_HEIGHT + (cartCount ? 64 : 6)) + "px + env(safe-area-inset-bottom))",
            pointerEvents: "none",
          }}
        />
      ) : (
        <>
          <CartFab count={cartCount} total={totals.total} onClick={openCart} bottom={tabFabBottom} lang={lang} t={t} th={th} />
          <BottomTabBar active={active} onSelect={setPage} t={t} th={th} />
        </>
      )}
      <Toast message={toast} bottom={tabToastBottom} />
    </>
  );

  const reviewModal = reviewTarget && <ReviewModal restaurant={reviewTarget} onClose={() => setReviewTarget(null)} t={t} lang={lang} uid={uid} th={th} />;
  const infoModal = showInfoModal && (
    <InfoModal
      email={inquiryEmail}
      onClose={() => setShowInfoModal(false)}
      onPrivacy={() => { setShowInfoModal(false); setPage("privacy"); }}
      t={t}
      lang={lang}
    />
  );

  if (page === "privacy") {
    return (
      <>
        <style>{globalStyle}</style>
        <PrivacyPage onBack={() => setPage("order")} th={th} t={t} lang={lang} />
      </>
    );
  }

  if (page === "addContent") {
    return (
      <>
        <style>{globalStyle}</style>
        <AddContentPage
          onBack={() => setPage("order")}
          allRestaurants={allRestaurants}
          lang={lang}
          t={t}
          th={th}
          onOpenAddRestaurant={() => setShowAddRestaurant(true)}
          onOpenAddMenu={(r) => setAddMenuTarget(r)}
          localRestaurants={localRestaurants}
          localMenus={localMenus}
          onPublishRestaurant={(r) => setPublishTarget({ type: "restaurant", item: r })}
          onPublishMenu={(m) => setPublishTarget({ type: "menu", item: m })}
          onDeleteLocalRestaurant={(id) => setLocalRestaurants(removeLocalRestaurant(id))}
          onDeleteLocalMenu={(id) => setLocalMenus(removeLocalMenu(id))}
        />
        {publishTarget && (
          <AddContentNoticeModal
            onClose={() => setPublishTarget(null)}
            onConfirm={() => {
              if (publishTarget.type === "restaurant") {
                addCustomRestaurant(publishTarget.item).catch(err => console.warn("Failed to add restaurant", err));
                setLocalRestaurants(removeLocalRestaurant(publishTarget.item.id));
              } else {
                addCustomMenu(publishTarget.item).catch(err => console.warn("Failed to add menu", err));
                setLocalMenus(removeLocalMenu(publishTarget.item.id));
              }
              setPublishTarget(null);
            }}
            confirmLabel={publishTarget.type === "restaurant" ? t("shareRestaurantBtn") : t("publishMenuBtn")}
            t={t}
            th={th}
          />
        )}
        {showAddRestaurant && (
          <AddRestaurantModal
            onClose={() => setShowAddRestaurant(false)}
            onCreate={(r) => {
              setLocalRestaurants(saveLocalRestaurant(r));
              setShowAddRestaurant(false);
            }}
            brand={th.primaryBtn}
            lang={lang}
            t={t}
          />
        )}
        {addMenuTarget && (
          <AddMenuModal
            restaurant={addMenuTarget}
            onClose={() => setAddMenuTarget(null)}
            onCreate={(m) => {
              setLocalMenus(saveLocalMenu(m));
              setAddMenuTarget(null);
            }}
            brand={th.primaryBtn}
            t={t}
            lang={lang}
          />
        )}
      </>
    );
  }

  if (!isDuo && page === "restaurant") {
    const r = allRestaurants.find(x => x.id === detailId);
    if (!r) {
      return (
        <div style={{ ...css.wrap, alignItems: "center", justifyContent: "center" }}>
          <style>{globalStyle}</style>
          <button onClick={() => setPage(detailReturnPage)} style={css.orderBtn}>{t("goHome")}</button>
        </div>
      );
    }
    return (
      <>
        <style>{globalStyle}</style>
        {reviewModal}
        {optionTarget && optMenu && (
          <OptionSheet
            menu={optMenu}
            brand={th.primaryBtn}
            onClose={() => setOptionTarget(null)}
            onConfirm={({ spicy, size, toppings, qty, extraPrice, kcal }) =>
              addToCartDirect(optionTarget.rid, optionTarget.mid, qty, extraPrice, spicy, size, toppings, kcal)
            }
            t={t}
            lang={lang}
          />
        )}
        <RestaurantDetailPage
          r={r} lang={lang} t={t} th={th}
          onBack={() => setPage(detailReturnPage)}
          isFav={favorites.includes(r.id)} onToggleFav={toggleFavorite}
          onAddMenu={(m) => openOption(r.id, m.id)} addedMenuId={addedAnim}
          reviewCount={reviewCountFor(r)} onOpenReviews={setReviewTarget}
          uid={uid} customMenuIds={customMenuIds}
          onDeleteMenu={handleDeleteMenu} onReportMenu={handleReportMenu}
          onDeleteRestaurant={handleDeleteRestaurant} onReportRestaurant={handleReportRestaurant}
          bottomPadding={cartCount ? "calc(100px + env(safe-area-inset-bottom))" : "calc(32px + env(safe-area-inset-bottom))"}
        />
        {!nativeLiquidGlass && (
          <CartFab count={cartCount} total={totals.total} onClick={openCart} bottom="calc(16px + env(safe-area-inset-bottom))" lang={lang} t={t} th={th} />
        )}
        <Toast message={toast} bottom={cartCount ? "calc(88px + env(safe-area-inset-bottom))" : "calc(16px + env(safe-area-inset-bottom))"} />
      </>
    );
  }

  if (!isDuo && page === "cart") {
    return (
      <>
        <style>{globalStyle}</style>
        <CartPage
          cart={cart} totals={totals} lang={lang} t={t} th={th}
          onBack={() => setPage(cartReturnPage)}
          onChangeQty={changeQty} onRemove={removeCartItem} onClearAll={clearCart}
          onCheckout={() => setPage("checkout")} onBrowse={() => setPage("order")}
          unmetMinOrders={unmetMinOrders}
          buildOptLabel={(item) => buildOptLabel(item, t, lang)}
        />
      </>
    );
  }

  if (!isDuo && page === "search") {
    return (
      <>
        <style>{globalStyle}</style>
        <SearchPage
          query={searchQuery} onQueryChange={setSearchQuery}
          restaurants={allRestaurants} lang={lang} t={t} th={th}
          favorites={favorites} onToggleFav={toggleFavorite} onOpen={openRestaurant}
          reviewCountFor={reviewCountFor} bottomPadding={tabBottomPadding}
        />
        {tabChrome("search")}
      </>
    );
  }

  if (!isDuo && page === "favorites") {
    return (
      <>
        <style>{globalStyle}</style>
        <FavoritesPage
          restaurants={allRestaurants} favorites={favorites} lang={lang} t={t} th={th}
          onToggleFav={toggleFavorite} onOpen={openRestaurant} onBrowse={() => setPage("order")}
          reviewCountFor={reviewCountFor} bottomPadding={tabBottomPadding}
        />
        {tabChrome("favorites")}
      </>
    );
  }

  if (!isDuo && page === "my") {
    return (
      <>
        <style>{globalStyle}</style>
        {reviewModal}
        {infoModal}
        <MySavingsPage
          th={th} t={t} lang={lang} uid={uid}
          history={history}
          allRestaurants={allRestaurants}
          onWriteReview={setReviewTarget}
          onClear={clearAllActivity}
          onInfo={() => setShowInfoModal(true)}
          onPrivacy={() => setPage("privacy")}
          bottomPadding={tabBottomPadding}
        />
        {tabChrome("my")}
      </>
    );
  }

  if (page === "complete") {
    const completedRecord = receiptData?._record || history[0] || null;
    const savedMoney = completedRecord?.total ?? orderInfo?.total ?? 0;
    const savedKcal = completedRecord?.savedKcal ?? orderInfo?.savedKcal ?? 0;
    const badges = earnedBadges(stats);
    return (
      <div style={css.wrap}>
        <style>{globalStyle}</style>
        {deliveryNotif && (
          <NotificationBanner
            appName={t("appName")}
            title={deliveryNotif.title}
            body={deliveryNotif.body}
            onDone={() => setDeliveryNotif(null)}
          />
        )}
        {newlyUnlocked.length > 0 && (
          <AchievementToast
            items={newlyUnlocked}
            lang={lang}
            t={t}
            onDone={() => setNewlyUnlocked([])}
          />
        )}
        {shareRecord && (
          <ReceiptModal
            record={shareRecord}
            lang={lang}
            brand={th.primaryBtn}
            th={th}
            t={t}
            onClose={() => setShareRecord(null)}
          />
        )}
        <div data-ad-clip="top" className="lgHeader" style={css.plainHeader}>
          <h2 style={{ maxWidth: 540, margin: "0 auto", fontSize: 19, fontWeight: 900, letterSpacing: -0.3 }}>{t("completePageTitle")}</h2>
        </div>
        <div style={{ ...css.content, paddingBottom: "calc(36px + env(safe-area-inset-bottom))" }}>
          <div style={{ ...css.section, textAlign: "center", padding: "22px 16px 16px" }}>
            <div style={{ width: 64, height: 64, margin: "0 auto", borderRadius: 999, background: "#fff7ed", border: "1px solid #fed7aa", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, animation: "pop .5s ease" }}>🎉</div>
            <h1 style={{ fontSize: 21, fontWeight: 900, margin: "12px 0 4px", letterSpacing: -0.3 }}>{t("completeHeadline")}</h1>
            <div style={{ fontSize: 13, color: "#78716c" }}>{t("completeSubline")}</div>
            <div style={{ marginTop: 16, background: "linear-gradient(135deg,#fff7ed,#ffedd5)", border: "1px solid #fed7aa", borderRadius: 16, padding: "14px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#c2410c" }}>{t("completeMoneyLabel")}</div>
              <div className="tnum" style={{ fontSize: 30, fontWeight: 900, color: "#ea580c", marginTop: 3, letterSpacing: -0.5 }}>{fmt(savedMoney, lang)}</div>
            </div>
            <div style={{ marginTop: 10, background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", border: "1px solid #bbf7d0", borderRadius: 16, padding: "14px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#15803d" }}>{t("completeKcalLabel")}</div>
              <div className="tnum" style={{ fontSize: 27, fontWeight: 900, color: "#166534", marginTop: 3, letterSpacing: -0.4 }}>-{savedKcal.toLocaleString()} kcal</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#15803d", marginTop: 5 }}>🏃 {t("completeRunning", runningMinutes(savedKcal).toLocaleString())}</div>
            </div>
          </div>

          <div style={css.section}>
            <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 12 }}>🏆 {t("completeCumulativeTitle")}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {[[t("cumSavedMoney"), fmt(stats.totalSpent, lang)], [t("cumSavedKcal"), stats.totalSavedKcal.toLocaleString() + " kcal"], [t("cumCount"), t("myCountValue", stats.count)]].map(([k, v]) => (
                <div key={k} style={{ background: "#fafaf9", border: "1px solid #f5f5f4", borderRadius: 12, padding: "10px 6px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#78716c", fontWeight: 700 }}>{k}</div>
                  <div className="tnum" style={{ fontSize: 14, fontWeight: 900, color: "#1c1917", marginTop: 4 }}>{v}</div>
                </div>
              ))}
            </div>
            {badges.length > 0 && (
              <div className="balancedWrap" style={{ gap: 6, marginTop: 12, paddingTop: 12, borderTop: "1px solid #f3f4f6" }}>
                {badges.map(a => (
                  <span key={a.id} style={{ fontSize: 12, fontWeight: 800, background: "#fff7ed", color: "#9a3412", border: "1px solid #fed7aa", borderRadius: 999, padding: "5px 10px" }}>{a.emoji} {pick(a.title, lang)}</span>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: completedRecord ? "1fr 1fr" : "1fr", gap: 8 }}>
              {completedRecord && (
                <button
                  onClick={() => setShareRecord(completedRecord)}
                  style={{ border: "1.5px solid " + th.brand, background: "#fff", color: th.brandDark, padding: "13px 12px", borderRadius: 14, fontSize: 14, fontWeight: 900, cursor: "pointer", fontFamily: "inherit" }}
                >{t("completeShareBtn")}</button>
              )}
              <button
                onClick={() => { resetAll(); setPage("my"); }}
                style={{ border: "1px solid #e7e5e4", background: "#fff", color: th.text, padding: "13px 12px", borderRadius: 14, fontSize: 14, fontWeight: 900, cursor: "pointer", fontFamily: "inherit" }}
              >{t("completeMySavingsBtn")}</button>
            </div>
            <button
              onClick={resetAll}
              style={{ border: "none", background: th.primaryBtn, color: "#fff", padding: "15px 20px", borderRadius: 16, fontSize: 15, fontWeight: 900, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 8px 20px " + th.primaryBtn + "44" }}
            >{t("goHome")}</button>
          </div>

          <PlatformAd
            type="native"
            slot="completeNative"
            hidden={!!shareRecord}
            label={adLabel}
          />

          <Footer th={th} t={t} onInfo={() => { resetAll(); setShowInfoModal(true); }} onPrivacy={() => setPage("privacy")} />
        </div>
      </div>
    );
  }

  if (page === "tracking") {
    const stageKeys = ["trackStage0", "trackStage1", "trackStage2", "trackStage3"];
    const km = Math.max(0, (orderInfo?.distanceKm || 1) * (1 - routeProgress));
    const pill = trackStage < 2 ? t("routeAtStore") : trackStage === 3 ? t("routeArrived") : t("routeRemaining", km.toFixed(2));
    const etaText = trackStage === 3 ? t("arrived") : trackStage < 2 ? t("trackEtaCooking") : t("trackEtaIn", td.eta);
    return (
      <div style={css.wrap}>
        <style>{globalStyle}</style>
        {deliveryNotif && (
          <NotificationBanner appName={t("appName")} title={deliveryNotif.title} body={deliveryNotif.body} onDone={() => setDeliveryNotif(null)} />
        )}
        <div data-ad-clip="top" className="lgHeader" style={css.plainHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, maxWidth: 540, margin: "0 auto" }}>
            <button onClick={() => setPage("order")} aria-label={t("backAria")} style={css.backBtn}>←</button>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, flex: 1 }}>{t("trackPageTitle")}</h2>
            {trackStage < 3 && (
              <button onClick={skipToArrival} style={{ border: "none", background: "none", color: th.brand, fontSize: 14, fontWeight: 900, cursor: "pointer", fontFamily: "inherit" }}>{t("trackSkipBtn")}</button>
            )}
          </div>
        </div>
        <div style={css.content}>
          <div style={css.section}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: th.brandDark, background: th.activeBg, borderRadius: 999, padding: "5px 10px" }}>{mode.emoji} {t(deliveryMode === "rabbit" ? "trackBadgeRabbit" : "trackBadgeTurtle")}</span>
              <span style={{ fontSize: 13, fontWeight: 900, color: th.brand }}>{etaText}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, marginTop: 12 }}>{t(stageKeys[trackStage] + "Title")}</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>{t(stageKeys[trackStage] + "Desc")}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginTop: 16 }}>
              {(dict[lang]?.trackStepLabels || dict.ko.trackStepLabels).map((label, i) => (
                <div key={i}>
                  <div style={{ height: 6, borderRadius: 999, background: i <= trackStage ? th.primaryBtn : "#e5e7eb", transition: "background .4s" }} />
                  <div style={{ fontSize: 10, fontWeight: 800, color: i <= trackStage ? th.brandDark : "#9ca3af", marginTop: 6 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          <RouteMap
            progress={routeProgress}
            storeEmoji={orderInfo?.storeEmoji || "🍽️"}
            storeLabel={t("routeStoreLabel")}
            homeLabel={t("routeHomeLabel")}
            pill={pill}
          />

          <div style={css.section}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 999, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{deliveryMode === "rabbit" ? "🐇" : "🐢"}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 900, fontSize: 15 }}>{deliveryMode === "rabbit" ? t("riderRabbit") : t("riderTurtle")}</div>
                <div style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>{deliveryMode === "rabbit" ? t("riderRabbitDesc") : t("riderTurtleDesc")}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#6b7280", background: "#f3f4f6", borderRadius: 10, padding: "8px 10px", flexShrink: 0 }}>{t("riderSafeNumber")}</span>
            </div>
          </div>

          <PlatformAd
            slot="trackingBanner"
            width={320}
            height={50}
            label={adLabel}
            hidden={!!deliveryNotif}
            style={{ ...css.section, padding: "12px 0 14px" }}
          />

          {orderInfo && (
            <div style={css.section}>
              <div style={{ fontWeight: 900, fontSize: 15 }}>{orderInfo.storeNames}</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>{orderInfo.itemsSummary}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 12, borderTop: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: 12, color: "#6b7280" }}>{t("trackSavedLabel")}</span>
                <strong style={{ fontSize: 14, color: th.brand }}>{fmt(orderInfo.total, lang)} · -{(orderInfo.savedKcal || 0).toLocaleString()} kcal</strong>
              </div>
              {[[t("sumMode"), pick(deliveryModes[orderInfo.deliveryMode]?.label || mode.label, lang)], [t("sumPay"), paymentLabel(orderInfo.payment, t)]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12, marginTop: 6 }}>
                  <span style={{ color: "#6b7280" }}>{k}</span><span style={{ fontWeight: 700 }}>{v}</span>
                </div>
              ))}
            </div>
          )}
          <Footer th={th} t={t} onInfo={() => { setPage("order"); setShowInfoModal(true); }} onPrivacy={() => setPage("privacy")} />
        </div>
        <div data-ad-clip="bottom" style={css.bottomBar}>
          <div style={css.bottomInner}>
            <div><span style={{ fontSize: 11, color: th.muted, fontWeight: 700 }}>{t("currentStatus")}</span><br /><strong style={{ fontSize: 17, fontWeight: 900 }}>{trackStage < 2 ? t("cookingBottom") : td.bottom}</strong></div>
            <button onClick={resetAll} style={{ ...css.orderBtn, minWidth: "auto", padding: "12px 18px", boxShadow: "none" }}>{t("goHome")}</button>
          </div>
        </div>
      </div>
    );
  }

  if (page === "checkout") {
    const isCustomRequest = requestPreset === customRequestIndex;
    return (
      <div style={css.wrap}>
        <style>{globalStyle}</style>
        <div data-ad-clip="top" className="lgHeader" style={css.plainHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, maxWidth: 540, margin: "0 auto" }}>
            <button onClick={() => setPage("cart")} aria-label={t("backAria")} className="lgPillBtn" style={css.backBtn}>←</button>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>{t("checkoutTitle")}</h2>
          </div>
        </div>
        <div style={css.content}>
          {unmetMinOrders.length > 0 && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 16, padding: "14px 16px" }}>
              <div style={{ fontWeight: 900, color: "#dc2626", marginBottom: 8, fontSize: 13 }}>⚠️ {t("minOrderBannerTitle")}</div>
              <div style={{ display: "grid", gap: 4 }}>
                {unmetMinOrders.map(u => (
                  <div key={u.id} style={{ fontSize: 12, color: "#7f1d1d", fontWeight: 700 }}>
                    {t("minOrderShortfallLine", u.name, fmt(u.subtotal, lang), fmt(u.minOrder, lang))}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={css.section}>
            <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 12 }}>{t("deliveryInfoTitle")}</div>
            <div style={{ display: "grid", gap: 10 }}>
              {[[t("recipient"), nm, setNm, t("namePh")], [t("phone"), ph, setPh, t("phonePh")], [t("address"), ad, setAd, t("addressPh")]].map(([label, val, setter, placeholder]) => (
                <div key={label} style={{ display: "grid", gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 800, color: "#6b7280" }}>{label}</label>
                  <input value={val} onChange={e => setter(e.target.value)} placeholder={placeholder} style={css.input} />
                </div>
              ))}
              <div style={{ fontSize: 11, color: "#9ca3af", lineHeight: 1.5 }}>{t("checkoutPrivacyNote")}</div>
            </div>
          </div>
          <div style={css.section}>
            <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 12 }}>{t("deliveryTypeTitle")}</div>
            <div style={{ display: "grid", gap: 8 }}>
              {Object.values(deliveryModes).map((m) => {
                const active = deliveryMode === m.key;
                return (
                  <button key={m.key} onClick={() => setDeliveryMode(m.key)} style={{ display: "flex", alignItems: "center", gap: 12, border: active ? "2px solid " + th.brand : "1px solid #e5e7eb", background: active ? th.activeBg : "#f9fafb", borderRadius: 16, padding: "12px 14px", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
                    <span style={{ fontSize: 26 }}>{m.emoji}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontWeight: 900, fontSize: 15, color: active ? th.brandDark : "#111827" }}>{pick(m.label, lang)}</span>
                      <span style={{ display: "block", fontSize: 12, color: "#6b7280", marginTop: 2 }}>{(m.key === "rabbit" ? t("fastDeliveryDesc") : t("slowDeliveryDesc"))} · {m.key === "rabbit" ? "+" + fmt(RABBIT_SURCHARGE, lang) : t("baseDeliveryFee")}</span>
                    </span>
                    <span style={{ width: 22, height: 22, borderRadius: 999, border: active ? "none" : "2px solid #d1d5db", background: active ? th.primaryBtn : "transparent", color: "#fff", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{active ? "✓" : ""}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div style={css.section}>
            <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 12 }}>{t("requestTitle")}</div>
            <select
              value={requestPreset}
              onChange={e => setRequestPreset(Number(e.target.value))}
              style={{ ...css.input, appearance: "none", WebkitAppearance: "none", backgroundImage: "linear-gradient(45deg,transparent 50%,#6b7280 50%),linear-gradient(135deg,#6b7280 50%,transparent 50%)", backgroundPosition: "calc(100% - 20px) 50%,calc(100% - 15px) 50%", backgroundSize: "5px 5px,5px 5px", backgroundRepeat: "no-repeat", paddingRight: 40 }}
            >
              {requestPresets.map((p, i) => <option key={i} value={i}>{p}</option>)}
            </select>
            {isCustomRequest && (
              <textarea value={rq} onChange={e => setRq(e.target.value)} placeholder={t("requestPh")} style={{ ...css.input, marginTop: 10, resize: "vertical", minHeight: 80 }} />
            )}
          </div>
          <div style={css.section}>
            <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 6 }}>{t("paymentTitleZero")}</div>
            {PAYMENT_OPTIONS.map(p => {
              const active = payment === p.val;
              return (
                <button key={p.val} onClick={() => setPayment(p.val)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", border: "none", background: "none", padding: "10px 2px", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                  <span style={{ width: 20, height: 20, borderRadius: 999, border: active ? "6px solid " + th.primaryBtn : "2px solid #d1d5db", flexShrink: 0, boxSizing: "border-box" }} />
                  <span style={{ fontSize: 14, fontWeight: active ? 900 : 600, color: active ? "#111827" : "#4b5563" }}>{t(p.labelKey)}</span>
                </button>
              );
            })}
          </div>
          <div style={css.section}>
            {[[t("checkoutSubtotal"), fmt(totals.total, lang), "#111827"], [t("checkoutDefendKcal"), "-" + cartKcal(cart).toLocaleString() + " kcal", "#ea580c"]].map(([k, v, c]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "4px 0" }}>
                <span style={{ color: "#6b7280" }}>{k}</span><strong style={{ color: c }}>{v}</strong>
              </div>
            ))}
          </div>
          <Footer th={th} t={t} onInfo={() => { setPage("order"); setShowInfoModal(true); }} onPrivacy={() => setPage("privacy")} />
        </div>
        {showReceipt && receiptData && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 21, background: "rgba(15,23,42,0.18)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
              <div style={{ width: "100%", maxWidth: 360, background: "#fff", borderRadius: 24, padding: "22px 20px 20px", boxShadow: "0 20px 50px rgba(15,23,42,0.18)", border: "1px solid rgba(226,232,240,0.9)", animation: "pop .25s ease" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 16, background: "linear-gradient(135deg,#dbeafe,#bfdbfe)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>💳</div>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 900, color: "#0f172a" }}>{t("receiptProcessing")}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{t("receiptProcessingBy", paymentLabel(receiptData.payment, t))}</div>
                  </div>
                </div>
                <div style={{ background: "#f8fafc", borderRadius: 18, padding: "14px 16px", border: "1px solid #e2e8f0", display: "grid", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13 }}>
                    <span style={{ color: "#64748b" }}>{t("receiptOrderer")}</span>
                    <strong style={{ color: "#0f172a" }}>{receiptData.customerName}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13 }}>
                    <span style={{ color: "#64748b" }}>{t("receiptPay")}</span>
                    <strong style={{ color: "#0f172a" }}>{paymentLabel(receiptData.payment, t)}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 14 }}>
                    <span style={{ color: "#64748b" }}>{t("receiptAmount")}</span>
                    <strong style={{ color: th.brand }}>{fmt(receiptData.total, lang)}</strong>
                  </div>
                </div>
                <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, color: "#2563eb", fontSize: 12, fontWeight: 800 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: "#2563eb", boxShadow: "0 0 0 6px rgba(37,99,235,0.14)" }} />
                  {t("receiptGoTrack")}
                </div>
              </div>
            </div>
            <div style={{ position: "fixed", left: "50%", bottom: 96, transform: "translateX(-50%)", width: "calc(100% - 32px)", maxWidth: 508, zIndex: 22 }}>
              <div style={{ background: "linear-gradient(180deg,#f0fdf4,#ffffff)", border: "1px solid #bbf7d0", boxShadow: "0 10px 30px rgba(22,101,52,0.10)", borderRadius: 18, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 22 }}>✅</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 900, color: "#166534" }}>{t("receiptAccepted")}</div>
                    <div style={{ fontSize: 12, color: "#166534", marginTop: 2 }}>{deliveryMode === "rabbit" ? t("receiptGoTrackRabbit") : t("receiptGoTrackTurtle")}</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        <div data-ad-clip="bottom" style={css.bottomBar}>
          <button
            onClick={simulateOrder}
            style={{ ...css.orderBtn, width: "100%", maxWidth: 540, padding: "16px", fontSize: 16, opacity: unmetMinOrders.length > 0 ? .5 : 1 }}
          >{t("placeOrderZero", fmt(totals.total, lang))}</button>
        </div>
      </div>
    );
  }

  // ── Home (order) tab & Duo (foldable / wide) 2-pane master–detail shell
  const homeAdHidden = !!(reviewTarget || showInfoModal || showSettings || (showAdminPanel && isAdminUid(uid)));
  const eventSlides = dict[lang]?.eventSlides || dict.ko.eventSlides;
  const activeDuoRestaurant = allRestaurants.find(x => x.id === detailId) || filtered[0] || allRestaurants[0] || null;
  const activeDuoTab = TAB_PAGES.includes(page) ? page : "order";
  const showDuoCart = duoRightMode === "cart" || page === "cart";

  const sharedModals = (
    <>
      {reviewModal}
      {infoModal}
      {optionTarget && optMenu && (
        <OptionSheet
          menu={optMenu}
          brand={th.primaryBtn}
          onClose={() => setOptionTarget(null)}
          onConfirm={({ spicy, size, toppings, qty, extraPrice, kcal }) =>
            addToCartDirect(optionTarget.rid, optionTarget.mid, qty, extraPrice, spicy, size, toppings, kcal)
          }
          t={t}
          lang={lang}
        />
      )}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          t={t}
          lang={lang}
          uid={uid}
          onToggleLang={toggleLang}
          onShowInfo={() => { setShowSettings(false); setShowInfoModal(true); }}
          onPrivacy={() => { setShowSettings(false); setPage("privacy"); }}
          deliveryTimeOverrides={deliveryTimeOverrides}
          onChangeDeliveryTime={handleChangeDeliveryTime}
        />
      )}
      {showSponsorModal && !showInfoModal && !isNativeApp && (
        <SponsorModal onClose={() => setShowSponsorModal(false)} t={t} th={th} />
      )}
      {showAdminPanel && isAdminUid(uid) && (
        <AdminPanel
          pendingRestaurants={pendingRestaurants}
          pendingMenus={pendingMenus}
          restaurantNameById={restaurantNameById}
          onApproveRestaurant={handleApproveRestaurant}
          onRejectRestaurant={handleRejectRestaurant}
          onApproveMenu={handleApproveMenu}
          onRejectMenu={handleRejectMenu}
          onClose={() => setShowAdminPanel(false)}
          t={t}
          lang={lang}
          th={th}
        />
      )}
    </>
  );

  const homeMasterBody = (
    <>
      <div data-ad-clip="top" className="lgBrandHeader" style={css.header}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, maxWidth: 540, margin: "0 auto", minHeight: 38 }}>
          <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center" }}>
            <div className="lgPillBtn" style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 38, padding: "0 14px 0 11px", borderRadius: 999, maxWidth: "100%" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={th.brandDark} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                <path d="M12 21s-6.5-5.2-6.5-11a6.5 6.5 0 1 1 13 0c0 5.8-6.5 11-6.5 11z" />
                <circle cx="12" cy="10" r="2.3" />
              </svg>
              <div style={{ fontSize: 15, fontWeight: 900, color: "#1c1917", lineHeight: 1.2, letterSpacing: -0.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {t("deliveryAddrValue")}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {isAdminUid(uid) && (
              <button
                onClick={() => setShowAdminPanel(true)}
                className="lgPillBtn"
                style={{ ...css.iconBtn, position: "relative" }}
                aria-label={t("adminIconAria")}
                title={t("adminIconAria")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1c1917" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3 5 6v6c0 4.5 3 7.8 7 9 4-1.2 7-4.5 7-9V6l-7-3z" />
                </svg>
                {(pendingRestaurants.length + pendingMenus.length) > 0 && (
                  <div style={{ position: "absolute", top: -3, right: -3, background: "#facc15", color: "#78350f", fontSize: 9, fontWeight: 900, borderRadius: 99, minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px", border: "1.5px solid #fff" }}>{pendingRestaurants.length + pendingMenus.length}</div>
                )}
              </button>
            )}
            <button onClick={() => showToast(t("bellEmpty"))} className="lgPillBtn" style={css.iconBtn} aria-label={t("bellAria")} title={t("bellAria")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1c1917" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 8.5-3 8.5h18s-3-1.5-3-8.5" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            {(!isDuo || duoBottomBar) && !edgeRail && (
              <button onClick={() => setShowSettings(true)} className="lgPillBtn" style={css.iconBtn} aria-label={t("settingsAria")} title={t("settingsTitle")}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1c1917" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <button
          onClick={() => setPage("search")}
          className="lgSearchPill"
          style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", maxWidth: 540, margin: "12px auto 0", borderRadius: 999, padding: "12px 16px", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#78716c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <span style={{ fontSize: 14, color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t("homeSearchPh")}</span>
        </button>
      </div>

      <div style={{ ...css.content, paddingBottom: isDuo ? duoBottomPadding(28) : tabBottomPadding }}>
        {orderInfo && (
          <div
            onClick={() => setPage("tracking")}
            style={{
              background: "linear-gradient(135deg," + mode.heroStart + "," + mode.heroEnd + ")",
              color: "#fff", borderRadius: 16, padding: "12px 14px",
              display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
              boxShadow: "0 8px 24px rgba(15,23,42,0.16)",
            }}
          >
            <div style={{ fontSize: 22, flexShrink: 0 }}>{mode.emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 900 }}>{t("activeOrderBannerTitle")}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", marginTop: 2 }}>{t("activeOrderBannerSub", trackStage < 2 ? t("cookingBottom") : td.eta)}</div>
            </div>
            <div style={{ fontSize: 18, flexShrink: 0 }}>→</div>
          </div>
        )}

        {history.length === 0 && !orderInfo && (
          <button
            onClick={() => listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              border: "1px solid #fed7aa", background: "#fff", color: "#9a3412",
              borderRadius: 16, padding: "12px 14px", fontSize: 13, fontWeight: 800,
              cursor: "pointer", fontFamily: "inherit", textAlign: "left",
              boxShadow: th.sectionShadow,
            }}
          >
            <span style={{ fontSize: 20, lineHeight: 1 }}>🐷</span>
            <span style={{ flex: 1, lineHeight: 1.35 }}>{t("homeNudge")}</span>
            <span style={{ color: "#ea580c", fontSize: 16, fontWeight: 900 }}>›</span>
          </button>
        )}

        <HomeEventCarousel slides={eventSlides} />

        <div style={{ ...css.section, padding: "14px 0" }}>
          <div className="noScrollbar" style={{ display: "flex", gap: 6, overflowX: "auto", scrollSnapType: "x proximity", padding: "0 12px", WebkitOverflowScrolling: "touch" }}>
            {categoryTabs.map(c => {
              const isActive = categoryFilter === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setCategoryFilter(c.key)}
                  style={{ flexShrink: 0, width: 58, scrollSnapAlign: "start", border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "2px 0" }}
                >
                  <span style={{
                    width: 50, height: 50, borderRadius: 16,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 25,
                    background: isActive ? th.activeBg : "#fafaf9",
                    border: "1.5px solid " + (isActive ? th.brand : "#f5f5f4"),
                    boxShadow: isActive ? "0 4px 10px rgba(249,115,22,0.16)" : "none",
                    transition: "background-color .15s, border-color .15s, box-shadow .15s",
                  }}>{c.emoji}</span>
                  <span style={{ fontSize: 11, fontWeight: isActive ? 900 : 700, color: isActive ? th.brandDark : "#57534e", whiteSpace: "nowrap", letterSpacing: -0.2 }}>{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div ref={listRef} style={{ scrollMarginTop: 140 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, letterSpacing: -0.3 }}>{t("homeListTitle")} <span className="tnum" style={{ color: th.brand }}>{t("homeListCount", filtered.length)}</span></h2>
            <button
              onClick={() => setPage("addContent")}
              style={{ border: "1px solid #fdba74", background: "#fff", color: th.brandDark, borderRadius: 999, padding: "7px 12px", fontWeight: 800, fontSize: 11.5, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", flexShrink: 0, boxShadow: "0 2px 6px rgba(249,115,22,0.08)" }}
            >{t("addContentBtn")}</button>
          </div>
          <div className="noScrollbar" style={{ display: "flex", gap: 7, overflowX: "auto", marginBottom: 14, paddingBottom: 2 }}>
            {SORT_OPTIONS.map(opt => {
              const isActive = sortBy === opt.val;
              return (
                <button
                  key={opt.val}
                  onClick={() => setSortBy(opt.val)}
                  style={{
                    flexShrink: 0, border: "1px solid " + (isActive ? th.brand : "#e7e5e4"),
                    background: isActive ? th.primaryBtn : "#fff",
                    color: isActive ? "#fff" : "#57534e",
                    borderRadius: 999, padding: "7px 13px", fontSize: 12, fontWeight: 800,
                    cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
                    boxShadow: isActive ? "0 4px 10px rgba(249,115,22,0.22)" : "none",
                  }}
                >{t(opt.labelKey)}</button>
              );
            })}
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 24, border: "1px dashed #d1d5db", borderRadius: 16, textAlign: "center", color: th.muted, background: "#fafafa", fontSize: 13, lineHeight: 1.6 }}>{t("noResults")}<br />{t("noResultsHint")}</div>
            ) : insertAt(filtered.map(r => (
              <RestaurantCard
                key={r.id} r={r} lang={lang} t={t} th={th}
                isFav={favorites.includes(r.id)} onToggleFav={toggleFavorite} onOpen={openRestaurant}
                reviewCount={reviewCountFor(r)}
                selected={isDuo && !showDuoCart && activeDuoRestaurant?.id === r.id}
              />
            )), 1, (
              <PlatformAd
                key="home-banner-ad"
                slot="homeBanner"
                width={320}
                height={100}
                label={adLabel}
                hidden={homeAdHidden}
                style={{ border: "1px solid " + th.line, borderRadius: 20, background: "#fff", padding: "12px 0 14px", overflow: "hidden" }}
              />
            ))}
          </div>
        </div>

        <Footer th={th} t={t} onInfo={() => setShowInfoModal(true)} onPrivacy={() => setPage("privacy")} />
      </div>
    </>
  );

  if (isDuo) {
    const duoMasterBottom = duoBottomPadding(28);
    const selectedId = !showDuoCart ? activeDuoRestaurant?.id : null;
    const leftPane = activeDuoTab === "search" ? (
      <SearchPage
        query={searchQuery} onQueryChange={setSearchQuery}
        restaurants={allRestaurants} lang={lang} t={t} th={th}
        favorites={favorites} onToggleFav={toggleFavorite} onOpen={openRestaurant}
        reviewCountFor={reviewCountFor} bottomPadding={duoMasterBottom}
        selectedId={selectedId} embedded
      />
    ) : activeDuoTab === "favorites" ? (
      <FavoritesPage
        restaurants={allRestaurants} favorites={favorites} lang={lang} t={t} th={th}
        onToggleFav={toggleFavorite} onOpen={openRestaurant} onBrowse={() => setPage("order")}
        reviewCountFor={reviewCountFor} bottomPadding={duoMasterBottom}
        selectedId={selectedId}
      />
    ) : activeDuoTab === "my" ? (
      <MySavingsPage
        th={th} t={t} lang={lang} uid={uid}
        history={history}
        allRestaurants={allRestaurants}
        onWriteReview={setReviewTarget}
        onClear={clearAllActivity}
        onInfo={() => setShowInfoModal(true)}
        onPrivacy={() => setPage("privacy")}
        bottomPadding={duoMasterBottom}
      />
    ) : homeMasterBody;

    return (
      <div className={nativeLiquidGlass && !edgeRail && !duoBottomBar ? "duoShell duoNativeRail" : "duoShell"} style={{ fontFamily: 'Inter,"Noto Sans KR",system-ui,sans-serif', color: th.text }}>
        <style>{globalStyle}</style>
        {sharedModals}
        {!nativeLiquidGlass && (
          <DuoNavRail
            active={activeDuoTab}
            cartCount={cartCount}
            cartActive={showDuoCart}
            onSelect={(tab) => { setPage(tab); }}
            onOpenCart={() => setDuoRightMode(prev => (prev === "cart" ? "restaurant" : "cart"))}
            onOpenSettings={() => setShowSettings(true)}
            t={t}
            th={th}
          />
        )}
        <div className="duoSplit">
          <div className="duoPane">{leftPane}</div>
          <div className="duoPane duoDetailPane">
            {showDuoCart ? (
              <CartPage
                embedded
                cart={cart} totals={totals} lang={lang} t={t} th={th}
                onBack={() => { setDuoRightMode("restaurant"); if (page === "cart") setPage(cartReturnPage); }}
                onChangeQty={changeQty} onRemove={removeCartItem} onClearAll={clearCart}
                onCheckout={() => setPage("checkout")}
                onBrowse={() => { setDuoRightMode("restaurant"); setPage("order"); }}
                unmetMinOrders={unmetMinOrders}
                buildOptLabel={(item) => buildOptLabel(item, t, lang)}
              />
            ) : activeDuoRestaurant ? (
              <RestaurantDetailPage
                embedded
                r={activeDuoRestaurant} lang={lang} t={t} th={th}
                onBack={() => setPage("order")}
                isFav={favorites.includes(activeDuoRestaurant.id)} onToggleFav={toggleFavorite}
                onAddMenu={(m) => openOption(activeDuoRestaurant.id, m.id)} addedMenuId={addedAnim}
                reviewCount={reviewCountFor(activeDuoRestaurant)} onOpenReviews={setReviewTarget}
                uid={uid} customMenuIds={customMenuIds}
                onDeleteMenu={handleDeleteMenu} onReportMenu={handleReportMenu}
                onDeleteRestaurant={handleDeleteRestaurant} onReportRestaurant={handleReportRestaurant}
                bottomPadding={duoBottomPadding(36)}
              />
            ) : null}
          </div>
        </div>
        <Toast message={toast} bottom={duoBottomPadding(20)} />
      </div>
    );
  }

  return (
    <div style={css.wrap}>
      <style>{globalStyle}</style>
      {sharedModals}
      {homeMasterBody}
      {tabChrome("order")}
    </div>
  );
}
