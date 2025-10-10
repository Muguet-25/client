'use client';

import { ArrowRight, Info } from 'lucide-react';

export default function MarketingStrategy() {
  return (
    <div className="w-full">
      {/* 헤더 */}
      <div className="flex justify-between items-start mt-24">
        <h2 className="text-[#f5f5f5] text-[48px] font-bold leading-[54px]">
          추천 마케팅 전략
        </h2>
        <button className="flex items-center gap-2 px-3 py-3 bg-[#ff8953]/40 border border-[#ff8953]/40 rounded-md text-[#ff8953] text-lg font-medium leading-5 hover:bg-[#ff8953]/60 transition-colors">
          예약하러 가기
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* 콘텐츠 */}
      <div className="flex items-center gap-8 mt-8">
        {/* 왼쪽: 최적의 업로드 시간 */}
        <div className="flex flex-col">
          <span className="text-[#aaaaaa] text-base font-normal leading-[18px] mb-2">
            최적의 업로드 시간은
          </span>
          <span className="text-[#f5f5f5] text-[48px] font-bold leading-[54px]">
            오후 6시
          </span>
        </div>

        {/* 구분선 */}
        <div className="w-[2px] h-20 bg-[#3a3b50] rounded-full" />

        {/* 오른쪽: 설명 박스 */}
        <div className="flex-1">
          <div className="relative bg-[#1c1c28] border border-[#3a3b50] rounded px-3 py-3.5 flex items-center gap-3">
            <p className="text-[#f5f5f5] text-base font-normal leading-[19px] flex-1">
              보통 한국은 저녁 8 ~ 10시가 피크지만, 이번주는 명절이라 오후 3시에도 조회수가 급증할것으로 보입니다. 따라서 이번 주는 오후 3 ~ 5시 업로드를 추천드립니다.
            </p>
           
          </div>
        </div>
      </div>
    </div>
  );
}

