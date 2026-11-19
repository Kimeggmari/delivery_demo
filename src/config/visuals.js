import { pick } from "./i18n";

// Shared visual constants for restaurant cards and detail screens.

export const thumbGradients = [
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

export const badgeColors = {
  "인기": { bg: "#fee2e2", color: "#dc2626", border: "#fecaca" },
  "추천": { bg: "#dbeafe", color: "#2563eb", border: "#bfdbfe" },
  "신규": { bg: "#dcfce7", color: "#16a34a", border: "#bbf7d0" },
  "최저배달비": { bg: "#fef3c7", color: "#d97706", border: "#fde68a" },
};

// Gradient per restaurant, keyed by id so a restaurant keeps its color
// across the list, search results and its detail page.
export function gradientFor(restaurant) {
  const key = String(restaurant?.id ?? "");
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 33 + key.charCodeAt(i)) >>> 0;
  return thumbGradients[h % thumbGradients.length];
}

// One-line pitch shown on restaurant cards and the detail page.
export const restaurantTaglines = {
  1: { ko: "바삭함은 상상 속에만, 실제 지방 0g 보장", en: "Crunch only in your imagination — 0 g of real fat" },
  2: { ko: "진한 국물 향은 마음으로만 들이켜세요", en: "Sip the rich broth with your heart only" },
  3: { ko: "로제 소스는 화면으로, 탄수화물은 0g", en: "Rosé sauce on screen, 0 g of carbs in you" },
  4: { ko: "건강한 척 끝판왕, 먹지도 않아서 더 건강", en: "Peak healthy — even healthier since you skip it" },
  5: { ko: "엄마 손맛 그대로, 설거지는 영원히 0개", en: "Mom's touch, forever zero dishes to wash" },
  6: { ko: "짜장 vs 짬뽕 고민은 해도, 결제는 0원", en: "Agonize jjajang vs jjamppong, still pay 0" },
  7: { ko: "매운맛 도전은 눈으로만, 위장은 평화롭게", en: "Take the spice challenge with your eyes only" },
  8: { ko: "카페인 없는 대리만족, 밤잠 걱정 끝", en: "Caffeine-free satisfaction, sleep tight" },
  9: { ko: "얼얼한 마라 향기만 뇌에 전송해드립니다", en: "We beam only the mala tingle to your brain" },
  10: { ko: "달콤함은 1초, 후회는 0초", en: "One second of sweetness, zero regret" },
  11: { ko: "고소한 곱창 냄새, 옷에는 안 배어요", en: "Savory tripe aroma that never sticks to clothes" },
  12: { ko: "오마카세 기분만 내고 지갑은 그대로", en: "Omakase vibes, wallet untouched" },
  13: { ko: "자정 직전 엽기 떡볶이, 다음 날 붓기 0%", en: "Midnight tteokbokki, 0% puffiness tomorrow" },
  14: { ko: "육즙 터지는 상상, 칼로리는 터지지 않음", en: "Juicy in theory, calories never explode" },
  15: { ko: "화덕 향 가득, 치즈 늘어나는 건 상상으로", en: "Wood-fired aroma, cheese pulls in your mind" },
  16: { ko: "겉바속촉 문어볼, 입천장 데일 일 없음", en: "Crispy octopus balls that never burn your mouth" },
  17: { ko: "24시간 언제든 시원하게, 머리 띵할 일 없음", en: "Ice-cold 24/7, zero brain freeze" },
  18: { ko: "든든한 한 줄, 실제로는 0줄", en: "A hearty roll — actually zero rolls" },
  19: { ko: "버터 향 와플은 마음속 오븐에서만 구워져요", en: "Buttery waffles baked only in your mind's oven" },
};

// Emoji used for a category's icon tile (falls back to a restaurant's emoji).
export const categoryEmoji = {
  "치킨": "🍗", "일식": "🍜", "양식": "🍝", "샐러드": "🥗", "한식": "🍚",
  "중식": "🥡", "분식": "🍢", "카페": "☕", "마라탕": "🌶️", "아이스크림": "🍦",
  "곱창": "🔥", "초밥": "🍣", "햄버거": "🍔", "피자": "🍕", "타코야끼": "🐙",
  "빙수": "🍧", "와플": "🧇",
  // Categories offered when users add their own restaurant.
  "카페·디저트": "🍰", "기타": "🍴",
};

// First emoji/character of a (possibly multi-emoji) string.
export function firstGrapheme(text) {
  const s = String(text || "");
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const first = new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(s)[Symbol.iterator]().next().value;
    return first ? first.segment : "";
  }
  return [...s][0] || "";
}

// Tagline for a restaurant: curated line for built-ins, first menu's
// description for user-added ones.
export function taglineFor(r, lang) {
  const line = restaurantTaglines[r.id];
  if (line) return pick(line, lang);
  return pick(r.menus?.[0]?.desc, lang) || "";
}
