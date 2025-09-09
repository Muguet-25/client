export interface BottomCard {
  title: string;
  description: string;
  href: string;
}

export interface ProcessStep {
  step: number;
  color: string;
  title: string;
  description: string;
}

export interface VideoThumbnail {
  title: string;
  gradient: string;
}

export interface FooterSection {
  title: string;
  links: string[];
}

export const bottomCards: BottomCard[] = [
  { title: 'AI 마케팅', description: '자동화된 마케팅 전략으로 시간을 절약하세요', href: 'features' },
  { title: '실시간 분석', description: '데이터 기반 인사이트로 성과를 극대화하세요', href: 'features' },
  { title: '통합 관리', description: '모든 SNS를 한 곳에서 효율적으로 관리하세요', href: 'features' }
];

export const processSteps: ProcessStep[] = [
  { step: 1, color: 'bg-blue-500', title: '계정 연결', description: 'SNS 계정을 안전하게 연결하고 프로필을 설정하세요' },
  { step: 2, color: 'bg-green-500', title: '전략 수립', description: 'AI가 당신의 콘텐츠를 분석하여 최적의 마케팅 전략을 제안합니다' },
  { step: 3, color: 'bg-purple-500', title: '자동 실행', description: '설정한 전략에 따라 자동으로 포스팅하고 성과를 분석합니다' }
];

export const videoThumbnails: VideoThumbnail[] = [
  { title: 'AI 마케팅 전략', gradient: 'from-blue-900 to-purple-900' },
  { title: '성과 분석 가이드', gradient: 'from-green-900 to-blue-900' },
  { title: '브랜딩 마스터클래스', gradient: 'from-purple-900 to-pink-900' }
];

export const footerSections: FooterSection[] = [
  { title: '제품', links: ['기능', '가격', 'API', '통합'] },
  { title: '지원', links: ['도움말', '문서', '커뮤니티', '연락처'] },
  { title: '회사', links: ['소개', '채용', '블로그', '뉴스'] }
];

export const socialMediaIcons = ['📘', '📷', '🐦', '📺'];
