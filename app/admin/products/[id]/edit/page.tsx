/**
 * @file app/admin/products/[id]/edit/page.tsx
 * @description 상품 수정 페이지
 */

import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { getProductById } from '@/actions/products';
import { getCategories } from '@/actions/categories';
import { isAdmin } from '@/lib/admin';
import { ProductForm } from '@/components/admin/product-form';

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: EditProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);
  
  return {
    title: product ? `${product.title} 수정 | 관리자` : '상품 수정 | 관리자',
    description: '상품 정보를 수정합니다.',
  };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
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

  const [product, categories] = await Promise.all([
    getProductById(id),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">상품 수정</h1>
        <ProductForm 
          product={product}
          categories={categories} 
          mode="edit" 
        />
      </div>
    </main>
  );
}
