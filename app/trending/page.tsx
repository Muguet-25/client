'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import Chatbot from '@/components/trending/Chatbot';

export default function TrendingPage() {

  return (
    <div className="min-h-screen bg-[#12121E] relative flex">
      {/* 사이드바 */}
      <Sidebar />

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 h-screen ml-[260px]">
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

