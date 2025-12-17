# 해외직구멀티샵 MVP - 개발 체크리스트

## Phase 1: 프로젝트 기반 설정 (1주차) ✅

### 프로젝트 초기화
- [x] package.json 프로젝트명 변경 (`global-shop-multi`)
- [x] pnpm 의존성 설치
- [x] docs/prd.md 작성
- [x] docs/TODO.md 작성

### 데이터베이스 스키마
- [x] categories 테이블 마이그레이션
- [x] products 테이블 마이그레이션
- [x] external_reviews 테이블 마이그레이션
- [x] user_reviews 테이블 마이그레이션
- [x] ai_summaries 테이블 마이그레이션
- [x] wishlists 테이블 마이그레이션
- [x] review_votes 테이블 마이그레이션
- [x] recent_views 테이블 마이그레이션

### 디렉토리 구조
- [x] types/ 디렉토리 및 타입 정의
- [x] actions/ 디렉토리 및 Server Actions
- [x] lib/ai/ AI 서비스 추상화 레이어

---

## Phase 2: 핵심 기능 개발 (2주차) ✅

### 상품 목록 페이지 (릴스 스타일)
- [x] /products 페이지 생성
- [x] ProductCard 컴포넌트 (9:16 비율)
- [x] 호버 시 영상 재생 기능
- [x] 반응형 그리드 (4/3/2열)
- [x] 카테고리 필터
- [x] 가격순 정렬
- [x] 검색 기능

### 상품 상세 페이지
- [x] /products/[slug] 페이지 생성
- [x] 상품 정보 섹션
- [x] 영상/이미지 플레이어
- [x] AI 요약 박스 UI
- [x] 외부 리뷰 목록 (번역 토글)
- [x] 구매 링크 버튼

### AI 요약 시스템
- [x] /api/summarize-review API 라우트
- [x] AI 서비스 인터페이스 정의
- [x] Mock AI 응답 구현
- [x] 요약 결과 캐싱 로직

---

## Phase 3: 사용자 기능 (3주차) ✅

### 자체 리뷰 시스템
- [x] ReviewForm 컴포넌트
- [x] 별점 입력 UI
- [x] 리뷰 목록 컴포넌트
- [x] "도움됨" 투표 기능
- [x] Server Actions (CRUD)

### 마이페이지
- [x] /my 페이지 레이아웃
- [x] 내 리뷰 목록
- [x] 위시리스트

### 다국어 번역
- [x] 번역 토글 버튼 UI
- [x] /api/translate API 라우트
- [x] 번역 서비스 인터페이스

---

## Phase 4: 관리자 및 마무리 (4주차) ✅

### 관리자 페이지
- [x] /admin 대시보드
- [x] 상품 목록 페이지
- [x] 카테고리 관리 페이지

### UI/UX 개선
- [x] 로딩 스켈레톤
- [x] 에러 바운더리
- [x] not-found 페이지
- [x] Navbar 업데이트

### 테스트 및 배포
- [x] 주요 기능 수동 테스트 (docs/TESTING.md)
- [x] 샘플 데이터 50개 입력 (supabase/seed.sql, scripts/seed.ts)
- [x] 환경 변수 문서화 (docs/ENV.md)
- [x] Vercel 배포 설정 (docs/DEPLOY.md)

---

## Phase 5: 홈페이지 헤더 재디자인 ✅

### 히어로 헤더 컴포넌트
- [x] components/header/ 디렉토리 구조 생성
- [x] HeroHeader 컴포넌트 (메인 컨테이너)
- [x] TopBar 컴포넌트 (SNS 링크 + 사용자 메뉴)
- [x] SearchBar 컴포넌트 (초록색 테두리, 돋보기 아이콘)
- [x] SiteLogo 컴포넌트 ("해외직구멀티샵" 디자인 텍스트)

### 디자인 적용
- [x] 중세 세계지도 배경 이미지 (public/images/hero-bg.jpg)
- [x] 골드/베이지 톤 로고 텍스트
- [x] 초록색 검색창 스타일링

### 레이아웃 수정
- [x] 홈페이지에 HeroHeader 적용
- [x] Navbar 조건부 렌더링 (홈페이지에서 숨김)
- [x] 반응형 디자인 (데스크탑/태블릿/모바일)

### 사용자 메뉴
- [x] YouTube, Instagram SNS 링크 버튼
- [x] 로그인/회원가입 (Clerk 연동)
- [x] 장바구니/주문조회 (준비 중 안내)
- [x] 마이쇼핑 링크

---

## Phase 6: 카테고리 네비게이션 바 ✅

### 네비게이션 바 컴포넌트
- [x] constants/navigation.ts - 카테고리 데이터 및 타입 정의
- [x] components/header/home-button.tsx - 닻 아이콘 홈 버튼
- [x] components/header/hamburger-menu.tsx - 햄버거 메뉴 및 전체 카테고리 드롭다운
- [x] components/header/category-navbar.tsx - 메인 네비게이션 바 컨테이너

### 카테고리 구조 (11개)
- 프리오더, 체험단 모집, 신상품
- 전자기기, 뷰티, 패션, 푸드
- 주방용품, 스포츠, 유아용품, 홈인테리어

### 레이아웃 적용
- [x] 홈페이지에 CategoryNavbar 적용 (HeroHeader 아래)
- [x] 반응형 디자인 (데스크탑/태블릿/모바일)

### 기능
- [x] 닻 아이콘 홈 버튼 (항구 컨셉)
- [x] 햄버거 메뉴로 전체 카테고리 펼치기
- [x] 세부 카테고리 표시
- [x] 외부 클릭 시 드롭다운 닫기
- [x] ESC 키로 드롭다운 닫기
- [x] 스티키 포지션 (스크롤 시 상단 고정)

---

## 다음 단계 (MVP 이후)

- [ ] SNS 링크 실제 URL 연결
- [ ] 장바구니 기능 구현
- [ ] 주문조회 기능 구현
- [ ] 상품 등록/수정 폼 구현
- [ ] 카테고리 추가/수정 폼 구현
- [ ] 외부 리뷰 입력 폼 구현
- [ ] 실제 AI API 연동 (OpenAI/Claude/Gemini)
- [ ] E2E 테스트 (Playwright)
- [ ] 성능 최적화 (이미지, 번들)
- [ ] 접근성 개선
- [ ] 다크 모드

---

## 참고 문서

- [PRD](./prd.md) - 제품 요구사항
- [기획서](./newproject.md) - 상세 기획서
- [AGENTS.md](../AGENTS.md) - 기술 가이드
