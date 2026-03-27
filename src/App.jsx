import { useState, useRef, useEffect, useCallback } from "react";

const restaurants = [
  {
    id: 1, name: "한입치킨 강남점", emoji: "🍗", time: "25~35분", rating: 4.9, reviews: 2847, fee: 2500, category: "치킨", badge: "인기",
    menus: [
      { id: "c1", name: "크리스피 반반치킨", desc: "후라이드 + 양념 반반", price: 21900 },
      { id: "c2", name: "순살 간장치킨", desc: "달콤짭짤 시그니처", price: 19900 },
      { id: "c3", name: "치즈볼 5개", desc: "바삭 쫄깃 사이드", price: 4500 },
    ],
  },
  {
    id: 2, name: "도쿄라멘 스테이션", emoji: "🍜", time: "18~28분", rating: 4.8, reviews: 1523, fee: 3200, category: "일식", badge: "추천",
    menus: [
      { id: "r1", name: "돈코츠 라멘", desc: "진한 사골 육수 12시간", price: 11000 },
      { id: "r2", name: "매운 미소 라멘", desc: "얼큰한 된장 베이스", price: 12000 },
      { id: "r3", name: "카라아게", desc: "바삭한 닭튀김 6조각", price: 6500 },
    ],
  },
  {
    id: 3, name: "파스타랩 성수키친", emoji: "🍝", time: "30~40분", rating: 4.7, reviews: 983, fee: 2800, category: "양식", badge: "",
    menus: [
      { id: "p1", name: "새우 로제 파스타", desc: "부드러운 로제소스", price: 14900 },
      { id: "p2", name: "봉골레 오일 파스타", desc: "깔끔한 바지락 감칠맛", price: 13900 },
      { id: "p3", name: "갈릭 브레드", desc: "버터 갈릭 토스트", price: 3900 },
    ],
  },
  {
    id: 4, name: "그린포케 하우스", emoji: "🥗", time: "15~25분", rating: 4.9, reviews: 1205, fee: 1800, category: "샐러드", badge: "신규",
    menus: [
      { id: "g1", name: "연어 포케볼", desc: "신선한 연어와 아보카도", price: 13500 },
      { id: "g2", name: "닭가슴살 포케볼", desc: "단백질 든든 한끼", price: 11900 },
      { id: "g3", name: "망고 요거트", desc: "상큼한 디저트", price: 4900 },
    ],
  },
  {
    id: 5, name: "엄마손 한식당", emoji: "🍚", time: "20~30분", rating: 4.8, reviews: 3102, fee: 2000, category: "한식", badge: "인기",
    menus: [
      { id: "h1", name: "김치찌개", desc: "묵은지로 끓인 깊은 맛", price: 9500 },
      { id: "h2", name: "돌솥비빔밥", desc: "누룽지까지 바삭하게", price: 11000 },
      { id: "h3", name: "제육볶음 정식", desc: "매콤달콤 밥도둑", price: 12000 },
    ],
  },
  {
    id: 6, name: "용용차이나", emoji: "🥡", time: "22~32분", rating: 4.6, reviews: 1876, fee: 3000, category: "중식", badge: "",
    menus: [
      { id: "cn1", name: "짜장면", desc: "춘장 볶은 정통 짜장", price: 7500 },
      { id: "cn2", name: "탕수육 (대)", desc: "바삭한 찹쌀 탕수육", price: 19000 },
      { id: "cn3", name: "짬뽕", desc: "얼큰 해물 짬뽕", price: 8500 },
    ],
  },
  {
    id: 7, name: "신전떡볶이 앤 분식", emoji: "🧡", time: "12~20분", rating: 4.5, reviews: 4521, fee: 1500, category: "분식", badge: "최저배달비",
    menus: [
      { id: "b1", name: "로제 떡볶이", desc: "크리미한 로제소스", price: 7900 },
      { id: "b2", name: "참치김밥 2줄", desc: "고소한 참치마요", price: 5500 },
      { id: "b3", name: "모둠튀김", desc: "김말이+고추+새우", price: 4500 },
    ],
  },
  {
    id: 8, name: "카페 달콤 로스터리", emoji: "☕", time: "10~18분", rating: 4.7, reviews: 2234, fee: 2500, category: "카페", badge: "추천",
    menus: [
      { id: "cf1", name: "아이스 아메리카노", desc: "산미 적은 블렌드", price: 4500 },
      { id: "cf2", name: "딸기 생크림 케이크", desc: "부드러운 시트 2단", price: 7800 },
      { id: "cf3", name: "소금빵 2개", desc: "겉바속촉 버터풍미", price: 5200 },
    ],
  },
  {
    id: 9, name: "마라홍 마라탕", emoji: "🌶️", time: "20~30분", rating: 4.6, reviews: 1654, fee: 2800, category: "마라탕", badge: "인기",
    menus: [
      { id: "ml1", name: "마라탕 (1인)", desc: "직접 고른 재료 조합", price: 12900 },
      { id: "ml2", name: "마라샹궈", desc: "볶아서 더 진한 매운맛", price: 15900 },
      { id: "ml3", name: "꿔바로우", desc: "달콤바삭 중화 탕수육", price: 13500 },
    ],
  },
  {
    id: 10, name: "배스킨 아이스파크", emoji: "🍦", time: "8~15분", rating: 4.8, reviews: 987, fee: 2000, category: "아이스크림", badge: "신규",
    menus: [
      { id: "ic1", name: "파인트 아이스크림", desc: "맛 2가지 선택 가능", price: 8900 },
      { id: "ic2", name: "아이스크림 케이크", desc: "초코+바닐라 레이어", price: 25900 },
      { id: "ic3", name: "쿨 아이스티", desc: "복숭아 아이스티", price: 3500 },
    ],
  },
];

const thumbGradients = [
  "linear-gradient(135deg,#fef3c7,#fed7aa)", "linear-gradient(135deg,#dbeafe,#bfdbfe)",
  "linear-gradient(135deg,#ede9fe,#ddd6fe)", "linear-gradient(135deg,#dcfce7,#bbf7d0)",
  "linear-gradient(135deg,#fce7f3,#fbcfe8)", "linear-gradient(135deg,#fee2e2,#fecaca)",
  "linear-gradient(135deg,#ffedd5,#fed7aa)", "linear-gradient(135deg,#e0e7ff,#c7d2fe)",
  "linear-gradient(135deg,#fef9c3,#fde68a)", "linear-gradient(135deg,#cffafe,#a5f3fc)",
];

const badgeColors = {
  "인기": { bg: "#fee2e2", color: "#dc2626", border: "#fecaca" },
  "추천": { bg: "#dbeafe", color: "#2563eb", border: "#bfdbfe" },
  "신규": { bg: "#dcfce7", color: "#16a34a", border: "#bbf7d0" },
  "최저배달비": { bg: "#fef3c7", color: "#d97706", border: "#fde68a" },
};

const sampleReviews = [
  { user: "맛집탐험가", text: "완전 맛있어요! 재주문 확정 🔥", star: 5 },
  { user: "배고픈하마", text: "양도 많고 배달도 빨라요 👍", star: 5 },
  { user: "야식킹", text: "소스가 진짜 찐이에요", star: 4 },
  { user: "점심뭐먹지", text: "가성비 미쳤습니다 ㄹㅇ", star: 5 },
  { user: "푸디스타그램", text: "사진보다 실물이 더 나와요!", star: 4 },
  { user: "배달매니아", text: "포장도 깔끔하고 맛도 좋아요", star: 5 },
];

const themes = {
  mint: {
    phone: "#f7f8fb", text: "#111827", muted: "#6b7280", line: "#e5e7eb",
    brand: "#19c37d", brandDark: "#0ea768",
    headerStart: "#15d3b4", headerEnd: "#11bfa3",
    heroStart: "#22d3b6", heroEnd: "#0fbf9f",
    primaryBtn: "#1ac685", primaryBtnDark: "#0ea768",
    sectionShadow: "0 10px 24px rgba(17,24,39,0.06)",
    inputShadow: "0 8px 18px rgba(0,0,0,0.08)",
    bottomBarBg: "rgba(255,255,255,0.96)", bottomBarBorder: "rgba(229,231,235,0.95)",
    headerColor: "#fff", headerTextAlt: "rgba(255,255,255,0.78)",
    iconBtnBg: "rgba(255,255,255,0.16)", iconBtnColor: "#fff",
    headerBorderBottom: "none", activeBg: "#ecfdf5",
  },
  blue: {
    phone: "#f3f4f6", text: "#0f172a", muted: "#64748b", line: "#e2e8f0",
    brand: "#2563eb", brandDark: "#1d4ed8",
    headerStart: "#ffffff", headerEnd: "#ffffff",
    heroStart: "#2563eb", heroEnd: "#1d4ed8",
    primaryBtn: "#2563eb", primaryBtnDark: "#1d4ed8",
    sectionShadow: "0 6px 18px rgba(15,23,42,0.06)",
    inputShadow: "none",
    bottomBarBg: "rgba(255,255,255,0.98)", bottomBarBorder: "rgba(226,232,240,1)",
    headerColor: "#111827", headerTextAlt: "#64748b",
    iconBtnBg: "#f1f5f9", iconBtnColor: "#111827",
    headerBorderBottom: "1px solid #e5e7eb", activeBg: "#eff6ff",
  },
};

function fmt(v) { return new Intl.NumberFormat("ko-KR").format(v) + "원"; }
function calcTotals(cart) {
  const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const del = cart.length ? Math.max(...cart.map(i => i.fee)) : 0;
  const svc = sub > 0 ? Math.round(sub * 0.03) : 0;
  return { sub, del, svc, total: sub + del + svc };
}

function Stars({ rating, size = 12 }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span style={{ fontSize: size, letterSpacing: -1, lineHeight: 1 }}>
      {"★".repeat(full)}{half ? "½" : ""}
      <span style={{ color: "#d1d5db" }}>{"★".repeat(5 - full - (half ? 1 : 0))}</span>
    </span>
  );
}

function ReviewModal({ restaurant, onClose }) {
  const revs = sampleReviews.slice(0, 3 + (restaurant.id % 3));
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: "20px 20px 32px", width: "100%", maxWidth: 540, maxHeight: "70vh", overflowY: "auto", animation: "slideUp .3s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>{restaurant.emoji} {restaurant.name}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
              <span style={{ color: "#f59e0b" }}><Stars rating={restaurant.rating} size={14} /></span>
              <span style={{ fontWeight: 900, fontSize: 15 }}>{restaurant.rating}</span>
              <span style={{ color: "#9ca3af", fontSize: 12 }}>리뷰 {restaurant.reviews.toLocaleString()}개</span>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 12, border: "none", background: "#f3f4f6", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {revs.map((r, i) => (
            <div key={i} style={{ background: "#f9fafb", borderRadius: 16, padding: "14px 16px", border: "1px solid #f3f4f6" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontWeight: 800, fontSize: 13 }}>{r.user}</span>
                <span style={{ color: "#f59e0b", fontSize: 11 }}>{"★".repeat(r.star)}<span style={{ color: "#d1d5db" }}>{"★".repeat(5 - r.star)}</span></span>
              </div>
              <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>{r.text}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 14, fontSize: 12, color: "#9ca3af" }}>데모용 샘플 리뷰입니다</div>
      </div>
      <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState("mint");
  const [page, setPage] = useState("order");
  const [cart, setCart] = useState([]);
  const [payment, setPayment] = useState("카드");
  const [search, setSearch] = useState("");
  const [nm, setNm] = useState("");
  const [ph, setPh] = useState("");
  const [ad, setAd] = useState("");
  const [rq, setRq] = useState("");
  const [steps, setSteps] = useState([0, 0, 0, 0]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [trackState, setTrackState] = useState(0);
  const [orderInfo, setOrderInfo] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [addedAnim, setAddedAnim] = useState(null);
  const timersRef = useRef([]);

  const th = themes[theme];
  const totals = calcTotals(cart);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const clearTimers = useCallback(() => { timersRef.current.forEach(clearTimeout); timersRef.current = []; }, []);
  useEffect(() => () => clearTimers(), [clearTimers]);

  const addToCart = (rid, mid) => {
    const r = restaurants.find(x => x.id === rid);
    const m = r.menus.find(x => x.id === mid);
    setCart(prev => {
      const ex = prev.find(x => x.menuId === mid);
      if (ex) return prev.map(x => x.menuId === mid ? { ...x, qty: x.qty + 1 } : x);
      return [...prev, { restaurantId: rid, menuId: mid, restaurantName: r.name, name: m.name, price: m.price, fee: r.fee, qty: 1 }];
    });
    setAddedAnim(mid);
    setTimeout(() => setAddedAnim(null), 600);
  };

  const changeQty = (mid, d) => setCart(prev => prev.map(x => x.menuId === mid ? { ...x, qty: x.qty + d } : x).filter(x => x.qty > 0));

  const resetAll = () => {
    clearTimers(); setCart([]); setPayment("카드"); setSearch("");
    setNm(""); setPh(""); setAd(""); setRq("");
    setSteps([0, 0, 0, 0]); setShowReceipt(false); setReceiptData(null);
    setTrackState(0); setOrderInfo(null); setPage("order");
  };

  const goToCheckout = () => {
    if (!cart.length) { alert("장바구니가 비어 있습니다! 🛒"); return; }
    setPage("checkout");
  };

  const simulateOrder = () => {
    clearTimers(); setSteps([0, 0, 0, 0]); setShowReceipt(false);
    const info = { customerName: nm || "주문자", address: ad || "입력된 주소 없음", phone: ph || "연락처 없음", request: rq || "없음", payment, total: totals.total };
    [200, 1200, 2300, 3400].forEach((d, i) => {
      timersRef.current.push(setTimeout(() => {
        setSteps(prev => { const n = [...prev]; if (i > 0) n[i - 1] = 2; n[i] = 1; return n; });
      }, d));
    });
    timersRef.current.push(setTimeout(() => {
      setSteps([2, 2, 2, 2]); setReceiptData(info); setShowReceipt(true);
      timersRef.current.push(setTimeout(() => {
        setOrderInfo(info); setTrackState(0); setPage("tracking");
        timersRef.current.push(setTimeout(() => setTrackState(1), 2200));
        timersRef.current.push(setTimeout(() => setTrackState(2), 4300));
        timersRef.current.push(setTimeout(() => setTrackState(3), 6400));
      }, 1200));
    }, 4600));
  };

  const trackData = [
    { eta: "12분", text: "곧 출발해 고객님께 향하고 있어요!", badge: "이동 중", bottom: "라이더 이동 중 🛵", riderLabel: "라이더 이동 중", activeText: "현재 고객님 위치로 이동하고 있어요.", bp: ["48%", "44%"], finalDone: false },
    { eta: "7분", text: "라이더가 고객님 쪽으로 가까워지고 있어요!", badge: "근처 이동", bottom: "곧 도착 예정 🏃", riderLabel: "근처 도착", activeText: "고객님 위치 근처까지 도착했어요.", bp: ["66%", "58%"], finalDone: false },
    { eta: "2분", text: "라이더가 거의 도착했습니다! 잠시만요~", badge: "도착 임박", bottom: "2분 내 도착 ⏰", riderLabel: "도착 임박", activeText: "건물 앞에 거의 도착했어요.", bp: ["78%", "72%"], finalDone: false },
    { eta: "도착!", text: "배달이 도착한 것처럼 표시되는 데모입니다 🎉", badge: "전달 완료", bottom: "전달 완료 ✅", riderLabel: "전달 완료", activeText: "라이더가 도착했습니다!", bp: ["84%", "76%"], finalDone: true },
  ];
  const td = trackData[trackState] || trackData[0];

  const filtered = restaurants.filter(r => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [r.name, r.category, ...r.menus.map(m => m.name + " " + m.desc)].join(" ").toLowerCase().includes(q);
  });

  const stepLabels = ["주문 요청 확인", "매장 접수 대기", "배달 준비 중", "도착 예정 안내"];

  const css = {
    wrap: { minHeight: "100vh", background: th.phone, fontFamily: 'Inter,"Noto Sans KR",system-ui,sans-serif', color: th.text, display: "flex", flexDirection: "column" },
    header: { position: "sticky", top: 0, zIndex: 10, background: `linear-gradient(180deg,${th.headerStart},${th.headerEnd})`, color: th.headerColor, padding: "14px 20px 14px", borderBottom: th.headerBorderBottom, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
    content: { flex: 1, padding: "16px 16px 100px", display: "grid", gap: 16, alignContent: "start", maxWidth: 540, width: "100%", margin: "0 auto", boxSizing: "border-box" },
    section: { background: "#fff", borderRadius: 20, padding: 16, boxShadow: th.sectionShadow },
    input: { width: "100%", padding: "14px 16px", border: "none", outline: "none", borderRadius: 14, background: "#fff", color: th.text, boxShadow: th.inputShadow, fontFamily: "inherit", fontSize: 14, boxSizing: "border-box" },
    bottomBar: { position: "fixed", left: 0, right: 0, bottom: 0, background: th.bottomBarBg, borderTop: `1px solid ${th.bottomBarBorder}`, backdropFilter: "blur(14px)", boxShadow: "0 -4px 20px rgba(17,24,39,0.06)", padding: "12px 20px", display: "flex", justifyContent: "center", zIndex: 20 },
    bottomInner: { display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center", maxWidth: 540, width: "100%" },
    orderBtn: { border: "none", background: th.primaryBtn, color: "#fff", padding: "14px 20px", borderRadius: 16, fontSize: 14, fontWeight: 900, cursor: "pointer", minWidth: 140, boxShadow: `0 8px 20px ${th.primaryBtn}44`, fontFamily: "inherit" },
    iconBtn: { width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, background: th.iconBtnBg, fontSize: 16, color: th.iconBtnColor, border: "none", cursor: "pointer" },
    addBtn: { border: "none", background: "#111827", color: "#fff", borderRadius: 12, padding: "9px 12px", cursor: "pointer", fontWeight: 800, fontSize: 12, fontFamily: "inherit", transition: "all .15s" },
    backBtn: { width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, fontSize: 18, border: "none", cursor: "pointer" },
  };

  const globalStyle = `@keyframes floatBike{0%,100%{transform:translate(-50%,-50%)}50%{transform:translate(-50%,calc(-50% - 8px))}} @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}} @keyframes pop{0%{transform:scale(1)}50%{transform:scale(1.2)}100%{transform:scale(1)}} *{box-sizing:border-box} body,html{margin:0;padding:0}`;

  // ======= TRACKING PAGE =======
  if (page === "tracking") {
    return (
      <div style={css.wrap}>
        <style>{globalStyle}</style>
        <div style={css.header}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, maxWidth: 540, margin: "0 auto" }}>
            <button onClick={() => { clearTimers(); setPage("order"); }} style={{ ...css.backBtn, background: th.iconBtnBg, color: th.iconBtnColor }}>←</button>
            <div style={{ flex: 1, textAlign: "center" }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>배달 추적 🛵</h2>
            </div>
            <div style={{ width: 38 }} />
          </div>
        </div>
        <div style={css.content}>
          <div style={{ background: "linear-gradient(135deg,#fff7ed,#ffedd5)", border: "1px solid #fdba74", color: "#9a3412", padding: "12px 14px", borderRadius: 16, fontSize: 12, fontWeight: 800, lineHeight: 1.45 }}>
            🚧 DEMO 전용 추적 화면 · 실제 라이더와 연결되지 않습니다.
          </div>
          <div style={{ background: "linear-gradient(180deg,#dff7ea 0%,#ecfeff 100%)", borderRadius: 20, padding: 18, minHeight: 220, position: "relative", overflow: "hidden", border: "1px solid #d1fae5" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.45) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.45) 1px,transparent 1px)", backgroundSize: "34px 34px", opacity: .8 }} />
            {[{ w: 240, h: 14, t: 56, l: 40, rot: "8deg" }, { w: 16, h: 180, t: 24, r: 76 }, { w: 190, h: 12, b: 54, l: 56, rot: "-18deg" }].map((rd, i) => (
              <div key={i} style={{ position: "absolute", background: "rgba(148,163,184,0.35)", borderRadius: 999, width: rd.w, height: rd.h, top: rd.t, left: rd.l, right: rd.r, bottom: rd.b, transform: rd.rot ? `rotate(${rd.rot})` : undefined }} />
            ))}
            <div style={{ position: "absolute", zIndex: 2, width: 46, height: 46, borderRadius: "50%", background: "#fff", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 24px rgba(15,23,42,0.12)", top: 24, left: 34 }}>🏪</div>
            <div style={{ position: "absolute", zIndex: 2, width: 46, height: 46, borderRadius: "50%", background: "#fff", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 24px rgba(15,23,42,0.12)", right: 30, bottom: 30 }}>🏠</div>
            <div style={{ position: "absolute", zIndex: 2, width: 54, height: 54, borderRadius: "50%", background: "#111827", color: "#fff", fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 24px rgba(15,23,42,0.12)", left: td.bp[0], top: td.bp[1], transform: "translate(-50%,-50%)", transition: "left .8s ease,top .8s ease", animation: "floatBike 2.2s ease-in-out infinite" }}>🛵</div>
            <div style={{ position: "absolute", zIndex: 2, background: "rgba(255,255,255,0.86)", color: "#0f172a", borderRadius: 999, padding: "7px 10px", fontSize: 11, fontWeight: 800, top: 76, left: 22 }}>매장 준비 완료</div>
            <div style={{ position: "absolute", zIndex: 2, background: "rgba(255,255,255,0.86)", color: "#0f172a", borderRadius: 999, padding: "7px 10px", fontSize: 11, fontWeight: 800, right: 18, bottom: 82 }}>{orderInfo?.customerName || "배달 주소"} 님</div>
            <div style={{ position: "absolute", zIndex: 2, background: "rgba(255,255,255,0.86)", color: "#0f172a", borderRadius: 999, padding: "7px 10px", fontSize: 11, fontWeight: 800, left: "50%", top: "68%", transform: "translateX(-50%)" }}>{td.riderLabel}</div>
          </div>
          <div style={{ background: `linear-gradient(135deg,${th.heroStart},${th.heroEnd})`, color: "#fff", borderRadius: 20, padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 30, fontWeight: 900, lineHeight: 1 }}>{td.eta}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.84)", marginTop: 6 }}>{td.text}</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 14, padding: "10px 12px", fontSize: 12, fontWeight: 800, whiteSpace: "nowrap" }}>{td.badge}</div>
            </div>
          </div>
          <div style={css.section}>
            <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 4 }}>라이더 정보 🏍️</div>
            <div style={{ fontSize: 12, color: th.muted, marginBottom: 12 }}>예시 정보입니다</div>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "center" }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: "#111827", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🧑‍🍳</div>
              <div><div style={{ fontWeight: 900, fontSize: 15 }}>김민수 라이더</div><div style={{ color: th.muted, fontSize: 12 }}>오토바이 · ⭐ 4.9 · 안전운행 중</div></div>
              <button style={{ border: "none", borderRadius: 12, background: "#eef2ff", color: "#3730a3", padding: "10px 12px", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>📞 연락</button>
            </div>
          </div>
          <div style={css.section}>
            <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 12 }}>진행 상태</div>
            <div style={{ display: "grid", gap: 10 }}>
              {["주문 확인 완료", "조리 완료", "라이더 이동 중", "도착 예정"].map((label, i) => {
                const done = i < 2 || (td.finalDone && i === 2);
                const active = (!td.finalDone && i === 2) || (td.finalDone && i === 3);
                return (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 12, alignItems: "start" }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", marginTop: 2, background: done || active ? th.primaryBtn : "#d1d5db", boxShadow: active ? `0 0 0 6px ${th.primaryBtn}28` : "none", transition: ".3s" }} />
                    <div>
                      <strong style={{ display: "block", fontSize: 14, marginBottom: 4 }}>{label}</strong>
                      <span style={{ color: th.muted, fontSize: 12 }}>
                        {i === 2 ? td.activeText : i === 3 ? (td.finalDone ? "라이더가 도착했습니다! 🎉" : "잠시 후 도착 예정") : i === 0 ? "매장에서 주문을 확인했어요 ✓" : "포장 완료! 라이더에게 전달 준비 ✓"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {orderInfo && (
            <div style={css.section}>
              <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 12 }}>주문 요약 📋</div>
              {[["주문자", orderInfo.customerName], ["배달 주소", orderInfo.address], ["결제수단", orderInfo.payment], ["예상 금액", fmt(orderInfo.total)]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13, marginBottom: 6 }}><span style={{ color: th.muted }}>{k}</span><strong>{v}</strong></div>
              ))}
            </div>
          )}
        </div>
        <div style={css.bottomBar}>
          <div style={css.bottomInner}>
            <div><span style={{ fontSize: 11, color: th.muted, fontWeight: 700 }}>현재 상태</span><br /><strong style={{ fontSize: 18, fontWeight: 900 }}>{td.bottom}</strong></div>
            <button onClick={resetAll} style={{ ...css.orderBtn, minWidth: "auto", padding: "12px 18px", boxShadow: "none" }}>🏠 처음으로</button>
          </div>
        </div>
      </div>
    );
  }

  // ======= CHECKOUT PAGE =======
  if (page === "checkout") {
    return (
      <div style={css.wrap}>
        <style>{globalStyle}</style>
        {reviewTarget && <ReviewModal restaurant={reviewTarget} onClose={() => setReviewTarget(null)} />}
        <div style={css.header}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, maxWidth: 540, margin: "0 auto" }}>
            <button onClick={() => setPage("order")} style={{ ...css.backBtn, background: th.iconBtnBg, color: th.iconBtnColor }}>←</button>
            <div style={{ flex: 1, textAlign: "center" }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>주문서 작성 📝</h2>
            </div>
            <div style={{ width: 38 }} />
          </div>
        </div>
        <div style={css.content}>
          <div style={css.section}>
            <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 12 }}>주문 내역 ({cartCount}개) 🛒</div>
            <div style={{ display: "grid", gap: 8 }}>
              {cart.map(item => (
                <div key={item.menuId} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center", padding: 13, background: "#f9fafb", border: "1px solid #edf0f3", borderRadius: 16 }}>
                  <div>
                    <h4 style={{ margin: "0 0 4px", fontWeight: 900, fontSize: 14 }}>{item.name}</h4>
                    <div style={{ color: th.muted, fontSize: 12 }}>{item.restaurantName}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                      <button onClick={() => changeQty(item.menuId, -1)} style={{ width: 30, height: 30, borderRadius: 10, border: "none", background: "#e5e7eb", cursor: "pointer", fontWeight: 900, fontFamily: "inherit", fontSize: 15 }}>−</button>
                      <strong style={{ fontSize: 14, minWidth: 20, textAlign: "center" }}>{item.qty}</strong>
                      <button onClick={() => changeQty(item.menuId, 1)} style={{ width: 30, height: 30, borderRadius: 10, border: "none", background: "#e5e7eb", cursor: "pointer", fontWeight: 900, fontFamily: "inherit", fontSize: 15 }}>＋</button>
                    </div>
                  </div>
                  <div style={{ fontWeight: 900, whiteSpace: "nowrap", fontSize: 15, color: th.text }}>{fmt(item.price * item.qty)}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${th.line}`, display: "grid", gap: 5 }}>
              {[["상품 금액", fmt(totals.sub)], ["배달비", fmt(totals.del)], ["서비스 수수료", fmt(totals.svc)]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: th.muted }}><span>{k}</span><strong style={{ color: th.text }}>{v}</strong></div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 17, fontWeight: 900, marginTop: 4, paddingTop: 8, borderTop: `1px solid ${th.line}` }}><span>총 결제예상금액</span><strong style={{ color: th.brand }}>{fmt(totals.total)}</strong></div>
            </div>
          </div>
          <div style={css.section}>
            <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 12 }}>배달 정보 🏠</div>
            <div style={{ display: "grid", gap: 10 }}>
              {[["받는 분", nm, setNm, "예: 홍길동"], ["연락처", ph, setPh, "예: 010-1234-5678"], ["배달 주소", ad, setAd, "예: 서울시 강남구 테헤란로 123"]].map(([label, val, setter, placeholder]) => (
                <div key={label} style={{ display: "grid", gap: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 800, color: "#374151" }}>{label}</label>
                  <input value={val} onChange={e => setter(e.target.value)} placeholder={placeholder} style={css.input} />
                </div>
              ))}
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 800, color: "#374151" }}>요청사항</label>
                <textarea value={rq} onChange={e => setRq(e.target.value)} placeholder="예: 문 앞에 놔주세요" style={{ width: "100%", border: `1px solid ${th.line}`, borderRadius: 14, padding: "14px 16px", resize: "vertical", minHeight: 80, outline: "none", background: "#fff", fontFamily: "inherit", fontSize: 14, boxSizing: "border-box" }} />
              </div>
            </div>
          </div>
          <div style={css.section}>
            <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 12 }}>결제수단 💳</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {[["💳 카드", "카드"], ["📱 간편결제", "간편결제"], ["💵 현장결제", "현장결제"]].map(([label, val]) => (
                <div key={val} onClick={() => setPayment(val)} style={{ border: `1.5px solid ${payment === val ? th.brand : th.line}`, borderRadius: 14, padding: "14px 8px", textAlign: "center", cursor: "pointer", fontWeight: 800, background: payment === val ? th.activeBg : "#fff", color: payment === val ? th.brandDark : th.text, fontSize: 12, transition: ".2s" }}>{label}</div>
              ))}
            </div>
          </div>
          {steps.some(s => s > 0) && (
            <div style={css.section}>
              <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 12 }}>주문 진행 중...</div>
              <div style={{ display: "grid", gap: 8 }}>
                {stepLabels.map((label, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 12, alignItems: "center", padding: 12, border: `1px solid ${th.line}`, borderRadius: 12, background: "#fbfbfc", fontSize: 13 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: steps[i] === 2 ? th.primaryBtn : steps[i] === 1 ? "#ff6b57" : "#d1d5db", boxShadow: steps[i] === 1 ? "0 0 0 6px rgba(255,107,87,0.15)" : "none", transition: ".3s" }} />
                    <div>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {showReceipt && receiptData && (
            <div style={{ padding: 16, borderRadius: 16, background: "linear-gradient(180deg,#f0fdf4,#fff)", border: "1px solid #bbf7d0", fontSize: 13, lineHeight: 1.6 }}>
              <h3 style={{ margin: "0 0 10px", color: "#166534", fontSize: 15 }}>✅ 데모 주문이 접수되었습니다</h3>
              {[["주문자", receiptData.customerName], ["연락처", receiptData.phone], ["주소", receiptData.address], ["결제수단", receiptData.payment], ["요청사항", receiptData.request]].map(([k, v]) => (
                <div key={k}><strong>{k}:</strong> {v}</div>
              ))}
              <div style={{ marginTop: 10, fontWeight: 900, color: "#166534" }}>예상 결제금액: {fmt(receiptData.total)}</div>
              <div style={{ fontSize: 11, color: th.muted, marginTop: 8 }}>UI 시뮬레이션입니다. 실제 결제·주문·배달은 발생하지 않습니다.</div>
            </div>
          )}
        </div>
        <div style={css.bottomBar}>
          <div style={css.bottomInner}>
            <div><span style={{ fontSize: 11, color: th.muted, fontWeight: 700 }}>총 결제예상금액</span><br /><strong style={{ fontSize: 18, fontWeight: 900, color: th.brand }}>{fmt(totals.total)}</strong></div>
            <button onClick={simulateOrder} style={css.orderBtn}>🚀 데모 주문하기</button>
          </div>
        </div>
      </div>
    );
  }

  // ======= ORDER PAGE =======
  return (
    <div style={css.wrap}>
      <style>{globalStyle}</style>
      {reviewTarget && <ReviewModal restaurant={reviewTarget} onClose={() => setReviewTarget(null)} />}
      <div style={css.header}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, maxWidth: 540, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setTheme("mint")} style={{ ...css.iconBtn, opacity: theme === "mint" ? 1 : .55, fontWeight: theme === "mint" ? 900 : 700, fontSize: 11, borderRadius: 10, padding: "0 10px", width: "auto" }}>🌿 민트</button>
            <button onClick={() => setTheme("blue")} style={{ ...css.iconBtn, opacity: theme === "blue" ? 1 : .55, fontWeight: theme === "blue" ? 900 : 700, fontSize: 11, borderRadius: 10, padding: "0 10px", width: "auto" }}>💎 블루</button>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: th.headerTextAlt }}>배달 주소</div>
            <div style={{ fontSize: 15, fontWeight: 900 }}>우리집 ▼</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ position: "relative" }}>
              <button style={{ ...css.iconBtn, width: 32, height: 32, fontSize: 14 }}>🛒</button>
              {cartCount > 0 && <div style={{ position: "absolute", top: -4, right: -4, background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 900, borderRadius: 99, minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>{cartCount}</div>}
            </div>
            <button onClick={resetAll} style={{ border: "none", borderRadius: 10, background: "rgba(255,255,255,0.14)", color: th.headerColor, padding: "6px 10px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", fontSize: 11 }}>초기화</button>
          </div>
        </div>
        <div style={{ maxWidth: 540, margin: "8px auto 0" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 음식점이나 메뉴를 검색해보세요" style={css.input} />
        </div>
      </div>

      <div style={css.content}>
        <div style={{ background: "linear-gradient(135deg,#fff7ed,#ffedd5)", border: "1px solid #fdba74", color: "#9a3412", padding: "12px 14px", borderRadius: 16, fontSize: 12, fontWeight: 800, lineHeight: 1.45 }}>
          🚧 DEMO / MOCKUP 전용 · 실제 주문·결제·배달은 발생하지 않습니다.
        </div>

        <div style={css.section}>
          <div style={{ marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>맛집 {filtered.length}곳 🍴</h2>
            <div style={{ fontSize: 12, color: th.muted, marginTop: 4 }}>메뉴를 담고 주문하기를 눌러보세요</div>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 24, border: "1px dashed #d1d5db", borderRadius: 16, textAlign: "center", color: th.muted, background: "#fafafa", fontSize: 13, lineHeight: 1.6 }}>검색 결과가 없어요 😅<br />다른 키워드로 찾아보세요!</div>
            ) : filtered.map((r, ri) => (
              <div key={r.id} style={{ border: `1px solid ${th.line}`, borderRadius: 20, overflow: "hidden", background: "#fff" }}>
                <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, background: thumbGradients[ri % thumbGradients.length], position: "relative" }}>
                  {r.emoji}
                  {r.badge && badgeColors[r.badge] && (
                    <div style={{ position: "absolute", top: 10, left: 10, fontSize: 11, padding: "5px 10px", borderRadius: 999, background: badgeColors[r.badge].bg, color: badgeColors[r.badge].color, border: `1px solid ${badgeColors[r.badge].border}`, fontWeight: 800 }}>{r.badge}</div>
                  )}
                </div>
                <div style={{ padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>{r.name}</h3>
                    <div style={{ fontSize: 11, padding: "5px 9px", borderRadius: 999, background: "#f3f4f6", color: "#374151", fontWeight: 800, whiteSpace: "nowrap" }}>{r.category}</div>
                  </div>
                  <div onClick={() => setReviewTarget(r)} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, cursor: "pointer", padding: "4px 0" }}>
                    <span style={{ color: "#f59e0b" }}><Stars rating={r.rating} /></span>
                    <span style={{ fontWeight: 800, fontSize: 13 }}>{r.rating}</span>
                    <span style={{ color: th.muted, fontSize: 12 }}>리뷰 {r.reviews.toLocaleString()}개</span>
                    <span style={{ color: th.brand, fontSize: 11, fontWeight: 700 }}>보기 →</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, color: th.muted, fontSize: 12, marginBottom: 10 }}>
                    <span>⏱ {r.time}</span><span>🚚 {fmt(r.fee)}</span>
                  </div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {r.menus.map(m => (
                      <div key={m.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center", padding: 12, border: `1px solid ${th.line}`, borderRadius: 14, background: "#fcfcfd" }}>
                        <div>
                          <div style={{ fontWeight: 800, marginBottom: 3, fontSize: 14 }}>{m.name}</div>
                          <div style={{ color: th.muted, fontSize: 12 }}>{m.desc}</div>
                        </div>
                        <div style={{ display: "grid", justifyItems: "end", gap: 6 }}>
                          <div style={{ fontWeight: 900, whiteSpace: "nowrap", fontSize: 14 }}>{fmt(m.price)}</div>
                          <button onClick={() => addToCart(r.id, m.id)} style={{ ...css.addBtn, animation: addedAnim === m.id ? "pop .3s ease" : "none" }}>
                            {addedAnim === m.id ? "✓ 담김" : "담기"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={css.bottomBar}>
        <div style={css.bottomInner}>
          <div><span style={{ fontSize: 11, color: th.muted, fontWeight: 700 }}>총 결제예상금액</span><br /><strong style={{ fontSize: 18, fontWeight: 900, color: cart.length ? th.brand : th.text }}>{fmt(totals.total)}</strong></div>
          <button onClick={goToCheckout} style={{ ...css.orderBtn, opacity: cart.length ? 1 : .5 }}>📋 주문하기 {cartCount > 0 ? `(${cartCount})` : ""}</button>
        </div>
      </div>
    </div>
  );
}
