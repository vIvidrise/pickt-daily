import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fetchRecommendations } from "../api/gemini.js";
import { isFavorited, addFavorite, removeFavorite, getFavorites } from "../utils/favorites.js";
import { isAppsInTossEnv, addAccessoryButton } from "../utils/appsInTossNav.js";
import { closeView, openExternalUrl } from "../utils/appsInTossSdk.js";
import { loadNaverMapScript } from "../utils/naverMapLoader.js";
import "./Result.css";

// 1. 아이콘 도구(lucide-react)를 다 빼버리고 기본 이모지 사용
// 이렇게 하면 설치 오류가 절대 날 수 없습니다.

/** 지도 핀 안에 넣을 카테고리 아이콘 (오늘 뭐 먹지: 음식 이모지, 오늘 뭐 하지: 활동 이모지) */
const getPinEmoji = (item) => item?.emoji || '📍';

/** 혼밥 랭킹 단계 → 핀 인라인 스타일 (iframe 내부에서도 적용되도록) */
const getPinLevelStyle = (level) => {
  const l = Math.min(5, Math.max(1, Number(level) || 1));
  const colors = {
    1: { bg: '#22C55E', shadow: '0 4px 10px rgba(34,197,94,0.4)' },
    2: { bg: '#22C55E', shadow: '0 4px 10px rgba(34,197,94,0.4)' },
    3: { bg: '#EAB308', shadow: '0 4px 10px rgba(234,179,8,0.4)' },
    4: { bg: '#F04452', shadow: '0 4px 10px rgba(240,68,82,0.4)' },
    5: { bg: '#3B82F6', shadow: '0 4px 10px rgba(59,130,246,0.4)' },
  };
  const c = colors[l] || colors[4];
  return `background-color:${c.bg};box-shadow:${c.shadow};border:3px solid white;`;
};

/** Leaflet용: 혼밥 랭킹 단계 → 핀 색상 클래스 (같은 문서라 CSS 적용됨) */
const getPinLevelClass = (level) => {
  const l = Math.min(5, Math.max(1, Number(level) || 1));
  if (l <= 2) return 'pin-level-12';
  if (l === 3) return 'pin-level-3';
  if (l === 4) return 'pin-level-4';
  return 'pin-level-5';
};

// Leaflet 기본 마커 아이콘 경로 이슈(Vite) 방지
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const mapElement = useRef(null);
  const leafletMapRef = useRef(null);
  const leafletMapInstance = useRef(null);

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showCourseList, setShowCourseList] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [favorited, setFavorited] = useState(false);

  const isDoMode = state?.mode === 'do';

  useEffect(() => {
    if (selectedPlace) setFavorited(isFavorited(selectedPlace, getFavorites()));
  }, [selectedPlace]);

  const toggleFavorite = () => {
    if (!selectedPlace) return;
    const placeWithType = {
      ...selectedPlace,
      type: isDoMode ? "do" : "eat",
      lat: selectedPlace.lat,
      lng: selectedPlace.lng ?? selectedPlace.left,
    };
    if (favorited) {
      removeFavorite(selectedPlace).then(() => setFavorited(false));
    } else {
      addFavorite(placeWithType).then(() => setFavorited(true));
    }
  };

  // 앱인토스 내비게이션: 액세서리 버튼 클릭 시 홈으로 이동
  useEffect(() => {
    if (!isAppsInTossEnv()) return;
    const cleanup = addAccessoryButton(() => navigate("/"));
    return () => { if (typeof cleanup === "function") cleanup(); };
  }, [navigate]);

  useEffect(() => {
    const searchParams = state || { mode: 'eat', region: '강남·서초' };
    fetchRecommendations(searchParams).then(data => {
      setList(data || []);
      setLoading(false);
    });
  }, [state]);

  // 네이버 지도: 스크립트를 명시적으로 로드한 뒤 초기화 (실서비스 도메인 NCP 등록 필수)
  useEffect(() => {
    if (loading || list.length === 0 || !mapElement.current) return;

    const centerLat = list[0].lat;
    const centerLng = list[0].lng ?? list[0].left;
    if (centerLat == null || centerLng == null) {
      setMapError(true);
      return;
    }

    let cancelled = false;
    let authErrorTimer = null;

    loadNaverMapScript()
      .then((naver) => {
        if (cancelled || !mapElement.current) return;
        try {
          const map = new naver.maps.Map(mapElement.current, {
            center: new naver.maps.LatLng(centerLat, centerLng),
            zoom: 15,
            scaleControl: false, mapDataControl: false, logoControl: false,
          });

          const markers = [];
          list.forEach((item) => {
            const lng = item.lng ?? item.left;
            if (item.lat == null || lng == null) return;

            const emoji = getPinEmoji(item);
            const levelStyle = !isDoMode ? getPinLevelStyle(item.solo_difficulty_level) : 'background-color:#F04452;box-shadow:0 4px 10px rgba(240,68,82,0.4);border:3px solid white;';
            const contentHtml = `
              <div class="custom-pin-container">
                <div class="map-pin-wrapper">
                  <div class="pin-shape" style="width:40px;height:40px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;${levelStyle}"><span class="pin-emoji" style="transform:rotate(45deg);font-size:20px;line-height:1;display:block">${emoji}</span></div>
                  <div class="pin-shadow" style="width:12px;height:4px;background:rgba(0,0,0,0.2);border-radius:50%;margin-top:5px;filter:blur(2px)"></div>
                </div>
              </div>`;

            const marker = new naver.maps.Marker({
              position: new naver.maps.LatLng(item.lat, lng),
              map: map,
              icon: { content: contentHtml, size: new naver.maps.Size(40, 40), anchor: new naver.maps.Point(20, 42) }
            });

            naver.maps.Event.addListener(marker, 'click', () => {
              setShowCourseList(false);
              setSelectedPlace(item);
              markers.forEach(m => {
                const el = m.getElement()?.querySelector('.pin-shape');
                if (el) el.classList.remove('active-pin');
              });
              const currentEl = marker.getElement()?.querySelector('.pin-shape');
              if (currentEl) currentEl.classList.add('active-pin');
              map.panTo(marker.getPosition());
            });
            markers.push(marker);
          });
          if (!cancelled) setMapReady(true);

          // 네이버 인증 실패 시 컨테이너에 에러 메시지가 뜨는 경우 감지 → Leaflet으로 전환
          authErrorTimer = setTimeout(() => {
            if (cancelled || !mapElement.current) return;
            const el = mapElement.current;
            const hasAuthError = el.textContent?.includes("인증이 실패") || el.textContent?.includes("Open API 인증");
            if (hasAuthError) {
              console.warn("네이버 지도 인증 실패 감지 → Leaflet으로 전환. NCP 콘솔에서 웹 서비스 URL 등록을 확인하세요.");
              setMapError(true);
            }
          }, 2000);
        } catch (err) {
          console.error("네이버 지도 초기화 실패:", err);
          if (!cancelled) setMapError(true);
        }
      })
      .catch((err) => {
        console.warn("네이버 지도 스크립트 로드 실패 → Leaflet 사용. NCP 콘솔에서 실서비스 URL 등록 확인:", err?.message || err);
        if (!cancelled) setMapError(true);
      });

    return () => {
      cancelled = true;
      if (authErrorTimer) clearTimeout(authErrorTimer);
    };
  }, [loading, list, isDoMode]);

  // 네이버 지도 실패 시 Leaflet(OpenStreetMap)으로 표시 — API 키/URL 등록 불필요
  useEffect(() => {
    if (!mapError || list.length === 0 || !leafletMapRef.current) return;
    const centerLat = list[0].lat;
    const centerLng = list[0].lng ?? list[0].left;
    if (centerLat == null || centerLng == null) return;

    const map = L.map(leafletMapRef.current).setView([centerLat, centerLng], 15);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const markers = [];
    list.forEach((item, index) => {
      const lng = item.lng ?? item.left;
      if (item.lat == null || lng == null) return;
      const emoji = getPinEmoji(item);
      const levelClass = !isDoMode ? getPinLevelClass(item.solo_difficulty_level) : '';
      const pinHtml = `
        <div class="custom-pin-container leaflet-pin">
          <div class="map-pin-wrapper">
            <div class="pin-shape ${levelClass}"><span class="pin-emoji">${emoji}</span></div>
            <div class="pin-shadow"></div>
          </div>
        </div>`;
      const icon = L.divIcon({
        html: pinHtml,
        className: "leaflet-custom-pin",
        iconSize: [40, 52],
        iconAnchor: [20, 52],
      });
      const marker = L.marker([item.lat, lng], { icon }).addTo(map);
      marker.on("click", () => {
        setShowCourseList(false);
        setSelectedPlace(item);
        map.panTo([item.lat, lng]);
      });
      markers.push(marker);
    });

    leafletMapInstance.current = { map, markers };
    return () => {
      if (leafletMapInstance.current?.map) {
        leafletMapInstance.current.map.remove();
        leafletMapInstance.current = null;
      }
    };
  }, [mapError, list]);

  if (loading) return (
    <div className="page center" style={{display:'flex', justifyContent:'center', alignItems:'center'}}>
        <div style={{fontSize:'20px', fontWeight:'bold'}}>로딩중...</div>
    </div>
  );

  return (
    <div className="page map-page">
      {mapError ? (
        <>
          <div ref={leafletMapRef} className="map-container map-container-leaflet" />
          <div className="leaflet-badge">OpenStreetMap</div>
        </>
      ) : (
        <>
          <div ref={mapElement} className="map-container"></div>
          {/* 혼밥 랭킹 범례 (오늘 뭐 먹지 결과일 때만) */}
          {!isDoMode && list.length > 0 && (
            <div className="map-legend" aria-label="혼밥 랭킹">
              <div className="map-legend-title">혼밥 랭킹</div>
              <div className="map-legend-row"><span className="map-legend-dot pin-legend-12" /> 1~2단계</div>
              <div className="map-legend-row"><span className="map-legend-dot pin-legend-3" /> 3단계</div>
              <div className="map-legend-row"><span className="map-legend-dot pin-legend-4" /> 4단계</div>
              <div className="map-legend-row"><span className="map-legend-dot pin-legend-5" /> 5단계</div>
            </div>
          )}
        </>
      )}

      {/* 헤더 (이모지 버전) */}
      <div className="map-header">
        <button type="button" className="icon-btn" onClick={() => navigate(-1)} style={{fontSize:'24px'}} aria-label="뒤로가기">⬅️</button>
        <div className="header-center">
          <img src="/logo.png" alt="" className="header-logo" aria-hidden="true" />
          <span className="header-title">요즘 뭐 함</span>
        </div>
        <div className="header-right">
            <button type="button" className="icon-btn" style={{fontSize:'24px'}} aria-label="더보기">┄</button>
            <button type="button" className="icon-btn" onClick={() => closeView(() => navigate("/"))} style={{fontSize:'24px'}} aria-label="닫기">✖️</button>
        </div>
      </div>

      {!showCourseList && !selectedPlace && (
        <div className="bottom-floating-area">
            <button className="btn-toss-primary" onClick={() => navigate("/")}>
                확인
            </button>
            <div className="btn-text-only" onClick={() => navigate("/")}>메인으로 가기</div>
        </div>
      )}

      {/* 상세 정보 팝업 (이모지 버전) */}
      {selectedPlace && (
        <>
          <div className="overlay" onClick={() => setSelectedPlace(null)}></div>
          <div className="toss-bottom-sheet slide-up">
            <div className="sheet-top-row">
              <div className="place-img-box">{selectedPlace.emoji}</div>
              <div className="place-info-col">
                <div className="place-title-row">
                  <span className="place-title">{selectedPlace.name}</span>
                  <div className="place-actions">
                    <span style={{fontSize:'20px'}}>⭐</span>
                    <button type="button" className="btn-favorite" onClick={toggleFavorite} aria-label="찜하기">
                      {favorited ? <span className="heart filled">❤️</span> : <span className="heart outline">🤍</span>}
                    </button>
                  </div>
                </div>
                <div className="place-badge-row">
                  <span className={`status-badge ${selectedPlace.statusColor}`}>
                    {selectedPlace.status}
                  </span>
                  <span className="update-text">• 실시간 정보</span>
                </div>
              </div>
              <button className="close-btn-absolute" onClick={() => setSelectedPlace(null)} style={{border:'none', background:'none', fontSize:'18px'}}>✖️</button>
            </div>

            {selectedPlace.representativeMenu && (
              <div className="representative-menu-box">
                <span className="rep-menu-label">대표 메뉴</span>
                <span className="rep-menu-value">{selectedPlace.representativeMenu}</span>
              </div>
            )}

            <div className="notice-box">
              <p className="notice-text">{selectedPlace.notice}</p>
            </div>

            <button className="btn-naver" onClick={() => openExternalUrl(selectedPlace.naverUrl)}>
              <span className="naver-n">N</span> 네이버 플레이스에서 보기
            </button>
          </div>
        </>
      )}

      {/* 코스 목록 팝업 */}
      {showCourseList && (
        <>
          <div className="overlay" onClick={() => setShowCourseList(false)}></div>
          <div className="toss-bottom-sheet slide-up full-height-sheet">
            <div className="sheet-handle"></div>
            <div className="sheet-header" style={{ marginBottom: '10px' }}><h2 className="sheet-title">오늘 하루 코스 추천</h2></div>
            <div className="course-list-scroll">
                {list.map((item, i) => (
                    <div key={i} className="course-item">
                        <div className="course-left-time">{item.time || `Step ${i+1}`}</div>
                        <div className="course-center-info"><div className="course-name">{item.name}</div><div className="course-desc" style={{ color: '#F04452' }}>{item.tag}</div><div className="course-addr">{item.address}</div></div>
                        <div className="course-right-badge"><span className="badge-blue">영업중</span></div>
                    </div>
                ))}
            </div>
            <div className="sheet-footer-btn"><button className="btn-toss-primary full-width" onClick={() => setShowCourseList(false)}>확인</button></div>
          </div>
        </>
      )}
    </div>
  );
}