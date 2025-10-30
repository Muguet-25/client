'use client';

import { useAuthStore } from '@/lib/useAuthStore';
import { Upload } from 'lucide-react';

export default function ReportHeader() {
  const { user } = useAuthStore();
  
  return (
    <div className="bg-[#12121E] max-w-7xl mx-auto px-6 pt-8 pb-4 mt-12">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-[3rem] font-bold text-white">리포트</h1>
          <p className="text-white text-sm">어서오세요 {user?.user_metadata?.full_name || '사용자'}님! 돌아오신걸 환영해요!</p>
        </div>
        
        <button className="flex mt-4 items-center gap-2 px-4 py-2 bg-[#ff8953]/40 border border-[#ff8953]/40 rounded-lg text-[#ff8953] text-sm hover:bg-[#ff8953]/60 transition-colors">
          <Upload className="w-4 h-4" />
          내보내기
        </button>
      </div>
    </div>
  );
}
