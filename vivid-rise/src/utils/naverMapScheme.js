/**
 * 네이버 지도 URL Scheme (앱 연동) + 웹 폴백
 * - 앱인토스 WebView에서는 openURL로 외부 열기 → 선택한 식당이 네이버 지도에 노출되도록 함
 * - 그 외: nmap:// 스킴 시도 후 웹 폴백
 */

import { openExternalUrl } from './appsInTossSdk.js';
import { isAppsInTossEnv } from './appsInTossNav.js';

const APP_NAME = 'com.example.myapp';
const FALLBACK_DELAY_MS = 500;

function openUrl(url) {
  if (isAppsInTossEnv() && typeof url === 'string' && url.trim()) {
    openExternalUrl(url);
    return;
  }
  window.location.href = url;
}

/**
 * 앱 실행 시 페이지가 숨겨지면 폴백 취소 (visibilitychange)
 */
function scheduleFallback(fallbackUrl, onFallback) {
  let timeoutId = null;
  const handler = () => {
    if (document.visibilityState === 'hidden' && timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
      document.removeEventListener('visibilitychange', handler);
    }
  };
  document.addEventListener('visibilitychange', handler);
  timeoutId = setTimeout(() => {
    document.removeEventListener('visibilitychange', handler);
    timeoutId = null;
    if (typeof onFallback === 'function') onFallback(fallbackUrl);
  }, FALLBACK_DELAY_MS);
}

/**
 * 네이버 지도 장소 상세 URL인지 (해당 가게 바로 열기용)
 */
function isPlaceEntryUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const u = url.trim();
  return /\/entry\/place\/\d+/.test(u) || /\/p\/entry\/place\/\d+/.test(u);
}

/**
 * [네이버에서 보기] — 장소 상세 URL로 열기 (플레이스 상세 또는 지도)
 * @param {string} [placeUrl] - 네이버 플레이스(m.place.naver.com) 또는 지도(map.naver.com) URL
 */
export function openNaverMapPlaceUrl(placeUrl) {
  if (!placeUrl || typeof placeUrl !== 'string') return;
  const url = placeUrl.trim();
  // 허용 도메인: map.naver.com, m.map.naver.com, m.place.naver.com, place.naver.com
  if (!/^https?:\/\/(map\.|m\.map\.|m\.place\.|place\.)naver\.com\//.test(url)) return;
  openUrl(url);
}

/**
 * [네이버에서 보기] — 검색
 * 네이버 지도 검색은 "장소명 + 지역"만 사용. "종로·을지로" 같은 복합 지역은 첫 부분만 사용 (검색결과 없음 방지)
 * 1. nmap://search?query=... 로 앱 실행 시도
 * 2. 0.5초 후 반응 없으면 m.map.naver.com 검색으로 이동
 * @param {string} placeName - 장소명
 * @param {string} [regionHint] - 지역 키워드 (예: '잠실', '종로·을지로' → '종로'만 사용)
 */
export function openNaverMapSearch(placeName, regionHint = '') {
  const name = (placeName && String(placeName).trim()) || '장소';
  const raw = regionHint && String(regionHint).trim();
  const region = raw ? raw.split(/[·\s]+/)[0] : ''; // "종로·을지로" → "종로"
  const queryStr = region ? `${name} ${region}` : name;
  const query = encodeURIComponent(queryStr);
  const schemeUrl = `nmap://search?query=${query}&appname=${APP_NAME}`;
  const fallbackUrl = `https://m.map.naver.com/search2/search.naver?query=${query}`;

  scheduleFallback(fallbackUrl, (u) => openUrl(u));
  openUrl(schemeUrl);
}

/**
 * [길찾기]
 * 1. nmap://route/public?dlat={lat}&dlng={lng}&dname={장소이름}&appname=... 로 앱 실행 시도
 * 2. 0.5초 후 반응 없으면 https://m.map.naver.com/route/public?dlat=...&dlng=...&dname=... 으로 이동
 */
export function openNaverMapRoute(lat, lng, placeName) {
  if (lat == null || lng == null) return;
  const name = (placeName && String(placeName).trim()) || '목적지';
  const dname = encodeURIComponent(name);
  const schemeUrl = `nmap://route/public?dlat=${lat}&dlng=${lng}&dname=${dname}&appname=${APP_NAME}`;
  const fallbackUrl = `https://m.map.naver.com/route/public?dlat=${lat}&dlng=${lng}&dname=${dname}`;

  scheduleFallback(fallbackUrl, (u) => openUrl(u));
  openUrl(schemeUrl);
}
