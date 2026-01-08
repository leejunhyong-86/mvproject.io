/**
 * @file app/admin/categories/[id]/edit/page.tsx
 * @description 카테고리 수정 페이지
 */

import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { getCategoryById, getAllCategories } from '@/actions/categories';
import { isAdmin } from '@/lib/admin';
import { CategoryForm } from '@/components/admin/category-form';

interface EditCategoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: EditCategoryPageProps) {
  const { id } = await params;
  const category = await getCategoryById(id);
  
  return {
    title: category ? `${category.name} 수정 | 관리자` : '카테고리 수정 | 관리자',
    description: '카테고리 정보를 수정합니다.',
  };
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    redirect('/sign-in');
  }

  // 관리자 권한 확인
  const adminStatus = await isAdmin(userId);
  if (!adminStatus) {
    redirect('/');
  }

  const [category, categories] = await Promise.all([
    getCategoryById(id),
    getAllCategories(),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">카테고리 수정</h1>
        <CategoryForm 
          category={category}
          categories={categories} 
          mode="edit" 
        />
      </div>
    </main>
  );
}
