'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import ReportHeader from '@/components/report/ReportHeader';
import Calendar from '@/components/report/Calendar';
import VideoDetailModal from '@/components/report/VideoDetailModal';
import UploadRoutine from '@/components/report/UploadRoutine';
import PlanVideoModal from '@/components/report/PlanVideoModal';
import { useYouTube } from '@/hooks/useYouTube';
import { useStore } from '@/lib/store';
import { useEffect, useState, useMemo } from 'react';
import { Plus } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  thumbnail?: string;
  views?: number;
  duration?: string;
  likes?: number;
  publishedAt: string;
  performance?: 'high' | 'medium' | 'low';
  avgViews?: number;
  isPlanned?: boolean; // 계획 영상 여부
  status?: 'idea' | 'planned' | 'in_progress';
  experimentPurpose?: string;
}

export default function ReportPage() {
  const { isConnected, videos, isLoading, error } = useYouTube();
  const { isSidebarOpen, isSidebarHovered } = useStore();
  const isSidebarVisible = isSidebarOpen || isSidebarHovered;
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedDateForPlan, setSelectedDateForPlan] = useState<Date | undefined>();

  // 평균 조회수 계산 (성과 비교용)
  const avgViews = useMemo(() => {
    if (!videos || videos.length === 0) return 0;
    const totalViews = videos.reduce((sum, video) => 
      sum + parseInt(video.statistics?.viewCount || '0'), 0
    );
    return totalViews / videos.length;
  }, [videos]);

  // YouTube 동영상 데이터를 달력 이벤트 형식으로 변환
  useEffect(() => {
    if (videos && videos.length > 0) {
      const events: CalendarEvent[] = videos.map(video => {
        const views = parseInt(video.statistics?.viewCount || '0');
        // 성과 지표 계산 (평균 대비)
        let performance: 'high' | 'medium' | 'low' | undefined;
        if (avgViews > 0) {
          if (views >= avgViews * 1.2) {
            performance = 'high';
          } else if (views <= avgViews * 0.8) {
            performance = 'low';
          } else {
            performance = 'medium';
          }
        }

        return {
          id: video.id,
          title: video.title,
          date: new Date(video.publishedAt),
          thumbnail: video.thumbnails?.medium?.url || video.thumbnails?.default?.url,
          views,
          likes: parseInt(video.statistics?.likeCount || '0'),
          duration: video.duration,
          publishedAt: video.publishedAt,
          performance,
          avgViews,
        };
      });
      setCalendarEvents(events);
    }
  }, [videos, avgViews]);

  const handleVideoClick = (video: CalendarEvent) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
  };

  const handleAddPlan = (plan: {
    title: string;
    date: Date;
    time?: string;
    experimentPurpose?: string;
    status: 'idea' | 'planned' | 'in_progress';
  }) => {
    const newEvent: CalendarEvent = {
      id: `plan-${Date.now()}`,
      title: plan.title,
      date: plan.date,
      publishedAt: plan.date.toISOString(),
      isPlanned: true,
      status: plan.status,
      experimentPurpose: plan.experimentPurpose,
    };
    setCalendarEvents((prev) => [...prev, newEvent]);
  };

  const handleCalendarDateClick = (date: Date) => {
    // 미래 날짜만 계획 추가 가능
    if (date >= new Date(new Date().setHours(0, 0, 0, 0))) {
      setSelectedDateForPlan(date);
      setIsPlanModalOpen(true);
    }
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
              {/* 업로드 루틴 분석 */}
              <UploadRoutine videos={videos} />
              
             
              {/* 캘린더 */}
              <Calendar 
                events={calendarEvents} 
                onVideoClick={handleVideoClick}
                onDateClick={handleCalendarDateClick}
              />
              
              {/* 범례 */}
              <div className="mt-6 flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-[#aaaaaa]">평균보다 높은 성과</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <span className="text-[#aaaaaa]">평균 성과</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-[#aaaaaa]">평균보다 낮은 성과</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 영상 세부정보 모달 */}
        <VideoDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          video={selectedVideo}
        />

        {/* 계획 영상 추가 모달 */}
        <PlanVideoModal
          isOpen={isPlanModalOpen}
          onClose={() => setIsPlanModalOpen(false)}
          onSave={handleAddPlan}
          selectedDate={selectedDateForPlan}
        />
      </div>
    </div>
  );
}
