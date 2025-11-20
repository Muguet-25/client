"use client";

import { useMemo } from "react";
import Image from "next/image";
import VideoSuccessFactors from "./VideoSuccessFactors";
import { YouTubeVideo } from "@/lib/youtube/types";

interface TopVideoItem {
  id: string;
  title: string;
  thumbnailUrl: string;
  viewCount: number;
  publishedAt?: string;
  likeCount?: number;
}

interface TopVideosProps {
  videos: TopVideoItem[];
  isLoading?: boolean;
  fullVideos?: YouTubeVideo[]; // 전체 비디오 데이터 (성공 요인 분석용)
  videoAnalyticsMap?: Map<string, { averageViewDuration: string }>; // 비디오 Analytics 데이터
  avgViews?: number; // 평균 조회수
}

const fallbackThumbnails = [
  "/img/고양이.jpg",
  "/img/고양이.jpg",
  "/img/고양이.jpg",
];

const formatNumber = (value: number) =>
  new Intl.NumberFormat("ko-KR").format(value);

const formatDate = (date?: string) => {
  if (!date) return "";
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function TopVideos({ 
  videos, 
  isLoading = false, 
  fullVideos = [],
  videoAnalyticsMap = new Map(),
  avgViews = 0
}: TopVideosProps) {
  // 평균 조회수 계산 (props로 받지 않은 경우에만 계산)
  const calculatedAvgViews = useMemo(() => {
    if (avgViews > 0) return avgViews;
    if (fullVideos.length > 0) {
      const totalViews = fullVideos.reduce((sum, v) => sum + parseInt(v.statistics?.viewCount || '0'), 0);
      return totalViews / fullVideos.length;
    }
    return 0;
  }, [fullVideos, avgViews]);
  return (
    <div className="h-full rounded-[20px] mt-20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white text-xl font-semibold">
            조회수 높은 동영상 Top 3
          </h3>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="bg-[#242437] rounded-xl overflow-hidden"
            >
              <div className="relative w-full aspect-video bg-[#303049]" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-[#303049] rounded w-20" />
                <div className="h-4 bg-[#303049] rounded w-full" />
                <div className="h-3 bg-[#303049] rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="bg-[#242437] rounded-xl p-6 text-center text-[#9ca3af]">
          조회수 데이터가 충분하지 않습니다. YouTube 계정을 연결하고
          영상을 업로드하면 자동으로 채워질 거예요.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {videos.map((video, index) => {
            const thumbnail =
              video.thumbnailUrl || fallbackThumbnails[index] || fallbackThumbnails[0];
            return (
              <div
                key={video.id}
                className=" hover:bg-[#2d2d42] border border-[#3a3b50] transition-colors rounded-xl overflow-hidden flex flex-col"
              >
                {/* 썸네일 */}
                <div className="relative w-full aspect-video overflow-hidden">
                  <Image
                    src={thumbnail}
                    alt={video.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                    priority={index === 0}
                  />
                </div>

                {/* 정보 */}
                <div className="p-4 flex flex-col flex-1">
                  {/* 날짜 */}
                  {video.publishedAt && (
                    <div className="text-[#9ca3af] text-sm mb-2">
                      {formatDate(video.publishedAt)}
                    </div>
                  )}
                  
                  {/* 제목 */}
                  <h4 className="text-white text-base font-medium mb-3 line-clamp-2 flex-1">
                    {video.title}
                  </h4>
                  
                  {/* 성공 요인 뱃지 */}
                  {fullVideos.length > 0 && (() => {
                    const fullVideo = fullVideos.find(v => v.id === video.id);
                    if (!fullVideo) return null;
                    
                    const analytics = videoAnalyticsMap.get(video.id);
                    return (
                      <div className="mb-3">
                        <VideoSuccessFactors
                          video={fullVideo}
                          videoAnalytics={analytics}
                          avgViews={calculatedAvgViews}
                        />
                      </div>
                    );
                  })()}
                  
                  {/* 조회수 */}
                  <div className="text-[#9ca3af] text-sm">
                    <span className="text-[#aaaaaa]">조회수</span>{' '}
                    <span className="text-white font-medium">{formatNumber(video.viewCount)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

