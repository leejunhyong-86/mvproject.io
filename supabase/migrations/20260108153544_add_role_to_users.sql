-- Users 테이블에 role 필드 추가
-- 관리자 권한 관리를 위한 역할 필드

-- role 필드 추가
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT NULL;

-- 코멘트 추가
COMMENT ON COLUMN public.users.role IS '사용자 역할: admin (관리자), user (일반 사용자), NULL (기본값, 일반 사용자)';

-- 인덱스 추가 (관리자 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role) WHERE role = 'admin';
