'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Sidebar from '@/components/dashboard/Sidebar';
import { useStore } from '@/lib/store';
import { useYouTube } from '@/hooks/useYouTube';
import { YouTubeVideo } from '@/lib/youtube/types';

interface VideoItemProps {
  video: YouTubeVideo;
  onAnalyze: (videoId: string) => void;
}

function VideoItem({ video, onAnalyze }: VideoItemProps) {
  // ISO 8601 duration을 MM:SS 형식으로 변환
  const formatDuration = (isoDuration: string): string => {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0:00';
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  const duration = formatDuration(video.duration || 'PT0S');
  const thumbnail = video.thumbnails?.medium?.url || video.thumbnails?.default?.url || '';
  const title = video.title || '제목 없음';
  const description = video.description || '설명 추가';

  return (
    <div className="flex items-center gap-4 py-4 border-b border-[#3a3b50]">
      {/* YouTube 재생 버튼 아이콘 */}
      <div className="flex-shrink-0">
        <svg width="44" height="31" viewBox="0 0 44 31" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M43.0869 4.8533C42.5746 2.97266 41.1091 1.50719 39.2284 0.994844C35.7675 0.0625 22 0.0625 22 0.0625C22 0.0625 8.23251 0.0625 4.77165 0.994844C2.89093 1.50723 1.4254 2.97266 0.913137 4.8533C0 8.31416 0 15.5 0 15.5C0 15.5 0 22.6859 0.913137 26.1467C1.4254 28.0273 2.89093 29.4928 4.77165 30.0052C8.23251 30.9375 22 30.9375 22 30.9375C22 30.9375 35.7675 30.9375 39.2284 30.0052C41.1091 29.4928 42.5746 28.0273 43.0869 26.1467C44 22.6859 44 15.5 44 15.5C44 15.5 44 8.31416 43.0869 4.8533Z" fill="#FF0000"/>
          <path d="M17.5938 22.0312L29.0312 15.5L17.5938 8.96875V22.0312Z" fill="white"/>
        </svg>
      </div>

      {/* 썸네일 */}
      <div className="relative w-[200px] h-[113px] flex-shrink-0 rounded-lg overflow-hidden">
        <Image
          src={thumbnail}
          alt={title}
          fill
          className="object-cover"
        />
        {/* 썸네일 왼쪽 하단 제목 오버레이 */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
          <p className="text-white text-xs font-medium line-clamp-1">{title}</p>
        </div>
        {/* 썸네일 오른쪽 하단 재생 시간 */}
        <div className="absolute bottom-2 right-2 bg-black/70 rounded px-1.5 py-0.5">
          <span className="text-white text-[10px] font-normal">{duration}</span>
        </div>
      </div>

      {/* 동영상 제목 */}
      <div className="flex-1 min-w-0">
        <h3 className="text-[#f5f5f5] text-base font-normal leading-[18px] mb-1 line-clamp-1">
          {title}
        </h3>
        <p className="text-[#aaaaaa] text-sm font-normal leading-[18px]">
          {description || '설명 추가'}
        </p>
      </div>

      {/* 영상 분석하기 버튼 */}
      <button
        onClick={() => onAnalyze(video.id)}
        className="flex-shrink-0 px-4 py-2 bg-[#ff8953] text-white rounded-lg hover:bg-[#ff8953]/80 transition-colors text-sm font-medium"
      >
        영상 분석하기
      </button>
    </div>
  );
}

export default function ContentAnalyticsPage() {
  const { isSidebarOpen, isSidebarHovered } = useStore();
  const isSidebarVisible = isSidebarOpen || isSidebarHovered;
  const { videos, isLoading, isConnected, refreshVideos } = useYouTube();
  const [displayedCount, setDisplayedCount] = useState(5);
  const videosPerLoad = 5;

  useEffect(() => {
    if (isConnected && videos.length === 0) {
      refreshVideos();
    }
  }, [isConnected, videos.length, refreshVideos]);

  const currentVideos = videos.slice(0, displayedCount);
  const hasMore = displayedCount < videos.length;

  const handleAnalyze = (videoId: string) => {
    // TODO: 영상 분석 기능 구현
    console.log('영상 분석:', videoId);
  };

  const handleLoadMore = () => {
    setDisplayedCount(prev => prev + videosPerLoad);
  };

  return (
    <div className="min-h-screen bg-[#12121E] relative flex">
      {/* 사이드바 */}
      <Sidebar />

      {/* 메인 콘텐츠 영역 */}
      <div className={`flex-1 transition-all duration-300 ${
        isSidebarVisible ? 'ml-[260px]' : 'ml-0'
      }`}>
        {/* 1440px 최대 너비 컨테이너 */}
        <div className="max-w-[1440px] mx-auto">
          {/* 헤더 섹션 */}
          <div className="bg-[#12121E] px-8 pt-8 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-[3rem] font-bold text-white">콘텐츠 문제 분석</h1>
                <p className="text-white text-sm">콘텐츠의 문제점을 분석하고 개선 방안을 제시합니다.</p>
              </div>
            </div>
          </div>
          
          {/* 메인 컨텐츠 */}
          <div className="px-8 pt-8 pb-8">
            {!isConnected ? (
              <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-lg p-8 text-center">
                <h2 className="text-xl font-semibold text-white mb-4">YouTube 연결 필요</h2>
                <p className="text-gray-400">
                  콘텐츠 분석을 하려면 YouTube 계정을 연결해주세요.
                </p>
              </div>
            ) : isLoading ? (
              <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-lg p-8 text-center">
                <p className="text-white">동영상 데이터를 불러오는 중...</p>
              </div>
            ) : currentVideos.length === 0 ? (
              <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-lg p-8 text-center">
                <p className="text-white">동영상이 없습니다.</p>
              </div>
            ) : (
              <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-lg">
                <div className="p-6">
                  {currentVideos.map((video) => (
                    <VideoItem
                      key={video.id}
                      video={video}
                      onAnalyze={handleAnalyze}
                    />
                  ))}
                </div>

                {/* 더보기 버튼 */}
                {hasMore && (
                  <div className="flex justify-center items-center pb-6">
                    <button
                      onClick={handleLoadMore}
                      className="px-6 py-3 bg-[#1c1c28] border border-[#3a3b50] rounded-lg text-white text-base font-medium hover:bg-[#2a2a3a] hover:border-[#ff8953] transition-colors"
                    >
                      더보기
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

