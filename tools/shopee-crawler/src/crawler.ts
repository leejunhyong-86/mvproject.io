/**
 * @file crawler.ts
 * @description Shopee Thailand 상품 크롤러
 * 
 * Shopee Thailand (shopee.co.th) 베스트셀러 상품을 크롤링하여 Supabase에 저장합니다.
 * 
 * 주요 기능:
 * 1. Shopee Thailand 인기 상품 크롤링
 * 2. 상품 상세 정보 추출 (가격, 평점, 리뷰 수, 판매 수량 등)
 * 3. 이미지 및 영상 URL 추출
 * 4. Supabase products 테이블에 자동 저장
 * 
 * 사용법:
 * - pnpm crawl (기본 베스트셀러 크롤링)
 * 
 * @dependencies
 * - puppeteer: 헤드리스 브라우저 자동화
 * - @supabase/supabase-js: 데이터베이스 연동
 */

import 'dotenv/config';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser, Page } from 'puppeteer';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { ShopeeProduct, CrawlConfig, ProductInsert } from './types.js';

// Stealth 플러그인 적용 (봇 탐지 우회)
puppeteer.use(StealthPlugin());

// 환경 변수
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 크롤링 설정
const config: CrawlConfig = {
  maxProducts: parseInt(process.env.MAX_PRODUCTS || '10'),
  headless: process.env.HEADLESS !== 'false',
  dailyDiscoverUrl: 'https://shopee.co.th/daily_discover',
  topProductsUrl: 'https://shopee.co.th/top_products',
};

// THB to KRW 환율 (대략적인 값)
const THB_TO_KRW = 40;

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
 * 슬러그 생성 (태국어 지원)
 */
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣ก-๙\s-]/g, '') // 영어, 한글, 태국어 허용
    .replace(/\s+/g, '-')
    .substring(0, 80) + `-${Date.now()}`;
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
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1920,1080',
      '--start-maximized',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      '--lang=th-TH,th,en-US,en',
      '--disable-extensions',
    ],
    defaultViewport: null,
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
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
  );
  
  // 뷰포트 설정
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  
  // webdriver 속성 숨기기
  await page.evaluateOnNewDocument(() => {
    // webdriver 속성 제거
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    });
    
    // Chrome 브라우저 속성 추가
    // @ts-ignore
    window.chrome = {
      runtime: {},
      loadTimes: function() {},
      csi: function() {},
      app: {},
    };
    
    // plugins 속성 설정
    Object.defineProperty(navigator, 'plugins', {
      get: () => [1, 2, 3, 4, 5],
    });
    
    // languages 속성 설정
    Object.defineProperty(navigator, 'languages', {
      get: () => ['th-TH', 'th', 'en-US', 'en'],
    });
    
    // permissions 속성 설정
    const originalQuery = window.navigator.permissions.query;
    // @ts-ignore
    window.navigator.permissions.query = (parameters: any) => (
      parameters.name === 'notifications' ?
        Promise.resolve({ state: Notification.permission }) :
        originalQuery(parameters)
    );
  });
  
  // 언어 설정
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'th-TH,th;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
  });
  
  // 페이지 타임아웃 설정
  page.setDefaultNavigationTimeout(60000);
  page.setDefaultTimeout(30000);
  
  return page;
}

/**
 * 페이지 로딩 대기 및 스크롤 (더 많은 상품 로드)
 */
async function scrollAndWait(page: Page): Promise<void> {
  try {
    // 초기 대기
    await new Promise(r => setTimeout(r, 5000));
    
    // 스크롤하여 더 많은 상품 로드
    for (let i = 0; i < 3; i++) {
      try {
        await page.evaluate(() => {
          window.scrollBy(0, window.innerHeight);
        });
        await new Promise(r => setTimeout(r, 2000 + Math.random() * 1000));
      } catch {
        // 스크롤 오류 무시
      }
    }
    
    // 최상단으로 스크롤
    try {
      await page.evaluate(() => {
        window.scrollTo(0, 0);
      });
    } catch {
      // 스크롤 오류 무시
    }
    await new Promise(r => setTimeout(r, 1000));
  } catch (error) {
    console.log('   ⚠️ 스크롤 중 오류 (무시됨)');
  }
}

/**
 * 상품 링크 추출 함수
 */
async function extractLinksFromPage(page: Page): Promise<string[]> {
  try {
    return await page.evaluate(() => {
      const links: string[] = [];
      
      // 모든 링크에서 Shopee 상품 링크 패턴 찾기
      const allLinks = document.querySelectorAll('a[href]');
      
      allLinks.forEach((el) => {
        const href = el.getAttribute('href') || '';
        // 패턴 1: -i.shopId.itemId
        // 패턴 2: /product/shopId/itemId
        if (href.includes('-i.') && /\-i\.\d+\.\d+/.test(href)) {
          const fullUrl = href.startsWith('http') 
            ? href 
            : `https://shopee.co.th${href}`;
          links.push(fullUrl);
        }
      });
      
      // 중복 제거
      return [...new Set(links)];
    });
  } catch {
    return [];
  }
}

/**
 * Shopee 상품 목록에서 상품 URL 추출
 */
async function getProductUrls(browser: Browser, maxProducts: number): Promise<string[]> {
  console.log('📦 Shopee Thailand 페이지 접속 중...');
  
  const productUrls: string[] = [];
  
  // 크롤링할 URL 목록 (카테고리 검색 사용)
  const urlsToTry = [
    { name: '검색: 전자기기', url: 'https://shopee.co.th/search?keyword=electronics' },
    { name: '검색: 핸드폰', url: 'https://shopee.co.th/search?keyword=phone' },
    { name: '검색: 패션', url: 'https://shopee.co.th/search?keyword=fashion' },
    { name: '검색: 뷰티', url: 'https://shopee.co.th/search?keyword=beauty' },
    { name: '검색: 가전', url: 'https://shopee.co.th/search?keyword=appliances' },
  ];
  
  for (const { name, url } of urlsToTry) {
    if (productUrls.length >= maxProducts) break;
    
    // 각 페이지마다 새 탭 사용 (프레임 분리 문제 방지)
    let page: Page | null = null;
    
    try {
      console.log(`   📋 ${name} 접속 중...`);
      
      page = await setupPage(browser);
      
      // 페이지 이동 시도
      await page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: 60000 
      });
      
      // 충분한 대기 (동적 컨텐츠 로딩)
      console.log(`   ⏳ 페이지 로딩 대기 중...`);
      await new Promise(r => setTimeout(r, 8000));
      
      // 스크롤
      await scrollAndWait(page);
      
      // 링크 추출
      const urls = await extractLinksFromPage(page);
      
      // 기존과 중복되지 않는 것만 추가
      const newUrls = urls.filter(u => !productUrls.includes(u));
      productUrls.push(...newUrls);
      
      if (newUrls.length > 0) {
        console.log(`   ✅ ${name}에서 ${newUrls.length}개 상품 발견`);
      } else {
        console.log(`   ⚠️ ${name}에서 상품을 찾지 못함`);
        
        // 디버깅: 현재 URL 확인
        const currentUrl = page.url();
        console.log(`   📍 현재 URL: ${currentUrl.substring(0, 60)}...`);
        
        // 디버깅: 페이지 HTML 일부 확인
        try {
          const bodyText = await page.evaluate(() => {
            return document.body?.innerText?.substring(0, 200) || 'No body text';
          });
          console.log(`   📄 페이지 내용: ${bodyText.substring(0, 100)}...`);
          
          // 스크린샷 저장 (디버깅용)
          const screenshotPath = `screenshots/debug_${Date.now()}.png`;
          await page.screenshot({ path: screenshotPath, fullPage: false });
          console.log(`   📸 스크린샷 저장: ${screenshotPath}`);
        } catch (e) {
          console.log(`   ⚠️ 디버깅 정보 수집 실패`);
        }
      }
      
    } catch (error: any) {
      console.log(`   ⚠️ ${name} 접속 실패: ${error.message?.substring(0, 50) || '알 수 없는 오류'}`);
    } finally {
      // 페이지 닫기
      if (page) {
        try {
          await page.close();
        } catch {
          // 무시
        }
      }
    }
    
    // 다음 페이지로 이동 전 대기
    await new Promise(r => setTimeout(r, 3000 + Math.random() * 2000));
  }
  
  return productUrls.slice(0, maxProducts);
}

/**
 * 개별 상품 상세 정보 추출
 */
async function extractProductDetails(page: Page, url: string): Promise<ShopeeProduct | null> {
  try {
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 60000 
    });
    
    // 페이지 로딩 대기
    await new Promise(r => setTimeout(r, 3000 + Math.random() * 2000));
    
    const productData = await page.evaluate(() => {
      // URL에서 itemId와 shopId 추출
      const urlMatch = window.location.href.match(/-i\.(\d+)\.(\d+)/);
      const productMatch = window.location.pathname.match(/\/product\/(\d+)\/(\d+)/);
      
      let shopId = '';
      let itemId = '';
      
      if (urlMatch) {
        shopId = urlMatch[1];
        itemId = urlMatch[2];
      } else if (productMatch) {
        shopId = productMatch[1];
        itemId = productMatch[2];
      }
      
      // 제목 추출 (여러 선택자 시도)
      const titleSelectors = [
        'div[class*="product-title"]',
        'h1[class*="title"]',
        'span[class*="VhWBwF"]', // Shopee 특정 클래스
        '.product-info span',
        'div[data-sqe="name"]',
        'h1',
      ];
      
      let title = '';
      for (const selector of titleSelectors) {
        const el = document.querySelector(selector);
        if (el && el.textContent?.trim()) {
          title = el.textContent.trim();
          break;
        }
      }
      
      // 가격 추출
      const priceSelectors = [
        'div[class*="pqTWkA"]', // Shopee 특정 클래스
        'div[class*="price"]',
        'span[class*="price"]',
        'div[aria-label*="฿"]',
      ];
      
      let price: number | null = null;
      let originalPrice: number | null = null;
      
      for (const selector of priceSelectors) {
        const priceEls = document.querySelectorAll(selector);
        priceEls.forEach((el) => {
          const text = el.textContent || '';
          const match = text.match(/฿?\s*([\d,]+(?:\.\d{2})?)/);
          if (match) {
            const value = parseFloat(match[1].replace(/,/g, ''));
            if (!price || value < price) {
              if (price) originalPrice = price;
              price = value;
            } else if (value > price) {
              originalPrice = value;
            }
          }
        });
        if (price) break;
      }
      
      // 할인율 추출
      let discountPercent: number | null = null;
      const discountEl = document.querySelector('div[class*="percent"], span[class*="discount"]');
      if (discountEl) {
        const discountMatch = discountEl.textContent?.match(/(\d+)%/);
        if (discountMatch) {
          discountPercent = parseInt(discountMatch[1]);
        }
      }
      
      // 평점 추출
      let rating = 0;
      const ratingSelectors = [
        'div[class*="rating"] span',
        'div[class*="star"] + span',
        'span[class*="rating"]',
      ];
      
      for (const selector of ratingSelectors) {
        const el = document.querySelector(selector);
        if (el) {
          const match = el.textContent?.match(/([\d.]+)/);
          if (match) {
            rating = parseFloat(match[1]);
            if (rating >= 1 && rating <= 5) break;
          }
        }
      }
      
      // 리뷰 수 추출
      let reviewCount = 0;
      const reviewSelectors = [
        'div[class*="rating-count"]',
        'span[class*="review"]',
        'a[href*="reviews"]',
      ];
      
      for (const selector of reviewSelectors) {
        const el = document.querySelector(selector);
        if (el) {
          const match = el.textContent?.match(/([\d,.]+)k?/i);
          if (match) {
            let count = parseFloat(match[1].replace(/,/g, ''));
            if (el.textContent?.toLowerCase().includes('k')) {
              count *= 1000;
            }
            reviewCount = Math.round(count);
            if (reviewCount > 0) break;
          }
        }
      }
      
      // 판매 수량 추출
      let soldCount = 0;
      const soldSelectors = [
        'div[class*="sold"]',
        'span[class*="sold"]',
        'div[class*="historical-sold"]',
      ];
      
      for (const selector of soldSelectors) {
        const el = document.querySelector(selector);
        if (el) {
          const text = el.textContent || '';
          const match = text.match(/([\d,.]+)\s*(k|พัน|หมื่น|แสน)?/i);
          if (match) {
            let count = parseFloat(match[1].replace(/,/g, ''));
            const unit = match[2]?.toLowerCase();
            if (unit === 'k' || unit === 'พัน') count *= 1000;
            if (unit === 'หมื่น') count *= 10000;
            if (unit === 'แสน') count *= 100000;
            soldCount = Math.round(count);
            if (soldCount > 0) break;
          }
        }
      }
      
      // 썸네일 이미지 추출
      let thumbnailUrl = '';
      const imageSelectors = [
        'div[class*="image-carousel"] img',
        'div[class*="product-image"] img',
        'img[class*="main"]',
        'img[src*="shopee"]',
      ];
      
      for (const selector of imageSelectors) {
        const el = document.querySelector(selector);
        if (el) {
          const src = el.getAttribute('src') || el.getAttribute('data-src');
          if (src && src.includes('shopee') || src?.includes('susercontent')) {
            thumbnailUrl = src;
            break;
          }
        }
      }
      
      // 추가 이미지 URL들
      const imageUrls: string[] = [];
      const imageEls = document.querySelectorAll('div[class*="carousel"] img, div[class*="thumbnail"] img');
      imageEls.forEach((img) => {
        const src = img.getAttribute('src') || img.getAttribute('data-src');
        if (src && (src.includes('shopee') || src.includes('susercontent'))) {
          imageUrls.push(src);
        }
      });
      
      // 영상 URL 추출
      let videoUrl: string | null = null;
      const videoEl = document.querySelector('video source, video');
      if (videoEl) {
        videoUrl = videoEl.getAttribute('src') || null;
      }
      
      // 설명 추출
      let description = '';
      const descSelectors = [
        'div[class*="product-detail"]',
        'div[class*="description"]',
        'div[class*="QN2lPu"]', // Shopee 특정 클래스
      ];
      
      for (const selector of descSelectors) {
        const el = document.querySelector(selector);
        if (el) {
          description = el.textContent?.trim().substring(0, 500) || '';
          if (description) break;
        }
      }
      
      // 판매자 정보 추출
      let shopName = '';
      const shopEl = document.querySelector('div[class*="shop-info"] span, a[class*="shop-name"]');
      if (shopEl) {
        shopName = shopEl.textContent?.trim() || '';
      }
      
      // 카테고리 추출
      let category = '';
      const categoryEl = document.querySelector('nav[class*="breadcrumb"] a:nth-child(2), div[class*="category"]');
      if (categoryEl) {
        category = categoryEl.textContent?.trim() || '';
      }
      
      // 무료배송 여부
      const freeShipping = !!document.querySelector('div[class*="free-shipping"], img[alt*="Free"]');
      
      return {
        itemId,
        shopId,
        title,
        description,
        thumbnailUrl,
        imageUrls: [...new Set(imageUrls)].slice(0, 5),
        videoUrl,
        price,
        originalPrice,
        discountPercent,
        rating,
        reviewCount,
        soldCount,
        shopName,
        category,
        freeShipping,
      };
    });
    
    if (!productData.title || !productData.itemId) {
      console.log('   ⚠️ 상품 정보 추출 실패 - 제목 또는 ID 없음');
      return null;
    }
    
    return {
      itemId: productData.itemId,
      shopId: productData.shopId,
      title: productData.title,
      slug: createSlug(productData.title),
      description: productData.description,
      thumbnailUrl: productData.thumbnailUrl,
      imageUrls: productData.imageUrls,
      videoUrl: productData.videoUrl,
      price: productData.price || 0,
      originalPrice: productData.originalPrice,
      priceKrw: productData.price ? Math.round(productData.price * THB_TO_KRW) : null,
      currency: 'THB',
      discountPercent: productData.discountPercent,
      rating: productData.rating,
      reviewCount: productData.reviewCount,
      soldCount: productData.soldCount,
      category: productData.category,
      shopName: productData.shopName,
      shopLocation: null,
      freeShipping: productData.freeShipping,
      sourceUrl: url,
      crawledAt: new Date(),
    };
    
  } catch (error) {
    console.error(`   ❌ 상품 추출 실패: ${url}`, error);
    return null;
  }
}

/**
 * Supabase에 상품 저장
 */
async function saveToSupabase(
  supabase: SupabaseClient,
  product: ShopeeProduct
): Promise<boolean> {
  try {
    const productInsert: ProductInsert = {
      title: product.title,
      slug: product.slug,
      description: product.description || null,
      thumbnail_url: product.thumbnailUrl || null,
      video_url: product.videoUrl,
      original_price: product.price,
      currency: 'THB',
      price_krw: product.priceKrw,
      discount_rate: product.discountPercent,
      source_platform: 'shopee',
      source_url: product.sourceUrl,
      external_rating: product.rating || null,
      external_review_count: product.reviewCount || 0,
      purchase_count: product.soldCount || 0,
      tags: [product.category, product.shopName, 'shopee-thailand'].filter(Boolean),
      is_featured: product.rating >= 4.5 && product.soldCount >= 1000,
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
    
    console.log(`   ✅ 저장 완료: ${product.title.substring(0, 40)}...`);
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
  console.log('🚀 Shopee Thailand 크롤러 시작\n');
  console.log(`📋 설정:`);
  console.log(`   - 최대 상품 수: ${config.maxProducts}`);
  console.log(`   - Headless 모드: ${config.headless}`);
  console.log(`   - 환율: 1 THB = ${THB_TO_KRW} KRW`);
  console.log('');
  
  // Supabase 초기화
  const supabase = initSupabase();
  console.log('✅ Supabase 연결 완료\n');
  
  // 브라우저 시작
  console.log('🌐 브라우저 시작 중...');
  const browser = await setupBrowser();
  console.log('✅ 브라우저 준비 완료\n');
  
  try {
    // 상품 URL 수집 (browser를 전달)
    const productUrls = await getProductUrls(browser, config.maxProducts);
    console.log(`\n📦 총 ${productUrls.length}개 상품 URL 수집 완료\n`);
    
    if (productUrls.length === 0) {
      console.log('⚠️ 수집된 상품이 없습니다. Shopee의 봇 탐지로 인해 차단되었을 수 있습니다.');
      console.log('   HEADLESS=false로 다시 시도해보세요.');
      console.log('\n💡 팁: Shopee는 봇 탐지가 매우 강력합니다.');
      console.log('   수동으로 브라우저에서 CAPTCHA를 해결해야 할 수 있습니다.');
      await browser.close();
      return;
    }
    
    // 각 상품 상세 정보 추출 및 저장
    let successCount = 0;
    
    for (let i = 0; i < productUrls.length; i++) {
      const url = productUrls[i];
      console.log(`\n[${i + 1}/${productUrls.length}] 크롤링 중: ${url.substring(0, 60)}...`);
      
      // 각 상품마다 새 페이지 사용
      let page: Page | null = null;
      try {
        page = await setupPage(browser);
        const product = await extractProductDetails(page, url);
        
        if (product) {
          console.log(`   📝 "${product.title.substring(0, 35)}..."`);
          console.log(`   💰 ฿${product.price?.toLocaleString() || '가격 없음'} (₩${product.priceKrw?.toLocaleString() || '-'})`);
          console.log(`   ⭐ ${product.rating}/5 (${product.reviewCount.toLocaleString()}개 리뷰)`);
          console.log(`   📈 ${product.soldCount.toLocaleString()}개 판매`);
          if (product.videoUrl) {
            console.log(`   🎬 영상 URL 있음`);
          }
          
          const saved = await saveToSupabase(supabase, product);
          if (saved) successCount++;
        }
      } catch (error: any) {
        console.log(`   ⚠️ 상품 크롤링 실패: ${error.message?.substring(0, 50) || '알 수 없는 오류'}`);
      } finally {
        if (page) {
          try {
            await page.close();
          } catch {
            // 무시
          }
        }
      }
      
      // 요청 간 딜레이 (봇 탐지 우회)
      if (i < productUrls.length - 1) {
        const delay = 4000 + Math.random() * 3000;
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

