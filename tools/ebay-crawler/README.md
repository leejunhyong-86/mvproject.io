# eBay 크롤러

eBay에서 다양한 모드로 상품을 크롤링하여 Supabase에 저장하는 도구입니다.

## 설치

```bash
cd tools/ebay-crawler
pnpm install
```

## 환경 설정

1. `.env` 파일 생성:

```bash
cp env.template .env
```

2. `.env` 파일에 Supabase 정보 입력:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
MAX_PRODUCTS=10
HEADLESS=true
```

또는 메인 프로젝트의 `.env.local` 파일을 복사:

```bash
# Windows
copy ..\..\..\.env.local .env

# macOS/Linux  
cp ../../../.env.local .env
```

## 크롤링 모드

### 1. Daily Deals (기본값)
eBay가 선정한 오늘의 할인 상품

```bash
pnpm crawl
# 또는
CRAWL_MODE=deals pnpm crawl
```

### 2. 베스트셀러
카테고리별 베스트셀러 상품

```bash
CRAWL_MODE=bestsellers pnpm crawl

# 특정 카테고리만
CRAWL_MODE=bestsellers CATEGORY=electronics pnpm crawl
```

### 3. 트렌딩
인기 급상승 상품

```bash
CRAWL_MODE=trending pnpm crawl
```

### 4. 키워드 검색
특정 키워드로 검색

```bash
CRAWL_MODE=search SEARCH_KEYWORD="wireless earbuds" pnpm crawl
```

## 카테고리 옵션

| 값 | 설명 |
|---|------|
| `electronics` | 전자기기 |
| `fashion` | 패션 |
| `home-garden` | 홈 & 가든 |
| `collectibles` | 수집품 |
| `toys` | 장난감 |
| `sporting-goods` | 스포츠 용품 |
| `all` | 전체 (기본값) |

## 추출되는 데이터

| 필드 | 설명 |
|------|------|
| Item ID | eBay 고유 상품 번호 |
| 제목 | 상품명 |
| 가격 | 현재 가격 (USD/KRW) |
| 원래 가격 | 할인 전 가격 |
| 상태 | New, Used, Refurbished 등 |
| 판매자 | 판매자 ID |
| 판매자 평점 | 피드백 점수 (%) |
| 입찰 수 | 경매 상품의 입찰 수 |
| 남은 시간 | 경매 종료까지 남은 시간 |
| 배송비 | 배송 비용 (무료 배송 표시) |
| 위치 | 판매자 위치 |
| 이미지 | 메인 이미지 및 추가 이미지 |

## 주의사항

⚠️ **eBay 이용약관**: eBay는 자동화된 크롤링을 제한할 수 있습니다.
이 도구는 교육 및 개인 학습 목적으로만 사용하세요.

⚠️ **봇 탐지**: eBay의 봇 탐지 시스템으로 인해
크롤링이 차단될 수 있습니다. 과도한 요청은 IP 차단을 유발할 수 있습니다.

## 문제 해결

### CAPTCHA 또는 차단 발생 시
- `HEADLESS=false`로 설정하여 브라우저를 직접 확인
- 요청 간격을 더 길게 조정 (crawler.ts의 delay 값 수정)

### 상품이 수집되지 않을 때
- eBay 페이지 구조가 변경되었을 수 있음
- 셀렉터 업데이트 필요 (crawler.ts의 셀렉터 확인)

### 가격이 추출되지 않을 때
- eBay는 지역/통화에 따라 다른 형식을 사용함
- 가격 셀렉터 및 정규식 확인 필요
