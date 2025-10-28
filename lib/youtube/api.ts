import { 
  YouTubeChannel, 
  YouTubeVideo, 
  YouTubeAnalytics, 
  YouTubeAnalyticsData,
  YouTubeError 
} from './types';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const YOUTUBE_ANALYTICS_API_BASE = 'https://youtubeanalytics.googleapis.com/v2';

// YouTube API 응답 타입 정의
interface YouTubeSnippet {
  title: string;
  description: string;
  publishedAt: string;
  customUrl?: string;
  thumbnails: {
    default: { url: string; width: number; height: number };
    medium: { url: string; width: number; height: number };
    high: { url: string; width: number; height: number };
  };
  channelId: string;
  channelTitle: string;
  categoryId: string;
  tags?: string[];
}

interface YouTubeStatistics {
  viewCount: string;
  likeCount: string;
  commentCount: string;
  subscriberCount?: string;
  videoCount?: string;
}

interface YouTubeStatus {
  privacyStatus: 'public' | 'private' | 'unlisted';
  uploadStatus: 'processed' | 'uploaded' | 'failed';
}

interface YouTubeBrandingSettings {
  channel?: {
    title: string;
    description: string;
    keywords: string;
  };
  image?: {
    bannerExternalUrl: string;
  };
}

export class YouTubeAPI {
  private accessToken: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30분 캐시 (할당량 절약)
  private readonly CHANNEL_CACHE_DURATION = 60 * 60 * 1000; // 채널 정보는 1시간 캐시
  private readonly VIDEOS_CACHE_DURATION = 15 * 60 * 1000; // 비디오 목록은 15분 캐시
  private readonly PERSISTENT_CACHE_PREFIX = 'youtube_cache_';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
    this.loadPersistentCache();
  }

  // 영구 캐시 로드 (localStorage에서)
  private loadPersistentCache(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(this.PERSISTENT_CACHE_PREFIX));
      keys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          this.cache.set(key.replace(this.PERSISTENT_CACHE_PREFIX, ''), parsed);
        }
      });
      console.log(`영구 캐시 로드 완료: ${keys.length}개 항목`);
    } catch (error) {
      console.error('영구 캐시 로드 실패:', error);
    }
  }

  // 영구 캐시 저장 (localStorage에)
  private saveToPersistentCache(key: string, data: any): void {
    try {
      const persistentKey = this.PERSISTENT_CACHE_PREFIX + key;
      localStorage.setItem(persistentKey, JSON.stringify(data));
    } catch (error) {
      console.error('영구 캐시 저장 실패:', error);
    }
  }

  // 캐시에서 데이터 가져오기 (커스텀 캐시 시간 지원)
  private getFromCache<T>(key: string, customDuration?: number): T | null {
    const cached = this.cache.get(key);
    const duration = customDuration || this.CACHE_DURATION;
    
    if (cached && Date.now() - cached.timestamp < duration) {
      console.log(`캐시에서 데이터 로드: ${key}`);
      return cached.data as T;
    }
    
    if (cached) {
      console.log(`캐시 만료: ${key}`);
      this.cache.delete(key);
    }
    
    return null;
  }

  // 캐시에 데이터 저장 (영구 캐시도 함께 저장)
  private setCache<T>(key: string, data: T): void {
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    
    this.cache.set(key, cacheData);
    this.saveToPersistentCache(key, cacheData);
  }

  // 캐시 클리어 (영구 캐시도 함께 클리어)
  public clearCache(): void {
    this.cache.clear();
    
    // localStorage에서도 캐시 제거
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(this.PERSISTENT_CACHE_PREFIX));
      keys.forEach(key => localStorage.removeItem(key));
      console.log('영구 캐시 클리어 완료');
    } catch (error) {
      console.error('영구 캐시 클리어 실패:', error);
    }
  }

  private async makeRequest<T>(url: string, params: Record<string, string> = {}): Promise<T> {
    const searchParams = new URLSearchParams(params);

    try {
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
        
        // 할당량 초과 처리
        if (response.status === 403) {
          const errorData = await response.json().catch(() => ({}));
          if (errorData.error?.errors?.[0]?.reason === 'quotaExceeded') {
            throw new Error('YouTube API 할당량이 초과되었습니다. 잠시 후 다시 시도해주세요.');
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
    } catch (error) {
      console.error('YouTube API 요청 실패:', error);
      throw error;
    }
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

  // 채널 정보 가져오기 (1시간 캐시)
  async getChannelInfo(channelId?: string): Promise<YouTubeChannel> {
    const cacheKey = `channel_${channelId || 'mine'}`;
    
    // 캐시에서 데이터 확인
    const cachedData = this.getFromCache<YouTubeChannel>(cacheKey, this.CHANNEL_CACHE_DURATION);
    if (cachedData) {
      return cachedData;
    }

    const params = {
      part: 'snippet,statistics,brandingSettings',
      mine: channelId ? 'false' : 'true',
      ...(channelId && { id: channelId }),
    };

    const response = await this.makeRequest<{
      items: Array<{
        id: string;
        snippet: YouTubeSnippet;
        statistics: YouTubeStatistics;
        brandingSettings: YouTubeBrandingSettings;
      }>;
    }>(`${YOUTUBE_API_BASE}/channels`, params);

    if (!response.items || response.items.length === 0) {
      throw new Error('채널을 찾을 수 없습니다.');
    }

    const channel = response.items[0];
    const channelData = {
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
      brandingSettings: {
        channel: channel.brandingSettings?.channel || {
          title: '',
          description: '',
          keywords: '',
        },
      },
    };

    // 캐시에 저장
    this.setCache(cacheKey, channelData);
    console.log('채널 데이터를 캐시에 저장');
    
    return channelData;
  }

  // 비디오 목록 가져오기 (15분 캐시)
  async getVideos(channelId?: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
    const cacheKey = `videos_${maxResults}`;
    
    // 캐시에서 데이터 확인
    const cachedData = this.getFromCache<YouTubeVideo[]>(cacheKey, this.VIDEOS_CACHE_DURATION);
    if (cachedData) {
      return cachedData;
    }

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
          snippet: YouTubeSnippet;
        }>;
      }>(`${YOUTUBE_API_BASE}/search`, searchParams);

      if (!searchResponse.items || searchResponse.items.length === 0) {
        console.log('사용자의 비디오가 없습니다.');
        return [];
      }

      // 2단계: videos().list 메서드 사용하여 통계 정보 가져오기
      const videoIds = searchResponse.items.map(item => item.id.videoId).join(',');
      
      const videoParams = {
        part: 'snippet,statistics,status,contentDetails',
        id: videoIds,
      };

      const videoResponse = await this.makeRequest<{
        items: Array<{
          id: string;
          snippet: YouTubeSnippet;
          statistics: YouTubeStatistics;
          status: YouTubeStatus;
          contentDetails: {
            duration: string;
          };
        }>;
      }>(`${YOUTUBE_API_BASE}/videos`, videoParams);

      if (!videoResponse.items || videoResponse.items.length === 0) {
        return [];
      }

      const videos = videoResponse.items.map(video => ({
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        publishedAt: video.snippet.publishedAt,
        thumbnails: video.snippet.thumbnails,
        duration: video.contentDetails?.duration || 'PT0S',
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

      // 캐시에 저장
      this.setCache(cacheKey, videos);
      console.log('비디오 데이터를 캐시에 저장');

      return videos;
    } catch (error) {
      console.error('비디오 목록 가져오기 실패:', error);
      // 할당량 초과 시 빈 배열 반환
      return [];
    }
  }

  // 특정 비디오의 통계 정보만 가져오기 (최적화된 버전)
  async getVideoStatistics(videoId: string): Promise<{ viewCount: number; likeCount: number; commentCount: number }> {
    try {
      const response = await this.makeRequest<{
        items: Array<{
          id: string;
          statistics: YouTubeStatistics;
        }>;
      }>(`${YOUTUBE_API_BASE}/videos`, {
        part: 'statistics',
        id: videoId,
      });

      if (!response.items || response.items.length === 0) {
        throw new Error('비디오를 찾을 수 없습니다.');
      }

      const stats = response.items[0].statistics;
      return {
        viewCount: parseInt(stats.viewCount || '0'),
        likeCount: parseInt(stats.likeCount || '0'),
        commentCount: parseInt(stats.commentCount || '0'),
      };
    } catch (error) {
      console.error('비디오 통계 가져오기 실패:', error);
      return { viewCount: 0, likeCount: 0, commentCount: 0 };
    }
  }

  // 여러 비디오의 통계 정보를 한 번에 가져오기 (배치 처리)
  async getMultipleVideoStatistics(videoIds: string[]): Promise<Array<{ id: string; viewCount: number; likeCount: number; commentCount: number }>> {
    try {
      // YouTube API는 최대 50개 비디오까지 한 번에 처리 가능
      const batchSize = 50;
      const results: Array<{ id: string; viewCount: number; likeCount: number; commentCount: number }> = [];

      for (let i = 0; i < videoIds.length; i += batchSize) {
        const batch = videoIds.slice(i, i + batchSize);
        const videoIdsString = batch.join(',');

        const response = await this.makeRequest<{
          items: Array<{
            id: string;
            statistics: YouTubeStatistics;
          }>;
        }>(`${YOUTUBE_API_BASE}/videos`, {
          part: 'statistics',
          id: videoIdsString,
        });

        if (response.items) {
          const batchResults = response.items.map(video => ({
            id: video.id,
            viewCount: parseInt(video.statistics.viewCount || '0'),
            likeCount: parseInt(video.statistics.likeCount || '0'),
            commentCount: parseInt(video.statistics.commentCount || '0'),
          }));
          results.push(...batchResults);
        }
      }

      return results;
    } catch (error) {
      console.error('다중 비디오 통계 가져오기 실패:', error);
      return [];
    }
  }

  // 비디오 상세 정보 가져오기
  async getVideoDetails(videoId: string): Promise<YouTubeVideo> {
    const response = await this.makeRequest<{
      items: Array<{
        id: string;
        snippet: unknown;
        statistics: unknown;
        status: unknown;
        contentDetails: unknown;
      }>;
    }>(`${YOUTUBE_API_BASE}/videos`, {
      part: 'snippet,statistics,status,contentDetails',
      id: videoId,
    });

    if (!response.items || response.items.length === 0) {
      throw new Error('비디오를 찾을 수 없습니다.');
    }

    const video = response.items[0];
    return {
      id: video.id,
      title: (video.snippet as { title: string }).title,
      description: (video.snippet as { description: string }).description,
      publishedAt: (video.snippet as { publishedAt: string }).publishedAt,
      duration: (video.contentDetails as { duration: string })?.duration || 'PT0S',
      thumbnails: (video.snippet as { thumbnails: { default: { url: string; width: number; height: number }, medium: { url: string; width: number; height: number }, high: { url: string; width: number; height: number } } }).thumbnails,
      statistics: {
        viewCount: (video.statistics as { viewCount: string }).viewCount || '0',
        likeCount: (video.statistics as { likeCount: string }).likeCount || '0',
        commentCount: (video.statistics as { commentCount: string }).commentCount || '0',
      },
      status: {
        privacyStatus: (video.status as { privacyStatus: 'public' | 'private' | 'unlisted' }).privacyStatus || 'private',
        uploadStatus: (video.status as { uploadStatus: 'processed' | 'uploaded' | 'failed' }).uploadStatus || 'processed',
      },
      snippet: {
        channelId: (video.snippet as { channelId: string }).channelId,
        channelTitle: (video.snippet as { channelTitle: string }).channelTitle,
        categoryId: (video.snippet as { categoryId: string }).categoryId,
        tags: (video.snippet as { tags: string[] }).tags || [],
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
