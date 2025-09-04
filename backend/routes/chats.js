const express = require('express');
const Message = require('../models/Message');
const router = express.Router();

// Get chat messages with pagination
router.get('/:chatId/messages', async (req, res) => {
  try {
    const { chatId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ chatId })
      .populate('replyTo', 'content senderId createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ messages: messages.reverse() }); // Reverse to show chronological order
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send a message
router.post('/:chatId/messages', async (req, res) => {
  try {
    const { chatId } = req.params;
    const messageData = {
      ...req.body,
      chatId,
      supabaseMessageId: req.body.id // Assuming the ID comes from Supabase
    };

    const message = new Message(messageData);
    await message.save();

    // Populate reply if exists
    if (message.replyTo) {
      await message.populate('replyTo', 'content senderId createdAt');
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Mark message as read
router.patch('/:chatId/messages/:messageId/read', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if already read by this user
    const alreadyRead = message.readBy.find(read => read.userId === userId);
    if (!alreadyRead) {
      message.readBy.push({ userId });
      await message.save();
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add reaction to message
router.post('/:chatId/messages/:messageId/react', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId, emoji } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Remove existing reaction from this user
    message.reactions = message.reactions.filter(reaction => reaction.userId !== userId);
    
    // Add new reaction
    if (emoji) {
      message.reactions.push({ userId, emoji });
    }

    await message.save();
    res.json({ reactions: message.reactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search messages in a chat
router.get('/:chatId/search', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { q } = req.query;

    const messages = await Message.find({
      chatId,
      content: new RegExp(q, 'i')
    }).sort({ createdAt: -1 }).limit(20);

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;