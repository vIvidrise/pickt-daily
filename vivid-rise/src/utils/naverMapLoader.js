/**
 * 네이버 지도 JavaScript API v3 (웹용) 스크립트 로더
 * - 2025.05 기준: ncpKeyId 사용 (ncpClientId → ncpKeyId 변경)
 * - 문서: https://navermaps.github.io/maps.js.ncp/docs/
 * - NCP 웹 서비스 URL에 접속 주소(예: http://localhost:5173) 등록 필수
 */

const CLIENT_ID = "tfdaiuu9rx";
const SCRIPT_URL = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${CLIENT_ID}`;

let loading = false;
let loaded = false;
let resolvePromise = null;
let rejectPromise = null;
let waitPromise = null;

function loadScript() {
  if (loaded) return Promise.resolve(window.naver);
  if (document.querySelector('script[src*="openapi.map.naver.com"]')) {
    return waitForNaver();
  }

  loading = true;
  const promise = waitForNaver();

  const script = document.createElement("script");
  script.src = SCRIPT_URL;
  script.async = true;
  script.onload = () => {
    loading = false;
    loaded = !!window.naver?.maps;
    if (loaded && resolvePromise) resolvePromise(window.naver);
    else if (!loaded && rejectPromise) rejectPromise(new Error("naver.maps not defined"));
  };
  script.onerror = () => {
    loading = false;
    const err = new Error("[네이버 지도] 스크립트 로드 실패. NCP 웹 서비스 URL·Client ID를 확인하세요.");
    if (rejectPromise) rejectPromise(err);
    console.warn(err.message);
  };
  document.head.appendChild(script);

  return promise;
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
  return !!document.querySelector('script[src*="openapi.map.naver.com"]');
}

/**
 * window.naver.maps 사용 가능 여부
 */
export function isNaverMapsReady() {
  return !!window.naver?.maps;
}
