import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import CoupangAdCard from "./components/CoupangAdCard";
import Footer from "./components/Footer";
import MenuImage from "./components/MenuImage";
import Stars from "./components/Stars";
import { getMenuImageSrc } from "./config/menuImages";
import { deliveryModes, SIZE_OPTIONS, SPICY_OPTIONS, SPICY_LABELS, themes } from "./config/ordering";
import { calcTotals, fmt } from "./lib/format";
import { dict, makeT, pick } from "./config/i18n";
import { restaurants } from "./config/restaurants";

const menuCalories = {
  c1: 1800, c2: 1650, c3: 320,
  r1: 750, r2: 820, r3: 480,
  p1: 680, p2: 620, p3: 280,
  g1: 520, g2: 430, g3: 180,
  h1: 550, h2: 620, h3: 700,
  cn1: 680, cn2: 1200, cn3: 720,
  b1: 580, b2: 420, b3: 380,
  cf1: 10, cf2: 450, cf3: 310, cf4: 280,
  ml1: 750, ml2: 920, ml3: 680,
  ic1: 520, ic2: 1200, ic3: 120, ic4: 380,
  gp1: 420, gp2: 480, gp3: 510,
  yt1: 620, yt2: 580, yt3: 450,
  su1: 650, su2: 380, su3: 310, su4: 650,
  hb1: 840, hb2: 1090, hb3: 410,
  piz1: 980, piz2: 1120, piz3: 360,
  tak1: 420, tak2: 560, tak3: 380, tak4: 820,
  bs1: 380, bs2: 450, bs3: 420, bs4: 350,
};

const thumbGradients = [
  "linear-gradient(135deg,#fef3c7,#fed7aa)",
  "linear-gradient(135deg,#dbeafe,#bfdbfe)",
  "linear-gradient(135deg,#ede9fe,#ddd6fe)",
  "linear-gradient(135deg,#dcfce7,#bbf7d0)",
  "linear-gradient(135deg,#fce7f3,#fbcfe8)",
  "linear-gradient(135deg,#fee2e2,#fecaca)",
  "linear-gradient(135deg,#ffedd5,#fed7aa)",
  "linear-gradient(135deg,#e0e7ff,#c7d2fe)",
  "linear-gradient(135deg,#fef9c3,#fde68a)",
  "linear-gradient(135deg,#cffafe,#a5f3fc)",
  "linear-gradient(135deg,#ffe4e6,#fda4af)",
  "linear-gradient(135deg,#f0fdf4,#bbf7d0)",
];

const badgeColors = {
  "인기": { bg: "#fee2e2", color: "#dc2626", border: "#fecaca" },
  "추천": { bg: "#dbeafe", color: "#2563eb", border: "#bfdbfe" },
  "신규": { bg: "#dcfce7", color: "#16a34a", border: "#bbf7d0" },
  "최저배달비": { bg: "#fef3c7", color: "#d97706", border: "#fde68a" },
};

const PAYMENT_OPTIONS = [
  { val: "카드", labelKey: "payCard" },
  { val: "간편결제", labelKey: "payEasy" },
  { val: "현장결제", labelKey: "payCash" },
];

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

function ReviewModal({ restaurant, onClose, t, lang }) {
  const reviews = dict[lang]?.sampleReviews || dict.ko.sampleReviews;
  const revs = reviews.slice(0, 3 + (restaurant.id % 3));
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: "20px 20px 32px", width: "100%", maxWidth: 540, maxHeight: "70vh", overflowY: "auto", animation: "slideUp .3s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>{restaurant.emoji} {pick(restaurant.name, lang)}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
              <span style={{ color: "#f59e0b" }}><Stars rating={restaurant.rating} size={14} /></span>
              <span style={{ fontWeight: 900, fontSize: 15 }}>{restaurant.rating}</span>
              <span style={{ color: "#9ca3af", fontSize: 12 }}>{t("reviewCountSuffix", restaurant.reviews)}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 12, border: "none", background: "#f3f4f6", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
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
      style={{
        position: "fixed", inset: 0, zIndex: 120,
        background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        padding: "0",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 540,
          background: "#fff",
          borderRadius: "24px 24px 0 0",
          padding: "24px 20px 40px",
          maxHeight: "92vh",
          overflowY: "auto",
          animation: "slideUp .3s ease",
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 99, background: "#e5e7eb", margin: "0 auto 20px" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.2 }}>{t("appName")} 🍱</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>{t("infoSubtitle")}</div>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 12, border: "none", background: "#f3f4f6", fontSize: 18, cursor: "pointer", flexShrink: 0 }}>✕</button>
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
      title: "1. Personal data we collect",
      content: (
        <>
          <p>FoodNeverArrives <strong>does not collect or store any personal data</strong> on a server.</p>
          <p>Anything you type on the checkout form (name, address, phone) is used only to render the screen during the current session — it never leaves your device.</p>
          <p>Refreshing or closing the app clears every field immediately.</p>
        </>
      ),
    },
    {
      title: "2. Cookies & ads",
      content: (
        <>
          <p>The Service may show ads via <strong>Google AdSense</strong>, which can use cookies or similar technologies to personalize them.</p>
          <p>See <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb" }}>Google's advertising policies</a> for details.</p>
          <p><strong>Coupang Partners</strong> referral ads may also appear; clicks or purchases through those links may earn a small commission, and Coupang may process some data per its own policies.</p>
        </>
      ),
    },
    {
      title: "3. Third-party services",
      content: (
        <>
          <p>This app is hosted on <strong>Vercel</strong>, which automatically captures basic server logs (IP, timestamps, browser info) per its own policy. The operator does not collect these directly.</p>
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
      title: "1. 수집하는 개인정보",
      content: (
        <>
          <p>음식만안와요는 <strong>어떠한 개인정보도 수집하거나 서버에 저장하지 않습니다.</strong></p>
          <p>주문서 작성 화면에서 입력하는 이름, 주소, 연락처 등의 정보는 해당 세션 내에서만 화면 표시 목적으로 사용되며, 외부 서버로 전송되거나 저장되지 않습니다.</p>
          <p>앱을 새로고침하거나 종료하면 입력된 모든 정보는 즉시 삭제됩니다.</p>
        </>
      ),
    },
    {
      title: "2. 쿠키 및 광고",
      content: (
        <>
          <p>본 서비스는 <strong>Google AdSense</strong>를 통해 광고를 제공할 수 있습니다. Google AdSense는 쿠키 또는 유사 기술을 사용하여 광고를 맞춤화할 수 있습니다.</p>
          <p>Google의 광고 쿠키 사용에 관한 자세한 내용은 <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb" }}>Google 광고 정책</a>을 참고하세요.</p>
          <p>또한 <strong>쿠팡파트너스</strong> 제휴 광고가 표시될 수 있으며, 해당 링크 클릭 또는 구매 시 운영자에게 소정의 수수료가 지급됩니다. 쿠팡파트너스 이용 과정에서 쿠팡의 정책에 따라 일부 데이터가 처리될 수 있습니다.</p>
        </>
      ),
    },
    {
      title: "3. 제3자 서비스",
      content: (
        <>
          <p>본 서비스는 <strong>Vercel</strong>을 통해 호스팅됩니다. Vercel은 서비스 운영을 위해 서버 접속 로그(IP 주소, 접속 시간, 브라우저 정보 등)를 자동으로 수집할 수 있습니다. 이는 서비스 운영자가 직접 수집하는 것이 아니며, Vercel의 개인정보처리방침에 따라 관리됩니다.</p>
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
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "linear-gradient(180deg," + th.headerStart + "," + th.headerEnd + ")", color: "#fff", padding: "14px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
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

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: "20px 20px 32px", width: "100%", maxWidth: 540, maxHeight: "80vh", overflowY: "auto", animation: "slideUp .25s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 14, minWidth: 0, flex: 1 }}>
            <MenuImage
              src={getMenuImageSrc(menu.id)}
              alt={pick(menu.name, lang)}
              width={96}
              height={96}
              borderRadius={18}
            />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 900, fontSize: 18 }}>{pick(menu.name, lang)}</div>
              <div style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>{pick(menu.desc, lang)}</div>
              <div style={{ color: "#10b981", fontSize: 12, fontWeight: 700, marginTop: 6 }}>🔥 {(menuCalories[menu.id] || 0).toLocaleString()}{t("kcal")}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 12, border: "none", background: "#f3f4f6", fontSize: 18, cursor: "pointer", flexShrink: 0 }}>✕</button>
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
              {SIZE_OPTIONS.map(s => (
                <div key={s.label} onClick={() => setSize(s.label)} style={{ padding: "12px 8px", borderRadius: 14, border: "2px solid " + (size === s.label ? brand : "#e5e7eb"), background: size === s.label ? brand + "18" : "#fff", textAlign: "center", cursor: "pointer", transition: ".15s" }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: size === s.label ? brand : "#374151" }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{s.price === 0 ? t("sizeBase") : (s.price > 0 ? "+" : "") + fmt(s.price, lang)}</div>
                </div>
              ))}
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
                return (
                  <div key={top.ko || top} onClick={() => toggleTopping(top)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: 14, border: "2px solid " + (sel ? brand : "#e5e7eb"), background: sel ? brand + "18" : "#fff", cursor: "pointer", transition: ".15s" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: sel ? brand : "#374151" }}>{toppingDisplay(top, lang)}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, color: "#10b981", fontWeight: 700 }}>{priceN ? "+" + fmt(priceN, lang) : ""}</span>
                      <div style={{ width: 22, height: 22, borderRadius: 8, background: sel ? brand : "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: sel ? "#fff" : "#9ca3af", transition: ".15s" }}>✓</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, padding: "14px 16px", background: "#f9fafb", borderRadius: 16 }}>
          <span style={{ fontWeight: 800, fontSize: 14 }}>{t("quantity")}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 34, height: 34, borderRadius: 10, border: "none", background: "#e5e7eb", fontWeight: 900, fontSize: 18, cursor: "pointer" }}>−</button>
            <span style={{ fontWeight: 900, fontSize: 16, minWidth: 24, textAlign: "center" }}>{qty}</span>
            <button onClick={() => setQty(q => q + 1)} style={{ width: 34, height: 34, borderRadius: 10, border: "none", background: "#e5e7eb", fontWeight: 900, fontSize: 18, cursor: "pointer" }}>＋</button>
          </div>
        </div>
        <button onClick={() => onConfirm({ spicy: opts.spicy ? spicy : null, size: opts.size ? size : null, toppings, qty, extraPrice: (opts.size ? sizeExtra : 0) + toppingExtra })}
          style={{ width: "100%", padding: "16px", background: brand, color: "#fff", border: "none", borderRadius: 16, fontWeight: 900, fontSize: 16, cursor: "pointer", fontFamily: "inherit" }}>
          {t("addCart")} · {fmt(totalPrice, lang)}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState("mint");
  const [deliveryMode, setDeliveryMode] = useState("rabbit");
  const [page, setPage] = useState("order");
  const [cart, setCart] = useState([]);
  const [payment, setPayment] = useState("카드");
  const [search, setSearch] = useState("");
  const [nm, setNm] = useState("");
  const [ph, setPh] = useState("");
  const [ad, setAd] = useState("");
  const [rq, setRq] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [trackState, setTrackState] = useState(0);
  const [orderInfo, setOrderInfo] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [optionTarget, setOptionTarget] = useState(null);
  const [addedAnim, setAddedAnim] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showSponsorModal, setShowSponsorModal] = useState(true);
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

  const t = useMemo(() => makeT(lang), [lang]);
  const inquiryEmail = "eggmari5713@gmail.com";
  const timersRef = useRef([]);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const [installed, setInstalled] = useState(() =>
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator.standalone === true
  );

  const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);

  useEffect(() => {
    const onBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    const onAppInstalled = () => {
      setInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const th = themes[theme];
  const mode = deliveryModes[deliveryMode];
  const totals = calcTotals(cart);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const clearTimers = useCallback(() => { timersRef.current.forEach(clearTimeout); timersRef.current = []; }, []);
  useEffect(() => () => clearTimers(), [clearTimers]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice?.outcome === "accepted") setInstalled(true);
    setDeferredPrompt(null);
    setCanInstall(false);
  };

  const openOption = (rid, mid) => {
    const r = restaurants.find(x => x.id === rid);
    const m = r.menus.find(x => x.id === mid);
    const opts = m.options || {};
    if (!opts.spicy && !opts.size && (!opts.toppings || opts.toppings.length === 0)) {
      addToCartDirect(rid, mid, 1, 0, null, null, []);
    } else {
      setOptionTarget({ rid, mid });
    }
  };

  const addToCartDirect = (rid, mid, qty, extraPrice, spicy, size, toppings) => {
    const r = restaurants.find(x => x.id === rid);
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
      }];
    });
    setAddedAnim(mid);
    setTimeout(() => setAddedAnim(null), 600);
    setOptionTarget(null);
  };

  const changeQty = (key, d) => setCart(prev => prev.map(x => x.cartKey === key ? { ...x, qty: x.qty + d } : x).filter(x => x.qty > 0));

  const resetAll = () => {
    clearTimers();
    setCart([]);
    setPayment("카드");
    setSearch("");
    setNm(""); setPh(""); setAd(""); setRq("");
    setShowReceipt(false);
    setReceiptData(null);
    setTrackState(0);
    setOrderInfo(null);
    setPage("order");
    setDeliveryMode("rabbit");
    setShowInfoModal(false);
  };

  const goToCheckout = () => {
    if (!cart.length) { alert(t("cartEmptyAlert")); return; }
    setPage("checkout");
  };

  const simulateOrder = () => {
    clearTimers();
    setShowReceipt(false);
    const info = { customerName: nm || (lang === "en" ? "Customer" : "주문자"), address: ad || (lang === "en" ? "No address provided" : "입력된 주소 없음"), phone: ph || (lang === "en" ? "No phone" : "연락처 없음"), request: rq || (lang === "en" ? "None" : "없음"), payment, total: totals.total, deliveryMode };
    timersRef.current.push(setTimeout(() => {
      setReceiptData(info);
      setShowReceipt(true);
      timersRef.current.push(setTimeout(() => {
        setOrderInfo(info);
        setTrackState(0);
        setPage("tracking");
        Array.from({ length: mode.etaStart }, (_, i) =>
          timersRef.current.push(setTimeout(() => setTrackState(i + 1), (i + 1) * mode.intervalMs))
        );
        timersRef.current.push(setTimeout(() => setPage("complete"), mode.etaStart * mode.intervalMs + mode.completeDelayMs));
      }, 1500));
    }, 900));
  };

  const trackData = Array.from({ length: mode.etaStart }, (_, i) => {
    const min = Math.max(1, mode.etaStart - i);
    const startPct = deliveryMode === "rabbit" ? 42 : 24;
    const stepPct = deliveryMode === "rabbit" ? 3.6 : 1.9;
    const startTop = deliveryMode === "rabbit" ? 40 : 30;
    const stepTop = deliveryMode === "rabbit" ? 2.2 : 1.25;
    const pct = startPct + i * stepPct;
    const isRabbit = deliveryMode === "rabbit";
    return {
      eta: min + t("minutes"),
      text: isRabbit
        ? (min > 4 ? t("trackRabbitFar") : min > 1 ? t("trackRabbitMid") : t("trackRabbitNear"))
        : (min > 10 ? t("trackTurtleFar") : min > 4 ? t("trackTurtleMid") : t("trackTurtleNear")),
      badge: isRabbit
        ? (min > 2 ? t("badgeRabbitFar") : t("badgeRabbitNear"))
        : (min > 5 ? t("badgeTurtleFar") : t("badgeTurtleNear")),
      bottom: isRabbit ? t("bottomRabbit", min) : t("bottomTurtle", min),
      riderLabel: isRabbit ? t("riderLabelRabbit", min) : t("riderLabelTurtle", min),
      activeText: isRabbit ? t("activeRabbit") : t("activeTurtle"),
      bp: [pct + "%", (startTop + i * stepTop) + "%"],
      finalDone: false,
    };
  }).concat([{
    eta: t("arrived"),
    text: deliveryMode === "rabbit" ? t("arrivedDemoRabbit") : t("arrivedDemoTurtle"),
    badge: t("deliveryDone"), bottom: t("deliveryDoneFull"), riderLabel: t("deliveredFinal"),
    activeText: deliveryMode === "rabbit" ? t("arrivedRabbit") : t("arrivedTurtle"),
    bp: ["84%", "76%"], finalDone: true,
  }]);

  const td = trackData[trackState] || trackData[0];

  const filtered = restaurants.filter(r => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const haystack = [
      pick(r.name, "ko"), pick(r.name, "en"),
      pick(r.category, "ko"), pick(r.category, "en"),
      ...r.menus.map(m => pick(m.name, "ko") + " " + pick(m.name, "en") + " " + pick(m.desc, "ko") + " " + pick(m.desc, "en")),
    ].join(" ").toLowerCase();
    return haystack.includes(q);
  });

  const css = {
    wrap: { minHeight: "100vh", background: th.phone, fontFamily: 'Inter,"Noto Sans KR",system-ui,sans-serif', color: th.text, display: "flex", flexDirection: "column" },
    header: { position: "sticky", top: 0, zIndex: 10, background: "linear-gradient(180deg," + th.headerStart + "," + th.headerEnd + ")", color: th.headerColor, padding: "14px 20px", borderBottom: th.headerBorderBottom, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
    content: { flex: 1, padding: "16px 16px 100px", display: "grid", gap: 16, alignContent: "start", maxWidth: 540, width: "100%", margin: "0 auto", boxSizing: "border-box" },
    section: { background: "#fff", borderRadius: 20, padding: 16, boxShadow: th.sectionShadow },
    input: { width: "100%", padding: "14px 16px", border: "none", outline: "none", borderRadius: 14, background: "#fff", color: th.text, boxShadow: th.inputShadow, fontFamily: "inherit", fontSize: 14, boxSizing: "border-box" },
    bottomBar: { position: "fixed", left: 0, right: 0, bottom: 0, background: th.bottomBarBg, borderTop: "1px solid " + th.bottomBarBorder, backdropFilter: "blur(14px)", boxShadow: "0 -4px 20px rgba(17,24,39,0.06)", padding: "12px 20px", display: "flex", justifyContent: "center", zIndex: 20 },
    bottomInner: { display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center", maxWidth: 540, width: "100%" },
    orderBtn: { border: "none", background: th.primaryBtn, color: "#fff", padding: "14px 20px", borderRadius: 16, fontSize: 14, fontWeight: 900, cursor: "pointer", minWidth: 140, boxShadow: "0 8px 20px " + th.primaryBtn + "44", fontFamily: "inherit" },
    iconBtn: { width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, background: th.iconBtnBg, fontSize: 16, color: th.iconBtnColor, border: "none", cursor: "pointer" },
    addBtn: { border: "none", background: th.brand, color: "#fff", borderRadius: 12, padding: "9px 12px", cursor: "pointer", fontWeight: 800, fontSize: 12, fontFamily: "inherit", transition: "all .15s" },
    backBtn: { width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, fontSize: 18, border: "none", cursor: "pointer" },
    langBtn: { border: "none", borderRadius: 10, background: "rgba(255,255,255,0.18)", color: th.headerColor, padding: "6px 10px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", fontSize: 11, letterSpacing: 0.5 },
  };

  const globalStyle = "@keyframes floatBike{0%,100%{transform:translate(-50%,-50%)}50%{transform:translate(-50%,calc(-50% - 8px))}} @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}} @keyframes pop{0%{transform:scale(1)}50%{transform:scale(1.2)}100%{transform:scale(1)}} *{box-sizing:border-box} body,html{margin:0;padding:0}";

  const optRestaurant = optionTarget ? restaurants.find(x => x.id === optionTarget.rid) : null;
  const optMenu = optRestaurant ? optRestaurant.menus.find(x => x.id === optionTarget.mid) : null;

  const toggleLang = () => setLang(prev => prev === "ko" ? "en" : "ko");
  const LangButton = (
    <button
      onClick={toggleLang}
      aria-label={t("langToggleAria")}
      title={t("langToggleAria")}
      style={css.langBtn}
    >
      {lang === "ko" ? "EN" : "한국어"}
    </button>
  );

  if (page === "privacy") {
    return (
      <>
        <style>{globalStyle}</style>
        <PrivacyPage onBack={() => setPage("order")} th={th} t={t} lang={lang} />
      </>
    );
  }

  if (page === "complete") {
    const savedKcal = cart.reduce((s, i) => s + (menuCalories[i.menuId] || 600) * i.qty, 0);
    return (
      <div style={{ ...css.wrap, alignItems: "center", justifyContent: "center", textAlign: "center", padding: "40px 24px" }}>
        <style>{globalStyle}</style>
        <div style={{ position: "absolute", top: 16, right: 16 }}>{LangButton}</div>
        <div style={{ fontSize: 72, marginBottom: 24, animation: "pop .5s ease" }}>{mode.emoji}</div>
        <h1 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 12px", color: th.text }}>{pick(mode.completeTitle, lang)}</h1>
        <div style={{ fontSize: 42, fontWeight: 900, color: th.brand, marginBottom: 8 }}>{savedKcal.toLocaleString()}{t("kcal")}</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: th.text, marginBottom: 32 }}>{t("completeSavedSuffix")}</div>
        <div style={{ fontSize: 13, color: th.muted, marginBottom: 28, lineHeight: 1.6 }}>
          {pick(mode.completeDesc, lang)}<br />{t("completeDemoNote")}
        </div>

        <CoupangAdCard th={th} t={t} />

        {installed ? (
          <div style={{ width: "100%", maxWidth: 340, marginBottom: 12, padding: "14px 20px", borderRadius: 16, background: "#dcfce7", border: "1px solid #bbf7d0", color: "#166534", fontWeight: 800, fontSize: 14 }}>
            {t("installedBadge")}
          </div>
        ) : canInstall ? (
          <button onClick={handleInstall} style={{ width: "100%", maxWidth: 340, marginBottom: 12, padding: "16px 20px", border: "none", borderRadius: 16, background: "linear-gradient(135deg," + th.heroStart + "," + th.heroEnd + ")", color: "#fff", fontWeight: 900, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
            {t("installBtn")}
          </button>
        ) : isIos && !installed ? (
          <div style={{ width: "100%", maxWidth: 340, marginBottom: 16, padding: "14px 16px", borderRadius: 16, background: "#f0f9ff", border: "1px solid #bae6fd", color: "#0369a1", fontSize: 12, fontWeight: 700, lineHeight: 1.7, textAlign: "left" }}>
            {t("iosInstallHint")}
          </div>
        ) : null}

        <button onClick={resetAll} style={{ ...css.orderBtn, fontSize: 16, padding: "16px 32px", marginTop: 4 }}>
          {t("goHome")}
        </button>

        <Footer th={th} t={t} onInfo={() => { resetAll(); setShowInfoModal(true); }} onPrivacy={() => setPage("privacy")} />
      </div>
    );
  }

  if (page === "tracking") {
    return (
      <div style={css.wrap}>
        <style>{globalStyle}</style>
        <div style={css.header}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, maxWidth: 540, margin: "0 auto" }}>
            <button onClick={() => { clearTimers(); setPage("order"); }} style={{ ...css.backBtn, background: th.iconBtnBg, color: th.iconBtnColor }}>←</button>
            <div style={{ flex: 1, textAlign: "center" }}><h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>{pick(mode.label, lang)} {t("trackingTitlePrefix")} {mode.emoji}</h2></div>
            {LangButton}
          </div>
        </div>
        <div style={css.content}>
          <div style={{ background: "linear-gradient(135deg,#fff7ed,#ffedd5)", border: "1px solid #fdba74", color: "#9a3412", padding: "12px 14px", borderRadius: 16, fontSize: 12, fontWeight: 800, lineHeight: 1.45 }}>
            {t("demoTrackBanner")}
          </div>
          <div style={{ background: "linear-gradient(180deg,#dff7ea 0%,#ecfeff 100%)", borderRadius: 20, padding: 18, minHeight: 220, position: "relative", overflow: "hidden", border: "1px solid #d1fae5" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.45) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.45) 1px,transparent 1px)", backgroundSize: "34px 34px", opacity: .8 }} />
            {[{ w: 240, h: 14, t: 56, l: 40, rot: "8deg" }, { w: 16, h: 180, t: 24, r: 76 }, { w: 190, h: 12, b: 54, l: 56, rot: "-18deg" }].map((rd, i) => (
              <div key={i} style={{ position: "absolute", background: "rgba(148,163,184,0.35)", borderRadius: 999, width: rd.w, height: rd.h, top: rd.t, left: rd.l, right: rd.r, bottom: rd.b, transform: rd.rot ? "rotate(" + rd.rot + ")" : undefined }} />
            ))}
            <div style={{ position: "absolute", zIndex: 2, width: 46, height: 46, borderRadius: "50%", background: "#fff", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 24px rgba(15,23,42,0.12)", top: 24, left: 34 }}>🏪</div>
            <div style={{ position: "absolute", zIndex: 2, width: 46, height: 46, borderRadius: "50%", background: "#fff", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 24px rgba(15,23,42,0.12)", right: 30, bottom: 30 }}>🏠</div>
            <div style={{ position: "absolute", zIndex: 2, width: 54, height: 54, borderRadius: "50%", background: "#111827", color: "#fff", fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 24px rgba(15,23,42,0.12)", left: td.bp[0], top: td.bp[1], transform: "translate(-50%,-50%)", transition: "left .8s ease,top .8s ease", animation: "floatBike 2.2s ease-in-out infinite" }}>{mode.mapIcon}</div>
            <div style={{ position: "absolute", zIndex: 2, background: "rgba(255,255,255,0.86)", color: "#0f172a", borderRadius: 999, padding: "7px 10px", fontSize: 11, fontWeight: 800, top: 76, left: 22 }}>{t("storeReady")}</div>
            <div style={{ position: "absolute", zIndex: 2, background: "rgba(255,255,255,0.86)", color: "#0f172a", borderRadius: 999, padding: "7px 10px", fontSize: 11, fontWeight: 800, right: 18, bottom: 82 }}>{(orderInfo?.customerName || t("address")) + (t("customerSuffix") ? " " + t("customerSuffix") : "")}</div>
            <div style={{ position: "absolute", zIndex: 2, background: "rgba(255,255,255,0.86)", color: "#0f172a", borderRadius: 999, padding: "7px 10px", fontSize: 11, fontWeight: 800, left: "50%", top: "68%", transform: "translateX(-50%)" }}>{td.riderLabel}</div>
          </div>
          <div style={{ background: "linear-gradient(135deg," + mode.heroStart + "," + mode.heroEnd + ")", color: "#fff", borderRadius: 20, padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 30, fontWeight: 900, lineHeight: 1 }}>{td.eta}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.84)", marginTop: 6 }}>{td.text}</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 14, padding: "10px 12px", fontSize: 12, fontWeight: 800, whiteSpace: "nowrap" }}>{td.badge}</div>
            </div>
          </div>
          <div style={css.section}>
            <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 4 }}>{t("riderTitle")}</div>
            <div style={{ fontSize: 12, color: th.muted, marginBottom: 12 }}>{t("riderExample")}</div>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "center" }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: "#111827", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{deliveryMode === "rabbit" ? "🐇" : "🐢"}</div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 15 }}>{deliveryMode === "rabbit" ? t("riderRabbit") : t("riderTurtle")}</div>
                <div style={{ color: th.muted, fontSize: 12 }}>{deliveryMode === "rabbit" ? t("riderRabbitDesc") : t("riderTurtleDesc")}</div>
              </div>
              <button style={{ border: "none", borderRadius: 12, background: "#eef2ff", color: "#3730a3", padding: "10px 12px", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>{t("riderCall")}</button>
            </div>
          </div>
          <div style={css.section}>
            <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 12 }}>{t("progressTitle")}</div>
            <div style={{ display: "grid", gap: 10 }}>
              {(dict[lang]?.progressSteps || dict.ko.progressSteps).map((label, i) => {
                const done = i < 2 || (td.finalDone && i === 2);
                const active = (!td.finalDone && i === 2) || (td.finalDone && i === 3);
                return (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 12, alignItems: "start" }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", marginTop: 2, background: done || active ? th.primaryBtn : "#d1d5db", boxShadow: active ? "0 0 0 6px " + th.primaryBtn + "28" : "none", transition: ".3s" }} />
                    <div>
                      <strong style={{ display: "block", fontSize: 14, marginBottom: 4 }}>{label}</strong>
                      <span style={{ color: th.muted, fontSize: 12 }}>
                        {i === 2 ? td.activeText : i === 3 ? (td.finalDone ? t("progressArrived") : t("progressArriving")) : i === 0 ? t("progressStep0Desc") : t("progressStep1Desc")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {orderInfo && (
            <div style={css.section}>
              <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 12 }}>{t("orderSummaryTitle")}</div>
              {[
                [t("sumOrderer"), orderInfo.customerName],
                [t("sumAddress"), orderInfo.address],
                [t("sumMode"), pick(deliveryModes[orderInfo.deliveryMode]?.label || mode.label, lang)],
                [t("sumPay"), paymentLabel(orderInfo.payment, t)],
                [t("sumTotal"), fmt(orderInfo.total, lang)],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: th.muted }}>{k}</span><strong>{v}</strong>
                </div>
              ))}
            </div>
          )}
          <Footer th={th} t={t} onInfo={() => { clearTimers(); setPage("order"); setShowInfoModal(true); }} onPrivacy={() => setPage("privacy")} />
        </div>
        <div style={css.bottomBar}>
          <div style={css.bottomInner}>
            <div><span style={{ fontSize: 11, color: th.muted, fontWeight: 700 }}>{t("currentStatus")}</span><br /><strong style={{ fontSize: 18, fontWeight: 900 }}>{td.bottom}</strong></div>
            <button onClick={resetAll} style={{ ...css.orderBtn, minWidth: "auto", padding: "12px 18px", boxShadow: "none" }}>{t("goHome")}</button>
          </div>
        </div>
      </div>
    );
  }

  if (page === "checkout") {
    return (
      <div style={css.wrap}>
        <style>{globalStyle}</style>
        {reviewTarget && <ReviewModal restaurant={reviewTarget} onClose={() => setReviewTarget(null)} t={t} lang={lang} />}
        <div style={css.header}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, maxWidth: 540, margin: "0 auto" }}>
            <button onClick={() => setPage("order")} style={{ ...css.backBtn, background: th.iconBtnBg, color: th.iconBtnColor }}>←</button>
            <div style={{ flex: 1, textAlign: "center" }}><h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>{t("checkoutTitle")}</h2></div>
            {LangButton}
          </div>
        </div>
        <div style={css.content}>
          <div style={css.section}>
            <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 12 }}>{t("orderItemsTitle", cartCount)}</div>
            <div style={{ display: "grid", gap: 8 }}>
              {cart.map(item => {
                const label = buildOptLabel(item, t, lang);
                return (
                <div key={item.cartKey} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center", padding: 13, background: "#f9fafb", border: "1px solid #edf0f3", borderRadius: 16 }}>
                  <div>
                    <h4 style={{ margin: "0 0 2px", fontWeight: 900, fontSize: 14 }}>{pick(item.name, lang)}</h4>
                    {label && <div style={{ fontSize: 11, color: th.brand, fontWeight: 700, marginBottom: 2 }}>{label}</div>}
                    <div style={{ color: th.muted, fontSize: 12 }}>{pick(item.restaurantName, lang)}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                      <button onClick={() => changeQty(item.cartKey, -1)} style={{ width: 30, height: 30, borderRadius: 10, border: "none", background: "#e5e7eb", cursor: "pointer", fontWeight: 900, fontFamily: "inherit", fontSize: 15 }}>−</button>
                      <strong style={{ fontSize: 14, minWidth: 20, textAlign: "center" }}>{item.qty}</strong>
                      <button onClick={() => changeQty(item.cartKey, 1)} style={{ width: 30, height: 30, borderRadius: 10, border: "none", background: "#e5e7eb", cursor: "pointer", fontWeight: 900, fontFamily: "inherit", fontSize: 15 }}>＋</button>
                    </div>
                  </div>
                  <div style={{ fontWeight: 900, whiteSpace: "nowrap", fontSize: 15, color: th.text }}>{fmt(item.price * item.qty, lang)}</div>
                </div>
              );})}
            </div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid " + th.line, display: "grid", gap: 5 }}>
              {[[t("productPrice"), fmt(totals.sub, lang)], [t("deliveryFee"), fmt(totals.del, lang)], [t("serviceFee"), fmt(totals.svc, lang)]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: th.muted }}><span>{k}</span><strong style={{ color: th.text }}>{v}</strong></div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 17, fontWeight: 900, marginTop: 4, paddingTop: 8, borderTop: "1px solid " + th.line }}><span>{t("totalLabel")}</span><strong style={{ color: th.brand }}>{fmt(totals.total, lang)}</strong></div>
              <div style={{ fontSize: 13, color: th.brand, fontWeight: 800, marginTop: 6 }}>{t("selectedDelivery")} {mode.emoji} {pick(mode.label, lang)}</div>
            </div>
          </div>
          <div style={css.section}>
            <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 12 }}>{t("deliveryInfoTitle")}</div>
            <div style={{ display: "grid", gap: 10 }}>
              {[[t("recipient"), nm, setNm, t("namePh")], [t("phone"), ph, setPh, t("phonePh")], [t("address"), ad, setAd, t("addressPh")]].map(([label, val, setter, placeholder]) => (
                <div key={label} style={{ display: "grid", gap: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 800, color: "#374151" }}>{label}</label>
                  <input value={val} onChange={e => setter(e.target.value)} placeholder={placeholder} style={css.input} />
                </div>
              ))}
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 800, color: "#374151" }}>{t("request")}</label>
                <textarea value={rq} onChange={e => setRq(e.target.value)} placeholder={t("requestPh")} style={{ width: "100%", border: "1px solid " + th.line, borderRadius: 14, padding: "14px 16px", resize: "vertical", minHeight: 80, outline: "none", background: "#fff", fontFamily: "inherit", fontSize: 14, boxSizing: "border-box" }} />
              </div>
            </div>
          </div>
          <div style={css.section}>
            <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 12 }}>{t("paymentTitle")}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {PAYMENT_OPTIONS.map(p => (
                <div key={p.val} onClick={() => setPayment(p.val)} style={{ border: "1.5px solid " + (payment === p.val ? th.brand : th.line), borderRadius: 14, padding: "14px 8px", textAlign: "center", cursor: "pointer", fontWeight: 800, background: payment === p.val ? th.activeBg : "#fff", color: payment === p.val ? th.brandDark : th.text, fontSize: 12, transition: ".2s" }}>{t(p.labelKey)}</div>
              ))}
            </div>
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
            <div style={{ position: "fixed", left: "50%", bottom: 86, transform: "translateX(-50%)", width: "calc(100% - 32px)", maxWidth: 508, zIndex: 22 }}>
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
        <div style={css.bottomBar}>
          <div style={css.bottomInner}>
            <div><span style={{ fontSize: 11, color: th.muted, fontWeight: 700 }}>{t("totalLabel")}</span><br /><strong style={{ fontSize: 18, fontWeight: 900, color: th.brand }}>{fmt(totals.total, lang)}</strong></div>
            <button onClick={simulateOrder} style={css.orderBtn}>{t("placeOrder")}</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main order page
  return (
    <div style={css.wrap}>
      <style>{globalStyle}</style>
      {reviewTarget && <ReviewModal restaurant={reviewTarget} onClose={() => setReviewTarget(null)} t={t} lang={lang} />}
      {showInfoModal && (
        <InfoModal
          email={inquiryEmail}
          onClose={() => setShowInfoModal(false)}
          onPrivacy={() => { setShowInfoModal(false); setPage("privacy"); }}
          t={t}
          lang={lang}
        />
      )}
      {showSponsorModal && !showInfoModal && (
        <SponsorModal onClose={() => setShowSponsorModal(false)} t={t} th={th} />
      )}
      {optionTarget && optMenu && (
        <OptionSheet
          menu={optMenu}
          brand={th.primaryBtn}
          onClose={() => setOptionTarget(null)}
          onConfirm={({ spicy, size, toppings, qty, extraPrice }) =>
            addToCartDirect(optionTarget.rid, optionTarget.mid, qty, extraPrice, spicy, size, toppings)
          }
          t={t}
          lang={lang}
        />
      )}
      <div style={css.header}>
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, maxWidth: 540, margin: "0 auto", minHeight: 32 }}>
          <div style={{ display: "flex", gap: 4, zIndex: 1 }}>
            {[["purple","💜"],["mint","🧡"],["blue","💙"],["pink","🩵"]].map(([key, emoji]) => (
              <button key={key} onClick={() => setTheme(key)} style={{ ...css.iconBtn, width: 28, height: 28, fontSize: 11, opacity: theme === key ? 1 : 0.5, border: theme === key ? "2px solid rgba(255,255,255,0.8)" : "2px solid transparent" }}>{emoji}</button>
            ))}
          </div>
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none", width: "max-content" }}>
            <div style={{ fontSize: 11, color: th.headerTextAlt }}>{t("deliveryAddrLabel")}</div>
            <div style={{ fontSize: 15, fontWeight: 900 }}>{t("deliveryAddrValue")}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, zIndex: 1 }}>
            <div style={{ position: "relative" }}>
              <button style={{ ...css.iconBtn, width: 32, height: 32, fontSize: 14 }} aria-label={t("cartIconAria")}>🛒</button>
              {cartCount > 0 && (
                <div style={{ position: "absolute", top: -4, right: -4, background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 900, borderRadius: 99, minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>{cartCount}</div>
              )}
            </div>
            <button onClick={() => setShowInfoModal(true)} style={{ ...css.iconBtn, width: 32, height: 32, fontSize: 14, fontWeight: 900 }} aria-label={t("appInfoAria")} title={t("appInfoTitle")}>?</button>
            {LangButton}
            <button onClick={resetAll} style={{ border: "none", borderRadius: 10, background: "rgba(255,255,255,0.14)", color: th.headerColor, padding: "6px 10px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", fontSize: 11 }}>{t("reset")}</button>
          </div>
        </div>
        <div style={{ maxWidth: 540, margin: "8px auto 0" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("searchPlaceholder")} style={css.input} />
        </div>
      </div>

      <div style={css.content}>
        <div style={{ background: "linear-gradient(135deg,#fff7ed,#ffedd5)", border: "1px solid #fdba74", color: "#9a3412", padding: "12px 14px", borderRadius: 16, fontSize: 12, fontWeight: 800, lineHeight: 1.45 }}>
          {t("demoBanner")}
        </div>

        <div style={css.section}>
          <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 12 }}>{t("deliveryTypeTitle")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {Object.values(deliveryModes).map((m) => {
              const active = deliveryMode === m.key;
              return (
                <button key={m.key} onClick={() => setDeliveryMode(m.key)} style={{ border: active ? "2px solid " + th.brand : "1px solid " + th.line, background: active ? th.activeBg : "#fff", borderRadius: 16, padding: "14px 12px", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{m.emoji}</div>
                  <div style={{ fontWeight: 900, fontSize: 15 }}>{pick(m.label, lang)}</div>
                  <div style={{ fontSize: 12, color: th.muted, marginTop: 4 }}>{m.key === "rabbit" ? t("fastDeliveryDesc") : t("slowDeliveryDesc")}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div style={css.section}>
          <div style={{ marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>{t("restaurantsTitle", filtered.length)}</h2>
            <div style={{ fontSize: 12, color: th.muted, marginTop: 4 }}>{t("restaurantsSub")}</div>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 24, border: "1px dashed #d1d5db", borderRadius: 16, textAlign: "center", color: th.muted, background: "#fafafa", fontSize: 13, lineHeight: 1.6 }}>{t("noResults")}<br />{t("noResultsHint")}</div>
            ) : filtered.map((r, ri) => {
              const badgeKey = r.badge?.ko || "";
              const badgeText = pick(r.badge, lang);
              const bColor = badgeColors[badgeKey];
              return (
              <div key={r.id} style={{ border: "1px solid " + th.line, borderRadius: 20, overflow: "hidden", background: "#fff" }}>
                <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, background: thumbGradients[ri % thumbGradients.length], position: "relative" }}>
                  {r.emoji}
                  {badgeText && bColor && (
                    <div style={{ position: "absolute", top: 10, left: 10, fontSize: 11, padding: "5px 10px", borderRadius: 999, background: bColor.bg, color: bColor.color, border: "1px solid " + bColor.border, fontWeight: 800 }}>{badgeText}</div>
                  )}
                </div>
                <div style={{ padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>{pick(r.name, lang)}</h3>
                    <div style={{ fontSize: 11, padding: "5px 9px", borderRadius: 999, background: "#f3f4f6", color: "#374151", fontWeight: 800, whiteSpace: "nowrap" }}>{pick(r.category, lang)}</div>
                  </div>
                  <div onClick={() => setReviewTarget(r)} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, cursor: "pointer", padding: "4px 0" }}>
                    <span style={{ color: "#f59e0b" }}><Stars rating={r.rating} /></span>
                    <span style={{ fontWeight: 800, fontSize: 13 }}>{r.rating}</span>
                    <span style={{ color: th.muted, fontSize: 12 }}>{t("reviewCountSuffix", r.reviews)}</span>
                    <span style={{ color: th.brand, fontSize: 11, fontWeight: 700 }}>{t("seeReviews")}</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, color: th.muted, fontSize: 12, marginBottom: 10 }}>
                    <span>⏱ {r.time}{t("minutes")}</span><span>🚚 {fmt(r.fee, lang)}</span>
                  </div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {r.menus.map(m => {
                      const hasOpts = m.options && (m.options.spicy || m.options.size || (m.options.toppings && m.options.toppings.length > 0));
                      return (
                        <div key={m.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center", padding: 12, border: "1px solid " + th.line, borderRadius: 14, background: "#fcfcfd" }}>
                          <div style={{ display: "flex", gap: 12, minWidth: 0 }}>
                            <MenuImage
                              src={getMenuImageSrc(m.id)}
                              alt={pick(m.name, lang)}
                              width={88}
                              height={88}
                              borderRadius={14}
                            />
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 800, marginBottom: 3, fontSize: 14 }}>{pick(m.name, lang)}</div>
                              <div style={{ color: th.muted, fontSize: 12 }}>{pick(m.desc, lang)}</div>
                              <div style={{ color: "#10b981", fontSize: 11, fontWeight: 700, marginTop: 2 }}>🔥 {(menuCalories[m.id] || 0).toLocaleString()}{t("kcal")}</div>
                              {hasOpts && <div style={{ fontSize: 10, color: th.brand, fontWeight: 700, marginTop: 3 }}>{t("optionAvail")}</div>}
                            </div>
                          </div>
                          <div style={{ display: "grid", justifyItems: "end", gap: 6 }}>
                            <div style={{ fontWeight: 900, whiteSpace: "nowrap", fontSize: 14 }}>{fmt(m.price, lang)}</div>
                            <button onClick={() => openOption(r.id, m.id)} style={{ ...css.addBtn, animation: addedAnim === m.id ? "pop .3s ease" : "none" }}>
                              {addedAnim === m.id ? t("added") : t("add")}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  </div>
                </div>
            );})}
          </div>
        </div>

        <Footer th={th} t={t} onInfo={() => setShowInfoModal(true)} onPrivacy={() => setPage("privacy")} />
      </div>

      <div style={css.bottomBar}>
        <div style={css.bottomInner}>
          <div><span style={{ fontSize: 11, color: th.muted, fontWeight: 700 }}>{t("totalLabel")}</span><br /><strong style={{ fontSize: 18, fontWeight: 900, color: cart.length ? th.brand : th.text }}>{fmt(totals.total, lang)}</strong></div>
          <button onClick={goToCheckout} style={{ ...css.orderBtn, opacity: cart.length ? 1 : .5 }}>{t("orderBtn")} {cartCount > 0 ? "(" + cartCount + ")" : ""}</button>
        </div>
      </div>
    </div>
  );
}
