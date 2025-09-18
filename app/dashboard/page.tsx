'use client';

import StatsCard from '@/components/dashboard/StatsCard';
import AgeChart from '@/components/dashboard/AgeChart';
import SubscriberChart from '@/components/dashboard/SubscriberChart';
import DashboardNavigation from '@/components/dashboard/Navigation';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#12121e]">
      {/* 네비게이션 */}
      <DashboardNavigation />
      
      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* 상단 통계 카드들 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 평균 조회수 */}
            <StatsCard
              title="평균 조회수"
              value="216,027"
              changePercent="4%"
              changeType="increase"
            />
            
            {/* 평균 좋아요 수 */}
            <StatsCard
              title="평균 좋아요 수"
              value="12,359"
              changePercent="6%"
              changeType="decrease"
            />
            
            {/* 시청자 연령 층 */}
            <div className="lg:col-span-1">
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
