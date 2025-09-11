"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/useAuthStore';
import { useToast } from '@/hooks/useToast';
import { ArrowLeft, Image, Video, Link, Bold, Italic, List, Hash, Smile, Send } from 'lucide-react';

export default function CreatePostPage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuthStore();
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [postData, setPostData] = useState({
    title: '',
    content: '',
    tags: '',
    type: 'text' as 'text' | 'image' | 'video'
  });

  if (!isLoggedIn) {
    router.push('/auth/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: 실제 API 호출로 변경
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      success("포스트 작성 완료", "새 포스트가 성공적으로 작성되었습니다!");
      router.push('/posts');
    } catch (err) {
      error("포스트 작성 실패", "포스트 작성 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* 헤더 */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-white">새 포스트 작성</h1>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 포스트 타입 선택 */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">포스트 타입</h3>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setPostData({ ...postData, type: 'text' })}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg border transition-colors ${
                  postData.type === 'text'
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Bold className="w-5 h-5" />
                <span>텍스트</span>
              </button>
              <button
                type="button"
                onClick={() => setPostData({ ...postData, type: 'image' })}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg border transition-colors ${
                  postData.type === 'image'
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Image className="w-5 h-5" />
                <span>이미지</span>
              </button>
              <button
                type="button"
                onClick={() => setPostData({ ...postData, type: 'video' })}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg border transition-colors ${
                  postData.type === 'video'
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Video className="w-5 h-5" />
                <span>비디오</span>
              </button>
            </div>
          </div>

          {/* 제목 입력 */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              제목
            </label>
            <input
              type="text"
              value={postData.title}
              onChange={(e) => setPostData({ ...postData, title: e.target.value })}
              placeholder="포스트 제목을 입력하세요"
              className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-3 rounded-lg border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              required
            />
          </div>

          {/* 콘텐츠 입력 */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-300">
                내용
              </label>
              <div className="flex items-center space-x-2">
                <button type="button" className="p-2 text-gray-400 hover:text-white rounded">
                  <Bold className="w-4 h-4" />
                </button>
                <button type="button" className="p-2 text-gray-400 hover:text-white rounded">
                  <Italic className="w-4 h-4" />
                </button>
                <button type="button" className="p-2 text-gray-400 hover:text-white rounded">
                  <List className="w-4 h-4" />
                </button>
                <button type="button" className="p-2 text-gray-400 hover:text-white rounded">
                  <Link className="w-4 h-4" />
                </button>
                <button type="button" className="p-2 text-gray-400 hover:text-white rounded">
                  <Smile className="w-4 h-4" />
                </button>
              </div>
            </div>
            <textarea
              value={postData.content}
              onChange={(e) => setPostData({ ...postData, content: e.target.value })}
              placeholder="포스트 내용을 입력하세요..."
              rows={12}
              className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-3 rounded-lg border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none"
              required
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-400">
                {postData.content.length}/2000
              </span>
              <div className="flex items-center space-x-2">
                <Image className="w-4 h-4 text-gray-400" />
                <Video className="w-4 h-4 text-gray-400" />
                <Hash className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* 태그 입력 */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              태그
            </label>
            <input
              type="text"
              value={postData.tags}
              onChange={(e) => setPostData({ ...postData, tags: e.target.value })}
              placeholder="태그를 쉼표로 구분하여 입력하세요 (예: 마케팅, 크리에이터, SNS)"
              className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-3 rounded-lg border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
            <p className="text-xs text-gray-400 mt-2">
              태그는 콤마(,)로 구분하여 입력하세요
            </p>
          </div>

          {/* 미리보기 */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">미리보기</h3>
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">{postData.title || '제목을 입력하세요'}</h4>
              <p className="text-gray-300 whitespace-pre-wrap">
                {postData.content || '내용을 입력하세요...'}
              </p>
              {postData.tags && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {postData.tags.split(',').map((tag, index) => (
                    <span
                      key={index}
                      className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full"
                    >
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-3 text-gray-300 hover:text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading || !postData.title || !postData.content}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>작성 중...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>포스트 발행</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
