/**
 * 행운 장소 세로 리스트 (나의 찜한 코스 스타일, Glassmorphism)
 * 장소 썸네일(imageUrl) 표시, 없거나 로드 실패 시 기본 placeholder
 */
import { useState } from "react";
import { openNaverMapSearch, openNaverMapPlaceUrl } from "../utils/naverMapScheme.js";
import "./LuckyPlaceSwiper.css";

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop';

export function LuckyPlaceSwiper({ places = [], emptyMessage = "위치를 허용하면 근처 행운 장소를 추천해 드려요." }) {
  if (places.length === 0) {
    return <div className="lucky-place-swiper-empty">{emptyMessage}</div>;
  }

  return (
    <div className="lucky-place-list-wrap">
      {places.map((place, i) => (
        <LuckyPlaceCard key={`${place.name}-${i}`} place={place} fallbackImage={FALLBACK_IMAGE} />
      ))}
    </div>
  );
}

function LuckyPlaceCard({ place, fallbackImage }) {
  const [imgSrc, setImgSrc] = useState(place.imageUrl || fallbackImage);

  const handleImageError = () => {
    setImgSrc(fallbackImage);
  };

  return (
    <button
      type="button"
      className="lucky-place-card"
      onClick={() => {
        if (!place.name) return;
        const url = place.naverUrl && String(place.naverUrl).trim();
        if (url && (url.includes('/entry/place/') || url.includes('/p/entry/place/'))) {
          openNaverMapPlaceUrl(url);
        } else {
          openNaverMapSearch(place.name, place.regionHint || place.regionKey || '');
        }
      }}
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
        <div className="lucky-place-card-thumb">
          <img
            src={imgSrc}
            alt=""
            className="lucky-place-thumb-img"
            onError={handleImageError}
          />
        </div>
      </div>
    </button>
  );
}
