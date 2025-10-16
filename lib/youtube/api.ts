import { 
  YouTubeChannel, 
  YouTubeVideo, 
  YouTubeAnalytics, 
  YouTubeAnalyticsData,
  YouTubeError 
} from './types';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const YOUTUBE_ANALYTICS_API_BASE = 'https://youtubeanalytics.googleapis.com/v2';

export class YouTubeAPI {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async makeRequest<T>(url: string, params: Record<string, string> = {}): Promise<T> {
    const searchParams = new URLSearchParams(params);

    const response = await fetch(`${url}?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        try {
          // 토큰이 만료된 경우 갱신 시도
          await this.refreshToken();
          // 갱신된 토큰으로 재시도
          const retryResponse = await fetch(`${url}?${searchParams}`, {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Accept': 'application/json',
            },
          });
          
          if (!retryResponse.ok) {
            const errorText = await retryResponse.text();
            console.error('YouTube API 재시도 실패:', {
              status: retryResponse.status,
              statusText: retryResponse.statusText,
              error: errorText
            });
            throw new Error(`YouTube API 재시도 실패 (${retryResponse.status}): ${errorText}`);
          }
          
          return retryResponse.json();
        } catch (refreshError) {
          console.error('토큰 갱신 실패:', refreshError);
          throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
        }
      }
      
      const errorText = await response.text();
      console.error('YouTube API 오류:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url: url,
        params: params
      });
      
      try {
        const error: YouTubeError = JSON.parse(errorText);
        throw new Error(`YouTube API Error: ${error.error?.message || errorText}`);
      } catch {
        throw new Error(`YouTube API Error (${response.status}): ${errorText}`);
      }
    }

    return response.json();
  }

  // 토큰 갱신 (서버 API 사용)
  private async refreshToken(): Promise<void> {
    const refreshToken = localStorage.getItem('youtube_refresh_token');
    if (!refreshToken) {
      throw new Error('Refresh token이 없습니다. 다시 로그인해주세요.');
    }

    try {
      const response = await fetch('/api/auth/youtube/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        throw new Error('토큰 갱신에 실패했습니다.');
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      localStorage.setItem('youtube_access_token', data.access_token);
      
      // 새로운 refresh token이 있으면 저장
      if (data.refresh_token) {
        localStorage.setItem('youtube_refresh_token', data.refresh_token);
      }
    } catch (error) {
      console.error('토큰 갱신 실패:', error);
      throw new Error('토큰 갱신에 실패했습니다. 다시 로그인해주세요.');
    }
  }

  // 채널 정보 가져오기
  async getChannelInfo(channelId?: string): Promise<YouTubeChannel> {
    const params = {
      part: 'snippet,statistics,brandingSettings',
      mine: channelId ? 'false' : 'true',
      ...(channelId && { id: channelId }),
    };

    const response = await this.makeRequest<{
      items: Array<{
        id: string;
        snippet: any;
        statistics: any;
        brandingSettings: any;
      }>;
    }>(`${YOUTUBE_API_BASE}/channels`, params);

    if (!response.items || response.items.length === 0) {
      throw new Error('채널을 찾을 수 없습니다.');
    }

    const channel = response.items[0];
    return {
      id: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
      customUrl: channel.snippet.customUrl || '',
      publishedAt: channel.snippet.publishedAt,
      thumbnails: channel.snippet.thumbnails,
      statistics: {
        viewCount: channel.statistics.viewCount || '0',
        subscriberCount: channel.statistics.subscriberCount || '0',
        videoCount: channel.statistics.videoCount || '0',
      },
      brandingSettings: channel.brandingSettings,
    };
  }

  // 비디오 목록 가져오기 (2단계 과정)
  async getVideos(channelId?: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
    try {
      // 1단계: /search API로 비디오 ID 목록 가져오기
      const searchParams = {
        part: 'snippet',
        forMine: 'true', // 인증된 사용자의 비디오만 가져오기
        type: 'video',
        maxResults: maxResults.toString(),
        order: 'date',
      };

      const searchResponse = await this.makeRequest<{
        items: Array<{
          id: { videoId: string };
          snippet: any;
        }>;
      }>(`${YOUTUBE_API_BASE}/search`, searchParams);

      if (!searchResponse.items || searchResponse.items.length === 0) {
        console.log('사용자의 비디오가 없습니다.');
        return [];
      }

      // 2단계: 비디오 ID들을 콤마로 구분하여 /videos API로 상세 정보 가져오기
      const videoIds = searchResponse.items.map(item => item.id.videoId).join(',');
      
      const videoParams = {
        part: 'snippet,statistics,status',
        id: videoIds,
      };

      const videoResponse = await this.makeRequest<{
        items: Array<{
          id: string;
          snippet: any;
          statistics: any;
          status: any;
        }>;
      }>(`${YOUTUBE_API_BASE}/videos`, videoParams);

      if (!videoResponse.items || videoResponse.items.length === 0) {
        return [];
      }

      return videoResponse.items.map(video => ({
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        publishedAt: video.snippet.publishedAt,
        thumbnails: video.snippet.thumbnails,
        statistics: {
          viewCount: video.statistics?.viewCount || '0',
          likeCount: video.statistics?.likeCount || '0',
          commentCount: video.statistics?.commentCount || '0',
        },
        status: {
          privacyStatus: video.status?.privacyStatus || 'private',
          uploadStatus: video.status?.uploadStatus || 'processed',
        },
        snippet: {
          channelId: video.snippet.channelId,
          channelTitle: video.snippet.channelTitle,
          categoryId: video.snippet.categoryId,
          tags: video.snippet.tags || [],
        },
      }));
    } catch (error) {
      console.error('비디오 목록 가져오기 실패:', error);
      // 할당량 초과 시 빈 배열 반환
      return [];
    }
  }

  // 비디오 상세 정보 가져오기
  async getVideoDetails(videoId: string): Promise<YouTubeVideo> {
    const response = await this.makeRequest<{
      items: Array<{
        id: string;
        snippet: any;
        statistics: any;
        status: any;
      }>;
    }>(`${YOUTUBE_API_BASE}/videos`, {
      part: 'snippet,statistics,status',
      id: videoId,
    });

    if (!response.items || response.items.length === 0) {
      throw new Error('비디오를 찾을 수 없습니다.');
    }

    const video = response.items[0];
    return {
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      publishedAt: video.snippet.publishedAt,
      thumbnails: video.snippet.thumbnails,
      statistics: {
        viewCount: video.statistics?.viewCount || '0',
        likeCount: video.statistics?.likeCount || '0',
        commentCount: video.statistics?.commentCount || '0',
      },
      status: {
        privacyStatus: video.status?.privacyStatus || 'private',
        uploadStatus: video.status?.uploadStatus || 'processed',
      },
      snippet: {
        channelId: video.snippet.channelId,
        channelTitle: video.snippet.channelTitle,
        categoryId: video.snippet.categoryId,
        tags: video.snippet.tags || [],
      },
    };
  }

  // 채널 분석 데이터 가져오기
  async getChannelAnalytics(
    channelId: string,
    startDate: string,
    endDate: string
  ): Promise<YouTubeAnalytics> {
    const params = {
      ids: `channel==${channelId}`,
      startDate,
      endDate,
      metrics: 'views,estimatedMinutesWatched,averageViewDuration,subscribersGained,subscribersLost,likes,dislikes,comments,shares,estimatedRevenue,cpm,impressions,impressionsClickable',
    };

    const response = await this.makeRequest<{
      rows: number[][];
    }>(`${YOUTUBE_ANALYTICS_API_BASE}/reports`, params);

    if (!response.rows || response.rows.length === 0) {
      return {
        views: 0,
        estimatedMinutesWatched: 0,
        averageViewDuration: '0:00',
        subscribersGained: 0,
        subscribersLost: 0,
        likes: 0,
        dislikes: 0,
        comments: 0,
        shares: 0,
        estimatedRevenue: 0,
        cpm: 0,
        ctr: 0,
        impressions: 0,
        impressionsClickable: 0,
      };
    }

    const row = response.rows[0];
    return {
      views: row[0] || 0,
      estimatedMinutesWatched: row[1] || 0,
      averageViewDuration: this.formatDuration(row[2] || 0),
      subscribersGained: row[3] || 0,
      subscribersLost: row[4] || 0,
      likes: row[5] || 0,
      dislikes: row[6] || 0,
      comments: row[7] || 0,
      shares: row[8] || 0,
      estimatedRevenue: row[9] || 0,
      cpm: row[10] || 0,
      ctr: 0, // CTR은 지원되지 않으므로 0으로 설정
      impressions: row[11] || 0,
      impressionsClickable: row[12] || 0,
    };
  }

  // 일별 분석 데이터 가져오기
  async getDailyAnalytics(
    channelId: string,
    startDate: string,
    endDate: string
  ): Promise<YouTubeAnalyticsData[]> {
    const params = {
      ids: `channel==${channelId}`,
      startDate,
      endDate,
      dimensions: 'day',
      metrics: 'views,estimatedMinutesWatched,averageViewDuration,subscribersGained,subscribersLost,likes,dislikes,comments,shares,estimatedRevenue',
    };

    const response = await this.makeRequest<{
      rows: Array<[string, ...number[]]>;
    }>(`${YOUTUBE_ANALYTICS_API_BASE}/reports`, params);

    if (!response.rows) {
      return [];
    }

    return response.rows.map(row => ({
      date: row[0],
      views: row[1] || 0,
      estimatedMinutesWatched: row[2] || 0,
      averageViewDuration: row[3] || 0,
      subscribersGained: row[4] || 0,
      subscribersLost: row[5] || 0,
      likes: row[6] || 0,
      dislikes: row[7] || 0,
      comments: row[8] || 0,
      shares: row[9] || 0,
      estimatedRevenue: row[10] || 0,
    }));
  }

  // 비디오 분석 데이터 가져오기
  async getVideoAnalytics(
    videoId: string,
    startDate: string,
    endDate: string
  ): Promise<YouTubeAnalytics> {
    const params = {
      ids: `video==${videoId}`,
      startDate,
      endDate,
      metrics: 'views,estimatedMinutesWatched,averageViewDuration,likes,dislikes,comments,shares,estimatedRevenue',
    };

    const response = await this.makeRequest<{
      rows: number[][];
    }>(`${YOUTUBE_ANALYTICS_API_BASE}/reports`, params);

    if (!response.rows || response.rows.length === 0) {
      return {
        views: 0,
        estimatedMinutesWatched: 0,
        averageViewDuration: '0:00',
        subscribersGained: 0,
        subscribersLost: 0,
        likes: 0,
        dislikes: 0,
        comments: 0,
        shares: 0,
        estimatedRevenue: 0,
        cpm: 0,
        ctr: 0,
        impressions: 0,
        impressionsClickable: 0,
      };
    }

    const row = response.rows[0];
    return {
      views: row[0] || 0,
      estimatedMinutesWatched: row[1] || 0,
      averageViewDuration: this.formatDuration(row[2] || 0),
      subscribersGained: 0,
      subscribersLost: 0,
      likes: row[3] || 0,
      dislikes: row[4] || 0,
      comments: row[5] || 0,
      shares: row[6] || 0,
      estimatedRevenue: row[7] || 0,
      cpm: 0,
      ctr: 0,
      impressions: 0,
      impressionsClickable: 0,
    };
  }

  // 시간을 포맷팅하는 헬퍼 함수
  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}
