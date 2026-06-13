// Approx KRW->USD for the demo's English locale.
// Not a live FX rate — just makes prices feel familiar to overseas testers.
const KRW_PER_USD = 1350;

export function fmt(v, lang = "ko") {
  if (lang === "en") {
    const usd = v / KRW_PER_USD;
    return "$" + new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(usd);
  }
  return new Intl.NumberFormat("ko-KR").format(v) + "원";
}

export function calcTotals(cart) {
  const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const del = cart.length ? Math.max(...cart.map(i => i.fee)) : 0;
  const svc = sub > 0 ? Math.round(sub * 0.03) : 0;
  return { sub, del, svc, total: sub + del + svc };
}
