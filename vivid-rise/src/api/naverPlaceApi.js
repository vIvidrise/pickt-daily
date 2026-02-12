/**
 * 네이버 가게 주소/이미지 불러오기 (서버리스 API 호출)
 * - 배포된 도메인에서만 동작 (같은 origin의 /api/naver-place)
 * - Vercel에 NAVER_CLIENT_ID, NAVER_CLIENT_SECRET 설정 필요
 * @see 네이버_가게_주소_불러오기.md
 */

/**
 * 네이버 지도 검색 URL 생성. 검색어는 '장소명 + 지역(첫 토큰)'만 사용 (전체 주소·복합지역 전부 넣으면 검색 실패 많음).
 */
export function getNaverMapSearchUrl(name, region = '') {
  if (!name || typeof name !== 'string') return '';
  const parts = [name.trim()];
  const raw = region && String(region).trim();
  if (raw) {
    const regionHint = raw.split(/[·\s]+/)[0] || raw;
    parts.push(regionHint);
  }
  const query = parts.join(' ');
  return `https://map.naver.com/p/search/${encodeURIComponent(query)}`;
}

/** API가 준 link가 네이버 지도 장소 URL인지 (선택한 식당 노출용) */
export function isNaverMapPlaceUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const u = url.trim();
  return u.startsWith('https://map.naver.com') || u.startsWith('http://map.naver.com');
}

/**
 * 네이버 지도 '장소 상세' URL로 정규화 → 지도에서 해당 장소가 마커·포커스로 노출됨.
 * API link가 /v5/entry/place/123 형태면 /p/entry/place/123 로 변환.
 */
export function toNaverMapPlaceEntryUrl(link) {
  if (!link || typeof link !== 'string') return '';
  const u = link.trim();
  const placeIdMatch = u.match(/\/entry\/place\/(\d+)/) || u.match(/\/place\/(\d+)/);
  if (placeIdMatch) {
    return `https://map.naver.com/p/entry/place/${placeIdMatch[1]}`;
  }
  if (isNaverMapPlaceUrl(u)) return u;
  return '';
}

/**
 * 네이버 플레이스 상세 페이지 URL (주소·메뉴·리뷰 보이는 화면)
 * "네이버에서 보기" 클릭 시 이 주소로 열면, 입력한 네이버 주소처럼 상세 카드가 보임.
 * - 이미 m.place.naver.com 이면 그대로 반환
 * - map.naver.com/entry/place/ID 이면 m.place.naver.com/restaurant/ID/home 으로 변환
 */
export function toNaverPlaceDetailUrl(link) {
  if (!link || typeof link !== 'string') return '';
  const u = link.trim();
  if (/place\.naver\.com/i.test(u)) return u;
  const placeIdMatch = u.match(/\/entry\/place\/(\d+)/) || u.match(/\/place\/(\d+)/) || u.match(/restaurant\/(\d+)/);
  if (placeIdMatch) {
    return `https://m.place.naver.com/restaurant/${placeIdMatch[1]}/home`;
  }
  if (isNaverMapPlaceUrl(u)) return u;
  return '';
}

/**
 * 가게명(과 지역)으로 네이버 지역 검색 결과 한 건 반환
 * @param {string} name - 가게명
 * @param {string} [region] - 지역 보조 키워드 (예: '성수', '강남')
 * @returns {Promise<{ found: boolean, title?: string, address?: string, roadAddress?: string, imageUrl?: string | null, link?: string }>}
 */
export async function fetchPlaceFromNaver(name, region = '') {
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  const params = new URLSearchParams({ name: name.trim() });
  if (region && region.trim()) params.set('region', region.trim());
  const url = `${base}/api/naver-place?${params.toString()}`;

  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `API ${res.status}`);
  }

  return {
    found: !!data.found,
    title: data.title,
    address: data.address,
    roadAddress: data.roadAddress,
    imageUrl: data.imageUrl ?? null,
    link: data.link,
    category: data.category,
    mapx: data.mapx,
    mapy: data.mapy,
  };
}
