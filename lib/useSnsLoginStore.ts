import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/utils/config';
import { useAuthStore } from './useAuthStore';

type SnsProvider = 'google' | 'kakao' | 'facebook';

type SnsLoginStore = {
    snsLogin: (provider: SnsProvider) => Promise<void>;
    snsLogout: () => Promise<void>;
    isLoading: boolean;
    error: string | null;
    clearError: () => void;
}

export const useSnsLoginStore = create<SnsLoginStore>((set) => ({
    snsLogin: async (provider: SnsProvider) => {
        set({ isLoading: true, error: null });
        useAuthStore.getState().setLoading(true);
        
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            });
            
            if (error) throw error;
            
            // 성공 시 상태는 useAuthStore에서 자동으로 업데이트됨
            set({ isLoading: false });
        } catch (error) {
            const errorMessage = (error as Error).message;
            set({ error: errorMessage, isLoading: false });
            useAuthStore.getState().setError(errorMessage);
            useAuthStore.getState().setLoading(false);
        }
    },
    
    snsLogout: async () => {
        set({ isLoading: true });
        useAuthStore.getState().setLoading(true);
        
        try {
            await supabase.auth.signOut();
            set({ isLoading: false });
            // 로그아웃 상태는 useAuthStore에서 자동으로 업데이트됨
        } catch (error) {
            const errorMessage = (error as Error).message;
            set({ error: errorMessage, isLoading: false });
            useAuthStore.getState().setError(errorMessage);
            useAuthStore.getState().setLoading(false);
        }
    },
    
    isLoading: false,
    error: null,
    clearError: () => set({ error: null }),
}));