/**
 * Supabase 클라이언트 설정
 * - VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY 환경 변수 필요
 * - .env 파일에 추가 후 사용
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[Supabase] VITE_SUPABASE_URL 또는 VITE_SUPABASE_ANON_KEY가 없습니다. .env를 설정해 주세요."
  );
}

/** Supabase 클라이언트 (설정 없으면 null 반환) */
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/** Supabase 사용 가능 여부 */
export function isSupabaseConfigured() {
  return supabase != null;
}
