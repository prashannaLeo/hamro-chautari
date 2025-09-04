-- Insert sample profiles for better testing and mood matching
INSERT INTO public.profiles (user_id, username, display_name, bio, mood, privacy_level) VALUES
  ('00000000-1111-2222-3333-444444444444', 'amit_shrestha', 'Amit Shrestha', 'Adventure seeker from Pokhara. Love trekking in the Himalayas!', 'adventurous', 'public'),
  ('00000000-1111-2222-3333-444444444445', 'rashika_m', 'Rashika Maharjan', 'Nature lover and hiking enthusiast. Always planning the next adventure!', 'adventurous', 'public'),
  ('00000000-1111-2222-3333-444444444446', 'suresh_tamang', 'Suresh Tamang', 'Mountain guide from Langtang. Sharing the beauty of Nepal with the world.', 'adventurous', 'public'),
  ('00000000-1111-2222-3333-444444444447', 'priya_sharma', 'Priya Sharma', 'Photographer and sunrise chaser. Grateful for every beautiful moment.', 'grateful', 'public'),
  ('00000000-1111-2222-3333-444444444448', 'sita_rai', 'Sita Rai', 'Traditional dance teacher preserving Nepali culture for future generations.', 'creative', 'public'),
  ('00000000-1111-2222-3333-444444444449', 'arjun_thapa', 'Arjun Thapa', 'Base camp conqueror and memory maker. Adventure is my middle name!', 'excited', 'public')
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample posts with proper relationships
INSERT INTO public.posts (id, user_id, content, mood_tag, location, visibility, post_type, likes_count, comments_count, shares_count) VALUES
  ('a1b2c3d4-e5f6-7890-1234-567890abcdef', '00000000-1111-2222-3333-444444444447', 'Beautiful sunrise this morning in Kathmandu! The mountains looked absolutely stunning. Feeling grateful for another day in this amazing city. 🏔️☀️ #KathmanduMorning #Nepal', 'grateful', 'Kathmandu, Nepal', 'public', 'text', 24, 5, 2),
  ('b2c3d4e5-f6g7-8901-2345-67890abcdef1', '00000000-1111-2222-3333-444444444449', 'Just finished an amazing trek to Annapurna Base Camp! The journey was challenging but absolutely worth it. Met some incredible people along the way and created memories that will last a lifetime.', 'adventurous', 'Annapurna Base Camp', 'public', 'text', 45, 12, 8),
  ('c3d4e5f6-g7h8-9012-3456-7890abcdef12', '00000000-1111-2222-3333-444444444448', 'Spending the evening learning traditional Nepali dance. Culture is so important to preserve and pass on to the next generation. Anyone else passionate about keeping our traditions alive?', 'creative', NULL, 'public', 'text', 18, 7, 3),
  ('d4e5f6g7-h8i9-0123-4567-890abcdef123', '00000000-1111-2222-3333-444444444444', 'Just completed Poon Hill trek! The sunrise view was absolutely breathtaking. Already planning my next mountain adventure. Who wants to join?', 'adventurous', 'Pokhara, Nepal', 'public', 'text', 32, 8, 4),
  ('e5f6g7h8-i9j0-1234-5678-90abcdef1234', '00000000-1111-2222-3333-444444444445', 'Planning next weekend adventure in the Annapurna region. The weather looks perfect for hiking! Nature always has the best therapy.', 'excited', 'Kathmandu, Nepal', 'public', 'text', 19, 3, 1)
ON CONFLICT (id) DO NOTHING;