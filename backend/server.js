const express = require('express');
const mongoose = require('mongoose');
const { createClient } = require('@supabase/supabase-js');
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
require('dotenv').config();

// Import routes
const postRoutes = require('./routes/posts');
const chatRoutes = require('./routes/chats');
const aiRoutes = require('./routes/ai');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://your-frontend-domain.vercel.app'] 
      : ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.vercel.app'] 
    : ['http://localhost:3000', 'http://localhost:5173']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enhanced rate limiting with security headers
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Reduced from 100 to 50 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ 
      error: 'Rate limit exceeded', 
      retryAfter: Math.round(req.rateLimit.resetTime / 1000) 
    });
  }
});
app.use('/api', limiter);

// Additional security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/posts', postRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Join chat room
  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat ${chatId}`);
  });
  
  // Handle new messages
  socket.on('send_message', (messageData) => {
    socket.to(messageData.chatId).emit('receive_message', messageData);
  });
  
  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.to(data.chatId).emit('user_typing', data);
  });
  
  socket.on('stop_typing', (data) => {
    socket.to(data.chatId).emit('user_stop_typing', data);
  });
  
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Cleanup expired stories every hour
cron.schedule('0 * * * *', async () => {
  try {
    const { error } = await supabase.rpc('cleanup_expired_stories');
    if (error) throw error;
    console.log('✅ Cleanup expired stories completed');
  } catch (error) {
    console.error('❌ Error cleaning up stories:', error);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});