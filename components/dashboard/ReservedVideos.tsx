'use client';

import Image from 'next/image';

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
              src="/img/고양이.jpg"
              alt={title}
              fill
              className="object-cover"
            />
          </div>
          {/* 재생 시간 */}
          <div className="absolute bottom-1 right-1 bg-black/60 rounded px-1 py-0.5">
            <span className="text-[#f5f5f5] text-xs font-normal leading-[14px]">
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

const mockVideos = [
  {
    platform: 'youtube' as const,
    thumbnail: '/placeholder-video.jpg',
    duration: '8:39',
    title: '집사 Vlog | 고양이와 함께한 하루',
    description: '설명 추가',
    visibility: '전체 공개',
    restriction: '없음',
    scheduledDate: '2025.12.25.',
    scheduledTime: '오후 6:00',
  },
  {
    platform: 'youtube' as const,
    thumbnail: '/placeholder-video.jpg',
    duration: '8:39',
    title: '집사 Vlog | 고양이와 함께한 하루',
    description: '설명 추가',
    visibility: '전체 공개',
    restriction: '없음',
    scheduledDate: '2025.12.25.',
    scheduledTime: '오후 6:00',
  },
  {
    platform: 'youtube' as const,
    thumbnail: '/placeholder-video.jpg',
    duration: '8:39',
    title: '집사 Vlog | 고양이와 함께한 하루',
    description: '설명 추가',
    visibility: '전체 공개',
    restriction: '없음',
    scheduledDate: '2025.12.25.',
    scheduledTime: '오후 6:00',
  },
];

export default function ReservedVideos() {
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
          {mockVideos.map((video, index) => (
            <VideoItem key={index} {...video} />
          ))}
        </div>

        {/* 페이지네이션 */}
        <div className="flex justify-center items-center gap-2 mt-8">
          <button className="w-11 h-11 flex items-center justify-center bg-[#1c1c28] border border-[#3a3b50] rounded text-[#ff8953] text-lg font-medium leading-5">
            1
          </button>
          <button className="w-11 h-11 flex items-center justify-center text-white text-lg font-medium leading-5 hover:bg-[#1c1c28] hover:border hover:border-[#3a3b50] rounded transition-colors">
            2
          </button>
          <button className="w-11 h-11 flex items-center justify-center text-white text-lg font-medium leading-5 hover:bg-[#1c1c28] hover:border hover:border-[#3a3b50] rounded transition-colors">
            3
          </button>
        </div>
      </div>
    </div>
  );
}

