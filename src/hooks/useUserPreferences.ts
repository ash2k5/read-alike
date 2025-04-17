
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { UserPreferences } from '@/types/supabase';
import { useSupabaseAuth } from './useSupabaseAuth';
import { toast } from '@/components/ui/sonner';

export function useUserPreferences() {
  const { user } = useSupabaseAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPreferences() {
      if (!user) {
        setPreferences(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
          console.error('Error loading preferences:', error);
          return;
        }

        // If no preferences exist, create default preferences
        if (!data) {
          const defaultPreferences: Omit<UserPreferences, 'id' | 'created_at'> = {
            user_id: user.id,
            favorite_genres: [],
            email_notifications: true,
            theme: 'light'
          };

          const { data: newData, error: createError } = await supabase
            .from('user_preferences')
            .insert(defaultPreferences)
            .select()
            .single();

          if (createError) {
            console.error('Error creating default preferences:', createError);
            return;
          }

          setPreferences(newData);
        } else {
          setPreferences(data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPreferences();
  }, [user]);

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user || !preferences) return { error: new Error('Not authenticated or preferences not loaded') };

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('id', preferences.id)
        .select()
        .single();

      if (error) {
        toast.error('Failed to update preferences');
        return { error };
      }

      setPreferences(data);
      toast.success('Preferences updated successfully');
      return { data };
    } catch (error) {
      console.error('Error:', error);
      toast.error('An unexpected error occurred');
      return { error };
    }
  };

  const toggleTheme = async () => {
    if (!preferences) return;
    
    const newTheme = preferences.theme === 'light' ? 'dark' : 'light';
    return updatePreferences({ theme: newTheme });
  };

  const updateFavoriteGenres = async (genres: string[]) => {
    return updatePreferences({ favorite_genres: genres });
  };

  const toggleEmailNotifications = async () => {
    if (!preferences) return;
    
    return updatePreferences({ email_notifications: !preferences.email_notifications });
  };

  return {
    preferences,
    loading,
    updatePreferences,
    toggleTheme,
    updateFavoriteGenres,
    toggleEmailNotifications
  };
}
