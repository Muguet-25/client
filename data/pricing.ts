export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  features: string[];
  buttonText: string;
  buttonClass: string;
  textClass: string;
  bgClass: string;
  textColor: string;
  isPopular: boolean;
  onClick?: () => void;
}

export const pricingPlans: PricingPlan[] = [
  {
    name: '스타터',
    price: '무료',
    period: '/월',
    features: ['최대 2개 계정 연결', '기본 분석 도구', '월 10개 포스트 자동화'],
    buttonText: '무료로 시작',
    buttonClass: 'bg-gray-200 text-gray-800',
    textClass: 'text-gray-500',
    bgClass: 'bg-white',
    textColor: 'text-gray-900',
    isPopular: false
  },
  {
    name: '프로',
    price: '₩29,000',
    period: '/월',
    features: ['무제한 계정 연결', '고급 분석 및 인사이트', '무제한 포스트 자동화', 'AI 콘텐츠 제안', '우선 지원'],
    buttonText: '지금 시작하기',
    buttonClass: 'bg-white text-orange-500 hover:bg-gray-100',
    textClass: 'text-white',
    bgClass: 'bg-orange-500',
    textColor: 'text-white',
    isPopular: true,
    onClick: () => {
      // This will be set dynamically in the component
    }
  },
  {
    name: '엔터프라이즈',
    price: '₩99,000',
    period: '/월',
    features: ['프로 모든 기능', '전용 계정 매니저', '커스텀 분석 대시보드', 'API 접근 권한', '24/7 전화 지원'],
    buttonText: '문의하기',
    buttonClass: 'bg-gray-900 text-white hover:bg-gray-800',
    textClass: 'text-gray-500',
    bgClass: 'bg-white',
    textColor: 'text-gray-900',
    isPopular: false
  }
];
