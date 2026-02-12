/**
 * 네이버 지도 JavaScript API v3 (웹용) 스크립트 로더
 * - 문서: https://navermaps.github.io/maps.js.ncp/docs/
 * - NCP 콘솔에서 웹 서비스 URL에 실서비스 도메인 등록 필수
 *   실제 서비스: https://vivid-rise.vercel.app
 *   로컬: http://localhost:5174
 */

// 네이버 지도 Client ID — Vite/Vercel 환경 변수 VITE_NAVER_MAP_CLIENT_ID (빌드 시점에 주입됨)
const envId =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_NAVER_MAP_CLIENT_ID)
    ? String(import.meta.env.VITE_NAVER_MAP_CLIENT_ID).trim()
    : "";
// 로컬 개발 시 .env 미로드 등으로 비어 있으면 fallback (배포 시에는 반드시 Vercel 환경 변수 설정)
const CLIENT_ID =
  envId ||
  (typeof import.meta !== "undefined" && import.meta.env?.DEV ? "tfdaiuu9rx" : "");
// NCP Maps: ncpKeyId(신규) / ncpClientId(구버전) 둘 다 시도. 블로그 참고: https://m.blog.naver.com/dossong_/223936065167
const SCRIPT_URLS = CLIENT_ID
  ? [
      `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(CLIENT_ID)}&submodules=geocoder`,
      `https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(CLIENT_ID)}&submodules=geocoder`,
      `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${encodeURIComponent(CLIENT_ID)}&submodules=geocoder`,
    ]
  : [];

const MAP_SETUP_MSG =
  "[네이버 지도] 1) Vercel/로컬 .env에 VITE_NAVER_MAP_CLIENT_ID 설정 2) NCP 콘솔 > Maps > Application > 웹 서비스 URL에 실제 서비스 https://vivid-rise.vercel.app 및 로컬 http://localhost:5174 등록";

let loading = false;
let loaded = false;
let resolvePromise = null;
let rejectPromise = null;
let waitPromise = null;
let tryIndex = 0;

function loadScript() {
  if (loaded) return Promise.resolve(window.naver);
  if (!CLIENT_ID || SCRIPT_URLS.length === 0) {
    const err = new Error(MAP_SETUP_MSG);
    console.warn(err.message);
    return Promise.reject(err);
  }
  const existing = document.querySelector('script[src*="map.naver.com"]');
  if (existing) return waitForNaver();

  loading = true;
  tryIndex = 0;
  const promise = waitForNaver();
  tryLoadOne();
  return promise;
}

function tryLoadOne() {
  if (tryIndex >= SCRIPT_URLS.length) {
    loading = false;
    const err = new Error(MAP_SETUP_MSG);
    if (rejectPromise) rejectPromise(err);
    console.warn(err.message);
    return;
  }
  const scriptUrl = SCRIPT_URLS[tryIndex];
  const script = document.createElement("script");
  script.src = scriptUrl;
  script.async = true;
  script.onload = () => {
    if (window.naver?.maps) {
      loading = false;
      loaded = true;
      if (resolvePromise) resolvePromise(window.naver);
      return;
    }
    setTimeout(() => {
      loading = false;
      loaded = !!window.naver?.maps;
      if (loaded && resolvePromise) resolvePromise(window.naver);
      else if (!loaded && rejectPromise) rejectPromise(new Error("naver.maps not defined"));
    }, 200);
  };
  script.onerror = () => {
    tryIndex += 1;
    tryLoadOne();
  };
  document.head.appendChild(script);
}

function waitForNaver() {
  if (window.naver?.maps) return Promise.resolve(window.naver);
  if (waitPromise) return waitPromise;
  waitPromise = new Promise((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
    const check = () => {
      if (window.naver?.maps) {
        resolve(window.naver);
        return;
      }
      if (!loading && !window.naver?.maps) {
        reject(new Error("naver.maps not available"));
        return;
      }
      setTimeout(check, 100);
    };
    check();
  });
  return waitPromise;
}

/**
 * 네이버 지도 스크립트를 로드합니다. 이미 로드됐으면 바로 resolve.
 * @returns {Promise<typeof window.naver>}
 */
export function loadNaverMapScript() {
  return loadScript();
}

/**
 * 스크립트가 이미 DOM에 있는지 여부
 */
export function isNaverMapScriptInDom() {
  return !!document.querySelector('script[src*="map.naver.com"]');
}

/**
 * window.naver.maps 사용 가능 여부
 */
export function isNaverMapsReady() {
  return !!window.naver?.maps;
}
