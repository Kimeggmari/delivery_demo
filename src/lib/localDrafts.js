// Device-local drafts for the "add your own restaurant/dish" feature.
// A newly created restaurant or dish is saved here first (this device
// only); it only reaches Firestore (storage.js's addCustomRestaurant /
// addCustomMenu) once the user explicitly taps the publish button in
// AddContentPage, at which point it's removed from this local list.

const RESTAURANTS_KEY = "localDraftRestaurants";
const MENUS_KEY = "localDraftMenus";

function readList(key) {
  try {
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeList(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    /* localStorage unavailable or full — draft just won't persist */
  }
}

export function getLocalRestaurants() {
  return readList(RESTAURANTS_KEY);
}

export function saveLocalRestaurant(restaurant) {
  const list = [...getLocalRestaurants(), restaurant];
  writeList(RESTAURANTS_KEY, list);
  return list;
}

export function removeLocalRestaurant(id) {
  const list = getLocalRestaurants().filter(r => r.id !== id);
  writeList(RESTAURANTS_KEY, list);
  return list;
}

export function getLocalMenus() {
  return readList(MENUS_KEY);
}

export function saveLocalMenu(menu) {
  const list = [...getLocalMenus(), menu];
  writeList(MENUS_KEY, list);
  return list;
}

export function removeLocalMenu(id) {
  const list = getLocalMenus().filter(m => m.id !== id);
  writeList(MENUS_KEY, list);
  return list;
}
