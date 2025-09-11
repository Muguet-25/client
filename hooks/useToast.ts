import { useToastStore } from '@/lib/useToastStore';

export const useToast = () => {
  const { toasts, addToast, removeToast, clearAllToasts } = useToastStore();

  const success = (title: string, message?: string, duration?: number) => {
    addToast({ type: 'success', title, message, duration });
  };

  const error = (title: string, message?: string, duration?: number) => {
    addToast({ type: 'error', title, message, duration });
  };

  const warning = (title: string, message?: string, duration?: number) => {
    addToast({ type: 'warning', title, message, duration });
  };

  const info = (title: string, message?: string, duration?: number) => {
    addToast({ type: 'info', title, message, duration });
  };

  return {
    toasts,
    success,
    error,
    warning,
    info,
    removeToast,
    clearAllToasts
  };
};
