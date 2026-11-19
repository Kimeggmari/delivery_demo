// Distinct brand-identity logos for each built-in restaurant (id 1..19),
// intentionally designed in varied real-world visual languages (franchise
// badges, Japanese noren/woodblock, Seongsu editorial, Korean pocha neon,
// traditional seals, European crests, retro bunsik ovals, etc.) so the feed
// feels like a real neighborhood of independent businesses.

const FONT_SANS = 'Inter, "Noto Sans KR", -apple-system, sans-serif';
const FONT_SERIF = 'Georgia, "AppleMyungjo", "Nanum Myeongjo", serif';

const BRAND_SPECS = {
  // 1. 한입치킨 강남점 — Bold American-diner / Korean chicken franchise badge
  1: {
    banner: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 55%, #fde68a 100%)",
    render: () => (
      <g transform="rotate(-4 56 44)">
        <rect x="10" y="14" width="92" height="60" rx="16" fill="#dc2626" stroke="#fef08a" strokeWidth="3.5" />
        <rect x="15" y="19" width="82" height="50" rx="11" fill="none" stroke="#fca5a5" strokeWidth="1.2" strokeDasharray="3 2" />
        <text x="56" y="37" textAnchor="middle" fill="#fef08a" fontFamily={FONT_SANS} fontWeight="900" fontSize="10" letterSpacing="1">ONE BITE</text>
        <text x="56" y="56" textAnchor="middle" fill="#ffffff" fontFamily={FONT_SANS} fontWeight="900" fontSize="17" letterSpacing="-0.5">한입치킨</text>
        <circle cx="96" cy="20" r="8" fill="#facc15" stroke="#dc2626" strokeWidth="2" />
        <path d="M96 15.5l1.3 2.9 3.2.3-2.4 2.1.7 3.1-2.8-1.6-2.8 1.6.7-3.1-2.4-2.1 3.2-.3z" fill="#dc2626" />
      </g>
    ),
  },

  // 2. 도쿄라멘 스테이션 — Deep indigo Japanese noren curtain & red station mark
  2: {
    banner: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 55%, #cbd5e1 100%)",
    render: () => (
      <g>
        <rect x="14" y="10" width="84" height="4.5" rx="2.2" fill="#475569" />
        <path d="M18 14h24v56H18zM44 14h24v56H44zM70 14h24v56H70z" fill="#1e293b" />
        <path d="M18 67h24M44 67h24M70 67h24" stroke="#94a3b8" strokeWidth="1.2" />
        <circle cx="56" cy="39" r="16" fill="#dc2626" />
        <text x="56" y="44" textAnchor="middle" fill="#ffffff" fontFamily={FONT_SERIF} fontWeight="700" fontSize="13.5">東京</text>
        <text x="56" y="63" textAnchor="middle" fill="#e2e8f0" fontFamily={FONT_SANS} fontWeight="800" fontSize="6.8" letterSpacing="1.2">RAMEN STN</text>
      </g>
    ),
  },

  // 3. 파스타랩 성수키친 — Minimalist Seongsu editorial paper label
  3: {
    banner: "linear-gradient(135deg, #fafaf9 0%, #f5f5f4 55%, #e7e5e4 100%)",
    render: () => (
      <g>
        <rect x="10" y="13" width="92" height="62" rx="4" fill="#fffdf9" stroke="#292524" strokeWidth="1.8" />
        <rect x="14" y="17" width="84" height="54" rx="2" fill="none" stroke="#d6d3d1" strokeWidth="0.9" />
        <text x="56" y="41" textAnchor="middle" fill="#1c1917" fontFamily={FONT_SERIF} fontStyle="italic" fontWeight="700" fontSize="16.5">Pasta Lab.</text>
        <line x1="28" y1="48" x2="84" y2="48" stroke="#c2410c" strokeWidth="1.2" />
        <text x="56" y="60" textAnchor="middle" fill="#78716c" fontFamily={FONT_SANS} fontWeight="700" fontSize="6.4" letterSpacing="1">SEONGSU KITCHEN</text>
        <circle cx="92" cy="24" r="3" fill="#ea580c" />
      </g>
    ),
  },

  // 4. 그린포케 하우스 — Airy organic wellness arch with botanical leaf
  4: {
    banner: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 55%, #bbf7d0 100%)",
    render: () => (
      <g>
        <path d="M15 74V43a41 34 0 0 1 82 0v31H15z" fill="#065f46" />
        <path d="M20 70V43a36 29 0 0 1 72 0v27" fill="none" stroke="#6ee7b7" strokeWidth="1.2" opacity="0.7" />
        <path d="M56 19c8 4.5 10 13 0 19-10-6-8-14.5 0-19z" fill="#34d399" />
        <line x1="56" y1="21" x2="56" y2="38" stroke="#065f46" strokeWidth="1.3" />
        <text x="56" y="54" textAnchor="middle" fill="#ecfdf5" fontFamily={FONT_SANS} fontWeight="900" fontSize="9.8" letterSpacing="0.8">GREEN POKE</text>
        <text x="56" y="65" textAnchor="middle" fill="#a7f3d0" fontFamily={FONT_SANS} fontWeight="700" fontSize="6.4" letterSpacing="1.2">FRESH BOWL</text>
      </g>
    ),
  },

  // 5. 엄마손 한식당 — Traditional Korean hanji card with brush ring & red seal
  5: {
    banner: "linear-gradient(135deg, #fefce8 0%, #fef3c7 55%, #fed7aa 100%)",
    render: () => (
      <g>
        <rect x="12" y="12" width="88" height="64" rx="10" fill="#fffbeb" stroke="#92400e" strokeWidth="2" />
        <circle cx="46" cy="44" r="21" fill="none" stroke="#b45309" strokeWidth="2.6" strokeDasharray="112 14" strokeLinecap="round" opacity="0.32" />
        <text x="46" y="42" textAnchor="middle" fill="#451a03" fontFamily={FONT_SERIF} fontWeight="700" fontSize="15.5">엄마손</text>
        <text x="46" y="56" textAnchor="middle" fill="#92400e" fontFamily={FONT_SANS} fontWeight="800" fontSize="9" letterSpacing="1.2">한식당</text>
        <rect x="76" y="45" width="15" height="15" rx="2.5" fill="#dc2626" />
        <text x="83.5" y="56" textAnchor="middle" fill="#fffbeb" fontFamily={FONT_SERIF} fontWeight="700" fontSize="9.5">味</text>
      </g>
    ),
  },

  // 6. 용용차이나 — Crimson & gold Chinese octagonal plaque
  6: {
    banner: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 55%, #fecaca 100%)",
    render: () => (
      <g>
        <polygon points="34,10 78,10 96,28 96,60 78,78 34,78 16,60 16,28" fill="#991b1b" stroke="#fbbf24" strokeWidth="3" />
        <polygon points="37,15 75,15 91,31 91,57 75,73 37,73 21,57 21,31" fill="none" stroke="#fde68a" strokeWidth="1.2" />
        <text x="56" y="42" textAnchor="middle" fill="#fde047" fontFamily={FONT_SERIF} fontWeight="900" fontSize="20" letterSpacing="1.5">龍龍</text>
        <line x1="34" y1="49" x2="78" y2="49" stroke="#fbbf24" strokeWidth="1" opacity="0.7" />
        <text x="56" y="61" textAnchor="middle" fill="#fef3c7" fontFamily={FONT_SANS} fontWeight="800" fontSize="8.5" letterSpacing="0.5">용용차이나</text>
      </g>
    ),
  },

  // 7. 맵다매워 떡볶이 — Tilted spicy street-stall warning sticker
  7: {
    banner: "linear-gradient(135deg, #fff7ed 0%, #fed7aa 55%, #fca5a5 100%)",
    render: () => (
      <g transform="rotate(3 56 44)">
        <rect x="11" y="16" width="90" height="56" rx="8" fill="#facc15" stroke="#18181b" strokeWidth="3" />
        <rect x="11" y="16" width="90" height="16" rx="5" fill="#18181b" />
        <text x="56" y="27" textAnchor="middle" fill="#facc15" fontFamily={FONT_SANS} fontWeight="900" fontSize="7.4" letterSpacing="0.8">WARNING · HOT</text>
        <text x="56" y="50" textAnchor="middle" fill="#dc2626" fontFamily={FONT_SANS} fontWeight="900" fontSize="16.5" letterSpacing="-0.5">맵다매워</text>
        <text x="56" y="63" textAnchor="middle" fill="#18181b" fontFamily={FONT_SANS} fontWeight="900" fontSize="8.8" letterSpacing="0.8">떡볶이 전문</text>
      </g>
    ),
  },

  // 8. 카페 달콤 로스터리 — Specialty coffee circular rubber stamp
  8: {
    banner: "linear-gradient(135deg, #fafaf9 0%, #f5f5f4 55%, #e7e5e4 100%)",
    render: () => (
      <g>
        <circle cx="56" cy="44" r="35" fill="#fffbeb" stroke="#451a03" strokeWidth="2.4" />
        <circle cx="56" cy="44" r="30" fill="none" stroke="#92400e" strokeWidth="1" strokeDasharray="2 2" />
        <ellipse cx="56" cy="29" rx="5.8" ry="8" transform="rotate(24 56 29)" fill="#78350f" />
        <path d="M53.5 23c1.8 4.5 1.8 8 0 12.5" stroke="#fffbeb" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <text x="56" y="49" textAnchor="middle" fill="#451a03" fontFamily={FONT_SERIF} fontWeight="700" fontSize="10.5" letterSpacing="0.5">DALKOM</text>
        <text x="56" y="59.5" textAnchor="middle" fill="#92400e" fontFamily={FONT_SANS} fontWeight="700" fontSize="6.2" letterSpacing="0.8">ROASTERY</text>
      </g>
    ),
  },

  // 9. 마라홍 마라탕 — Sichuan red lacquer diamond plaque
  9: {
    banner: "linear-gradient(135deg, #fef2f2 0%, #fecaca 55%, #fca5a5 100%)",
    render: () => (
      <g>
        <rect x="28" y="16" width="56" height="56" rx="6" transform="rotate(45 56 44)" fill="#18181b" stroke="#ef4444" strokeWidth="3" />
        <rect x="33" y="21" width="46" height="46" rx="4" transform="rotate(45 56 44)" fill="#b91c1c" stroke="#fde047" strokeWidth="1.4" />
        <text x="56" y="43" textAnchor="middle" fill="#fef08a" fontFamily={FONT_SERIF} fontWeight="900" fontSize="18.5">麻辣</text>
        <text x="56" y="56" textAnchor="middle" fill="#ffffff" fontFamily={FONT_SANS} fontWeight="900" fontSize="8">마라홍</text>
      </g>
    ),
  },

  // 10. 딜리셔스 디저트 — Pastel scalloped patisserie sticker
  10: {
    banner: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 55%, #fbcfe8 100%)",
    render: () => (
      <g>
        <circle cx="56" cy="44" r="35" fill="#fff1f2" stroke="#f472b6" strokeWidth="2.5" strokeDasharray="8 3" />
        <circle cx="56" cy="44" r="30" fill="#fbcfe8" />
        <circle cx="56" cy="26" r="4" fill="#e11d48" />
        <path d="M56 21.5c2-2.8 4.5-2.8 5.5-1" stroke="#16a34a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <text x="56" y="45" textAnchor="middle" fill="#9d174d" fontFamily={FONT_SERIF} fontStyle="italic" fontWeight="700" fontSize="11.5">Delicious</text>
        <text x="56" y="56.5" textAnchor="middle" fill="#be185d" fontFamily={FONT_SANS} fontWeight="800" fontSize="6.4" letterSpacing="0.8">DESSERTS</text>
      </g>
    ),
  },

  // 11. 멋진 막창 예쁜 곱창 — Retro Korean night-market pocha neon sign
  11: {
    banner: "linear-gradient(135deg, #1e1b4b 0%, #312e81 55%, #4c1d95 100%)",
    render: () => (
      <g>
        <rect x="9" y="15" width="94" height="58" rx="14" fill="#0f172a" stroke="#f472b6" strokeWidth="2.4" />
        <rect x="14" y="20" width="84" height="48" rx="10" fill="none" stroke="#fb923c" strokeWidth="1.2" opacity="0.85" />
        <text x="56" y="38" textAnchor="middle" fill="#fda4af" fontFamily={FONT_SANS} fontWeight="900" fontSize="11" letterSpacing="0.3">멋진 막창</text>
        <line x1="28" y1="44" x2="84" y2="44" stroke="#f472b6" strokeWidth="1" opacity="0.6" />
        <text x="56" y="59" textAnchor="middle" fill="#fde047" fontFamily={FONT_SANS} fontWeight="900" fontSize="12.5" letterSpacing="0.3">예쁜 곱창</text>
      </g>
    ),
  },

  // 12. 스시히로 초밥집 — Minimalist omakase hinoki wood plaque & hanko
  12: {
    banner: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 55%, #dbeafe 100%)",
    render: () => (
      <g>
        <rect x="12" y="11" width="88" height="66" rx="6" fill="#fef3c7" stroke="#1e293b" strokeWidth="2" />
        <path d="M22 63c8-4.5 16-4.5 24 0s16 4.5 24 0 12-3 18 0" fill="none" stroke="#0369a1" strokeWidth="2" strokeLinecap="round" />
        <text x="45" y="38" textAnchor="middle" fill="#0f172a" fontFamily={FONT_SERIF} fontWeight="700" fontSize="13.5">스시히로</text>
        <text x="45" y="51" textAnchor="middle" fill="#64748b" fontFamily={FONT_SANS} fontWeight="800" fontSize="6.8" letterSpacing="1">SUSHI HIRO</text>
        <rect x="78" y="23" width="14" height="14" rx="2" fill="#dc2626" />
        <text x="85" y="33.5" textAnchor="middle" fill="#fff" fontFamily={FONT_SERIF} fontWeight="700" fontSize="9.5">広</text>
      </g>
    ),
  },

  // 13. 엽땡떡볶이 — Loud comic starburst franchise sticker
  13: {
    banner: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 55%, #fef08a 100%)",
    render: () => (
      <g>
        <polygon
          points="56,6 65,18 81,12 81,27 97,30 88,44 97,58 81,61 81,76 65,70 56,82 47,70 31,76 31,61 15,58 24,44 15,30 31,27 31,12 47,18"
          fill="#dc2626"
          stroke="#fef08a"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <text x="56" y="45" textAnchor="middle" fill="#fef08a" fontFamily={FONT_SANS} fontWeight="900" fontSize="15.5" letterSpacing="-0.5">엽땡!</text>
        <text x="56" y="57.5" textAnchor="middle" fill="#ffffff" fontFamily={FONT_SANS} fontWeight="900" fontSize="8.5">떡볶이</text>
      </g>
    ),
  },

  // 14. 버거팩토리 — Industrial vintage hexagon workshop emblem
  14: {
    banner: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 55%, #fed7aa 100%)",
    render: () => (
      <g>
        <polygon points="56,8 93,24 93,64 56,80 19,64 19,24" fill="#292524" stroke="#f59e0b" strokeWidth="3" />
        <path d="M41 31c0-5.5 6.5-8.5 15-8.5s15 3 15 8.5H41z" fill="#f59e0b" />
        <rect x="39" y="34" width="34" height="3.8" rx="1.9" fill="#ef4444" />
        <text x="56" y="50" textAnchor="middle" fill="#ffffff" fontFamily={FONT_SANS} fontWeight="900" fontSize="11" letterSpacing="0.6">BURGER</text>
        <text x="56" y="61" textAnchor="middle" fill="#fbbf24" fontFamily={FONT_SANS} fontWeight="800" fontSize="7.4" letterSpacing="1">FACTORY</text>
      </g>
    ),
  },

  // 15. 화덕피자랩 — Classic Italian pizzeria circular stamp
  15: {
    banner: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 55%, #fecaca 100%)",
    render: () => (
      <g>
        <circle cx="56" cy="44" r="35" fill="#9a3412" stroke="#fef3c7" strokeWidth="2.5" />
        <circle cx="56" cy="44" r="29.5" fill="none" stroke="#fdba74" strokeWidth="1.2" />
        <path d="M45 36a11 11 0 0 1 22 0z" fill="#431407" />
        <path d="M56 27.5c2.2 2.2 3.5 4.5 3.5 6.5a3.5 3.5 0 0 1-7 0c0-2 1.3-4.3 3.5-6.5z" fill="#facc15" />
        <text x="56" y="50.5" textAnchor="middle" fill="#fff7ed" fontFamily={FONT_SERIF} fontWeight="700" fontSize="11">화덕피자</text>
        <text x="56" y="60.5" textAnchor="middle" fill="#fde68a" fontFamily={FONT_SANS} fontWeight="900" fontSize="6.4" letterSpacing="1">OVEN LAB</text>
      </g>
    ),
  },

  // 16. 문어대왕 타코야끼 — Osaka festival lantern oval mascot
  16: {
    banner: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 55%, #fed7aa 100%)",
    render: () => (
      <g>
        <ellipse cx="56" cy="45" rx="40" ry="31" fill="#e11d48" stroke="#fef08a" strokeWidth="2.8" />
        <polygon points="47,24 49,17 56,21.5 63,17 65,24" fill="#facc15" />
        <circle cx="48" cy="35" r="2.5" fill="#1e1b4b" />
        <circle cx="64" cy="35" r="2.5" fill="#1e1b4b" />
        <circle cx="56" cy="39.5" r="2.6" fill="#9f1239" />
        <text x="56" y="54.5" textAnchor="middle" fill="#ffffff" fontFamily={FONT_SANS} fontWeight="900" fontSize="12.5" letterSpacing="-0.3">문어대왕</text>
        <text x="56" y="64.5" textAnchor="middle" fill="#fef08a" fontFamily={FONT_SANS} fontWeight="800" fontSize="6.4" letterSpacing="0.8">TAKOYAKI</text>
      </g>
    ),
  },

  // 17. 빙수나라 24시 — Frosty icy blue cloud/pill sign with 24H tag
  17: {
    banner: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 55%, #bae6fd 100%)",
    render: () => (
      <g>
        <rect x="10" y="16" width="92" height="56" rx="28" fill="#0284c7" stroke="#ffffff" strokeWidth="3" />
        <rect x="16" y="22" width="80" height="44" rx="22" fill="none" stroke="#bae6fd" strokeWidth="1.2" />
        <path d="M29 37v14M23 40.5l12 7M35 40.5l-12 7" stroke="#e0f2fe" strokeWidth="1.8" strokeLinecap="round" />
        <text x="66" y="43.5" textAnchor="middle" fill="#ffffff" fontFamily={FONT_SANS} fontWeight="900" fontSize="13">빙수나라</text>
        <rect x="52" y="49" width="28" height="12" rx="6" fill="#fef08a" />
        <text x="66" y="57.8" textAnchor="middle" fill="#0369a1" fontFamily={FONT_SANS} fontWeight="900" fontSize="8">24H</text>
      </g>
    ),
  },

  // 18. 김밥천사 — Cheerful retro Korean bunsik oval signboard
  18: {
    banner: "linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 55%, #fef9c3 100%)",
    render: () => (
      <g>
        <ellipse cx="56" cy="46" rx="44" ry="27" fill="#0d9488" stroke="#fef08a" strokeWidth="3" />
        <ellipse cx="56" cy="14" rx="12" ry="3.5" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
        <path d="M12 44c-5-4-6-10-1-12 4-1 6 3 7 6zM100 44c5-4 6-10 1-12-4-1-6 3-7 6z" fill="#ffffff" />
        <text x="56" y="47" textAnchor="middle" fill="#ffffff" fontFamily={FONT_SANS} fontWeight="900" fontSize="14.5" letterSpacing="-0.3">김밥천사</text>
        <text x="56" y="60" textAnchor="middle" fill="#fef08a" fontFamily={FONT_SANS} fontWeight="800" fontSize="7" letterSpacing="0.8">SINCE 2026</text>
      </g>
    ),
  },

  // 19. 브뤼셀 와플하우스 — Classic Belgian heraldic crest shield
  19: {
    banner: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 55%, #e2e8f0 100%)",
    render: () => (
      <g>
        <path d="M17 13h78v31c0 18-17 29-39 36-22-7-39-18-39-36V13z" fill="#1e3a8a" stroke="#f59e0b" strokeWidth="2.8" />
        <path d="M22 18h68v25c0 14-14 23-34 29-20-6-34-15-34-29V18z" fill="none" stroke="#fde68a" strokeWidth="1" opacity="0.7" />
        <g opacity="0.22" stroke="#fde68a" strokeWidth="1.2">
          <line x1="42" y1="21" x2="42" y2="35" />
          <line x1="56" y1="21" x2="56" y2="35" />
          <line x1="70" y1="21" x2="70" y2="35" />
          <line x1="36" y1="26" x2="76" y2="26" />
          <line x1="36" y1="32" x2="76" y2="32" />
        </g>
        <text x="56" y="44" textAnchor="middle" fill="#fef08a" fontFamily={FONT_SERIF} fontWeight="700" fontSize="10.5" letterSpacing="0.5">BRUSSELS</text>
        <text x="56" y="56" textAnchor="middle" fill="#e0e7ff" fontFamily={FONT_SANS} fontWeight="800" fontSize="7.2" letterSpacing="1.2">WAFFLE</text>
      </g>
    ),
  },
};

// Varied independent-shop templates for user-added custom restaurants so they
// also look like distinct local businesses rather than clones.
const CUSTOM_PALETTES = [
  { banner: "linear-gradient(135deg,#fff7ed,#fed7aa)", bg: "#c2410c", fg: "#fff7ed", accent: "#fde047" },
  { banner: "linear-gradient(135deg,#f0f9ff,#bae6fd)", bg: "#0f172a", fg: "#f8fafc", accent: "#38bdf8" },
  { banner: "linear-gradient(135deg,#ecfdf5,#bbf7d0)", bg: "#065f46", fg: "#ecfdf5", accent: "#6ee7b7" },
  { banner: "linear-gradient(135deg,#fdf2f8,#fbcfe8)", bg: "#9d174d", fg: "#fff1f2", accent: "#fbcfe8" },
  { banner: "linear-gradient(135deg,#fefce8,#fde68a)", bg: "#78350f", fg: "#fffbeb", accent: "#fbbf24" },
  { banner: "linear-gradient(135deg,#f5f3ff,#ddd6fe)", bg: "#4c1d95", fg: "#f5f3ff", accent: "#c4b5fd" },
];

function hashKey(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 33 + str.charCodeAt(i)) >>> 0;
  return h;
}

function shortTitle(restaurant) {
  const raw = (restaurant?.name?.ko || restaurant?.name?.en || "맛집").trim();
  const firstWord = raw.split(/\s+/)[0] || raw;
  return firstWord.length > 5 ? firstWord.slice(0, 5) : firstWord;
}

function customSpecFor(restaurant) {
  const h = hashKey(String(restaurant?.id ?? restaurant?.name?.ko ?? "shop"));
  const pal = CUSTOM_PALETTES[h % CUSTOM_PALETTES.length];
  const variant = h % 4;
  const title = shortTitle(restaurant);
  const sub = (restaurant?.category?.ko || "LOCAL").slice(0, 5);
  const fontSize = title.length >= 5 ? 10.5 : title.length === 4 ? 12 : title.length === 3 ? 14 : 16;

  return {
    banner: pal.banner,
    render: () => {
      if (variant === 0) {
        return (
          <g>
            <circle cx="56" cy="44" r="35" fill={pal.bg} stroke={pal.accent} strokeWidth="2.5" />
            <circle cx="56" cy="44" r="29.5" fill="none" stroke={pal.fg} strokeWidth="1" opacity="0.35" />
            <text x="56" y="45" textAnchor="middle" fill={pal.fg} fontFamily={FONT_SANS} fontWeight="900" fontSize={fontSize}>{title}</text>
            <text x="56" y="58.5" textAnchor="middle" fill={pal.accent} fontFamily={FONT_SANS} fontWeight="800" fontSize="7.5" letterSpacing="0.8">{sub}</text>
          </g>
        );
      }
      if (variant === 1) {
        return (
          <g>
            <rect x="11" y="15" width="90" height="58" rx="6" fill="#ffffff" stroke={pal.bg} strokeWidth="2.4" />
            <text x="56" y="45" textAnchor="middle" fill={pal.bg} fontFamily={FONT_SERIF} fontWeight="700" fontSize={fontSize}>{title}</text>
            <line x1="34" y1="52" x2="78" y2="52" stroke={pal.bg} strokeWidth="1.2" opacity="0.4" />
            <text x="56" y="63.5" textAnchor="middle" fill="#64748b" fontFamily={FONT_SANS} fontWeight="800" fontSize="7.5" letterSpacing="0.8">{sub}</text>
          </g>
        );
      }
      if (variant === 2) {
        return (
          <g>
            <ellipse cx="56" cy="44" rx="44" ry="27" fill={pal.bg} stroke={pal.accent} strokeWidth="2.8" />
            <text x="56" y="46" textAnchor="middle" fill={pal.fg} fontFamily={FONT_SANS} fontWeight="900" fontSize={fontSize}>{title}</text>
            <text x="56" y="59" textAnchor="middle" fill={pal.accent} fontFamily={FONT_SANS} fontWeight="800" fontSize="7.5" letterSpacing="0.8">{sub}</text>
          </g>
        );
      }
      return (
        <g transform="rotate(-3 56 44)">
          <rect x="10" y="17" width="92" height="54" rx="14" fill={pal.bg} stroke={pal.fg} strokeWidth="2.4" />
          <text x="56" y="45" textAnchor="middle" fill={pal.fg} fontFamily={FONT_SANS} fontWeight="900" fontSize={fontSize}>{title}</text>
          <text x="56" y="58.5" textAnchor="middle" fill={pal.accent} fontFamily={FONT_SANS} fontWeight="800" fontSize="7.5" letterSpacing="0.8">{sub}</text>
        </g>
      );
    },
  };
}

function specFor(restaurant) {
  if (restaurant && BRAND_SPECS[restaurant.id]) return BRAND_SPECS[restaurant.id];
  return customSpecFor(restaurant);
}

export function brandBannerFor(restaurant) {
  return specFor(restaurant).banner;
}

export default function RestaurantLogo({ restaurant, size = 84, style }) {
  const spec = specFor(restaurant);
  const width = Math.round(size * (112 / 88));
  return (
    <div
      aria-hidden="true"
      style={{
        width,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        filter: "drop-shadow(0 8px 16px rgba(15, 23, 42, 0.14))",
        flexShrink: 0,
        ...style,
      }}
    >
      <svg width={width} height={size} viewBox="0 0 112 88" fill="none" xmlns="http://www.w3.org/2000/svg">
        {spec.render()}
      </svg>
    </div>
  );
}
