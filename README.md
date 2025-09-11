# 🎯 Muguet - AI 마케팅 플랫폼

> 1인 크리에이터를 위한 AI 기반 마케팅 자동화 플랫폼

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![Bun](https://img.shields.io/badge/Bun-1.0-000000?style=for-the-badge&logo=bun)

## 📋 목차

- [프로젝트 소개](#프로젝트-소개)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [시작하기](#시작하기)
- [개발 가이드](#개발-가이드)
- [배포](#배포)
- [기여하기](#기여하기)

## 🚀 프로젝트 소개

Muguet는 1인 크리에이터들이 마케팅에 소모하는 시간을 최소화하고, 콘텐츠 제작에 집중할 수 있도록 도와주는 AI 기반 마케팅 자동화 플랫폼입니다.

### 🎯 핵심 가치

- **자동화**: AI가 최적의 마케팅 전략을 자동으로 수립하고 실행
- **통합 관리**: 모든 SNS를 한 곳에서 효율적으로 관리
- **데이터 기반**: 실시간 분석을 통한 성과 극대화
- **크리에이터 중심**: 콘텐츠 제작에만 집중할 수 있는 환경 제공

## ✨ 주요 기능

### 🤖 AI 마케팅
- AI가 최적의 마케팅 전략을 자동으로 수립하고 실행
- 콘텐츠 분석을 통한 개인화된 전략 제안

### 📊 실시간 분석
- 데이터 기반 인사이트로 성과를 극대화
- 상세한 성과 리포트 및 개선 제안

### 📱 통합 관리
- 모든 SNS를 한 곳에서 효율적으로 관리
- 일괄 포스팅 및 스케줄링

### 🎯 타겟팅
- 목표 고객을 정확히 타겟팅
- 마케팅 효과를 극대화하는 전략 수립

## 🛠 기술 스택

### Frontend
- **Next.js 14** - React 기반 풀스택 프레임워크
- **TypeScript** - 타입 안전성 보장
- **Tailwind CSS** - 유틸리티 퍼스트 CSS 프레임워크
- **Lucide React** - 모던 아이콘 라이브러리

### Development Tools
- **Bun** - 빠른 JavaScript 런타임 및 패키지 매니저
- **ESLint** - 코드 품질 관리
- **PostCSS** - CSS 후처리

### Design System
- **Human Interface Guidelines (HIG)** 준수
- **반응형 디자인** - 모든 디바이스 지원
- **다크 테마** - 모던한 UI/UX

## 📁 프로젝트 구조

```
client-v2/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 메인 랜딩 페이지
├── components/            # 재사용 가능한 컴포넌트
│   └── sections/         # 페이지 섹션별 컴포넌트
│       ├── Navigation.tsx
│       ├── SideIndicators.tsx
│       ├── FeatureCard.tsx
│       ├── FAQAccordion.tsx
│       └── VideoPlayer.tsx
├── data/                 # 정적 데이터
│   ├── pricing.ts        # 가격 정보
│   └── sections.ts       # 섹션별 데이터
├── constants/            # 상수 정의
│   └── navigation.ts     # 네비게이션 관련 상수
├── hooks/               # 커스텀 훅
│   └── useScrollSpy.ts  # 스크롤 감지 훅
├── types/               # TypeScript 타입 정의
│   └── index.ts
├── styles/              # 글로벌 스타일
├── public/              # 정적 파일
└── package.json
```

## 🚀 시작하기

### 필수 요구사항

- **Bun** 1.0 이상
- **Node.js** 18.0 이상 (Bun과 함께 사용)
- **Supabase** 계정 (인증 및 데이터베이스)
- **Google Cloud Console** 계정 (YouTube API용)

### 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone https://github.com/your-username/muguet-client.git
   cd muguet-client
   ```

2. **의존성 설치**
   ```bash
   bun install
   ```

3. **환경 변수 설정**
   ```bash
   cp .env.example .env.local
   ```
   
   `.env.local` 파일에 다음 변수들을 설정하세요:
   ```env
   # Supabase 설정
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # YouTube API 설정
   NEXT_PUBLIC_YOUTUBE_CLIENT_ID=your_youtube_client_id
   YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
   NEXT_PUBLIC_YOUTUBE_REDIRECT_URI=http://localhost:3000/auth/youtube/callback

   # 기타 설정
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Supabase 설정**
   - [Supabase](https://supabase.com)에서 새 프로젝트 생성
   - 프로젝트 설정에서 URL과 API 키 복사
   - 환경 변수에 입력

5. **YouTube API 설정**
   - [Google Cloud Console](https://console.cloud.google.com)에서 프로젝트 생성
   - YouTube Data API v3 및 YouTube Analytics API 활성화
   - OAuth 2.0 클라이언트 ID 생성
   - 환경 변수에 클라이언트 ID와 시크릿 입력

6. **개발 서버 실행**
   ```bash
   bun dev
   ```

7. **브라우저에서 확인**
   ```
   http://localhost:3000
   ```

### 빌드 및 배포

```bash
# 프로덕션 빌드
bun run build

# 프로덕션 서버 실행
bun start

# 정적 파일 생성 (선택사항)
bun run export
```

## 🎨 개발 가이드

### 코드 스타일

- **TypeScript** 사용 필수
- **ESLint** 규칙 준수
- **컴포넌트 분리**: 재사용 가능한 컴포넌트로 분리
- **데이터 분리**: 정적 데이터는 `data/` 폴더에 분리

### 컴포넌트 구조

```typescript
// 컴포넌트 예시
interface ComponentProps {
  title: string;
  description: string;
  onClick?: () => void;
}

const Component = ({ title, description, onClick }: ComponentProps) => {
  return (
    <div className="component-wrapper">
      <h3>{title}</h3>
      <p>{description}</p>
      {onClick && <button onClick={onClick}>클릭</button>}
    </div>
  );
};
```

### 스타일링 가이드

- **Tailwind CSS** 클래스 사용
- **반응형 디자인**: `sm:`, `md:`, `lg:` 브레이크포인트 활용
- **일관된 색상**: 오렌지 계열 브랜드 컬러 사용
- **애니메이션**: `transition-all duration-300` 등 일관된 타이밍

## 📱 반응형 디자인

### 브레이크포인트

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### 주요 반응형 클래스

```css
/* 모바일 우선 접근법 */
.container {
  @apply px-4 sm:px-8 lg:px-16;
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3;
}
```

## 🎯 성능 최적화

### 이미지 최적화
- **Next.js Image** 컴포넌트 사용
- **WebP** 포맷 지원
- **Lazy Loading** 적용

### 코드 분할
- **동적 import** 활용
- **컴포넌트 레벨 분할**

### 번들 최적화
- **Tree Shaking** 자동 적용
- **불필요한 의존성 제거**

## 🚀 배포

### Vercel (권장)

1. **Vercel 계정 연결**
2. **GitHub 저장소 연결**
3. **자동 배포 설정**

```bash
# Vercel CLI 설치
bun add -g vercel

# 배포
vercel --prod
```

### 기타 플랫폼

- **Netlify**
- **AWS Amplify**
- **Docker** (컨테이너화)

## 🤝 기여하기

1. **Fork** 프로젝트
2. **Feature 브랜치** 생성 (`git checkout -b feature/AmazingFeature`)
3. **커밋** (`git commit -m 'Add some AmazingFeature'`)
4. **Push** (`git push origin feature/AmazingFeature`)
5. **Pull Request** 생성

### 커밋 컨벤션

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 스타일 변경
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드 설정 변경
```

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 문의

- **이메일**: contact@muguet.com
- **웹사이트**: https://muguet.com
- **이슈**: [GitHub Issues](https://github.com/your-username/muguet-client/issues)

---

<div align="center">

**Made with ❤️ by Muguet Team**

[![GitHub stars](https://img.shields.io/github/stars/your-username/muguet-client?style=social)](https://github.com/your-username/muguet-client)
[![GitHub forks](https://img.shields.io/github/forks/your-username/muguet-client?style=social)](https://github.com/your-username/muguet-client)

</div>