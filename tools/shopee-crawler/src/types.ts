/**
 * @file types.ts
 * @description Shopee Thailand 크롤러 타입 정의
 */

// Shopee 상품 인터페이스
export interface ShopeeProduct {
  // 기본 정보
  itemId: string;                  // Shopee 상품 ID
  shopId: string;                  // 판매자 ID
  title: string;
  slug: string;
  description: string;
  
  // 미디어
  thumbnailUrl: string;
  imageUrls: string[];
  videoUrl: string | null;
  
  // 가격 정보
  price: number;                   // 현재 가격 (THB)
  originalPrice: number | null;    // 원래 가격 (THB)
  priceKrw: number | null;         // 한화 환산 가격
  currency: string;                // 'THB'
  discountPercent: number | null;  // 할인율
  
  // 평점 및 리뷰
  rating: number;                  // 별점 (1-5)
  reviewCount: number;             // 리뷰 수
  soldCount: number;               // 판매 수량 (Shopee 특화)
  
  // 카테고리 및 판매자
  category: string;
  shopName: string;
  shopLocation: string | null;     // 판매자 위치
  
  // 배송 정보
  freeShipping: boolean;
  
  // 메타 정보
  sourceUrl: string;
  crawledAt: Date;
}

// 크롤링 설정
export interface CrawlConfig {
  maxProducts: number;
  headless: boolean;
  dailyDiscoverUrl: string;
  topProductsUrl: string;
}

// Supabase products 테이블 삽입 타입
export interface ProductInsert {
  title: string;
  slug: string;
  description?: string | null;
  thumbnail_url?: string | null;
  video_url?: string | null;
  original_price?: number | null;
  currency?: string;
  price_krw?: number | null;
  discount_rate?: number | null;
  source_platform: string;
  source_url: string;
  external_rating?: number | null;
  external_review_count?: number;
  purchase_count?: number;
  category_id?: string | null;
  tags?: string[];
  is_featured?: boolean;
  is_active?: boolean;
}

