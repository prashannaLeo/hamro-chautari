const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  supabasePostId: {
    type: String,
    required: true,
    unique: true
  },
  content: String,
  mediaUrls: [String],
  postType: {
    type: String,
    enum: ['text', 'image', 'video', 'poll'],
    default: 'text'
  },
  visibility: {
    type: String,
    enum: ['public', 'friends', 'private'],
    default: 'public'
  },
  location: String,
  moodTag: String,
  tags: [String],
  mentions: [String],
  likes: [{
    userId: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    userId: String,
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  shares: [{
    userId: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  isPromoted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ location: 1 });

module.exports = mongoose.model('Post', postSchema);