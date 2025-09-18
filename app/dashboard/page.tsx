'use client';

import StatsCard from '@/components/dashboard/StatsCard';
import AgeChart from '@/components/dashboard/AgeChart';
import SubscriberChart from '@/components/dashboard/SubscriberChart';
import DashboardNavigation from '@/components/dashboard/Navigation';
import { useAuthStore } from '@/lib/useAuthStore';
import { Download, Upload } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuthStore();
  
  return (
    <div className="min-h-screen bg-[#12121E]">



      {/* 네비게이션 */}
      <DashboardNavigation />

      
      {/* 헤더 섹션 */}
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-[3rem] font-bold text-white">대시보드</h1>
            <p className="text-white text-sm">어서오세요 {user?.user_metadata?.full_name || '사용자'}님! 돌아오신걸 환영해요!</p>
          </div>
          
          <button className="flex mt-4 items-center gap-2 px-4 py-2 bg-[#ff8953]/40 border border-[#ff8953]/40 rounded-lg text-[#ff8953] text-sm hover:bg-[#ff8953]/60 transition-colors">
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
                value="216,027"
                changePercent="4%"
                changeType="increase"
              />
            </div>
            
            {/* 평균 좋아요 수 */}
            <div className="md:col-span-1">
              <StatsCard
                title="평균 좋아요 수"
                value="12,359"
                changePercent="6%"
                changeType="decrease"
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
        </div>
      </div>
    </div>
  );
}
