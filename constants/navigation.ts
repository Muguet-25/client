import { Target, Smartphone, Rocket, BarChart3, Users, Zap } from "lucide-react";

export const navData = [
  { name: '홈', href: 'hero' },
  { name: '소개', href: 'about' },
  { name: '기능', href: 'features' },
  { name: '가격', href: 'pricing' },
  { name: '문의', href: 'contact' },
];

export const popularFeatures = [
  { 
    name: 'AI 마케팅', 
    description: 'AI가 최적의 마케팅 전략을 자동으로 수립하고 실행합니다', 
    href: 'ai-marketing', 
    icon: Zap 
  },
  { 
    name: '실시간 분석', 
    description: '데이터 기반 인사이트로 성과를 극대화하세요', 
    href: 'real-time-analysis', 
    icon: BarChart3 
  },
  { 
    name: '통합 관리', 
    description: '모든 SNS를 한 곳에서 효율적으로 관리하세요', 
    href: 'integrated-management', 
    icon: Smartphone 
  },
  { 
    name: '타겟팅', 
    description: '목표 고객을 타겟팅하고 마케팅 효과를 극대화하세요', 
    href: 'reliable-performance', 
    icon: Target 
  },
];

export const socialProofData = [
  { value: '10,000+', label: '활성 크리에이터' },
  { value: '300%', label: '평균 팔로워 증가' },
  { value: '95%', label: '사용자 만족도' },
  { value: '50%', label: '마케팅 시간 단축' },
];

export const faqData = [
  {
    question: "Muguet는 어떤 SNS를 지원하나요?",
    answer: "인스타그램, 유튜브, 틱톡, 트위터, 페이스북 등 주요 SNS 플랫폼을 모두 지원합니다."
  },
  {
    question: "무료 체험은 얼마나 가능한가요?",
    answer: "14일 무료 체험을 제공하며, 신용카드 등록 없이 바로 시작할 수 있습니다."
  },
  {
    question: "AI가 제안하는 콘텐츠는 어떤가요?",
    answer: "당신의 기존 콘텐츠와 팔로워 데이터를 분석하여 최적의 포스팅 시간, 해시태그, 콘텐츠 아이디어를 제안합니다."
  },
  {
    question: "계정 보안은 어떻게 관리되나요?",
    answer: "OAuth 2.0 인증을 사용하여 안전하게 연결되며, 비밀번호는 저장하지 않습니다. 언제든지 연결을 해제할 수 있습니다."
  },
  {
    question: "요금제는 언제든지 변경 가능한가요?",
    answer: "네, 언제든지 요금제를 업그레이드하거나 다운그레이드할 수 있으며, 변경사항은 다음 결제일부터 적용됩니다."
  }
];
