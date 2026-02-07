import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, X } from "lucide-react";
import { closeView } from "../utils/appsInTossSdk.js";
import { LocationPermissionModal } from "../components/LocationPermissionModal.jsx";
import { LuckyPlaceSwiper } from "../components/LuckyPlaceSwiper.jsx";
import { fetchLuckyPlacesNearby } from "../api/gemini.js";
import "./FortuneResult.css";

const RECOMMEND_MENUS = [
  "카레", "파스타", "비빔밥", "라멘", "돈카츠", "삼겹살", "초밥", "브런치",
  "아메리카노", "디저트", "떡볶이", "순대국", "쌈밥", "불고기", "해산물", "스테이크",
];

const MENU_ICONS = {
  카레: "🍛", 파스타: "🍝", 비빔밥: "🍚", 라멘: "🍜", 돈카츠: "🍖", 삼겹살: "🥩",
  초밥: "🍣", 브런치: "🥐", 아메리카노: "☕", 디저트: "🍰", 떡볶이: "🍢", 순대국: "🍲",
  쌈밥: "🥬", 불고기: "🍖", 해산물: "🦐", 스테이크: "🥩",
};

const LUCKY_COLORS = [
  { name: "파랑", hex: "#3182F6" },
  { name: "보라", hex: "#7C3AED" },
  { name: "오렌지", hex: "#F97316" },
  { name: "민트", hex: "#14B8A6" },
  { name: "코랄", hex: "#F43F5E" },
  { name: "골드", hex: "#EAB308" },
  { name: "그린", hex: "#22C55E" },
  { name: "핑크", hex: "#EC4899" },
];

const PHRASES = [
  "새로운 일을 시작하기 좋은 날이에요.",
  "가장 빛나는 하루를 위해 오늘만큼은 자신을 챙겨요.",
  "작은 도전이 큰 행운을 부를 수 있어요.",
  "오늘 하루도 선명하게 보내보세요!",
];

const DAY_NAMES = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

function getRandomClarity() {
  return Math.floor(Math.random() * 31) + 70;
}

function getRandomMenu() {
  return RECOMMEND_MENUS[Math.floor(Math.random() * RECOMMEND_MENUS.length)];
}

function getRandomColor() {
  return LUCKY_COLORS[Math.floor(Math.random() * LUCKY_COLORS.length)];
}

function getMenuIcon(menu) {
  return MENU_ICONS[menu] || "🍽️";
}

function getFormattedDate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const dayName = DAY_NAMES[d.getDay()];
  return `${y}년 ${m}월 ${day}일 ${dayName}`;
}

export default function FortuneResult() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const name = state?.name || "회원";
  const [clarity] = useState(() => getRandomClarity());
  const [menu] = useState(() => getRandomMenu());
  const [luckyColor] = useState(() => getRandomColor());
  const [phrase] = useState(() => PHRASES[Math.floor(Math.random() * PHRASES.length)]);
  const [animating, setAnimating] = useState(false);

  const [showLocationModal, setShowLocationModal] = useState(true);
  const [locationPromptAnswered, setLocationPromptAnswered] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [locationCoords, setLocationCoords] = useState(null);
  const [luckyPlaces, setLuckyPlaces] = useState([]);
  const [luckyPlacesLoading, setLuckyPlacesLoading] = useState(false);

  useEffect(() => {
    if (!locationPromptAnswered) return;
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimating(true));
    });
    return () => cancelAnimationFrame(t);
  }, [locationPromptAnswered]);

  const handleLocationAllow = () => {
    setShowLocationModal(false);
    setLocationPromptAnswered(true);
    if (!navigator.geolocation) {
      setLocationGranted(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocationCoords({ lat: latitude, lng: longitude });
        setLocationGranted(true);
        setLuckyPlacesLoading(true);
        fetchLuckyPlacesNearby({ keyword: menu, lat: latitude, lng: longitude })
          .then(setLuckyPlaces)
          .catch(() => setLuckyPlaces([]))
          .finally(() => setLuckyPlacesLoading(false));
      },
      () => setLocationGranted(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleLocationSkip = () => {
    setShowLocationModal(false);
    setLocationPromptAnswered(true);
    setLocationGranted(false);
  };

  const dateStr = getFormattedDate();

  const locationModalEl = showLocationModal ? (
    <LocationPermissionModal
      name={name}
      onAllow={handleLocationAllow}
      onSkip={handleLocationSkip}
    />
  ) : null;

  return (
    <div className="page fortune-result-page">
      {locationModalEl && createPortal(locationModalEl, document.body)}

      <header className="fortune-result-header">
        <button type="button" className="icon-btn" onClick={() => navigate(-1)} aria-label="뒤로가기">
          <ChevronLeft size={24} color="#191F28" />
        </button>
        <span className="fortune-result-header-title">오늘의 운세</span>
        <button type="button" className="icon-btn" onClick={() => closeView(() => navigate("/"))} aria-label="닫기">
          <X size={24} color="#4E5968" />
        </button>
      </header>

      <main className={`fortune-result-scroll ${animating ? "animate" : ""}`}>
        <section className="fortune-card fortune-card-summary">
          <div className="fortune-card-summary-left">
            <p className="fortune-card-date">{dateStr}</p>
            <h2 className="fortune-card-heading">행운 지수</h2>
            <p className="fortune-card-score">{clarity}점</p>
            <p className="fortune-card-phrase">{phrase}</p>
          </div>
          <div className={`fortune-character-wrap ${animating ? "animate" : ""}`}>
            <img src="/fortune-rabbit.png" alt="" className="fortune-character" />
          </div>
        </section>

        <section className="fortune-card fortune-card-lucky">
          <div className="fortune-lucky-col">
            <div className="fortune-lucky-icon fortune-lucky-food">
              {getMenuIcon(menu)}
            </div>
            <p className="fortune-lucky-label">행운의 음식</p>
          </div>
          <div className="fortune-lucky-col">
            <div
              className="fortune-lucky-color-swatch"
              style={{ backgroundColor: luckyColor.hex }}
            />
            <p className="fortune-lucky-label">행운의 컬러</p>
          </div>
          <div className="fortune-lucky-col">
            <div className="fortune-lucky-score-num">{clarity}</div>
            <p className="fortune-lucky-label">행운의 점수</p>
          </div>
        </section>

        <p className="fortune-result-text">
          오늘 <strong>{name}</strong>님의 선명도는 <strong>{clarity}%</strong>!
          가장 빛나는 하루를 위해 <strong>'{menu}'</strong>를 추천해요.
        </p>

        {locationGranted && (
          <section className="fortune-lucky-places-section">
            <h3 className="fortune-lucky-places-title">
              지금 {name}님 근처의 '{menu}' 행운 장소예요!
            </h3>
            {luckyPlacesLoading ? (
              <div className="fortune-lucky-places-loading">행운 장소를 찾는 중…</div>
            ) : (
              <LuckyPlaceSwiper
                places={luckyPlaces}
                emptyMessage="근처에 추천 장소가 없어요. 다른 지역에서 확인해 보세요!"
              />
            )}
          </section>
        )}
      </main>
    </div>
  );
}
