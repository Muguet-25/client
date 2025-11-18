'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Sidebar from '@/components/dashboard/Sidebar';
import { useStore } from '@/lib/store';
import { useYouTube } from '@/hooks/useYouTube';
import { YouTubeVideo } from '@/lib/youtube/types';
import { AlertTriangle, Lightbulb, ArrowLeft } from 'lucide-react';

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

// 영상 분석 상세 컴포넌트
function VideoAnalysisDetail({ video, onBack }: { video: YouTubeVideo; onBack: () => void }) {
  // 제목 길이 계산
  const titleLength = video.title?.length || 0;
  
  // 업로드 시간 추출 (publishedAt에서)
  const publishedDate = new Date(video.publishedAt);
  const uploadHour = publishedDate.getHours();
  
  // 키워드 (태그) 추출
  const keywords = video.snippet?.tags || [];
  const keywordText = keywords.length > 0 ? keywords.slice(0, 4).join(', ') + (keywords.length > 4 ? '...' : '') : '없음';
  
  // 통계 데이터
  const views = parseInt(video.statistics?.viewCount || '0');
  const likes = parseInt(video.statistics?.likeCount || '0');
  const comments = parseInt(video.statistics?.commentCount || '0');
  
  // 썸네일
  const thumbnail = video.thumbnails?.high?.url || video.thumbnails?.medium?.url || video.thumbnails?.default?.url || '';
  
  // 제목에서 태그 부분과 메인 제목 분리
  const titleParts = video.title?.split('|') || [video.title || ''];
  const mainTitle = titleParts[titleParts.length - 1].trim();
  const tagTitle = titleParts.length > 1 ? titleParts[0].trim() : '';

  return (
    <div className="space-y-6">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[#f5f5f5] hover:text-[#ff8953] transition-colors mb-4"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>목록으로 돌아가기</span>
      </button>

      {/* 영상 분석결과 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 왼쪽: 분석 결과 */}
        <div className="space-y-6">
          {/* 경고 박스 */}
          <div className="bg-[#ff8953]/20 border border-[#ff8953]/40 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#ff8953] flex-shrink-0 mt-0.5" />
            <p className="text-[#f5f5f5] text-base font-normal">
              CTR이 낮아 초기 노출이 부족했습니다.
            </p>
          </div>

          {/* 메트릭 카드들 */}
          <div className="grid grid-cols-2 gap-4">
            {/* 제목길이 */}
            <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-lg p-4">
              <p className="text-[#aaaaaa] text-sm mb-2">제목길이</p>
              <p className="text-[#f5f5f5] text-2xl font-bold mb-1">{titleLength}</p>
              <p className="text-[#aaaaaa] text-xs">(권장 25~30자)</p>
            </div>

            {/* 업로드시간 */}
            <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-lg p-4">
              <p className="text-[#aaaaaa] text-sm mb-2">업로드시간</p>
              <p className="text-[#f5f5f5] text-2xl font-bold mb-1">{uploadHour}시</p>
              <p className="text-[#aaaaaa] text-xs">(18시 업로드 권장)</p>
            </div>

            {/* 키워드 */}
            <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-lg p-4">
              <p className="text-[#aaaaaa] text-sm mb-2">키워드</p>
              <p className="text-[#f5f5f5] text-base font-normal mb-1 line-clamp-2">{keywordText}</p>
              <p className="text-[#aaaaaa] text-xs">(키워드 부족)</p>
            </div>

            {/* 썸네일 CTR */}
            <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-lg p-4">
              <p className="text-[#aaaaaa] text-sm mb-2">썸네일 CTR</p>
              <p className="text-[#f5f5f5] text-2xl font-bold mb-1">3.2%</p>
              <p className="text-[#aaaaaa] text-xs">(평균 이하)</p>
            </div>
          </div>

          {/* AI 추천 박스 */}
          <div className="bg-[#ff8953]/10 border border-[#ff8953]/30 rounded-lg p-4 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-[#ff8953] flex-shrink-0 mt-0.5" />
            <p className="text-[#f5f5f5] text-sm font-normal leading-relaxed">
              이번 영상은 CTR이 낮고, 업로드 시간이 늦어 초기 노출이 부족했습니다. 업로드 시간을 18시로 조정하고, 제목 길이를 조금 줄이는 것을 추천 합니다
            </p>
          </div>
        </div>

        {/* 오른쪽: 썸네일 */}
        <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-lg p-6">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4">
            <Image
              src={thumbnail}
              alt={video.title || ''}
              fill
              className="object-cover"
            />
            {/* 썸네일 오버레이 텍스트 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent p-4 flex flex-col justify-end">
              {tagTitle && (
                <p className="text-white text-sm mb-2">&lt;{tagTitle}&gt;</p>
              )}
              <p className="text-white text-2xl font-bold leading-tight">{mainTitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 영상 제목 섹션 */}
      <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-lg p-4">
        <p className="text-[#aaaaaa] text-sm mb-2">영상 제목</p>
        <p className="text-[#f5f5f5] text-base font-normal">{video.title}</p>
      </div>

      {/* 통계 섹션 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-lg p-6">
          <p className="text-[#aaaaaa] text-sm mb-2">조회수</p>
          <p className="text-[#f5f5f5] text-3xl font-bold">{views.toLocaleString()}</p>
        </div>
        <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-lg p-6">
          <p className="text-[#aaaaaa] text-sm mb-2">좋아요 수</p>
          <p className="text-[#f5f5f5] text-3xl font-bold">{likes.toLocaleString()}</p>
        </div>
        <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-lg p-6">
          <p className="text-[#aaaaaa] text-sm mb-2">구독자 증가 수</p>
          <p className="text-[#f5f5f5] text-3xl font-bold">41</p>
        </div>
      </div>
    </div>
  );
}

export default function ContentAnalyticsPage() {
  const { isSidebarOpen, isSidebarHovered } = useStore();
  const isSidebarVisible = isSidebarOpen || isSidebarHovered;
  const { videos, isLoading, isConnected, refreshVideos } = useYouTube();
  const [displayedCount, setDisplayedCount] = useState(5);
  const videosPerLoad = 5;
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);

  useEffect(() => {
    if (isConnected && videos.length === 0) {
      refreshVideos();
    }
  }, [isConnected, videos.length, refreshVideos]);

  const currentVideos = videos.slice(0, displayedCount);
  const hasMore = displayedCount < videos.length;

  const handleAnalyze = (videoId: string) => {
    const video = videos.find(v => v.id === videoId);
    if (video) {
      setSelectedVideo(video);
    }
  };

  const handleBack = () => {
    setSelectedVideo(null);
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
                <h1 className="text-[3rem] font-bold text-white">
                  {selectedVideo ? '영상 퍼포먼스 분석' : '콘텐츠 문제 분석'}
                </h1>
                <p className="text-white text-sm">
                  {selectedVideo ? 'AI가 영상의 문제점을 발견하고 해결해줘요' : '콘텐츠의 문제점을 분석하고 개선 방안을 제시합니다.'}
                </p>
              </div>
            </div>
          </div>
          
          {/* 메인 컨텐츠 */}
          <div className="px-8 pt-8 pb-8">
            {selectedVideo ? (
              <VideoAnalysisDetail video={selectedVideo} onBack={handleBack} />
            ) : (
              !isConnected ? (
                <div className="p-8 text-center">
                  <h2 className="text-xl font-semibold text-white mb-4">YouTube 연결 필요</h2>
                  <p className="text-gray-400">
                    콘텐츠 분석을 하려면 YouTube 계정을 연결해주세요.
                  </p>
                </div>
              ) : isLoading ? (
                <div className="p-8 text-center">
                  <p className="text-white">동영상 데이터를 불러오는 중...</p>
                </div>
              ) : currentVideos.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-white">동영상이 없습니다.</p>
                </div>
              ) : (
                <div>
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
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

