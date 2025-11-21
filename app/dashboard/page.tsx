'use client';

import { useMemo, useEffect, useState, useCallback } from 'react';
import StatsCard from '@/components/dashboard/StatsCard';
import AgeChart from '@/components/dashboard/AgeChart';
import MarketingStrategy from '@/components/dashboard/MarketingStrategy';
import ReservedVideos from '@/components/dashboard/ReservedVideos';
import Sidebar from '@/components/dashboard/Sidebar';
import TopVideos from '@/components/dashboard/TopVideos';
import InsightSummary from '@/components/dashboard/InsightSummary';
import ChannelHealthScore from '@/components/dashboard/ChannelHealthScore';
import { useAuthStore } from '@/lib/useAuthStore';
import { useStore } from '@/lib/store';
import { useAverageViews } from '@/hooks/useAverageViews';
import { useYouTube } from '@/hooks/useYouTube';
import { Upload } from 'lucide-react';
import { exportCurrentPageAsPdf } from '@/lib/exportPdf';
import { YouTubeAPI } from '@/lib/youtube/api';
import { YouTubeAnalytics, YouTubeAgeGroupData } from '@/lib/youtube/types';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { isSidebarOpen, isSidebarHovered } = useStore();
  const isSidebarVisible = isSidebarOpen || isSidebarHovered;
  const { isConnected: youtubeConnected, connect: connectYouTube, channel, videos, isLoading: youtubeLoading } = useYouTube();
  const { 
    averageViews, 
    averageLikes,
    viewsChangePercent, 
    likesChangePercent,
    viewsChangeType,
    likesChangeType,
    isLoading: viewsLoading, 
    error: viewsError,
    totalVideos
  } = useAverageViews();
  
  // 중앙화된 데이터 상태
  const [channelAnalytics, setChannelAnalytics] = useState<YouTubeAnalytics | null>(null);
  const [ageGroupData, setAgeGroupData] = useState<YouTubeAgeGroupData[]>([]);
  const [videoAnalyticsMap, setVideoAnalyticsMap] = useState<Map<string, { averageViewDuration: string }>>(new Map());
  const [insightsData, setInsightsData] = useState<{ diagnosis: string; weeklyGoal: string; actions: string[] } | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [hasLoadedAnalytics, setHasLoadedAnalytics] = useState(false);
  
  // 현재 구독자 수 가져오기
  const subscriberCount = channel?.statistics?.subscriberCount 
    ? parseInt(channel.statistics.subscriberCount) 
    : 0;

  const topVideos = useMemo(() => {
    if (!videos || videos.length === 0) return [];

    return [...videos]
      .filter((video) => video.status?.privacyStatus === 'public')
      .sort((a, b) => {
        const viewsA = parseInt(a.statistics?.viewCount || '0', 10);
        const viewsB = parseInt(b.statistics?.viewCount || '0', 10);
        return viewsB - viewsA;
      })
      .slice(0, 3)
      .map((video) => ({
        id: video.id,
        title: video.title,
        thumbnailUrl: video.thumbnails?.medium?.url ?? video.thumbnails?.default?.url ?? '',
        viewCount: parseInt(video.statistics?.viewCount || '0', 10),
        likeCount: parseInt(video.statistics?.likeCount || '0', 10),
        publishedAt: video.publishedAt,
      }));
  }, [videos]);

  // 모든 Analytics 데이터를 한 번에 가져오기 (중복 호출 방지)
  const loadAllAnalytics = useCallback(async () => {
    if (!youtubeConnected || !channel || videos.length === 0 || isLoadingAnalytics || hasLoadedAnalytics) {
      return;
    }

    const accessToken = localStorage.getItem('youtube_access_token');
    if (!accessToken) return;

    setIsLoadingAnalytics(true);
    try {
      const youtubeAPI = new YouTubeAPI(accessToken);
      
      // 날짜 범위 계산 (최근 30일)
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // 1. 채널 Analytics 가져오기 (캐시 활용)
      const analytics = await youtubeAPI.getChannelAnalytics(channel.id, startDate, endDate);
      setChannelAnalytics(analytics);

      // 2. 연령대 데이터 가져오기 (캐시 활용)
      const ageData = await youtubeAPI.getAgeGroupData(channel.id, startDate, endDate);
      setAgeGroupData(ageData);

      // 3. 상위 3개 비디오의 Analytics 가져오기 (캐시 활용)
      // topVideos를 직접 계산 (videos에 의존)
      const top3Videos = [...videos]
        .filter((video) => video.status?.privacyStatus === 'public')
        .sort((a, b) => {
          const viewsA = parseInt(a.statistics?.viewCount || '0', 10);
          const viewsB = parseInt(b.statistics?.viewCount || '0', 10);
          return viewsB - viewsA;
        })
        .slice(0, 3);
      
      const analyticsMap = new Map<string, { averageViewDuration: string }>();
      
      for (const video of top3Videos) {
        try {
          const publishedDate = new Date(video.publishedAt);
          const videoStartDate = publishedDate.toISOString().split('T')[0];
          const videoAnalytics = await youtubeAPI.getVideoAnalytics(video.id, videoStartDate, endDate);
          analyticsMap.set(video.id, {
            averageViewDuration: videoAnalytics.averageViewDuration,
          });
        } catch (error) {
          console.error(`비디오 ${video.id} 분석 실패:`, error);
        }
      }
      setVideoAnalyticsMap(analyticsMap);

      // 4. 인사이트 데이터 가져오기 (캐시 활용 - localStorage에 저장된 경우 재사용)
      try {
        const insightsCacheKey = `insights_${channel.id}_${startDate}_${endDate}`;
        const cachedInsights = localStorage.getItem(insightsCacheKey);
        
        if (cachedInsights) {
          const parsed = JSON.parse(cachedInsights);
          // 1시간 이내 캐시면 재사용
          if (Date.now() - parsed.timestamp < 60 * 60 * 1000) {
            setInsightsData(parsed.data);
          } else {
            // 캐시 만료 시 새로 가져오기 (최신 데이터 전달)
            await fetchInsights(channel.id, accessToken, insightsCacheKey, {
              channel,
              videos,
              analytics,
              videoAnalyticsMap: analyticsMap,
            });
          }
        } else {
          // 캐시가 없으면 새로 가져오기 (최신 데이터 전달)
          await fetchInsights(channel.id, accessToken, insightsCacheKey, {
            channel,
            videos,
            analytics,
            videoAnalyticsMap: analyticsMap,
          });
        }
      } catch (error) {
        console.error('인사이트 가져오기 실패:', error);
      }

      setHasLoadedAnalytics(true);
    } catch (error) {
      console.error('Analytics 데이터 로드 실패:', error);
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, [youtubeConnected, channel, videos, isLoadingAnalytics, hasLoadedAnalytics]);

  // 인사이트 데이터 가져오기 함수
  const fetchInsights = async (
    channelId: string, 
    accessToken: string, 
    cacheKey: string,
    currentData?: {
      channel: typeof channel;
      videos: typeof videos;
      analytics: typeof channelAnalytics;
      videoAnalyticsMap: typeof videoAnalyticsMap;
    }
  ) => {
    try {
      // 전달받은 최신 데이터가 있으면 사용, 없으면 상태에서 가져오기
      const dataToUse = currentData || {
        channel,
        videos: videos.filter((v) => v.status?.privacyStatus === 'public'),
        analytics: channelAnalytics,
        videoAnalyticsMap: videoAnalyticsMap,
      };

      // 캐시된 데이터를 준비 (할당량 초과 시 사용)
      // Map을 일반 객체로 변환 (JSON 직렬화를 위해)
      const videoAnalyticsObj: Record<string, { averageViewDuration: string }> = {};
      if (dataToUse.videoAnalyticsMap) {
        dataToUse.videoAnalyticsMap.forEach((value, key) => {
          videoAnalyticsObj[key] = value;
        });
      }

      const cachedData = {
        channel: dataToUse.channel,
        videos: dataToUse.videos,
        analytics: dataToUse.analytics,
        videoAnalyticsMap: videoAnalyticsObj, // Map을 객체로 변환
      };

      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken,
          channelId,
          cachedData, // 캐시된 데이터도 함께 전달
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.insights) {
          const insights = {
            diagnosis: data.insights.diagnosis || "데이터를 분석 중입니다...",
            weeklyGoal: data.insights.weeklyGoal || "이번 주 목표를 설정해주세요.",
            actions: data.insights.actions || [
              "상위 영상 분석하기",
              "업로드 시간 최적화하기",
              "썸네일 개선하기"
            ]
          };
          setInsightsData(insights);
          
          // localStorage에 캐시 저장 (1시간)
          localStorage.setItem(cacheKey, JSON.stringify({
            data: insights,
            timestamp: Date.now()
          }));
        }
      } else if (response.status === 429) {
        // 할당량 초과 시 캐시된 데이터로 재시도
        console.log('할당량 초과 감지, 캐시된 데이터로 재시도');
        const retryResponse = await fetch('/api/insights', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            channelId,
            cachedData, // accessToken 없이 캐시된 데이터만 전달
          }),
        });

        if (retryResponse.ok) {
          const data = await retryResponse.json();
          if (data.success && data.insights) {
            const insights = {
              diagnosis: data.insights.diagnosis || "데이터를 분석 중입니다...",
              weeklyGoal: data.insights.weeklyGoal || "이번 주 목표를 설정해주세요.",
              actions: data.insights.actions || [
                "상위 영상 분석하기",
                "업로드 시간 최적화하기",
                "썸네일 개선하기"
              ]
            };
            setInsightsData(insights);
            
            // localStorage에 캐시 저장 (1시간)
            localStorage.setItem(cacheKey, JSON.stringify({
              data: insights,
              timestamp: Date.now()
            }));
          }
        }
      }
    } catch (error) {
      console.error('인사이트 가져오기 실패:', error);
    }
  };

  // 채널과 비디오가 준비되면 Analytics 데이터 로드 (한 번만)
  useEffect(() => {
    if (youtubeConnected && channel && videos.length > 0 && !hasLoadedAnalytics && !isLoadingAnalytics) {
      loadAllAnalytics();
    }
  }, [youtubeConnected, channel, videos.length, hasLoadedAnalytics, isLoadingAnalytics, loadAllAnalytics]);

  // 비디오가 변경되면 Analytics 다시 로드 (캐시 무효화 시)
  useEffect(() => {
    if (hasLoadedAnalytics && videos.length > 0) {
      // 비디오 목록이 변경되었는지 확인
      const currentTop3Ids = topVideos.slice(0, 3).map(v => v.id).join(',');
      const lastTop3Ids = localStorage.getItem('last_top3_video_ids');
      
      if (lastTop3Ids !== currentTop3Ids) {
        // 상위 3개 비디오가 변경되었으면 Analytics 다시 로드
        setHasLoadedAnalytics(false);
        localStorage.setItem('last_top3_video_ids', currentTop3Ids);
      }
    }
  }, [videos, topVideos, hasLoadedAnalytics]);
  
  return (
    <div className="min-h-screen bg-[#12121E] relative flex">
      {/* 사이드바 */}
      <Sidebar />

      {/* 메인 콘텐츠 영역 */}
      <div className={`flex-1 transition-all duration-300 ${
        isSidebarVisible ? 'ml-[260px]' : 'ml-0'
      }`}>
        {/* YouTube 연결 오버레이 */}
        {!youtubeConnected && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center">
            <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-[20px] p-8 text-center max-w-md mx-4">
              <div className="mb-6">
                <div className="w-16 h-16 bg-[#ff8953] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">YouTube 연결 필요</h2>
                <p className="text-gray-400 mb-6">
                  대시보드에서 YouTube 데이터를 확인하려면<br />
                  YouTube 계정을 연결해주세요.
                </p>
              </div>
              <button 
                onClick={connectYouTube}
                className="w-full px-6 py-3 bg-[#ff8953] text-white rounded-lg hover:bg-[#ff8953]/80 transition-colors text-lg font-medium"
              >
                YouTube 연결하기
              </button>
            </div>
          </div>
        )}

        {/* 1440px 최대 너비 컨테이너 */}
        <div className="max-w-[1440px] mx-auto">
          {/* 헤더 섹션 */}
          <div className="bg-[#12121E] px-8 pt-8 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-[3rem] font-bold text-white">대시보드</h1>
                <p className="text-white text-sm">어서오세요 {user?.user_metadata?.full_name || '사용자'}님! 돌아오신걸 환영해요!</p>
              </div>
              
              <button
                onClick={() => exportCurrentPageAsPdf('dashboard.pdf')}
                className="flex mt-4 items-center gap-2 px-4 py-2 bg-[#ff8953]/40 border border-[#ff8953]/40 rounded-lg text-[#ff8953] text-sm hover:bg-[#ff8953]/60 transition-colors"
              >
                <Upload className="w-4 h-4" />
                내보내기
              </button>
            </div>
          </div>
          
          {/* 메인 컨텐츠 */}
          <div className="px-8 pt-8 pb-8">
          <div className="space-y-6">
          
            {/* 상단 통계 카드들 */}
            <div className="grid grid-cols-1 lg:grid-cols-20 gap-6">
              <StatsCard
                title="평균 조회수"
                value={viewsLoading ? "로딩 중..." : averageViews.toLocaleString()}
                className="lg:col-span-4"
              />
              
              <StatsCard
                title="평균 좋아요 수"
                value={viewsLoading ? "로딩 중..." : averageLikes.toLocaleString()}
                className="lg:col-span-4"
              />

              <StatsCard
                title="총 구독자 수"
                value={youtubeLoading ? "로딩 중..." : subscriberCount.toLocaleString()}
                className="lg:col-span-4"
              />

              <div className="h-full lg:col-span-8">
                <AgeChart 
                  ageGroupData={ageGroupData}
                  isLoading={isLoadingAnalytics}
                />
              </div>
            </div>

              {/* 인사이트 요약 카드 */}
              <InsightSummary 
                insightsData={insightsData}
                isLoading={isLoadingAnalytics}
                channelId={channel?.id}
              />


            {/* 채널 건강 점수 + 레이더 차트 */}
            {/* <div className="w-full">
              <ChannelHealthScore 
                analytics={channelAnalytics}
                videos={videos}
                isLoading={isLoadingAnalytics}
              />
            </div> */}

            {/* 추천 마케팅 전략 */}
            <div className="w-full">
              <MarketingStrategy />
            </div>
            
            <div className="w-full">
              <TopVideos 
                videos={topVideos} 
                isLoading={youtubeLoading} 
                fullVideos={videos}
                videoAnalyticsMap={videoAnalyticsMap}
                avgViews={averageViews}
              />
            </div>


            {/* 예약된 동영상 */}
            <div className="w-full">
              <ReservedVideos />
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
