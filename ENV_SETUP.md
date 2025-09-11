# 🔧 환경변수 설정 가이드

Muguet 플랫폼을 실행하기 위해 필요한 환경변수들을 설정하는 방법을 안내합니다.

## 📋 필요한 환경변수 목록

### 1. Supabase 설정 (필수)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**설정 방법:**
1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. 프로젝트 설정 → API → Project URL 복사
3. API Keys에서 `anon public` 키 복사
4. `service_role` 키 복사 (주의: 이 키는 서버에서만 사용)

### 2. YouTube API 설정 (필수)
```env
NEXT_PUBLIC_YOUTUBE_CLIENT_ID=your_youtube_oauth_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_oauth_client_secret
NEXT_PUBLIC_YOUTUBE_REDIRECT_URI=http://localhost:3000/auth/youtube/callback
```

**설정 방법:**
1. [Google Cloud Console](https://console.cloud.google.com)에서 프로젝트 생성
2. API 및 서비스 → 라이브러리에서 다음 API 활성화:
   - YouTube Data API v3
   - YouTube Analytics API
3. 사용자 인증 정보 → OAuth 2.0 클라이언트 ID 생성
4. 승인된 리디렉션 URI에 `http://localhost:3000/auth/youtube/callback` 추가
5. 클라이언트 ID와 클라이언트 시크릿 복사

### 3. NextAuth 설정 (필수)
```env
NEXTAUTH_SECRET=your_nextauth_secret_key_here
NEXTAUTH_URL=http://localhost:3000
```

**설정 방법:**
1. `NEXTAUTH_SECRET`: 32자 이상의 랜덤 문자열 생성
   ```bash
   openssl rand -base64 32
   ```
2. `NEXTAUTH_URL`: 개발 환경에서는 `http://localhost:3000`

## 🚀 설정 단계

### 1. 환경변수 파일 생성
```bash
cp .env.example .env.local
```

### 2. 각 서비스 설정

#### Supabase 설정
1. [Supabase 대시보드](https://app.supabase.com) 접속
2. 새 프로젝트 생성
3. 프로젝트 설정 → API에서 키들 복사
4. `.env.local`에 입력

#### YouTube API 설정
1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. API 및 서비스 → 라이브러리
4. "YouTube Data API v3" 검색 후 활성화
5. "YouTube Analytics API" 검색 후 활성화
6. 사용자 인증 정보 → OAuth 2.0 클라이언트 ID 생성
7. 애플리케이션 유형: "웹 애플리케이션"
8. 승인된 리디렉션 URI 추가:
   - `http://localhost:3000/auth/youtube/callback`
   - 프로덕션: `https://your-domain.com/auth/youtube/callback`
9. 클라이언트 ID와 시크릿을 `.env.local`에 입력

### 3. 프로덕션 배포 시 변경사항
```env
# 프로덕션 환경
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_YOUTUBE_REDIRECT_URI=https://your-domain.com/auth/youtube/callback
```

## 🔍 환경변수 확인

설정이 완료되면 다음 명령어로 확인할 수 있습니다:

```bash
# 개발 서버 실행
bun dev

# 브라우저에서 http://localhost:3000 접속
# 로그인 후 YouTube 연결 테스트
```

## ⚠️ 주의사항

1. **보안**: `.env.local` 파일은 절대 Git에 커밋하지 마세요
2. **키 관리**: `SUPABASE_SERVICE_ROLE_KEY`는 서버에서만 사용
3. **도메인**: 프로덕션 배포 시 리디렉션 URI 도메인 변경 필요
4. **권한**: YouTube API 권한은 필요한 최소한만 요청

## 🆘 문제 해결

### YouTube 연결 오류
- OAuth 클라이언트 ID가 올바른지 확인
- 리디렉션 URI가 정확한지 확인
- YouTube API가 활성화되었는지 확인

### Supabase 연결 오류
- 프로젝트 URL이 올바른지 확인
- API 키가 정확한지 확인
- 프로젝트가 활성 상태인지 확인

### NextAuth 오류
- `NEXTAUTH_SECRET`이 32자 이상인지 확인
- `NEXTAUTH_URL`이 올바른지 확인
