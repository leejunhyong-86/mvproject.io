# Shopee Thailand 크롤러

태국 쇼피(shopee.co.th) 베스트셀러 상품을 크롤링하여 Supabase에 저장합니다.

## 주요 기능

- 🛒 Shopee Thailand 인기 상품 크롤링
- 📊 상품 정보 추출 (제목, 가격, 평점, 리뷰 수, 판매 수량)
- 🖼️ 이미지 및 영상 URL 추출
- 💾 Supabase products 테이블 자동 저장
- 🤖 봇 탐지 우회 로직 포함

## 설치

```bash
cd tools/shopee-crawler
pnpm install
```

## 환경 설정

1. `env.template`을 복사하여 `.env` 파일 생성:

```bash
cp env.template .env
```

2. `.env` 파일에 Supabase 정보 입력:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
MAX_PRODUCTS=10
HEADLESS=true
```

또는 메인 프로젝트의 `.env` 파일을 심볼릭 링크로 연결:

```bash
# Windows (관리자 권한 필요)
mklink .env ..\..\..\.env

# Mac/Linux
ln -s ../../../.env .env
```

## 사용법

### 기본 크롤링

```bash
pnpm crawl
```

### 개발 모드 (파일 변경 감지)

```bash
pnpm crawl:dev
```

### Supabase 연결 테스트

```bash
pnpm test
```

## 설정 옵션

| 환경 변수 | 기본값 | 설명 |
|----------|--------|------|
| `MAX_PRODUCTS` | 10 | 크롤링할 최대 상품 수 |
| `HEADLESS` | true | 브라우저 헤드리스 모드 |

## 크롤링 대상

- Shopee Thailand Daily Discover
- Top Products 섹션
- 인기 카테고리 상품

## 추출 데이터

| 필드 | 설명 |
|------|------|
| `title` | 상품명 (태국어) |
| `description` | 상품 설명 |
| `thumbnail_url` | 메인 이미지 |
| `video_url` | 상품 영상 (있는 경우) |
| `original_price` | 가격 (THB) |
| `price_krw` | 원화 환산 가격 |
| `external_rating` | 평점 (1-5) |
| `external_review_count` | 리뷰 수 |
| `source_url` | 원본 상품 URL |

## 주의사항

1. **봇 탐지**: Shopee는 강력한 봇 탐지가 있으므로:
   - 첫 실행 시 `HEADLESS=false`로 CAPTCHA 확인
   - 충분한 딜레이가 자동 적용됩니다 (3-6초)

2. **환율**: THB → KRW 환산은 약 40원/바트로 계산됩니다.

3. **언어**: 상품명은 태국어 그대로 저장됩니다.

## ⚠️ 알려진 제한 사항

**Shopee Thailand는 매우 강력한 봇 탐지 시스템을 사용합니다.**

현재 테스트 결과:
- Puppeteer + Stealth 플러그인으로도 콘텐츠 로딩 차단
- 빈 페이지만 표시됨 (서버 측 차단 추정)
- IP 기반 차단 가능성 높음

### 해결 방안

1. **Residential Proxy 사용** (유료 서비스)
   - Bright Data, Oxylabs 등
   - 실제 가정용 IP로 우회

2. **Shopee Open API 사용**
   - 공식 파트너쉽 프로그램 가입 필요
   - https://open.shopee.com/

3. **대안 플랫폼 크롤링**
   - Lazada (동남아시아)
   - Amazon (글로벌)
   - 이미 구현된 크롤러 사용

## 문제 해결

### CAPTCHA 발생 시

```bash
# 헤드리스 모드 비활성화
HEADLESS=false pnpm crawl
```

브라우저가 열리면 수동으로 CAPTCHA를 해결한 후 크롤링이 계속됩니다.

### 연결 오류

```bash
# Supabase 연결 테스트
pnpm test
```

### 상품이 수집되지 않음

- Shopee의 봇 탐지로 인해 콘텐츠가 로딩되지 않을 수 있습니다
- `HEADLESS=false`로 실행하여 페이지 상태 확인
- 스크린샷은 `screenshots/` 폴더에 저장됩니다

## 관련 문서

- [메인 프로젝트 README](../../README.md)
- [Kickstarter 크롤러](../kickstarter-crawler/README.md)
- [Wadiz 크롤러](../wadiz-crawler/README.md)
- [Amazon 크롤러](../amazon-crawler/README.md)

