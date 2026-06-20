// localStorage helpers for order history and achievements.
// All reads are defensive — if storage is blocked (private mode, quota, etc.)
// we silently return empty defaults so the app keeps working.

const HISTORY_KEY = "fna.history.v1";
const ACHIEVEMENTS_KEY = "fna.achievements.v1";
const HISTORY_LIMIT = 50;

function safeRead(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function loadHistory() {
  const arr = safeRead(HISTORY_KEY, []);
  return Array.isArray(arr) ? arr : [];
}

export function saveOrderRecord(record) {
  const list = loadHistory();
  // newest first
  const next = [record, ...list].slice(0, HISTORY_LIMIT);
  safeWrite(HISTORY_KEY, next);
  return next;
}

export function clearHistory() {
  safeWrite(HISTORY_KEY, []);
  return [];
}

export function loadUnlocked() {
  const obj = safeRead(ACHIEVEMENTS_KEY, {});
  return obj && typeof obj === "object" ? obj : {};
}

export function saveUnlocked(map) {
  safeWrite(ACHIEVEMENTS_KEY, map || {});
}

// Aggregate stats derived from the full history list.
// Returned shape stays stable so achievement rules can rely on it.
export function computeStats(history) {
  const stats = {
    count: history.length,
    rabbitCount: 0,
    turtleCount: 0,
    totalSpent: 0,
    totalSavedKcal: 0,
    maxOrderTotal: 0,
    categories: new Set(),
    payments: new Set(),
    langs: new Set(),
    lateNightCount: 0,
    hasFullyLoaded: false, // spicy + size + topping combo used at least once
  };
  for (const o of history) {
    if (o.deliveryMode === "rabbit") stats.rabbitCount++;
    if (o.deliveryMode === "turtle") stats.turtleCount++;
    stats.totalSpent += o.total || 0;
    stats.totalSavedKcal += o.savedKcal || 0;
    if ((o.total || 0) > stats.maxOrderTotal) stats.maxOrderTotal = o.total || 0;
    (o.categories || []).forEach(c => stats.categories.add(c));
    if (o.payment) stats.payments.add(o.payment);
    if (o.lang) stats.langs.add(o.lang);
    if (o.hour != null && (o.hour >= 23 || o.hour < 4)) stats.lateNightCount++;
    if (o.fullyLoaded) stats.hasFullyLoaded = true;
  }
  return stats;
}

// Build an order-history record from cart + order info at completion time.
// Kept here (not App.jsx) so the shape is co-located with readers.
export function buildOrderRecord({ cart, orderInfo, totals, deliveryMode, lang, menuCalories, restaurants }) {
  const now = new Date();
  const items = cart.map(i => ({
    menuId: i.menuId,
    restaurantId: i.restaurantId,
    name: i.name, // bilingual
    restaurantName: i.restaurantName, // bilingual
    qty: i.qty,
    price: i.price,
    spicy: i.spicy || null,
    size: i.size || null,
    toppings: (i.toppings || []).map(t => ({ ko: t.ko, en: t.en })),
  }));

  const categories = [];
  const restIds = new Set(cart.map(i => i.restaurantId));
  restIds.forEach(rid => {
    const r = restaurants.find(x => x.id === rid);
    if (r && r.category) categories.push(r.category.ko || r.category.en || "");
  });

  const savedKcal = cart.reduce(
    (s, i) => s + (menuCalories[i.menuId] || 600) * i.qty,
    0,
  );

  const fullyLoaded = cart.some(
    i => i.spicy && i.size && (i.toppings || []).length > 0,
  );

  return {
    id: "ord_" + now.getTime().toString(36) + "_" + Math.floor(Math.random() * 1e6).toString(36),
    ts: now.getTime(),
    hour: now.getHours(),
    lang,
    deliveryMode,
    payment: orderInfo.payment,
    customerName: orderInfo.customerName,
    address: orderInfo.address,
    total: totals.total,
    subtotal: totals.sub,
    deliveryFee: totals.del,
    serviceFee: totals.svc,
    itemCount: cart.reduce((s, i) => s + i.qty, 0),
    savedKcal,
    categories,
    fullyLoaded,
    items,
  };
}
