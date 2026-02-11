/**
 * 찜한 장소 저장
 * - 앱인토스: 네이티브 Storage 사용 (기기 변경 시 데이터 유지)
 * - 그 외: localStorage
 * @see https://developers-apps-in-toss.toss.im/bedrock/reference/framework/저장소/Storage.html
 */

import { getStorage, getStorageAdapter } from "./appsInTossSdk.js";

const STORAGE_KEY = "vivid-rise-favorites";

/** 앱인토스 Storage 사용 시 메모리 캐시 (loadFavoritesCache() 후 getFavorites() 반환값) */
let cache = [];
let cacheLoaded = false;

function parse(raw) {
  if (raw == null || raw === "") return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** 앱인토스 환경에서 Storage에서 찜 목록을 불러와 캐시에 채움. 앱 진입 완료 후 호출 권장. */
export async function loadFavoritesCache() {
  const Storage = getStorage();
  if (!Storage) {
    cacheLoaded = true;
    return;
  }
  const adapter = getStorageAdapter();
  try {
    const raw = await adapter.getItem(STORAGE_KEY);
    cache = parse(raw);
  } catch (_) {
    cache = [];
  }
  cacheLoaded = true;
}

/** 찜 목록 (동기). 앱인토스에서는 loadFavoritesCache() 호출 후 유효. */
export function getFavorites() {
  const Storage = getStorage();
  if (Storage && !cacheLoaded) return [];
  if (Storage) return [...cache];
  try {
    return parse(typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null);
  } catch {
    return [];
  }
}

/** place.id 또는 (name + naverUrl) 기준으로 찜 여부 판단 */
export function isFavorited(place, list) {
  const arr = list != null ? list : getFavorites();
  const idA = place?.id;
  const naverUrl = place?.naverUrl ?? place?.naver_map_url;
  if (idA != null) {
    return arr.some((p) => String(p.id) === String(idA));
  }
  if (place?.name && naverUrl) {
    return arr.some((p) => p.name === place.name && (p.naverUrl || p.naver_map_url) === naverUrl);
  }
  return false;
}

function serialize(list) {
  return JSON.stringify(list);
}

/** 찜하기 추가. name 필수, id 또는 naverUrl 있으면 저장. Saved에서 id로 places.ts와 매칭. */
export function addFavorite(place) {
  if (!place?.name) return Promise.resolve();
  const naverUrl = (place?.naverUrl ?? place?.naver_map_url) || "";
  const idA = place.id;
  if (idA == null && !naverUrl) return Promise.resolve();
  const Storage = getStorage();
  const list = getFavorites();
  const already =
    (idA != null && list.some((p) => String(p.id) === String(idA))) ||
    (naverUrl && list.some((p) => p.name === place.name && (p.naverUrl || p.naver_map_url) === naverUrl));
  if (already) return Promise.resolve();
  const next = [
    ...list,
    {
      id: idA ?? null,
      name: place.name,
      emoji: place.emoji || "📍",
      naverUrl: naverUrl,
      tag: place.tag || "",
      address: place.address || "",
      imageUrl: place.imageUrl || "",
      type: place.type ?? null,
      lat: place.lat ?? null,
      lng: place.lng ?? null,
    },
  ];
  if (Storage) {
    cache = next;
    return getStorageAdapter().setItem(STORAGE_KEY, serialize(next));
  }
  try {
    localStorage.setItem(STORAGE_KEY, serialize(next));
  } catch (e) {
    console.warn("찜 목록 저장 실패:", e);
  }
  return Promise.resolve();
}

/** 찜 해제. id 또는 name+naverUrl 기준. */
export function removeFavorite(place) {
  const naverUrl = place?.naverUrl ?? place?.naver_map_url;
  const Storage = getStorage();
  const list = getFavorites().filter((p) => {
    if (place?.id != null && String(p.id) === String(place.id)) return false;
    if (place?.name && naverUrl && p.name === place.name && (p.naverUrl || p.naver_map_url) === naverUrl) return false;
    return true;
  });
  if (list.length === getFavorites().length) return Promise.resolve();
  if (Storage) {
    cache = list;
    return getStorageAdapter().setItem(STORAGE_KEY, serialize(list));
  }
  try {
    localStorage.setItem(STORAGE_KEY, serialize(list));
  } catch (e) {
    console.warn("찜 목록 저장 실패:", e);
  }
  return Promise.resolve();
}
