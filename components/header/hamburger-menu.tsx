/**
 * @file components/header/hamburger-menu.tsx
 * @description 햄버거 메뉴 컴포넌트 - 전체 카테고리 드롭다운
 *
 * 햄버거 아이콘 클릭 시 전체 카테고리가 펼쳐지는 드롭다운 메뉴입니다.
 * 메인 카테고리와 세부 카테고리를 그리드 형태로 표시합니다.
 *
 * 주요 기능:
 * - 햄버거 아이콘 클릭으로 드롭다운 열기/닫기
 * - "ALL CATEGORY" 헤더
 * - 메인 카테고리별 세부 카테고리 표시
 * - 외부 클릭 시 자동 닫기
 * - 키보드 접근성 (ESC로 닫기)
 *
 * @dependencies
 * - lucide-react: Menu, X 아이콘
 * - constants/navigation: 카테고리 데이터
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAVIGATION_CATEGORIES } from '@/constants/navigation';

interface HamburgerMenuProps {
  className?: string;
}

export function HamburgerMenu({ className }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // ESC 키로 메뉴 닫기
  useEffect(() => {
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen]);

  // 메뉴 열릴 때 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <div className={cn('relative', className)}>
      {/* 햄버거 버튼 */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center justify-center',
          'w-10 h-10 rounded-lg',
          'bg-zinc-800 hover:bg-zinc-700',
          'text-white hover:text-green-400',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-zinc-900'
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={isOpen ? '메뉴 닫기' : '전체 카테고리 보기'}
      >
        {isOpen ? (
          <X className="w-5 h-5" strokeWidth={2.5} />
        ) : (
          <Menu className="w-5 h-5" strokeWidth={2.5} />
        )}
      </button>

      {/* 드롭다운 오버레이 */}
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            style={{ top: '0' }}
            onClick={() => setIsOpen(false)}
          />

          {/* 드롭다운 메뉴 */}
          <div
            ref={menuRef}
            className={cn(
              'fixed left-0 right-0 z-50',
              'bg-zinc-900 border-t border-zinc-700',
              'shadow-2xl',
              'max-h-[80vh] overflow-y-auto'
            )}
            style={{ top: 'calc(var(--navbar-height, 56px) + var(--hero-height, 0px))' }}
            role="menu"
            aria-orientation="vertical"
          >
            {/* ALL CATEGORY 헤더 */}
            <div className="sticky top-0 bg-zinc-900 border-b border-zinc-700 px-4 py-3 z-10">
              <div className="max-w-7xl mx-auto flex items-center gap-2">
                <Menu className="w-5 h-5 text-green-400" />
                <span className="text-white font-bold text-lg">ALL CATEGORY</span>
              </div>
            </div>

            {/* 카테고리 그리드 */}
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {NAVIGATION_CATEGORIES.map((category) => (
                  <div key={category.id} className="space-y-3">
                    {/* 메인 카테고리 */}
                    <Link
                      href={category.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'block text-white font-semibold text-sm',
                        'pb-2 border-b border-yellow-500',
                        'hover:text-green-400 transition-colors'
                      )}
                      role="menuitem"
                    >
                      {category.name}
                    </Link>

                    {/* 세부 카테고리 */}
                    {category.subCategories && category.subCategories.length > 0 && (
                      <ul className="space-y-2">
                        {category.subCategories.map((sub) => (
                          <li key={sub.id}>
                            <Link
                              href={sub.href}
                              onClick={() => setIsOpen(false)}
                              className={cn(
                                'block text-zinc-400 text-sm',
                                'hover:text-green-400 transition-colors'
                              )}
                              role="menuitem"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
