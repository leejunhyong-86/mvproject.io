-- ============================================
-- 활성화된 럭키드로우 이벤트 생성
-- ============================================
-- 기존 비활성화된 이벤트가 있다면 비활성화하고, 새로운 활성화된 이벤트를 생성합니다.

-- 기존 이벤트 비활성화 및 제목 업데이트
UPDATE lucky_draw_events SET is_active = false WHERE is_active = true;
UPDATE lucky_draw_events SET title = REPLACE(title, '대항해 ', '') WHERE title LIKE '대항해%';

-- 새로운 활성화된 이벤트 생성 (일주일 후 마감)
INSERT INTO lucky_draw_events (title, description, product_image_url, end_time, target_url, is_active)
VALUES (
  '럭키드로우',
  '바다 건너 온 특별한 경품! 단 200원으로 인기템을 겟 하는 방법!',
  NULL,
  NOW() + INTERVAL '7 days',
  '/events/lucky-draw',
  true
);
