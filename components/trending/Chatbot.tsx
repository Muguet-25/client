'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/lib/useAuthStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export default function Chatbot() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 대화방 목록 로드
  const loadConversations = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/conversations?userId=${user.id}`);
      const data = await response.json();
      if (data.conversations) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('대화방 목록 로드 실패:', error);
    }
  };

  // 메시지 로드
  const loadMessages = async (conversationId: string) => {
    if (!user?.id) return;

    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/messages?userId=${user.id}`
      );
      const data = await response.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('메시지 로드 실패:', error);
    }
  };

  // 새 대화방 생성
  const createNewConversation = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();
      if (data.conversation) {
        setCurrentConversationId(data.conversation.id);
        setMessages([]);
        await loadConversations();
        setIsSidebarOpen(false);
        inputRef.current?.focus();
      }
    } catch (error) {
      console.error('대화방 생성 실패:', error);
    }
  };

  // 메시지 전송
  const handleSend = async () => {
    if (!input.trim() || isLoading || !currentConversationId || !user?.id) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: currentConversationId,
          message: userMessage.content,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (data.message) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
        };
        setMessages((prev) => [...prev, aiMessage]);
        await loadConversations(); // 대화방 목록 새로고침 (제목 업데이트)
      } else {
        console.error('AI 응답 오류:', data.error);
        setMessages((prev) => prev.slice(0, -1)); // 사용자 메시지 제거
      }
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      setMessages((prev) => prev.slice(0, -1)); // 사용자 메시지 제거
    } finally {
      setIsLoading(false);
    }
  };

  // 대화방 선택
  const selectConversation = async (conversationId: string) => {
    setCurrentConversationId(conversationId);
    await loadMessages(conversationId);
    setIsSidebarOpen(false);
  };

  // 대화방 삭제
  const deleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 부모 버튼의 클릭 이벤트 방지

    if (!user?.id) return;

    if (!confirm('이 대화방을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/conversations?conversationId=${conversationId}&userId=${user.id}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (data.success) {
        // 삭제된 대화방이 현재 선택된 대화방이면 초기화
        const wasCurrentConversation = currentConversationId === conversationId;
        if (wasCurrentConversation) {
          setCurrentConversationId(null);
          setMessages([]);
        }

        // 대화방 목록 새로고침
        const listResponse = await fetch(`/api/conversations?userId=${user.id}`);
        const listData = await listResponse.json();
        const updatedConversations = listData.conversations || [];

        // 대화방 목록 상태 업데이트
        setConversations(updatedConversations);

        // 대화방이 없으면 새로 생성
        if (updatedConversations.length === 0) {
          await createNewConversation();
        } else if (wasCurrentConversation) {
          // 삭제된 대화방이 현재 선택된 대화방이면 첫 번째 대화방 선택
          selectConversation(updatedConversations[0].id);
        }
      } else {
        console.error('대화방 삭제 실패:', data.error);
        alert('대화방 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('대화방 삭제 실패:', error);
      alert('대화방 삭제에 실패했습니다.');
    }
  };

  // 스크롤 맨 아래로
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 초기 로드
  useEffect(() => {
    if (user?.id) {
      loadConversations();
    }
  }, [user?.id]);

  // 첫 대화방이 없으면 자동 생성, 있으면 자동 선택
  useEffect(() => {
    if (user?.id && conversations.length === 0 && !currentConversationId) {
      createNewConversation();
    } else if (conversations.length > 0 && !currentConversationId) {
      selectConversation(conversations[0].id);
    }
  }, [conversations, user?.id]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full w-full bg-[#12121e]">
      {/* 사이드바 */}
      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-16'
        } bg-[#1c1c28] border-r border-[#3a3b50] flex flex-col flex-shrink-0`}
      >
        {/* 사이드바 헤더 */}
        <div className="p-4 border-b border-[#3a3b50]">
          <div className="flex items-center justify-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-[#3a3b50] rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-[#f5f5f5]/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* 새 채팅 버튼 */}
        <div className="p-3 border-b border-[#3a3b50]">
          <button
            onClick={createNewConversation}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#3a3b50] rounded-xl transition-colors text-[#f5f5f5] font-medium"
          >
            <svg className="w-5 h-5 text-[#f5f5f5]/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {isSidebarOpen && <span className="text-sm">새 채팅</span>}
          </button>
        </div>

        {/* 대화방 목록 */}
        {isSidebarOpen && (
          <div className="flex-1 overflow-y-auto p-2">
            <div className="text-[#f5f5f5]/60 text-xs font-medium mb-2 px-3 py-1">최근 대화</div>
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group relative w-full rounded-lg transition-colors ${
                    currentConversationId === conversation.id
                      ? 'bg-[#3a3b50] border border-[#ff8953]'
                      : 'hover:bg-[#3a3b50]'
                  }`}
                >
                  <button
                    onClick={() => selectConversation(conversation.id)}
                    className="w-full text-left px-3 py-2.5 pr-8"
                  >
                    <div className="text-[#f5f5f5] text-sm truncate font-medium">{conversation.title}</div>
                  </button>
                  <button
                    onClick={(e) => deleteConversation(conversation.id, e)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-[#4a4b60] rounded transition-opacity"
                    title="대화방 삭제"
                  >
                    <svg
                      className="w-4 h-4 text-[#f5f5f5]/60 hover:text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 메인 채팅 영역 */}
      <div className="flex-1 flex flex-col bg-[#12121e] overflow-hidden">
        {/* 헤더 제거 */}

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#ff8953] to-[#ffb05b] flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <p className="text-[#f5f5f5]/60 text-lg">대화를 시작해보세요</p>
              </div>
            </div>
          )}

          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} items-start gap-3`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff8953] to-[#ffb05b] flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-[#ff8953] text-white rounded-tr-sm'
                      : 'bg-[#1c1c28] border border-[#3a3b50] text-[#f5f5f5] rounded-tl-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
                    {message.content}
                  </div>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-[#3a3b50] flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-[#f5f5f5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
            ))}

            {/* 로딩 중 */}
            {isLoading && (
              <div className="flex justify-start items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff8953] to-[#ffb05b] flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-[#ff8953] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-[#ff8953] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-[#ff8953] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 입력 영역 */}
        <div className="px-8 py-4 flex-shrink-0 border-t border-[#3a3b50] bg-[#12121e]">
          <div className="max-w-3xl mx-auto">
            <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-full px-4 py-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow focus-within:border-[#ff8953] focus-within:shadow-md">
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || !currentConversationId}
                className={`p-2 rounded-full transition-colors ${
                  input.trim() && !isLoading && currentConversationId
                    ? 'bg-[#ff8953] text-white hover:bg-[#ff7a40]'
                    : 'bg-[#3a3b50] text-[#f5f5f5]/40 cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="메시지를 입력하세요..."
                className="flex-1 bg-transparent text-[#f5f5f5] placeholder:text-[#f5f5f5]/60 text-[15px] outline-none"
                disabled={isLoading || !currentConversationId}
              />
              <button
                className="p-2 text-[#f5f5f5]/60 hover:text-[#f5f5f5] rounded-full hover:bg-[#3a3b50] transition-colors"
                title="첨부"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

