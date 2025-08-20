require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const { initializeSocket } = require('./socket');

// Import routes (to be created)
// const authRoutes = require('./routes/auth');
// const classRoutes = require('./routes/class');
// const chatRoutes = require('./routes/chat');
// const financeRoutes = require('./routes/finance');
// const galleryRoutes = require('./routes/gallery');
// const scheduleRoutes = require('./routes/schedule');

// Create Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = initializeSocket(server);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/class', classRoutes);
// app.use('/api/chat', chatRoutes);
// app.use('/api/finance', financeRoutes);
// app.use('/api/gallery', galleryRoutes);
// app.use('/api/schedule', scheduleRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong',
    error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

