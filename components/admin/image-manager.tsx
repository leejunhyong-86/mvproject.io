'use client';

/**
 * @file components/admin/image-manager.tsx
 * @description 이미지 관리 컴포넌트
 * 
 * 이미지 URL 목록을 시각적으로 관리하는 컴포넌트입니다.
 * 이미지 추가, 삭제, 순서 변경 기능을 제공합니다.
 */

import { useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ImageManagerProps {
  images: string[];
  onChange: (images: string[]) => void;
  label?: string;
  placeholder?: string;
}

export function ImageManager({ 
  images, 
  onChange, 
  label = '이미지',
  placeholder = 'https://example.com/image.jpg'
}: ImageManagerProps) {
  const [newImageUrl, setNewImageUrl] = useState('');

  const handleAddImage = () => {
    const trimmedUrl = newImageUrl.trim();
    if (!trimmedUrl) return;

    // URL 유효성 검사 (간단한 체크)
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      alert('올바른 URL을 입력해주세요. (http:// 또는 https://로 시작)');
      return;
    }

    // 중복 체크
    if (images.includes(trimmedUrl)) {
      alert('이미 추가된 이미지입니다.');
      return;
    }

    onChange([...images, trimmedUrl]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    onChange(newImages);
  };

  const handleMoveDown = (index: number) => {
    if (index === images.length - 1) return;
    const newImages = [...images];
    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    onChange(newImages);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddImage();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>{label}</Label>
        <div className="flex gap-2 mt-1">
          <Input
            type="url"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={handleAddImage}
            disabled={!newImageUrl.trim()}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            추가
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          이미지 URL을 입력하고 추가 버튼을 클릭하거나 Enter를 누르세요
        </p>
      </div>

      {images.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            이미지 목록 ({images.length}개)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="relative group bg-gray-50 rounded-lg border border-gray-200 overflow-hidden"
              >
                {/* 이미지 미리보기 */}
                <div className="aspect-video bg-gray-100 relative">
                  <img
                    src={url}
                    alt={`이미지 ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const errorDiv = document.createElement('div');
                      errorDiv.className = 'w-full h-full flex items-center justify-center text-gray-400 text-xs';
                      errorDiv.textContent = '이미지 로드 실패';
                      target.parentElement?.appendChild(errorDiv);
                    }}
                  />
                </div>

                {/* 이미지 정보 및 액션 */}
                <div className="p-2">
                  <p className="text-xs text-gray-600 truncate mb-2" title={url}>
                    {url}
                  </p>
                  <div className="flex items-center gap-1">
                    {/* 순서 변경 버튼 */}
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="h-7 w-7 p-0"
                        title="위로 이동"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === images.length - 1}
                        className="h-7 w-7 p-0"
                        title="아래로 이동"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </Button>
                    </div>
                    {/* 삭제 버튼 */}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveImage(index)}
                      className="h-7 text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto"
                      title="삭제"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* 순서 번호 표시 */}
                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
          <p className="text-sm">추가된 이미지가 없습니다</p>
          <p className="text-xs mt-1">위에서 이미지 URL을 추가해주세요</p>
        </div>
      )}
    </div>
  );
}
