// Deterministic per-user display nickname derived from their Firebase
// anonymous-auth uid — no storage needed, same uid always maps to the same
// name. A reinstalled/cleared app gets a fresh anon uid (and so a fresh
// nickname), same as order history already resets in that case.

const ADJECTIVES = {
  ko: ["행복한", "배고픈", "느긋한", "부지런한", "용감한", "수줍은", "든든한", "재빠른", "포근한", "씩씩한", "말랑한", "상큼한", "묵직한", "쫄깃한", "바삭한"],
  en: ["Happy", "Hungry", "Sleepy", "Brave", "Shy", "Cozy", "Speedy", "Chill", "Zesty", "Crispy", "Sturdy", "Chewy", "Fluffy", "Bold", "Snappy"],
};

const NOUNS = {
  ko: ["미식가", "라이더", "토끼", "거북이", "고양이", "떡볶이러버", "야식러", "배달덕후", "맛잘알", "치킨러버", "만두킹", "국밥러", "분식마니아", "간식요정", "냉면러버"],
  en: ["Foodie", "Rider", "Rabbit", "Turtle", "Cat", "NoodleFan", "NightOwl", "SnackLover", "TasteHunter", "ChickenFan", "DumplingKing", "SoupFan", "BunsMaster", "SnackFairy", "ColdNoodleFan"],
};

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function nicknameFor(uid, lang = "ko") {
  if (!uid) return lang === "en" ? "Anonymous" : "익명";
  const adjectives = ADJECTIVES[lang] || ADJECTIVES.ko;
  const nouns = NOUNS[lang] || NOUNS.ko;
  const h = hashString(uid);
  const adj = adjectives[h % adjectives.length];
  const noun = nouns[Math.floor(h / adjectives.length) % nouns.length];
  return `${adj} ${noun}`;
}
