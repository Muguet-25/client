-- 구독자 히스토리 테이블 생성
-- Supabase SQL Editor에서 실행하세요

CREATE TABLE IF NOT EXISTS subscriber_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id TEXT NOT NULL,
  subscriber_count INTEGER NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스 생성 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_subscriber_history_user_channel ON subscriber_history(user_id, channel_id);
CREATE INDEX IF NOT EXISTS idx_subscriber_history_recorded_at ON subscriber_history(recorded_at DESC);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE subscriber_history ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 데이터만 조회/생성 가능
CREATE POLICY "Users can view their own subscriber history"
  ON subscriber_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriber history"
  ON subscriber_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- updated_at 자동 업데이트 트리거 (필요 시)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriber_history_updated_at
  BEFORE UPDATE ON subscriber_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

