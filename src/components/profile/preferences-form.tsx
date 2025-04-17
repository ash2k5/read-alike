
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { GenreSelector } from '@/components/genre-selector';

export function PreferencesForm() {
  const { preferences, toggleTheme, toggleEmailNotifications, updateFavoriteGenres } = useUserPreferences();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(preferences?.favorite_genres || []);
  
  if (!preferences) {
    return <div className="text-center p-6">Please sign in to manage your preferences</div>;
  }
  
  const handleThemeToggle = async () => {
    setIsSubmitting(true);
    await toggleTheme();
    setIsSubmitting(false);
  };
  
  const handleNotificationsToggle = async () => {
    setIsSubmitting(true);
    await toggleEmailNotifications();
    setIsSubmitting(false);
  };
  
  const handleGenresSubmit = async () => {
    setIsSubmitting(true);
    await updateFavoriteGenres(selectedGenres);
    setIsSubmitting(false);
  };
  
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Theme Preference</h3>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="font-medium">Theme</div>
            <div className="text-sm text-muted-foreground">
              Choose between light and dark theme
            </div>
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleThemeToggle}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : preferences.theme === 'dark' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Email Preferences</h3>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="font-medium">Email Notifications</div>
            <div className="text-sm text-muted-foreground">
              Receive emails about new books, recommendations and more
            </div>
          </div>
          <Switch 
            checked={preferences.email_notifications} 
            onCheckedChange={handleNotificationsToggle}
            disabled={isSubmitting}
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Favorite Genres</h3>
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Select your favorite genres to get better recommendations
          </div>
          <GenreSelector 
            selectedGenres={selectedGenres}
            onChange={setSelectedGenres}
          />
          
          <Button 
            onClick={handleGenresSubmit} 
            disabled={isSubmitting}
            className="mt-4"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Genres
          </Button>
        </div>
      </div>
    </div>
  );
}
