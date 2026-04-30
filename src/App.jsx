import { useState, useRef, useEffect, useCallback } from "react";
import CoupangAdCard from "./components/CoupangAdCard";
import Footer from "./components/Footer";
import MenuImage from "./components/MenuImage";
import Stars from "./components/Stars";
import { getMenuImageSrc } from "./config/menuImages";
import { deliveryModes, SIZE_OPTIONS, SPICY_OPTIONS, themes } from "./config/ordering";
import { calcTotals, fmt } from "./lib/format";

const menuCalories = {
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
};

const restaurants = [
  {
    id: 1, name: "한입치킨 강남점", emoji: "🍗", time: "25~35분", rating: 4.9, reviews: 2847, fee: 2500, category: "치킨", badge: "인기",
    menus: [
      { id: "c1", name: "크리스피 반반치킨", desc: "후라이드 + 양념 반반", price: 21900, options: { spicy: true, size: true, toppings: ["치즈소스 추가+1000원", "콜라 추가+1500원"] } },
      { id: "c2", name: "순살 간장치킨", desc: "달콤짭짤 시그니처", price: 19900, options: { spicy: true, toppings: ["치즈소스 추가+1000원", "콜라 추가+1500원"] } },
      { id: "c3", name: "치즈볼 5개", desc: "바삭 쫄깃 사이드", price: 4500, options: {} },
    ],
  },
  {
    id: 2, name: "도쿄라멘 스테이션", emoji: "🍜", time: "18~28분", rating: 4.8, reviews: 1523, fee: 3200, category: "일식", badge: "추천",
    menus: [
      { id: "r1", name: "돈코츠 라멘", desc: "진한 사골 육수 12시간", price: 11000, options: { spicy: true, toppings: ["차슈 추가+2000원", "반숙달걀 추가+1000원", "대파 추가+500원"] } },
      { id: "r2", name: "매운 미소 라멘", desc: "얼큰한 된장 베이스", price: 12000, options: { spicy: true, toppings: ["차슈 추가+2000원", "반숙달걀 추가+1000원"] } },
      { id: "r3", name: "카라아게", desc: "바삭한 닭튀김 6조각", price: 6500, options: { spicy: true } },
    ],
  },
  {
    id: 3, name: "파스타랩 성수키친", emoji: "🍝", time: "30~40분", rating: 4.7, reviews: 983, fee: 2800, category: "양식", badge: "",
    menus: [
      { id: "p1", name: "새우 로제 파스타", desc: "부드러운 로제소스", price: 14900, options: { spicy: true, size: true, toppings: ["새우 추가+2500원", "치즈 추가+1000원"] } },
      { id: "p2", name: "봉골레 오일 파스타", desc: "깔끔한 바지락 감칠맛", price: 13900, options: { size: true, toppings: ["바지락 추가+2000원", "치즈 추가+1000원"] } },
      { id: "p3", name: "갈릭 브레드", desc: "버터 갈릭 토스트", price: 3900, options: {} },
    ],
  },
  {
    id: 4, name: "그린포케 하우스", emoji: "🥗", time: "15~25분", rating: 4.9, reviews: 1205, fee: 1800, category: "샐러드", badge: "신규",
    menus: [
      { id: "g1", name: "연어 포케볼", desc: "신선한 연어와 아보카도", price: 13500, options: { size: true, toppings: ["연어 추가+3000원", "아보카도 추가+1500원", "드레싱 추가+500원"] } },
      { id: "g2", name: "닭가슴살 포케볼", desc: "단백질 든든 한끼", price: 11900, options: { size: true, toppings: ["닭가슴살 추가+2000원", "드레싱 추가+500원"] } },
      { id: "g3", name: "망고 요거트", desc: "상큼한 디저트", price: 4900, options: {} },
    ],
  },
  {
    id: 5, name: "엄마손 한식당", emoji: "🍚", time: "20~30분", rating: 4.8, reviews: 3102, fee: 2000, category: "한식", badge: "인기",
    menus: [
      { id: "h1", name: "김치찌개", desc: "묵은지로 끓인 깊은 맛", price: 9500, options: { spicy: true, toppings: ["공기밥 추가+1000원", "두부 추가+500원"] } },
      { id: "h2", name: "돌솥비빔밥", desc: "누룽지까지 바삭하게", price: 11000, options: { spicy: true, toppings: ["달걀 추가+500원", "공기밥 추가+1000원"] } },
      { id: "h3", name: "제육볶음 정식", desc: "매콤달콤 밥도둑", price: 12000, options: { spicy: true, toppings: ["공기밥 추가+1000원"] } },
    ],
  },
  {
    id: 6, name: "용용차이나", emoji: "🥡", time: "22~32분", rating: 4.6, reviews: 1876, fee: 3000, category: "중식", badge: "",
    menus: [
      { id: "cn1", name: "짜장면", desc: "춘장 볶은 정통 짜장", price: 7500, options: { toppings: ["계란 추가+500원", "공기밥 추가+1000원"] } },
      { id: "cn2", name: "탕수육 (대)", desc: "바삭한 찹쌀 탕수육", price: 19000, options: { toppings: ["소스 곁들임+500원"] } },
      { id: "cn3", name: "짬뽕", desc: "얼큰 해물 짬뽕", price: 8500, options: { spicy: true, toppings: ["해물 추가+2000원"] } },
    ],
  },
  {
    id: 7, name: "맵다매워 떡볶이", emoji: "🧡", time: "12~20분", rating: 4.5, reviews: 4521, fee: 1500, category: "분식", badge: "최저배달비",
    menus: [
      { id: "b1", name: "로제 떡볶이", desc: "크리미한 로제소스", price: 7900, options: { spicy: true, size: true, toppings: ["치즈 추가+1000원", "라면사리 추가+500원", "만두 추가+1500원"] } },
      { id: "b2", name: "참치김밥 2줄", desc: "고소한 참치마요", price: 5500, options: {} },
      { id: "b3", name: "모둠튀김", desc: "김말이+고추+새우", price: 4500, options: { toppings: ["새우튀김 추가+1000원"] } },
    ],
  },
  {
    id: 8, name: "카페 달콤 로스터리", emoji: "☕", time: "10~18분", rating: 4.7, reviews: 2234, fee: 2500, category: "카페", badge: "추천",
    menus: [
      { id: "cf1", name: "아이스 아메리카노", desc: "산미 적은 블렌드", price: 4500, options: { size: true, toppings: ["샷 추가+500원", "시럽 추가+300원"] } },
      { id: "cf2", name: "딸기 생크림 케이크", desc: "부드러운 시트 2단", price: 7800, options: { toppings: ["생크림 추가+500원"] } },
      { id: "cf3", name: "소금빵 2개", desc: "겉바속촉 버터풍미", price: 5200, options: {} },
      { id: "cf4", name: "버터떡", desc: "고소한 버터가 듬뿍 찰떡", price: 1300, options: {} },
    ],
  },
  {
    id: 9, name: "마라홍 마라탕", emoji: "🌶️", time: "20~30분", rating: 4.6, reviews: 1654, fee: 2800, category: "마라탕", badge: "인기",
    menus: [
      { id: "ml1", name: "마라탕 (1인)", desc: "직접 고른 재료 조합", price: 12900, options: { spicy: true, toppings: ["당면 추가+500원", "두부 추가+500원", "새우 추가+2000원"] } },
      { id: "ml2", name: "마라샹궈", desc: "볶아서 더 진한 매운맛", price: 15900, options: { spicy: true, toppings: ["당면 추가+500원", "새우 추가+2000원"] } },
      { id: "ml3", name: "꿔바로우", desc: "달콤바삭 중화 탕수육", price: 13500, options: {} },
    ],
  },
  {
    id: 10, name: "딜리셔스 디저트", emoji: "🍦", time: "8~15분", rating: 4.8, reviews: 987, fee: 2000, category: "아이스크림", badge: "신규",
    menus: [
      { id: "ic1", name: "파인트 아이스크림", desc: "맛 2가지 선택 가능", price: 8900, options: { toppings: ["초코칩 추가+500원", "스프링클 추가+300원"] } },
      { id: "ic2", name: "아이스크림 케이크", desc: "초코+바닐라 레이어", price: 25900, options: { toppings: ["문구 작성+1000원"] } },
      { id: "ic3", name: "쿨 아이스티", desc: "복숭아 아이스티", price: 3500, options: { size: true } },
      { id: "ic4", name: "두바이 쫀득 쿠키", desc: "피스타치오 필링 쫀득 쿠키", price: 5900, options: {} },
    ],
  },
  {
    id: 11, name: "멋진 막창 예쁜 곱창", emoji: "🫀", time: "25~35분", rating: 4.8, reviews: 1342, fee: 2000, category: "곱창", badge: "인기",
    menus: [
      { id: "gp1", name: "야채곱창", desc: "신선한 야채와 곱창 볶음", price: 13900, options: { spicy: true, toppings: ["공기밥 추가+1000원", "치즈 추가+1000원"] } },
      { id: "gp2", name: "알곱창", desc: "탱글탱글 알이 가득한 곱창", price: 15900, options: { spicy: true, toppings: ["공기밥 추가+1000원"] } },
      { id: "gp3", name: "대구막창", desc: "대구식 매콤달콤 막창구이", price: 14900, options: { spicy: true, toppings: ["공기밥 추가+1000원", "된장찌개 추가+2000원"] } },
    ],
  },
  {
    id: 12, name: "스시히로 초밥집", emoji: "🍣", time: "20~30분", rating: 4.9, reviews: 2105, fee: 3000, category: "초밥", badge: "추천",
    menus: [
      { id: "su1", name: "모듬 초밥 10피스", desc: "연어·참치·광어 등 신선한 구성", price: 18900, options: { toppings: ["와사비 추가+200원", "간장 추가+200원"] } },
      { id: "su2", name: "연어 초밥 6피스", desc: "두툼한 생연어 듬뿍", price: 12900, options: { toppings: ["와사비 추가+200원"] } },
      { id: "su3", name: "참치 뱃살 초밥 4피스", desc: "부드럽고 고소한 오토로", price: 14900, options: {} },
      { id: "su4", name: "우동 세트", desc: "따뜻한 가케우동 + 초밥 3피스", price: 13500, options: { spicy: true } },
    ],
  },
  {
    id: 13, name: "엽땡떡볶이", emoji: "🌶️", time: "15~25분", rating: 4.7, reviews: 3210, fee: 2000, category: "분식", badge: "인기",
    menus: [
      { id: "yt1", name: "엽땡 떡볶이 (1인)", desc: "중독성 있는 매콤달콤 소스", price: 9900, options: { spicy: true, size: true, toppings: ["치즈 추가+1000원", "라면사리 추가+500원", "만두 추가+1500원"] } },
      { id: "yt2", name: "로제 떡볶이 (1인)", desc: "부드럽고 크리미한 로제", price: 9900, options: { size: true, toppings: ["치즈 추가+1000원", "라면사리 추가+500원"] } },
      { id: "yt3", name: "순대 모둠", desc: "당면순대 + 떡볶이 소스", price: 6500, options: { spicy: true } },
    ],
  },
  {
    id: 14, name: "버거팩토리", emoji: "🍔", time: "20~30분", rating: 4.8, reviews: 2418, fee: 2800, category: "햄버거", badge: "추천",
    menus: [
      { id: "hb1", name: "시그니처 치즈버거", desc: "두툼한 패티와 체다치즈", price: 9800, options: { size: true, toppings: ["치즈 추가+1000원", "베이컨 추가+1500원", "감자튀김 추가+2500원"] } },
      { id: "hb2", name: "더블 베이컨 버거 세트", desc: "패티 2장 + 베이컨 + 감튀", price: 14800, options: { size: true, toppings: ["치즈 추가+1000원", "콜라 추가+1500원"] } },
      { id: "hb3", name: "크리스피 감자튀김", desc: "겉바속촉 클래식 프라이", price: 4200, options: { size: true, toppings: ["치즈시즈닝 추가+700원"] } },
    ],
  },
  {
    id: 15, name: "화덕피자랩", emoji: "🍕", time: "30~40분", rating: 4.9, reviews: 1986, fee: 3500, category: "피자", badge: "인기",
    menus: [
      { id: "piz1", name: "페퍼로니 피자", desc: "짭짤한 페퍼로니 듬뿍", price: 18900, options: { size: true, toppings: ["치즈 추가+2000원", "핫소스 추가+500원", "갈릭디핑소스 추가+700원"] } },
      { id: "piz2", name: "불고기 피자", desc: "달콤짭짤 불고기 토핑", price: 20900, options: { size: true, toppings: ["치즈 추가+2000원", "콘샐러드 추가+1500원", "갈릭디핑소스 추가+700원"] } },
      { id: "piz3", name: "치즈오븐스파게티", desc: "피자와 찰떡궁합 사이드", price: 6900, options: { toppings: ["치즈 추가+1000원"] } },
    ],
  },
  {
    id: 16, name: "문어대왕 타코야끼", emoji: "🐙", time: "15~25분", rating: 4.7, reviews: 1243, fee: 2000, category: "타코야끼", badge: "신규",
    menus: [
      { id: "tak1", name: "오리지널 타코야끼 6개", desc: "문어 가득 바삭한 겉면, 촉촉한 속살", price: 9000, options: { toppings: ["마요네즈 추가+300원", "가쓰오부시 추가+300원", "치즈소스 추가+700원"] } },
      { id: "tak2", name: "치즈 타코야끼 8개", desc: "녹진한 모짜렐라 치즈가 쭉쭉", price: 12000, options: { toppings: ["마요네즈 추가+300원", "갈릭소스 추가+500원"] } },
      { id: "tak3", name: "새우 타코야끼 6개", desc: "탱글탱글 새우살이 통째로", price: 11000, options: { toppings: ["마요네즈 추가+300원", "가쓰오부시 추가+300원"] } },
      { id: "tak4", name: "타코야끼 + 쇼유라멘 세트", desc: "오리지널 6개 + 간장라멘 한 그릇", price: 17500, options: { spicy: true, toppings: ["차슈 추가+2000원", "반숙달걀 추가+1000원"] } },
    ],
  },
  {
    id: 17, name: "빙수나라 24시", emoji: "🍧", time: "10~18분", rating: 4.8, reviews: 2134, fee: 1500, category: "빙수", badge: "인기",
    menus: [
      { id: "bs1", name: "딸기 설빙", desc: "신선한 생딸기 듬뿍 올린 시그니처", price: 11900, options: { size: true, toppings: ["딸기 추가+1500원", "연유 추가+500원", "아이스크림 추가+1000원"] } },
      { id: "bs2", name: "인절미 빙수", desc: "콩가루 듬뿍, 쫄깃한 찰떡 토핑", price: 10900, options: { size: true, toppings: ["찰떡 추가+800원", "연유 추가+500원"] } },
      { id: "bs3", name: "망고 빙수", desc: "달콤한 생망고 시럽과 망고 큐브", price: 12900, options: { size: true, toppings: ["망고 추가+2000원", "코코넛젤리 추가+700원"] } },
      { id: "bs4", name: "팥 빙수", desc: "정통 국산 팥 빙수, 깊은 단맛", price: 9900, options: { size: true, toppings: ["팥 추가+1000원", "찰떡 추가+800원", "아이스크림 추가+1000원"] } },
    ],
  },
];

const thumbGradients = [
  "linear-gradient(135deg,#fef3c7,#fed7aa)",
  "linear-gradient(135deg,#dbeafe,#bfdbfe)",
  "linear-gradient(135deg,#ede9fe,#ddd6fe)",
  "linear-gradient(135deg,#dcfce7,#bbf7d0)",
  "linear-gradient(135deg,#fce7f3,#fbcfe8)",
  "linear-gradient(135deg,#fee2e2,#fecaca)",
  "linear-gradient(135deg,#ffedd5,#fed7aa)",
  "linear-gradient(135deg,#e0e7ff,#c7d2fe)",
  "linear-gradient(135deg,#fef9c3,#fde68a)",
  "linear-gradient(135deg,#cffafe,#a5f3fc)",
  "linear-gradient(135deg,#ffe4e6,#fda4af)",
  "linear-gradient(135deg,#f0fdf4,#bbf7d0)",
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
    </div>
  );
}

// ──────────────────────────────────────────────
// InfoModal — 앱 소개 (대폭 확장)
// ──────────────────────────────────────────────
function InfoModal({ onClose, email = "eggmari5713@gmail.com", onPrivacy }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 120,
        background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        padding: "0",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 540,
          background: "#fff",
          borderRadius: "24px 24px 0 0",
          padding: "24px 20px 40px",
          maxHeight: "92vh",
          overflowY: "auto",
          animation: "slideUp .3s ease",
        }}
      >
        {/* 핸들바 */}
        <div style={{ width: 40, height: 4, borderRadius: 99, background: "#e5e7eb", margin: "0 auto 20px" }} />

        {/* 헤더 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.2 }}>음식만안와요 🍱</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>배달 중독 치료 데모 앱</div>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 12, border: "none", background: "#f3f4f6", fontSize: 18, cursor: "pointer", flexShrink: 0 }}>✕</button>
        </div>

        {/* 한 줄 소개 */}
        <div style={{ background: "linear-gradient(135deg,#fff7ed,#ffedd5)", border: "1px solid #fed7aa", borderRadius: 18, padding: "16px 18px", marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: "#9a3412", marginBottom: 6 }}>
            "주문했지만, 음식만 안 왔어요."
          </div>
          <div style={{ fontSize: 13, color: "#78350f", lineHeight: 1.7 }}>
            음식만안와요는 실제 배달앱처럼 메뉴를 고르고, 장바구니에 담고, 주문서를 작성하고, 배달 추적까지 체험할 수 있는 <strong>재미있는 데모 앱</strong>이에요. 단, 실제 주문·결제·배달은 절대 발생하지 않습니다.
          </div>
        </div>

        {/* 앱 목적 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 12, color: "#111827" }}>🎯 이 앱을 만든 이유</div>
          <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.8 }}>
            배달앱은 정말 편리하지만, 그만큼 무의식적으로 자주 열게 됩니다. 배달비와 음식값, 그리고 칼로리까지 생각보다 많이 쌓이죠. <br /><br />
            <strong>음식만안와요</strong>는 "오늘 뭐 먹지?"라는 고민을 하는 순간, 배달앱 대신 이 앱을 열어 실제 주문하는 것처럼 메뉴를 탐색하고, 그 경험만으로 만족감을 얻을 수 있도록 설계됐어요. 주문 완료 후 화면에 표시되는 <strong>"아낀 칼로리"</strong>가 이 앱의 핵심 메시지입니다.
          </div>
        </div>

        {/* 주요 기능 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 12, color: "#111827" }}>✨ 주요 기능</div>
          <div style={{ display: "grid", gap: 10 }}>
            {[
              { emoji: "🍽️", title: "15개 음식점 · 40개 이상 메뉴", desc: "치킨, 라멘, 파스타, 마라탕, 초밥, 피자 등 다양한 카테고리의 메뉴를 실제처럼 탐색할 수 있어요." },
              { emoji: "🛒", title: "장바구니 & 옵션 선택", desc: "맛 선택, 사이즈, 토핑 추가 등 실제 배달앱과 동일한 옵션 시스템을 체험할 수 있어요." },
              { emoji: "🗺️", title: "실시간 배달 추적 (데모)", desc: "토끼배달·거북이배달 두 가지 모드로 라이더 위치가 이동하는 가상 지도를 보여줘요." },
              { emoji: "🔥", title: "칼로리 절약 확인", desc: "주문 완료 후 내가 선택한 메뉴의 칼로리 합산값을 '아낀 칼로리'로 보여줘요." },
              { emoji: "🎨", title: "4가지 테마 컬러", desc: "상단 이모지 버튼으로 앱 전체 색상 테마를 오렌지·보라·파랑·민트 중 선택할 수 있어요." },
              { emoji: "📲", title: "PWA — 홈화면 설치 지원", desc: "Android에서는 자동 설치 배너, iOS Safari에서는 '홈 화면에 추가'로 앱처럼 설치할 수 있어요." },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 14px", background: "#f9fafb", borderRadius: 14, border: "1px solid #f3f4f6" }}>
                <div style={{ fontSize: 22, flexShrink: 0 }}>{item.emoji}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#111827", marginBottom: 3 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 사용 방법 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 12, color: "#111827" }}>📖 사용 방법</div>
          <div style={{ display: "grid", gap: 8 }}>
            {[
              "원하는 배달 타입(토끼 or 거북이)을 선택하세요.",
              "마음에 드는 음식점에서 메뉴를 골라 장바구니에 담으세요.",
              "주문하기 버튼을 눌러 배달 정보를 입력하세요. (실제 정보가 아니어도 됩니다)",
              "'데모 주문하기'를 누르면 가상 배달 추적이 시작돼요.",
              "배달 완료 후 내가 아낀 칼로리를 확인하세요! 🎉",
            ].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#111827", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, paddingTop: 2 }}>{step}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 주의사항 */}
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 16, padding: "14px 16px", marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: "#dc2626", marginBottom: 6 }}>⚠️ 반드시 확인하세요</div>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: "#7f1d1d", lineHeight: 1.9 }}>
            <li>이 앱은 완전한 데모(시뮬레이션) 앱입니다.</li>
            <li>실제 주문, 결제, 배달은 절대 발생하지 않습니다.</li>
            <li>음식점 정보와 메뉴는 모두 가상의 데이터입니다.</li>
            <li>배달 추적 화면의 라이더 위치는 실제가 아닙니다.</li>
            <li>입력한 배달 정보(이름, 주소 등)는 서버에 저장되지 않습니다.</li>
          </ul>
        </div>

        {/* 쿠팡파트너스 안내 */}
        <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 16, padding: "14px 16px", marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: "#9a3412", marginBottom: 6 }}>📢 광고 안내</div>
          <div style={{ fontSize: 12, color: "#78350f", lineHeight: 1.7 }}>
            주문 완료 화면에는 쿠팡파트너스 광고가 표시될 수 있습니다. 이 링크를 통해 구매가 이루어질 경우 운영자에게 소정의 수수료가 지급됩니다. 광고 수익은 앱 운영 및 서버 비용에 사용됩니다.
          </div>
        </div>

        {/* 문의 */}
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 16, padding: "14px 16px", marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: "#0f172a", marginBottom: 6 }}>📬 문의 및 피드백</div>
          <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.7, marginBottom: 8 }}>
            앱 사용 중 불편한 점, 버그 제보, 개선 의견은 언제든지 아래 이메일로 보내주세요. 소중한 피드백은 앱 개선에 적극 반영됩니다.
          </div>
          <a href={`mailto:${email}`} style={{ fontSize: 14, fontWeight: 900, color: "#ea580c", textDecoration: "none", wordBreak: "break-all" }}>{email}</a>
        </div>

        {/* 개인정보처리방침 링크 */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <button
            onClick={() => { onClose(); onPrivacy(); }}
            style={{ background: "none", border: "none", color: "#6b7280", fontSize: 12, textDecoration: "underline", cursor: "pointer", fontFamily: "inherit" }}
          >
            개인정보처리방침 보기
          </button>
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          style={{ width: "100%", border: "none", borderRadius: 16, padding: "15px 16px", background: "#111827", color: "#fff", fontWeight: 900, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}
        >
          확인
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// PrivacyPage — 개인정보처리방침 (독립 페이지)
// ──────────────────────────────────────────────
function PrivacyPage({ onBack, th }) {
  return (
    <div style={{ minHeight: "100vh", background: th.phone, fontFamily: 'Inter,"Noto Sans KR",system-ui,sans-serif', color: th.text }}>
      {/* 헤더 */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "linear-gradient(180deg," + th.headerStart + "," + th.headerEnd + ")", color: "#fff", padding: "14px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, maxWidth: 540, margin: "0 auto" }}>
          <button onClick={onBack} style={{ width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, fontSize: 18, border: "none", cursor: "pointer", background: "rgba(255,255,255,0.18)", color: "#fff" }}>←</button>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>개인정보처리방침</h2>
        </div>
      </div>

      {/* 본문 */}
      <div style={{ maxWidth: 540, margin: "0 auto", padding: "24px 20px 60px", display: "grid", gap: 24 }}>

        <div style={{ background: "#fff", borderRadius: 20, padding: "20px 20px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
          <p style={{ margin: "0 0 12px", fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
            <strong style={{ color: "#111827" }}>음식만안와요</strong>(이하 "서비스")는 이용자의 개인정보를 중요하게 생각합니다. 본 방침은 서비스가 어떤 정보를 수집·이용·보관하는지에 대해 명확하게 안내합니다.
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>최종 업데이트: 2025년 1월</p>
        </div>

        {[
          {
            title: "1. 수집하는 개인정보",
            content: (
              <>
                <p>음식만안와요는 <strong>어떠한 개인정보도 수집하거나 서버에 저장하지 않습니다.</strong></p>
                <p>주문서 작성 화면에서 입력하는 이름, 주소, 연락처 등의 정보는 해당 세션 내에서만 화면 표시 목적으로 사용되며, 외부 서버로 전송되거나 저장되지 않습니다.</p>
                <p>앱을 새로고침하거나 종료하면 입력된 모든 정보는 즉시 삭제됩니다.</p>
              </>
            ),
          },
          {
            title: "2. 쿠키 및 광고",
            content: (
              <>
                <p>본 서비스는 <strong>Google AdSense</strong>를 통해 광고를 제공할 수 있습니다. Google AdSense는 쿠키 또는 유사 기술을 사용하여 광고를 맞춤화할 수 있습니다.</p>
                <p>Google의 광고 쿠키 사용에 관한 자세한 내용은 <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb" }}>Google 광고 정책</a>을 참고하세요.</p>
                <p>또한 <strong>쿠팡파트너스</strong> 제휴 광고가 표시될 수 있으며, 해당 링크 클릭 또는 구매 시 운영자에게 소정의 수수료가 지급됩니다. 쿠팡파트너스 이용 과정에서 쿠팡의 정책에 따라 일부 데이터가 처리될 수 있습니다.</p>
              </>
            ),
          },
          {
            title: "3. 제3자 서비스",
            content: (
              <>
                <p>본 서비스는 <strong>Vercel</strong>을 통해 호스팅됩니다. Vercel은 서비스 운영을 위해 서버 접속 로그(IP 주소, 접속 시간, 브라우저 정보 등)를 자동으로 수집할 수 있습니다. 이는 서비스 운영자가 직접 수집하는 것이 아니며, Vercel의 개인정보처리방침에 따라 관리됩니다.</p>
              </>
            ),
          },
          {
            title: "4. 아동의 개인정보",
            content: (
              <>
                <p>본 서비스는 만 14세 미만 아동을 대상으로 개인정보를 수집하지 않으며, 해당 연령대의 이용자로부터 의도적으로 정보를 수집하지 않습니다.</p>
              </>
            ),
          },
          {
            title: "5. 개인정보처리방침 변경",
            content: (
              <>
                <p>본 방침은 법령 또는 서비스 정책의 변경에 따라 업데이트될 수 있습니다. 변경 사항이 있을 경우 앱 내 공지 또는 본 페이지를 통해 안내합니다.</p>
              </>
            ),
          },
          {
            title: "6. 문의",
            content: (
              <>
                <p>개인정보 관련 문의 사항이 있으시면 아래 이메일로 연락해 주세요.</p>
                <a href="mailto:eggmari5713@gmail.com" style={{ color: "#ea580c", fontWeight: 900, fontSize: 15, textDecoration: "none" }}>eggmari5713@gmail.com</a>
              </>
            ),
          },
        ].map((section, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 20, padding: "20px 20px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: "#111827", marginBottom: 12 }}>{section.title}</div>
            <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.85 }}>
              {section.content}
            </div>
          </div>
        ))}

        <button
          onClick={onBack}
          style={{ width: "100%", border: "none", borderRadius: 16, padding: "15px 16px", background: "#111827", color: "#fff", fontWeight: 900, fontSize: 15, cursor: "pointer", fontFamily: 'Inter,"Noto Sans KR",system-ui,sans-serif' }}
        >
          ← 앱으로 돌아가기
        </button>
      </div>
    </div>
  );
}

function OptionSheet({ menu, onClose, onConfirm, brand }) {
  const opts = menu.options || {};
  const [spicy, setSpicy] = useState("보통");
  const [size, setSize] = useState("Regular");
  const [toppings, setToppings] = useState([]);
  const [qty, setQty] = useState(1);

  const toggleTopping = (t) => setToppings(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  const sizeExtra = SIZE_OPTIONS.find(s => s.label === size)?.price || 0;
  const toppingExtra = toppings.reduce((s, t) => { const m = t.match(/\+(\d+)원/); return s + (m ? parseInt(m[1]) : 0); }, 0);
  const totalPrice = (menu.price + (opts.size ? sizeExtra : 0) + toppingExtra) * qty;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: "20px 20px 32px", width: "100%", maxWidth: 540, maxHeight: "80vh", overflowY: "auto", animation: "slideUp .25s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 14, minWidth: 0, flex: 1 }}>
            <MenuImage
              src={getMenuImageSrc(menu.id)}
              alt={menu.name}
              width={96}
              height={96}
              borderRadius={18}
            />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 900, fontSize: 18 }}>{menu.name}</div>
              <div style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>{menu.desc}</div>
              <div style={{ color: "#10b981", fontSize: 12, fontWeight: 700, marginTop: 6 }}>🔥 {(menuCalories[menu.id] || 0).toLocaleString()}kcal</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 12, border: "none", background: "#f3f4f6", fontSize: 18, cursor: "pointer", flexShrink: 0 }}>✕</button>
        </div>
        {opts.spicy && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>🌶️ 맛 선택 <span style={{ color: "#ef4444", fontSize: 12 }}>필수</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {SPICY_OPTIONS.map(s => (
                <div key={s} onClick={() => setSpicy(s)} style={{ padding: "12px 8px", borderRadius: 14, border: "2px solid " + (spicy === s ? brand : "#e5e7eb"), background: spicy === s ? brand + "18" : "#fff", textAlign: "center", cursor: "pointer", fontWeight: 800, fontSize: 13, color: spicy === s ? brand : "#374151", transition: ".15s" }}>{s}</div>
              ))}
            </div>
          </div>
        )}
        {opts.size && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>📏 사이즈 선택</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {SIZE_OPTIONS.map(s => (
                <div key={s.label} onClick={() => setSize(s.label)} style={{ padding: "12px 8px", borderRadius: 14, border: "2px solid " + (size === s.label ? brand : "#e5e7eb"), background: size === s.label ? brand + "18" : "#fff", textAlign: "center", cursor: "pointer", transition: ".15s" }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: size === s.label ? brand : "#374151" }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{s.price === 0 ? "기본" : s.price > 0 ? "+" + s.price.toLocaleString() + "원" : s.price.toLocaleString() + "원"}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {opts.toppings && opts.toppings.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>➕ 추가 토핑 <span style={{ color: "#9ca3af", fontSize: 12, fontWeight: 500 }}>중복 선택 가능</span></div>
            <div style={{ display: "grid", gap: 8 }}>
              {opts.toppings.map(t => {
                const sel = toppings.includes(t);
                return (
                  <div key={t} onClick={() => toggleTopping(t)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: 14, border: "2px solid " + (sel ? brand : "#e5e7eb"), background: sel ? brand + "18" : "#fff", cursor: "pointer", transition: ".15s" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: sel ? brand : "#374151" }}>{t.replace(/\+\d+원$/, "").trim()}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, color: "#10b981", fontWeight: 700 }}>{t.match(/\+\d+원/) ? t.match(/\+\d+원/)[0] : ""}</span>
                      <div style={{ width: 22, height: 22, borderRadius: 8, background: sel ? brand : "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: sel ? "#fff" : "#9ca3af", transition: ".15s" }}>✓</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, padding: "14px 16px", background: "#f9fafb", borderRadius: 16 }}>
          <span style={{ fontWeight: 800, fontSize: 14 }}>수량</span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 34, height: 34, borderRadius: 10, border: "none", background: "#e5e7eb", fontWeight: 900, fontSize: 18, cursor: "pointer" }}>−</button>
            <span style={{ fontWeight: 900, fontSize: 16, minWidth: 24, textAlign: "center" }}>{qty}</span>
            <button onClick={() => setQty(q => q + 1)} style={{ width: 34, height: 34, borderRadius: 10, border: "none", background: "#e5e7eb", fontWeight: 900, fontSize: 18, cursor: "pointer" }}>＋</button>
          </div>
        </div>
        <button onClick={() => onConfirm({ spicy: opts.spicy ? spicy : null, size: opts.size ? size : null, toppings, qty, extraPrice: (opts.size ? sizeExtra : 0) + toppingExtra })}
          style={{ width: "100%", padding: "16px", background: brand, color: "#fff", border: "none", borderRadius: 16, fontWeight: 900, fontSize: 16, cursor: "pointer", fontFamily: "inherit" }}>
          담기 · {fmt(totalPrice)}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState("mint");
  const [deliveryMode, setDeliveryMode] = useState("rabbit");
  const [page, setPage] = useState("order");
  const [cart, setCart] = useState([]);
  const [payment, setPayment] = useState("카드");
  const [search, setSearch] = useState("");
  const [nm, setNm] = useState("");
  const [ph, setPh] = useState("");
  const [ad, setAd] = useState("");
  const [rq, setRq] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [trackState, setTrackState] = useState(0);
  const [orderInfo, setOrderInfo] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [optionTarget, setOptionTarget] = useState(null);
  const [addedAnim, setAddedAnim] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const inquiryEmail = "eggmari5713@gmail.com";
  const timersRef = useRef([]);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const [installed, setInstalled] = useState(() =>
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator.standalone === true
  );

  const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);

  useEffect(() => {
    const onBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    const onAppInstalled = () => {
      setInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const th = themes[theme];
  const mode = deliveryModes[deliveryMode];
  const totals = calcTotals(cart);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const clearTimers = useCallback(() => { timersRef.current.forEach(clearTimeout); timersRef.current = []; }, []);
  useEffect(() => () => clearTimers(), [clearTimers]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice?.outcome === "accepted") setInstalled(true);
    setDeferredPrompt(null);
    setCanInstall(false);
  };

  const openOption = (rid, mid) => {
    const r = restaurants.find(x => x.id === rid);
    const m = r.menus.find(x => x.id === mid);
    const opts = m.options || {};
    if (!opts.spicy && !opts.size && (!opts.toppings || opts.toppings.length === 0)) {
      addToCartDirect(rid, mid, 1, 0, null, null, []);
    } else {
      setOptionTarget({ rid, mid });
    }
  };

  const addToCartDirect = (rid, mid, qty, extraPrice, spicy, size, toppings) => {
    const r = restaurants.find(x => x.id === rid);
    const m = r.menus.find(x => x.id === mid);
    const unitPrice = m.price + extraPrice;
    const optLabel = [spicy, size, ...toppings.map(t => t.replace(/\+\d+원$/, "").trim())].filter(Boolean).join(", ");
    setCart(prev => {
      const key = mid + JSON.stringify({ spicy, size, toppings });
      const ex = prev.find(x => x.cartKey === key);
      if (ex) return prev.map(x => x.cartKey === key ? { ...x, qty: x.qty + qty } : x);
      return [...prev, { cartKey: key, restaurantId: rid, menuId: mid, restaurantName: r.name, name: m.name, price: unitPrice, fee: r.fee, qty, optLabel }];
    });
    setAddedAnim(mid);
    setTimeout(() => setAddedAnim(null), 600);
    setOptionTarget(null);
  };

  const changeQty = (key, d) => setCart(prev => prev.map(x => x.cartKey === key ? { ...x, qty: x.qty + d } : x).filter(x => x.qty > 0));

  const resetAll = () => {
    clearTimers();
    setCart([]);
    setPayment("카드");
    setSearch("");
    setNm(""); setPh(""); setAd(""); setRq("");
    setShowReceipt(false);
    setReceiptData(null);
    setTrackState(0);
    setOrderInfo(null);
    setPage("order");
    setDeliveryMode("rabbit");
    setShowInfoModal(false);
  };

  const goToCheckout = () => {
    if (!cart.length) { alert("장바구니가 비어 있습니다! 🛒"); return; }
    setPage("checkout");
  };

  const simulateOrder = () => {
    clearTimers();
    setShowReceipt(false);
    const info = { customerName: nm || "주문자", address: ad || "입력된 주소 없음", phone: ph || "연락처 없음", request: rq || "없음", payment, total: totals.total, deliveryMode };
    timersRef.current.push(setTimeout(() => {
      setReceiptData(info);
      setShowReceipt(true);
      timersRef.current.push(setTimeout(() => {
        setOrderInfo(info);
        setTrackState(0);
        setPage("tracking");
        Array.from({ length: mode.etaStart }, (_, i) =>
          timersRef.current.push(setTimeout(() => setTrackState(i + 1), (i + 1) * mode.intervalMs))
        );
        timersRef.current.push(setTimeout(() => setPage("complete"), mode.etaStart * mode.intervalMs + mode.completeDelayMs));
      }, 1500));
    }, 900));
  };

  const trackData = Array.from({ length: mode.etaStart }, (_, i) => {
    const min = Math.max(1, mode.etaStart - i);
    const startPct = deliveryMode === "rabbit" ? 42 : 24;
    const stepPct = deliveryMode === "rabbit" ? 3.6 : 1.9;
    const startTop = deliveryMode === "rabbit" ? 40 : 30;
    const stepTop = deliveryMode === "rabbit" ? 2.2 : 1.25;
    const pct = startPct + i * stepPct;
    return {
      eta: min + "분",
      text: deliveryMode === "rabbit" ? (min > 4 ? "토끼 라이더가 엄청 빠르게 달리고 있어요!" : min > 1 ? "거의 다 왔어요. 순식간에 도착합니다!" : "토끼배달이 문 앞까지 왔어요!") : (min > 10 ? "거북이 라이더가 천천히 하지만 꾸준히 오고 있어요." : min > 4 ? "조금 느리지만 분명 가까워지고 있어요." : "드디어 거의 도착했어요. 조금만 기다려주세요!"),
      badge: deliveryMode === "rabbit" ? (min > 2 ? "급행 이동" : "초근접") : (min > 5 ? "천천히 이동" : "거의 도착"),
      bottom: deliveryMode === "rabbit" ? min + "분 내 초고속 도착 ⚡" : min + "분 내 느긋 도착 🌿",
      riderLabel: deliveryMode === "rabbit" ? "토끼 " + min + "분 남음" : "거북이 " + min + "분 남음",
      activeText: deliveryMode === "rabbit" ? "토끼배달이 빠르게 고객님 위치로 이동 중이에요." : "거북이배달이 안정적으로 고객님 위치로 이동 중이에요.",
      bp: [pct + "%", (startTop + i * stepTop) + "%"],
      finalDone: false,
    };
  }).concat([{
    eta: "도착!", text: deliveryMode === "rabbit" ? "토끼배달이 번개처럼 도착한 데모입니다 🎉" : "거북이배달이 마침내 도착한 데모입니다 🎉",
    badge: "전달 완료", bottom: "전달 완료 ✅", riderLabel: "전달 완료",
    activeText: deliveryMode === "rabbit" ? "토끼 라이더가 도착했습니다!" : "거북이 라이더가 도착했습니다!",
    bp: ["84%", "76%"], finalDone: true,
  }]);

  const td = trackData[trackState] || trackData[0];

  const filtered = restaurants.filter(r => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [r.name, r.category, ...r.menus.map(m => m.name + " " + m.desc)].join(" ").toLowerCase().includes(q);
  });

  const css = {
    wrap: { minHeight: "100vh", background: th.phone, fontFamily: 'Inter,"Noto Sans KR",system-ui,sans-serif', color: th.text, display: "flex", flexDirection: "column" },
    header: { position: "sticky", top: 0, zIndex: 10, background: "linear-gradient(180deg," + th.headerStart + "," + th.headerEnd + ")", color: th.headerColor, padding: "14px 20px", borderBottom: th.headerBorderBottom, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
    content: { flex: 1, padding: "16px 16px 100px", display: "grid", gap: 16, alignContent: "start", maxWidth: 540, width: "100%", margin: "0 auto", boxSizing: "border-box" },
    section: { background: "#fff", borderRadius: 20, padding: 16, boxShadow: th.sectionShadow },
    input: { width: "100%", padding: "14px 16px", border: "none", outline: "none", borderRadius: 14, background: "#fff", color: th.text, boxShadow: th.inputShadow, fontFamily: "inherit", fontSize: 14, boxSizing: "border-box" },
    bottomBar: { position: "fixed", left: 0, right: 0, bottom: 0, background: th.bottomBarBg, borderTop: "1px solid " + th.bottomBarBorder, backdropFilter: "blur(14px)", boxShadow: "0 -4px 20px rgba(17,24,39,0.06)", padding: "12px 20px", display: "flex", justifyContent: "center", zIndex: 20 },
    bottomInner: { display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center", maxWidth: 540, width: "100%" },
    orderBtn: { border: "none", background: th.primaryBtn, color: "#fff", padding: "14px 20px", borderRadius: 16, fontSize: 14, fontWeight: 900, cursor: "pointer", minWidth: 140, boxShadow: "0 8px 20px " + th.primaryBtn + "44", fontFamily: "inherit" },
    iconBtn: { width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, background: th.iconBtnBg, fontSize: 16, color: th.iconBtnColor, border: "none", cursor: "pointer" },
    addBtn: { border: "none", background: th.brand, color: "#fff", borderRadius: 12, padding: "9px 12px", cursor: "pointer", fontWeight: 800, fontSize: 12, fontFamily: "inherit", transition: "all .15s" },
    backBtn: { width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, fontSize: 18, border: "none", cursor: "pointer" },
  };

  const globalStyle = "@keyframes floatBike{0%,100%{transform:translate(-50%,-50%)}50%{transform:translate(-50%,calc(-50% - 8px))}} @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}} @keyframes pop{0%{transform:scale(1)}50%{transform:scale(1.2)}100%{transform:scale(1)}} *{box-sizing:border-box} body,html{margin:0;padding:0}";

  const optRestaurant = optionTarget ? restaurants.find(x => x.id === optionTarget.rid) : null;
  const optMenu = optRestaurant ? optRestaurant.menus.find(x => x.id === optionTarget.mid) : null;

  // ── 개인정보처리방침 페이지
  if (page === "privacy") {
    return (
      <>
        <style>{globalStyle}</style>
        <PrivacyPage onBack={() => setPage("order")} th={th} />
      </>
    );
  }

  // ── 완료 페이지
  if (page === "complete") {
    const savedKcal = cart.reduce((s, i) => s + (menuCalories[i.menuId] || 600) * i.qty, 0);
    return (
      <div style={{ ...css.wrap, alignItems: "center", justifyContent: "center", textAlign: "center", padding: "40px 24px" }}>
        <style>{globalStyle}</style>
        <div style={{ fontSize: 72, marginBottom: 24, animation: "pop .5s ease" }}>{mode.emoji}</div>
        <h1 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 12px", color: th.text }}>{mode.completeTitle}</h1>
        <div style={{ fontSize: 42, fontWeight: 900, color: th.brand, marginBottom: 8 }}>{savedKcal.toLocaleString()}kcal</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: th.text, marginBottom: 32 }}>아끼셨어요!! 🥗</div>
        <div style={{ fontSize: 13, color: th.muted, marginBottom: 28, lineHeight: 1.6 }}>
          {mode.completeDesc}<br />데모 주문이라 실제로는 0칼로리!
        </div>

        <CoupangAdCard th={th} />

        {installed ? (
          <div style={{ width: "100%", maxWidth: 340, marginBottom: 12, padding: "14px 20px", borderRadius: 16, background: "#dcfce7", border: "1px solid #bbf7d0", color: "#166534", fontWeight: 800, fontSize: 14 }}>
            ✅ 홈화면에 추가되었어요!
          </div>
        ) : canInstall ? (
          <button onClick={handleInstall} style={{ width: "100%", maxWidth: 340, marginBottom: 12, padding: "16px 20px", border: "none", borderRadius: 16, background: "linear-gradient(135deg," + th.heroStart + "," + th.heroEnd + ")", color: "#fff", fontWeight: 900, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
            📲 홈화면에 앱 추가하기
          </button>
        ) : isIos && !installed ? (
          <div style={{ width: "100%", maxWidth: 340, marginBottom: 16, padding: "14px 16px", borderRadius: 16, background: "#f0f9ff", border: "1px solid #bae6fd", color: "#0369a1", fontSize: 12, fontWeight: 700, lineHeight: 1.7, textAlign: "left" }}>
            📱 Safari에서 공유 버튼(□↑) → <strong>홈 화면에 추가</strong>
          </div>
        ) : null}

        <button onClick={resetAll} style={{ ...css.orderBtn, fontSize: 16, padding: "16px 32px", marginTop: 4 }}>
          🏠 처음으로
        </button>

        <Footer th={th} onInfo={() => { resetAll(); setShowInfoModal(true); }} onPrivacy={() => setPage("privacy")} />
      </div>
    );
  }

  // ── 배달 추적 페이지
  if (page === "tracking") {
    return (
      <div style={css.wrap}>
        <style>{globalStyle}</style>
        <div style={css.header}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, maxWidth: 540, margin: "0 auto" }}>
            <button onClick={() => { clearTimers(); setPage("order"); }} style={{ ...css.backBtn, background: th.iconBtnBg, color: th.iconBtnColor }}>←</button>
            <div style={{ flex: 1, textAlign: "center" }}><h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>{mode.label} 추적 {mode.emoji}</h2></div>
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
              <div key={i} style={{ position: "absolute", background: "rgba(148,163,184,0.35)", borderRadius: 999, width: rd.w, height: rd.h, top: rd.t, left: rd.l, right: rd.r, bottom: rd.b, transform: rd.rot ? "rotate(" + rd.rot + ")" : undefined }} />
            ))}
            <div style={{ position: "absolute", zIndex: 2, width: 46, height: 46, borderRadius: "50%", background: "#fff", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 24px rgba(15,23,42,0.12)", top: 24, left: 34 }}>🏪</div>
            <div style={{ position: "absolute", zIndex: 2, width: 46, height: 46, borderRadius: "50%", background: "#fff", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 24px rgba(15,23,42,0.12)", right: 30, bottom: 30 }}>🏠</div>
            <div style={{ position: "absolute", zIndex: 2, width: 54, height: 54, borderRadius: "50%", background: "#111827", color: "#fff", fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 24px rgba(15,23,42,0.12)", left: td.bp[0], top: td.bp[1], transform: "translate(-50%,-50%)", transition: "left .8s ease,top .8s ease", animation: "floatBike 2.2s ease-in-out infinite" }}>{mode.mapIcon}</div>
            <div style={{ position: "absolute", zIndex: 2, background: "rgba(255,255,255,0.86)", color: "#0f172a", borderRadius: 999, padding: "7px 10px", fontSize: 11, fontWeight: 800, top: 76, left: 22 }}>매장 준비 완료</div>
            <div style={{ position: "absolute", zIndex: 2, background: "rgba(255,255,255,0.86)", color: "#0f172a", borderRadius: 999, padding: "7px 10px", fontSize: 11, fontWeight: 800, right: 18, bottom: 82 }}>{orderInfo?.customerName || "배달 주소"} 님</div>
            <div style={{ position: "absolute", zIndex: 2, background: "rgba(255,255,255,0.86)", color: "#0f172a", borderRadius: 999, padding: "7px 10px", fontSize: 11, fontWeight: 800, left: "50%", top: "68%", transform: "translateX(-50%)" }}>{td.riderLabel}</div>
          </div>
          <div style={{ background: "linear-gradient(135deg," + mode.heroStart + "," + mode.heroEnd + ")", color: "#fff", borderRadius: 20, padding: 18 }}>
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
              <div style={{ width: 52, height: 52, borderRadius: 16, background: "#111827", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{deliveryMode === "rabbit" ? "🐇" : "🐢"}</div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 15 }}>{deliveryMode === "rabbit" ? "토끼 라이더" : "거북이 라이더"}</div>
                <div style={{ color: th.muted, fontSize: 12 }}>{deliveryMode === "rabbit" ? "급행 · ⭐ 4.9 · 초고속 이동 중" : "안정형 · ⭐ 4.9 · 천천히 이동 중"}</div>
              </div>
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
                    <div style={{ width: 16, height: 16, borderRadius: "50%", marginTop: 2, background: done || active ? th.primaryBtn : "#d1d5db", boxShadow: active ? "0 0 0 6px " + th.primaryBtn + "28" : "none", transition: ".3s" }} />
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
              {[["주문자", orderInfo.customerName], ["배달 주소", orderInfo.address], ["배달 타입", deliveryModes[orderInfo.deliveryMode]?.label || mode.label], ["결제수단", orderInfo.payment], ["예상 금액", fmt(orderInfo.total)]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: th.muted }}>{k}</span><strong>{v}</strong>
                </div>
              ))}
            </div>
          )}
          <Footer th={th} onInfo={() => { clearTimers(); setPage("order"); setShowInfoModal(true); }} onPrivacy={() => setPage("privacy")} />
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

  // ── 주문서 작성 페이지
  if (page === "checkout") {
    return (
      <div style={css.wrap}>
        <style>{globalStyle}</style>
        {reviewTarget && <ReviewModal restaurant={reviewTarget} onClose={() => setReviewTarget(null)} />}
        <div style={css.header}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, maxWidth: 540, margin: "0 auto" }}>
            <button onClick={() => setPage("order")} style={{ ...css.backBtn, background: th.iconBtnBg, color: th.iconBtnColor }}>←</button>
            <div style={{ flex: 1, textAlign: "center" }}><h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>주문서 작성 📝</h2></div>
            <div style={{ width: 38 }} />
          </div>
        </div>
        <div style={css.content}>
          <div style={css.section}>
            <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 12 }}>주문 내역 ({cartCount}개) 🛒</div>
            <div style={{ display: "grid", gap: 8 }}>
              {cart.map(item => (
                <div key={item.cartKey} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center", padding: 13, background: "#f9fafb", border: "1px solid #edf0f3", borderRadius: 16 }}>
                  <div>
                    <h4 style={{ margin: "0 0 2px", fontWeight: 900, fontSize: 14 }}>{item.name}</h4>
                    {item.optLabel && <div style={{ fontSize: 11, color: th.brand, fontWeight: 700, marginBottom: 2 }}>{item.optLabel}</div>}
                    <div style={{ color: th.muted, fontSize: 12 }}>{item.restaurantName}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                      <button onClick={() => changeQty(item.cartKey, -1)} style={{ width: 30, height: 30, borderRadius: 10, border: "none", background: "#e5e7eb", cursor: "pointer", fontWeight: 900, fontFamily: "inherit", fontSize: 15 }}>−</button>
                      <strong style={{ fontSize: 14, minWidth: 20, textAlign: "center" }}>{item.qty}</strong>
                      <button onClick={() => changeQty(item.cartKey, 1)} style={{ width: 30, height: 30, borderRadius: 10, border: "none", background: "#e5e7eb", cursor: "pointer", fontWeight: 900, fontFamily: "inherit", fontSize: 15 }}>＋</button>
                    </div>
                  </div>
                  <div style={{ fontWeight: 900, whiteSpace: "nowrap", fontSize: 15, color: th.text }}>{fmt(item.price * item.qty)}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid " + th.line, display: "grid", gap: 5 }}>
              {[["상품 금액", fmt(totals.sub)], ["배달비", fmt(totals.del)], ["서비스 수수료", fmt(totals.svc)]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: th.muted }}><span>{k}</span><strong style={{ color: th.text }}>{v}</strong></div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 17, fontWeight: 900, marginTop: 4, paddingTop: 8, borderTop: "1px solid " + th.line }}><span>총 결제예상금액</span><strong style={{ color: th.brand }}>{fmt(totals.total)}</strong></div>
              <div style={{ fontSize: 13, color: th.brand, fontWeight: 800, marginTop: 6 }}>선택한 배달: {mode.emoji} {mode.label}</div>
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
                <textarea value={rq} onChange={e => setRq(e.target.value)} placeholder="예: 문 앞에 놔주세요" style={{ width: "100%", border: "1px solid " + th.line, borderRadius: 14, padding: "14px 16px", resize: "vertical", minHeight: 80, outline: "none", background: "#fff", fontFamily: "inherit", fontSize: 14, boxSizing: "border-box" }} />
              </div>
            </div>
          </div>
          <div style={css.section}>
            <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 12 }}>결제수단 💳</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {[["💳 카드", "카드"], ["📱 간편결제", "간편결제"], ["💵 현장결제", "현장결제"]].map(([label, val]) => (
                <div key={val} onClick={() => setPayment(val)} style={{ border: "1.5px solid " + (payment === val ? th.brand : th.line), borderRadius: 14, padding: "14px 8px", textAlign: "center", cursor: "pointer", fontWeight: 800, background: payment === val ? th.activeBg : "#fff", color: payment === val ? th.brandDark : th.text, fontSize: 12, transition: ".2s" }}>{label}</div>
              ))}
            </div>
          </div>
          <Footer th={th} onInfo={() => { setPage("order"); setShowInfoModal(true); }} onPrivacy={() => setPage("privacy")} />
        </div>
        {showReceipt && receiptData && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 21, background: "rgba(15,23,42,0.18)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
              <div style={{ width: "100%", maxWidth: 360, background: "#fff", borderRadius: 24, padding: "22px 20px 20px", boxShadow: "0 20px 50px rgba(15,23,42,0.18)", border: "1px solid rgba(226,232,240,0.9)", animation: "pop .25s ease" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 16, background: "linear-gradient(135deg,#dbeafe,#bfdbfe)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>??</div>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 900, color: "#0f172a" }}>?? ???</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{receiptData.payment}? ??? ???? ???</div>
                  </div>
                </div>
                <div style={{ background: "#f8fafc", borderRadius: 18, padding: "14px 16px", border: "1px solid #e2e8f0", display: "grid", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13 }}>
                    <span style={{ color: "#64748b" }}>???</span>
                    <strong style={{ color: "#0f172a" }}>{receiptData.customerName}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13 }}>
                    <span style={{ color: "#64748b" }}>????</span>
                    <strong style={{ color: "#0f172a" }}>{receiptData.payment}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 14 }}>
                    <span style={{ color: "#64748b" }}>????</span>
                    <strong style={{ color: th.brand }}>{fmt(receiptData.total)}</strong>
                  </div>
                </div>
                <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, color: "#2563eb", fontSize: 12, fontWeight: 800 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: "#2563eb", boxShadow: "0 0 0 6px rgba(37,99,235,0.14)" }} />
                  ?? ?? ? ?? ?? ???? ?????.
                </div>
              </div>
            </div>
            <div style={{ position: "fixed", left: "50%", bottom: 86, transform: "translateX(-50%)", width: "calc(100% - 32px)", maxWidth: 508, zIndex: 22 }}>
              <div style={{ background: "linear-gradient(180deg,#f0fdf4,#ffffff)", border: "1px solid #bbf7d0", boxShadow: "0 10px 30px rgba(22,101,52,0.10)", borderRadius: 18, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 22 }}>?</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 900, color: "#166534" }}>??? ???????!</div>
                    <div style={{ fontSize: 12, color: "#166534", marginTop: 2 }}>{deliveryMode === "rabbit" ? "?? ? ???? ?? ???? ?????." : "?? ? ????? ?? ???? ?????."}</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        <div style={css.bottomBar}>
          <div style={css.bottomInner}>
            <div><span style={{ fontSize: 11, color: th.muted, fontWeight: 700 }}>총 결제예상금액</span><br /><strong style={{ fontSize: 18, fontWeight: 900, color: th.brand }}>{fmt(totals.total)}</strong></div>
            <button onClick={simulateOrder} style={css.orderBtn}>🚀 데모 주문하기</button>
          </div>
        </div>
      </div>
    );
  }

  // ── 메인(주문) 페이지
  return (
    <div style={css.wrap}>
      <style>{globalStyle}</style>
      {reviewTarget && <ReviewModal restaurant={reviewTarget} onClose={() => setReviewTarget(null)} />}
      {showInfoModal && (
        <InfoModal
          email={inquiryEmail}
          onClose={() => setShowInfoModal(false)}
          onPrivacy={() => { setShowInfoModal(false); setPage("privacy"); }}
        />
      )}
      {optionTarget && optMenu && (
        <OptionSheet
          menu={optMenu}
          brand={th.primaryBtn}
          onClose={() => setOptionTarget(null)}
          onConfirm={({ spicy, size, toppings, qty, extraPrice }) =>
            addToCartDirect(optionTarget.rid, optionTarget.mid, qty, extraPrice, spicy, size, toppings)
          }
        />
      )}
      <div style={css.header}>
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, maxWidth: 540, margin: "0 auto", minHeight: 32 }}>
          <div style={{ display: "flex", gap: 4, zIndex: 1 }}>
            {[["purple","💜"],["mint","🧡"],["blue","💙"],["pink","🩵"]].map(([key, emoji]) => (
              <button key={key} onClick={() => setTheme(key)} style={{ ...css.iconBtn, width: 28, height: 28, fontSize: 11, opacity: theme === key ? 1 : 0.5, border: theme === key ? "2px solid rgba(255,255,255,0.8)" : "2px solid transparent" }}>{emoji}</button>
            ))}
          </div>
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none", width: "max-content" }}>
            <div style={{ fontSize: 11, color: th.headerTextAlt }}>배달 주소</div>
            <div style={{ fontSize: 15, fontWeight: 900 }}>우리집 ▼</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, zIndex: 1 }}>
            <div style={{ position: "relative" }}>
              <button style={{ ...css.iconBtn, width: 32, height: 32, fontSize: 14 }}>🛒</button>
              {cartCount > 0 && (
                <div style={{ position: "absolute", top: -4, right: -4, background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 900, borderRadius: 99, minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>{cartCount}</div>
              )}
            </div>
            <button onClick={() => setShowInfoModal(true)} style={{ ...css.iconBtn, width: 32, height: 32, fontSize: 14, fontWeight: 900 }} aria-label="앱 안내 보기" title="앱 안내">?</button>
            <button onClick={resetAll} style={{ border: "none", borderRadius: 10, background: "rgba(255,255,255,0.14)", color: th.headerColor, padding: "6px 10px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", fontSize: 11 }}>초기화</button>
          </div>
        </div>
        <div style={{ maxWidth: 540, margin: "8px auto 0" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 음식점이나 메뉴를 검색해보세요" style={css.input} />
        </div>
      </div>

      <div style={css.content}>
        <div style={{ background: "linear-gradient(135deg,#fff7ed,#ffedd5)", border: "1px solid #fdba74", color: "#9a3412", padding: "12px 14px", borderRadius: 16, fontSize: 12, fontWeight: 800, lineHeight: 1.45 }}>
          🚧 실제 주문·결제·배달은 발생하지 않습니다.
        </div>

        <div style={css.section}>
          <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 12 }}>배달 타입 선택</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {Object.values(deliveryModes).map((m) => {
              const active = deliveryMode === m.key;
              return (
                <button key={m.key} onClick={() => setDeliveryMode(m.key)} style={{ border: active ? "2px solid " + th.brand : "1px solid " + th.line, background: active ? th.activeBg : "#fff", borderRadius: 16, padding: "14px 12px", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{m.emoji}</div>
                  <div style={{ fontWeight: 900, fontSize: 15 }}>{m.label}</div>
                  <div style={{ fontSize: 12, color: th.muted, marginTop: 4 }}>{m.key === "rabbit" ? "빠른 도착 연출" : "느긋한 도착 연출"}</div>
                </button>
              );
            })}
          </div>
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
              <div key={r.id} style={{ border: "1px solid " + th.line, borderRadius: 20, overflow: "hidden", background: "#fff" }}>
                <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, background: thumbGradients[ri % thumbGradients.length], position: "relative" }}>
                  {r.emoji}
                  {r.badge && badgeColors[r.badge] && (
                    <div style={{ position: "absolute", top: 10, left: 10, fontSize: 11, padding: "5px 10px", borderRadius: 999, background: badgeColors[r.badge].bg, color: badgeColors[r.badge].color, border: "1px solid " + badgeColors[r.badge].border, fontWeight: 800 }}>{r.badge}</div>
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
                    {r.menus.map(m => {
                      const hasOpts = m.options && (m.options.spicy || m.options.size || (m.options.toppings && m.options.toppings.length > 0));
                      return (
                        <div key={m.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center", padding: 12, border: "1px solid " + th.line, borderRadius: 14, background: "#fcfcfd" }}>
                          <div style={{ display: "flex", gap: 12, minWidth: 0 }}>
                            <MenuImage
                              src={getMenuImageSrc(m.id)}
                              alt={m.name}
                              width={88}
                              height={88}
                              borderRadius={14}
                            />
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 800, marginBottom: 3, fontSize: 14 }}>{m.name}</div>
                              <div style={{ color: th.muted, fontSize: 12 }}>{m.desc}</div>
                              <div style={{ color: "#10b981", fontSize: 11, fontWeight: 700, marginTop: 2 }}>🔥 {(menuCalories[m.id] || 0).toLocaleString()}kcal</div>
                              {hasOpts && <div style={{ fontSize: 10, color: th.brand, fontWeight: 700, marginTop: 3 }}>옵션 선택 가능 ›</div>}
                            </div>
                          </div>
                          <div style={{ display: "grid", justifyItems: "end", gap: 6 }}>
                            <div style={{ fontWeight: 900, whiteSpace: "nowrap", fontSize: 14 }}>{fmt(m.price)}</div>
                            <button onClick={() => openOption(r.id, m.id)} style={{ ...css.addBtn, animation: addedAnim === m.id ? "pop .3s ease" : "none" }}>
                              {addedAnim === m.id ? "✓ 담김" : "담기"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  </div>
                </div>
            ))}
          </div>
        </div>

        {/* 푸터 */}
        <Footer th={th} onInfo={() => setShowInfoModal(true)} onPrivacy={() => setPage("privacy")} />
      </div>

      <div style={css.bottomBar}>
        <div style={css.bottomInner}>
          <div><span style={{ fontSize: 11, color: th.muted, fontWeight: 700 }}>총 결제예상금액</span><br /><strong style={{ fontSize: 18, fontWeight: 900, color: cart.length ? th.brand : th.text }}>{fmt(totals.total)}</strong></div>
          <button onClick={goToCheckout} style={{ ...css.orderBtn, opacity: cart.length ? 1 : .5 }}>📋 주문하기 {cartCount > 0 ? "(" + cartCount + ")" : ""}</button>
        </div>
      </div>
    </div>
  );
}
