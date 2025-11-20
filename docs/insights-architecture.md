## Insights API 분리 설계

### 1. Engagement Insights (`/api/insights/engagement`)
- **데이터 소스**: `YouTubeAPI.getChannelAnalytics`, `getVideoAnalytics`
- **주요 지표**
  - 시청 및 유지율: `views`, `estimatedMinutesWatched`, `averageViewDuration`
  - 참여도: `likes`, `dislikes`, `comments`, `shares`
  - 구독자 변화: `subscribersGained`, `subscribersLost`
  - 매출: `estimatedRevenue`, `cpm`
- **타입 정의**
  ```ts
  interface EngagementInsightsPayload {
    channelId: string;
    startDate: string;
    endDate: string;
  }

  interface EngagementInsightsResponse {
    summary: YouTubeAnalytics;
    topVideos: Array<{
      videoId: string;
      title: string;
      engagementScore: number;
    }>;
  }
  ```
- **에러 처리**
  - 401: 토큰 만료 → `YouTubeAPI`에서 refresh 후 재시도, 실패 시 401 응답
  - 403(quotaExceeded): 사용자 친화 메시지 반환
  - 기타: `YouTube API Error (${status})` 형태로 전달

### 2. Reach Insights (`/api/insights/reach`)
- **데이터 소스**: `YouTubeAPI.getChannelReachAnalytics`
- **주요 지표**
  - 노출수(`impressions`), CTR(`impressionsCtr`)
  - 노출 대비 시청자 비율(`impressionsViewerPercentage`)
  - 일별 추이(`YouTubeReachAnalyticsRow[]`)
- **타입 정의**
  ```ts
  interface ReachInsightsPayload {
    channelId: string;
    startDate: string;
    endDate: string;
  }

  interface ReachInsightsResponse {
    reach: YouTubeReachAnalytics;
    topTrafficSources?: Array<{
      source: string;
      impressions: number;
      ctr: number;
    }>;
  }
  ```
- **에러 처리**
  - `Unknown identifier` 같은 파라미터 오류 감지 시 metrics/dimensions 재검증 후 400 반환
  - 네트워크 오류(`fetch failed`, `ECONNREFUSED`) → 503 + 재시도 안내

### 3. 프런트엔드 활용 시나리오
| 페이지 | 사용 Endpoint | 설명 |
| --- | --- | --- |
| Dashboard | `/api/insights/engagement` | 인사이트 카드, Action Box |
| Dashboard (Reach Card) | `/api/insights/reach` | 노출/CTR 추이, 업로드 추천 타이밍 |
| Content Analysis | 두 API 모두 | 영상별 문제 분석 및 액션 플랜 |

### 4. 구현 순서
1. `lib/youtube/api.ts`에 Reach 계열 메서드 추가 (완료)
2. `/api/insights/engagement`와 `/api/insights/reach` API Route 분리
3. 클라이언트 훅(`useYouTube`)에서 Reach 데이터 캐싱
4. UI 컴포넌트에 Reach 카드/그래프 추가

이 구조로 Engagement/Reach 책임을 분리하면 API 오류 범위를 명확히 하고, 노출 관련 지표가 필요한 컴포넌트만 별도 호출하여 할당량을 효율적으로 사용할 수 있습니다.

