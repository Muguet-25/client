'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import Chatbot from '@/components/trending/Chatbot';
import { useStore } from '@/lib/store';

export default function TrendingPage() {
  const { isSidebarOpen, isSidebarHovered } = useStore();
  const isSidebarVisible = isSidebarOpen || isSidebarHovered;

  return (
    <div className="min-h-screen bg-[#12121E] relative flex">
      {/* 사이드바 */}
      <Sidebar />

      {/* 메인 콘텐츠 영역 */}
      <div className={`flex-1 h-screen transition-all duration-300 ${
        isSidebarVisible ? 'ml-[260px]' : 'ml-0'
      }`}>
        {/* 1440px 최대 너비 컨테이너 */}
        <div className="max-w-[1440px] mx-auto h-full">
          <div className="h-full">
            <Chatbot />
          </div>
        </div>
      </div>
    </div>
  );
}

