import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSavedMenus, removeSavedMenu } from "../api/savedMenus.js";
import { closeView, openExternalUrl } from "../utils/appsInTossSdk.js";
import { isSupabaseConfigured } from "../lib/supabaseClient.js";
import { getFavorites } from "../utils/favorites.js";
import { fetchNearbyRecommendation } from "../api/gemini.js";
import { CourseSwiper } from "../components/CourseSwiper.jsx";
import "./Saved.css";

export default function Saved() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  useEffect(() => {
    getSavedMenus().then((data) => {
      setList(data || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  // 찜한 장소 중 type+좌표 있는 것만 골라 근처 반대 유형 추천 → 코스 생성
  useEffect(() => {
    const favs = getFavorites();
    const withType = favs.filter((f) => f.type && f.lat != null && f.lng != null);
    if (withType.length === 0) {
      setCourses([]);
      setCoursesLoading(false);
      return;
    }
    setCoursesLoading(true);
    const oppositeType = (t) => (t === "eat" ? "do" : "eat");
    Promise.all(
      withType.map((fav) =>
        fetchNearbyRecommendation({
          lat: fav.lat,
          lng: fav.lng,
          type: oppositeType(fav.type),
        }).then((nearby) => {
          const placeShape = (name, level = 1) => ({ name, solo_difficulty_level: level });
          if (fav.type === "eat") {
            return { do: nearby, eat: placeShape(fav.name), distanceMinutes: 5 };
          }
          return { do: placeShape(fav.name), eat: nearby, distanceMinutes: 5 };
        })
      )
    )
      .then(setCourses)
      .catch(() => setCourses([]))
      .finally(() => setCoursesLoading(false));
  }, [favorites]);

  const handleRemove = async (item) => {
    const result = await removeSavedMenu(item.id);
    if (result.ok) setList((prev) => prev.filter((i) => i.id !== item.id));
  };

  return (
    <div className="page saved-page">
      <div className="saved-header">
        <button type="button" className="icon-btn" onClick={() => navigate(-1)} aria-label="뒤로가기">
          ←
        </button>
        <span className="saved-header-title">나만의 리스트</span>
        <button type="button" className="icon-btn" onClick={() => closeView(() => navigate("/"))} aria-label="닫기">
          ✕
        </button>
      </div>

      <div className="saved-content">
        {/* 나의 찜한 코스: 오늘 뭐 먹지 찜 → 근처 오늘 뭐 하지 / 오늘 뭐 하지 찜 → 근처 오늘 뭐 먹지 */}
        <section className="saved-section saved-section-courses">
          <h2 className="saved-section-title">나의 찜한 코스</h2>
          {coursesLoading ? (
            <div className="saved-loading saved-loading-courses">코스를 불러오는 중…</div>
          ) : (
            <CourseSwiper
              courses={courses}
              emptyMessage="오늘 뭐 먹지·오늘 뭐 하지에서 장소를 찜하면 그 근처 코스로 추천해 드려요."
            />
          )}
        </section>

        {/* 찜한 장소 (로컬 하트) */}
        {favorites.length > 0 && (
          <section className="saved-section">
            <h2 className="saved-section-title">❤️ 찜한 장소</h2>
            <ul className="saved-list saved-list-favorites">
              {favorites.map((item, idx) => (
                <li key={`${item.name}-${item.naverUrl}-${idx}`} className="saved-item">
                  <span className="saved-item-emoji">{item.emoji || "📍"}</span>
                  <div className="saved-item-info">
                    <span className="saved-item-name">{item.name}</span>
                    {item.tag && <span className="saved-item-tag">{item.tag}</span>}
                  </div>
                  <div className="saved-item-actions">
                    <button
                      type="button"
                      className="saved-link-btn"
                      onClick={() => openExternalUrl(item.naverUrl)}
                    >
                      네이버에서 보기
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 저장한 메뉴 (Supabase) */}
        <section className="saved-section">
          <h2 className="saved-section-title">저장한 메뉴</h2>
          {!isSupabaseConfigured() ? (
            <div className="saved-empty-message saved-empty-inline">
              <p>Supabase가 설정되지 않았어요.</p>
              <p className="saved-empty-desc">.env에 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY를 추가하면 저장한 메뉴를 불러올 수 있어요.</p>
            </div>
          ) : loading ? (
            <div className="saved-loading">불러오는 중…</div>
          ) : list.length === 0 ? (
            <div className="saved-empty-message saved-empty-inline">
              <p>저장한 메뉴가 없어요</p>
              <p className="saved-empty-desc">추천 결과에서 「저장하기」로 리스트에 담아보세요.</p>
              <button type="button" className="btn-go-result" onClick={() => navigate("/")}>
                추천받으러 가기
              </button>
            </div>
          ) : (
            <ul className="saved-list">
              {list.map((item) => (
                <li key={item.id} className="saved-item">
                  <span className="saved-item-emoji">{item.emoji || "📍"}</span>
                  <div className="saved-item-info">
                    <span className="saved-item-name">{item.name}</span>
                    {item.tag && <span className="saved-item-tag">{item.tag}</span>}
                    {item.representative_menu && (
                      <span className="saved-item-menu">대표: {item.representative_menu}</span>
                    )}
                  </div>
                  <div className="saved-item-actions">
                    <button
                      type="button"
                      className="saved-link-btn"
                      onClick={() => openExternalUrl(item.naverUrl)}
                    >
                      네이버에서 보기
                    </button>
                    <button
                      type="button"
                      className="saved-remove-btn"
                      onClick={() => handleRemove(item)}
                      aria-label="리스트에서 삭제"
                    >
                      삭제
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
