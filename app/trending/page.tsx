'use client';

import DashboardNavigation from '@/components/dashboard/Navigation';
import Chatbot from '@/components/trending/Chatbot';

export default function TrendingPage() {
  return (
    <div className="min-h-screen bg-[#12121E] relative">
      {/* 네비게이션 */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <DashboardNavigation />
      </div>

      {/* 메인 콘텐츠 */}
      <div className="pt-24 h-[calc(100vh-96px)]">
        <div className="h-full">
          <Chatbot />
        </div>
      </div>
    </div>
  );
}

