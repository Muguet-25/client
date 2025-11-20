'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Sidebar from '@/components/dashboard/Sidebar';
import { useStore } from '@/lib/store';
import { useYouTube } from '@/hooks/useYouTube';
import { YouTubeVideo } from '@/lib/youtube/types';
import { AlertTriangle, Lightbulb, ArrowLeft } from 'lucide-react';
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
  const [videoAnalytics, setVideoAnalytics] = useState<any>(null);
  const [channelSubscribersGained, setChannelSubscribersGained] = useState(0);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [avgTitleLength, setAvgTitleLength] = useState(0);
  const [optimalUploadHour, setOptimalUploadHour] = useState(18);

  // 비디오 Analytics 데이터 가져오기
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!isConnected || !channel) return;

      setIsLoadingAnalytics(true);
      try {
        const accessToken = localStorage.getItem('youtube_access_token');
        if (!accessToken) return;

        const { YouTubeAPI } = await import('@/lib/youtube/api');
        const youtubeAPI = new YouTubeAPI(accessToken);

        // 비디오 분석 데이터
        const endDate = new Date().toISOString().split('T')[0];
        const publishedDate = new Date(video.publishedAt);
        const startDate = publishedDate.toISOString().split('T')[0];
        const analytics = await youtubeAPI.getVideoAnalytics(video.id, startDate, endDate);
        setVideoAnalytics(analytics);

        // 채널 Analytics에서 구독자 증가 가져오기
        const channelEndDate = new Date().toISOString().split('T')[0];
        const channelStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const channelAnalytics = await youtubeAPI.getChannelAnalytics(channel.id, channelStartDate, channelEndDate);
        // 비디오별 구독자 증가는 추정 (채널 전체 증가 / 비디오 수)
        const estimatedSubGain = videos.length > 0 ? Math.round(channelAnalytics.subscribersGained / videos.length) : 0;
        setChannelSubscribersGained(estimatedSubGain);

        // 평균 제목 길이 계산 (최근 30일 공개 영상)
        const recentVideos = videos.filter(v => {
          const pubDate = new Date(v.publishedAt);
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          return pubDate >= thirtyDaysAgo && v.status?.privacyStatus === 'public';
        });
        
        if (recentVideos.length > 0) {
          const totalTitleLength = recentVideos.reduce((sum, v) => sum + (v.title?.length || 0), 0);
          const avgLength = Math.round(totalTitleLength / recentVideos.length);
          setAvgTitleLength(avgLength);
        } else if (videos.length > 0) {
          // 최근 30일 데이터가 없으면 전체 영상으로 계산
          const publicVideos = videos.filter(v => v.status?.privacyStatus === 'public');
          if (publicVideos.length > 0) {
            const totalTitleLength = publicVideos.reduce((sum, v) => sum + (v.title?.length || 0), 0);
            const avgLength = Math.round(totalTitleLength / publicVideos.length);
            setAvgTitleLength(avgLength);
          }
        }

        // 최적 업로드 시간 계산 (최근 성과 좋은 영상들의 평균 업로드 시간)
        const publicVideos = videos.filter(v => v.status?.privacyStatus === 'public');
        if (publicVideos.length > 0) {
          // 조회수 기준 상위 30% 영상들의 업로드 시간 분석
          const sortedVideos = [...publicVideos].sort((a, b) => {
            const viewsA = parseInt(a.statistics?.viewCount || '0');
            const viewsB = parseInt(b.statistics?.viewCount || '0');
            return viewsB - viewsA;
          });
          
          const top30Percent = Math.max(1, Math.ceil(sortedVideos.length * 0.3));
          const topVideos = sortedVideos.slice(0, top30Percent);
          
          const uploadHours = topVideos.map(v => {
            const pubDate = new Date(v.publishedAt);
            return pubDate.getHours();
          });
          
          if (uploadHours.length > 0) {
            // 가장 많이 나타나는 시간대 찾기
            const hourCounts: Record<number, number> = {};
            uploadHours.forEach(hour => {
              hourCounts[hour] = (hourCounts[hour] || 0) + 1;
            });
            
            const mostFrequentHour = Object.entries(hourCounts).reduce((a, b) => 
              hourCounts[parseInt(a[0])] > hourCounts[parseInt(b[0])] ? a : b
            )[0];
            
            setOptimalUploadHour(parseInt(mostFrequentHour));
          }
        }
      } catch (error) {
        console.error('Analytics 가져오기 실패:', error);
      } finally {
        setIsLoadingAnalytics(false);
      }
    };

    fetchAnalytics();
  }, [isConnected, channel, video.id, videos]);

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
  
  // 제목에서 태그 부분과 메인 제목 분리
  const titleParts = video.title?.split('|') || [video.title || ''];
  const mainTitle = titleParts[titleParts.length - 1].trim();
  const tagTitle = titleParts.length > 1 ? titleParts[0].trim() : '';

  return (
    <div className="space-y-6">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[#f5f5f5] hover:text-[#ff8953] transition-colors mb-4"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>목록으로 돌아가기</span>
      </button>

      {/* 영상 건강 리포트 */}
      {/* <VideoHealthReport video={video} /> */}

      {/* 영상 분석결과 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 왼쪽: 분석 결과 */}
        <div className="space-y-6">
          {/* 메트릭 카드들 */}
          <div className="grid grid-cols-2 gap-4">
            {/* 제목길이 */}
            <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-lg p-4">
              <p className="text-[#aaaaaa] text-sm mb-2">제목길이</p>
              <p className="text-[#f5f5f5] text-2xl font-bold mb-1">{titleLength}</p>
              <p className="text-[#aaaaaa] text-xs">
                {isLoadingAnalytics ? '로딩 중...' : 
                 avgTitleLength > 0 ? `(채널 평균 ${avgTitleLength}자)` : 
                 '(권장 25~30자)'}
              </p>
            </div>

            {/* 업로드시간 */}
            <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-lg p-4">
              <p className="text-[#aaaaaa] text-sm mb-2">업로드시간</p>
              <p className="text-[#f5f5f5] text-2xl font-bold mb-1">{uploadHour}시</p>
              <p className="text-[#aaaaaa] text-xs">
                {isLoadingAnalytics ? '로딩 중...' : 
                 optimalUploadHour > 0 ? `(최적 시간 ${optimalUploadHour}시)` : 
                 '(권장 18시)'}
              </p>
            </div>

            {/* 키워드 */}
            <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-lg p-4">
              <p className="text-[#aaaaaa] text-sm mb-2">키워드</p>
              <p className="text-[#f5f5f5] text-base font-normal mb-1 line-clamp-2">{keywordText}</p>
              <p className="text-[#aaaaaa] text-xs">
                {keywords.length === 0 ? '(키워드 없음)' :
                 keywords.length < 3 ? '(키워드 부족)' :
                 keywords.length < 5 ? '(키워드 적정)' :
                 '(키워드 충분)'}
              </p>
            </div>
          </div>

          {/* AI 추천 박스 */}
          {/* {videoAnalytics && (
            <div className="bg-[#ff8953]/10 border border-[#ff8953]/30 rounded-lg p-4 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-[#ff8953] flex-shrink-0 mt-0.5" />
              <p className="text-[#f5f5f5] text-sm font-normal leading-relaxed">
                {channelAvgCtr > 0 && actualCtr < channelAvgCtr * 0.8 
                  ? `이번 영상은 CTR이 ${actualCtr.toFixed(2)}%로 채널 평균(${channelAvgCtr.toFixed(2)}%)보다 낮습니다. ${optimalUploadHour > 0 && uploadHour !== optimalUploadHour ? `업로드 시간을 ${optimalUploadHour}시로 조정하고, ` : ''}제목 길이를 조금 줄이고 썸네일을 개선하는 것을 추천합니다.`
                  : channelAvgCtr > 0 && actualCtr >= channelAvgCtr * 1.2
                  ? `이번 영상은 CTR이 ${actualCtr.toFixed(2)}%로 채널 평균(${channelAvgCtr.toFixed(2)}%)보다 높습니다. 현재 전략을 유지하면서 더 나은 성과를 위해 제목과 썸네일을 지속적으로 개선해보세요.`
                  : channelAvgCtr > 0
                  ? `이번 영상은 CTR이 ${actualCtr.toFixed(2)}%로 채널 평균(${channelAvgCtr.toFixed(2)}%) 수준입니다. ${optimalUploadHour > 0 && uploadHour !== optimalUploadHour ? `업로드 시간을 ${optimalUploadHour}시로 조정하고, ` : ''}제목과 썸네일을 개선하여 더 나은 성과를 노려보세요.`
                  : `이번 영상의 CTR은 ${actualCtr.toFixed(2)}%입니다. ${optimalUploadHour > 0 && uploadHour !== optimalUploadHour ? `업로드 시간을 ${optimalUploadHour}시로 조정하고, ` : ''}제목과 썸네일을 개선하여 더 나은 성과를 노려보세요.`
                }
              </p>
            </div>
          )} */}
        </div>

        {/* 오른쪽: 썸네일 */}
        <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-lg p-6">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4">
            <Image
              src={thumbnail}
              alt={video.title || ''}
              fill
              className="object-cover"
            />
            {/* 썸네일 오버레이 텍스트 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent p-4 flex flex-col justify-end">
              {tagTitle && (
                <p className="text-white text-sm mb-2">&lt;{tagTitle}&gt;</p>
              )}
              <p className="text-white text-2xl font-bold leading-tight">{mainTitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 영상 제목 섹션 */}
      <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-lg p-4">
        <p className="text-[#aaaaaa] text-sm mb-2">영상 제목</p>
        <p className="text-[#f5f5f5] text-base font-normal">{video.title}</p>
      </div>

      {/* 통계 섹션 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-lg p-6">
          <p className="text-[#aaaaaa] text-sm mb-2">조회수</p>
          <p className="text-[#f5f5f5] text-3xl font-bold">{views.toLocaleString()}</p>
        </div>
        <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-lg p-6">
          <p className="text-[#aaaaaa] text-sm mb-2">좋아요 수</p>
          <p className="text-[#f5f5f5] text-3xl font-bold">{likes.toLocaleString()}</p>
        </div>
        <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-lg p-6">
          <p className="text-[#aaaaaa] text-sm mb-2">구독자 증가 수 (추정)</p>
          <p className="text-[#f5f5f5] text-3xl font-bold">
            {isLoadingAnalytics ? '...' : channelSubscribersGained.toLocaleString()}
          </p>
          <p className="text-[#aaaaaa] text-xs mt-1">*비디오별 구독자 증가는 추정치입니다</p>
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

