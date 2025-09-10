# Cursor AI Instructions for Muguet Project

## 프로젝트 컨텍스트
이 프로젝트는 크리에이터를 위한 마케팅 플랫폼입니다. Next.js 14, TypeScript, Tailwind CSS, Supabase를 사용합니다.

## 주요 기능
- 사용자 인증 (이메일/비밀번호, SNS 로그인)
- 대시보드 (통계, 활동, 빠른 액션)
- 랜딩 페이지 (기능 소개, 가격, FAQ)
- 다크 테마, 미니멀 디자인

## 기술 스택
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth, Database)
- **State Management**: Zustand
- **Validation**: Zod
- **Icons**: Lucide React
- **Deployment**: Vercel

## 코딩 가이드라인

### 컴포넌트 작성
- 함수형 컴포넌트 사용
- Props 인터페이스 정의
- 적절한 타입 지정
- 접근성 고려

### 스타일링
- Tailwind CSS 클래스 사용
- 반응형 디자인 적용
- 다크 테마 일관성 유지
- 색상 시스템 준수

### 상태 관리
- Zustand 스토어 사용
- 타입 안전성 보장
- 에러 상태 처리

### 에러 처리
- try-catch 블록 사용
- 사용자 친화적 메시지
- 로딩 상태 표시

## 파일 구조
```
/app - Next.js App Router 페이지
/components - 재사용 가능한 컴포넌트
/lib - 유틸리티, 훅, 스토어
/data - 정적 데이터
/types - TypeScript 타입
```

## 네이밍 컨벤션
- 컴포넌트: PascalCase
- 파일명: kebab-case
- 변수/함수: camelCase
- 상수: UPPER_SNAKE_CASE

## 색상 시스템
- Primary: Green (green-400, green-500, green-600)
- Secondary: Orange (orange-500, orange-600)
- Background: Gray (gray-900, gray-800)
- Status: Red (error), Yellow (warning), Blue (info)

## 성능 최적화
- 이미지 최적화 (next/image)
- 코드 스플리팅
- 메모이제이션 적절히 사용
- 불필요한 리렌더링 방지

## 보안 고려사항
- 입력 검증 (Zod)
- XSS 방지
- CSRF 보호
- 환경 변수 보안
