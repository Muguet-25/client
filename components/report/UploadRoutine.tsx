'use client';

import { useMemo } from 'react';
import { Calendar, TrendingUp, Clock } from 'lucide-react';

interface UploadRoutineProps {
  videos?: Array<{ publishedAt: string }>;
}

export default function UploadRoutine({ videos = [] }: UploadRoutineProps) {
  // 최근 30일 업로드 규칙성 계산
  const routineStats = useMemo(() => {
    if (!videos || videos.length === 0) {
      return {
        streak: 0,
        avgInterval: 0,
        bestPattern: '데이터 부족',
        consistency: 0,
      };
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentVideos = videos
      .filter(v => new Date(v.publishedAt) >= thirtyDaysAgo)
      .map(v => new Date(v.publishedAt))
      .sort((a, b) => a.getTime() - b.getTime());

    // 연속 업로드 일수 (스트릭)
    let streak = 0;
    if (recentVideos.length > 0) {
      const lastUpload = recentVideos[recentVideos.length - 1];
      const daysSinceLastUpload = Math.floor((now.getTime() - lastUpload.getTime()) / (24 * 60 * 60 * 1000));
      
      if (daysSinceLastUpload <= 1) {
        streak = 1;
        for (let i = recentVideos.length - 2; i >= 0; i--) {
          const daysDiff = Math.floor((recentVideos[i + 1].getTime() - recentVideos[i].getTime()) / (24 * 60 * 60 * 1000));
          if (daysDiff <= 1) {
            streak++;
          } else {
            break;
          }
        }
      }
    }

    // 평균 업로드 간격
    let avgInterval = 0;
    if (recentVideos.length > 1) {
      const intervals: number[] = [];
      for (let i = 1; i < recentVideos.length; i++) {
        const daysDiff = (recentVideos[i].getTime() - recentVideos[i - 1].getTime()) / (24 * 60 * 60 * 1000);
        intervals.push(daysDiff);
      }
      avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    }

    // 가장 성적이 좋았던 업로드 패턴 (요일별 분석)
    const dayCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    recentVideos.forEach(date => {
      dayCounts[date.getDay()]++;
    });
    
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const maxDay = Object.entries(dayCounts).reduce((a, b) => 
      dayCounts[parseInt(a[0])] > dayCounts[parseInt(b[0])] ? a : b
    );
    const bestPattern = dayCounts[parseInt(maxDay[0])] > 0 
      ? `${dayNames[parseInt(maxDay[0])]}요일` 
      : '데이터 부족';

    // 규칙성 점수 (0-100)
    const consistency = recentVideos.length > 0 
      ? Math.min(100, Math.round((recentVideos.length / 30) * 100))
      : 0;

    return {
      streak,
      avgInterval: Math.round(avgInterval * 10) / 10,
      bestPattern,
      consistency,
    };
  }, [videos]);

  return (
    <div className="border border-[#3a3b50] rounded-[20px] p-6 mb-6">
      <h3 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">
        
        업로드 루틴 분석
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 연속 업로드 일수 */}
        <div className="bg-[#12121E] border border-[#3a3b50] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-[#ff8953]" />
            <span className="text-[#aaaaaa] text-sm">연속 업로드 일수</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{routineStats.streak}일</div>
          <div className="text-[#aaaaaa] text-xs">현재 스트릭</div>
        </div>

        {/* 평균 업로드 간격 */}
        <div className="bg-[#12121E] border border-[#3a3b50] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-[#ff8953]" />
            <span className="text-[#aaaaaa] text-sm">평균 업로드 간격</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{routineStats.avgInterval}일</div>
          <div className="text-[#aaaaaa] text-xs">최근 30일 기준</div>
        </div>

        {/* 규칙성 점수 */}
        <div className="bg-[#12121E] border border-[#3a3b50] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-[#ff8953]" />
            <span className="text-[#aaaaaa] text-sm">업로드 규칙성</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{routineStats.consistency}%</div>
          <div className="w-full h-2 bg-[#3a3b50] rounded-full mt-2">
            <div 
              className="h-full bg-[#ff8953] rounded-full transition-all duration-500"
              style={{ width: `${routineStats.consistency}%` }}
            />
          </div>
        </div>

        {/* 최고 성과 패턴 */}
        <div className="bg-[#12121E] border border-[#3a3b50] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-[#ff8953]" />
            <span className="text-[#aaaaaa] text-sm">최고 성과 패턴</span>
          </div>
          <div className="text-lg font-semibold text-white mb-1">{routineStats.bestPattern}</div>
          <div className="text-[#aaaaaa] text-xs">가장 많이 업로드한 요일</div>
        </div>
      </div>

      {/* 추천 메시지 */}
      {routineStats.avgInterval > 0 && (
        <div className="mt-4 bg-[#ff8953]/10 border border-[#ff8953]/30 rounded-lg p-4">
          <p className="text-[#f5f5f5] text-sm leading-relaxed">
            {routineStats.avgInterval <= 3 
              ? `현재 평균 ${routineStats.avgInterval}일 간격으로 업로드하고 계시네요. 규칙적인 업로드가 채널 성장에 도움이 됩니다!`
              : `업로드 간격이 ${routineStats.avgInterval}일로 다소 깁니다. 주 2-3회 업로드를 목표로 하시면 성과가 개선될 수 있습니다.`
            }
          </p>
        </div>
      )}
    </div>
  );
}

