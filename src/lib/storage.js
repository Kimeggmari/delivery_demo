// Firestore-backed persistence for order history, achievements, and
// user-submitted restaurants/menus. Order history + achievements are
// private per device (scoped under users/{uid}, uid = anonymous auth uid
// from ./firebase). Custom restaurants/menus are a shared collection so
// everyone sees what everyone else added.

import { db, authReady } from "./firebase";
import { ADMIN_UID } from "../config/admin";
import {
  collection, doc, setDoc, updateDoc, getDoc, getDocs, deleteDoc,
  query, where, orderBy, limit, onSnapshot, serverTimestamp, writeBatch, arrayUnion,
} from "firebase/firestore";

export const HISTORY_LIMIT = 50;

// A custom restaurant/menu is hidden client-side once this many distinct
// users have reported it. Deliberately simple (no server-side moderation,
// no image scanning) — a low-cost deterrent, not abuse-proof.
export const REPORT_HIDE_THRESHOLD = 3;

export async function loadHistory() {
  const uid = await authReady;
  const q = query(collection(db, "users", uid, "orders"), orderBy("ts", "desc"), limit(HISTORY_LIMIT));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}

// customerName/address are typed at checkout and stay device-local only —
// people habitually type their real name/address there even though the
// order is fake, so those two fields never leave the device.
export async function saveOrderRecord(record) {
  const uid = await authReady;
  const { customerName: _customerName, address: _address, ...serverSafeRecord } = record;
  await setDoc(doc(db, "users", uid, "orders", record.id), serverSafeRecord);
}

export async function clearHistory() {
  const uid = await authReady;
  const snap = await getDocs(collection(db, "users", uid, "orders"));
  const batch = writeBatch(db);
  snap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
}

export async function loadUnlocked() {
  const uid = await authReady;
  const snap = await getDoc(doc(db, "users", uid));
  const data = snap.exists() ? snap.data() : {};
  return data.achievements && typeof data.achievements === "object" ? data.achievements : {};
}

export async function saveUnlocked(map) {
  const uid = await authReady;
  await setDoc(doc(db, "users", uid), { achievements: map || {} }, { merge: true });
}

// User-created restaurants & menu items (feature: "add your own restaurant/menu").
// Shared across everyone via Firestore, kept separate from the built-in
// config/restaurants.js catalog and merged in at render time.

export function subscribeCustomRestaurants(onChange) {
  return onSnapshot(collection(db, "customRestaurants"), snap => {
    onChange(snap.docs.map(d => d.data()));
  });
}

export function subscribeCustomMenus(onChange) {
  return onSnapshot(collection(db, "customMenus"), snap => {
    onChange(snap.docs.map(d => d.data()));
  });
}

// New submissions from anyone but the admin device start "pending" and stay
// invisible to everyone except their own submitter until approved — see
// AdminPanel.jsx and the isVisible filter in App.jsx. The admin's own
// additions publish immediately.
export async function addCustomRestaurant(restaurant) {
  const uid = await authReady;
  await setDoc(doc(db, "customRestaurants", String(restaurant.id)), {
    ...restaurant,
    addedBy: uid,
    status: uid === ADMIN_UID ? "approved" : "pending",
    reportedBy: [],
    createdAt: serverTimestamp(),
  });
}

export async function approveCustomRestaurant(id) {
  await updateDoc(doc(db, "customRestaurants", String(id)), { status: "approved" });
}

export async function deleteCustomRestaurant(id) {
  await deleteDoc(doc(db, "customRestaurants", String(id)));
  const snap = await getDocs(query(collection(db, "customMenus"), where("restaurantId", "==", id)));
  await Promise.allSettled(snap.docs.map(d => deleteDoc(d.ref)));
}

// Report a custom restaurant (also hides its embedded first menu, since
// they were created together). Each uid can only report once — the
// security rules reject a second attempt from the same uid.
export async function reportCustomRestaurant(id) {
  const uid = await authReady;
  await updateDoc(doc(db, "customRestaurants", String(id)), { reportedBy: arrayUnion(uid) });
}

export async function reportCustomMenu(id) {
  const uid = await authReady;
  await updateDoc(doc(db, "customMenus", String(id)), { reportedBy: arrayUnion(uid) });
}

export async function addCustomMenu(menu) {
  const uid = await authReady;
  await setDoc(doc(db, "customMenus", String(menu.id)), {
    ...menu,
    addedBy: uid,
    status: uid === ADMIN_UID ? "approved" : "pending",
    reportedBy: [],
    createdAt: serverTimestamp(),
  });
}

export async function deleteCustomMenu(id) {
  await deleteDoc(doc(db, "customMenus", String(id)));
}

export async function approveCustomMenu(id) {
  await updateDoc(doc(db, "customMenus", String(id)), { status: "approved" });
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
