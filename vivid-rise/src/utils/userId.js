/**
 * 클라이언트 유저 식별자 (Supabase 저장 시 사용)
 * - 토스 로그인 연동 전까지 localStorage 기반 UUID 사용
 * - 추후 토스 인가 코드/유저 ID로 교체 가능
 */

const USER_ID_KEY = "vivid-rise-user-id";

function generateId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 현재 유저 ID 반환 (없으면 생성 후 저장)
 * @returns {string}
 */
export function getOrCreateUserId() {
  if (typeof localStorage === "undefined") return generateId();
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = generateId();
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}
