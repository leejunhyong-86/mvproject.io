/**
 * @file crawler.ts
 * @description Amazon 상품 크롤러
 * 
 * Amazon에서 다양한 모드로 상품을 크롤링하여 Supabase에 저장합니다.
 * 
 * 주요 기능:
 * 1. 베스트셀러 크롤링
 * 2. 신상품 크롤링
 * 3. Movers & Shakers (인기 급상승) 크롤링
 * 4. 키워드 검색 크롤링
 * 5. 특정 카테고리 크롤링
 * 
 * 크롤링 모드 (CRAWL_MODE 환경변수):
 * - bestsellers: 베스트셀러 (기본값)
 * - new-releases: 신상품
 * - movers-shakers: 인기 급상승 상품
 * - search: 키워드 검색 (SEARCH_KEYWORD 필요)
 * 
 * 사용법:
 * - pnpm crawl (기본 베스트셀러 크롤링)
 * - CRAWL_MODE=new-releases pnpm crawl
 * - CRAWL_MODE=search SEARCH_KEYWORD="wireless earbuds" pnpm crawl
 * 
 * @dependencies
 * - puppeteer: 헤드리스 브라우저 자동화
 * - @supabase/supabase-js: 데이터베이스 연동
 */

import 'dotenv/config';
import puppeteer, { Browser, Page } from 'puppeteer';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { AmazonProduct, CrawlConfig, ProductInsert } from './types.js';

// 환경 변수
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 크롤링 모드 타입
type CrawlMode = 'bestsellers' | 'new-releases' | 'movers-shakers' | 'search';

// 카테고리 타입
type AmazonCategory = 'electronics' | 'beauty' | 'home-garden' | 'fashion' | 'toys' | 'books' | 'all';

// 크롤링 설정
const config: CrawlConfig = {
  maxProducts: parseInt(process.env.MAX_PRODUCTS || '10'),
  headless: process.env.HEADLESS !== 'false',
  bestSellersUrl: 'https://www.amazon.com/gp/bestsellers/',
};

// 크롤링 모드 및 옵션
const CRAWL_MODE: CrawlMode = (process.env.CRAWL_MODE as CrawlMode) || 'bestsellers';
const SEARCH_KEYWORD = process.env.SEARCH_KEYWORD || '';
const CATEGORY: AmazonCategory = (process.env.CATEGORY as AmazonCategory) || 'all';

// 카테고리별 URL 매핑
const CATEGORY_URLS: Record<AmazonCategory, { bestsellers: string; newReleases: string; moversShakers: string }> = {
  electronics: {
    bestsellers: 'https://www.amazon.com/Best-Sellers-Electronics/zgbs/electronics/',
    newReleases: 'https://www.amazon.com/gp/new-releases/electronics/',
    moversShakers: 'https://www.amazon.com/gp/movers-and-shakers/electronics/',
  },
  beauty: {
    bestsellers: 'https://www.amazon.com/Best-Sellers-Beauty/zgbs/beauty/',
    newReleases: 'https://www.amazon.com/gp/new-releases/beauty/',
    moversShakers: 'https://www.amazon.com/gp/movers-and-shakers/beauty/',
  },
  'home-garden': {
    bestsellers: 'https://www.amazon.com/Best-Sellers-Home-Kitchen/zgbs/home-garden/',
    newReleases: 'https://www.amazon.com/gp/new-releases/home-garden/',
    moversShakers: 'https://www.amazon.com/gp/movers-and-shakers/home-garden/',
  },
  fashion: {
    bestsellers: 'https://www.amazon.com/Best-Sellers-Clothing-Shoes-Jewelry/zgbs/fashion/',
    newReleases: 'https://www.amazon.com/gp/new-releases/fashion/',
    moversShakers: 'https://www.amazon.com/gp/movers-and-shakers/fashion/',
  },
  toys: {
    bestsellers: 'https://www.amazon.com/Best-Sellers-Toys-Games/zgbs/toys-and-games/',
    newReleases: 'https://www.amazon.com/gp/new-releases/toys-and-games/',
    moversShakers: 'https://www.amazon.com/gp/movers-and-shakers/toys-and-games/',
  },
  books: {
    bestsellers: 'https://www.amazon.com/Best-Sellers-Books/zgbs/books/',
    newReleases: 'https://www.amazon.com/gp/new-releases/books/',
    moversShakers: 'https://www.amazon.com/gp/movers-and-shakers/books/',
  },
  all: {
    bestsellers: 'https://www.amazon.com/gp/bestsellers/',
    newReleases: 'https://www.amazon.com/gp/new-releases/',
    moversShakers: 'https://www.amazon.com/gp/movers-and-shakers/',
  },
};

// USD to KRW 환율 (대략적인 값, 실제로는 API 사용 권장)
const USD_TO_KRW = 1400;

/**
 * Supabase 클라이언트 초기화
 */
function initSupabase(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error('Supabase 환경 변수가 설정되지 않았습니다.');
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

/**
 * 슬러그 생성
 */
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 100);
}

/**
 * 봇 탐지 우회를 위한 브라우저 설정
 */
async function setupBrowser(): Promise<Browser> {
  const browser = await puppeteer.launch({
    headless: config.headless,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-infobars',
      '--window-size=1920,1080',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ],
  });
  return browser;
}

/**
 * 페이지 설정 (봇 탐지 우회)
 */
async function setupPage(browser: Browser): Promise<Page> {
  const page = await browser.newPage();
  
  // User-Agent 설정
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );
  
  // 뷰포트 설정
  await page.setViewport({ width: 1920, height: 1080 });
  
  // webdriver 속성 숨기기
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    });
  });
  
  return page;
}

/**
 * 모드별 URL 목록 생성
 */
function getUrlsForMode(mode: CrawlMode, category: AmazonCategory): string[] {
  switch (mode) {
    case 'bestsellers':
      if (category === 'all') {
        return [
          CATEGORY_URLS.electronics.bestsellers,
          CATEGORY_URLS.beauty.bestsellers,
          CATEGORY_URLS['home-garden'].bestsellers,
        ];
      }
      return [CATEGORY_URLS[category].bestsellers];
    
    case 'new-releases':
      if (category === 'all') {
        return [
          CATEGORY_URLS.electronics.newReleases,
          CATEGORY_URLS.beauty.newReleases,
          CATEGORY_URLS['home-garden'].newReleases,
        ];
      }
      return [CATEGORY_URLS[category].newReleases];
    
    case 'movers-shakers':
      if (category === 'all') {
        return [
          CATEGORY_URLS.electronics.moversShakers,
          CATEGORY_URLS.beauty.moversShakers,
          CATEGORY_URLS['home-garden'].moversShakers,
        ];
      }
      return [CATEGORY_URLS[category].moversShakers];
    
    case 'search':
      if (!SEARCH_KEYWORD) {
        console.error('❌ SEARCH_KEYWORD 환경변수가 설정되지 않았습니다.');
        return [];
      }
      const encodedKeyword = encodeURIComponent(SEARCH_KEYWORD);
      return [
        `https://www.amazon.com/s?k=${encodedKeyword}`,
      ];
    
    default:
      return [CATEGORY_URLS.all.bestsellers];
  }
}

/**
 * 페이지에서 상품 URL 추출
 */
async function extractProductUrls(page: Page): Promise<string[]> {
  return await page.evaluate(() => {
    const links: string[] = [];
    const productElements = document.querySelectorAll('a.a-link-normal[href*="/dp/"]');
    
    productElements.forEach((el) => {
      const href = el.getAttribute('href');
      if (href && href.includes('/dp/')) {
        // ASIN 추출하여 깔끔한 URL 생성
        const asinMatch = href.match(/\/dp\/([A-Z0-9]{10})/);
        if (asinMatch) {
          links.push(`https://www.amazon.com/dp/${asinMatch[1]}`);
        }
      }
    });
    
    // 중복 제거
    return [...new Set(links)];
  });
}

/**
 * 상품 URL 수집 (모드별)
 */
async function getProductUrls(page: Page, maxProducts: number): Promise<string[]> {
  const modeLabel = {
    bestsellers: '베스트셀러',
    'new-releases': '신상품',
    'movers-shakers': '인기 급상승',
    search: `검색: "${SEARCH_KEYWORD}"`,
  }[CRAWL_MODE];
  
  console.log(`📦 Amazon ${modeLabel} 크롤링 시작...`);
  
  const categoryUrls = getUrlsForMode(CRAWL_MODE, CATEGORY);
  
  if (categoryUrls.length === 0) {
    return [];
  }
  
  const productUrls: string[] = [];
  
  for (const categoryUrl of categoryUrls) {
    if (productUrls.length >= maxProducts) break;
    
    try {
      console.log(`   🔗 접속 중: ${categoryUrl.substring(0, 60)}...`);
      
      await page.goto(categoryUrl, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
      
      // 잠시 대기 (봇 탐지 우회)
      await new Promise(r => setTimeout(r, 2000 + Math.random() * 2000));
      
      const urls = await extractProductUrls(page);
      
      productUrls.push(...urls.slice(0, maxProducts - productUrls.length));
      const categoryName = categoryUrl.split('/').filter(Boolean).pop() || 'page';
      console.log(`   📋 ${categoryName}에서 ${urls.length}개 상품 발견`);
      
    } catch (error) {
      console.error(`   ❌ 카테고리 크롤링 실패: ${categoryUrl}`);
    }
  }
  
  return productUrls.slice(0, maxProducts);
}

/**
 * 개별 상품 상세 정보 추출
 */
async function extractProductDetails(page: Page, url: string): Promise<AmazonProduct | null> {
  try {
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // 랜덤 대기 (봇 탐지 우회)
    await new Promise(r => setTimeout(r, 1500 + Math.random() * 1500));
    
    const productData = await page.evaluate(() => {
      // ASIN 추출
      var asinMatch = window.location.pathname.match(/\/dp\/([A-Z0-9]{10})/);
      var asin = asinMatch ? asinMatch[1] : '';
      
      // 제목 추출
      var titleEl = document.querySelector('#productTitle');
      var title = titleEl ? titleEl.textContent?.trim() || '' : '';
      
      // 가격 추출
      var priceEl = document.querySelector('.a-price .a-offscreen') || 
                    document.querySelector('#priceblock_ourprice') ||
                    document.querySelector('#priceblock_dealprice') ||
                    document.querySelector('.a-price-whole');
      var priceText = priceEl ? priceEl.textContent?.trim() || '' : '';
      var priceMatch = priceText.match(/[\d,]+\.?\d*/);
      var price = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : null;
      
      // 원래 가격 추출 (할인 전)
      var originalPriceEl = document.querySelector('.a-text-price .a-offscreen') ||
                            document.querySelector('.a-price[data-a-strike] .a-offscreen');
      var originalPriceText = originalPriceEl ? originalPriceEl.textContent?.trim() || '' : '';
      var originalPriceMatch = originalPriceText.match(/[\d,]+\.?\d*/);
      var originalPrice = originalPriceMatch ? parseFloat(originalPriceMatch[0].replace(/,/g, '')) : null;
      
      // 평점 추출
      var ratingEl = document.querySelector('#acrPopover') || 
                     document.querySelector('.a-icon-star-small');
      var ratingText = ratingEl ? ratingEl.getAttribute('title') || ratingEl.textContent || '' : '';
      var ratingMatch = ratingText.match(/([\d.]+)\s*out\s*of\s*5/i) || ratingText.match(/([\d.]+)/);
      var rating = ratingMatch ? parseFloat(ratingMatch[1]) : 0;
      
      // 리뷰 수 추출
      var reviewEl = document.querySelector('#acrCustomerReviewText');
      var reviewText = reviewEl ? reviewEl.textContent?.trim() || '' : '';
      var reviewMatch = reviewText.match(/([\d,]+)/);
      var reviewCount = reviewMatch ? parseInt(reviewMatch[1].replace(/,/g, '')) : 0;
      
      // 메인 이미지 URL 추출
      var mainImageEl = document.querySelector('#landingImage') || 
                        document.querySelector('#imgBlkFront') ||
                        document.querySelector('.a-dynamic-image');
      var thumbnailUrl = '';
      if (mainImageEl) {
        thumbnailUrl = mainImageEl.getAttribute('data-old-hires') || 
                       mainImageEl.getAttribute('src') || '';
      }
      
      // 추가 이미지 URL들
      var imageUrls: string[] = [];
      var imageElements = document.querySelectorAll('#altImages img');
      imageElements.forEach(function(img) {
        var src = img.getAttribute('src');
        if (src && src.includes('images')) {
          // 고해상도 이미지 URL로 변환
          var highResSrc = src.replace(/\._[A-Z0-9_]+_\./, '.');
          imageUrls.push(highResSrc);
        }
      });
      
      // 영상 URL 추출 (있는 경우)
      var videoUrl: string | null = null;
      var videoEl = document.querySelector('video source') || document.querySelector('video');
      if (videoEl) {
        videoUrl = videoEl.getAttribute('src') || null;
      }
      
      // 브랜드 추출
      var brandEl = document.querySelector('#bylineInfo') || document.querySelector('.po-brand .po-break-word');
      var brand = brandEl ? brandEl.textContent?.replace('Visit the', '').replace('Store', '').trim() || null : null;
      
      // 카테고리 추출
      var categoryEl = document.querySelector('#wayfinding-breadcrumbs_feature_div a');
      var category = categoryEl ? categoryEl.textContent?.trim() || '' : '';
      
      // Prime 여부
      var isPrime = !!document.querySelector('.a-icon-prime, #primeExclusiveBadge');
      
      // 재고 상태
      var availabilityEl = document.querySelector('#availability span');
      var availability = availabilityEl ? availabilityEl.textContent?.trim() || 'Unknown' : 'Unknown';
      
      // 상품 설명
      var descriptionEl = document.querySelector('#productDescription p') || 
                          document.querySelector('#feature-bullets');
      var description = descriptionEl ? descriptionEl.textContent?.trim().substring(0, 500) || '' : '';
      
      return {
        asin: asin,
        title: title,
        price: price,
        originalPrice: originalPrice,
        rating: rating,
        reviewCount: reviewCount,
        thumbnailUrl: thumbnailUrl,
        imageUrls: imageUrls.slice(0, 5),
        videoUrl: videoUrl,
        brand: brand,
        category: category,
        isPrime: isPrime,
        availability: availability,
        description: description,
      };
    });
    
    if (!productData.title || !productData.asin) {
      return null;
    }
    
    return {
      asin: productData.asin,
      title: productData.title,
      slug: createSlug(productData.title) + `-${Date.now()}`,
      description: productData.description,
      thumbnailUrl: productData.thumbnailUrl,
      imageUrls: productData.imageUrls,
      videoUrl: productData.videoUrl,
      price: productData.price,
      originalPrice: productData.originalPrice,
      priceKrw: productData.price ? Math.round(productData.price * USD_TO_KRW) : null,
      currency: 'USD',
      rating: productData.rating,
      reviewCount: productData.reviewCount,
      category: productData.category,
      brand: productData.brand,
      seller: null,
      isPrime: productData.isPrime,
      deliveryInfo: null,
      availability: productData.availability,
      sourceUrl: url,
      crawledAt: new Date(),
    };
    
  } catch (error) {
    console.error(`   ❌ 상품 추출 실패: ${url}`);
    return null;
  }
}

/**
 * Supabase에 상품 저장
 */
async function saveToSupabase(
  supabase: SupabaseClient,
  product: AmazonProduct
): Promise<boolean> {
  try {
    const productInsert: ProductInsert = {
      title: product.title,
      slug: product.slug,
      description: product.description || null,
      thumbnail_url: product.thumbnailUrl || null,
      video_url: product.videoUrl,
      original_price: product.originalPrice || product.price,
      currency: 'USD',
      price_krw: product.priceKrw,
      source_platform: 'amazon',
      source_url: product.sourceUrl,
      external_rating: product.rating || null,
      external_review_count: product.reviewCount || 0,
      tags: product.category ? [product.category, product.brand || ''].filter(Boolean) : [],
      is_featured: product.rating >= 4.5 && product.reviewCount >= 1000,
      is_active: true,
      category_id: null,
    };
    
    const { data, error } = await supabase
      .from('products')
      .insert(productInsert)
      .select()
      .single();
    
    if (error) {
      console.error(`   ❌ DB 저장 오류:`, error.message);
      return false;
    }
    
    console.log(`   ✅ 저장 완료: ${product.title.substring(0, 50)}...`);
    return true;
    
  } catch (error) {
    console.error(`   ❌ 저장 실패:`, error);
    return false;
  }
}

/**
 * 메인 크롤링 함수
 */
async function main() {
  console.log('🚀 Amazon 크롤러 시작\n');
  console.log(`📋 설정:`);
  console.log(`   - 크롤링 모드: ${CRAWL_MODE}`);
  if (CRAWL_MODE === 'search') {
    console.log(`   - 검색 키워드: ${SEARCH_KEYWORD}`);
  }
  if (CATEGORY !== 'all') {
    console.log(`   - 카테고리: ${CATEGORY}`);
  }
  console.log(`   - 최대 상품 수: ${config.maxProducts}`);
  console.log(`   - Headless 모드: ${config.headless}`);
  console.log('');
  
  // Supabase 초기화
  const supabase = initSupabase();
  console.log('✅ Supabase 연결 완료\n');
  
  // 브라우저 시작
  console.log('🌐 브라우저 시작 중...');
  const browser = await setupBrowser();
  const page = await setupPage(browser);
  console.log('✅ 브라우저 준비 완료\n');
  
  try {
    // 상품 URL 수집
    const productUrls = await getProductUrls(page, config.maxProducts);
    console.log(`\n📦 총 ${productUrls.length}개 상품 URL 수집 완료\n`);
    
    if (productUrls.length === 0) {
      console.log('⚠️ 수집된 상품이 없습니다. Amazon의 봇 탐지로 인해 차단되었을 수 있습니다.');
      await browser.close();
      return;
    }
    
    // 각 상품 상세 정보 추출 및 저장
    let successCount = 0;
    
    for (let i = 0; i < productUrls.length; i++) {
      const url = productUrls[i];
      console.log(`\n[${i + 1}/${productUrls.length}] 크롤링 중: ${url}`);
      
      const product = await extractProductDetails(page, url);
      
      if (product) {
        console.log(`   📝 "${product.title.substring(0, 40)}..."`);
        console.log(`   💰 $${product.price || '가격 없음'} (₩${product.priceKrw?.toLocaleString() || '-'})`);
        console.log(`   ⭐ ${product.rating}/5 (${product.reviewCount.toLocaleString()}개 리뷰)`);
        if (product.videoUrl) {
          console.log(`   🎬 영상 URL 있음`);
        }
        
        const saved = await saveToSupabase(supabase, product);
        if (saved) successCount++;
      }
      
      // 요청 간 딜레이 (봇 탐지 우회)
      if (i < productUrls.length - 1) {
        const delay = 3000 + Math.random() * 3000;
        console.log(`   ⏳ ${Math.round(delay / 1000)}초 대기...`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`✅ 크롤링 완료!`);
    console.log(`   📊 총 ${productUrls.length}개 중 ${successCount}개 저장 성공`);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ 크롤링 중 오류 발생:', error);
  } finally {
    await browser.close();
    console.log('\n🔒 브라우저 종료');
  }
}

// 실행
main().catch(console.error);
