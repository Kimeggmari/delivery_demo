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

export const themes = {
  purple: {
    phone: "#faf8ff", text: "#1e1040", muted: "#7c6fa0", line: "#ede8f8",
    brand: "#7c3aed", brandDark: "#6d28d9",
    headerStart: "#7c3aed", headerEnd: "#6d28d9",
    heroStart: "#7c3aed", heroEnd: "#a855f7",
    primaryBtn: "#7c3aed",
    sectionShadow: "0 4px 20px rgba(124,58,237,0.08)",
    inputShadow: "0 2px 12px rgba(124,58,237,0.08)",
    bottomBarBg: "rgba(255,255,255,0.97)", bottomBarBorder: "rgba(237,232,248,1)",
    headerColor: "#fff", headerTextAlt: "rgba(255,255,255,0.75)",
    iconBtnBg: "rgba(255,255,255,0.18)", iconBtnColor: "#fff",
    headerBorderBottom: "none", activeBg: "#f3eeff",
  },
  mint: {
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
  },
  blue: {
    phone: "#f5f8ff", text: "#0f1e40", muted: "#5a7aa0", line: "#dbeafe",
    brand: "#2563eb", brandDark: "#1d4ed8",
    headerStart: "#2563eb", headerEnd: "#1d4ed8",
    heroStart: "#2563eb", heroEnd: "#1d4ed8",
    primaryBtn: "#2563eb",
    sectionShadow: "0 4px 20px rgba(37,99,235,0.08)",
    inputShadow: "0 2px 12px rgba(37,99,235,0.07)",
    bottomBarBg: "rgba(255,255,255,0.97)", bottomBarBorder: "rgba(219,234,254,1)",
    headerColor: "#fff", headerTextAlt: "rgba(255,255,255,0.75)",
    iconBtnBg: "rgba(255,255,255,0.18)", iconBtnColor: "#fff",
    headerBorderBottom: "none", activeBg: "#eff6ff",
  },
  pink: {
    phone: "#f7fbfa", text: "#0d2320", muted: "#5a8a80", line: "#d4f0ea",
    brand: "#0ea768", brandDark: "#0d9460",
    headerStart: "#15d3b4", headerEnd: "#0ea768",
    heroStart: "#15d3b4", heroEnd: "#0ea768",
    primaryBtn: "#0ea768",
    sectionShadow: "0 4px 20px rgba(14,167,104,0.08)",
    inputShadow: "0 2px 12px rgba(14,167,104,0.07)",
    bottomBarBg: "rgba(255,255,255,0.97)", bottomBarBorder: "rgba(212,240,234,1)",
    headerColor: "#fff", headerTextAlt: "rgba(255,255,255,0.75)",
    iconBtnBg: "rgba(255,255,255,0.18)", iconBtnColor: "#fff",
    headerBorderBottom: "none", activeBg: "#ecfdf5",
  },
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
    mapIcon: "🐇",
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
    mapIcon: "🐢",
    completeTitle: { ko: "거북이배달 완료!", en: "Turtle Delivery complete!" },
    completeDesc: {
      ko: "천천히 하지만 꾸준히 오는 컨셉의 데모예요 🌿",
      en: "A demo where the courier strolls in slow but sure 🌿",
    },
  },
};
