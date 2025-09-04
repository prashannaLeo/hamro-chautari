import { supabase } from '@/integrations/supabase/client';

export const createUserProfile = async (userId: string, email: string) => {
  console.log('Creating user profile for:', userId, email);

  const username = email.split('@')[0];
  const displayName = username.charAt(0).toUpperCase() + username.slice(1);

  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        username: username,
        display_name: displayName,
        bio: 'Welcome to Hamro Chautari!',
        privacy_level: 'public',
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('Error creating user profile:', error);
      return false;
    }

    console.log('User profile created successfully:', data);
    return true;
  } catch (error) {
    console.error('Error in createUserProfile:', error);
    return false;
  }
};