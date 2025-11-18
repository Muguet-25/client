"use client";

import { useToast } from '@/hooks/useToast';
import Toast from './Toast';

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-[1000] pointer-events-none flex flex-col gap-3 items-end max-w-[420px] w-full">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          
          onClose={removeToast}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
