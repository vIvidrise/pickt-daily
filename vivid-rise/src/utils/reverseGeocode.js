/**
 * 위도/경도 → 동·구 이름 (역지오코딩)
 * Nominatim(OpenStreetMap) 사용, API 키 불필요
 */

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";
const REQUEST_DELAY_MS = 1100;

/**
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<string>} 동 이름(예: 역삼동) 또는 구 이름(예: 강남구), 실패 시 ''
 */
export function getLocationNameFromCoords(lat, lng) {
  if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return Promise.resolve("");
  }
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: "json",
  });
  return new Promise((resolve) => {
    setTimeout(() => {
      fetch(`${NOMINATIM_URL}?${params}`, {
        method: "GET",
        headers: { Accept: "application/json", "User-Agent": "VividRise/1.0" },
      })
        .then((res) => res.json())
        .then((data) => {
          const addr = data?.address;
          if (!addr || typeof addr !== "object") {
            resolve("");
            return;
          }
          // 한국 주소: suburb(동), neighbourhood, city_district(구), city 등
          const dong = addr.suburb || addr.neighbourhood || addr.village || addr.town;
          const gu = addr.city_district || addr.county;
          const city = addr.city || addr.state;
          const name = dong || gu || city;
          resolve(name ? String(name).trim() : "");
        })
        .catch(() => resolve(""));
    }, REQUEST_DELAY_MS);
  });
}
