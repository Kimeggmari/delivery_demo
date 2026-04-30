export function fmt(v) {
  return new Intl.NumberFormat("ko-KR").format(v) + "원";
}

export function calcTotals(cart) {
  const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const del = cart.length ? Math.max(...cart.map(i => i.fee)) : 0;
  const svc = sub > 0 ? Math.round(sub * 0.03) : 0;
  return { sub, del, svc, total: sub + del + svc };
}
