import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';

interface AuthStore {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAdmin: false,
  loading: true,
  setUser: (user) => {
    // 관리자 판단 로직 강화
    const adminEmails = ['joymin5655@gmail.com'];
    const isAdmin = !!user && (
      user.app_metadata?.role === 'admin' || 
      adminEmails.includes(user.email || '')
    );
    
    set({ user, isAdmin, loading: false });
  },
  setLoading: (loading) => set({ loading }),
}));