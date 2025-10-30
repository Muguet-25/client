'use client';

import { X } from 'lucide-react';

interface VideoDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: {
    id: string;
    title: string;
    thumbnail?: string;
    views?: number;
    likes?: number;
    publishedAt: string;
    duration?: string;
  } | null;
}

export default function VideoDetailModal({ isOpen, onClose, video }: VideoDetailModalProps) {
  if (!isOpen || !video) return null;

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-[20px] w-full max-w-[723px] max-h-[893px] overflow-hidden">
        {/* 헤더 */}
        <div className="p-6 pb-0">
          <h2 className="text-[48px] font-bold text-[#f5f5f5] leading-[54px]">
            자세히 보기
          </h2>
        </div>

        {/* 콘텐츠 */}
        <div className="p-6 pt-4">
          {/* 썸네일 */}
          <div className="w-full h-[381px] bg-[#12121e] border border-[#3a3b50] rounded-2xl mb-6 overflow-hidden">
            {video.thumbnail ? (
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#f5f5f5]/60">
                썸네일 없음
              </div>
            )}
          </div>

          {/* 영상 제목 */}
          <div className="mb-6">
            <div className="text-[#f5f5f5]/60 text-base mb-2">영상 제목</div>
            <div className="bg-[#12121e] border border-[#3a3b50] rounded-2xl p-6">
              <h3 className="text-[#f5f5f5] text-base leading-[18px]">
                {video.title}
              </h3>
            </div>
          </div>

          {/* 통계 카드들 */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* 조회수 카드 */}
            <div className="bg-[#12121e] border border-[#3a3b50] rounded-[20px] p-6">
              <div className="flex flex-col justify-center items-start h-full">
                <div className="text-[#f5f5f5] text-base mb-2">조회수</div>
                <div className="text-[#e2e2e4] text-2xl font-semibold leading-[26px]">
                  {video.views ? formatNumber(video.views) : '0'}
                </div>
              </div>
            </div>

            {/* 좋아요 카드 */}
            <div className="bg-[#12121e] border border-[#3a3b50] rounded-[20px] p-6">
              <div className="flex flex-col justify-center items-start h-full">
                <div className="text-[#f5f5f5] text-base mb-2">좋아요 수</div>
                <div className="text-[#e2e2e4] text-2xl font-semibold leading-[26px]">
                  {video.likes ? formatNumber(video.likes) : '0'}
                </div>
              </div>
            </div>
          </div>

          {/* 닫기 버튼 */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-[#1c1c28] border border-[#3a3b50] rounded-2xl px-8 py-4 text-[#f5f5f5]/60 text-lg font-medium hover:bg-[#3a3b50] transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
