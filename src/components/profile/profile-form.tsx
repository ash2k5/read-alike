
import { useState } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  avatar_url: z.string().url("Must be a valid URL").or(z.string().length(0)).optional()
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const { profile, updateProfile } = useUserProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: profile?.username || '',
      avatar_url: profile?.avatar_url || ''
    },
    values: {
      username: profile?.username || '',
      avatar_url: profile?.avatar_url || ''
    }
  });
  
  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitting(true);
    await updateProfile(data);
    setIsSubmitting(false);
  }
  
  if (!profile) {
    return <div className="text-center p-6">Please sign in to manage your profile</div>;
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Your username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="avatar_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avatar URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/avatar.jpg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Profile
        </Button>
      </form>
    </Form>
  );
}
