/**
 * 앱인토스 WebView 내비게이션 바 연동
 * - 토스 앱 내에서 미니앱이 열리면 호스트가 partner / tdsEvent 를 주입한다고 가정합니다.
 * - 이 환경에서는 커스텀 헤더를 숨기고, 액세서리 버튼(찜 등)만 동적으로 연동합니다.
 * @see https://developers-apps-in-toss.toss.im/bedrock/reference/framework/UI/NavigationBar.html
 */

const getPartner = () => typeof window !== 'undefined' && window.partner;
const getTdsEvent = () => typeof window !== 'undefined' && window.tdsEvent;

/** 토스 미니앱 도메인 여부 (검토/실서비스 WebView에서 플랫폼 공통 바 사용) */
function isTossMiniAppHost() {
  if (typeof window === 'undefined' || !window.location?.hostname) return false;
  const h = window.location.hostname.toLowerCase();
  return /tossmini\.com|private-apps\.tossmini|apps\.toss\.im/i.test(h);
}

/** 토스 앱인토스 WebView 안에서 실행 중인지 여부 (자체 헤더 제거 시 사용) */
export function isAppsInTossEnv() {
  return !!(getPartner() && getTdsEvent()) || isTossMiniAppHost();
}

/**
 * 현재 라우트에 맞게 내비게이션 옵션을 설정합니다.
 * (실제 withBackButton / withHomeButton 은 defineConfig 에서만 설정 가능할 수 있음.
 *  런타임에 변경 API가 있다면 여기서 호출)
 */
export function setNavigationBarOptions(/* options */) {
  const partner = getPartner();
  if (!partner || typeof partner.setNavigationBar !== 'function') return;
  // 문서에 런타임 setNavigationBar API가 있으면 여기서 호출
}

/**
 * 액세서리 버튼(찜 하트) 1개 추가. Result 등에서 호출.
 * @param {() => void} onPress - 버튼 클릭 시 콜백
 * @returns {() => void} cleanup
 */
export function addAccessoryButton(onPress) {
  const partner = getPartner();
  const tdsEvent = getTdsEvent();
  if (!partner?.addAccessoryButton || !tdsEvent?.addEventListener) return () => {};

  partner.addAccessoryButton({
    id: 'heart',
    title: '찜한 장소',
    icon: { name: 'icon-heart-mono' },
  });

  const cleanup = tdsEvent.addEventListener('navigationAccessoryEvent', {
    onEvent: ({ id }) => {
      if (id === 'heart' && typeof onPress === 'function') onPress();
    },
  });

  return () => {
    if (typeof cleanup === 'function') cleanup();
  };
}
