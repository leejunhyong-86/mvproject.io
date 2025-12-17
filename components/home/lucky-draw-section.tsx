'use client';

/**
 * @file components/home/lucky-draw-section.tsx
 * @description 럭키드로우 이벤트 섹션 컴포넌트
 *
 * 홈페이지 신상품 섹션 아래에 표시되는 럭키드로우 이벤트 배너입니다.
 *
 * 디자인 컨셉:
 * - 중세 대항해시대 지도/종이 질감 배경
 * - 웅장한 무역선 이미지
 * - 실시간 카운트다운 타이머 (100분의1초 포함)
 * - 모래시계 일러스트
 *
 * 구성:
 * - 좌측: 모래시계 + 카운트다운 타이머
 * - 중앙: 이벤트 제목, 설명, 바로가기 버튼
 * - 우측: 상품 이미지 (클릭 가능)
 *
 * @dependencies
 * - lucide-react: 아이콘
 * - next/link: 페이지 네비게이션
 * - next/image: 이미지 최적화
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Anchor } from 'lucide-react';
import type { LuckyDrawEvent } from '@/types';

interface LuckyDrawSectionProps {
  event: LuckyDrawEvent | null;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  centiseconds: number;
}

/**
 * 럭키드로우 섹션 컴포넌트
 */
export function LuckyDrawSection({ event }: LuckyDrawSectionProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    centiseconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // 남은 시간 계산 함수
  const calculateTimeLeft = useCallback((): TimeLeft => {
    if (!event) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, centiseconds: 0 };
    }

    const now = Date.now();
    const endTime = new Date(event.end_time).getTime();
    const difference = endTime - now;

    if (difference <= 0) {
      setIsExpired(true);
      return { days: 0, hours: 0, minutes: 0, seconds: 0, centiseconds: 0 };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    const centiseconds = Math.floor((difference % 1000) / 10);

    return { days, hours, minutes, seconds, centiseconds };
  }, [event]);

  // requestAnimationFrame으로 고정밀 타이머 구현
  useEffect(() => {
    if (!event || isExpired) return;

    const updateTimer = (timestamp: number) => {
      // 10ms마다 업데이트 (100분의1초 정밀도)
      if (timestamp - lastUpdateRef.current >= 10) {
        setTimeLeft(calculateTimeLeft());
        lastUpdateRef.current = timestamp;
      }
      animationFrameRef.current = requestAnimationFrame(updateTimer);
    };

    animationFrameRef.current = requestAnimationFrame(updateTimer);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [event, isExpired, calculateTimeLeft]);

  // 이벤트가 없으면 렌더링하지 않음
  if (!event) {
    return null;
  }

  // 이벤트가 만료되었으면 렌더링하지 않음
  if (isExpired) {
    return null;
  }

  // 숫자를 2자리로 포맷팅
  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, '0');
  };

  const targetUrl = event.target_url || '/events/lucky-draw';

  return (
    <section className="relative py-12 overflow-hidden">
      {/* 배경 이미지 레이어 */}
      <div className="absolute inset-0">
        {/* 범선 배경 이미지 */}
        <Image
          src="/images/lucky-draw-bg.png"
          alt="대항해시대 무역선"
          fill
          className="object-cover opacity-30"
          priority
        />
        {/* 빈티지 지도 오버레이 */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(135deg, 
                rgba(139, 115, 85, 0.9) 0%, 
                rgba(160, 140, 110, 0.85) 25%,
                rgba(180, 160, 130, 0.8) 50%,
                rgba(160, 140, 110, 0.85) 75%,
                rgba(139, 115, 85, 0.9) 100%
              )
            `,
          }}
        />
        {/* 종이 질감 노이즈 효과 */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* 장식 요소 - 나침반 패턴 */}
      <div className="absolute top-4 left-4 w-16 h-16 opacity-20">
        <Anchor className="w-full h-full text-amber-900" />
      </div>
      <div className="absolute bottom-4 right-4 w-16 h-16 opacity-20">
        <Anchor className="w-full h-full text-amber-900" />
      </div>

      {/* 콘텐츠 */}
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* 좌측: 모래시계 + 타이머 */}
          <div className="flex items-center gap-6">
            {/* 모래시계 이미지 */}
            <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0">
              <Image
                src="/images/hourglass.svg"
                alt="모래시계"
                fill
                className="object-contain drop-shadow-lg"
              />
            </div>

            {/* 카운트다운 타이머 */}
            <div className="text-center lg:text-left">
              <p className="text-amber-900 font-semibold text-sm md:text-base mb-2 tracking-wide">
                이번주 마감까지 남은 시간
              </p>
              <div className="flex items-baseline gap-1 font-mono">
                {/* 일 */}
                <span className="text-3xl md:text-5xl font-bold text-amber-950">
                  {timeLeft.days}
                </span>
                <span className="text-lg md:text-xl text-amber-800 mr-2">일</span>
                
                {/* 시:분:초:100분의1초 */}
                <span className="text-3xl md:text-5xl font-bold text-amber-950">
                  {formatNumber(timeLeft.hours)}
                </span>
                <span className="text-2xl md:text-4xl text-amber-700">:</span>
                <span className="text-3xl md:text-5xl font-bold text-amber-950">
                  {formatNumber(timeLeft.minutes)}
                </span>
                <span className="text-2xl md:text-4xl text-amber-700">:</span>
                <span className="text-3xl md:text-5xl font-bold text-amber-950">
                  {formatNumber(timeLeft.seconds)}
                </span>
                <span className="text-2xl md:text-4xl text-amber-700">:</span>
                <span className="text-3xl md:text-5xl font-bold text-amber-600">
                  {formatNumber(timeLeft.centiseconds)}
                </span>
              </div>
            </div>
          </div>

          {/* 중앙: 제목 및 버튼 */}
          <div className="text-center flex-1">
            {/* 제목 */}
            <h2 className="text-2xl md:text-3xl font-bold text-amber-950 mb-2">
              <span className="border-b-2 border-amber-600">럭키드로우</span>
            </h2>
            
            {/* 설명 */}
            <p className="text-amber-800 mb-4 text-sm md:text-base max-w-md mx-auto">
              {event.description || '바다 건너 온 특별한 경품! 지금 바로 참여하세요!'}
            </p>
            
            {/* 바로가기 버튼 */}
            <Link
              href={targetUrl}
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-full font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              바로가기
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          {/* 우측: 상품 이미지 (9:16 비율) */}
          <Link
            href={targetUrl}
            className="group relative flex-shrink-0 cursor-pointer"
          >
            {/* 9:16 비율 컨테이너 */}
            <div className="relative w-28 sm:w-32 md:w-36 aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl bg-gray-100 group-hover:shadow-amber-400/30 transition-all duration-300 group-hover:scale-105">
              {event.product_image_url ? (
                <Image
                  src={event.product_image_url}
                  alt="럭키드로우 경품"
                  fill
                  className="object-cover"
                />
              ) : (
                // Placeholder: 상품 카드 스타일과 동일
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                  <span className="text-6xl opacity-30">🎁</span>
                </div>
              )}
              
              {/* 그라데이션 오버레이 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              {/* 하단 텍스트 */}
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                <p className="text-xs text-gray-200 mb-1">이번주 경품</p>
                <p className="font-semibold text-sm line-clamp-2">
                  럭키드로우 참여하기
                </p>
              </div>
              
              {/* 호버 오버레이 */}
              <div className="absolute inset-0 bg-purple-600/0 group-hover:bg-purple-600/30 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold text-sm drop-shadow-lg bg-black/50 px-3 py-1 rounded-full">
                  참여하기 →
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * 스켈레톤 로딩 상태
 */
export function LuckyDrawSectionSkeleton() {
  return (
    <section className="relative py-12 overflow-hidden bg-gradient-to-r from-amber-100 to-amber-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* 좌측 스켈레톤 */}
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-amber-300 rounded-full animate-pulse" />
            <div>
              <div className="h-4 w-32 bg-amber-300 rounded animate-pulse mb-2" />
              <div className="h-12 w-64 bg-amber-300 rounded animate-pulse" />
            </div>
          </div>

          {/* 중앙 스켈레톤 */}
          <div className="text-center flex-1">
            <div className="w-12 h-12 bg-amber-300 rounded-full mx-auto mb-3 animate-pulse" />
            <div className="h-8 w-48 bg-amber-300 rounded mx-auto mb-2 animate-pulse" />
            <div className="h-4 w-64 bg-amber-300 rounded mx-auto mb-4 animate-pulse" />
            <div className="h-12 w-32 bg-amber-300 rounded-full mx-auto animate-pulse" />
          </div>

          {/* 우측 스켈레톤 */}
          <div className="w-40 h-40 md:w-48 md:h-48 bg-amber-300 rounded-2xl animate-pulse" />
        </div>
      </div>
    </section>
  );
}
