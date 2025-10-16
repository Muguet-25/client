'use client';

import { supabase } from '@/utils/config';

interface NavigationItem {
  name: string;
  href: string;
  active?: boolean;
}

const navigationItems: NavigationItem[] = [
  { name: '대시보드', href: '/dashboard', active: true },
  { name: '포스팅 추천', href: '/posts', active: false },
  { name: '분석하기', href: '/analytics', active: false },
  { name: '시청 개요', href: '/youtube', active: false }
];

export default function DashboardNavigation() {
  const handleLogout = async () => {
    try {
      // YouTube 토큰 삭제
      localStorage.removeItem('youtube_access_token');
      localStorage.removeItem('youtube_refresh_token');
      
      // 구글 로그아웃 (Supabase)
      await supabase.auth.signOut();
      
      // 로그인 페이지로 리다이렉트
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('로그아웃 오류:', error);
      // 오류가 발생해도 로그인 페이지로 이동
      window.location.href = '/auth/login';
    }
  };

  return (
    <div className="bg-[#12121e] border-b border-[#696969] px-6 py-4">
      <nav className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center relative">
          {/* 네비게이션 메뉴 - 중앙 정렬 */}
          <div className="flex items-center space-x-8">
            {navigationItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`text-lg font-normal transition-colors ${
                  item.active 
                    ? 'text-[#ff8953]' 
                    : 'text-white hover:text-[#ff8953]'
                }`}
              >
                {item.name}
              </a>
            ))}
          </div>
          
          {/* 로그아웃 버튼 - 절대 위치로 우측 고정 */}
          <button 
            onClick={handleLogout}
            className="absolute right-0 flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm hover:bg-red-500/30 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            로그아웃
          </button>
        </div>
      </nav>
    </div>
  );
}
