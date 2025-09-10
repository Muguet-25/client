# 기여 가이드

Muguet 프로젝트에 기여해주셔서 감사합니다! 이 문서는 프로젝트에 기여하는 방법을 안내합니다.

## 🚀 시작하기

### 개발 환경 설정

1. 저장소를 포크하고 클론합니다:
```bash
git clone https://github.com/your-username/client-v2.git
cd client-v2
```

2. 의존성을 설치합니다:
```bash
bun install
```

3. 환경 변수를 설정합니다:
```bash
cp .env.example .env.local
# .env.local 파일을 편집하여 필요한 환경 변수를 설정합니다
```

4. 개발 서버를 실행합니다:
```bash
bun run dev
```

## 📝 기여 방법

### 버그 리포트
- [GitHub Issues](https://github.com/your-username/client-v2/issues)에서 버그를 신고해주세요
- 버그 리포트 템플릿을 사용해주세요
- 재현 단계와 예상 동작을 명확히 설명해주세요

### 기능 요청
- 새로운 기능을 제안하고 싶으시면 이슈를 생성해주세요
- 기능 요청 템플릿을 사용해주세요
- 기능의 필요성과 사용 사례를 설명해주세요

### 코드 기여
1. 이슈를 생성하거나 기존 이슈를 확인합니다
2. 새로운 브랜치를 생성합니다: `git checkout -b feature/amazing-feature`
3. 변경사항을 커밋합니다: `git commit -m 'Add amazing feature'`
4. 브랜치를 푸시합니다: `git push origin feature/amazing-feature`
5. Pull Request를 생성합니다

## 🎨 코딩 스타일

### TypeScript
- Strict 모드를 사용합니다
- 명시적 타입을 지정합니다
- `any` 타입 사용을 피합니다

### React/Next.js
- 함수형 컴포넌트를 사용합니다
- React Hooks를 적절히 활용합니다
- 접근성을 고려합니다

### 스타일링
- Tailwind CSS를 사용합니다
- 반응형 디자인을 적용합니다
- 다크 테마 일관성을 유지합니다

### 네이밍 컨벤션
- 컴포넌트: `PascalCase`
- 파일명: `kebab-case`
- 변수/함수: `camelCase`
- 상수: `UPPER_SNAKE_CASE`

## 🧪 테스트

### 테스트 실행
```bash
# 모든 테스트 실행
bun run test

# 타입 체크
bun run type-check

# 린팅
bun run lint

# 빌드 테스트
bun run build
```

### 테스트 작성
- 새로운 기능에 대한 테스트를 작성합니다
- 기존 테스트가 통과하는지 확인합니다
- 테스트 커버리지를 유지합니다

## 📋 Pull Request 가이드라인

### PR 생성 전 체크리스트
- [ ] 코드가 프로젝트의 코딩 스타일을 따릅니다
- [ ] 자체 검토를 수행했습니다
- [ ] 적절한 주석을 추가했습니다
- [ ] 문서를 업데이트했습니다 (필요한 경우)
- [ ] 테스트를 추가했습니다 (필요한 경우)
- [ ] 기존 테스트가 통과합니다

### PR 설명
- 변경사항을 명확히 설명합니다
- 관련 이슈를 링크합니다
- 스크린샷을 추가합니다 (UI 변경이 있는 경우)
- Breaking change가 있는 경우 명시합니다

## 🏷️ 이슈 라벨

- `bug`: 버그 수정
- `enhancement`: 새로운 기능
- `documentation`: 문서 업데이트
- `good first issue`: 초보자에게 적합한 이슈
- `help wanted`: 도움이 필요한 이슈
- `question`: 질문
- `wontfix`: 수정하지 않을 이슈

## 📞 커뮤니케이션

- GitHub Issues를 사용하여 토론합니다
- Pull Request에서 코드 리뷰를 진행합니다
- 질문이 있으시면 이슈를 생성해주세요

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 기여하시면 해당 라이선스에 동의하는 것으로 간주됩니다.

## 🙏 감사

모든 기여자분들께 감사드립니다! 여러분의 기여가 이 프로젝트를 더 나은 것으로 만들어줍니다.
