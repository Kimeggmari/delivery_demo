import { pick } from "../config/i18n";

// Case-insensitive match against restaurant/category/menu names and
// descriptions in both languages. An empty query matches everything.
export function matchesQuery(r, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    pick(r.name, "ko"), pick(r.name, "en"), pick(r.category, "ko"), pick(r.category, "en"),
    ...r.menus.map(m => [pick(m.name, "ko"), pick(m.name, "en"), pick(m.desc, "ko"), pick(m.desc, "en")].join(" ")),
  ].join(" ").toLowerCase();
  return haystack.includes(q);
}
