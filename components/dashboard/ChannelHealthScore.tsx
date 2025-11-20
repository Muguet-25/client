'use client';

import { useMemo } from 'react';
import { YouTubeAnalytics, YouTubeVideo } from '@/lib/youtube/types';

interface ChannelHealthScoreProps {
  analytics?: YouTubeAnalytics | null;
  videos?: YouTubeVideo[];
  isLoading?: boolean;
}

export default function ChannelHealthScore({
  analytics,
  videos = [],
  isLoading = false
}: ChannelHealthScoreProps) {
  // ISO 8601 duration을 초로 변환
  const parseDurationToSeconds = (duration: string): number => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    return hours * 3600 + minutes * 60 + seconds;
  };

  // 메트릭 계산 (useMemo로 최적화)
  const metrics = useMemo(() => {
    if (!analytics || videos.length === 0) {
      return {
        ctr: 0,
        avgWatchDuration: 0,
        uploadConsistency: 0,
        subscriberConversion: 0,
        engagement: 0
      };
    }

    // CTR 점수 (0-100) - 10%를 100점으로 기준
    const ctrScore = Math.min(100, (analytics.ctr ?? 0 / 10) * 100);
    const ctr = Math.round(ctrScore);

    // 평균 시청 지속시간 점수 (0-100)
    const avgDurationSeconds = parseDurationToSeconds(analytics.averageViewDuration);
    const durationScore = Math.min(100, (avgDurationSeconds / 300) * 100);
    const avgWatchDuration = Math.round(durationScore);

    // 업로드 규칙성 점수 (0-100)
    const recentVideos = videos.filter(v => {
      const publishedDate = new Date(v.publishedAt);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return publishedDate >= thirtyDaysAgo;
    });
    const uploadFrequency = recentVideos.length / 30;
    const consistencyScore = Math.min(100, uploadFrequency * 30);
    const uploadConsistency = Math.round(consistencyScore);

    // 구독자 전환율 점수 (0-100)
    const totalViews = videos.reduce((sum, v) => sum + parseInt(v.statistics?.viewCount || '0'), 0);
    const conversionRate = totalViews > 0 ? (analytics.subscribersGained / totalViews) * 10000 : 0;
    const conversionScore = Math.min(100, conversionRate * 100);
    const subscriberConversion = Math.round(conversionScore);

    // 참여도 점수 (0-100)
    const totalLikes = videos.reduce((sum, v) => sum + parseInt(v.statistics?.likeCount || '0'), 0);
    const totalComments = videos.reduce((sum, v) => sum + parseInt(v.statistics?.commentCount || '0'), 0);
    const engagementRate = totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0;
    const engagementScore = Math.min(100, (engagementRate / 10) * 100);
    const engagement = Math.round(engagementScore);

    return {
      ctr,
      avgWatchDuration,
      uploadConsistency,
      subscriberConversion,
      engagement
    };
  }, [analytics, videos]);

  const { ctr, avgWatchDuration, uploadConsistency, subscriberConversion, engagement } = metrics;

  // 종합 점수 계산 (평균)
  const overallScore = useMemo(() => {
    return Math.round((ctr + avgWatchDuration + uploadConsistency + subscriberConversion + engagement) / 5);
  }, [ctr, avgWatchDuration, uploadConsistency, subscriberConversion, engagement]);

  // 레이더 차트 데이터
  const healthMetrics = useMemo(() => {
    return [
      {
        id: 'CTR',
        label: 'CTR',
        value: ctr,
      },
      {
        id: 'avgWatchDuration',
        label: '평균 시청 지속시간',
        value: avgWatchDuration,
      },
      {
        id: 'uploadConsistency',
        label: '업로드 규칙성',
        value: uploadConsistency,
      },
      {
        id: 'subscriberConversion',
        label: '구독자 전환율',
        value: subscriberConversion,
      },
      {
        id: 'engagement',
        label: '참여도',
        value: engagement,
      },
    ];
  }, [ctr, avgWatchDuration, uploadConsistency, subscriberConversion, engagement]);

  // 점수에 따른 색상 결정
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-[#ff8953]';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-400';
    if (score >= 60) return 'bg-[#ff8953]';
    if (score >= 40) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  // 점수에 따른 상태 텍스트
  const getScoreStatus = (score: number) => {
    if (score >= 80) return '우수';
    if (score >= 60) return '양호';
    if (score >= 40) return '보통';
    return '개선 필요';
  };

  return (
    <div className="border border-[#3a3b50] rounded-[20px] p-6">
      <div className="mb-6">
        <h3 className="text-white text-xl font-semibold mb-2">채널 건강 점수</h3>
        <div className="flex items-baseline gap-3">
          <span className={`text-5xl font-bold ${getScoreColor(overallScore)}`}>
            {overallScore}
          </span>
          <span className="text-[#aaaaaa] text-2xl">/ 100</span>
          <span className={`text-lg font-medium ${getScoreColor(overallScore)}`}>
            ({getScoreStatus(overallScore)})
          </span>
        </div>
      </div>

      {/* 간단한 레이더 차트 시각화 (SVG) */}
      <div className="h-[300px] mb-6 flex items-center justify-center">
        <svg width="280" height="280" viewBox="0 0 280 280" className="overflow-visible">
          {/* 그리드 원 */}
          {[1, 2, 3, 4, 5].map((level) => (
            <circle
              key={level}
              cx="140"
              cy="140"
              r={level * 25}
              fill="none"
              stroke="#3a3b50"
              strokeWidth="1"
            />
          ))}
          
          {/* 중심선 (5개 축) */}
          {healthMetrics.map((metric, index) => {
            const angle = (index * 2 * Math.PI) / healthMetrics.length - Math.PI / 2;
            const x = 140 + 125 * Math.cos(angle);
            const y = 140 + 125 * Math.sin(angle);
            return (
              <line
                key={`line-${metric.id}`}
                x1="140"
                y1="140"
                x2={x}
                y2={y}
                stroke="#3a3b50"
                strokeWidth="1"
              />
            );
          })}

          {/* 레이더 폴리곤 */}
          <polygon
            points={healthMetrics.map((metric, index) => {
              const angle = (index * 2 * Math.PI) / healthMetrics.length - Math.PI / 2;
              const radius = (metric.value / 100) * 125;
              const x = 140 + radius * Math.cos(angle);
              const y = 140 + radius * Math.sin(angle);
              return `${x},${y}`;
            }).join(' ')}
            fill="#ff8953"
            fillOpacity="0.25"
            stroke="#ff8953"
            strokeWidth="2"
          />

          {/* 점과 라벨 */}
          {healthMetrics.map((metric, index) => {
            const angle = (index * 2 * Math.PI) / healthMetrics.length - Math.PI / 2;
            const radius = (metric.value / 100) * 125;
            const x = 140 + radius * Math.cos(angle);
            const y = 140 + radius * Math.sin(angle);
            const labelX = 140 + 145 * Math.cos(angle);
            const labelY = 140 + 145 * Math.sin(angle);
            
            return (
              <g key={`point-${metric.id}`}>
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#ff8953"
                  stroke="#1c1c28"
                  strokeWidth="2"
                />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-[10px] fill-[#aaaaaa]"
                >
                  {metric.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 항목별 점수 리스트 */}
      <div className="space-y-3">
        {healthMetrics.map((item) => (
          <div 
            key={item.id} 
            className="flex items-center justify-between cursor-pointer hover:bg-[#2a2a3a] rounded-lg p-2 transition-colors"
            onClick={() => {
              // TODO: 개선 방법 페이지로 이동 또는 모달 표시
              console.log(`${item.label} 개선 방법 보기`);
            }}
          >
            <span className="text-[#f5f5f5] text-sm">{item.label}</span>
            <div className="flex items-center gap-3">
              <div className="w-32 h-2 bg-[#3a3b50] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getScoreBgColor(item.value)}`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
              <span className={`text-sm font-medium w-10 text-right ${getScoreColor(item.value)}`}>
                {item.value}점
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 팁 링크 */}
      <div className="mt-6 pt-6 border-t border-[#3a3b50]">
        <p className="text-[#aaaaaa] text-xs text-center">
          각 항목을 클릭하면 개선 방법을 확인할 수 있습니다
        </p>
      </div>
    </div>
  );
}

