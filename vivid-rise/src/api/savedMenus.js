/**
 * Supabase 연동: 메뉴(장소) 저장 / 내 보관함 조회
 * - menus 테이블: 메뉴(장소) 마스터
 * - user_saved_items: 유저별 저장 목록
 */

import { supabase, isSupabaseConfigured } from "../lib/supabaseClient.js";
import { getOrCreateUserId } from "../utils/userId.js";

/**
 * 추천 결과 place 객체를 menus 행 형태로 변환
 * @param {Object} place - Result 화면의 selectedPlace
 * @param {string} category - 'eat' | 'do'
 * @returns {Object}
 */
function placeToMenuRow(place, category = "eat") {
  return {
    name: place.name ?? "",
    category: category === "do" ? "do" : "eat",
    tag: place.tag ?? "",
    emoji: place.emoji ?? "📍",
    naver_url: place.naverUrl ?? "",
    address: place.address ?? "",
    representative_menu: place.representativeMenu ?? "",
    status: place.status ?? "",
    notice: place.notice ?? "",
  };
}

/**
 * 메뉴 upsert (naver_url 기준). 있으면 id 반환, 없으면 삽입 후 id 반환
 * @param {Object} place
 * @returns {Promise<string|null>} menu_id 또는 null
 */
async function upsertMenu(place, category = "eat") {
  if (!isSupabaseConfigured() || !place?.naverUrl) return null;
  const row = placeToMenuRow(place, category);
  const { data: existing } = await supabase
    .from("menus")
    .select("id")
    .eq("naver_url", row.naver_url)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: inserted, error } = await supabase
    .from("menus")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    console.warn("[savedMenus] menus insert error:", error);
    return null;
  }
  return inserted?.id ?? null;
}

/**
 * 추천 메뉴(장소)를 현재 유저 보관함에 저장
 * @param {Object} place - Result의 selectedPlace
 * @param {string} [category='eat'] - 'eat' | 'do'
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export async function saveMenu(place, category = "eat") {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase 미설정" };
  }
  if (!place?.name || !place?.naverUrl) {
    return { ok: false, error: "유효하지 않은 메뉴 정보" };
  }

  const menuId = await upsertMenu(place, category);
  if (!menuId) return { ok: false, error: "메뉴 등록 실패" };

  const userId = getOrCreateUserId();
  const { error } = await supabase.from("user_saved_items").insert({
    user_id: userId,
    menu_id: menuId,
  });

  if (error) {
    if (error.code === "23505") return { ok: true }; // 이미 저장됨 (unique 위반)
    console.warn("[savedMenus] user_saved_items insert error:", error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/**
 * 현재 유저의 저장 메뉴 목록 조회 (menus join)
 * @returns {Promise<Array<{ id, name, category, tag, emoji, naver_url, address, representative_menu, saved_at }>>}
 */
export async function getSavedMenus() {
  if (!isSupabaseConfigured()) return [];
  const userId = getOrCreateUserId();

  const { data: savedRows, error: savedError } = await supabase
    .from("user_saved_items")
    .select("menu_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (savedError || !savedRows?.length) return [];

  const menuIds = savedRows.map((r) => r.menu_id);
  const { data: menus, error: menusError } = await supabase
    .from("menus")
    .select("id, name, category, tag, emoji, naver_url, address, representative_menu")
    .in("id", menuIds);

  if (menusError || !menus?.length) return [];

  const menuMap = Object.fromEntries(menus.map((m) => [m.id, m]));
  return savedRows
    .map((r) => {
      const menu = menuMap[r.menu_id];
      if (!menu) return null;
      return {
        ...menu,
        naverUrl: menu.naver_url,
        saved_at: r.created_at,
      };
    })
    .filter(Boolean);
}

/**
 * 보관함에서 삭제 (user_saved_items만 삭제)
 * @param {string} menuId - menus.id (UUID)
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export async function removeSavedMenu(menuId) {
  if (!isSupabaseConfigured()) return { ok: false, error: "Supabase 미설정" };
  const userId = getOrCreateUserId();

  const { error } = await supabase
    .from("user_saved_items")
    .delete()
    .eq("user_id", userId)
    .eq("menu_id", menuId);

  if (error) {
    console.warn("[savedMenus] delete error:", error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/**
 * 해당 장소(naverUrl)가 현재 유저 보관함에 있는지 여부
 * @param {string} naverUrl
 * @returns {Promise<boolean>}
 */
export async function isSavedInCloud(naverUrl) {
  if (!isSupabaseConfigured() || !naverUrl) return false;
  const userId = getOrCreateUserId();

  const { data: menu } = await supabase
    .from("menus")
    .select("id")
    .eq("naver_url", naverUrl)
    .maybeSingle();

  if (!menu) return false;

  const { data: saved } = await supabase
    .from("user_saved_items")
    .select("id")
    .eq("user_id", userId)
    .eq("menu_id", menu.id)
    .maybeSingle();

  return !!saved;
}
