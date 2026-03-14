import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface AuthStore {
  user: User | null;
  isAdmin: boolean;
  isAnonymous: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  checkAdminStatus: (userId: string) => Promise<void>;
  signInAnonymously: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAdmin: false,
  isAnonymous: false,
  loading: true,
  setUser: (user) => {
    const isAdmin = !!user && user.app_metadata?.role === 'admin';
    const isAnonymous = !!user?.is_anonymous;

    set({ user, isAdmin, isAnonymous, loading: false });

    if (user && !isAdmin && !isAnonymous) {
      get().checkAdminStatus(user.id);
    }
  },
  setLoading: (loading) => set({ loading }),
  
  /**
   * DB의 profiles 테이블을 조회하여 최신 권한 정보를 가져옵니다.
   */
  checkAdminStatus: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        set({ isAdmin: data.role === 'admin' });
      }
    } catch (err) {
      console.warn('Failed to check admin status or profile not found:', err);
    }
  },

  /**
   * 익명 로그인 (세션 없을 때 자동 호출)
   */
  signInAnonymously: async () => {
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (!error && data.user) {
        set({ user: data.user, isAnonymous: true, isAdmin: false, loading: false });
      }
    } catch (err) {
      console.warn('Anonymous sign-in failed:', err);
      set({ loading: false });
    }
  },

  /**
   * 로그아웃 처리
   */
  signOut: async () => {
    set({ loading: true });
    try {
      await supabase.auth.signOut();
      set({ user: null, isAdmin: false, loading: false });
    } catch (err) {
      console.error('Logout error:', err);
      set({ loading: false });
    }
  }
}));
