"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/useAuthStore';
import { useToast } from '@/hooks/useToast';
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye, Heart, MessageCircle, Share } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  tags: string[];
  type: 'text' | 'image' | 'video';
  createdAt: string;
  views: number;
  likes: number;
  comments: number;
  status: 'published' | 'draft' | 'scheduled';
}

export default function PostsPage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuthStore();
  const { success, error } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'published' | 'draft' | 'scheduled'>('all');

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/auth/login');
      return;
    }

    // TODO: 실제 API 호출로 변경
    const mockPosts: Post[] = [
      {
        id: '1',
        title: '크리에이터 마케팅의 새로운 트렌드',
        content: '2024년 크리에이터 마케팅에서 주목해야 할 주요 트렌드들을 분석해보겠습니다...',
        tags: ['마케팅', '트렌드', '크리에이터'],
        type: 'text',
        createdAt: '2024-01-15T10:30:00Z',
        views: 1250,
        likes: 89,
        comments: 23,
        status: 'published'
      },
      {
        id: '2',
        title: 'SNS 콘텐츠 제작 팁',
        content: '더 많은 사람들에게 어필하는 SNS 콘텐츠를 만드는 방법을 공유합니다...',
        tags: ['SNS', '콘텐츠', '팁'],
        type: 'image',
        createdAt: '2024-01-14T15:45:00Z',
        views: 890,
        likes: 67,
        comments: 15,
        status: 'published'
      },
      {
        id: '3',
        title: '브랜드 협업 가이드',
        content: '브랜드와의 성공적인 협업을 위한 실전 가이드...',
        tags: ['브랜드', '협업', '가이드'],
        type: 'video',
        createdAt: '2024-01-13T09:20:00Z',
        views: 2100,
        likes: 156,
        comments: 42,
        status: 'published'
      },
      {
        id: '4',
        title: '인플루언서 마케팅 전략',
        content: '효과적인 인플루언서 마케팅 전략 수립 방법...',
        tags: ['인플루언서', '마케팅', '전략'],
        type: 'text',
        createdAt: '2024-01-12T14:10:00Z',
        views: 0,
        likes: 0,
        comments: 0,
        status: 'draft'
      }
    ];

    setTimeout(() => {
      setPosts(mockPosts);
      setIsLoading(false);
    }, 1000);
  }, [isLoggedIn, router]);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterType === 'all' || post.status === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const handleDeletePost = async (postId: string) => {
    if (!confirm('정말로 이 포스트를 삭제하시겠습니까?')) return;

    try {
      // TODO: 실제 API 호출로 변경
      setPosts(posts.filter(post => post.id !== postId));
      success("포스트 삭제 완료", "포스트가 성공적으로 삭제되었습니다.");
    } catch (err) {
      error("포스트 삭제 실패", "포스트 삭제 중 오류가 발생했습니다.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500';
      case 'draft': return 'bg-yellow-500';
      case 'scheduled': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return '발행됨';
      case 'draft': return '임시저장';
      case 'scheduled': return '예약됨';
      default: return status;
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* 헤더 */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">포스트 관리</h1>
            <button
              onClick={() => router.push('/posts/create')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>새 포스트</span>
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* 검색 및 필터 */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="포스트 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 text-white placeholder-gray-400 pl-10 pr-4 py-3 rounded-lg border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'all'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setFilterType('published')}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'published'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                발행됨
              </button>
              <button
                onClick={() => setFilterType('draft')}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'draft'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                임시저장
              </button>
              <button
                onClick={() => setFilterType('scheduled')}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'scheduled'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                예약됨
              </button>
            </div>
          </div>
        </div>

        {/* 포스트 목록 */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">포스트가 없습니다</h3>
                <p className="text-gray-400 mb-6">첫 번째 포스트를 작성해보세요!</p>
                <button
                  onClick={() => router.push('/posts/create')}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  포스트 작성하기
                </button>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div key={post.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(post.status)}`}>
                          {getStatusText(post.status)}
                        </span>
                        <span className="text-sm text-gray-400">{formatDate(post.createdAt)}</span>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-white mb-2">{post.title}</h3>
                      <p className="text-gray-300 mb-4 line-clamp-2">{post.content}</p>
                      
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex items-center space-x-1 text-gray-400">
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">{post.views.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-400">
                          <Heart className="w-4 h-4" />
                          <span className="text-sm">{post.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-400">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-sm">{post.comments}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-orange-500/20 text-orange-300 text-xs px-2 py-1 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700">
                        <Share className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-gray-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
