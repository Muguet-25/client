"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  onClose: (id: string) => void;
}

const Toast = ({ 
  id, 
  title, 
  message, 
  onClose 
}: ToastProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const autoHideTimer = useRef<NodeJS.Timeout | null>(null);
  const entranceTimer = useRef<number | null>(null);

  const hideToast = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300);
  };

  useEffect(() => {
    entranceTimer.current = requestAnimationFrame(() => setIsVisible(true));
    autoHideTimer.current = setTimeout(() => {
      hideToast();
    }, 3000);

    return () => {
      if (entranceTimer.current) {
        cancelAnimationFrame(entranceTimer.current);
      }
      if (autoHideTimer.current) {
        clearTimeout(autoHideTimer.current);
      }
    };
  }, [id]);

  const handleClose = () => {
    if (autoHideTimer.current) {
      clearTimeout(autoHideTimer.current);
    }
    hideToast();
  };

  const primaryText = '영상이 정상적으로 예약 되었습니다.';
  const subText = '예약된 영상을 확인 해주세요!';

  return (
    <div 
      className={`
        pointer-events-auto w-full max-w-[520px] bg-[#1c1c28] border border-[#2b2c3f]/80
        rounded-[24px] px-4 py-4 shadow-[0px_30px_60px_rgba(3,3,10,0.55)]
        transition-all duration-300 ease-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="flex items-center gap-6">
        <div className="w-[60px] h-[60px] rounded-[12px] bg-[#26273c] flex items-center justify-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14 25L20 31L33 18"
              stroke="#FF8953"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
           
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[16px] font-semibold text-[#f5f5f5] leading-tight">
            {primaryText}
          </p>
          <p className="text-[14px] text-[#f5f5f5]/60 mt-2 leading-tight">
            {subText}
          </p>
        </div>

        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1.5 text-white/30 hover:text-white transition-colors rounded-full hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;