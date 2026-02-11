import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, X } from "lucide-react";
import { getFavorites, removeFavorite } from "../utils/favorites.js";
import { closeView } from "../utils/appsInTossSdk.js";
import { openNaverMapPlaceUrl, openNaverMapSearch } from "../utils/naverMapScheme.js";
import { isAppsInTossEnv } from "../utils/appsInTossNav.js";
import { places as placesList } from "../data/places";
import "./Saved.css";

/** 찜 항목 하나: 저장된 id로 places에서 찾거나, 없으면 저장된 raw 데이터 사용 */
function resolveDisplayItem(fav) {
  if (fav.id != null && placesList?.length) {
    const found = placesList.find(
      (p) => String(p.id) === String(fav.id)
    );
    if (found) {
      return {
        ...found,
        naverUrl: found.naver_map_url || fav.naverUrl,
        tag: found.category || fav.tag,
        regionKey: found.location || fav.regionKey,
      };
    }
  }
  return {
    ...fav,
    naverUrl: fav.naverUrl || fav.naver_map_url,
    tag: fav.tag,
    regionKey: fav.regionKey,
  };
}

export default function Saved() {
  const navigate = useNavigate();
  const useTossNav = isAppsInTossEnv();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const displayList = favorites.map(resolveDisplayItem);

  const handleRemove = (item) => {
    removeFavorite(item).then(() => setFavorites(getFavorites()));
  };

  const handleNaver = (item) => {
    const url = item.naverUrl || item.naver_map_url;
    if (url && /^https?:\/\//.test(url)) {
      openNaverMapPlaceUrl(url);
    } else {
      openNaverMapSearch(item.name, item.regionKey || "");
    }
  };

  return (
    <div className="page saved-page">
      {!useTossNav && (
        <header className="saved-header">
          <button
            type="button"
            className="icon-btn"
            onClick={() => navigate(-1)}
            aria-label="뒤로가기"
          >
            <ChevronLeft size={24} color="#191F28" />
          </button>
          <h1 className="saved-header-title">찜한 장소</h1>
          <button
            type="button"
            className="icon-btn"
            onClick={() => closeView(() => navigate("/"))}
            aria-label="닫기"
          >
            <X size={24} color="#4E5968" />
          </button>
        </header>
      )}

      <div className="saved-content">
        {favorites.length === 0 ? (
          <div className="saved-empty-message">
            <p>찜한 장소가 없어요</p>
            <p className="saved-empty-desc">
              맛집·장소 추천에서 하트를 눌러 찜해 보세요.
            </p>
            <button
              type="button"
              className="btn-go-result"
              onClick={() => navigate("/")}
            >
              메인으로 가기
            </button>
          </div>
        ) : (
          <section className="saved-section saved-list-favorites">
            <h2 className="saved-section-title">❤️ 찜한 장소</h2>
            <ul className="saved-list">
              {displayList.map((item, i) => {
                const raw = favorites[i];
                return (
                  <li key={`${item.id ?? item.name}-${i}`} className="saved-item">
                    <span className="saved-item-emoji">{item.emoji || "🍽️"}</span>
                    <div className="saved-item-info">
                      <span className="saved-item-name">{item.name}</span>
                      {item.tag && (
                        <span className="saved-item-tag">{item.tag}</span>
                      )}
                    </div>
                    <div className="saved-item-actions">
                      <button
                        type="button"
                        className="saved-link-btn"
                        onClick={() => handleNaver(item)}
                      >
                        네이버에서 보기
                      </button>
                      <button
                        type="button"
                        className="saved-remove-btn"
                        onClick={() => handleRemove(raw || item)}
                        aria-label="찜 해제"
                      >
                        찜 해제
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
