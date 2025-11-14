'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import ReportHeader from '@/components/report/ReportHeader';
import Calendar from '@/components/report/Calendar';
import VideoDetailModal from '@/components/report/VideoDetailModal';
import { useYouTube } from '@/hooks/useYouTube';
import { useStore } from '@/lib/store';
import { useEffect, useState } from 'react';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  thumbnail?: string;
  views?: number;
  duration?: string;
  likes?: number;
  publishedAt: string;
}

export default function ReportPage() {
  const { isConnected, videos, isLoading, error } = useYouTube();
  const { isSidebarOpen, isSidebarHovered } = useStore();
  const isSidebarVisible = isSidebarOpen || isSidebarHovered;
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // YouTube 동영상 데이터를 달력 이벤트 형식으로 변환
  useEffect(() => {
    if (videos && videos.length > 0) {
      const events: CalendarEvent[] = videos.map(video => ({
        id: video.id,
        title: video.title,
        date: new Date(video.publishedAt),
        thumbnail: video.thumbnails?.medium?.url || video.thumbnails?.default?.url,
        views: parseInt(video.statistics.viewCount),
        likes: parseInt(video.statistics.likeCount),
        duration: video.duration,
        publishedAt: video.publishedAt
      }));
      setCalendarEvents(events);
    }
  }, [videos]);

  const handleVideoClick = (video: CalendarEvent) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
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
          <ReportHeader />
          
          {/* YouTube 연결 상태에 따른 메시지 */}
          {!isConnected ? (
            <div className="px-8 pt-8 pb-8">
              <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-lg p-8 text-center">
                <h2 className="text-xl font-semibold text-white mb-4">YouTube 연결 필요</h2>
                <p className="text-gray-400 mb-6">
                  리포트를 보려면 YouTube 계정을 연결해주세요.
                </p>
              </div>
            </div>
          ) : isLoading ? (
            <div className="px-8 pt-8 pb-8">
              <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-lg p-8 text-center">
                <p className="text-white">동영상 데이터를 불러오는 중...</p>
              </div>
            </div>
          ) : error ? (
            <div className="px-8 pt-8 pb-8">
              <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-lg p-8 text-center">
                <h2 className="text-xl font-semibold text-red-400 mb-4">오류 발생</h2>
                <p className="text-gray-400">{error}</p>
              </div>
            </div>
          ) : (
            <div className="px-8 pt-8 pb-8">
              <Calendar events={calendarEvents} onVideoClick={handleVideoClick} />
            </div>
          )}
        </div>

        {/* 영상 세부정보 모달 */}
        <VideoDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          video={selectedVideo}
        />
      </div>
    </div>
  );
}
