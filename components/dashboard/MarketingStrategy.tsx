'use client';

import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

interface UploadRecommendation {
  success: boolean;
  data: {
    date: string;
    dayName: string;
    contentType: string;
    recommendation: string;
    extractedTime: string;
    timestamp: string;
  };
  timestamp: string;
}

export default function MarketingStrategy() {
  const [recommendation, setRecommendation] = useState<string>('추천 정보를 불러오는 중...');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [extractedTime, setExtractedTime] = useState<string>('');
  useEffect(() => {
    const fetchRecommendation = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload-time/recommend`);
        
        if (!response.ok) {
          throw new Error('추천 정보를 가져오는데 실패했습니다.');
        }
        
        const data: UploadRecommendation = await response.json();
        
        if (data.success && data.data.recommendation) {
          setRecommendation(data.data.recommendation);
          setExtractedTime("오후 " + data.data.extractedTime);
          
        } else {
          throw new Error('추천 정보를 찾을 수 없습니다.');
        }
      } catch (err) {
        console.error('추천 정보 가져오기 실패:', err);
        setError('추천 정보를 불러올 수 없습니다.');
        setRecommendation('추천 정보를 불러올 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendation();
  }, []);
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
            {extractedTime}
          </span>
        </div>

        {/* 구분선 */}
        <div className="w-[2px] h-20 bg-[#3a3b50] rounded-full" />

        {/* 오른쪽: 설명 박스 */}
        <div className="flex-1">
          <div className="relative bg-[#1c1c28] border border-[#3a3b50] rounded px-3 py-3.5 flex items-center gap-3">
            <p className="text-[#f5f5f5] text-base font-normal leading-[19px] flex-1">
              {recommendation}
            </p>
            {error && (
              <div className="text-red-400 text-sm">
                ⚠️ {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

