/**
 * '오늘 뭐 먹지' 추천 로직 (places.ts 기반)
 * - 카테고리/지역은 필터 (없으면 완화)
 * - 분위기/시설은 가산점(우선순위)으로 반영
 */

function norm(s) {
  return (s == null ? "" : String(s)).trim();
}

function normalizeRegionKey(region) {
  const raw = norm(region);
  if (!raw) return "";
  return raw.replaceAll(" ", "").replaceAll("·", "/");
}

function includesAny(haystack, needles) {
  const h = norm(haystack);
  if (!h) return false;
  return needles.some((n) => n && h.includes(n));
}

const REGION_KEYWORDS = {
  "강남/서초": ["강남", "서초", "역삼", "삼성", "청담", "논현", "압구정", "신사", "도산", "교대", "반포", "잠원", "양재", "청계산", "예술", "서래", "센트럴", "파미에"],
  "성수/건대": ["성수", "건대", "자양", "뚝섬", "서울숲", "연무장", "아차산", "금호", "왕십리"],
  "홍대/연남": ["홍대", "연남", "합정", "상수", "망원", "동교", "서교", "마포", "서강"],
  "종로/을지로": ["종로", "을지로", "익선", "인사", "광장", "동대문", "청계", "낙산", "안국", "북촌", "서촌", "명동", "중구"],
  "잠실/송파": ["잠실", "송파", "석촌", "올림픽", "방이", "가락", "문정"],
  // 기존 옵션(·) 들어와도 normalizeRegionKey에서 /로 변환됨
  "용산/이태원": ["용산", "이태원", "한남", "남영", "삼각지", "신용산", "후암", "해방촌", "경리단", "이촌", "숙대입구"],
};

const CATEGORY_SYNONYMS = {
  "카페/디저트": ["카페", "디저트", "베이커리", "브런치"],
  "일식/중식": ["일식", "중식"],
};

// Home.jsx '오늘 어떤 날인가요?'(occasion) 매핑
const MOOD_KEYWORDS = {
  "기념일": ["기념일", "상견례", "코스", "프라이빗", "룸", "다이닝", "파인다이닝", "미슐랭"],
  "데이트": ["데이트", "분위기", "와인", "바", "테라스", "뷰", "로맨틱", "브런치", "비스트로"],
  "가족모임": ["가족", "단체", "룸", "주차", "한정식", "회식", "모임"],
  "혼자서": ["혼자", "혼밥", "1인", "바테이블"],
  "트렌디한": ["트렌디", "핫플", "감성", "인스타", "SNS", "뉴트로"],
  "한국적인": ["한정식", "전통", "한옥", "노포", "한국"],
  "SNS 핫플": ["SNS", "인스타", "핫플", "포토", "감성"],
  "동네맛집": ["동네", "노포", "현지", "숨은", "단골", "로컬"],
};

const FACILITY_KEYWORDS = {
  "주차": ["주차"],
  "예약": ["예약"],
  "무선 인터넷": ["와이파이", "wifi", "무선"],
  "반려동물": ["반려동물", "애견", "펫", "dog"],
};

function categoryNeedles(selection) {
  const key = norm(selection);
  if (!key) return [];
  if (CATEGORY_SYNONYMS[key]) return CATEGORY_SYNONYMS[key];
  // 기본은 그대로 + 일부 확장
  if (key === "카페") return ["카페", "디저트", "베이커리", "브런치"];
  if (key === "디저트") return ["디저트", "카페", "베이커리", "브런치"];
  if (key === "샐러드") return ["샐러드", "브런치"];
  return [key];
}

function regionNeedles(regionSelection) {
  const key = normalizeRegionKey(regionSelection);
  if (!key) return [];
  return REGION_KEYWORDS[key] || key.split("/").filter(Boolean);
}

function scorePlace({ place, mood, facilities }) {
  let score = 0;
  const desc = norm(place?.description);
  const moodKey = norm(mood);
  const moodNeedles = MOOD_KEYWORDS[moodKey] || (moodKey ? [moodKey] : []);
  if (moodNeedles.length && includesAny(desc, moodNeedles)) score += 2;

  (facilities || []).forEach((f) => {
    const fk = norm(f);
    const needles = FACILITY_KEYWORDS[fk] || (fk ? [fk] : []);
    if (needles.length && includesAny(desc, needles)) score += 1;
  });
  return score;
}

function stableShuffle(arr) {
  // Fisher-Yates (non-crypto). Runs per call to add variety.
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * @returns {{ items: any[], meta: { relaxed: boolean, reason?: string } }}
 */
export function recommendEatPlaces({ places, category, region, mood, facilities }) {
  const list = Array.isArray(places) ? places : [];
  const catNeedles = categoryNeedles(category);
  const regNeedles = regionNeedles(region);

  const baseFilter = (p) => {
    const pCat = norm(p?.category);
    const pLoc = norm(p?.location);
    const pAddr = norm(p?.address);
    const okCat = catNeedles.length ? includesAny(pCat, catNeedles) : true;
    const okReg = regNeedles.length ? (includesAny(pLoc, regNeedles) || includesAny(pAddr, regNeedles)) : true;
    return okCat && okReg;
  };

  let pool = list.filter(baseFilter);
  let relaxed = false;
  let reason = "";

  // 완화 단계: 지역만 → 카테고리만 → 전체
  if (pool.length === 0 && (catNeedles.length || regNeedles.length)) {
    relaxed = true;
    reason = "조건에 딱 맞는 곳이 없어 조건을 일부 완화했어요.";
    if (regNeedles.length) {
      pool = list.filter((p) => {
        const pLoc = norm(p?.location);
        const pAddr = norm(p?.address);
        return includesAny(pLoc, regNeedles) || includesAny(pAddr, regNeedles);
      });
    }
  }
  if (pool.length === 0 && catNeedles.length) {
    relaxed = true;
    reason = reason || "조건에 딱 맞는 곳이 없어 조건을 일부 완화했어요.";
    pool = list.filter((p) => includesAny(norm(p?.category), catNeedles));
  }
  if (pool.length === 0) {
    relaxed = true;
    reason = "조건에 딱 맞는 곳이 없어 전체에서 추천했어요.";
    pool = list;
  }

  const scored = pool.map((p) => ({ p, s: scorePlace({ place: p, mood, facilities }) }));
  scored.sort((a, b) => b.s - a.s);

  // 동점 구간은 랜덤으로 섞어서 3개 뽑기
  const topScore = scored[0]?.s ?? 0;
  const topBucket = scored.filter((x) => x.s === topScore).map((x) => x.p);
  const rest = scored.filter((x) => x.s !== topScore).map((x) => x.p);
  const mixed = [...stableShuffle(topBucket), ...rest];
  const items = mixed.slice(0, 3);

  return { items, meta: { relaxed, reason } };
}

