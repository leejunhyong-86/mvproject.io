-- ============================================
-- Lucky Draw Events 테이블
-- ============================================
-- 럭키드로우 이벤트 정보를 저장하는 테이블
-- 마감 시간 기반의 카운트다운 타이머를 위한 데이터 관리

CREATE TABLE IF NOT EXISTS lucky_draw_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  product_image_url TEXT,
  end_time TIMESTAMPTZ NOT NULL,
  target_url TEXT DEFAULT '/events/lucky-draw',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스: 활성화된 이벤트 조회 최적화
CREATE INDEX idx_lucky_draw_events_active ON lucky_draw_events (is_active, end_time DESC);

-- 코멘트
COMMENT ON TABLE lucky_draw_events IS '럭키드로우 이벤트 정보';
COMMENT ON COLUMN lucky_draw_events.title IS '이벤트 제목';
COMMENT ON COLUMN lucky_draw_events.description IS '이벤트 설명';
COMMENT ON COLUMN lucky_draw_events.product_image_url IS '경품 상품 이미지 URL';
COMMENT ON COLUMN lucky_draw_events.end_time IS '이벤트 마감 시간 (카운트다운 종료 시점)';
COMMENT ON COLUMN lucky_draw_events.target_url IS '클릭 시 이동할 페이지 URL';
COMMENT ON COLUMN lucky_draw_events.is_active IS '활성화 여부';

-- 샘플 데이터: 테스트용 럭키드로우 이벤트 (일주일 후 마감)
INSERT INTO lucky_draw_events (title, description, product_image_url, end_time, target_url, is_active)
VALUES (
  '대항해 럭키드로우',
  '바다 건너 온 특별한 경품! 단 200원으로 인기템을 겟 하는 방법!',
  NULL,
  NOW() + INTERVAL '7 days',
  '/events/lucky-draw',
  true
);
