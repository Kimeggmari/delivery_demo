// Shared "savings" math: calories you didn't eat, money you didn't spend,
// fake distances, plus small Korean-text helpers used across screens.

// Calories per built-in menu id (kcal per serving).
export const MENU_CALORIES = {
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
  gb1: 650, gb2: 420, gb3: 480, gb4: 350,
  wf1: 420, wf2: 540, wf3: 610, wf4: 780,
};

export const baseKcal = (menu) => menu?.calories || MENU_CALORIES[menu?.id] || 600;

// Portion multipliers for the S/M/L size option.
export const SIZE_KCAL_FACTOR = { Small: 0.8, Regular: 1, Large: 1.3 };

// Toppings don't carry calorie data, so estimate from the add-on price
// (roughly 1 kcal per 10원, rounded to 10) unless the label states kcal.
export function toppingKcal(topping) {
  const raw = typeof topping === "object" ? (topping?.ko || topping?.en || "") : String(topping || "");
  const explicit = raw.match(/\+(\d+)\s*kcal/i);
  if (explicit) return parseInt(explicit[1], 10);
  const price = raw.match(/\+(\d+)원/);
  if (!price) return 0;
  return Math.max(30, Math.round(parseInt(price[1], 10) / 100) * 10);
}

export function sizeKcalDelta(menu, size) {
  const factor = SIZE_KCAL_FACTOR[size] ?? 1;
  return Math.round(baseKcal(menu) * factor) - baseKcal(menu);
}

// Calories for one unit of a menu with the chosen options.
export function unitKcal(menu, size, toppings) {
  const factor = SIZE_KCAL_FACTOR[size] ?? 1;
  return Math.round(baseKcal(menu) * factor) + (toppings || []).reduce((s, x) => s + toppingKcal(x), 0);
}

// Calories of a cart line (falls back for items added before per-option kcal).
export const cartItemKcal = (item) => (item.calories || MENU_CALORIES[item.menuId] || 600) * item.qty;
export const cartKcal = (cart) => cart.reduce((s, i) => s + cartItemKcal(i), 0);

// Stable pseudo distance (0.2–1.9 km) per restaurant so sorting by
// "nearest" is consistent between launches.
export function distanceKm(restaurant) {
  const key = String(restaurant?.id ?? "");
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return Math.round((0.2 + (h % 18) / 10) * 10) / 10;
}

// Treadmill burns roughly 10 kcal per minute.
export const runningMinutes = (kcal) => Math.round((kcal || 0) / 10);

// Korean object particle 을/를 based on the last syllable's final consonant.
export function eulReul(word) {
  // Ignore a trailing "(5ea)"-style note and punctuation when deciding.
  const core = String(word || "").replace(/\s*[([][^)\]]*[)\]]\s*$/, "").replace(/[\s"'.!?]+$/, "");
  const chars = [...core];
  const last = chars[chars.length - 1];
  if (!last) return "을(를)";
  const code = last.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return "을(를)";
  return (code - 0xac00) % 28 ? "을" : "를";
}
