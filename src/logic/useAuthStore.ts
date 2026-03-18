import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type PlanType = 'Free' | 'Plus' | 'Pro';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  plan: PlanType;
  role: 'user' | 'admin' | 'ngo';
  updated_at: string;
}

interface AuthStore {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  
  fetchProfile: (userId: string) => Promise<void>;
  fetchUserProfile: (userId: string) => Promise<void>;
  signOut: () => Promise<void>;
  
  isPro: () => boolean;
  isResearch: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),

  fetchUserProfile: async (userId: string) => {
    return get().fetchProfile(userId);
  },

  fetchProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        set({ profile: data as Profile });
      } else {
        console.warn('Profile fetch error:', error?.message);
      }
    } catch (err) {
      console.warn('Failed to fetch user profile:', err);
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      await supabase.auth.signOut();
      set({ user: null, profile: null, loading: false });
    } catch (err) {
      console.error('Logout error:', err);
      set({ loading: false });
    }
  },

  isPro: () => {
    const plan = get().profile?.plan;
    return plan === 'Plus' || plan === 'Pro';
  },

  isResearch: () => get().profile?.plan === 'Pro',

  isAdmin: () => get().profile?.role === 'admin',
}));
