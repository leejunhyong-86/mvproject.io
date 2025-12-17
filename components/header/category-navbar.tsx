/**
 * @file components/header/category-navbar.tsx
 * @description 카테고리 네비게이션 바 컴포넌트
 *
 * HeroHeader 바로 아래에 표시되는 어두운 배경의 카테고리 네비게이션 바입니다.
 *
 * 구성 요소:
 * - HomeButton: 닻 아이콘 홈 버튼 (왼쪽)
 * - HamburgerMenu: 전체 카테고리 드롭다운 (왼쪽)
 * - CategoryLinks: 메인 카테고리 링크들 (중앙~오른쪽)
 *
 * 반응형 디자인:
 * - 데스크탑: 모든 카테고리 표시
 * - 태블릿: 주요 카테고리만 표시
 * - 모바일: 홈버튼 + 햄버거 메뉴만 표시
 *
 * @dependencies
 * - components/header/home-button: 홈 버튼
 * - components/header/hamburger-menu: 햄버거 메뉴
 * - constants/navigation: 카테고리 데이터
 */

'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { HomeButton } from './home-button';
import { HamburgerMenu } from './hamburger-menu';
import { NAVIGATION_CATEGORIES, VISIBLE_CATEGORIES_TABLET } from '@/constants/navigation';

interface CategoryNavbarProps {
  className?: string;
}

export function CategoryNavbar({ className }: CategoryNavbarProps) {
  return (
    <nav
      className={cn(
        'w-full bg-zinc-900',
        'border-b border-zinc-800',
        'sticky top-0 z-40',
        className
      )}
      style={{ '--navbar-height': '56px' } as React.CSSProperties}
      aria-label="카테고리 네비게이션"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-14 gap-2">
          {/* 왼쪽: 홈 버튼 + 햄버거 메뉴 */}
          <div className="flex items-center gap-2 shrink-0">
            <HomeButton />
            <HamburgerMenu />
          </div>

          {/* 구분선 */}
          <div className="hidden sm:block w-px h-6 bg-zinc-700 mx-2" />

          {/* 카테고리 링크들 - 데스크탑 */}
          <div className="hidden lg:flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {NAVIGATION_CATEGORIES.map((category) => (
              <Link
                key={category.id}
                href={category.href}
                className={cn(
                  'px-3 py-2 rounded-lg',
                  'text-sm font-medium text-zinc-300',
                  'hover:text-white hover:bg-zinc-800',
                  'whitespace-nowrap',
                  'transition-colors duration-200'
                )}
              >
                {category.name}
              </Link>
            ))}
          </div>

          {/* 카테고리 링크들 - 태블릿 */}
          <div className="hidden sm:flex lg:hidden items-center gap-1 overflow-x-auto scrollbar-hide flex-1">
            {NAVIGATION_CATEGORIES.slice(0, VISIBLE_CATEGORIES_TABLET).map((category) => (
              <Link
                key={category.id}
                href={category.href}
                className={cn(
                  'px-3 py-2 rounded-lg',
                  'text-sm font-medium text-zinc-300',
                  'hover:text-white hover:bg-zinc-800',
                  'whitespace-nowrap',
                  'transition-colors duration-200'
                )}
              >
                {category.name}
              </Link>
            ))}
            {NAVIGATION_CATEGORIES.length > VISIBLE_CATEGORIES_TABLET && (
              <span className="px-3 py-2 text-sm text-zinc-500">
                +{NAVIGATION_CATEGORIES.length - VISIBLE_CATEGORIES_TABLET}
              </span>
            )}
          </div>

          {/* 모바일: 햄버거 메뉴로 모든 카테고리 접근 가능하므로 추가 표시 없음 */}
        </div>
      </div>
    </nav>
  );
}
