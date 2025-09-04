const express = require('express');
const Post = require('../models/Post');
const router = express.Router();

// Get all posts with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ visibility: 'public' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ visibility: 'public' });
    
    res.json({
      posts,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get posts by user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ posts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new post
router.post('/', async (req, res) => {
  try {
    const postData = {
      ...req.body,
      supabasePostId: req.body.id, // Assuming the ID comes from Supabase
    };
    
    const post = new Post(postData);
    await post.save();
    
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Like/Unlike a post
router.post('/:postId/like', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const existingLike = post.likes.find(like => like.userId === userId);
    
    if (existingLike) {
      // Unlike
      post.likes = post.likes.filter(like => like.userId !== userId);
    } else {
      // Like
      post.likes.push({ userId });
    }

    await post.save();
    res.json({ liked: !existingLike, likesCount: post.likes.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add comment to post
router.post('/:postId/comment', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, content } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    post.comments.push({ userId, content });
    await post.save();

    res.status(201).json({ 
      comment: post.comments[post.comments.length - 1],
      commentsCount: post.comments.length 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Search posts
router.get('/search', async (req, res) => {
  try {
    const { q, tags, location } = req.query;
    const query = { visibility: 'public' };

    if (q) {
      query.$text = { $search: q };
    }
    
    if (tags) {
      query.tags = { $in: tags.split(',') };
    }
    
    if (location) {
      query.location = new RegExp(location, 'i');
    }

    const posts = await Post.find(query).sort({ createdAt: -1 }).limit(20);
    res.json({ posts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;