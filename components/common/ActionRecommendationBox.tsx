'use client';

import { CheckCircle2, ArrowRight } from 'lucide-react';

interface ActionItem {
  id: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  category: 'thumbnail' | 'title' | 'upload' | 'content' | 'other';
}

interface ActionRecommendationBoxProps {
  actions?: ActionItem[];
  title?: string;
  maxItems?: number;
}

export default function ActionRecommendationBox({
  actions = [
    {
      id: '1',
      title: '썸네일 CTR 낮음 → 이 영상 썸네일 2개 다시 만들어 A/B 테스트',
      description: '최근 업로드한 영상의 CTR이 평균보다 낮습니다.',
      priority: 'high',
      category: 'thumbnail',
    },
    {
      id: '2',
      title: '18~24세 여성 시청 증가 → 이 타겟용 쇼츠 1개 제작',
      description: '시청자 분석 결과 18~24세 여성 시청자가 증가하고 있습니다.',
      priority: 'medium',
      category: 'content',
    },
    {
      id: '3',
      title: '업로드 규칙성 개선 → 주 3회 업로드 목표 설정',
      description: '최근 30일 업로드 간격이 불규칙합니다.',
      priority: 'medium',
      category: 'upload',
    },
  ],
  title = '이번 주에 해야 할 일',
  maxItems = 3,
}: ActionRecommendationBoxProps) {
  const displayActions = actions.slice(0, maxItems);

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'border-red-500/50 bg-red-500/10';
      case 'medium':
        return 'border-yellow-500/50 bg-yellow-500/10';
      case 'low':
        return 'border-blue-500/50 bg-blue-500/10';
    }
  };

  const getPriorityText = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return '긴급';
      case 'medium':
        return '중요';
      case 'low':
        return '일반';
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#ff8953]/20 to-[#ffb05b]/10 border border-[#ff8953]/40 rounded-[20px] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-xl font-semibold">{title}</h3>
        <span className="text-[#aaaaaa] text-sm">{displayActions.length}개</span>
      </div>

      <div className="space-y-3">
        {displayActions.map((action, index) => (
          <div
            key={action.id}
            className={`bg-[#1c1c28] border-2 rounded-lg p-4 ${getPriorityColor(action.priority)}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#ff8953]/20 flex items-center justify-center mt-0.5">
                <span className="text-[#ff8953] font-bold text-sm">{index + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-medium text-sm">{action.title}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    action.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                    action.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {getPriorityText(action.priority)}
                  </span>
                </div>
                {action.description && (
                  <p className="text-[#aaaaaa] text-xs leading-relaxed mb-2">
                    {action.description}
                  </p>
                )}
                <button className="flex items-center gap-1 text-[#ff8953] text-xs font-medium hover:text-[#ff7a40] transition-colors">
                  자세히 보기
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {actions.length > maxItems && (
        <div className="mt-4 text-center">
          <button className="text-[#ff8953] text-sm font-medium hover:text-[#ff7a40] transition-colors">
            더보기 ({actions.length - maxItems}개)
          </button>
        </div>
      )}
    </div>
  );
}

