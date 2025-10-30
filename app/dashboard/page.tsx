'use client';

import StatsCard from '@/components/dashboard/StatsCard';
import AgeChart from '@/components/dashboard/AgeChart';
import SubscriberChart from '@/components/dashboard/SubscriberChart';
import MarketingStrategy from '@/components/dashboard/MarketingStrategy';
import ReservedVideos from '@/components/dashboard/ReservedVideos';
import DashboardNavigation from '@/components/dashboard/Navigation';
import { useAuthStore } from '@/lib/useAuthStore';
import { useAverageViews } from '@/hooks/useAverageViews';
import { useYouTube } from '@/hooks/useYouTube';
import { Upload } from 'lucide-react';
import { exportCurrentPageAsPdf } from '@/lib/exportPdf';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { isConnected: youtubeConnected, connect: connectYouTube } = useYouTube();
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
  
  return (
    <div className="min-h-screen bg-[#12121E] relative">
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



      {/* 네비게이션 */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <DashboardNavigation />
      </div>
      

      
      {/* 헤더 섹션 */}
      <div className="bg-[#12121E] max-w-7xl mx-auto px-6 pt-8 pb-4 mt-12">
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
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-8">
        <div className="space-y-6">
          {/* 상단 통계 카드들 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* 평균 조회수 */}
            <div className="md:col-span-1">
              <StatsCard
                title="평균 조회수"
                value={viewsLoading ? "로딩 중..." : averageViews.toLocaleString()}
              />
            </div>
            
            {/* 평균 좋아요 수 */}
            <div className="md:col-span-1">
              <StatsCard
                title="평균 좋아요 수"
                value={viewsLoading ? "로딩 중..." : averageLikes.toLocaleString()}
              />
            </div>
            
            {/* 시청자 연령 층 */}
            <div className="md:col-span-2">
              <AgeChart />
            </div>
          </div>

          {/* 구독자 차트 */}
          <div className="w-full">
            <SubscriberChart />
          </div>

          {/* 추천 마케팅 전략 */}
          <div className="w-full">
            <MarketingStrategy />
          </div>

          {/* 예약된 동영상 */}
          <div className="w-full">
            <ReservedVideos />
          </div>
        </div>
      </div>
    </div>
  );
}
