/**
 * 앱인토스 Safe Area 여백 연동
 * - 토스 WebView에서는 SafeAreaInsets.get() / subscribe() 로 픽셀 값을 받아 CSS 변수로 적용합니다.
 * - SDK 미제공 시에는 CSS env(safe-area-inset-*) 에만 의존합니다.
 * @see https://developers-apps-in-toss.toss.im/bedrock/reference/framework/화면%20제어/safe-area.html
 */

const ROOT = typeof document !== 'undefined' ? document.documentElement : null;
const VAR_TOP = '--safe-area-inset-top';
const VAR_BOTTOM = '--safe-area-inset-bottom';
const VAR_LEFT = '--safe-area-inset-left';
const VAR_RIGHT = '--safe-area-inset-right';

/** SDK에서 제공하는 SafeAreaInsets (호스트 주입 시 window.SafeAreaInsets) */
function getSafeAreaAPI() {
  if (typeof window === 'undefined') return null;
  return window.SafeAreaInsets || null;
}

/**
 * 현재 Safe Area 값을 가져옵니다.
 * @returns {{ top: number, bottom: number, left?: number, right?: number } | null}
 */
export function getSafeAreaInsets() {
  const api = getSafeAreaAPI();
  if (!api) return null;
  if (typeof api.get === 'function') {
    try {
      return api.get();
    } catch (_) {
      return null;
    }
  }
  if (typeof window.getSafeAreaInsets === 'function') {
    try {
      const v = window.getSafeAreaInsets();
      return v && (v.top != null || v.bottom != null) ? { top: v.top ?? 0, bottom: v.bottom ?? 0, left: v.left ?? 0, right: v.right ?? 0 } : null;
    } catch (_) {
      return null;
    }
  }
  return null;
}

/**
 * Safe Area 변경을 구독합니다. (화면 모드 변경 시 등)
 * @param {(insets: { top: number, bottom: number, left?: number, right?: number }) => void} onEvent
 * @returns {() => void} cleanup
 */
export function subscribeSafeArea(onEvent) {
  const api = getSafeAreaAPI();
  if (!api || typeof api.subscribe !== 'function') return () => {};
  try {
    const cleanup = api.subscribe({ onEvent });
    return typeof cleanup === 'function' ? cleanup : () => {};
  } catch (_) {
    return () => {};
  }
}

/**
 * 루트 요소에 Safe Area 픽셀 값을 CSS 변수로 적용합니다.
 * @param {{ top: number, bottom: number, left?: number, right?: number }} insets
 */
export function applySafeAreaToRoot(insets) {
  if (!ROOT || !insets) return;
  ROOT.style.setProperty(VAR_TOP, `${insets.top ?? 0}px`);
  ROOT.style.setProperty(VAR_BOTTOM, `${insets.bottom ?? 0}px`);
  ROOT.style.setProperty(VAR_LEFT, `${insets.left ?? 0}px`);
  ROOT.style.setProperty(VAR_RIGHT, `${insets.right ?? 0}px`);
}
