/**
 * @file components/header/home-button.tsx
 * @description 홈 버튼 컴포넌트 - 닻(Anchor) 아이콘
 *
 * 네비게이션 바 왼쪽에 표시되는 홈 버튼입니다.
 * 닻 아이콘은 "항구"를 의미하며, 클릭 시 홈페이지로 이동합니다.
 *
 * @dependencies
 * - lucide-react: Anchor 아이콘
 * - next/link: 페이지 이동
 */

'use client';

import Link from 'next/link';
import { Anchor } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HomeButtonProps {
  className?: string;
}

export function HomeButton({ className }: HomeButtonProps) {
  return (
    <Link
      href="/"
      className={cn(
        'flex items-center justify-center',
        'w-10 h-10 rounded-lg',
        'bg-zinc-800 hover:bg-zinc-700',
        'text-white hover:text-green-400',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-zinc-900',
        className
      )}
      aria-label="홈으로 이동"
      title="홈으로 이동"
    >
      <Anchor className="w-5 h-5" strokeWidth={2.5} />
    </Link>
  );
}
