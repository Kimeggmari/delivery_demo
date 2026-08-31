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
  phone: "#fff7ed", text: "#431407", muted: "#c2410c", line: "#fed7aa",
  brand: "#f97316", brandDark: "#ea580c",
  headerStart: "#fb923c", headerEnd: "#f97316",
  heroStart: "#fb923c", heroEnd: "#f97316",
  primaryBtn: "#f97316",
  sectionShadow: "0 4px 20px rgba(249,115,22,0.08)",
  inputShadow: "0 2px 12px rgba(249,115,22,0.07)",
  bottomBarBg: "rgba(255,255,255,0.97)", bottomBarBorder: "rgba(254,215,170,1)",
  headerColor: "#fff", headerTextAlt: "rgba(255,255,255,0.75)",
  iconBtnBg: "rgba(255,255,255,0.18)", iconBtnColor: "#fff",
  headerBorderBottom: "none", activeBg: "#fff7ed",
};

export const deliveryModes = {
  rabbit: {
    key: "rabbit",
    label: { ko: "토끼배달", en: "Rabbit Delivery" },
    emoji: "🐇",
    etaStart: 8,
    intervalMs: 6000,
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
    etaStart: 30,
    intervalMs: 30000,
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
