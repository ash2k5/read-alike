
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xxipopmbsndchrlhozdw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4aXBvcG1ic25kY2hybGhvemR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MzEzODcsImV4cCI6MjA2MDUwNzM4N30.SnSIqJ8ct8fvlLkpubTt6qs7v-fEdmCHu7b8-s8tiYE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
