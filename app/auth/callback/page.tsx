"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/useAuthStore';
import { supabase } from '@/utils/config';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { setAuthState, setLoading } = useAuthStore();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.push('/auth/login?error=auth_callback_failed');
          return;
        }

        if (data.session?.user) {
          setAuthState(true, data.session.user);
          router.push('/dashboard');
        } else {
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.push('/auth/login?error=auth_callback_failed');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [router, setAuthState, setLoading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg">로그인 처리 중...</p>
      </div>
    </div>
  );
}