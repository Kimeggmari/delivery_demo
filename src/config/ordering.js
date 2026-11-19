export const SPICY_OPTIONS = ["순한맛", "보통", "매운맛"];

export const SPICY_LABELS = {
  ko: { "순한맛": "순한맛", "보통": "보통", "매운맛": "매운맛" },
  en: { "순한맛": "Mild", "보통": "Medium", "매운맛": "Hot" },
};

export const SIZE_OPTIONS = [
  { label: "Small", price: -1000 },
  { label: "Regular", price: 0 },
  { label: "Large", price: 1500 },
];

export const theme = {
  phone: "#fff7ed", text: "#1c1917", muted: "#78716c", line: "#fed7aa",
  cardBorder: "rgba(254, 215, 170, 0.72)",
  brand: "#f97316", brandDark: "#ea580c",
  headerStart: "#fb923c", headerEnd: "#f97316",
  heroStart: "#fb923c", heroEnd: "#f97316",
  primaryBtn: "#f97316",
  sectionShadow: "0 4px 18px rgba(28, 25, 23, 0.05), 0 1px 3px rgba(249, 115, 22, 0.04)",
  inputShadow: "0 4px 14px rgba(154, 52, 18, 0.12)",
  bottomBarBg: "rgba(255,255,255,0.97)", bottomBarBorder: "rgba(254,215,170,0.65)",
  headerColor: "#fff", headerTextAlt: "rgba(255,255,255,0.8)",
  iconBtnBg: "rgba(255,255,255,0.2)", iconBtnColor: "#fff",
  headerBorderBottom: "none", activeBg: "#ffedd5",
};

export const RABBIT_SURCHARGE = 1000;

export const deliveryModes = {
  rabbit: {
    key: "rabbit",
    label: { ko: "토끼배달", en: "Rabbit Delivery" },
    emoji: "🐇",
    // Settings-adjustable delivery time, in real seconds (see SettingsModal) —
    // stepSeconds is both the slider increment and the tick granularity, so
    // the on-screen countdown genuinely runs in real time, not compressed.
    // Default kept short (close to the old compressed-simulation length) so a
    // fresh install completes an order quickly — Play Store review tests a
    // fresh install and won't wait minutes for the flow to finish. Users can
    // still slide it up to maxSeconds themselves.
    stepSeconds: 30, minSeconds: 30, maxSeconds: 900, defaultSeconds: 60,
    completeDelayMs: 1500,
    badge: { ko: "급행", en: "Express" },
    heroStart: "#f97316",
    heroEnd: "#ea580c",
    completeTitle: { ko: "토끼배달 완료!", en: "Rabbit Delivery complete!" },
    completeDesc: {
      ko: "번개처럼 빠르게 도착한 컨셉의 데모예요 ⚡",
      en: "A demo where everything arrives like lightning ⚡",
    },
  },
  turtle: {
    key: "turtle",
    label: { ko: "거북이배달", en: "Turtle Delivery" },
    emoji: "🐢",
    stepSeconds: 300, minSeconds: 300, maxSeconds: 3600, defaultSeconds: 900,
    completeDelayMs: 2500,
    badge: { ko: "여유", en: "Easy" },
    heroStart: "#16a34a",
    heroEnd: "#15803d",
    completeTitle: { ko: "거북이배달 완료!", en: "Turtle Delivery complete!" },
    completeDesc: {
      ko: "천천히 하지만 꾸준히 오는 컨셉의 데모예요 🌿",
      en: "A demo where the courier strolls in slow but sure 🌿",
    },
  },
};
