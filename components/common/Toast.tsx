"use client";

import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast = ({ 
  id, 
  type, 
  title, 
  message, 
  duration = 5000, 
  onClose 
}: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        // 애니메이션 완료 후 실제로 제거
        setTimeout(() => onClose(id), 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
        );
      case "error":
        return (
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <X className="w-5 h-5 text-white" />
          </div>
        );
      case "warning":
        return (
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
        );
      case "info":
        return (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Info className="w-5 h-5 text-white" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Info className="w-5 h-5 text-white" />
          </div>
        );
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300);
  };

  return (
    <div 
      className={`
        fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full
        bg-gray-800 rounded-xl shadow-2xl border border-gray-700
        transition-all duration-300 ease-in-out
        ${isVisible 
          ? 'animate-in slide-in-from-top-2 fade-in' 
          : 'animate-out slide-out-to-top-2 fade-out'
        }
      `}
    >
      <div className="flex items-start p-5">
        <div className="flex-shrink-0 mr-4">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-white mb-1">
            {title}
          </h4>
          {message && (
            <p className="text-sm text-gray-300 leading-relaxed">
              {message}
            </p>
          )}
        </div>

        <button
          onClick={handleClose}
          className="flex-shrink-0 ml-3 p-1 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;