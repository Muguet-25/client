'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Sidebar from '@/components/dashboard/Sidebar';
import { useStore } from '@/lib/store';
import { useYouTube } from '@/hooks/useYouTube';
import { YouTubeVideo } from '@/lib/youtube/types';
import { AlertTriangle, Lightbulb, ArrowLeft, UserPlus, ThumbsUp, ThumbsDown, Eye, TrendingUp, MessageCircle } from 'lucide-react';
import VideoHealthReport from '@/components/report/VideoHealthReport';
import ActionPlan from '@/components/report/ActionPlan';

interface VideoItemProps {
  video: YouTubeVideo;
  onAnalyze: (videoId: string) => void;
}

function VideoItem({ video, onAnalyze }: VideoItemProps) {
  // ISO 8601 duration을 MM:SS 형식으로 변환
  const formatDuration = (isoDuration: string): string => {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0:00';
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  const duration = formatDuration(video.duration || 'PT0S');
  const thumbnail = video.thumbnails?.medium?.url || video.thumbnails?.default?.url || '';
  const title = video.title || '제목 없음';
  const description = video.description || '설명 추가';

  return (
    <div className="flex items-center gap-4 py-4 border-b border-[#3a3b50]">
      {/* YouTube 재생 버튼 아이콘 */}
      <div className="flex-shrink-0">
        <svg width="44" height="31" viewBox="0 0 44 31" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M43.0869 4.8533C42.5746 2.97266 41.1091 1.50719 39.2284 0.994844C35.7675 0.0625 22 0.0625 22 0.0625C22 0.0625 8.23251 0.0625 4.77165 0.994844C2.89093 1.50723 1.4254 2.97266 0.913137 4.8533C0 8.31416 0 15.5 0 15.5C0 15.5 0 22.6859 0.913137 26.1467C1.4254 28.0273 2.89093 29.4928 4.77165 30.0052C8.23251 30.9375 22 30.9375 22 30.9375C22 30.9375 35.7675 30.9375 39.2284 30.0052C41.1091 29.4928 42.5746 28.0273 43.0869 26.1467C44 22.6859 44 15.5 44 15.5C44 15.5 44 8.31416 43.0869 4.8533Z" fill="#FF0000"/>
          <path d="M17.5938 22.0312L29.0312 15.5L17.5938 8.96875V22.0312Z" fill="white"/>
        </svg>
      </div>

      {/* 썸네일 */}
      <div className="relative w-[200px] h-[113px] flex-shrink-0 rounded-lg overflow-hidden">
        <Image
          src={thumbnail}
          alt={title}
          fill
          className="object-cover"
        />
        {/* 썸네일 왼쪽 하단 제목 오버레이 */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
          <p className="text-white text-xs font-medium line-clamp-1">{title}</p>
        </div>
        {/* 썸네일 오른쪽 하단 재생 시간 */}
        <div className="absolute bottom-2 right-2 bg-black/70 rounded px-1.5 py-0.5">
          <span className="text-white text-[10px] font-normal">{duration}</span>
        </div>
      </div>

      {/* 동영상 제목 */}
      <div className="flex-1 min-w-0">
        <h3 className="text-[#f5f5f5] text-base font-normal leading-[18px] mb-1 line-clamp-1">
          {title}
        </h3>
        <p className="text-[#aaaaaa] text-sm font-normal leading-[18px]">
          {description || '설명 추가'}
        </p>
      </div>

      {/* 영상 분석하기 버튼 */}
      <button
        onClick={() => onAnalyze(video.id)}
        className="flex-shrink-0 px-4 py-2 bg-[#ff8953] text-white rounded-lg hover:bg-[#ff8953]/80 transition-colors text-sm font-medium"
      >
        영상 분석하기
      </button>
    </div>
  );
}

// 영상 분석 상세 컴포넌트
function VideoAnalysisDetail({ video, onBack }: { video: YouTubeVideo; onBack: () => void }) {
  const { isConnected, channel, videos } = useYouTube();
  
  // 목 데이터로 초기화
  const mockVideoAnalytics = {
    averageViewDuration: 150, // 2분 30초
    averageViewPercentage: 65,
  };
  
  const [channelSubscribersGained, setChannelSubscribersGained] = useState(0);
  const [avgTitleLength, setAvgTitleLength] = useState(0);
  const [optimalUploadHour, setOptimalUploadHour] = useState(18);
  const [latestComment, setLatestComment] = useState<{ text: string; author: string; publishedAt: string } | null>(null);
  const [engagementAnalysis, setEngagementAnalysis] = useState<string>('');
  const [detailedAnalysis, setDetailedAnalysis] = useState<string>('');
  const [isLoadingComment, setIsLoadingComment] = useState(false);

  // 최신 댓글 가져오기 및 AI 분석
  useEffect(() => {
    const fetchCommentAndAnalysis = async () => {
      if (!isConnected || !channel) return;

      setIsLoadingComment(true);
      try {
        const accessToken = localStorage.getItem('youtube_access_token');
        if (!accessToken) return;

        const { YouTubeAPI } = await import('@/lib/youtube/api');
        const youtubeAPI = new YouTubeAPI(accessToken);

        // 최신 댓글 1개 가져오기
        const comment = await youtubeAPI.getLatestComment(video.id);
        setLatestComment(comment);

        // 영상 길이를 초로 변환
        const parseDurationToSeconds = (duration: string): number => {
          if (duration.includes('PT')) {
            const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
            if (!match) return 0;
            const hours = parseInt(match[1] || '0');
            const minutes = parseInt(match[2] || '0');
            const seconds = parseInt(match[3] || '0');
            return hours * 3600 + minutes * 60 + seconds;
          }
          return 0;
        };

        const videoDurationSeconds = parseDurationToSeconds(video.duration || 'PT0S');

        // AI 분석 요청 (댓글 정보 포함)
        const response = await fetch('/api/video-insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            video: {
              title: video.title || '',
              description: video.description || '',
              tags: video.snippet?.tags || [],
              publishedAt: video.publishedAt,
              duration: video.duration || '',
              durationSeconds: videoDurationSeconds,
            },
            metrics: {
              views: parseInt(video.statistics?.viewCount || '0'),
              likes: parseInt(video.statistics?.likeCount || '0'),
              comments: parseInt(video.statistics?.commentCount || '0'),
              likeRate: parseInt(video.statistics?.viewCount || '0') > 0 
                ? (parseInt(video.statistics?.likeCount || '0') / parseInt(video.statistics?.viewCount || '0')) * 100 
                : 0,
              commentRate: parseInt(video.statistics?.viewCount || '0') > 0 
                ? (parseInt(video.statistics?.commentCount || '0') / parseInt(video.statistics?.viewCount || '0')) * 100 
                : 0,
            },
            latestComment: comment ? {
              text: comment.text,
              author: comment.author,
              publishedAt: comment.publishedAt,
            } : null,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.engagementAnalysis) {
            setEngagementAnalysis(data.engagementAnalysis);
          }
          if (data.detailedAnalysis) {
            setDetailedAnalysis(data.detailedAnalysis);
          }
        } else {
          console.error('AI 분석 실패:', await response.text());
        }
      } catch (error) {
        console.error('댓글 가져오기 또는 AI 분석 실패:', error);
      } finally {
        setIsLoadingComment(false);
      }
    };

    fetchCommentAndAnalysis();
  }, [isConnected, channel, video.id, video.title, video.description, video.statistics, video.publishedAt, video.snippet?.tags]);

  // 목 데이터 사용 - API 호출 제거됨

  // 제목 길이 계산
  const titleLength = video.title?.length || 0;
  
  // 업로드 시간 추출 (publishedAt에서)
  const publishedDate = new Date(video.publishedAt);
  const uploadHour = publishedDate.getHours();
  
  // 키워드 (태그) 추출
  const keywords = video.snippet?.tags || [];
  const keywordText = keywords.length > 0 ? keywords.slice(0, 4).join(', ') + (keywords.length > 4 ? '...' : '') : '없음';
  
  // 통계 데이터
  const views = parseInt(video.statistics?.viewCount || '0');
  const likes = parseInt(video.statistics?.likeCount || '0');
  const comments = parseInt(video.statistics?.commentCount || '0');
  
  // 썸네일
  const thumbnail = video.thumbnails?.high?.url || video.thumbnails?.medium?.url || video.thumbnails?.default?.url || '';
  
  // 평균 시청 지속률 계산
  const parseDurationToSeconds = (duration: string): number => {
    if (duration.includes('PT')) {
      const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      if (!match) return 0;
      const hours = parseInt(match[1] || '0');
      const minutes = parseInt(match[2] || '0');
      const seconds = parseInt(match[3] || '0');
      return hours * 3600 + minutes * 60 + seconds;
    }
    return 0;
  };

  // 초를 MM:SS 또는 HH:MM:SS 형식으로 변환
  const formatSecondsToTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}시간 ${minutes}분 ${secs}초`;
    } else if (minutes > 0) {
      return `${minutes}분 ${secs}초`;
    } else {
      return `${secs}초`;
    }
  };

  // 목 데이터 사용
  const avgWatchDurationSeconds = mockVideoAnalytics.averageViewDuration;
  const watchRetentionRate = mockVideoAnalytics.averageViewPercentage;
  const likeRate = 7.2; // 목 데이터
  const commentRate = 1.0; // 목 데이터

  return (
    <div className="space-y-6">
      {/* 목록으로 돌아가기 버튼 */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[#f5f5f5] hover:text-[#ff8953] transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>목록으로 돌아가기</span>
      </button>

      {/* 영상 제목 */}
      <h2 className="text-2xl font-semibold text-[#e2e2e4] leading-[26px]">
        {video.title}
      </h2>

      {/* 메인 섹션: 썸네일 + 정보 */}
      <div className="flex gap-6 items-center">
        {/* 왼쪽: 썸네일 */}
        <div className="relative w-[608px] h-[342px] flex-shrink-0 rounded-2xl overflow-hidden">
          <Image
            src={thumbnail}
            alt={video.title || ''}
            fill
            className="object-cover"
          />
        </div>

        {/* 가운데: 영상 제목과 설명 */}
        <div className="flex-1 flex flex-col justify-center">
          <h3 className="text-2xl font-semibold text-[#e2e2e4] leading-[26px] mb-2">
            {video.title}
          </h3>
          <p className="text-base text-[#e2e2e4]">
            {video.description || '설명이 없습니다.'}
          </p>
        </div>

        {/* 오른쪽: 통계 카드들 */}
        <div className="flex flex-col gap-12 items-start">
            {/* 총 좋아요 */}
            <div className="flex flex-col gap-2 items-start">
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-[18px] h-[18px] text-[#ff8953]" />
                <span className="text-base text-[#e2e2e4]">총 좋아요</span>
              </div>
              <p className="text-2xl font-semibold text-[#e2e2e4] leading-[26px]">
                {likes.toLocaleString()}
              </p>
            </div>

            {/* 총 조회수 */}
            <div className="flex flex-col gap-2 items-start">
              <div className="flex items-center gap-2">
                <Eye className="w-[18px] h-[18px] text-[#ff8953]" />
                <span className="text-base text-[#e2e2e4]">총 조회수</span>
              </div>
              <p className="text-2xl font-semibold text-[#e2e2e4] leading-[26px]">
                {views.toLocaleString()}
              </p>
            </div>
        </div>
      </div>

      {/* 분석 섹션 */}
      <div className="space-y-12 pt-12">
        {/* 평균시청 지속률 */}
        {/* <div className="flex gap-4 items-center">
          <div className="bg-[#1b1c25] border border-[#3a3b50] rounded-lg p-4 w-[201px] flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-6 h-6 text-[#ff8953]" />
              <span className="text-base text-[#e2e2e4]">평균시청 지속률</span>
            </div>
            <p className="text-2xl font-semibold text-[#e2e2e4] leading-[26px]">
              {formatSecondsToTime(avgWatchDurationSeconds)}
            </p>
          </div>
          <div className="flex-1 flex gap-4 items-center ml-4">
            <p className="text-base text-[#e2e2e4] leading-[18px]">
              "{mockVideoInsights.retentionAnalysis}"
            </p>
          </div>
        </div> */}

        {/* 좋아요/댓글 전환률 */}
        <div className="flex gap-4 items-center">
          <div className="bg-[#1b1c25] border border-[#3a3b50] rounded-lg p-4 w-[201px] flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle className="w-6 h-6 text-[#ff8953]" />
              <span className="text-base text-[#e2e2e4]">댓글</span>
            </div>
            <p className="text-2xl font-semibold text-[#e2e2e4] leading-[26px]">
              {comments.toLocaleString()}
            </p>
          </div>
          <div className="flex-1 flex gap-4 items-center ml-4">
            {isLoadingComment ? (
              <div className="h-4 w-full bg-[#3a3b50]/50 rounded animate-pulse" />
            ) : (
              <p className="text-base text-[#e2e2e4] leading-[18px]">
                "{engagementAnalysis || '댓글 분석 중입니다.'}"
              </p>
            )}
          </div>
        </div>

        {/* 상세 분석 */}
        <div className="bg-[#1b1c25] border border-[#3a3b50] rounded-lg p-4 mt-4">
          {isLoadingComment ? (
            <div className="space-y-2">
              <div className="h-4 w-full bg-[#3a3b50]/50 rounded animate-pulse" />
              <div className="h-4 w-4/5 bg-[#3a3b50]/50 rounded animate-pulse" />
            </div>
          ) : (
            <p className="text-base text-[#e2e2e4] leading-[18px]">
              {detailedAnalysis || '영상 분석 중입니다.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ContentAnalyticsPage() {
  const { isSidebarOpen, isSidebarHovered } = useStore();
  const isSidebarVisible = isSidebarOpen || isSidebarHovered;
  const { videos, isLoading, isConnected, refreshVideos } = useYouTube();
  const [displayedCount, setDisplayedCount] = useState(5);
  const videosPerLoad = 5;
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);

  useEffect(() => {
    if (isConnected && videos.length === 0) {
      refreshVideos();
    }
  }, [isConnected, videos.length, refreshVideos]);

  const currentVideos = videos.slice(0, displayedCount);
  const hasMore = displayedCount < videos.length;

  const handleAnalyze = (videoId: string) => {
    const video = videos.find(v => v.id === videoId);
    if (video) {
      setSelectedVideo(video);
    }
  };

  const handleBack = () => {
    setSelectedVideo(null);
  };

  const handleLoadMore = () => {
    setDisplayedCount(prev => prev + videosPerLoad);
  };

  return (
    <div className="min-h-screen bg-[#12121E] relative flex">
      {/* 사이드바 */}
      <Sidebar />

      {/* 메인 콘텐츠 영역 */}
      <div className={`flex-1 transition-all duration-300 ${
        isSidebarVisible ? 'ml-[260px]' : 'ml-0'
      }`}>
        {/* 1440px 최대 너비 컨테이너 */}
        <div className="max-w-[1440px] mx-auto">
          {/* 헤더 섹션 */}
          <div className="bg-[#12121E] px-8 pt-8 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-[3rem] font-bold text-white">
                  콘텐츠 문제 분석
                </h1>
                <p className="text-white text-sm">
                  콘텐츠의 문제점을 분석하고 개선 방안을 제시합니다.
                </p>
              </div>
            </div>
          </div>
          
          {/* 메인 컨텐츠 */}
          <div className="px-8 pt-8 pb-8">
            {selectedVideo ? (
              <VideoAnalysisDetail video={selectedVideo} onBack={handleBack} />
            ) : (
              !isConnected ? (
                <div className="p-8 text-center">
                  <h2 className="text-xl font-semibold text-white mb-4">YouTube 연결 필요</h2>
                  <p className="text-gray-400">
                    콘텐츠 분석을 하려면 YouTube 계정을 연결해주세요.
                  </p>
                </div>
              ) : isLoading ? (
                <div className="p-8 text-center">
                  <p className="text-white">동영상 데이터를 불러오는 중...</p>
                </div>
              ) : currentVideos.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-white">동영상이 없습니다.</p>
                </div>
              ) : (
                <div>
                  <div className="p-6">
                    {currentVideos.map((video) => (
                      <VideoItem
                        key={video.id}
                        video={video}
                        onAnalyze={handleAnalyze}
                      />
                    ))}
                  </div>

                  {/* 더보기 버튼 */}
                  {hasMore && (
                    <div className="flex justify-center items-center pb-6">
                      <button
                        onClick={handleLoadMore}
                        className="px-6 py-3 bg-[#1c1c28] border border-[#3a3b50] rounded-lg text-white text-base font-medium hover:bg-[#2a2a3a] hover:border-[#ff8953] transition-colors"
                      >
                        더보기
                      </button>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

