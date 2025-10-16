import { useState, useEffect, useCallback } from 'react';
import { useYouTube } from './useYouTube';

interface AverageViewsStats {
  averageViews: number;
  averageLikes: number;
  previousAverageViews: number;
  previousAverageLikes: number;
  viewsChangePercent: number;
  likesChangePercent: number;
  viewsChangeType: 'increase' | 'decrease' | 'no-change';
  likesChangeType: 'increase' | 'decrease' | 'no-change';
  isLoading: boolean;
  error: string | null;
  totalVideos: number;
}

export const useAverageViews = (): AverageViewsStats => {
  const { videos, isConnected, isLoading: youtubeLoading, error: youtubeError, refreshVideos } = useYouTube();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previousAverageViews, setPreviousAverageViews] = useState(0);
  const [previousAverageLikes, setPreviousAverageLikes] = useState(0);

  // 조회수 포맷팅 함수
  const formatViewCount = (count: string): number => {
    return parseInt(count) || 0;
  };

  // 좋아요수 포맷팅 함수
  const formatLikeCount = (count: string): number => {
    return parseInt(count) || 0;
  };

  // 평균 조회수 계산 함수
  const calculateAverageViews = (videoList: any[]): number => {
    if (!videoList || videoList.length === 0) return 0;
    
    const totalViews = videoList.reduce((sum, video) => {
      return sum + formatViewCount(video.statistics?.viewCount || '0');
    }, 0);
    
    return Math.round(totalViews / videoList.length);
  };

  // 평균 좋아요수 계산 함수
  const calculateAverageLikes = (videoList: any[]): number => {
    if (!videoList || videoList.length === 0) return 0;
    
    const totalLikes = videoList.reduce((sum, video) => {
      return sum + formatLikeCount(video.statistics?.likeCount || '0');
    }, 0);
    
    return Math.round(totalLikes / videoList.length);
  };

  // 변화율 계산 함수
  const calculateChangePercent = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  // 변화 타입 결정 함수
  const getChangeType = (changePercent: number): 'increase' | 'decrease' | 'no-change' => {
    if (changePercent > 0) return 'increase';
    if (changePercent < 0) return 'decrease';
    return 'no-change';
  };

  // 로컬 스토리지에서 이전 평균 조회수와 좋아요수 가져오기
  useEffect(() => {
    const savedAverageViews = localStorage.getItem('previous_average_views');
    const savedAverageLikes = localStorage.getItem('previous_average_likes');
    
    if (savedAverageViews) {
      setPreviousAverageViews(parseInt(savedAverageViews));
    }
    if (savedAverageLikes) {
      setPreviousAverageLikes(parseInt(savedAverageLikes));
    }
  }, []);

  // 비디오 목록이 변경될 때 평균 조회수와 좋아요수 계산
  useEffect(() => {
    if (videos && videos.length > 0) {
      const currentAverageViews = calculateAverageViews(videos);
      const currentAverageLikes = calculateAverageLikes(videos);
      
      // 이전 평균 조회수가 없으면 현재 평균 조회수를 저장
      if (previousAverageViews === 0) {
        setPreviousAverageViews(currentAverageViews);
        localStorage.setItem('previous_average_views', currentAverageViews.toString());
      }
      
      // 이전 평균 좋아요수가 없으면 현재 평균 좋아요수를 저장
      if (previousAverageLikes === 0) {
        setPreviousAverageLikes(currentAverageLikes);
        localStorage.setItem('previous_average_likes', currentAverageLikes.toString());
      }
    }
  }, [videos, previousAverageViews, previousAverageLikes]);

  // 평균 조회수 새로고침 함수 (한 번만 호출)
  const refreshAverageViews = useCallback(async () => {
    if (!isConnected) {
      setError('YouTube에 연결되지 않았습니다.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // 비디오 목록을 새로고침하여 최신 조회수 데이터 가져오기
      await refreshVideos();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '평균 조회수를 가져오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, refreshVideos]);

  // 컴포넌트 마운트 시 한 번만 통계 새로고침 (비활성화)
  // useEffect(() => {
  //   if (isConnected && !youtubeLoading && videos.length === 0) {
  //     refreshAverageViews();
  //   }
  // }, [isConnected, youtubeLoading, videos.length, refreshAverageViews]);

  // 현재 평균 조회수와 좋아요수 계산
  const averageViews = videos && videos.length > 0 
    ? calculateAverageViews(videos) 
    : 0;

  const averageLikes = videos && videos.length > 0 
    ? calculateAverageLikes(videos) 
    : 0;

  // 변화율 계산
  const viewsChangePercent = calculateChangePercent(averageViews, previousAverageViews);
  const likesChangePercent = calculateChangePercent(averageLikes, previousAverageLikes);

  // 변화 타입 결정
  const viewsChangeType = getChangeType(viewsChangePercent);
  const likesChangeType = getChangeType(likesChangePercent);

  // 새로운 평균 조회수와 좋아요수가 계산되면 이전 값과 비교하여 저장
  useEffect(() => {
    if (averageViews > 0 && averageViews !== previousAverageViews) {
      setPreviousAverageViews(averageViews);
      localStorage.setItem('previous_average_views', averageViews.toString());
    }
  }, [averageViews, previousAverageViews]);

  useEffect(() => {
    if (averageLikes > 0 && averageLikes !== previousAverageLikes) {
      setPreviousAverageLikes(averageLikes);
      localStorage.setItem('previous_average_likes', averageLikes.toString());
    }
  }, [averageLikes, previousAverageLikes]);

  return {
    averageViews,
    averageLikes,
    previousAverageViews,
    previousAverageLikes,
    viewsChangePercent: Math.abs(viewsChangePercent),
    likesChangePercent: Math.abs(likesChangePercent),
    viewsChangeType,
    likesChangeType,
    isLoading: isLoading || youtubeLoading,
    error: error || youtubeError,
    totalVideos: videos?.length || 0,
  };
};
