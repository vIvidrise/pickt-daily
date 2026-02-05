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

/** 찜 목록에 있는지 (name + naverUrl 기준) */
export function isFavorited(place, list) {
  if (!place?.name || !place?.naverUrl) return false;
  const arr = list != null ? list : getFavorites();
  return arr.some((p) => p.name === place.name && p.naverUrl === place.naverUrl);
}

function serialize(list) {
  return JSON.stringify(list);
}

/** 찜하기 추가. 앱인토스에서는 Promise 반환. */
export function addFavorite(place) {
  if (!place?.name || !place?.naverUrl) return Promise.resolve();
  const Storage = getStorage();
  const list = getFavorites();
  if (list.some((p) => p.name === place.name && p.naverUrl === place.naverUrl))
    return Promise.resolve();
  const next = [
    ...list,
    {
      name: place.name,
      emoji: place.emoji || "📍",
      naverUrl: place.naverUrl,
      tag: place.tag || "",
      address: place.address || "",
      /** 'eat' = 오늘 뭐 먹지에서 찜, 'do' = 오늘 뭐 하지에서 찜 (나의 찜한 코스용) */
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

/** 찜 해제. 앱인토스에서는 Promise 반환. */
export function removeFavorite(place) {
  if (!place?.name || !place?.naverUrl) return Promise.resolve();
  const Storage = getStorage();
  const list = getFavorites().filter(
    (p) => !(p.name === place.name && p.naverUrl === place.naverUrl)
  );
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
