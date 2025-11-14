'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/lib/useAuthStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

export default function Chatbot() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 예시 질문 클릭 핸들러
  const handleExampleClick = async (question: string) => {
    if (isLoading || !user?.id) return;
    
    setInput(question);
    
    // 자동으로 메시지 전송
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: question.trim(),
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
          conversationId: conversationId,
          message: question.trim(),
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
        
        // conversationId 저장 (새로 생성된 경우)
        if (data.conversationId && !conversationId) {
          setConversationId(data.conversationId);
        }
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

  // 메시지 전송
  const handleSend = async () => {
    if (!input.trim() || isLoading || !user?.id) return;

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
          conversationId: conversationId,
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
        
        // conversationId 저장 (새로 생성된 경우)
        if (data.conversationId && !conversationId) {
          setConversationId(data.conversationId);
        }
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

  // 스크롤 맨 아래로
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full w-full bg-[#12121e]">
      {/* 메인 채팅 영역 */}
      <div className="flex-1 flex flex-col bg-[#12121e] overflow-hidden">
        {/* 메시지 영역 */}
        {messages.length === 0 ? (
          /* 초기 화면 */
          <div className="flex-1 flex flex-col items-center justify-center px-8 py-6">
            {/* 메인 타이틀 */}
            <div className="mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-[#ff8953] via-[#ffb05b] to-[#ffd700] bg-clip-text text-transparent">
                AI에게 트렌드 콘텐츠를 물어보세요!
              </h1>
            </div>

            {/* 가운데 입력 필드 */}
            <div className="w-full max-w-3xl">
              <div 
                className="bg-[#1c1c28] border border-[#3a3b50] rounded-full px-6 py-3 flex items-center gap-4 shadow-lg hover:shadow-xl transition-shadow cursor-text"
                onClick={() => inputRef.current?.focus()}
              >
                {/* Star 아이콘 */}
                <div className="flex-shrink-0">
                  <img 
                    src="/img/Star 3.svg" 
                    alt="Star" 
                    className="w-6 h-6"
                  />
                </div>

                {/* 입력 필드 */}
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="AI와 대화하기..."
                  className="flex-1 bg-transparent text-[#f5f5f5] placeholder:text-[#9ca3af] text-[16px] outline-none"
                  disabled={isLoading}
                />

                {/* 전송 버튼 (위쪽 화살표) */}
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    input.trim() && !isLoading
                      ? 'bg-[#3a3b50] text-[#f5f5f5] hover:bg-[#4a4b60]'
                      : 'bg-[#2a2b40] text-[#9ca3af] cursor-not-allowed'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 예시 질문 버튼들 */}
            {!input.trim() && (
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => handleExampleClick('요즘 유튜브 트렌드 따라잡기')}
                  className="px-4 py-2.5 border border-[#3a3b50] rounded-full text-[#f5f5f5] text-sm hover:bg-[#2a2a3a] hover:border-[#ff8953] transition-all"
                >
                  요즘 유튜브 트렌드 따라잡기
                </button>
                <button
                  onClick={() => handleExampleClick('최근에 유행중인 이슈 알려줘')}
                  className="px-4 py-2.5 border border-[#3a3b50] rounded-full text-[#f5f5f5] text-sm hover:bg-[#2a2a3a] hover:border-[#ff8953] transition-all"
                >
                  최근에 유행중인 이슈 알려줘
                </button>
                <button
                  onClick={() => handleExampleClick('유행중인 첼린지 목록 정리 해줘')}
                  className="px-4 py-2.5 border border-[#3a3b50] rounded-full text-[#f5f5f5] text-sm hover:bg-[#2a2a3a] hover:border-[#ff8953] transition-all"
                >
                  유행중인 첼린지 목록 정리 해줘
                </button>
              </div>
            )}
          </div>
        ) : (
          /* 일반 채팅 화면 */
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} items-start gap-3`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                    <img 
                      src="/img/Star 3.svg" 
                      alt="AI" 
                      className="w-8 h-8"
                    />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-[#1c1c28] border border-[#3a3b50] text-white rounded-tr-sm'
                      : 'text-[#f5f5f5]'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
                    {message.content}
                  </div>
                </div>
               
              </div>
            ))}

            {/* 로딩 중 */}
            {isLoading && (
              <div className="flex justify-start items-start gap-3">
                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                  <img 
                    src="/img/Star 3.svg" 
                    alt="AI" 
                    className="w-8 h-8"
                  />
                </div>
                <div className="px-4 py-3">
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
        )}

        {/* 입력 영역 - 메시지가 있을 때만 표시 */}
        {messages.length > 0 && (
        <div className="px-8 py-4 flex-shrink-0 border-t border-[#3a3b50] bg-[#12121e]">
          <div className="max-w-3xl mx-auto">
            <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-full px-4 py-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow focus-within:border-[#ff8953] focus-within:shadow-md">
              {/* Star 아이콘 */}
              <div className="flex-shrink-0">
                <img 
                  src="/img/Star 3.svg" 
                  alt="Star" 
                  className="w-6 h-6"
                />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="메시지를 입력하세요..."
                className="flex-1 bg-transparent text-[#f5f5f5] placeholder:text-[#f5f5f5]/60 text-[15px] outline-none"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`p-2 rounded-full transition-colors ${
                  input.trim() && !isLoading
                    ? 'bg-[#ff8953] text-white hover:bg-[#ff7a40]'
                    : 'bg-[#3a3b50] text-[#f5f5f5]/40 cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

