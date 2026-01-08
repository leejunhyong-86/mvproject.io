/**
 * @file app/admin/categories/new/page.tsx
 * @description 카테고리 추가 페이지
 */

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getAllCategories } from '@/actions/categories';
import { isAdmin } from '@/lib/admin';
import { CategoryForm } from '@/components/admin/category-form';

export const metadata = {
  title: '카테고리 추가 | 관리자',
  description: '새 카테고리를 추가합니다.',
};

export default async function NewCategoryPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // 관리자 권한 확인
  const adminStatus = await isAdmin(userId);
  if (!adminStatus) {
    redirect('/');
  }

  // 모든 카테고리 조회 (상위 카테고리 선택용)
  const categories = await getAllCategories();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">카테고리 추가</h1>
        <CategoryForm 
          categories={categories} 
          mode="create" 
        />
      </div>
    </main>
  );
}
