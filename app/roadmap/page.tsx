'use client';

import Sidebar from '@/components/dashboard/Sidebar';

export default function RoadmapPage() {

  return (
    <div className="min-h-screen bg-[#12121E] relative flex">
      {/* 사이드바 */}
      <Sidebar />

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 ml-[260px]">
        {/* 1440px 최대 너비 컨테이너 */}
        <div className="max-w-[1440px] mx-auto">
          <div className="px-8 pt-8 pb-4">
            <h1 className="text-[3rem] font-bold text-white">로드맵</h1>
          </div>
          
          <div className="px-8 pt-8 pb-8">
            <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-lg p-8">
              <p className="text-white">로드맵 콘텐츠가 여기에 표시됩니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

