"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/useAuthStore';
import { BarChart3, TrendingUp, Users, Eye, Heart, MessageCircle, Calendar, Download, Filter } from 'lucide-react';

interface AnalyticsData {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalFollowers: number;
  engagementRate: number;
  topPosts: Array<{
    id: string;
    title: string;
    views: number;
    likes: number;
    comments: number;
    engagementRate: number;
  }>;
  weeklyStats: Array<{
    date: string;
    views: number;
    likes: number;
    comments: number;
  }>;
  audienceDemographics: {
    ageGroups: Array<{ age: string; percentage: number }>;
    genders: Array<{ gender: string; percentage: number }>;
    locations: Array<{ location: string; percentage: number }>;
  };
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuthStore();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/auth/login');
      return;
    }

    // TODO: 실제 API 호출로 변경
    const mockData: AnalyticsData = {
      totalViews: 125430,
      totalLikes: 8920,
      totalComments: 2340,
      totalFollowers: 15600,
      engagementRate: 8.5,
      topPosts: [
        { id: '1', title: '크리에이터 마케팅의 새로운 트렌드', views: 12500, likes: 890, comments: 230, engagementRate: 9.2 },
        { id: '2', title: 'SNS 콘텐츠 제작 팁', views: 8900, likes: 670, comments: 150, engagementRate: 8.1 },
        { id: '3', title: '브랜드 협업 가이드', views: 21000, likes: 1560, comments: 420, engagementRate: 9.8 },
        { id: '4', title: '인플루언서 마케팅 전략', views: 7600, likes: 540, comments: 120, engagementRate: 7.3 },
        { id: '5', title: '콘텐츠 기획 방법론', views: 9800, likes: 720, comments: 180, engagementRate: 8.7 }
      ],
      weeklyStats: [
        { date: '2024-01-08', views: 1200, likes: 85, comments: 23 },
        { date: '2024-01-09', views: 1500, likes: 95, comments: 28 },
        { date: '2024-01-10', views: 1800, likes: 120, comments: 35 },
        { date: '2024-01-11', views: 2100, likes: 140, comments: 42 },
        { date: '2024-01-12', views: 1900, likes: 130, comments: 38 },
        { date: '2024-01-13', views: 2200, likes: 160, comments: 45 },
        { date: '2024-01-14', views: 2500, likes: 180, comments: 52 }
      ],
      audienceDemographics: {
        ageGroups: [
          { age: '18-24', percentage: 25 },
          { age: '25-34', percentage: 35 },
          { age: '35-44', percentage: 22 },
          { age: '45-54', percentage: 12 },
          { age: '55+', percentage: 6 }
        ],
        genders: [
          { gender: '여성', percentage: 58 },
          { gender: '남성', percentage: 42 }
        ],
        locations: [
          { location: '서울', percentage: 45 },
          { location: '경기', percentage: 20 },
          { location: '부산', percentage: 8 },
          { location: '대구', percentage: 6 },
          { location: '기타', percentage: 21 }
        ]
      }
    };

    setTimeout(() => {
      setAnalyticsData(mockData);
      setIsLoading(false);
    }, 1000);
  }, [isLoggedIn, router]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (!isLoggedIn) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">데이터를 불러올 수 없습니다</h2>
          <p className="text-gray-400">잠시 후 다시 시도해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* 헤더 */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-8 h-8 text-orange-500" />
              <h1 className="text-2xl font-bold text-white">분석 대시보드</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      timeRange === range
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {range === '7d' ? '7일' : range === '30d' ? '30일' : range === '90d' ? '90일' : '1년'}
                  </button>
                ))}
              </div>
              <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700">
                <Filter className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* 주요 지표 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">총 조회수</p>
                <p className="text-3xl font-bold text-white">{formatNumber(analyticsData.totalViews)}</p>
                <p className="text-sm text-orange-500 mt-1">+12.5% 이전 기간 대비</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">총 좋아요</p>
                <p className="text-3xl font-bold text-white">{formatNumber(analyticsData.totalLikes)}</p>
                <p className="text-sm text-orange-500 mt-1">+8.3% 이전 기간 대비</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">총 댓글</p>
                <p className="text-3xl font-bold text-white">{formatNumber(analyticsData.totalComments)}</p>
                <p className="text-sm text-orange-500 mt-1">+15.2% 이전 기간 대비</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">참여율</p>
                <p className="text-3xl font-bold text-white">{analyticsData.engagementRate}%</p>
                <p className="text-sm text-orange-500 mt-1">+2.1% 이전 기간 대비</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </div>
        </div>

        {/* 차트 및 상세 분석 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 주간 통계 차트 */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-6">주간 통계</h3>
            <div className="h-64 flex items-end space-x-2">
              {analyticsData.weeklyStats.map((stat, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-orange-500 rounded-t mb-2" style={{ height: `${(stat.views / 2500) * 200}px` }}></div>
                  <span className="text-xs text-gray-400">{new Date(stat.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 인기 포스트 */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-6">인기 포스트</h3>
            <div className="space-y-4">
              {analyticsData.topPosts.slice(0, 5).map((post, index) => (
                <div key={post.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm mb-1 line-clamp-1">{post.title}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span>{formatNumber(post.views)} 조회</span>
                      <span>{post.likes} 좋아요</span>
                      <span>{post.comments} 댓글</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-orange-500 font-semibold text-sm">{post.engagementRate}%</p>
                    <p className="text-xs text-gray-400">참여율</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 오디언스 분석 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 연령대 분포 */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-6">연령대 분포</h3>
            <div className="space-y-4">
              {analyticsData.audienceDemographics.ageGroups.map((group, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">{group.age}</span>
                  <div className="flex items-center space-x-3 flex-1 mx-4">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full" 
                        style={{ width: `${group.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-white text-sm font-medium w-12 text-right">{group.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 성별 분포 */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-6">성별 분포</h3>
            <div className="space-y-4">
              {analyticsData.audienceDemographics.genders.map((gender, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">{gender.gender}</span>
                  <div className="flex items-center space-x-3 flex-1 mx-4">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full" 
                        style={{ width: `${gender.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-white text-sm font-medium w-12 text-right">{gender.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 지역 분포 */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-6">지역 분포</h3>
            <div className="space-y-4">
              {analyticsData.audienceDemographics.locations.map((location, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">{location.location}</span>
                  <div className="flex items-center space-x-3 flex-1 mx-4">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full" 
                        style={{ width: `${location.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-white text-sm font-medium w-12 text-right">{location.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
