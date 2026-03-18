import React, { useEffect } from 'react';
import { supabase } from '../logic/supabase';
import { useAuthStore } from '../logic/useAuthStore';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setUser, setProfile, fetchProfile, setInitialized, setLoading } = useAuthStore();

  useEffect(() => {
    // 1. Check current session
    const initSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      setUser(user);
      
      if (user) {
        await fetchProfile(user.id);
      }
      setInitialized(true);
      setLoading(false);
    };

    initSession();

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`🔔 Auth Event: ${event}`);
      const user = session?.user ?? null;
      setUser(user);

      if (event === 'SIGNED_IN' && user) {
        setLoading(true);
        // Sync profile with OAuth data
        const { data: profile, error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata.full_name || user.user_metadata.name,
            avatar_url: user.user_metadata.avatar_url,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();
        
        if (!error && profile) {
          setProfile(profile);
        }
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
      } else if (user) {
        // Handle token refreshes etc.
        await fetchProfile(user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setProfile, fetchProfile, setInitialized, setLoading]);

  return <>{children}</>;
};
