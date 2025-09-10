"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/useAuthStore';
import { useLoginStore } from '@/lib/useLogin';
import { LogOut, User, Settings, BarChart3, Calendar, Mail } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { isLoggedIn, user, isLoading } = useAuthStore();
  const { logout } = useLoginStore();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/auth/login');
    }
  }, [isLoggedIn, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* 헤더 */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">Muguet</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-white">{user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>로그아웃</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">대시보드</h2>
          <p className="text-gray-400">크리에이터를 위한 마케팅 플랫폼에 오신 것을 환영합니다!</p>
        </div>

        {/* 통계 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-400">총 조회수</p>
                <p className="text-2xl font-bold text-white">12,345</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <User className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-400">팔로워</p>
                <p className="text-2xl font-bold text-white">1,234</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-green-400" />
              <div className="ml-4">
                <p className="text-sm text-gray-400">이번 달 포스트</p>
                <p className="text-2xl font-bold text-white">24</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <Mail className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-400">참여율</p>
                <p className="text-2xl font-bold text-white">8.5%</p>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">최근 활동</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-gray-300">새로운 포스트가 업로드되었습니다</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-300">팔로워가 10명 증가했습니다</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-300">새로운 댓글이 달렸습니다</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">빠른 액션</h3>
            <div className="space-y-3">
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                새 포스트 작성
              </button>
              <button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                분석 보고서 보기
              </button>
              <button className="w-full bg-green-400 hover:bg-green-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                캠페인 설정
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}