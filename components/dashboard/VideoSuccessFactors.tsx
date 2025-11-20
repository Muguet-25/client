'use client';

import { useMemo } from 'react';
import { YouTubeVideo } from '@/lib/youtube/types';

interface VideoSuccessFactorsProps {
  video: YouTubeVideo;
  videoAnalytics?: {
    ctr: number;
    averageViewDuration: string;
  };
  channelAvgCtr?: number;
  channelAvgWatchDuration?: string;
  avgViews?: number;
}

export default function VideoSuccessFactors({
  video,
  videoAnalytics,
  channelAvgCtr = 5.0,
  channelAvgWatchDuration = '5:00',
  avgViews = 0
}: VideoSuccessFactorsProps) {
  // ISO 8601 duration을 초로 변환 (useMemo 이전에 선언)
  const parseDurationToSeconds = (duration: string): number => {
    // ISO 8601 형식 (PT1H2M3S) 또는 MM:SS 형식 모두 지원
    if (duration.includes('PT')) {
      const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      if (!match) return 0;
      const hours = parseInt(match[1] || '0');
      const minutes = parseInt(match[2] || '0');
      const seconds = parseInt(match[3] || '0');
      return hours * 3600 + minutes * 60 + seconds;
    } else {
      // MM:SS 또는 HH:MM:SS 형식
      const parts = duration.split(':').map(Number);
      if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
      } else if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
      }
      return 0;
    }
  };

  const successFactors = useMemo(() => {
    const factors: Array<{ label: string; color: string }> = [];
    
    const views = parseInt(video.statistics?.viewCount || '0');
    const likes = parseInt(video.statistics?.likeCount || '0');
    const comments = parseInt(video.statistics?.commentCount || '0');
    
    // CTR 분석
    if (videoAnalytics?.ctr) {
      if (videoAnalytics.ctr >= channelAvgCtr * 1.2) {
        factors.push({ label: '썸네일 CTR 상위 10%', color: 'purple' });
      }
    }
    
    // 조회수 분석
    if (views >= avgViews * 1.5 && avgViews > 0) {
      factors.push({ label: '조회수 평균 대비 150%+', color: 'green' });
    }
    
    // 참여도 분석
    const engagement = views > 0 ? ((likes + comments) / views) * 100 : 0;
    if (engagement >= 5) {
      factors.push({ label: '참여도 높음', color: 'cyan' });
    }
    
    // 시청 지속시간 분석
    if (videoAnalytics?.averageViewDuration) {
      const durationSeconds = parseDurationToSeconds(videoAnalytics.averageViewDuration);
      const videoDurationSeconds = parseDurationToSeconds(video.duration || 'PT0S');
      const retentionRate = videoDurationSeconds > 0 ? (durationSeconds / videoDurationSeconds) * 100 : 0;
      
      if (retentionRate >= 60) {
        factors.push({ label: '초반 후킹 강함', color: 'green' });
      }
    }
    
    // 업로드 시간 분석 (18-20시)
    const publishedDate = new Date(video.publishedAt);
    const hour = publishedDate.getHours();
    if (hour >= 18 && hour <= 20) {
      factors.push({ label: '업로드 시간 최적화', color: 'yellow' });
    }
    
    // 제목 길이 분석
    const titleLength = video.title?.length || 0;
    if (titleLength >= 25 && titleLength <= 30) {
      factors.push({ label: '키워드 경쟁력 높음', color: 'blue' });
    }
    
    // 연령대 분석 (실제로는 API에서 가져와야 함)
    // 여기서는 예시로 추가
    
    return factors;
  }, [video, videoAnalytics, channelAvgCtr, channelAvgWatchDuration, avgViews]);

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      green: 'bg-green-500/20 text-green-400 border-green-500/30',
      blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      pink: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    };
    return colorMap[color] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  if (successFactors.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {successFactors.map((factor, index) => (
        <span
          key={index}
          className={`px-2 py-1 text-xs rounded-md border ${getColorClasses(factor.color)}`}
        >
          {factor.label}
        </span>
      ))}
    </div>
  );
}

