/**
 * 행운 장소 세로 리스트 (나의 찜한 코스 스타일, Glassmorphism)
 * solo_difficulty_level에 따라 비비 캐릭터 카드 우측 배치
 */
import { CharacterByLevel } from "./CharacterByLevel";
import { openExternalUrl } from "../utils/appsInTossSdk.js";
import "./LuckyPlaceSwiper.css";

export function LuckyPlaceSwiper({ places = [], emptyMessage = "위치를 허용하면 근처 행운 장소를 추천해 드려요." }) {
  if (places.length === 0) {
    return <div className="lucky-place-swiper-empty">{emptyMessage}</div>;
  }

  return (
    <div className="lucky-place-list-wrap">
      {places.map((place, i) => (
        <button
          key={`${place.name}-${i}`}
          type="button"
          className="lucky-place-card"
          onClick={() => openExternalUrl(place.naverUrl)}
        >
          <div className="lucky-place-card-content">
            <div className="lucky-place-card-main">
              <span className="lucky-place-emoji">{place.emoji || "🍽️"}</span>
              <div className="lucky-place-info">
                <p className="lucky-place-name">{place.name}</p>
                <span className="lucky-place-distance">{place.distanceText}</span>
                <span className="lucky-place-level">혼밥 {place.solo_difficulty_level}단계</span>
              </div>
            </div>
            <div className="lucky-place-card-character">
              <CharacterByLevel level={place.solo_difficulty_level} />
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
