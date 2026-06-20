// Achievement catalog. Each entry's `check(stats, lastOrder)` returns true
// when the achievement is unlocked. Run all checks after every completed order
// and diff against the previously unlocked map to surface new badges.

export const ACHIEVEMENTS = [
  {
    id: "first_order",
    emoji: "🎉",
    tier: "bronze",
    title: { ko: "첫 주문 (안)", en: "First (non-)order" },
    desc: { ko: "음식만안와요에서 첫 데모 주문을 완료했어요.", en: "Completed your very first demo order." },
    check: (s) => s.count >= 1,
  },
  {
    id: "regular_5",
    emoji: "🥉",
    tier: "bronze",
    title: { ko: "단골 (5회)", en: "Regular (5 orders)" },
    desc: { ko: "5번이나 안 받았어요. 단골 인증.", en: "Five times not-fed. Officially a regular." },
    check: (s) => s.count >= 5,
  },
  {
    id: "regular_10",
    emoji: "🥈",
    tier: "silver",
    title: { ko: "VIP (10회)", en: "VIP (10 orders)" },
    desc: { ko: "10번 주문. 진성 데모러.", en: "Ten orders deep — a true demo-er." },
    check: (s) => s.count >= 10,
  },
  {
    id: "regular_30",
    emoji: "🥇",
    tier: "gold",
    title: { ko: "전설 (30회)", en: "Legend (30 orders)" },
    desc: { ko: "30번 주문. 음식만안와요 명예의 전당.", en: "Thirty orders. FoodNeverArrives hall of fame." },
    check: (s) => s.count >= 30,
  },
  {
    id: "rabbit_5",
    emoji: "🐇",
    tier: "silver",
    title: { ko: "토끼 마스터", en: "Rabbit Master" },
    desc: { ko: "토끼배달로 5번 주문.", en: "Five Rabbit Delivery orders." },
    check: (s) => s.rabbitCount >= 5,
  },
  {
    id: "turtle_5",
    emoji: "🐢",
    tier: "silver",
    title: { ko: "거북이 마스터", en: "Turtle Master" },
    desc: { ko: "거북이배달로 5번 주문.", en: "Five Turtle Delivery orders." },
    check: (s) => s.turtleCount >= 5,
  },
  {
    id: "big_spender",
    emoji: "💸",
    tier: "gold",
    title: { ko: "통 큰 주문", en: "Big Spender" },
    desc: { ko: "한 번에 10만원 이상 주문.", en: "Spent 100,000원 in a single order." },
    check: (s) => s.maxOrderTotal >= 100000,
  },
  {
    id: "midnight",
    emoji: "🌙",
    tier: "silver",
    title: { ko: "심야 식당", en: "Midnight Snacker" },
    desc: { ko: "밤 11시~새벽 4시에 주문.", en: "Ordered between 11 PM and 4 AM." },
    check: (s) => s.lateNightCount >= 1,
  },
  {
    id: "category_5",
    emoji: "🌈",
    tier: "gold",
    title: { ko: "잡식주의자", en: "Omnivore" },
    desc: { ko: "5가지 이상 카테고리 주문.", en: "Ordered from 5+ categories." },
    check: (s) => s.categories.size >= 5,
  },
  {
    id: "all_payments",
    emoji: "💳",
    tier: "silver",
    title: { ko: "결제수단 컬렉터", en: "Payment Collector" },
    desc: { ko: "카드·간편결제·현장결제 모두 사용.", en: "Used card, wallet, and on-delivery." },
    check: (s) => s.payments.size >= 3,
  },
  {
    id: "bilingual",
    emoji: "🌐",
    tier: "bronze",
    title: { ko: "이중 언어자", en: "Bilingual" },
    desc: { ko: "한국어와 영어로 모두 주문.", en: "Ordered in both Korean and English." },
    check: (s) => s.langs.size >= 2,
  },
  {
    id: "fully_loaded",
    emoji: "🌶️",
    tier: "silver",
    title: { ko: "풀옵션 빌더", en: "Fully Loaded" },
    desc: { ko: "맛·사이즈·토핑까지 모두 선택해 주문.", en: "Used spice, size, and toppings all on one item." },
    check: (s) => s.hasFullyLoaded,
  },
  {
    id: "kcal_saver",
    emoji: "🥗",
    tier: "gold",
    title: { ko: "10000kcal 절약", en: "10,000 kcal saved" },
    desc: { ko: "누적 절약 칼로리 10,000kcal 달성.", en: "Total saved calories hit 10,000 kcal." },
    check: (s) => s.totalSavedKcal >= 10000,
  },
];

export const TIER_COLORS = {
  bronze: { bg: "#fef3c7", border: "#fde68a", color: "#92400e" },
  silver: { bg: "#e5e7eb", border: "#d1d5db", color: "#374151" },
  gold:   { bg: "#fef9c3", border: "#fde047", color: "#854d0e" },
};

// Diff helper — returns the list of newly unlocked achievement objects.
export function computeNewUnlocks(stats, prevUnlocked) {
  const newly = [];
  const nextMap = { ...prevUnlocked };
  for (const a of ACHIEVEMENTS) {
    const already = !!prevUnlocked[a.id];
    if (already) continue;
    if (a.check(stats)) {
      nextMap[a.id] = Date.now();
      newly.push(a);
    }
  }
  return { newly, nextMap };
}
