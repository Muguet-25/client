'use client';

import Image from 'next/image';
import { useYouTube } from '@/hooks/useYouTube';
import { YouTubeVideo } from '@/lib/youtube/types';
import { useState, useEffect } from 'react';

interface VideoItemProps {
  platform: 'youtube' | 'tiktok';
  thumbnail: string;
  duration: string;
  title: string;
  description: string;
  visibility: string;
  restriction: string;
  scheduledDate: string;
  scheduledTime: string;
}

function VideoItem({
  platform,
  thumbnail,
  duration,
  title,
  description,
  visibility,
  restriction,
  scheduledDate,
  scheduledTime,
}: VideoItemProps) {
  return (
    <div className="grid grid-cols-[44px_1fr_120px_80px_100px_24px] gap-6 items-center py-6 border-b border-[#3a3b50]">
      {/* 플랫폼 아이콘 */}
      <div className="w-11 h-[113px] flex items-center justify-center">
        {platform === 'youtube' ? (
          <svg width="44" height="31" viewBox="0 0 44 31" fill="none">
            {/* YouTube 아이콘 */}
            <path d="M43.0869 4.8533C42.5746 2.97266 41.1091 1.50719 39.2284 0.994844C35.7675 0.0625 22 0.0625 22 0.0625C22 0.0625 8.23251 0.0625 4.77165 0.994844C2.89093 1.50723 1.4254 2.97266 0.913137 4.8533C0 8.31416 0 15.5 0 15.5C0 15.5 0 22.6859 0.913137 26.1467C1.4254 28.0273 2.89093 29.4928 4.77165 30.0052C8.23251 30.9375 22 30.9375 22 30.9375C22 30.9375 35.7675 30.9375 39.2284 30.0052C41.1091 29.4928 42.5746 28.0273 43.0869 26.1467C44 22.6859 44 15.5 44 15.5C44 15.5 44 8.31416 43.0869 4.8533Z" fill="#FF0000"/>
            <path d="M17.5938 22.0312L29.0312 15.5L17.5938 8.96875V22.0312Z" fill="white"/>
          </svg>
        ) : (
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            {/* TikTok 아이콘 플레이스홀더 */}
            <rect width="44" height="44" rx="8" fill="#000000"/>
          </svg>
        )}
      </div>

      {/* 동영상 정보 */}
      <div className="flex gap-2">
        {/* 썸네일 */}
        <div className="relative w-[200px] h-[113px] flex-shrink-0">
          <div className="relative w-full h-full rounded-lg overflow-hidden">
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover"
            />
          </div>
          {/* 재생 시간 */}
          <div className="absolute bottom-1 right-1 bg-black/60 rounded px-1 py-0.5">
            <span className="text-[#f5f5f5] text-[10px] font-normal leading-[20px]">
              {duration}
            </span>
          </div>
        </div>

        {/* 제목과 설명 */}
        <div className="flex flex-col justify-start pt-0">
          <h3 className="text-[#f5f5f5] text-base font-normal leading-[18px] mb-[4px]">
            {title}
          </h3>
          <p className="text-[#aaaaaa] text-base font-normal leading-[18px]">
            {description}
          </p>
        </div>
      </div>

      {/* 공개 상태 */}
      <div className="flex items-center gap-2">
        <span className="text-[#f5f5f5] text-base font-normal leading-[18px]">
          {visibility}
        </span>
      </div>

      {/* 제한사항 */}
      <div className="flex items-center">
        <span className="text-[#aaaaaa] text-base font-normal leading-[18px]">
          {restriction}
        </span>
      </div>

      {/* 예약 일시 */}
      <div className="flex flex-col">
        <span className="text-[#f5f5f5] text-base font-normal">
          {scheduledDate}
        </span>
        <span className="text-[#f5f5f5] text-base font-normal">
          {scheduledTime}
        </span>
      </div>

      
    </div>
  );
}

// YouTube 비디오를 ReservedVideos 형식으로 변환하는 함수
const convertYouTubeVideoToReservedFormat = (video: YouTubeVideo) => {
  // ISO 8601 duration을 MM:SS 형식으로 변환
  const formatDuration = (isoDuration: string): string => {
    // PT4M13S -> 4:13
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

  // 공개 상태 한글 변환
  const getVisibilityText = (privacyStatus: string) => {
    switch (privacyStatus) {
      case 'public': return '전체 공개';
      case 'private': return '비공개';
      case 'unlisted': return '링크로만 공개';
      default: return '알 수 없음';
    }
  };

  // 업로드 상태에 따른 제한사항
  const getRestrictionText = (uploadStatus: string) => {
    switch (uploadStatus) {
      case 'processed': return '없음';
      case 'uploaded': return '처리 중';
      case 'failed': return '업로드 실패';
      default: return '알 수 없음';
    }
  };

  // 날짜 포맷팅 (YYYY.MM.DD.) - 한국 시간대 적용
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // 한국 시간대 (UTC+9) 적용
    const kstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
    const year = kstDate.getFullYear();
    const month = String(kstDate.getMonth() + 1).padStart(2, '0');
    const day = String(kstDate.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}.`;
  };

  // 시간 포맷팅 (오후/오전 HH:MM) - 한국 시간대 적용
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    // 한국 시간대 (UTC+9) 적용
    const kstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
    const hours = kstDate.getHours();
    const minutes = String(kstDate.getMinutes()).padStart(2, '0');
    const period = hours >= 12 ? '오후' : '오전';
    const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    return `${period} ${displayHours}:${minutes}`;
  };

  return {
    platform: 'youtube' as const,
    thumbnail: video.thumbnails?.medium?.url || video.thumbnails?.default?.url || '/placeholder-video.jpg',
    duration: formatDuration(video.duration || 'PT0S'),
    title: video.title,
    description: video.description || '설명 없음',
    visibility: getVisibilityText(video.status?.privacyStatus || 'private'),
    restriction: getRestrictionText(video.status?.uploadStatus || 'processed'),
    scheduledDate: formatDate(video.publishedAt),
    scheduledTime: formatTime(video.publishedAt),
  };
};

export default function ReservedVideos() {
  const { videos, isConnected, isLoading, error, refreshVideos } = useYouTube();
  const [convertedVideos, setConvertedVideos] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 3;

  // YouTube 비디오 데이터를 ReservedVideos 형식으로 변환
  useEffect(() => {
    if (videos && videos.length > 0) {
      const converted = videos.map(convertYouTubeVideoToReservedFormat);
      setConvertedVideos(converted);
    } else {
      setConvertedVideos([]);
    }
  }, [videos]);

  // 컴포넌트 마운트 시 비디오 데이터 로드
  useEffect(() => {
    if (isConnected && videos.length === 0) {
      refreshVideos();
    }
  }, [isConnected, videos.length, refreshVideos]);

  // 페이지네이션 계산
  const totalPages = Math.ceil(convertedVideos.length / videosPerPage);
  const startIndex = (currentPage - 1) * videosPerPage;
  const endIndex = startIndex + videosPerPage;
  const currentVideos = convertedVideos.slice(startIndex, endIndex);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="w-full mx-auto mt-24">
        <div className="mb-8">
          <h1 className="text-[#f5f5f5] text-[48px] font-bold leading-[54px]">
            예약된 동영상
          </h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-[#f5f5f5] text-lg">동영상 목록을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="w-full mx-auto mt-24">
        <div className="mb-8">
          <h1 className="text-[#f5f5f5] text-[48px] font-bold leading-[54px]">
            예약된 동영상
          </h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-red-400 text-lg">오류: {error}</div>
        </div>
      </div>
    );
  }

  // 연결되지 않은 상태
  if (!isConnected) {
    return (
      <div className="w-full mx-auto mt-24">
        <div className="mb-8">
          <h1 className="text-[#f5f5f5] text-[48px] font-bold leading-[54px]">
            예약된 동영상
          </h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-[#aaaaaa] text-lg">YouTube에 연결되어 있지 않습니다.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto mt-24">
      {/* 제목 */}
      <div className="mb-8">
        <h1 className="text-[#f5f5f5] text-[48px] font-bold leading-[54px]">
          예약된 동영상
        </h1>
      </div>

      {/* 테이블 */}
      <div className="bg-transparent overflow-x-auto">
        {/* 테이블 헤더 */}
        <div className="grid grid-cols-[44px_1fr_120px_80px_100px_24px] gap-6 pb-4 border-b border-[#3a3b50]">
          <div className="text-[#aaaaaa] text-base font-normal leading-[18px]">
            플랫폼
          </div>
          <div className="text-[#aaaaaa] text-base font-normal leading-[18px]">
            동영상
          </div>
          <div className="text-[#aaaaaa] text-base font-normal leading-[18px]">
            공개 상태
          </div>
          <div className="text-[#aaaaaa] text-base font-normal leading-[18px]">
            제한사항
          </div>
          <div className="text-[#aaaaaa] text-base font-normal leading-[18px]">
            예약 일시
          </div>
          <div className="w-6 h-6" />
        </div>

        {/* 테이블 바디 */}
        <div>
          {currentVideos.length > 0 ? (
            currentVideos.map((video, index) => (
              <VideoItem key={index} {...video} />
            ))
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-[#aaaaaa] text-lg">동영상이 없습니다.</div>
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {convertedVideos.length > 0 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-11 h-11 flex items-center justify-center rounded text-lg font-medium leading-5 transition-colors ${
                  currentPage === page
                    ? 'bg-[#1c1c28] border border-[#3a3b50] text-[#ff8953]'
                    : 'text-white hover:bg-[#1c1c28] hover:border hover:border-[#3a3b50]'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

