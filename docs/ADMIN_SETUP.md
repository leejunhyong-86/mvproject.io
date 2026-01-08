# 관리자 페이지 설정 가이드

관리자 페이지를 사용하기 위한 설정 가이드입니다.

## 1. 데이터베이스 마이그레이션 실행

Supabase에서 마이그레이션 파일을 실행하여 `users` 테이블에 `role` 필드를 추가합니다.

### 방법 1: Supabase SQL Editor 사용 (권장)

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 클릭
4. **New query** 클릭
5. 다음 SQL 실행:

```sql
-- Users 테이블에 role 필드 추가
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT NULL;

-- 코멘트 추가
COMMENT ON COLUMN public.users.role IS '사용자 역할: admin (관리자), user (일반 사용자), NULL (기본값, 일반 사용자)';

-- 인덱스 추가 (관리자 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role) WHERE role = 'admin';
```

또는 마이그레이션 파일 직접 실행:
- 파일: `supabase/migrations/20260108153544_add_role_to_users.sql`
- 내용을 복사하여 SQL Editor에 붙여넣고 실행

### 방법 2: Supabase CLI 사용

```bash
supabase db push
```

## 2. 관리자 권한 부여

특정 사용자를 관리자로 지정합니다.

### 전제 조건

- 사용자가 이미 로그인하여 `users` 테이블에 동기화되어 있어야 합니다
- Clerk User ID를 알고 있어야 합니다

### Clerk User ID 찾는 방법

1. [Clerk Dashboard](https://dashboard.clerk.com) 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 **Users** 클릭
4. 관리자로 지정할 사용자 선택
5. **User ID** 복사 (예: `user_2abc123def456ghi789`)

### 관리자 지정 실행

```bash
pnpm set-admin <clerk_user_id>
```

**예시:**
```bash
pnpm set-admin user_2abc123def456ghi789
```

### 실행 결과 확인

스크립트가 성공적으로 실행되면:
```
✅ 관리자 권한이 성공적으로 부여되었습니다!
📊 업데이트된 정보:
   이름: 홍길동
   Clerk ID: user_2abc123def456ghi789
   역할: admin
🎉 이제 /admin 페이지에 접근할 수 있습니다.
```

## 3. 관리자 페이지 접근 확인

1. 지정한 사용자로 로그인
2. `/admin` 페이지 접속
3. 관리자 대시보드가 표시되면 성공!

## 4. 관리자 권한 해제 (선택사항)

관리자 권한을 해제하려면 Supabase SQL Editor에서 실행:

```sql
UPDATE public.users 
SET role = NULL 
WHERE clerk_id = 'user_2abc123def456ghi789';
```

또는 일반 사용자로 변경:

```sql
UPDATE public.users 
SET role = 'user' 
WHERE clerk_id = 'user_2abc123def456ghi789';
```

## 5. 기능 테스트

관리자로 지정된 사용자는 다음 기능을 사용할 수 있습니다:

### 카테고리 관리
- `/admin/categories` - 카테고리 목록
- `/admin/categories/new` - 카테고리 추가
- `/admin/categories/[id]/edit` - 카테고리 수정
- 카테고리 삭제 (목록 페이지에서)

### 상품 관리
- `/admin/products` - 상품 목록
- `/admin/products/new` - 상품 등록
- `/admin/products/[id]/edit` - 상품 수정
- 상품 상세 이미지 관리 (ImageManager 컴포넌트)

## 문제 해결

### "사용자를 찾을 수 없습니다" 오류

- 사용자가 먼저 로그인하여 `users` 테이블에 동기화되어 있는지 확인
- Clerk User ID가 정확한지 확인
- Supabase에서 `users` 테이블을 확인하여 해당 `clerk_id`가 있는지 확인

### "관리자 권한이 필요합니다" 오류

- 관리자 권한이 제대로 부여되었는지 확인:
  ```sql
  SELECT clerk_id, name, role FROM public.users WHERE clerk_id = 'user_2abc123def456ghi789';
  ```
- `role`이 `'admin'`인지 확인
- 로그아웃 후 다시 로그인

### 마이그레이션 오류

- `role` 필드가 이미 존재하는 경우: `IF NOT EXISTS` 구문으로 안전하게 처리됨
- 권한 오류: Supabase 프로젝트의 데이터베이스 권한 확인

## 참고

- 관리자 권한은 `users` 테이블의 `role` 필드로 관리됩니다
- `role = 'admin'`인 사용자만 관리자 페이지에 접근할 수 있습니다
- 일반 사용자는 `role = NULL` 또는 `role = 'user'`입니다
