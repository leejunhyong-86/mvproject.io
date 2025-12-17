/**
 * @file constants/navigation.ts
 * @description 네비게이션 카테고리 데이터 및 타입 정의
 *
 * 카테고리 네비게이션 바에서 사용되는 메인 카테고리와 세부 카테고리 데이터를 정의합니다.
 *
 * @dependencies
 * - 없음 (순수 데이터 파일)
 */

/**
 * 세부 카테고리 타입
 */
export interface SubCategory {
  id: string;
  name: string;
  href: string;
}

/**
 * 메인 카테고리 타입
 */
export interface MainCategory {
  id: string;
  name: string;
  href: string;
  /** 세부 카테고리 목록 (없을 수 있음) */
  subCategories?: SubCategory[];
}

/**
 * 네비게이션 카테고리 데이터
 * 순서: 프리오더, 체험단 모집, 신상품, 전자기기, 뷰티, 패션, 푸드, 주방용품, 스포츠, 유아용품, 홈인테리어
 */
export const NAVIGATION_CATEGORIES: MainCategory[] = [
  {
    id: 'preorder',
    name: '프리오더',
    href: '/products?category=preorder',
    subCategories: [
      { id: 'preorder-electronics', name: '전자기기', href: '/products?category=preorder&sub=electronics' },
      { id: 'preorder-fashion', name: '패션', href: '/products?category=preorder&sub=fashion' },
      { id: 'preorder-beauty', name: '뷰티', href: '/products?category=preorder&sub=beauty' },
    ],
  },
  {
    id: 'experience',
    name: '체험단 모집',
    href: '/products?category=experience',
    subCategories: [
      { id: 'experience-ongoing', name: '진행중', href: '/products?category=experience&sub=ongoing' },
      { id: 'experience-upcoming', name: '예정', href: '/products?category=experience&sub=upcoming' },
      { id: 'experience-closed', name: '마감', href: '/products?category=experience&sub=closed' },
    ],
  },
  {
    id: 'new',
    name: '신상품',
    href: '/products?category=new',
    subCategories: [
      { id: 'new-today', name: '오늘의 신상품', href: '/products?category=new&sub=today' },
      { id: 'new-week', name: '이번주 신상품', href: '/products?category=new&sub=week' },
      { id: 'new-month', name: '이번달 신상품', href: '/products?category=new&sub=month' },
    ],
  },
  {
    id: 'electronics',
    name: '전자기기',
    href: '/products?category=electronics',
    subCategories: [
      { id: 'electronics-audio', name: '음향기기', href: '/products?category=electronics&sub=audio' },
      { id: 'electronics-seasonal', name: '계절가전', href: '/products?category=electronics&sub=seasonal' },
      { id: 'electronics-health', name: '건강가전', href: '/products?category=electronics&sub=health' },
      { id: 'electronics-living', name: '생활가전', href: '/products?category=electronics&sub=living' },
      { id: 'electronics-gaming', name: '게임기/타이틀', href: '/products?category=electronics&sub=gaming' },
    ],
  },
  {
    id: 'beauty',
    name: '뷰티',
    href: '/products?category=beauty',
    subCategories: [
      { id: 'beauty-skincare', name: '스킨케어', href: '/products?category=beauty&sub=skincare' },
      { id: 'beauty-makeup', name: '메이크업', href: '/products?category=beauty&sub=makeup' },
      { id: 'beauty-haircare', name: '헤어케어', href: '/products?category=beauty&sub=haircare' },
      { id: 'beauty-perfume', name: '향수', href: '/products?category=beauty&sub=perfume' },
      { id: 'beauty-bodycare', name: '바디케어', href: '/products?category=beauty&sub=bodycare' },
    ],
  },
  {
    id: 'fashion',
    name: '패션',
    href: '/products?category=fashion',
    subCategories: [
      { id: 'fashion-women', name: '여성의류', href: '/products?category=fashion&sub=women' },
      { id: 'fashion-men', name: '남성의류', href: '/products?category=fashion&sub=men' },
      { id: 'fashion-bags', name: '가방', href: '/products?category=fashion&sub=bags' },
      { id: 'fashion-shoes', name: '신발', href: '/products?category=fashion&sub=shoes' },
      { id: 'fashion-accessories', name: '액세서리', href: '/products?category=fashion&sub=accessories' },
    ],
  },
  {
    id: 'food',
    name: '푸드',
    href: '/products?category=food',
    subCategories: [
      { id: 'food-snacks', name: '간식/음료', href: '/products?category=food&sub=snacks' },
      { id: 'food-convenience', name: '간편식', href: '/products?category=food&sub=convenience' },
      { id: 'food-fresh', name: '신선', href: '/products?category=food&sub=fresh' },
      { id: 'food-health', name: '헬스/이너뷰티', href: '/products?category=food&sub=health' },
    ],
  },
  {
    id: 'kitchen',
    name: '주방용품',
    href: '/products?category=kitchen',
    subCategories: [
      { id: 'kitchen-cookware', name: '조리도구', href: '/products?category=kitchen&sub=cookware' },
      { id: 'kitchen-tableware', name: '식기', href: '/products?category=kitchen&sub=tableware' },
      { id: 'kitchen-storage', name: '보관용기', href: '/products?category=kitchen&sub=storage' },
      { id: 'kitchen-appliances', name: '소형가전', href: '/products?category=kitchen&sub=appliances' },
    ],
  },
  {
    id: 'sports',
    name: '스포츠',
    href: '/products?category=sports',
    subCategories: [
      { id: 'sports-equipment', name: '운동기구', href: '/products?category=sports&sub=equipment' },
      { id: 'sports-wear', name: '스포츠웨어', href: '/products?category=sports&sub=wear' },
      { id: 'sports-outdoor', name: '캠핑/아웃도어', href: '/products?category=sports&sub=outdoor' },
      { id: 'sports-cycling', name: '자전거', href: '/products?category=sports&sub=cycling' },
    ],
  },
  {
    id: 'baby',
    name: '유아용품',
    href: '/products?category=baby',
    subCategories: [
      { id: 'baby-clothing', name: '유아의류', href: '/products?category=baby&sub=clothing' },
      { id: 'baby-toys', name: '완구', href: '/products?category=baby&sub=toys' },
      { id: 'baby-care', name: '육아용품', href: '/products?category=baby&sub=care' },
      { id: 'baby-feeding', name: '수유용품', href: '/products?category=baby&sub=feeding' },
    ],
  },
  {
    id: 'interior',
    name: '홈인테리어',
    href: '/products?category=interior',
    subCategories: [
      { id: 'interior-living', name: '생활용품', href: '/products?category=interior&sub=living' },
      { id: 'interior-furniture', name: '가구', href: '/products?category=interior&sub=furniture' },
      { id: 'interior-storage', name: '수납/정리', href: '/products?category=interior&sub=storage' },
      { id: 'interior-lighting', name: '조명', href: '/products?category=interior&sub=lighting' },
    ],
  },
];

/**
 * 데스크탑에서 네비게이션 바에 직접 표시할 카테고리 수
 * 나머지는 "더보기" 메뉴로 표시
 */
export const VISIBLE_CATEGORIES_DESKTOP = 11;

/**
 * 태블릿에서 네비게이션 바에 직접 표시할 카테고리 수
 */
export const VISIBLE_CATEGORIES_TABLET = 6;
