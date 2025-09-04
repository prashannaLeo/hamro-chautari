const { createClient } = require('@supabase/supabase-js');
const User = require('../models/User');
const Post = require('../models/Post');
const Message = require('../models/Message');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Sync user data from Supabase to MongoDB
async function syncUserFromSupabase(supabaseUser) {
  try {
    // Check if user already exists in MongoDB
    let mongoUser = await User.findOne({ supabaseId: supabaseUser.id });
    
    if (!mongoUser) {
      // Create new user in MongoDB
      mongoUser = new User({
        supabaseId: supabaseUser.id,
        email: supabaseUser.email,
        username: supabaseUser.email.split('@')[0],
        displayName: supabaseUser.user_metadata?.display_name || supabaseUser.email,
        avatarUrl: supabaseUser.user_metadata?.avatar_url,
        lastSeen: new Date()
      });
      
      await mongoUser.save();
      console.log(`✅ Created MongoDB user for Supabase user: ${supabaseUser.id}`);
    } else {
      // Update existing user
      mongoUser.lastSeen = new Date();
      if (supabaseUser.user_metadata?.display_name) {
        mongoUser.displayName = supabaseUser.user_metadata.display_name;
      }
      if (supabaseUser.user_metadata?.avatar_url) {
        mongoUser.avatarUrl = supabaseUser.user_metadata.avatar_url;
      }
      
      await mongoUser.save();
      console.log(`✅ Updated MongoDB user for Supabase user: ${supabaseUser.id}`);
    }
    
    return mongoUser;
  } catch (error) {
    console.error('❌ Error syncing user from Supabase:', error);
    throw error;
  }
}

// Sync post data from Supabase to MongoDB
async function syncPostFromSupabase(supabasePost) {
  try {
    let mongoPost = await Post.findOne({ supabasePostId: supabasePost.id });
    
    if (!mongoPost) {
      mongoPost = new Post({
        supabasePostId: supabasePost.id,
        userId: supabasePost.user_id,
        content: supabasePost.content,
        mediaUrls: supabasePost.media_urls || [],
        postType: supabasePost.post_type || 'text',
        visibility: supabasePost.visibility || 'public',
        location: supabasePost.location,
        moodTag: supabasePost.mood_tag,
        tags: [], // Can be extracted from content or set separately
        mentions: [] // Can be extracted from content
      });
      
      await mongoPost.save();
      console.log(`✅ Created MongoDB post for Supabase post: ${supabasePost.id}`);
    }
    
    return mongoPost;
  } catch (error) {
    console.error('❌ Error syncing post from Supabase:', error);
    throw error;
  }
}

// Sync message data from Supabase to MongoDB
async function syncMessageFromSupabase(supabaseMessage) {
  try {
    let mongoMessage = await Message.findOne({ supabaseMessageId: supabaseMessage.id });
    
    if (!mongoMessage) {
      mongoMessage = new Message({
        supabaseMessageId: supabaseMessage.id,
        chatId: supabaseMessage.chat_id,
        senderId: supabaseMessage.sender_id,
        content: supabaseMessage.content,
        messageType: supabaseMessage.message_type || 'text',
        mediaUrl: supabaseMessage.media_url,
        replyTo: supabaseMessage.reply_to,
        isEncrypted: supabaseMessage.is_encrypted || false
      });
      
      await mongoMessage.save();
      console.log(`✅ Created MongoDB message for Supabase message: ${supabaseMessage.id}`);
    }
    
    return mongoMessage;
  } catch (error) {
    console.error('❌ Error syncing message from Supabase:', error);
    throw error;
  }
}

// Setup real-time listeners for Supabase changes
function setupRealtimeSync() {
  // Listen for new posts
  supabase
    .channel('posts_changes')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'posts' }, 
      (payload) => {
        console.log('📝 New post detected in Supabase');
        syncPostFromSupabase(payload.new);
      }
    )
    .subscribe();

  // Listen for new messages
  supabase
    .channel('messages_changes')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'messages' }, 
      (payload) => {
        console.log('💬 New message detected in Supabase');
        syncMessageFromSupabase(payload.new);
      }
    )
    .subscribe();

  // Listen for profile updates
  supabase
    .channel('profiles_changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'profiles' }, 
      (payload) => {
        console.log('👤 Profile change detected in Supabase');
        // Could sync profile changes to MongoDB user model
      }
    )
    .subscribe();

  console.log('🔄 Real-time sync listeners established');
}

module.exports = {
  syncUserFromSupabase,
  syncPostFromSupabase,
  syncMessageFromSupabase,
  setupRealtimeSync
};