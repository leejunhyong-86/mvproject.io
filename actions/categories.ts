'use server';

/**
 * @file actions/categories.ts
 * @description 카테고리 관련 Server Actions
 */

import { createClerkSupabaseClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import type { Category, CategoryInsert, CategoryUpdate } from '@/types';

/**
 * 모든 활성 카테고리 조회
 */
export async function getCategories(): Promise<Category[]> {
  const supabase = await createClerkSupabaseClient();

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
}

/**
 * 카테고리 조회 (slug로)
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClerkSupabaseClient();

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching category:', error);
    return null;
  }

  return data;
}

/**
 * 카테고리별 상품 수 조회
 */
export async function getCategoriesWithProductCount(): Promise<
  (Category & { product_count: number })[]
> {
  const supabase = await createClerkSupabaseClient();

  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error || !categories) {
    console.error('Error fetching categories:', error);
    return [];
  }

  // 각 카테고리별 상품 수 조회
  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id)
        .eq('is_active', true);

      return {
        ...category,
        product_count: count || 0,
      };
    })
  );

  return categoriesWithCount;
}

/**
 * 모든 카테고리 조회 (관리자용, 비활성 포함)
 */
export async function getAllCategories(): Promise<Category[]> {
  const supabase = await createClerkSupabaseClient();

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching all categories:', error);
    return [];
  }

  return data || [];
}

/**
 * 카테고리 조회 (ID로)
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  const supabase = await createClerkSupabaseClient();

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching category:', error);
    return null;
  }

  return data;
}

/**
 * 카테고리 생성 (관리자)
 */
export async function createCategory(
  data: CategoryInsert
): Promise<{ success: boolean; categoryId?: string; error?: string }> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: '로그인이 필요합니다.' };
  }

  // 관리자 권한 확인
  const adminStatus = await isAdmin(userId);
  if (!adminStatus) {
    return { success: false, error: '관리자 권한이 필요합니다.' };
  }

  const supabase = await createClerkSupabaseClient();

  // slug 중복 체크
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', data.slug)
    .single();

  if (existing) {
    return { success: false, error: '이미 사용 중인 URL 슬러그입니다.' };
  }

  // 필수 필드 검증
  if (!data.name || !data.slug) {
    return { success: false, error: '카테고리명과 슬러그는 필수입니다.' };
  }

  const insertData: CategoryInsert = {
    name: data.name.trim(),
    slug: data.slug.trim(),
    description: data.description?.trim() || null,
    image_url: data.image_url?.trim() || null,
    parent_id: data.parent_id || null,
    sort_order: data.sort_order ?? 0,
    is_active: data.is_active ?? true,
  };

  const { data: category, error } = await supabase
    .from('categories')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('카테고리 생성 오류:', error);
    return { success: false, error: '카테고리 생성에 실패했습니다.' };
  }

  revalidatePath('/admin/categories');
  revalidatePath('/products');

  return { success: true, categoryId: category.id };
}

/**
 * 카테고리 수정 (관리자)
 */
export async function updateCategory(
  id: string,
  data: CategoryUpdate
): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: '로그인이 필요합니다.' };
  }

  // 관리자 권한 확인
  const adminStatus = await isAdmin(userId);
  if (!adminStatus) {
    return { success: false, error: '관리자 권한이 필요합니다.' };
  }

  const supabase = await createClerkSupabaseClient();

  // 카테고리 존재 확인
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('id', id)
    .single();

  if (!existing) {
    return { success: false, error: '카테고리를 찾을 수 없습니다.' };
  }

  // slug 중복 체크 (자기 자신 제외)
  if (data.slug) {
    const { data: slugExists } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', data.slug)
      .neq('id', id)
      .single();

    if (slugExists) {
      return { success: false, error: '이미 사용 중인 URL 슬러그입니다.' };
    }
  }

  // 상위 카테고리 순환 참조 방지
  if (data.parent_id === id) {
    return { success: false, error: '자기 자신을 상위 카테고리로 설정할 수 없습니다.' };
  }

  const updateData: CategoryUpdate = {
    ...(data.name && { name: data.name.trim() }),
    ...(data.slug && { slug: data.slug.trim() }),
    ...(data.description !== undefined && { description: data.description?.trim() || null }),
    ...(data.image_url !== undefined && { image_url: data.image_url?.trim() || null }),
    ...(data.parent_id !== undefined && { parent_id: data.parent_id || null }),
    ...(data.sort_order !== undefined && { sort_order: data.sort_order }),
    ...(data.is_active !== undefined && { is_active: data.is_active }),
  };

  const { error } = await supabase
    .from('categories')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('카테고리 수정 오류:', error);
    return { success: false, error: '카테고리 수정에 실패했습니다.' };
  }

  revalidatePath('/admin/categories');
  revalidatePath('/products');

  return { success: true };
}

/**
 * 카테고리 삭제 (관리자)
 */
export async function deleteCategory(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: '로그인이 필요합니다.' };
  }

  // 관리자 권한 확인
  const adminStatus = await isAdmin(userId);
  if (!adminStatus) {
    return { success: false, error: '관리자 권한이 필요합니다.' };
  }

  const supabase = await createClerkSupabaseClient();

  // 카테고리 존재 확인
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('id', id)
    .single();

  if (!category) {
    return { success: false, error: '카테고리를 찾을 수 없습니다.' };
  }

  // 하위 카테고리 확인
  const { data: children } = await supabase
    .from('categories')
    .select('id')
    .eq('parent_id', id);

  if (children && children.length > 0) {
    return { success: false, error: '하위 카테고리가 있어 삭제할 수 없습니다. 먼저 하위 카테고리를 삭제하거나 다른 카테고리로 이동해주세요.' };
  }

  // 연결된 상품 확인
  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', id);

  if (productCount && productCount > 0) {
    return { success: false, error: `이 카테고리에 연결된 상품이 ${productCount}개 있습니다. 먼저 상품의 카테고리를 변경해주세요.` };
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('카테고리 삭제 오류:', error);
    return { success: false, error: '카테고리 삭제에 실패했습니다.' };
  }

  revalidatePath('/admin/categories');
  revalidatePath('/products');

  return { success: true };
}

