'use client';

import { CheckCircle2, Sparkles, TestTube, Calendar } from 'lucide-react';

interface ActionPlanProps {
  videoId: string;
  videoTitle: string;
}

export default function ActionPlan({ videoId, videoTitle }: ActionPlanProps) {
  return (
    <div className="space-y-6">
      {/* 리메이크 플랜 */}
      <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-[20px] p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-[#ff8953]" />
          <h3 className="text-white text-xl font-semibold">리메이크 플랜</h3>
        </div>
        
        <div className="space-y-4">
          {[
            {
              step: 1,
              title: '오프닝 0~5초에 핵심 장면/결론 먼저 배치',
              description: '시청자의 관심을 즉시 끌 수 있도록 가장 임팩트 있는 장면을 앞에 배치하세요.',
            },
            {
              step: 2,
              title: '전체 길이를 10분 → 6~7분으로 축소',
              description: '핵심 내용만 남기고 불필요한 부분을 제거하여 시청 지속시간을 개선하세요.',
            },
            {
              step: 3,
              title: '현재 제목 + 썸네일에 대한 대체안 3개 생성',
              description: 'A/B 테스트를 위해 다양한 제목과 썸네일 조합을 준비하세요.',
            },
            {
              step: 4,
              title: '기존 영상은 비공개/한정공개로 전환 후 2주 뒤 새 영상 재업로드',
              description: '기존 영상의 성과 데이터를 보존하면서 개선된 버전을 새로 업로드하세요.',
            },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3 bg-[#12121E] border border-[#3a3b50] rounded-lg p-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#ff8953]/20 flex items-center justify-center">
                <span className="text-[#ff8953] font-bold text-sm">{item.step}</span>
              </div>
              <div className="flex-1">
                <h4 className="text-white font-medium mb-1">{item.title}</h4>
                <p className="text-[#aaaaaa] text-sm leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 썸네일/제목 A/B 테스트 플랜 */}
      <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-[20px] p-6">
        <div className="flex items-center gap-3 mb-4">
          <TestTube className="w-6 h-6 text-[#ff8953]" />
          <h3 className="text-white text-xl font-semibold">썸네일/제목 A/B 테스트 플랜</h3>
        </div>
        
        <div className="space-y-4">
          <div className="bg-[#12121E] border border-[#3a3b50] rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">테스트 구성</h4>
            <ul className="space-y-2 text-[#f5f5f5] text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#ff8953]" />
                썸네일 2종, 제목 2종 → 4조합 테스트
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#ff8953]" />
                테스트 기간: 업로드 후 48시간
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#ff8953]" />
                목표: CTR 5% → 7%
              </li>
            </ul>
          </div>

          <div className="bg-[#ff8953]/10 border border-[#ff8953]/30 rounded-lg p-4">
            <p className="text-[#f5f5f5] text-sm leading-relaxed">
              테스트 결과에 따라 최적의 조합을 선택하고, 나머지 조합은 다른 영상에 활용하세요.
            </p>
          </div>
        </div>
      </div>

      {/* 실행 버튼들 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="flex items-center justify-center gap-2 px-6 py-4 bg-[#ff8953] border border-[#ff8953] rounded-lg text-white font-medium hover:bg-[#ff7a40] transition-colors">
          <Calendar className="w-5 h-5" />
          이 플랜으로 할 일 만들기
        </button>
        <button className="flex items-center justify-center gap-2 px-6 py-4 bg-[#ff8953]/40 border border-[#ff8953]/40 rounded-lg text-[#ff8953] font-medium hover:bg-[#ff8953]/60 transition-colors">
          <Sparkles className="w-5 h-5" />
          썸네일/제목 생성하기
        </button>
        <button className="flex items-center justify-center gap-2 px-6 py-4 bg-[#ff8953]/40 border border-[#ff8953]/40 rounded-lg text-[#ff8953] font-medium hover:bg-[#ff8953]/60 transition-colors">
          <TestTube className="w-5 h-5" />
          쇼츠로 쪼개기 아이디어 뽑기
        </button>
      </div>
    </div>
  );
}

