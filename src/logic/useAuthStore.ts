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
  setUser: (user) => set({ 
    user, 
    isAdmin: user?.app_metadata?.role === 'admin' || user?.email === 'joymin5655@gmail.com' // 이메일로도 임시 체크
  }),
  setLoading: (loading) => set({ loading }),
}));