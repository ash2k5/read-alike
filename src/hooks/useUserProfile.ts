
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types/supabase';
import { useSupabaseAuth } from './useSupabaseAuth';
import { toast } from '@/components/ui/sonner';

export function useUserProfile() {
  const { user } = useSupabaseAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error loading profile:', error);
          return;
        }

        setProfile(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        toast.error('Failed to update profile');
        return { error };
      }

      setProfile(data);
      toast.success('Profile updated successfully');
      return { data };
    } catch (error) {
      console.error('Error:', error);
      toast.error('An unexpected error occurred');
      return { error };
    }
  };

  return {
    profile,
    loading,
    updateProfile
  };
}
