"use client";

import { useToast } from '@/hooks/useToast';

export default function ToastDemoPage() {
  const { success, error, warning, info, clearAllToasts } = useToast();

  const handleSuccess = () => {
    success("성공!", "작업이 성공적으로 완료되었습니다.");
  };

  const handleError = () => {
    error("오류 발생", "문제가 발생했습니다. 다시 시도해주세요.");
  };

  const handleWarning = () => {
    warning("주의", "이 작업은 되돌릴 수 없습니다.");
  };

  const handleInfo = () => {
    info("정보", "새로운 기능이 추가되었습니다.");
  };

  const handleMultiple = () => {
    success("첫 번째 토스트", "성공 메시지입니다.");
    setTimeout(() => info("두 번째 토스트", "정보 메시지입니다."), 500);
    setTimeout(() => warning("세 번째 토스트", "경고 메시지입니다."), 1000);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full space-y-4">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          토스트 데모
        </h1>
        
        <div className="space-y-4">
          <button
            onClick={handleSuccess}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            성공 토스트
          </button>
          
          <button
            onClick={handleError}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            에러 토스트
          </button>
          
          <button
            onClick={handleWarning}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            경고 토스트
          </button>
          
          <button
            onClick={handleInfo}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            정보 토스트
          </button>
          
          <button
            onClick={handleMultiple}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            여러 토스트
          </button>
          
          <button
            onClick={clearAllToasts}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            모든 토스트 지우기
          </button>
        </div>
      </div>
    </div>
  );
}
