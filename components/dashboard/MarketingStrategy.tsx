'use client';

import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import VideoUploadModal from './VideoUploadModal';
import { useYouTube } from '@/hooks/useYouTube';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { invalidateVideosCache, refreshVideos } = useYouTube();
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
      {/* 콘텐츠 */}
      <div className="border border-[#3a3b50] rounded-[20px] p-6 mt-20">
        <h3 className="text-white text-xl font-semibold mb-4">업로드 시간 추천</h3>
        
        <div className="space-y-4">
          {/* 최적의 업로드 시간 */}
          <div className="flex items-center gap-8">
            {/* 왼쪽: 최적의 업로드 시간 */}
            <div className="flex flex-col">
              <span className="text-[#aaaaaa] text-base font-normal leading-[18px] mb-2">
                최적의 업로드 시간은
              </span>
              {isLoading ? (
                <div className="h-[54px] w-32 bg-[#3a3b50]/50 rounded animate-pulse" />
              ) : (
                <span className="text-[#f5f5f5] text-[48px] font-bold leading-[54px]">
                  {extractedTime || ''}
                </span>
              )}
            </div>

            {/* 구분선 */}
            <div className="w-[2px] h-20 bg-[#3a3b50] rounded-full" />

            {/* 오른쪽: 설명 박스와 버튼 */}
            <div className="flex-1 flex items-center gap-4">
              <div className="flex-1 relative bg-[#12121E] border border-[#3a3b50] rounded-lg px-4 py-4">
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-[#3a3b50]/50 rounded animate-pulse" style={{ width: '100%' }} />
                    <div className="h-4 bg-[#3a3b50]/50 rounded animate-pulse" style={{ width: '80%' }} />
                  </div>
                ) : (
                  <p className="text-[#f5f5f5] text-base font-normal leading-relaxed">
                    {recommendation}
                  </p>
                )}
                {error && (
                  <div className="text-red-400 text-sm mt-2">
                    ⚠️ {error}
                  </div>
                )}
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-3 bg-[#ff8953]/40 border border-[#ff8953]/40 rounded-lg text-[#ff8953] text-base font-medium hover:bg-[#ff8953]/60 transition-colors whitespace-nowrap"
              >
                예약하기
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 추가 통계 정보 */}
        </div>
      </div>

      {/* 비디오 업로드 모달 */}
      <VideoUploadModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUploadSuccess={async () => {
          // 업로드 완료 후 비디오 목록 캐시 무효화 및 새로고침
          invalidateVideosCache();
          await refreshVideos();
        }}
      />
    </div>
  );
}

