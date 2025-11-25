'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface InsightSummaryProps {
  insightsData?: {
    diagnosis: string;
    weeklyGoal: string;
    actions: string[];
  } | null;
  isLoading?: boolean;
  channelId?: string | null;
}

const FALLBACK_INSIGHTS = {
  diagnosis: '데이터를 분석 중입니다...',
  weeklyGoal: '이번 주 목표를 설정해주세요.',
  actions: [
    '상위 영상 분석하기',
    '업로드 시간 최적화하기',
    '썸네일 개선하기'
  ]
};

export default function InsightSummary({ 
  insightsData,
  isLoading = false,
  channelId
}: InsightSummaryProps) {
  const [fallbackInsights, setFallbackInsights] = useState<{
    diagnosis: string;
    weeklyGoal: string;
    actions: string[];
  } | null>(null);
  const [isFallbackLoading, setIsFallbackLoading] = useState(false);
  const [fallbackError, setFallbackError] = useState<string | null>(null);

  const shouldRequestFallback = useMemo(() => {
    return (
      !isLoading &&
      !insightsData &&
      !!channelId &&
      !fallbackInsights &&
      !isFallbackLoading &&
      !fallbackError
    );
  }, [channelId, fallbackError, fallbackInsights, isFallbackLoading, isLoading, insightsData]);

  useEffect(() => {
    if (!channelId) {
      setFallbackInsights(null);
      setFallbackError(null);
    }
  }, [channelId]);

  useEffect(() => {
    if (!shouldRequestFallback) return;

    let isCancelled = false;

    const fetchFallbackInsights = async () => {
      setIsFallbackLoading(true);
      setFallbackError(null);

      try {
        const accessToken = localStorage.getItem('youtube_access_token');
        if (!accessToken) {
          throw new Error('YouTube access token을 찾을 수 없습니다.');
        }

        const response = await fetch('/api/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accessToken,
            channelId
          })
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => null);
          throw new Error(errorBody?.error || 'AI 인사이트 요청에 실패했습니다.');
        }

        const data = await response.json();
        if (!isCancelled && data?.success && data?.insights) {
          setFallbackInsights({
            diagnosis: data.insights.diagnosis ?? FALLBACK_INSIGHTS.diagnosis,
            weeklyGoal: data.insights.weeklyGoal ?? FALLBACK_INSIGHTS.weeklyGoal,
            actions:
              data.insights.actions?.length > 0
                ? data.insights.actions
                : FALLBACK_INSIGHTS.actions
          });
        }
      } catch (error) {
        console.error('AI 인사이트 생성 실패:', error);
        if (!isCancelled) {
          setFallbackError('AI 인사이트 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
        }
      } finally {
        if (!isCancelled) {
          setIsFallbackLoading(false);
        }
      }
    };

    fetchFallbackInsights();

    return () => {
      isCancelled = true;
    };
  }, [channelId, shouldRequestFallback]);

  const resolvedInsights = insightsData ?? fallbackInsights ?? FALLBACK_INSIGHTS;
  const diagnosis = resolvedInsights.diagnosis?.trim() || FALLBACK_INSIGHTS.diagnosis;
  const weeklyGoal = resolvedInsights.weeklyGoal?.trim() || FALLBACK_INSIGHTS.weeklyGoal;
  const actions = resolvedInsights.actions?.length
    ? resolvedInsights.actions
    : FALLBACK_INSIGHTS.actions;
  
  // 데이터가 있으면 로딩 표시하지 않음, 데이터가 없고 로딩 중일 때만 스켈레톤 표시
  const hasData = !!(insightsData || fallbackInsights);
  const displayLoading = !hasData && (isLoading || isFallbackLoading);

  return (
    <section className="rounded-[20px] border border-[#3a3b50] bg-[#1c1c28] p-8 text-white">
      <div className="space-y-8">
        <div className="space-y-3">
          <h3 className="text-2xl font-semibold tracking-tight">오늘의 한 줄 진단</h3>
          {displayLoading ? (
              <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-[#3a3b50]/60" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-[#3a3b50]/60" />
              </div>
            ) : (
            <p className="text-base leading-relaxed text-[#f5f5f5]">{diagnosis}</p>
            )}
      </div>

        <div className="space-y-3">
          <h3 className="text-2xl font-semibold tracking-tight">이번 주 목표</h3>
          {displayLoading ? (
              <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-[#3a3b50]/60" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-[#3a3b50]/60" />
              </div>
            ) : (
            <p className="text-base leading-relaxed text-[#f5f5f5]">{weeklyGoal}</p>
            )}
          </div>

        <div className="flex items-center gap-4 text-sm text-white/60">
          <span className="h-px flex-1 bg-white/30" />
          추천
          <span className="h-px flex-1 bg-white/30" />
      </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-semibold tracking-tight">목표 달성을 위한 액션</h3>
          {displayLoading ? (
            <ul className="space-y-3">
              {[0, 1, 2].map((index) => (
                <li key={`skeleton-${index}`} className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-[#3a3b50]/60" />
                  <div
                    className="h-4 flex-1 animate-pulse rounded bg-[#3a3b50]/60"
                    style={{ width: `${90 - index * 5}%` }}
                  />
                  </li>
                ))}
              </ul>
            ) : (
            <ul className="space-y-3">
              {actions.map((action) => (
                <li
                  key={action}
                  className="flex items-start gap-3 text-base leading-relaxed text-[#f5f5f5]"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#ff8953]" aria-hidden="true" />
                  <span className="flex-1">{action}</span>
                  </li>
                ))}
              </ul>
            )}
          {fallbackError && (
            <p className="text-sm text-red-400">
              {fallbackError}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

