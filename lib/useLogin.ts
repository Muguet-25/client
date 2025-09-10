import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/utils/config';
import { z } from 'zod';
import { useAuthStore } from './useAuthStore';

const loginSchema = z.object({
    email: z.string().email('이메일 형식이 올바르지 않습니다.'),
    password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
});

const signupSchema = z.object({
    email: z.string().email('이메일 형식이 올바르지 않습니다.'),
    password: z.string()
                .min(8, '비밀번호는 숫자 및 특수문자가 포함된 8자 이상이어야 합니다.')
                .regex(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]+$/, '비밀번호는 숫자 및 특수문자가 포함된 8자 이상이어야 합니다.'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
});

type LoginStore = {
    emailLogin: (email: string, password: string) => Promise<void>;
    emailSignup: (email: string, password: string, confirmPassword: string) => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    logout: () => Promise<void>;

    validateLogin: (data: { email: string, password: string}) => { success: boolean, errors?: any };
    validateSignup: (data: {email: string, password: string, confirmPassword: string}) => { success: boolean, errors?: any };

    isLoading: boolean;
    error: string | null;
    clearError: () => void;
}

export const useLoginStore = create<LoginStore>((set, get) => ({
    validateLogin: (data) => {
        const result = loginSchema.safeParse(data);
        return {
            success: result.success,
            errors: result.success ? undefined : result.error.flatten().fieldErrors,
        };
    },
    validateSignup: (data) => {
        const result = signupSchema.safeParse(data);
        return {
            success: result.success,
            errors: result.success ? undefined : result.error.flatten().fieldErrors,
        };
    },

    emailLogin: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        useAuthStore.getState().setLoading(true);

        const validation = get().validateLogin({ email, password });
        if(!validation.success) {
            set({error: '입력 정보를 확인해주세요', isLoading: false });
            useAuthStore.getState().setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if(error) throw error;
            
            // 성공 시 상태는 useAuthStore에서 자동으로 업데이트됨
            set({ isLoading: false });
        } catch (error) {
            const errorMessage = (error as Error).message;
            set({error: errorMessage, isLoading: false });
            useAuthStore.getState().setError(errorMessage);
            useAuthStore.getState().setLoading(false);
        }
    },

    emailSignup: async (email: string, password: string, confirmPassword: string) => {
        set({ isLoading: true, error: null });
        useAuthStore.getState().setLoading(true);

        const validation = get().validateSignup({ email, password, confirmPassword });
        if(!validation.success) {
            set({error: '입력 정보를 확인해주세요', isLoading: false });
            useAuthStore.getState().setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email, 
                password, 
                options: { 
                    emailRedirectTo: `${window.location.origin}/auth/callback`
                }
            });
            if(error) throw error;
            
            set({ isLoading: false });
            useAuthStore.getState().setLoading(false);
        } catch (error) {
            const errorMessage = (error as Error).message;
            set({error: errorMessage, isLoading: false });
            useAuthStore.getState().setError(errorMessage);
            useAuthStore.getState().setLoading(false);
        }
    },

    resetPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        useAuthStore.getState().setLoading(true);
        
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, { 
                redirectTo: `${window.location.origin}/auth/reset-password` 
            });
            if(error) throw error;
            
            set({ isLoading: false });
            useAuthStore.getState().setLoading(false);
        } catch (error) {
            const errorMessage = (error as Error).message;
            set({error: errorMessage, isLoading: false });
            useAuthStore.getState().setError(errorMessage);
            useAuthStore.getState().setLoading(false);
        }
    },

    logout: async () => {
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