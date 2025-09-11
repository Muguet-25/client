"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/useAuthStore';
import { useLoginStore } from '@/lib/useLogin';
import { useToast } from '@/hooks/useToast';
import { LogOut, User, Settings, BarChart3, Calendar, Mail, Menu, X, ChevronDown } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { isLoggedIn, user, isLoading } = useAuthStore();
  const { logout } = useLoginStore();
  const { success, error } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/auth/login');
    }
  }, [isLoggedIn, isLoading, router]);

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen) {
        const target = event.target as Element;
        if (!target.closest('.user-menu-container')) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      setIsOpen(false);
      await logout();
      success("로그아웃 완료", "성공적으로 로그아웃되었습니다.");
      router.push('/');
    } catch (err) {
      error("로그아웃 실패", "로그아웃 중 문제가 발생했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* 헤더 */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <h1 className="text-xl font-bold text-white">Muguet</h1>
              </div>
              
              {/* 네비게이션 탭 */}
              <nav className="flex space-x-6">
                <button className="text-green-400 font-medium text-sm border-b-2 border-green-400 pb-1">
                  Overview
                </button>
                <button 
                  onClick={() => router.push('/posts')}
                  className="text-gray-400 hover:text-white font-medium text-sm"
                >
                  Posts
                </button>
                <button 
                  onClick={() => router.push('/analytics')}
                  className="text-gray-400 hover:text-white font-medium text-sm flex items-center space-x-1"
                >
                  <span>Analytics</span>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                </button>
                <button 
                  onClick={() => router.push('/youtube')}
                  className="text-gray-400 hover:text-white font-medium text-sm flex items-center space-x-1"
                >
                  <span>YouTube</span>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                </button>
                <button className="text-gray-400 hover:text-white font-medium text-sm">
                  Audiences
                </button>
                <button className="text-gray-400 hover:text-white font-medium text-sm">
                  Reports
                </button>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="p-2 text-gray-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 00-15 0v5h5l-5 5-5-5h5v-5a7.5 7.5 0 0115 0v5z" />
                </svg>
              </button>
              <div className="relative user-menu-container">
                <button 
                  className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-700"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">{user?.user_metadata?.full_name || '사용자'}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* 드롭다운 메뉴 */}
                {isOpen && (
                  <>
                    {/* 오버레이 */}
                    <div 
                      className="fixed inset-0 z-[99]"
                      onClick={() => setIsOpen(false)}
                    />
                    {/* 메뉴 */}
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 z-[100]">
                    {/* 사용자 정보 */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium text-sm">
                            {user?.user_metadata?.full_name || "사용자"}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 메뉴 항목들 */}
                    <div className="py-2">
                      <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors text-left">
                        <BarChart3 className="w-4 h-4" />
                        <span className="text-sm font-medium">대시보드</span>
                      </button>
                      <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors text-left">
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">프로필</span>
                      </button>
                      <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors text-left">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-medium">일정</span>
                      </button>
                      <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors text-left">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm font-medium">메시지</span>
                      </button>
                      <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors text-left">
                        <Settings className="w-4 h-4" />
                        <span className="text-sm font-medium">설정</span>
                      </button>
                      
                      {/* 구분선 */}
                      <div className="my-2 border-t border-gray-200"></div>
                      
                      {/* 로그아웃 버튼 */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">로그아웃</span>
                      </button>
                    </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* 웰컴 섹션 */}
        <div className="mb-8">
          <p className="text-sm text-gray-400 mb-1">Welcome back,</p>
          <h1 className="text-3xl font-bold text-white mb-2">{user?.user_metadata?.full_name || '사용자'}</h1>
        </div>

        {/* 메트릭 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-400">With no title</span>
              </div>
              <div className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                Premium
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-white">975,124</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-sm text-green-400">+42.8% from previous week</span>
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-400">With title</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-white">296,241</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-sm text-green-400">+26.3% from previous week</span>
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-500 rounded-xl p-6 border border-green-400">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-white" />
                <span className="text-sm text-white">Company</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-white">76,314</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-sm text-red-300">-18.4% from previous week</span>
                  <svg className="w-4 h-4 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 필터 및 액션 버튼들 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <button className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
                All
              </button>
              <button className="bg-gray-800 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium">
                Engagement
              </button>
              <button className="bg-gray-800 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium">
                Visit
              </button>
              <button className="bg-gray-800 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium">
                Post
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
            </button>
            <button className="p-2 text-gray-400 hover:text-white">
              <Calendar className="w-5 h-5" />
            </button>
            <button className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Download reports</span>
            </button>
          </div>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Engagement Rate Chart */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-white">Engagement rate</h3>
              </div>
              <div className="flex space-x-2">
                <button className="text-gray-400 text-sm px-3 py-1 rounded">Monthly</button>
                <button className="bg-green-500 text-white text-sm px-3 py-1 rounded">Annually</button>
              </div>
            </div>
            
            {/* 차트 영역 */}
            <div className="h-48 flex items-end space-x-2">
              <div className="flex-1 bg-purple-500 h-16 rounded-t"></div>
              <div className="flex-1 bg-purple-500 h-20 rounded-t"></div>
              <div className="flex-1 bg-purple-500 h-12 rounded-t"></div>
              <div className="flex-1 bg-purple-600 h-24 rounded-t border-2 border-green-400"></div>
              <div className="flex-1 bg-purple-500 h-18 rounded-t"></div>
              <div className="flex-1 bg-purple-500 h-14 rounded-t"></div>
            </div>
            
            {/* X축 라벨 */}
            <div className="flex justify-between mt-4 text-xs text-gray-400">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
            </div>
          </div>

          {/* Time Visit Heatmap */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-white">Time visit</h3>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-400">Follower</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            
            {/* 히트맵 그리드 */}
            <div className="space-y-1">
              {['2pm', '1pm', '12pm', '11am', '10am', '9am', '8am'].map((time, i) => (
                <div key={time} className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400 w-8">{time}</span>
                  <div className="flex space-x-1">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, j) => (
                      <div 
                        key={day} 
                        className={`w-6 h-6 rounded ${
                          Math.random() > 0.5 ? 'bg-green-400' : 
                          Math.random() > 0.3 ? 'bg-green-500' : 
                          Math.random() > 0.1 ? 'bg-green-600' : 'bg-gray-700'
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* 범례 */}
            <div className="flex items-center space-x-4 mt-4 text-xs text-gray-400">
              <span>Less</span>
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-gray-700 rounded"></div>
                <div className="w-3 h-3 bg-green-600 rounded"></div>
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <div className="w-3 h-3 bg-green-400 rounded"></div>
              </div>
              <span>More</span>
            </div>
          </div>

          {/* Messages */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-white">Messages</h3>
              </div>
              <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
            
            {/* 검색 바 */}
            <div className="relative mb-4">
              <input 
                type="text" 
                placeholder="Search message" 
                className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-lg text-sm"
              />
              <svg className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* 메시지 리스트 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 hover:bg-gray-700 rounded-lg cursor-pointer">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">TW</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-white text-sm font-medium">Theresa Webb</p>
                    <span className="text-xs text-gray-400">3 min</span>
                  </div>
                  <p className="text-gray-400 text-xs">Hi Robert, I'd like to invite yo...</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 hover:bg-gray-700 rounded-lg cursor-pointer">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">MM</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-white text-sm font-medium">Marvin McKinney</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400">13:09</span>
                      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs">I've send you my portfolio, pl...</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 hover:bg-gray-700 rounded-lg cursor-pointer">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">JW</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-white text-sm font-medium">Jenny Wilson</p>
                    <span className="text-xs text-gray-400">Jun 27</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}