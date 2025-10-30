import { useState, useEffect, useCallback } from 'react';
import { YouTubeAPI } from '@/lib/youtube/api';
import { YouTubeChannel, YouTubeVideo, YouTubeAnalytics, YouTubeAnalyticsData } from '@/lib/youtube/types';

// 환경 변수 검증 함수
const validateYouTubeConfig = () => {
  const clientId = process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_YOUTUBE_REDIRECT_URI;
  
  if (!clientId) {
    return 'YouTube 클라이언트 ID가 설정되지 않았습니다. .env.local 파일을 확인해주세요.';
  }
  
  if (!redirectUri) {
    return 'YouTube 리다이렉트 URI가 설정되지 않았습니다. .env.local 파일을 확인해주세요.';
  }
  
  return null;
};

interface UseYouTubeReturn {
  // 상태
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  channel: YouTubeChannel | null;
  videos: YouTubeVideo[];
  analytics: YouTubeAnalytics | null;
  dailyData: YouTubeAnalyticsData[];

  // 액션
  connect: () => void;
  disconnect: () => void;
  refreshChannel: () => Promise<void>;
  refreshVideos: () => Promise<void>;
  refreshAnalytics: (startDate: string, endDate: string) => Promise<void>;
  refreshDailyData: (startDate: string, endDate: string) => Promise<void>;
  
  // 새로운 통계 관련 메서드들
  getVideoStatistics: (videoId: string) => Promise<{ viewCount: number; likeCount: number; commentCount: number }>;
  getMultipleVideoStatistics: (videoIds: string[]) => Promise<Array<{ id: string; viewCount: number; likeCount: number; commentCount: number }>>;
}

export const useYouTube = (): UseYouTubeReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [channel, setChannel] = useState<YouTubeChannel | null>(null);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [analytics, setAnalytics] = useState<YouTubeAnalytics | null>(null);
  const [dailyData, setDailyData] = useState<YouTubeAnalyticsData[]>([]);
  const [api, setApi] = useState<YouTubeAPI | null>(null);
  
  // 중복 요청 방지를 위한 플래그들
  const [isLoadingChannel, setIsLoadingChannel] = useState(false);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);

  // YouTube 연결 상태 확인
  useEffect(() => {
    const checkConnection = () => {
      const token = localStorage.getItem('youtube_access_token');
      
      
      if (token) {
        try {
          setIsConnected(true);
          setApi(new YouTubeAPI(token));
          setError(null);
          console.log('YouTube 연결 상태: 연결됨');
        } catch (err) {
          console.error('YouTube API 초기화 오류:', err);
          setError('YouTube API 초기화에 실패했습니다.');
          setIsConnected(false);
        }
      } else {
        console.log('YouTube 연결 상태: 연결되지 않음');
        setIsConnected(false);
        setApi(null);
      }
    };

    // 초기 확인
    checkConnection();
    
    // 주기적으로 확인 (비활성화)
    // const interval = setInterval(checkConnection, 5000);
    
    // localStorage 변경 감지
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'youtube_access_token') {
        console.log('YouTube 토큰 변경 감지');
        checkConnection();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      // clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // YouTube 연결
  const connect = useCallback(() => {
    const configError = validateYouTubeConfig();
    if (configError) {
      setError(configError);
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID!;
    const redirectUri = process.env.NEXT_PUBLIC_YOUTUBE_REDIRECT_URI!;
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: [
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/youtube.force-ssl',
        'https://www.googleapis.com/auth/youtubepartner',
        'https://www.googleapis.com/auth/yt-analytics.readonly',
        'https://www.googleapis.com/auth/yt-analytics-monetary.readonly',
      ].join(' '),
      access_type: 'offline',
      prompt: 'consent',
    })}`;

    window.location.href = authUrl;
  }, []);

  // YouTube 연결 해제
  const disconnect = useCallback(() => {
    localStorage.removeItem('youtube_access_token');
    localStorage.removeItem('youtube_refresh_token');
    setIsConnected(false);
    setApi(null);
    setChannel(null);
    setVideos([]);
    setAnalytics(null);
    setDailyData([]);
  }, []);

  // 채널 정보 새로고침 (중복 요청 방지)
  const refreshChannel = useCallback(async () => {
    if (!api || isLoadingChannel) return;

    try {
      setIsLoadingChannel(true);
      setError(null);
      console.log('채널 정보 요청 중...');
      const channelData = await api.getChannelInfo();
      setChannel(channelData);
      console.log('채널 정보 로드 완료');
    } catch (err) {
      console.error('채널 정보 로드 실패:', err);
      setError(err instanceof Error ? err.message : '채널 정보를 가져오는데 실패했습니다.');
    } finally {
      setIsLoadingChannel(false);
    }
  }, [api, isLoadingChannel]);

  // 비디오 목록 새로고침 (중복 요청 방지)
  const refreshVideos = useCallback(async () => {
    if (!api || isLoadingVideos) return;

    try {
      setIsLoadingVideos(true);
      setError(null);
      console.log('비디오 목록 요청 중...');
      const videosData = await api.getVideos();
      setVideos(videosData);
      console.log('비디오 목록 로드 완료');
    } catch (err) {
      console.error('비디오 목록 로드 실패:', err);
      setError(err instanceof Error ? err.message : '비디오 목록을 가져오는데 실패했습니다.');
    } finally {
      setIsLoadingVideos(false);
    }
  }, [api, isLoadingVideos]);

  // 분석 데이터 새로고침
  const refreshAnalytics = useCallback(async (startDate: string, endDate: string) => {
    if (!api || !channel) return;

    try {
      setIsLoading(true);
      setError(null);
      const analyticsData = await api.getChannelAnalytics(channel.id, startDate, endDate);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '분석 데이터를 가져오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [api, channel]);

  // 일별 데이터 새로고침
  const refreshDailyData = useCallback(async (startDate: string, endDate: string) => {
    if (!api || !channel) return;

    try {
      setIsLoading(true);
      setError(null);
      const dailyAnalytics = await api.getDailyAnalytics(channel.id, startDate, endDate);
      setDailyData(dailyAnalytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : '일별 데이터를 가져오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [api, channel]);

  // 특정 비디오의 통계 정보 가져오기
  const getVideoStatistics = useCallback(async (videoId: string) => {
    if (!api) {
      throw new Error('YouTube API가 연결되지 않았습니다.');
    }
    return await api.getVideoStatistics(videoId);
  }, [api]);

  // 여러 비디오의 통계 정보 가져오기
  const getMultipleVideoStatistics = useCallback(async (videoIds: string[]) => {
    if (!api) {
      throw new Error('YouTube API가 연결되지 않았습니다.');
    }
    return await api.getMultipleVideoStatistics(videoIds);
  }, [api]);

  // 한 번만 시도하는 플래그들
  const [hasTriedChannel, setHasTriedChannel] = useState(false);
  const [hasTriedVideos, setHasTriedVideos] = useState(false);

  // 연결 시 자동으로 채널 정보 로드 (한 번만, 중복 방지)
  useEffect(() => {
    if (isConnected && api && !channel && !hasTriedChannel && !isLoadingChannel) {
      setHasTriedChannel(true);
      refreshChannel();
    }
  }, [isConnected, api, channel, hasTriedChannel, isLoadingChannel, refreshChannel]);

  // 채널 정보가 로드되면 비디오도 자동으로 로드 (한 번만, 중복 방지)
  useEffect(() => {
    if (isConnected && api && channel && videos.length === 0 && !hasTriedVideos && !isLoadingVideos) {
      setHasTriedVideos(true);
      refreshVideos();
    }
  }, [isConnected, api, channel, videos.length, hasTriedVideos, isLoadingVideos, refreshVideos]);

  return {
    isConnected,
    isLoading,
    error,
    channel,
    videos,
    analytics,
    dailyData,
    connect,
    disconnect,
    refreshChannel,
    refreshVideos,
    refreshAnalytics,
    refreshDailyData,
    getVideoStatistics,
    getMultipleVideoStatistics,
  };
};
