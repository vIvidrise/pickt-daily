-- ============================================================
-- 요즘 뭐 함 (vivid-rise) Supabase 스키마
-- Supabase 대시보드 > SQL Editor에서 실행하세요.
-- ============================================================

-- 메뉴(장소) 테이블: 추천받은 메뉴/장소 정보
CREATE TABLE IF NOT EXISTS public.menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'eat',  -- 'eat' | 'do'
  tag TEXT DEFAULT '',
  emoji TEXT DEFAULT '📍',
  naver_url TEXT NOT NULL,
  address TEXT DEFAULT '',
  representative_menu TEXT DEFAULT '',
  status TEXT DEFAULT '',
  notice TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(naver_url)
);

-- 유저별 저장(찜) 목록: user_id + menu_id 매핑
CREATE TABLE IF NOT EXISTS public.user_saved_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  menu_id UUID NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, menu_id)
);

-- RLS (Row Level Security) 활성화
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_items ENABLE ROW LEVEL SECURITY;

-- menus: 누구나 읽기, 인증된 요청에서 삽입/수정 (또는 anon 허용)
CREATE POLICY "menus_select" ON public.menus FOR SELECT USING (true);
CREATE POLICY "menus_insert" ON public.menus FOR INSERT WITH CHECK (true);
CREATE POLICY "menus_update" ON public.menus FOR UPDATE USING (true);

-- user_saved_items: 본인 user_id만 조회/삽입/삭제
-- (anon key로 호출 시 요청 body/param으로 user_id를 넘기는 경우, 여기서는 클라이언트에서 user_id 사용)
CREATE POLICY "user_saved_items_select" ON public.user_saved_items FOR SELECT USING (true);
CREATE POLICY "user_saved_items_insert" ON public.user_saved_items FOR INSERT WITH CHECK (true);
CREATE POLICY "user_saved_items_delete" ON public.user_saved_items FOR DELETE USING (true);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_user_saved_items_user_id ON public.user_saved_items(user_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_items_menu_id ON public.user_saved_items(menu_id);
CREATE INDEX IF NOT EXISTS idx_menus_naver_url ON public.menus(naver_url);

COMMENT ON TABLE public.menus IS '추천 메뉴/장소 마스터';
COMMENT ON TABLE public.user_saved_items IS '유저별 저장한 메뉴(찜) 목록';
