/**
 * @file lib/admin.ts
 * @description 관리자 권한 확인 유틸리티
 *
 * 역할 기반 권한 시스템을 사용하여 관리자 권한을 확인합니다.
 * users 테이블의 role 필드가 'admin'인 사용자만 관리자로 인식됩니다.
 */

import { createClerkSupabaseClient } from '@/lib/supabase/server';

/**
 * 사용자가 관리자인지 확인
 * @param userId Clerk user ID (null일 수 있음)
 * @returns 관리자 여부 (boolean)
 */
export async function isAdmin(userId: string | null): Promise<boolean> {
  if (!userId) {
    return false;
  }

  try {
    const supabase = await createClerkSupabaseClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('clerk_id', userId)
      .single();

    if (error || !data) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return data.role === 'admin';
  } catch (error) {
    console.error('Error in isAdmin function:', error);
    return false;
  }
}
