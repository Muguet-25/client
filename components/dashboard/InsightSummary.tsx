'use client';

import { Lightbulb, Target, CheckCircle2 } from 'lucide-react';

interface InsightSummaryProps {
  insightsData?: {
    diagnosis: string;
    weeklyGoal: string;
    actions: string[];
  } | null;
  isLoading?: boolean;
}

export default function InsightSummary({ 
  insightsData,
  isLoading = false
}: InsightSummaryProps) {
  // 기본값 설정
  const diagnosis = insightsData?.diagnosis || "데이터를 분석 중입니다...";
  const weeklyGoal = insightsData?.weeklyGoal || "이번 주 목표를 설정해주세요.";
  const actions = insightsData?.actions || [
    "상위 영상 분석하기",
    "업로드 시간 최적화하기",
    "썸네일 개선하기"
  ];

  return (
    <div className="bg-gradient-to-br from-[#ff8953]/20 to-[#ffb05b]/10 border border-[#ff8953]/40 rounded-[20px] p-8 mb-6">
      {/* 오늘의 한 줄 진단 */}
      <div className="mb-6">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-1">
            <h3 className="text-white text-lg font-semibold mb-2">오늘의 한 줄 진단</h3>
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-[#3a3b50]/50 rounded animate-pulse" style={{ width: '100%' }} />
                <div className="h-4 bg-[#3a3b50]/50 rounded animate-pulse" style={{ width: '80%' }} />
              </div>
            ) : (
              <p className="text-[#f5f5f5] text-base leading-relaxed">
                {diagnosis}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 구분선 */}
      <div className="w-full h-[1px] bg-[#3a3b50] my-6" />

      {/* 이번 주 목표 */}
      <div className="mb-6">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="text-white text-lg font-semibold mb-2">이번 주 목표</h3>
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-[#3a3b50]/50 rounded animate-pulse" style={{ width: '100%' }} />
                <div className="h-4 bg-[#3a3b50]/50 rounded animate-pulse" style={{ width: '75%' }} />
              </div>
            ) : (
              <p className="text-[#f5f5f5] text-base leading-relaxed">
                {weeklyGoal}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 구분선 */}
      <div className="w-full h-[1px] bg-[#3a3b50] my-6" />

      {/* 목표 달성을 위한 액션 3개 */}
      <div>
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-1">
            <h3 className="text-white text-lg font-semibold mb-3">목표 달성을 위한 액션</h3>
            {isLoading ? (
              <ul className="space-y-2">
                {[1, 2, 3].map((index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-[#ff8953] text-lg font-bold mt-0.5">{index}.</span>
                    <div className="flex-1 space-y-1">
                      <div className="h-4 bg-[#3a3b50]/50 rounded animate-pulse" style={{ width: index === 1 ? '90%' : index === 2 ? '85%' : '80%' }} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-2">
                {actions.map((action, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-[#ff8953] text-lg font-bold mt-0.5">{index + 1}.</span>
                    <span className="text-[#f5f5f5] text-base leading-relaxed flex-1">
                      {action}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

