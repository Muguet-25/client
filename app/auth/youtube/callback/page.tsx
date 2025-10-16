"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/useToast';

export default function YouTubeCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState('처리 중...');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const handleCallback = async () => {
      console.log('handleCallback 시작');
      // 이미 처리된 요청인지 확인
      if (hasProcessed) {
        console.log('이미 처리 완료됨. 대시보드로 이동합니다.');
        if (isMounted) {
          window.location.href = '/dashboard';
        }
        return;
      }

      // localStorage에 토큰이 있으면 이미 성공
      const existingToken = localStorage.getItem('youtube_access_token');
      if (existingToken) {
        setStatus('이미 연결됨 - 대시보드로 이동합니다...');
        setHasProcessed(true);
        if (isMounted) {
          window.location.href = '/dashboard';
        }
        return;
      }

      // 중복 처리 방지
      if (isProcessing) {
        console.log('이미 처리 중입니다. 대시보드로 이동합니다.');
        if (isMounted) {
          window.location.href = '/dashboard';
        }
        return;
      }

      try {
        setIsProcessing(true);
        setStatus('인증 코드 확인 중...');
        
        const code = searchParams.get('code');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          throw new Error('YouTube 인증이 취소되었습니다.');
        }

        if (!code) {
          throw new Error('인증 코드를 받지 못했습니다.');
        }

        setStatus('토큰 교환 중...');

        // 타임아웃 설정 (10초로 증가)
        timeoutId = setTimeout(() => {
          if (isMounted) {
            setStatus('시간 초과 - 대시보드로 이동합니다...');
            window.location.href = '/dashboard';
          }
        }, 10000);

        // 서버에 코드를 전송하여 토큰 교환
        console.log('토큰 교환 요청 시작, 코드:', code.substring(0, 10) + '...');
        
        const response = await fetch('/api/auth/youtube/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });
        
        console.log('토큰 교환 응답 상태:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || '인증 처리 중 오류가 발생했습니다.');
        }

        const data = await response.json();
        
        if (!isMounted) return;
        
        setStatus('토큰 저장 중...');
        
        // 토큰을 로컬 스토리지에 저장
        localStorage.setItem('youtube_access_token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('youtube_refresh_token', data.refresh_token);
        }

        setStatus('연결 완료!');
        setHasProcessed(true);
        success("YouTube 연결 완료", "YouTube 채널이 성공적으로 연결되었습니다!");
        
        // 즉시 대시보드로 리다이렉트
        if (isMounted) {
          window.location.href = '/dashboard';
        }
        
      } catch (err) {
        if (!isMounted) return;
        
        console.error('YouTube 인증 오류:', err);
        setStatus('연결 실패');
        setHasProcessed(true);
        error("YouTube 연결 실패", err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        
        // 즉시 대시보드로 리다이렉트
        if (isMounted) {
          // window.location을 사용하여 확실한 리다이렉트
          window.location.href = '/dashboard';
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsProcessing(false);
        }
      }
    };

    // 즉시 실행
    handleCallback();

    // 클린업 함수
    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []); // 의존성 배열을 비워서 한 번만 실행

  return (
    <div className="min-h-screen bg-[#12121E] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#ff8953]/30 border-t-[#ff8953] rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-white mb-2">YouTube 연결 중...</h2>
        <p className="text-gray-400 mb-4">{status}</p>
        <div className="text-sm text-gray-500">
          {isLoading ? '잠시만 기다려주세요...' : '곧 대시보드로 이동합니다.'}
        </div>
      </div>
    </div>
  );
}