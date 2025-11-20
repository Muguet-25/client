import { 
  YouTubeChannel, 
  YouTubeVideo, 
  YouTubeAnalytics, 
  YouTubeAnalyticsData,
  YouTubeAgeGroupData,
  YouTubeError,
  YouTubeReachAnalytics,
  YouTubeReachAnalyticsRow
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
  private readonly VIDEOS_CACHE_DURATION = 5 * 60 * 1000; // 비디오 목록은 5분 캐시
  private readonly PERSISTENT_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // localStorage 캐시는 7일
  private readonly PERSISTENT_CACHE_PREFIX = 'youtube_cache_';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
    this.loadPersistentCache();
  }

  // 영구 캐시 로드 (localStorage에서) - 브라우저 환경에서만
  private loadPersistentCache(): void {
    // 서버 사이드에서는 localStorage가 없으므로 스킵
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(this.PERSISTENT_CACHE_PREFIX));
      let loadedCount = 0;
      keys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            // persistentExpiresAt이 있고 만료되었으면 스킵
            if (parsed.persistentExpiresAt && Date.now() >= parsed.persistentExpiresAt) {
              // 만료된 캐시는 삭제하지 않고 그냥 스킵 (할당량 초과 시 사용할 수 있도록)
              return;
            }
            // 메모리 캐시에 복원 (persistentExpiresAt은 제외)
            const cacheKey = key.replace(this.PERSISTENT_CACHE_PREFIX, '');
            this.cache.set(cacheKey, {
              data: parsed.data,
              timestamp: parsed.timestamp
            });
            loadedCount++;
          } catch (parseError) {
            console.error(`캐시 파싱 실패: ${key}`, parseError);
          }
        }
      });
      console.log(`영구 캐시 로드 완료: ${loadedCount}개 항목`);
    } catch (error) {
      console.error('영구 캐시 로드 실패:', error);
    }
  }

  // 영구 캐시 저장 (localStorage에) - 브라우저 환경에서만
  private saveToPersistentCache(key: string, data: any): void {
    // 서버 사이드에서는 localStorage가 없으므로 스킵
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    
    try {
      const persistentKey = this.PERSISTENT_CACHE_PREFIX + key;
      // localStorage에는 7일 만료 시간을 포함하여 저장
      const persistentData = {
        ...data,
        persistentExpiresAt: Date.now() + this.PERSISTENT_CACHE_DURATION
      };
      localStorage.setItem(persistentKey, JSON.stringify(persistentData));
    } catch (error) {
      console.error('영구 캐시 저장 실패:', error);
    }
  }

  // 캐시에서 데이터 가져오기 (커스텀 캐시 시간 지원)
  private getFromCache<T>(key: string, customDuration?: number, allowExpired: boolean = false): T | null {
    const cached = this.cache.get(key);
    const duration = customDuration || this.CACHE_DURATION;
    
    if (cached) {
      const isExpired = Date.now() - cached.timestamp >= duration;
      
      if (!isExpired) {
        console.log(`캐시에서 데이터 로드: ${key}`);
        return cached.data as T;
      }
      
      // 만료되었지만 allowExpired가 true면 반환
      if (allowExpired) {
        console.log(`만료된 캐시 사용 (할당량 초과): ${key}`);
        return cached.data as T;
      }
      
      console.log(`캐시 만료: ${key}`);
      this.cache.delete(key);
    }
    
    return null;
  }

  // localStorage에서 만료된 캐시도 포함하여 가져오기 (할당량 초과 시 사용)
  private getFromPersistentCache<T>(key: string, allowExpired: boolean = false): T | null {
    // 서버 사이드에서는 localStorage가 없으므로 스킵
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return null;
    }
    
    try {
      const persistentKey = this.PERSISTENT_CACHE_PREFIX + key;
      const data = localStorage.getItem(persistentKey);
      
      if (!data) {
        return null;
      }
      
      const parsed = JSON.parse(data);
      const persistentExpiresAt = parsed.persistentExpiresAt;
      
      // 만료 시간 체크
      if (persistentExpiresAt) {
        const isExpired = Date.now() >= persistentExpiresAt;
        
        if (!isExpired) {
          console.log(`localStorage 캐시에서 데이터 로드: ${key}`);
          // 메모리 캐시에도 복원
          this.cache.set(key, {
            data: parsed.data,
            timestamp: parsed.timestamp
          });
          return parsed.data as T;
        }
        
        // 만료되었지만 allowExpired가 true면 반환
        if (allowExpired) {
          console.log(`만료된 localStorage 캐시 사용 (할당량 초과): ${key}`);
          // 메모리 캐시에도 복원
          this.cache.set(key, {
            data: parsed.data,
            timestamp: parsed.timestamp
          });
          return parsed.data as T;
        }
        
        // 만료되었고 allowExpired가 false면 삭제
        localStorage.removeItem(persistentKey);
        return null;
      }
      
      // 구버전 캐시 (persistentExpiresAt이 없음) - 호환성 유지
      if (parsed.data) {
        console.log(`localStorage 캐시에서 데이터 로드 (구버전): ${key}`);
        this.cache.set(key, {
          data: parsed.data,
          timestamp: parsed.timestamp
        });
        return parsed.data as T;
      }
      
      return null;
    } catch (error) {
      console.error('localStorage 캐시 로드 실패:', error);
      return null;
    }
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
    
    // localStorage에서도 캐시 제거 (브라우저 환경에서만)
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const keys = Object.keys(localStorage).filter(key => key.startsWith(this.PERSISTENT_CACHE_PREFIX));
        keys.forEach(key => localStorage.removeItem(key));
        console.log('영구 캐시 클리어 완료');
      } catch (error) {
        console.error('영구 캐시 클리어 실패:', error);
      }
    }
  }

  // 비디오 목록 캐시만 무효화 (예약 완료 시 즉시 반영을 위해)
  public invalidateVideosCache(): void {
    const keysToDelete: string[] = [];
    this.cache.forEach((value, key) => {
      if (key.startsWith('videos_')) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      // localStorage에서도 제거 (브라우저 환경에서만)
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        try {
          const persistentKey = this.PERSISTENT_CACHE_PREFIX + key;
          localStorage.removeItem(persistentKey);
        } catch (error) {
          console.error('비디오 캐시 제거 실패:', error);
        }
      }
    });
    
    if (keysToDelete.length > 0) {
      console.log(`비디오 목록 캐시 무효화 완료: ${keysToDelete.length}개 항목`);
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
        
        // 에러 응답 body를 한 번만 읽기
        let errorText: string;
        let errorData: any = {};
        
        try {
          // 먼저 텍스트로 읽기
          errorText = await response.text();
          // JSON 파싱 시도
          try {
            errorData = JSON.parse(errorText);
          } catch {
            // JSON이 아니면 그냥 텍스트로 사용
          }
        } catch (readError) {
          errorText = '응답을 읽을 수 없습니다.';
        }
        
        // 할당량 초과 처리 - 특별한 에러 타입으로 throw하여 각 메서드에서 캐시 fallback 처리 가능하도록
        if (response.status === 403 && errorData.error?.errors?.[0]?.reason === 'quotaExceeded') {
          const quotaError = new Error('YouTube API 할당량이 초과되었습니다.');
          (quotaError as any).isQuotaExceeded = true;
          throw quotaError;
        }
        
        // 예상 가능한 오류(403, 500)는 warn 레벨로, 그 외는 error 레벨로
        const errorMessage = errorData.error?.message || errorText;
        const isExpectedError = response.status === 403 || response.status === 500;
        
        if (isExpectedError) {
          // 예상 가능한 오류는 간결하게 로깅 (fallback이 처리할 예정)
          console.warn(`YouTube API ${response.status} 오류: ${errorMessage}`);
        } else {
          // 예상치 못한 오류는 상세하게 로깅
        }
        
        // JSON 파싱 성공 시 구조화된 에러 메시지 사용
        if (errorData.error?.message) {
          const apiError = new Error(`YouTube API Error: ${errorData.error.message}`);
          (apiError as any).statusCode = response.status;
          throw apiError;
        }
        
        const genericError = new Error(`YouTube API Error (${response.status}): ${errorText}`);
        (genericError as any).statusCode = response.status;
        throw genericError;
      }

      return response.json();
    } catch (error: any) {
      // 이미 makeRequest에서 로깅했으므로, 네트워크 오류나 예상치 못한 오류만 다시 로깅
      if (error instanceof TypeError && error.message.includes('fetch failed')) {
        console.error('YouTube API 네트워크 오류:', error);
      } else if (!error?.statusCode) {
        // statusCode가 없는 경우만 로깅 (이미 로깅된 에러는 제외)
        console.error('YouTube API 요청 실패:', error);
      }
      
      // 네트워크 오류에 대한 더 명확한 메시지
      if (error instanceof TypeError && error.message.includes('fetch failed')) {
        const cause = (error as any).cause;
        if (cause?.code === 'ECONNREFUSED') {
          throw new Error('YouTube API에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
        }
        throw new Error(`YouTube API 요청 실패: ${error.message}`);
      }
      
      throw error;
    }
  }

  // 토큰 갱신 (서버 API 사용)
  private async refreshToken(): Promise<void> {
    // 서버 사이드에서는 토큰 갱신을 지원하지 않음
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      throw new Error('서버 사이드에서는 토큰 갱신을 지원하지 않습니다.');
    }
    
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

    try {
      // channelId가 있으면 id만 사용, 없으면 mine만 사용 (동시 사용 불가)
      const params: Record<string, string> = {
        part: 'snippet,statistics,brandingSettings',
      };
      
      if (channelId) {
        params.id = channelId;
      } else {
        params.mine = 'true';
      }

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
    } catch (error: any) {
      // 할당량 초과 시 만료된 캐시 사용
      if (error?.isQuotaExceeded) {
        console.warn('할당량 초과 - 만료된 캐시에서 데이터 로드 시도');
        const expiredCache = this.getFromCache<YouTubeChannel>(cacheKey, this.CHANNEL_CACHE_DURATION, true);
        if (expiredCache) {
          return expiredCache;
        }
        const persistentCache = this.getFromPersistentCache<YouTubeChannel>(cacheKey, true);
        if (persistentCache) {
          return persistentCache;
        }
      }
      throw error;
    }
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
    } catch (error: any) {
      // 할당량 초과 시 만료된 캐시 사용
      if (error?.isQuotaExceeded) {
        console.warn('할당량 초과 - 만료된 캐시에서 데이터 로드 시도');
        const expiredCache = this.getFromCache<YouTubeVideo[]>(cacheKey, this.VIDEOS_CACHE_DURATION, true);
        if (expiredCache) {
          return expiredCache;
        }
        const persistentCache = this.getFromPersistentCache<YouTubeVideo[]>(cacheKey, true);
        if (persistentCache) {
          return persistentCache;
        }
      }
      console.error('비디오 목록 가져오기 실패:', error);
      // 할당량 초과가 아니거나 캐시도 없으면 빈 배열 반환
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
    const cacheKey = `channel_analytics_${channelId}_${startDate}_${endDate}`;
    
    // 캐시에서 데이터 확인
    const cachedData = this.getFromCache<YouTubeAnalytics>(cacheKey, this.CACHE_DURATION);
    if (cachedData) {
      return cachedData;
    }

    try {
      const params = {
        ids: `channel==${channelId}`,
        startDate,
        endDate,
        metrics: 'views,estimatedMinutesWatched,averageViewDuration,subscribersGained,subscribersLost,likes,dislikes,comments,shares,estimatedRevenue,cpm',
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
      const analyticsData = {
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
        ctr: 0,
        impressions: 0,
        impressionsClickable: 0,
      };

      // 캐시에 저장
      this.setCache(cacheKey, analyticsData);
      
      return analyticsData;
    } catch (error: any) {
      // 에러 메시지 확인
      const errorMessage = error?.message || '';
      const statusCode = error?.statusCode;
      
      // 403 Forbidden 또는 500 Internal Server Error 시 만료된 캐시 사용 시도
      if (error?.isQuotaExceeded || 
          statusCode === 403 || 
          statusCode === 500 ||
          errorMessage.includes('Forbidden') || 
          errorMessage.includes('internal error')) {
        // 캐시에서 데이터 로드 시도 (성공 시에만 로그)
        const expiredCache = this.getFromCache<YouTubeAnalytics>(cacheKey, this.CACHE_DURATION, true);
        if (expiredCache) {
          return expiredCache;
        }
        const persistentCache = this.getFromPersistentCache<YouTubeAnalytics>(cacheKey, true);
        if (persistentCache) {
          return persistentCache;
        }
      }
      
      // 캐시도 없으면 기본값 반환 (조용히 처리)
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
  }

  // 채널 노출/도달 지표 (별도 리포트)
  async getChannelReachAnalytics(
    channelId: string,
    startDate: string,
    endDate: string
  ): Promise<YouTubeReachAnalytics> {
    const params = {
      ids: `channel==${channelId}`,
      startDate,
      endDate,
      dimensions: 'day',
      metrics: 'impressionsCtr,impressionsViewerPercentage,views',
    };

    const response = await this.makeRequest<{
      rows: Array<[string, number, number, number]>;
    }>(`${YOUTUBE_ANALYTICS_API_BASE}/reports`, params);

    if (!response.rows || response.rows.length === 0) {
      return {
        totalImpressions: 0,
        averageCtr: 0,
        averageViewerPercentage: 0,
        totalViews: 0,
        rows: [],
      };
    }

    const rows: YouTubeReachAnalyticsRow[] = response.rows.map(row => ({
      date: row[0],
      impressions: 0,
      impressionsCtr: row[1] || 0,
      impressionsViewerPercentage: row[2] || 0,
      views: row[3] || 0,
    }));

    const totals = rows.reduce(
      (acc, row) => {
        const weight = row.views;
        acc.impressions += row.impressions;
        acc.views += row.views;
        acc.weightedCtr += weight * row.impressionsCtr;
        acc.weightedViewerPercentage += weight * row.impressionsViewerPercentage;
        return acc;
      },
      {
        impressions: 0,
        views: 0,
        weightedCtr: 0,
        weightedViewerPercentage: 0,
      }
    );

    const totalImpressions = 0;
    const weightBase = totals.views;
    const averageCtr = weightBase > 0 ? totals.weightedCtr / weightBase : 0;
    const averageViewerPercentage =
      weightBase > 0 ? totals.weightedViewerPercentage / weightBase : 0;

    return {
      totalImpressions,
      averageCtr,
      averageViewerPercentage,
      totalViews: totals.views,
      rows,
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
    const cacheKey = `video_analytics_${videoId}_${startDate}_${endDate}`;
    
    // 캐시에서 데이터 확인
    const cachedData = this.getFromCache<YouTubeAnalytics>(cacheKey, this.CACHE_DURATION);
    if (cachedData) {
      return cachedData;
    }

    try {
      // 비디오 레벨에서는 impressions 메트릭이 지원되지 않으므로 제거
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
      // impressions 메트릭이 없으므로 ctr은 0으로 설정
      const analyticsData = {
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
        ctr: 0, // 비디오 레벨에서는 impressions 데이터가 없어 ctr 계산 불가
        impressions: 0,
        impressionsClickable: 0,
      };

      // 캐시에 저장
      this.setCache(cacheKey, analyticsData);
      
      return analyticsData;
    } catch (error: any) {
      // 에러 메시지 확인
      const errorMessage = error?.message || '';
      const statusCode = error?.statusCode;
      
      // 403 Forbidden 또는 500 Internal Server Error 시 만료된 캐시 사용 시도
      if (error?.isQuotaExceeded || 
          statusCode === 403 || 
          statusCode === 500 ||
          errorMessage.includes('Forbidden') || 
          errorMessage.includes('internal error') ||
          errorMessage.includes('Unknown identifier')) {
        // 캐시에서 데이터 로드 시도 (성공 시에만 로그)
        const expiredCache = this.getFromCache<YouTubeAnalytics>(cacheKey, this.CACHE_DURATION, true);
        if (expiredCache) {
          return expiredCache;
        }
        const persistentCache = this.getFromPersistentCache<YouTubeAnalytics>(cacheKey, true);
        if (persistentCache) {
          return persistentCache;
        }
      }
      
      // 캐시도 없으면 기본값 반환 (조용히 처리)
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
  }

  // 여러 비디오의 분석 데이터를 한 번에 가져오기
  async getMultipleVideoAnalytics(
    videoIds: string[],
    startDate: string,
    endDate: string
  ): Promise<Map<string, YouTubeAnalytics>> {
    const result = new Map<string, YouTubeAnalytics>();
    
    // YouTube Analytics API는 한 번에 하나의 비디오만 조회 가능하므로 순차 처리
    for (const videoId of videoIds) {
      try {
        const analytics = await this.getVideoAnalytics(videoId, startDate, endDate);
        result.set(videoId, analytics);
      } catch (error) {
        console.error(`비디오 ${videoId} 분석 데이터 가져오기 실패:`, error);
        // 실패한 경우 기본값 설정
        result.set(videoId, {
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
        });
      }
    }
    
    return result;
  }

  // 연령대별 시청자 데이터 가져오기
  async getAgeGroupData(
    channelId: string,
    startDate: string,
    endDate: string
  ): Promise<YouTubeAgeGroupData[]> {
    try {
      const params = {
        ids: `channel==${channelId}`,
        startDate,
        endDate,
        dimensions: 'ageGroup',
        metrics: 'viewerPercentage',
      };

      const response = await this.makeRequest<{
        rows: Array<[string, number]>;
        columnHeaders: Array<{ name: string; dataType: string }>;
      }>(`${YOUTUBE_ANALYTICS_API_BASE}/reports`, params);

      if (!response.rows || response.rows.length === 0) {
        console.log('연령대 데이터가 없습니다.');
        return [];
      }

      // YouTube API의 연령대 형식을 우리 형식으로 변환
      const ageGroupMap: Record<string, string> = {
        'age13-17': '10',
        'age18-24': '20',
        'age25-34': '30',
        'age35-44': '40+',
        'age45-54': '40+',
        'age55-64': '40+',
        'age65-': '40+',
      };

      // 연령대별로 그룹화하고 합산
      const groupedData: Record<string, number> = {};
      
      response.rows.forEach(([ageGroup, percentage]) => {
        const mappedAge = ageGroupMap[ageGroup] || '40+';
        if (!groupedData[mappedAge]) {
          groupedData[mappedAge] = 0;
        }
        groupedData[mappedAge] += percentage;
      });

      // 배열로 변환하고 정렬
      const result: YouTubeAgeGroupData[] = Object.entries(groupedData)
        .map(([ageGroup, percentage]) => ({
          ageGroup,
          percentage: Math.round(percentage * 100) / 100, // 소수점 2자리까지
        }))
        .sort((a, b) => {
          // 10, 20, 30, 40+ 순서로 정렬
          const order: Record<string, number> = { '10': 1, '20': 2, '30': 3, '40+': 4 };
          return (order[a.ageGroup] || 99) - (order[b.ageGroup] || 99);
        });

      return result;
    } catch (error) {
      console.error('연령대 데이터 가져오기 실패:', error);
      return [];
    }
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
