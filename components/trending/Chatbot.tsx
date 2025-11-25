'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/lib/useAuthStore';
import { useYouTube } from '@/hooks/useYouTube';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

interface ChannelContext {
  channel: any;
  videos: any[];
  analytics: any;
}

export default function Chatbot() {
  const { user } = useAuthStore();
  const { isConnected, channel, videos, analytics, refreshChannel, refreshVideos, refreshAnalytics } = useYouTube();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [channelContext, setChannelContext] = useState<ChannelContext | null>(null);
  const [isLoadingContext, setIsLoadingContext] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const lastMessage = messages[messages.length - 1];

  // 컴포넌트 마운트 시 채널 정보 미리 가져오기
  useEffect(() => {
    const loadChannelContext = async () => {
      if (!isConnected) return;
      
      setIsLoadingContext(true);
      try {
        const accessToken = localStorage.getItem('youtube_access_token');
        if (!accessToken) {
          setIsLoadingContext(false);
          return;
        }

        // 채널 정보가 없으면 가져오기
        if (!channel) {
          await refreshChannel();
        }
        
        // 비디오 목록이 없으면 가져오기
        if (videos.length === 0) {
          await refreshVideos();
        }

        // Analytics 정보 가져오기
        if (channel) {
          const endDate = new Date().toISOString().split('T')[0];
          const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          await refreshAnalytics(startDate, endDate);
        }
      } catch (error) {
        console.error('채널 정보 로드 실패:', error);
      } finally {
        setIsLoadingContext(false);
      }
    };

    loadChannelContext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  // 채널 정보가 준비되면 context에 저장
  useEffect(() => {
    if (channel && videos.length > 0) {
      setChannelContext({
        channel,
        videos: videos.slice(0, 5), // 최근 5개만
        analytics, // analytics 정보도 포함
      });
    }
  }, [channel, videos, analytics]);

  

  // 공통: 서버에 메시지 보내고 스트리밍 받는 함수
  const sendMessageToApi = async (text: string) => {
    if (!text.trim() || !user?.id) return;
    if (isLoading) return;

    const content = text.trim();

    // 1) 유저 메시지 추가
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const accessToken = localStorage.getItem('youtube_access_token');

      // 채널 컨텍스트 정보 준비
      const contextData = channelContext ? {
        channel: {
          title: channelContext.channel?.title,
          statistics: channelContext.channel?.statistics,
        },
        videos: channelContext.videos.map(v => ({
          title: v.title,
          statistics: v.statistics,
          publishedAt: v.publishedAt,
        })),
        analytics: channelContext.analytics ? {
          views: channelContext.analytics.views,
          averageViewDuration: channelContext.analytics.averageViewDuration,
          subscribersGained: channelContext.analytics.subscribersGained,
        } : null,
      } : null;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          message: content,
          userId: user.id,
          accessToken: accessToken || undefined,
          channelContext: contextData, // 미리 준비된 채널 정보 전달
        }),
      });

      if (!response.body) {
        console.error('스트림이 없습니다.');
        setIsLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // 2) 비어 있는 AI 메시지 하나 만들어 두고, 여기에 델타를 계속 붙임
      const assistantId = `assistant-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: 'assistant',
          content: '',
        },
      ]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          let event: any;
          try {
            event = JSON.parse(line);
          } catch (e) {
            console.error('JSON 파싱 오류:', e, line);
            continue;
          }

          if (event.type === 'meta') {
            // 서버에서 보내준 conversationId 저장
            if (event.conversationId) {
              setConversationId((prev) => prev ?? event.conversationId);
            }
          } else if (event.type === 'delta') {
            const deltaText: string = event.content ?? '';
            if (!deltaText) continue;

            // assistant 메시지에 토큰 추가
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: m.content + deltaText }
                  : m
              )
            );
          } else if (event.type === 'done') {
            // 스트리밍 종료
            setIsLoading(false);
            break;
          } else if (event.type === 'error') {
            console.error('서버 에러 이벤트:', event.message);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                    ...m,
                    content:
                      m.content ||
                      '응답을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
                  }
                  : m
              )
            );
            setIsLoading(false);
            break;
          }
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      // 마지막 assistant 메시지에 에러 표시 (있다면)
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (!last || last.role !== 'assistant') return prev;
        return [
          ...prev.slice(0, -1),
          {
            ...last,
            content:
              last.content ||
              '응답을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
          },
        ];
      });
      setIsLoading(false);
    }
  };

  // 예시 질문 클릭
  const handleExampleClick = async (question: string) => {
    if (isLoading || !user?.id) return;
    setInput(question);
    await sendMessageToApi(question);
  };

  // 직접 입력 전송
  const handleSend = async () => {
    if (!input.trim() || isLoading || !user?.id) return;
    await sendMessageToApi(input);
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
              <h1 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-[#ff8953] via-[#ffb05b] to-[#ffd700] bg-clip-text text-transparent mb-3">
                AI한테 무엇이든 물어보세요!
              </h1>
              <p className="text-[#aaaaaa] text-center text-base">
                채널 데이터를 분석해 오늘 바로 실행할 수 있는 조언을 드립니다
              </p>
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
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${input.trim() && !isLoading
                      ? 'bg-[#3a3b50] text-[#f5f5f5] hover:bg-[#4a4b60]'
                      : 'bg-[#2a2b40] text-[#9ca3af] cursor-not-allowed'
                    }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* 예시 질문 버튼들 */}
            {!input.trim() && (
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() =>
                    handleExampleClick('이번 주에 뭘 찍는 게 좋을까?')
                  }
                  className="px-4 py-2.5 border border-[#3a3b50] rounded-full text-[#f5f5f5] text-sm hover:bg-[#2a2a3a] hover:border-[#ff8953] transition-all"
                >
                  이번 주에 뭘 찍는 게 좋을까?
                </button>
                <button
                  onClick={() =>
                    handleExampleClick(
                      '리메이크 추천 영상 찾기'
                    )
                  }
                  className="px-4 py-2.5 border border-[#3a3b50] rounded-full text-[#f5f5f5] text-sm hover:bg-[#2a2a3a] hover:border-[#ff8953] transition-all"
                >
                  리메이크 추천 영상 찾기
                </button>
                <button
                  onClick={() =>
                    handleExampleClick('10분짜리 vs 쇼츠 비교')
                  }
                  className="px-4 py-2.5 border border-[#3a3b50] rounded-full text-[#f5f5f5] text-sm hover:bg-[#2a2a3a] hover:border-[#ff8953] transition-all"
                >
                  10분짜리 vs 쇼츠 비교
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
                  className={`flex ${message.role === 'user'
                      ? 'justify-end'
                      : 'justify-start'
                    } items-start gap-3`}
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
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user'
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

              {/* 로딩 중 점 3개 */}
              {isLoading && lastMessage?.role !== 'assistant' && (
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
                  className={`p-2 rounded-full transition-colors ${input.trim() && !isLoading
                      ? 'bg-[#ff8953] text-white hover:bg-[#ff7a40]'
                      : 'bg-[#3a3b50] text-[#f5f5f5]/40 cursor-not-allowed'
                    }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
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