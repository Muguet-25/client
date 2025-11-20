'use client';

import { useState } from 'react';
import { X, Calendar, Clock, Target } from 'lucide-react';

interface PlanVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: {
    title: string;
    date: Date;
    time?: string;
    experimentPurpose?: string;
    status: 'idea' | 'planned' | 'in_progress';
  }) => void;
  selectedDate?: Date;
}

export default function PlanVideoModal({
  isOpen,
  onClose,
  onSave,
  selectedDate,
}: PlanVideoModalProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(
    selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [time, setTime] = useState('18:00');
  const [experimentPurpose, setExperimentPurpose] = useState('');
  const [status, setStatus] = useState<'idea' | 'planned' | 'in_progress'>('idea');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const planDate = new Date(date);
    const [hours, minutes] = time.split(':');
    planDate.setHours(parseInt(hours), parseInt(minutes));

    onSave({
      title: title.trim(),
      date: planDate,
      time,
      experimentPurpose: experimentPurpose.trim() || undefined,
      status,
    });

    // 폼 초기화
    setTitle('');
    setExperimentPurpose('');
    setStatus('idea');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-[20px] w-full max-w-[500px] overflow-hidden">
        {/* 헤더 */}
        <div className="p-6 pb-4 border-b border-[#3a3b50] flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">계획 영상 추가</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2a2a3a] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#aaaaaa]" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 제목 */}
          <div>
            <label className="block text-[#f5f5f5] text-sm font-medium mb-2">
              영상 제목 (가제)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 새로운 트렌드 분석 영상"
              className="w-full px-4 py-3 bg-[#12121E] border border-[#3a3b50] rounded-lg text-white placeholder:text-[#aaaaaa] focus:outline-none focus:border-[#ff8953]"
              required
            />
          </div>

          {/* 날짜 */}
          <div>
            <label className="block text-[#f5f5f5] text-sm font-medium mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              예상 업로드 날짜
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-[#12121E] border border-[#3a3b50] rounded-lg text-white focus:outline-none focus:border-[#ff8953]"
              required
            />
          </div>

          {/* 시간 */}
          <div>
            <label className="block text-[#f5f5f5] text-sm font-medium mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              예상 업로드 시간
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-3 bg-[#12121E] border border-[#3a3b50] rounded-lg text-white focus:outline-none focus:border-[#ff8953]"
            />
          </div>

          {/* 상태 */}
          <div>
            <label className="block text-[#f5f5f5] text-sm font-medium mb-2">
              상태
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'idea' | 'planned' | 'in_progress')}
              className="w-full px-4 py-3 bg-[#12121E] border border-[#3a3b50] rounded-lg text-white focus:outline-none focus:border-[#ff8953]"
            >
              <option value="idea">아이디어</option>
              <option value="planned">계획됨</option>
              <option value="in_progress">제작 중</option>
            </select>
          </div>

          {/* 실험 목적 */}
          <div>
            <label className="block text-[#f5f5f5] text-sm font-medium mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              실험 목적 (선택)
            </label>
            <input
              type="text"
              value={experimentPurpose}
              onChange={(e) => setExperimentPurpose(e.target.value)}
              placeholder="예: 자극적인 제목 vs 정보형 제목"
              className="w-full px-4 py-3 bg-[#12121E] border border-[#3a3b50] rounded-lg text-white placeholder:text-[#aaaaaa] focus:outline-none focus:border-[#ff8953]"
            />
          </div>

          {/* 버튼 */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-[#12121E] border border-[#3a3b50] rounded-lg text-[#f5f5f5] font-medium hover:bg-[#2a2a3a] transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-[#ff8953] border border-[#ff8953] rounded-lg text-white font-medium hover:bg-[#ff7a40] transition-colors"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

