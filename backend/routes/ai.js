const express = require('express');
const router = express.Router();

// Mock AI suggestions endpoint
router.get('/suggestions', async (req, res) => {
  try {
    const { type, context } = req.query;
    
    let suggestions = [];
    
    switch (type) {
      case 'post':
        suggestions = [
          "What's on your mind today?",
          "Share a moment from your day",
          "Tell us about something that made you smile",
          "What's your current mood?",
          "Share a photo from your recent adventure"
        ];
        break;
        
      case 'hashtags':
        if (context) {
          // In a real app, this would use AI to analyze content and suggest relevant hashtags
          suggestions = ['#life', '#mood', '#friendship', '#memories', '#today'];
        }
        break;
        
      case 'friends':
        suggestions = [
          "People you may know from your contacts",
          "Friends of friends you might know",
          "People in your area"
        ];
        break;
        
      case 'chat':
        suggestions = [
          "How's your day going?",
          "What are you up to?",
          "Want to catch up?",
          "Hope you're doing well!",
          "Let's plan something fun"
        ];
        break;
        
      default:
        suggestions = ["Sorry, no suggestions available"];
    }
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    res.json({ 
      suggestions: suggestions.slice(0, 3), // Return top 3 suggestions
      type,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Smart reply suggestions for messages
router.post('/smart-reply', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    
    // Mock smart replies based on message content
    let replies = [];
    
    if (message.toLowerCase().includes('how are you')) {
      replies = ["I'm good, thanks!", "Doing well, how about you?", "Great! What's up?"];
    } else if (message.toLowerCase().includes('want to')) {
      replies = ["Sure, sounds good!", "Let me think about it", "Maybe later?"];
    } else if (message.toLowerCase().includes('?')) {
      replies = ["Yes", "No", "I'm not sure"];
    } else {
      replies = ["👍", "Thanks!", "Sounds good"];
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    res.json({ replies });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Content moderation
router.post('/moderate', async (req, res) => {
  try {
    const { content, type } = req.body;
    
    // Mock content moderation
    const flaggedWords = ['spam', 'hate', 'inappropriate'];
    const hasFlaggedContent = flaggedWords.some(word => 
      content.toLowerCase().includes(word)
    );
    
    res.json({
      allowed: !hasFlaggedContent,
      confidence: hasFlaggedContent ? 0.95 : 0.1,
      flags: hasFlaggedContent ? ['inappropriate_content'] : [],
      suggestion: hasFlaggedContent ? 'Please review your content for inappropriate language' : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;