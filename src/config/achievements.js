// Achievement catalog. Each entry's `check(stats, lastOrder)` returns true
// when the achievement is unlocked. Run all checks after every completed order
// and diff against the previously unlocked map to surface new badges.

// Savings-based badges: every one is earned by NOT spending money or NOT
// eating calories. `stats` comes from computeStats() in lib/storage.js —
// totalSpent is the money "saved" by not really ordering.
export const ACHIEVEMENTS = [
  {
    id: "save_first",
    emoji: "🥉",
    tier: "bronze",
    title: { ko: "첫 참음 성공", en: "First Hold-Back" },
    desc: { ko: "가상 주문 1회 완료", en: "Completed 1 virtual order" },
    check: (s) => s.count >= 1,
  },
  {
    id: "save_chicken",
    emoji: "🍗",
    tier: "bronze",
    title: { ko: "치킨 1마리 방어", en: "One Chicken Saved" },
    desc: { ko: "누적 20,000원 이상 절약", en: "Saved 20,000원 in total" },
    check: (s) => s.totalSpent >= 20000,
  },
  {
    id: "save_midnight",
    emoji: "🌙",
    tier: "silver",
    title: { ko: "야식 충동 마스터", en: "Midnight Urge Master" },
    desc: { ko: "누적 50,000원 이상 절약", en: "Saved 50,000원 in total" },
    check: (s) => s.totalSpent >= 50000,
  },
  {
    id: "save_100k",
    emoji: "💎",
    tier: "gold",
    title: { ko: "10만원 세이버", en: "100K Saver" },
    desc: { ko: "누적 100,000원 이상 절약", en: "Saved 100,000원 in total" },
    check: (s) => s.totalSpent >= 100000,
  },
  {
    id: "save_kcal",
    emoji: "🔥",
    tier: "silver",
    title: { ko: "칼로리 수호자", en: "Calorie Guardian" },
    desc: { ko: "누적 3,000 kcal 이상 방어", en: "Blocked 3,000 kcal in total" },
    check: (s) => s.totalSavedKcal >= 3000,
  },
  {
    id: "save_pro",
    emoji: "👑",
    tier: "gold",
    title: { ko: "프로 가상 미식가", en: "Pro Virtual Foodie" },
    desc: { ko: "가상 주문 5회 이상 완료", en: "Completed 5+ virtual orders" },
    check: (s) => s.count >= 5,
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

// Badges are derived from stats so an existing history shows the badges it
// has already earned, even ones that didn't exist when those orders ran.
export function earnedBadges(stats) {
  return ACHIEVEMENTS.filter(a => a.check(stats));
}
