"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/useAuthStore';
import { useYouTube } from '@/hooks/useYouTube';
import { useToast } from '@/hooks/useToast';
import { 
  Play, 
  Users, 
  Eye, 
  Heart, 
  MessageCircle, 
  TrendingUp, 
  DollarSign,
  Calendar,
  BarChart3,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

export default function YouTubePage() {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();
  const { success, error } = useToast();
  const {
    isConnected,
    isLoading,
    error: youtubeError,
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
  } = useYouTube();

  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/auth/login');
      return;
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    if (isConnected && channel) {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = getStartDate(dateRange);
      
      refreshAnalytics(startDate, endDate);
      refreshDailyData(startDate, endDate);
    }
  }, [isConnected, channel, dateRange, refreshAnalytics, refreshDailyData]);

  // 연결 상태 변경 시 토스트 메시지 표시
  useEffect(() => {
    if (isConnected && !youtubeError) {
      success("YouTube 연결됨", "YouTube 채널이 성공적으로 연결되었습니다!");
    }
  }, [isConnected, youtubeError, success]);

  const getStartDate = (range: string) => {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }
    
    return startDate.toISOString().split('T')[0];
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* 헤더 */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Play className="w-8 h-8 text-red-500" />
              <h1 className="text-2xl font-bold text-white">YouTube 분석</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {isConnected ? (
                <>
                  <div className="flex space-x-2">
                    {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                      <button
                        key={range}
                        onClick={() => setDateRange(range)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          dateRange === range
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {range === '7d' ? '7일' : range === '30d' ? '30일' : range === '90d' ? '90일' : '1년'}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      refreshChannel();
                      refreshVideos();
                      const endDate = new Date().toISOString().split('T')[0];
                      const startDate = getStartDate(dateRange);
                      refreshAnalytics(startDate, endDate);
                      refreshDailyData(startDate, endDate);
                    }}
                    disabled={isLoading}
                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={disconnect}
                    className="px-4 py-2 text-red-400 hover:text-red-300 border border-red-400 rounded-lg hover:bg-red-400/10 transition-colors"
                  >
                    연결 해제
                  </button>
                </>
              ) : (
                <button
                  onClick={connect}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>YouTube 연결</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {!isConnected ? (
          // 연결되지 않은 상태
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Play className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">YouTube 채널을 연결하세요</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              YouTube 채널을 연결하여 상세한 분석 데이터와 인사이트를 확인할 수 있습니다.
            </p>
            <button
              onClick={connect}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center space-x-2 mx-auto"
            >
              <Play className="w-5 h-5" />
              <span>YouTube 연결하기</span>
            </button>
          </div>
        ) : (
          <>
            {/* 채널 정보 */}
            {channel && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
                <div className="flex items-center space-x-4">
                  <img
                    src={channel.thumbnails.medium.url}
                    alt={channel.title}
                    className="w-16 h-16 rounded-full"
                  />
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white">{channel.title}</h2>
                    <p className="text-gray-400 mb-2">{channel.description}</p>
                    <div className="flex items-center space-x-6 text-sm text-gray-300">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{formatNumber(parseInt(channel.statistics.subscriberCount))} 구독자</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Play className="w-4 h-4" />
                        <span>{formatNumber(parseInt(channel.statistics.videoCount))} 동영상</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{formatNumber(parseInt(channel.statistics.viewCount))} 조회수</span>
                      </div>
                    </div>
                  </div>
                  <a
                    href={`https://youtube.com/channel/${channel.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>
            )}

            {/* 에러 표시 */}
            {youtubeError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-red-400 mb-1">YouTube 연결 오류</h3>
                    <p className="text-sm text-red-300">{youtubeError}</p>
                    {youtubeError.includes('환경 변수') && (
                      <div className="mt-3">
                        <p className="text-xs text-red-200 mb-2">해결 방법:</p>
                        <ol className="text-xs text-red-200 space-y-1 list-decimal list-inside">
                          <li>.env.local 파일이 프로젝트 루트에 있는지 확인</li>
                          <li>NEXT_PUBLIC_YOUTUBE_CLIENT_ID가 설정되어 있는지 확인</li>
                          <li>NEXT_PUBLIC_YOUTUBE_REDIRECT_URI가 설정되어 있는지 확인</li>
                          <li>개발 서버를 재시작</li>
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 분석 데이터 */}
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">총 조회수</p>
                      <p className="text-3xl font-bold text-white">{formatNumber(analytics.views)}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <Eye className="w-6 h-6 text-orange-500" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">총 좋아요</p>
                      <p className="text-3xl font-bold text-white">{formatNumber(analytics.likes)}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <Heart className="w-6 h-6 text-orange-500" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">총 댓글</p>
                      <p className="text-3xl font-bold text-white">{formatNumber(analytics.comments)}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-orange-500" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">예상 수익</p>
                      <p className="text-3xl font-bold text-white">{formatCurrency(analytics.estimatedRevenue)}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-orange-500" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 최근 동영상 */}
            {videos.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
                <h3 className="text-lg font-semibold text-white mb-6">최근 동영상</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.slice(0, 6).map((video) => (
                    <div
                      key={video.id}
                      className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer"
                      onClick={() => setSelectedVideo(selectedVideo === video.id ? null : video.id)}
                    >
                      <img
                        src={video.thumbnails.medium.url}
                        alt={video.title}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                      <h4 className="text-white font-medium text-sm mb-2 line-clamp-2">{video.title}</h4>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{new Date(video.publishedAt).toLocaleDateString('ko-KR')}</span>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>{formatNumber(parseInt(video.statistics.viewCount))}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="w-3 h-3" />
                            <span>{formatNumber(parseInt(video.statistics.likeCount))}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 일별 통계 차트 */}
            {dailyData.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-6">일별 조회수</h3>
                <div className="h-64 flex items-end space-x-1">
                  {dailyData.slice(-30).map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-orange-500 rounded-t"
                        style={{ height: `${(data.views / Math.max(...dailyData.map(d => d.views))) * 200}px` }}
                      ></div>
                      <span className="text-xs text-gray-400 mt-2">
                        {new Date(data.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
