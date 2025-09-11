"use client";

import { useToast } from '@/hooks/useToast';
import Toast from './Toast';

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          onClose={removeToast}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
