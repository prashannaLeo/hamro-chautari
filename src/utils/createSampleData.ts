import { supabase } from '@/integrations/supabase/client';

export const createSamplePosts = async (userId: string) => {
  console.log('Creating sample posts for user:', userId);

  const samplePosts = [
    {
      id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
      user_id: userId,
      content: 'Beautiful sunrise this morning in Kathmandu! The mountains looked absolutely stunning. Feeling grateful for another day in this amazing city. 🏔️☀️ #KathmanduMorning #Nepal',
      mood_tag: 'grateful',
      location: 'Kathmandu, Nepal',
      visibility: 'public',
      post_type: 'text',
      likes_count: 24,
      comments_count: 5,
      shares_count: 2,
    },
    {
      id: 'b2c3d4e5-f6g7-8901-2345-67890abcdef1',
      user_id: 'other-user-1',
      content: 'Just finished an amazing trek to Annapurna Base Camp! The journey was challenging but absolutely worth it. Met some incredible people along the way and created memories that will last a lifetime.',
      mood_tag: 'adventurous',
      location: 'Annapurna Base Camp',
      visibility: 'public',
      post_type: 'text',
      likes_count: 45,
      comments_count: 12,
      shares_count: 8,
    },
    {
      id: 'c3d4e5f6-g7h8-9012-3456-7890abcdef12',
      user_id: 'other-user-2',
      content: 'Spending the evening learning traditional Nepali dance. Culture is so important to preserve and pass on to the next generation. Anyone else passionate about keeping our traditions alive?',
      mood_tag: 'creative',
      location: null,
      visibility: 'public',
      post_type: 'text',
      likes_count: 18,
      comments_count: 7,
      shares_count: 3,
    }
  ];

  try {
    const { data, error } = await supabase
      .from('posts')
      .upsert(samplePosts, { onConflict: 'id' });

    if (error) {
      console.error('Error creating sample posts:', error);
      return false;
    }

    console.log('Sample posts created successfully:', data);
    return true;
  } catch (error) {
    console.error('Error in createSamplePosts:', error);
    return false;
  }
};

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