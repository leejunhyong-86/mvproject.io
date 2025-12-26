/**
 * @file test-connection.ts
 * @description Supabase 연결 테스트
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testConnection() {
  console.log('🔄 Supabase 연결 테스트 중...\n');
  
  // 환경 변수 확인
  console.log('📋 환경 변수 확인:');
  console.log(`   SUPABASE_URL: ${SUPABASE_URL ? '✅ 설정됨' : '❌ 없음'}`);
  console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_KEY ? '✅ 설정됨' : '❌ 없음'}`);
  console.log('');
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ 환경 변수가 설정되지 않았습니다.');
    console.log('   .env 파일을 확인하거나 env.template를 참고하세요.');
    process.exit(1);
  }
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    // products 테이블 존재 여부 확인
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ 연결 실패:', error.message);
      process.exit(1);
    }
    
    console.log('✅ Supabase 연결 성공!');
    console.log('   products 테이블 접근 가능');
    
    // 현재 상품 수 확인
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    console.log(`   현재 등록된 상품 수: ${count || 0}개`);
    
    // eBay 상품 수 확인
    const { count: ebayCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('source_platform', 'ebay');
    
    console.log(`   eBay 상품 수: ${ebayCount || 0}개`);
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  }
}

testConnection();

