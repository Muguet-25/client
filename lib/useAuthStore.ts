import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/utils/config';

type AuthStore = {
    isLoggedIn: boolean;
    user: User | null;
    isLoading: boolean;
    error: string | null;

    setAuthState: (isLoggedIn: boolean, user: User | null) => void;
    setError: (error: string | null) => void;
    setLoading: (isLoading: boolean) => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    isLoggedIn: false,
    user: null,
    isLoading: false,
    error: null,

    setAuthState: (isLoggedIn, user) => set({isLoggedIn, user}),
    setError: (error) => set({error}),
    setLoading: (isLoading) => set({isLoading}),
    clearError: () => set({error: null}),
}));

supabase.auth.onAuthStateChange((event, session) => {
    console.log('auth state changed', event, session?.user?.email);

    if (event === "SIGNED_IN" && session?.user) {
        useAuthStore.getState().setAuthState(true, session.user);
        useAuthStore.getState().setLoading(false);
    } else if (event === "SIGNED_OUT") {
        useAuthStore.getState().setAuthState(false, null);
        useAuthStore.getState().setLoading(false);
    } else if (event === "TOKEN_REFRESHED") {
        useAuthStore.getState().setAuthState(true, session?.user || null);
    }
});