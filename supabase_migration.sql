-- ============================================
-- 웹툰별 코멘트 테이블
-- Supabase SQL Editor에서 실행하세요
-- ============================================

-- 1. 코멘트 테이블 생성
CREATE TABLE IF NOT EXISTS webtoon_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webtoon_id TEXT NOT NULL,
  nickname TEXT NOT NULL DEFAULT '익명',
  content TEXT NOT NULL CHECK (char_length(content) <= 50),
  created_at TIMESTAMPTZ DEFAULT now(),
  ip_hash TEXT  -- 스팸 방지용 IP 해시 (원본 미저장)
);

-- 2. 인덱스 (웹툰별 최신순 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_comments_webtoon_id ON webtoon_comments(webtoon_id, created_at DESC);

-- 3. RLS (Row Level Security)
ALTER TABLE webtoon_comments ENABLE ROW LEVEL SECURITY;

-- 누구나 읽기 가능
CREATE POLICY "Anyone can read comments" ON webtoon_comments
  FOR SELECT USING (true);

-- 누구나 삽입 가능 (캡차 검증은 프론트에서 처리)
CREATE POLICY "Anyone can insert comments" ON webtoon_comments
  FOR INSERT WITH CHECK (true);

-- ============================================
-- 토너먼트 글로벌 통계 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS worldcup_global_stats (
  webtoon_id TEXT PRIMARY KEY,
  win_count INTEGER DEFAULT 0,
  pick_count INTEGER DEFAULT 0,
  appearance_count INTEGER DEFAULT 0
);

ALTER TABLE worldcup_global_stats ENABLE ROW LEVEL SECURITY;

-- 누구나 읽기 가능
CREATE POLICY "Anyone can read stats" ON worldcup_global_stats
  FOR SELECT USING (true);

-- 누구나 삽입/업데이트 가능
CREATE POLICY "Anyone can upsert stats" ON worldcup_global_stats
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update stats" ON worldcup_global_stats
  FOR UPDATE USING (true);

-- 우승 기록 RPC 함수 (Atomic increment)
CREATE OR REPLACE FUNCTION increment_worldcup_win(p_webtoon_id TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO worldcup_global_stats (webtoon_id, win_count, pick_count, appearance_count)
  VALUES (p_webtoon_id, 1, 0, 0)
  ON CONFLICT (webtoon_id)
  DO UPDATE SET win_count = worldcup_global_stats.win_count + 1;
END;
$$ LANGUAGE plpgsql;

-- 선택(pick) 기록 RPC 함수
CREATE OR REPLACE FUNCTION increment_worldcup_pick(p_webtoon_id TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO worldcup_global_stats (webtoon_id, pick_count, win_count, appearance_count)
  VALUES (p_webtoon_id, 1, 0, 0)
  ON CONFLICT (webtoon_id)
  DO UPDATE SET pick_count = worldcup_global_stats.pick_count + 1;
END;
$$ LANGUAGE plpgsql;

-- 등장(appearance) 기록 RPC 함수
CREATE OR REPLACE FUNCTION increment_worldcup_appearance(p_webtoon_id TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO worldcup_global_stats (webtoon_id, appearance_count, win_count, pick_count)
  VALUES (p_webtoon_id, 1, 0, 0)
  ON CONFLICT (webtoon_id)
  DO UPDATE SET appearance_count = worldcup_global_stats.appearance_count + 1;
END;
$$ LANGUAGE plpgsql;
