'use client';

/**
 * @file components/admin/category-form.tsx
 * @description 카테고리 등록/수정 폼 컴포넌트
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createCategory, updateCategory } from '@/actions/categories';
import type { Category, CategoryInsert } from '@/types';

interface CategoryFormProps {
  category?: Category | null;
  categories: Category[]; // 상위 카테고리 선택용 (자기 자신 제외)
  mode: 'create' | 'edit';
}

export function CategoryForm({ category, categories, mode }: CategoryFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // 폼 상태
  const [formData, setFormData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    image_url: category?.image_url || '',
    parent_id: category?.parent_id || '',
    sort_order: category?.sort_order?.toString() || '0',
    is_active: category?.is_active ?? true,
  });

  // 자기 자신을 상위 카테고리 선택에서 제외
  const availableParentCategories = categories.filter(
    (c) => c.id !== category?.id
  );

  const handleChange = (
    field: string,
    value: string | boolean
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // 이름 입력 시 자동 slug 생성 (create 모드)
    if (field === 'name' && mode === 'create') {
      const slug = (value as string)
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 100);
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 필수 필드 검증
    if (!formData.name.trim()) {
      alert('카테고리명을 입력해주세요.');
      return;
    }
    if (!formData.slug.trim()) {
      alert('URL 슬러그를 입력해주세요.');
      return;
    }

    startTransition(async () => {
      const categoryData: CategoryInsert = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || null,
        image_url: formData.image_url.trim() || null,
        parent_id: formData.parent_id || null,
        sort_order: parseInt(formData.sort_order) || 0,
        is_active: formData.is_active,
      };

      let result;
      if (mode === 'create') {
        result = await createCategory(categoryData);
      } else if (category) {
        result = await updateCategory(category.id, categoryData);
      }

      if (result?.success) {
        alert(mode === 'create' ? '카테고리가 등록되었습니다.' : '카테고리가 수정되었습니다.');
        router.push('/admin/categories');
      } else {
        alert(result?.error || '저장에 실패했습니다.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 기본 정보 */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-bold mb-4">기본 정보</h2>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="name">카테고리명 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="카테고리명을 입력하세요"
            />
          </div>
          <div>
            <Label htmlFor="slug">URL 슬러그 *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              placeholder="url-friendly-slug"
            />
            <p className="text-xs text-gray-500 mt-1">
              카테고리 URL에 사용됩니다: /products?category={formData.slug || 'slug'}
            </p>
          </div>
          <div>
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="카테고리에 대한 설명을 입력하세요"
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* 이미지 */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-bold mb-4">이미지</h2>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="image_url">이미지 URL</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => handleChange('image_url', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              카테고리 대표 이미지 URL을 입력하세요
            </p>
          </div>
          {formData.image_url && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-2">미리보기:</p>
              <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={formData.image_url}
                  alt="카테고리 이미지 미리보기"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 분류 및 설정 */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-bold mb-4">분류 및 설정</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="parent_id">상위 카테고리</Label>
            <select
              id="parent_id"
              value={formData.parent_id}
              onChange={(e) => handleChange('parent_id', e.target.value)}
              className="w-full h-10 px-3 border rounded-md"
            >
              <option value="">상위 카테고리 없음</option>
              {availableParentCategories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              계층 구조를 만들려면 상위 카테고리를 선택하세요
            </p>
          </div>
          <div>
            <Label htmlFor="sort_order">정렬 순서</Label>
            <Input
              id="sort_order"
              type="number"
              min="0"
              value={formData.sort_order}
              onChange={(e) => handleChange('sort_order', e.target.value)}
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">
              숫자가 작을수록 먼저 표시됩니다
            </p>
          </div>
        </div>
      </div>

      {/* 상태 */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-bold mb-4">상태</h2>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => handleChange('is_active', e.target.checked)}
              className="w-4 h-4"
            />
            <span>활성 상태 (사용자에게 표시)</span>
          </label>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex items-center justify-between">
        <Link href="/admin/categories">
          <Button type="button" variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로
          </Button>
        </Link>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              저장 중...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {mode === 'create' ? '카테고리 등록' : '카테고리 수정'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
