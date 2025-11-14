'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/lib/useAuthStore';
import { supabase } from '@/utils/config';
import { 
  LayoutDashboard, 
  Calendar,
  List,
  Star,
  AlertTriangle,
  User,
  LogOut
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  iconName?: string; // Material Symbols 아이콘 이름
}

const navigationItems: NavigationItem[] = [
  { name: '대시보드', href: '/dashboard', icon: LayoutDashboard, iconName: 'dashboard' },
  { name: '리포트', href: '/report', icon: Calendar, iconName: 'calendar_today' },
  { name: '컨텐츠 목록', href: '/posts', icon: List, iconName: 'list' },
  { name: '트렌드', href: '/trending', icon: Star, iconName: 'kid_star' },
  { name: '콘텐츠 문제 분석', href: '/analytics', icon: AlertTriangle, iconName: 'warning' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  // 현재 경로가 메뉴 아이템의 href와 일치하는지 확인 (부분 일치 포함)
  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  // 로그아웃 핸들러
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
    <div className="fixed left-0 top-0 h-screen w-[260px] bg-[#1c1c28] border-r border-[#3a3b50] flex flex-col z-50">
      {/* Logo Container */}
      <div className="py-7 px-6 border-b border-[#3a3b50]">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 relative flex-shrink-0">
            <Image 
              src="/img/logo_v2.svg" 
              alt="Logo" 
              width={36} 
              height={36}
              className="w-9 h-9"
            />
          </div>
          <span className="text-[#f5f5f5] font-semibold text-2xl whitespace-nowrap">
            MUGUET
          </span>
        </Link>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-4 px-6 overflow-y-auto">
        <div className="space-y-0">
          {navigationItems.map((item) => {
            const isActive = isActiveRoute(item.href);
            const Icon = item.icon;
            
            return (
              <Link 
                href={item.href} 
                key={item.name}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 mb-1 ${
                  isActive 
                    ? 'bg-[#ff8953]/20' 
                    : 'hover:bg-[#2a2a3a]'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[#ff8953]' : 'text-[#ff8953]'}`} />
                <span className={`text-base font-normal whitespace-nowrap ${
                  isActive ? 'text-white' : 'text-white'
                }`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className="py-6 px-6 border-t border-[#3a3b50]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-11 h-11 rounded-lg bg-transparent flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-[#f5f5f5]/50" />
            </div>
            <span className="text-[#f5f5f5]/50 text-base font-normal whitespace-nowrap truncate">
              {user?.user_metadata?.full_name || '사용자'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex-shrink-0 p-2 rounded-lg hover:bg-[#2a2a3a] transition-colors group"
            aria-label="로그아웃"
            title="로그아웃"
          >
            <LogOut className="w-5 h-5 text-[#f5f5f5]/50 group-hover:text-[#ff8953] transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
}

