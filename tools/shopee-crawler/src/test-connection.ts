/**
 * @file test-connection.ts
 * @description Supabase 연결 테스트
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testConnection() {
  console.log('🔍 Supabase 연결 테스트 시작\n');
  
  // 환경 변수 확인
  console.log('📋 환경 변수 확인:');
  console.log(`   SUPABASE_URL: ${SUPABASE_URL ? '✅ 설정됨' : '❌ 없음'}`);
  console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_KEY ? '✅ 설정됨' : '❌ 없음'}`);
  console.log('');
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
    console.log('\n📝 .env 파일을 생성하고 다음 변수를 설정하세요:');
    console.log('   SUPABASE_URL=https://your-project.supabase.co');
    console.log('   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
    process.exit(1);
  }
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    // products 테이블 조회 테스트
    console.log('🔗 products 테이블 연결 테스트...');
    const { data, error, count } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .limit(5);
    
    if (error) {
      console.error('❌ 테이블 조회 실패:', error.message);
      process.exit(1);
    }
    
    console.log(`✅ 연결 성공! 현재 ${count}개 상품이 있습니다.`);
    
    if (data && data.length > 0) {
      console.log('\n📦 최근 상품 샘플:');
      data.slice(0, 3).forEach((product, i) => {
        console.log(`   ${i + 1}. ${product.title?.substring(0, 40)}... (${product.source_platform || 'unknown'})`);
      });
    }
    
    // Shopee 상품 수 확인
    const { count: shopeeCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('source_platform', 'shopee');
    
    console.log(`\n🛒 Shopee 상품 수: ${shopeeCount || 0}개`);
    
    console.log('\n✅ 모든 테스트 통과! 크롤링을 시작할 준비가 되었습니다.');
    console.log('   실행: pnpm crawl');
    
  } catch (error) {
    console.error('❌ 연결 실패:', error);
    process.exit(1);
  }
}

testConnection();

