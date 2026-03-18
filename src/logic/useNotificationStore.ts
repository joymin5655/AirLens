import { create } from 'zustand';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { useAuthStore } from './useAuthStore';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  type: 'info' | 'warning' | 'success' | 'error';
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  subscribeToNotifications: () => void;
  unsubscribeFromNotifications: () => void;
}

let subscription: RealtimeChannel | null = null;

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    const { user } = useAuthStore.getState();
    if (!user || user.is_anonymous) return;

    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        set({
          notifications: data,
          unreadCount: data.filter((n: Notification) => !n.read).length,
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      set({ loading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      // Optimistic update
      set((state) => {
        const updated = state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        );
        return {
          notifications: updated,
          unreadCount: updated.filter((n) => !n.read).length,
        };
      });

      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      // Fallback
      get().fetchNotifications();
    }
  },

  markAllAsRead: async () => {
    const { user } = useAuthStore.getState();
    if (!user || user.is_anonymous) return;

    try {
      set((state) => {
        const updated = state.notifications.map((n) => ({ ...n, read: true }));
        return { notifications: updated, unreadCount: 0 };
      });

      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      get().fetchNotifications();
    }
  },

  subscribeToNotifications: () => {
    const { user } = useAuthStore.getState();
    if (!user || user.is_anonymous) return;

    // Unsubscribe if already subscribed
    get().unsubscribeFromNotifications();

    subscription = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          set((state) => ({
            notifications: [newNotification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
          }));
        }
      )
      .subscribe();
  },

  unsubscribeFromNotifications: () => {
    if (subscription) {
      supabase.removeChannel(subscription);
      subscription = null;
    }
  }
}));
