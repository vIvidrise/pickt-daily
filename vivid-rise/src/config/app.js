/**
 * 앱 실제 서비스 URL (배포 도메인)
 * - NCP 지도 웹 서비스 URL, 공유 링크, canonical 등에 사용
 */
export const PRODUCTION_APP_URL = 'https://vivid-rise.vercel.app';

/** 현재 접속이 실제 서비스(프로덕션)인지 */
export function isProductionOrigin() {
  if (typeof window === 'undefined') return false;
  return window.location.origin === PRODUCTION_APP_URL;
}
