'use client';

import { useMemo, useEffect, useState } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';
import { YouTubeVideo } from '@/lib/youtube/types';
import { useYouTube } from '@/hooks/useYouTube';

interface VideoHealthReportProps {
  video: YouTubeVideo;
  avgWatchDuration?: number;
  avgSubscriberGain?: number;
  avgEngagement?: number;
}

export default function VideoHealthReport({
  video,
  avgWatchDuration: propAvgWatchDuration,
  avgSubscriberGain: propAvgSubscriberGain,
  avgEngagement: propAvgEngagement
}: VideoHealthReportProps) {
  const { isConnected, channel, videos, refreshAnalytics } = useYouTube();
  const [videoAnalytics, setVideoAnalytics] = useState<any>(null);
  const [avgWatchDuration, setAvgWatchDuration] = useState(propAvgWatchDuration || 60);
  const [avgSubscriberGain, setAvgSubscriberGain] = useState(propAvgSubscriberGain || 50);
  const [avgEngagement, setAvgEngagement] = useState(propAvgEngagement || 3.5);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [aiIssues, setAiIssues] = useState<Array<{ title: string; description: string; severity: string }>>([]);
  const [aiCauses, setAiCauses] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideoAnalytics = async () => {
      if (!isConnected || !channel) return;

      setIsLoading(true);
      setIsDataReady(false);
      setShowSkeleton(true);
      try {
        const accessToken = localStorage.getItem('youtube_access_token');
        if (!accessToken) return;

        const { YouTubeAPI } = await import('@/lib/youtube/api');
        const youtubeAPI = new YouTubeAPI(accessToken);

        // 비디오 분석 데이터 가져오기
        const endDate = new Date().toISOString().split('T')[0];
        const publishedDate = new Date(video.publishedAt);
        const startDate = publishedDate.toISOString().split('T')[0];
        
        const analytics = await youtubeAPI.getVideoAnalytics(video.id, startDate, endDate);
        setVideoAnalytics(analytics);

        // 채널 평균 계산
        if (videos.length > 0) {
          const channelEndDate = new Date().toISOString().split('T')[0];
          const channelStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          const channelAnalytics = await youtubeAPI.getChannelAnalytics(channel.id, channelStartDate, channelEndDate);
          
          // 평균 시청 지속시간을 초로 변환
          const avgDurationSeconds = parseDurationToSeconds(channelAnalytics.averageViewDuration);
          setAvgWatchDuration(avgDurationSeconds);

          // 평균 참여도 계산
          const totalViews = videos.reduce((sum, v) => sum + parseInt(v.statistics.viewCount || '0'), 0);
          const totalLikes = videos.reduce((sum, v) => sum + parseInt(v.statistics.likeCount || '0'), 0);
          const totalComments = videos.reduce((sum, v) => sum + parseInt(v.statistics.commentCount || '0'), 0);
          const avgEng = totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0;
          setAvgEngagement(avgEng);
        }

        setIsDataReady(true);
      } catch (error) {
        console.error('비디오 분석 데이터 가져오기 실패:', error);
        setIsDataReady(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoAnalytics();
  }, [isConnected, channel, video.id, videos]);

  // ISO 8601 duration을 초로 변환
  const parseDurationToSeconds = (duration: string): number => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    return hours * 3600 + minutes * 60 + seconds;
  };

  // 영상 점수 계산
  const healthScore = useMemo(() => {
    const views = parseInt(video.statistics?.viewCount || '0');
    const likes = parseInt(video.statistics?.likeCount || '0');
    const comments = parseInt(video.statistics?.commentCount || '0');
    
    let score = 50; // 기본 점수
    
    // 참여도 점수
    const engagement = views > 0 ? ((likes + comments) / views) * 100 : 0;
    if (engagement >= avgEngagement * 1.2) score += 15;
    else if (engagement >= avgEngagement) score += 10;
    else if (engagement >= avgEngagement * 0.8) score += 5;
    else score -= 10;
    
    // 시청 지속시간 점수
    if (videoAnalytics) {
      const durationSeconds = parseDurationToSeconds(videoAnalytics.averageViewDuration);
      const videoDurationSeconds = parseDurationToSeconds(video.duration || 'PT0S');
      const retentionRate = videoDurationSeconds > 0 ? (durationSeconds / videoDurationSeconds) * 100 : 0;
      
      if (retentionRate >= 70) score += 15;
      else if (retentionRate >= 50) score += 10;
      else if (retentionRate >= 30) score += 5;
      else score -= 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }, [video, videoAnalytics, avgEngagement]);

  // 점수에 따른 색상
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-[#ff8953]';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const fallbackIssues = useMemo(() => {
    const issues: Array<{ title: string; description: string; severity: 'high' | 'medium' | 'low' }> = [];
    
    if (!videoAnalytics) return issues;
    
    const durationSeconds = parseDurationToSeconds(videoAnalytics.averageViewDuration);
    const videoDurationSeconds = parseDurationToSeconds(video.duration || 'PT0S');
    const retentionRate = videoDurationSeconds > 0 ? (durationSeconds / videoDurationSeconds) * 100 : 0;
    
    if (retentionRate < 30) {
      issues.push({
        title: '시청 지속시간 부족',
        description: `평균 시청 지속시간이 영상 길이의 ${retentionRate.toFixed(1)}%에 불과합니다.`,
        severity: 'high'
      });
    }
    
    const views = parseInt(video.statistics?.viewCount || '0');
    const likes = parseInt(video.statistics?.likeCount || '0');
    const comments = parseInt(video.statistics?.commentCount || '0');
    const engagement = views > 0 ? ((likes + comments) / views) * 100 : 0;
    
    if (engagement < avgEngagement * 0.8 && avgEngagement > 0) {
      issues.push({
        title: '참여도 낮음',
        description: `참여도가 ${engagement.toFixed(2)}%로 채널 평균(${avgEngagement.toFixed(2)}%)보다 낮습니다.`,
        severity: 'medium'
      });
    }
    
    return issues;
  }, [videoAnalytics, video, avgEngagement]);

  const fallbackCauses = [
    '인트로가 길거나 핵심 메시지 전달이 늦어 초반 이탈이 발생합니다.',
    '제목/썸네일과 실제 내용의 연결성이 약해 기대 대비 만족도가 떨어집니다.',
  ];

  useEffect(() => {
    const fetchAiInsights = async () => {
      if (!isDataReady || !videoAnalytics) return;
      setIsAiLoading(true);
      setAiError(null);
      try {
        const durationSeconds = parseDurationToSeconds(videoAnalytics.averageViewDuration);
        const videoDurationSeconds = parseDurationToSeconds(video.duration || 'PT0S');
        const retentionRate = videoDurationSeconds > 0 ? (durationSeconds / videoDurationSeconds) * 100 : 0;
        const views = parseInt(video.statistics?.viewCount || '0');
        const likes = parseInt(video.statistics?.likeCount || '0');
        const comments = parseInt(video.statistics?.commentCount || '0');
        const engagement = views > 0 ? ((likes + comments) / views) * 100 : 0;

        const response = await fetch('/api/video-insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            video: {
              title: video.title,
              description: video.description,
              tags: video.snippet?.tags || [],
              publishedAt: video.publishedAt,
            },
            metrics: {
              retentionRate,
              watchDuration: durationSeconds,
              videoDuration: videoDurationSeconds,
              engagement,
              avgEngagement,
              views,
              likes,
              comments,
            },
          }),
        });

        if (!response.ok) {
          throw new Error('AI 분석 요청 실패');
        }

        const data = await response.json();
        setAiIssues(data.issues || []);
        setAiCauses(data.causes || []);
      } catch (error) {
        console.error('AI 인사이트 가져오기 실패:', error);
        setAiIssues([]);
        setAiCauses([]);
        setAiError('AI 인사이트를 불러오지 못했습니다.');
      } finally {
        setIsAiLoading(false);
      }
    };

    fetchAiInsights();
  }, [isDataReady, videoAnalytics, video, avgEngagement]);

  useEffect(() => {
    if (isDataReady) {
      const timer = setTimeout(() => {
        setShowSkeleton(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isDataReady]);

  const isScoreLoading = showSkeleton || isLoading || !videoAnalytics || !isDataReady;
  const isInsightsLoading = isScoreLoading || isAiLoading;
  const issuesToDisplay = (aiIssues.length > 0 ? aiIssues : fallbackIssues) as Array<{ title: string; description: string; severity: string }>;
  const causesToDisplay = aiCauses.length > 0 ? aiCauses : fallbackCauses;

  return (
    <div className="space-y-6">
      {/* 영상 건강 점수 */}
      <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-[20px] p-6">
        <h3 className="text-white text-xl font-semibold mb-4">영상 건강 점수</h3>

        {isScoreLoading ? (
          <div className="space-y-6 animate-pulse">
            <div className="flex items-baseline gap-3">
              <div className="h-14 w-28 bg-[#3a3b50]/50 rounded" />
              <div className="h-8 w-12 bg-[#3a3b50]/50 rounded" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="bg-[#12121E] border border-[#3a3b50] rounded-lg p-4 space-y-3">
                  <div className="h-3 w-20 bg-[#3a3b50]/50 rounded" />
                  <div className="h-6 w-24 bg-[#3a3b50]/50 rounded" />
                  <div className="h-3 w-16 bg-[#3a3b50]/50 rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-baseline gap-3 mb-6">
              <span className={`text-5xl font-bold ${getScoreColor(healthScore)}`}>
                {healthScore}
              </span>
              <span className="text-[#aaaaaa] text-2xl">/ 100</span>
            </div>

            {/* 항목별 점수 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { 
                  label: '시청 지속시간', 
                  value: videoAnalytics ? parseDurationToSeconds(videoAnalytics.averageViewDuration) : 0, 
                  avg: avgWatchDuration,
                  unit: '초',
                  isDuration: true
                },
                { 
                  label: '조회수', 
                  value: parseInt(video.statistics?.viewCount || '0'), 
                  avg: videos.length > 0 ? videos.reduce((sum, v) => sum + parseInt(v.statistics.viewCount || '0'), 0) / videos.length : 0,
                  unit: ''
                },
                { 
                  label: '좋아요', 
                  value: parseInt(video.statistics?.likeCount || '0'), 
                  avg: videos.length > 0 ? videos.reduce((sum, v) => sum + parseInt(v.statistics.likeCount || '0'), 0) / videos.length : 0,
                  unit: ''
                },
                { 
                  label: '참여도', 
                  value: (() => {
                    const views = parseInt(video.statistics?.viewCount || '0');
                    const likes = parseInt(video.statistics?.likeCount || '0');
                    const comments = parseInt(video.statistics?.commentCount || '0');
                    return views > 0 ? ((likes + comments) / views) * 100 : 0;
                  })(), 
                  avg: avgEngagement,
                  unit: '%'
                },
              ].map((item) => {
                const diff = item.value - item.avg;
                const isPositive = diff > 0;
                
                const displayValue = item.isDuration 
                  ? `${Math.floor(item.value / 60)}분 ${item.value % 60}초`
                  : item.value.toLocaleString() + (item.unit || '');
                
                return (
                  <div key={item.label} className="bg-[#12121E] border border-[#3a3b50] rounded-lg p-4">
                    <div className="text-[#aaaaaa] text-xs mb-2">{item.label}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-2xl font-bold">{displayValue}</span>
                      {isPositive ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <div className="text-[#aaaaaa] text-xs mt-1">
                      평균 대비 {isPositive ? '+' : ''}{diff.toFixed(1)}{item.unit || ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* 주요 문제점 */}
      {isInsightsLoading ? (
        <div className="bg-[#ff8953]/10 border border-[#ff8953]/30 rounded-[20px] p-6 animate-pulse">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-6 h-6 bg-[#ff8953]/40 rounded-full" />
            <div className="flex-1 space-y-3">
              <div className="h-5 w-32 bg-[#ff8953]/30 rounded" />
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="h-4 w-40 bg-[#ff8953]/20 rounded" />
                  <div className="h-3 w-full bg-[#ff8953]/10 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : issuesToDisplay.length > 0 ? (
        <div className="bg-[#ff8953]/10 border border-[#ff8953]/30 rounded-[20px] p-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-[#ff8953] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-white text-xl font-semibold mb-2">가장 큰 문제</h3>
              {issuesToDisplay.map((issue, index) => (
                <div key={index} className="mb-3 last:mb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#ff8953] font-semibold">
                      문제 {index + 1}: {issue.title}
                    </span>
                    {issue.severity === 'high' && (
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">
                        긴급
                      </span>
                    )}
                    {issue.severity === 'medium' && (
                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                        주의
                      </span>
                    )}
                  </div>
                  <p className="text-[#f5f5f5] text-sm leading-relaxed">
                    {issue.description}
                  </p>
                </div>
              ))}
              {aiError && (
                <p className="text-red-400 text-xs mt-2">{aiError}</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#ff8953]/10 border border-[#ff8953]/30 rounded-[20px] p-6">
          <p className="text-[#f5f5f5] text-sm">분석 결과를 가져오지 못했습니다.</p>
        </div>
      )}

      {/* 문제 원인 추정 */}
      {isInsightsLoading ? (
        <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-[20px] p-6 animate-pulse">
          <div className="h-5 w-36 bg-[#3a3b50]/50 rounded mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-5 h-5 bg-[#3a3b50]/50 rounded-full mt-1" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 bg-[#3a3b50]/50 rounded" />
                  <div className="h-3 w-5/6 bg-[#3a3b50]/40 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-[20px] p-6">
          <h3 className="text-white text-xl font-semibold mb-4">문제 원인 추정</h3>
          <div className="space-y-3">
            {causesToDisplay.map((cause, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#ff8953] flex-shrink-0 mt-0.5" />
                <p className="text-[#f5f5f5] text-sm leading-relaxed">
                  {cause}
                </p>
              </div>
            ))}
            {aiError && (
              <p className="text-red-400 text-xs mt-2">{aiError}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

