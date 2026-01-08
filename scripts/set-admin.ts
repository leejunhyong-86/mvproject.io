/**
 * @file scripts/set-admin.ts
 * @description 관리자 권한 부여 스크립트
 *
 * 사용법:
 *   pnpm tsx scripts/set-admin.ts <clerk_user_id>
 *   또는
 *   pnpm set-admin <clerk_user_id>
 *
 * 예시:
 *   pnpm set-admin user_2abc123def456ghi789
 *
 * 이 스크립트는 특정 Clerk user ID를 가진 사용자를 관리자로 지정합니다.
 * users 테이블에 해당 clerk_id가 없으면 에러를 표시합니다.
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// .env.local 파일 로드
config({ path: resolve(process.cwd(), '.env.local') });

// 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.');
  console.error('   NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 .env.local에 설정하세요.');
  process.exit(1);
}

import { createClient } from '@supabase/supabase-js';

async function setAdmin(clerkUserId: string) {
  console.log('🔐 관리자 권한 부여 스크립트\n');
  
  if (!clerkUserId || clerkUserId.trim() === '') {
    console.error('❌ Clerk User ID가 제공되지 않았습니다.');
    console.error('\n사용법:');
    console.error('  pnpm set-admin <clerk_user_id>');
    console.error('\n예시:');
    console.error('  pnpm set-admin user_2abc123def456ghi789');
    process.exit(1);
  }

  // Service Role 클라이언트 생성
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // 1. 사용자 존재 확인
    console.log(`📋 사용자 확인 중: ${clerkUserId}...`);
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, clerk_id, name, role')
      .eq('clerk_id', clerkUserId)
      .single();

    if (fetchError || !user) {
      console.error('❌ 사용자를 찾을 수 없습니다.');
      console.error('   Clerk User ID를 확인해주세요.');
      console.error('   에러:', fetchError?.message || '사용자 없음');
      console.error('\n💡 팁:');
      console.error('   - Clerk 대시보드에서 User ID를 확인하세요');
      console.error('   - 사용자가 먼저 로그인하여 users 테이블에 동기화되어 있어야 합니다');
      process.exit(1);
    }

    console.log(`✅ 사용자 발견: ${user.name} (ID: ${user.id})`);
    console.log(`   현재 역할: ${user.role || '일반 사용자 (null)'}`);

    // 2. 이미 관리자인지 확인
    if (user.role === 'admin') {
      console.log('\n⚠️  이미 관리자 권한이 부여되어 있습니다.');
      console.log('   추가 작업이 필요하지 않습니다.');
      process.exit(0);
    }

    // 3. 관리자 권한 부여
    console.log('\n🔑 관리자 권한 부여 중...');
    const { error: updateError } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('clerk_id', clerkUserId);

    if (updateError) {
      console.error('❌ 관리자 권한 부여 실패:');
      console.error('   에러:', updateError.message);
      process.exit(1);
    }

    console.log('✅ 관리자 권한이 성공적으로 부여되었습니다!');
    console.log(`\n📊 업데이트된 정보:`);
    console.log(`   이름: ${user.name}`);
    console.log(`   Clerk ID: ${user.clerk_id}`);
    console.log(`   역할: admin`);
    console.log('\n🎉 이제 /admin 페이지에 접근할 수 있습니다.');

  } catch (error) {
    console.error('❌ 예기치 않은 오류가 발생했습니다:');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// 커맨드라인 인자에서 Clerk User ID 가져오기
const clerkUserId = process.argv[2];

if (!clerkUserId) {
  console.error('❌ Clerk User ID가 제공되지 않았습니다.');
  console.error('\n사용법:');
  console.error('  pnpm set-admin <clerk_user_id>');
  console.error('\n예시:');
  console.error('  pnpm set-admin user_2abc123def456ghi789');
  console.error('\n💡 Clerk User ID 찾는 방법:');
  console.error('   1. Clerk 대시보드 (https://dashboard.clerk.com) 접속');
  console.error('   2. Users 메뉴에서 사용자 선택');
  console.error('   3. User ID 복사 (user_로 시작하는 문자열)');
  process.exit(1);
}

setAdmin(clerkUserId);
