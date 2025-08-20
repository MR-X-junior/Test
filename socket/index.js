const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const { DirectChat, GroupChat } = require('../models/Chat');

// Initialize Socket.io
const initializeSocket = (server) => {
  const io = require('socket.io')(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });
  
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      if (!user.isApproved) {
        return next(new Error('Authentication error: Account not approved'));
      }
      
      if (user.isBlocked) {
        return next(new Error('Authentication error: Account blocked'));
      }
      
      // Attach user to socket
      socket.user = user;
      
      // Update last active
      user.lastActive = new Date();
      await user.save();
      
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });
  
  // Handle connections
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.user._id})`);
    
    // Join user's own room for direct messages
    socket.join(`user:${socket.user._id}`);
    
    // Join class room if user belongs to a class
    if (socket.user.class) {
      socket.join(`class:${socket.user.class}`);
    }
    
    // Handle joining chat rooms
    socket.on('join-direct-chat', async (chatId) => {
      try {
        const chat = await DirectChat.findById(chatId);
        
        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }
        
        // Check if user is a participant
        if (!chat.isParticipant(socket.user._id)) {
          socket.emit('error', { message: 'You are not a participant in this chat' });
          return;
        }
        
        socket.join(`chat:${chatId}`);
        console.log(`${socket.user.name} joined direct chat ${chatId}`);
      } catch (error) {
        console.error('Join direct chat error:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });
    
    socket.on('join-group-chat', async (chatId) => {
      try {
        const chat = await GroupChat.findById(chatId);
        
        if (!chat) {
          socket.emit('error', { message: 'Group chat not found' });
          return;
        }
        
        // Check if user is a participant
        if (!chat.isParticipant(socket.user._id)) {
          socket.emit('error', { message: 'You are not a participant in this group chat' });
          return;
        }
        
        socket.join(`group:${chatId}`);
        console.log(`${socket.user.name} joined group chat ${chatId}`);
      } catch (error) {
        console.error('Join group chat error:', error);
        socket.emit('error', { message: 'Failed to join group chat' });
      }
    });
    
    // Handle direct message
    socket.on('send-direct-message', async (data) => {
      try {
        const { chatId, content, attachments } = data;
        
        const chat = await DirectChat.findById(chatId);
        
        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }
        
        // Check if user is a participant
        if (!chat.isParticipant(socket.user._id)) {
          socket.emit('error', { message: 'You are not a participant in this chat' });
          return;
        }
        
        // Create message
        const message = {
          sender: socket.user._id,
          content,
          attachments: attachments || [],
          readBy: [{ user: socket.user._id }],
          createdAt: new Date()
        };
        
        // Add message to chat
        chat.messages.push(message);
        chat.lastMessage = new Date();
        
        await chat.save();
        
        // Populate sender info
        const populatedChat = await DirectChat.findById(chatId)
          .populate('messages.sender', 'name email profilePicture');
        
        const newMessage = populatedChat.messages[populatedChat.messages.length - 1];
        
        // Emit message to all participants
        chat.participants.forEach(participantId => {
          io.to(`user:${participantId}`).emit('direct-message', {
            chatId,
            message: newMessage
          });
        });
      } catch (error) {
        console.error('Send direct message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
    
    // Handle group message
    socket.on('send-group-message', async (data) => {
      try {
        const { chatId, content, attachments } = data;
        
        const chat = await GroupChat.findById(chatId);
        
        if (!chat) {
          socket.emit('error', { message: 'Group chat not found' });
          return;
        }
        
        // Check if user is a participant
        if (!chat.isParticipant(socket.user._id)) {
          socket.emit('error', { message: 'You are not a participant in this group chat' });
          return;
        }
        
        // Create message
        const message = {
          sender: socket.user._id,
          content,
          attachments: attachments || [],
          readBy: [{ user: socket.user._id }],
          createdAt: new Date()
        };
        
        // Add message to chat
        chat.messages.push(message);
        chat.lastMessage = new Date();
        
        await chat.save();
        
        // Populate sender info
        const populatedChat = await GroupChat.findById(chatId)
          .populate('messages.sender', 'name email profilePicture');
        
        const newMessage = populatedChat.messages[populatedChat.messages.length - 1];
        
        // Emit message to group
        io.to(`group:${chatId}`).emit('group-message', {
          chatId,
          message: newMessage
        });
      } catch (error) {
        console.error('Send group message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
    
    // Handle typing indicator
    socket.on('typing', (data) => {
      const { chatId, isTyping, isGroupChat } = data;
      
      const room = isGroupChat ? `group:${chatId}` : `chat:${chatId}`;
      
      // Emit to all users in the chat except the sender
      socket.to(room).emit('user-typing', {
        chatId,
        userId: socket.user._id,
        userName: socket.user.name,
        isTyping
      });
    });
    
    // Handle read receipts
    socket.on('mark-read', async (data) => {
      try {
        const { chatId, messageId, isGroupChat } = data;
        
        const ChatModel = isGroupChat ? GroupChat : DirectChat;
        
        const chat = await ChatModel.findById(chatId);
        
        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }
        
        // Check if user is a participant
        if (!chat.isParticipant(socket.user._id)) {
          socket.emit('error', { message: 'You are not a participant in this chat' });
          return;
        }
        
        let updated = false;
        
        if (messageId) {
          // Mark specific message as read
          const message = chat.messages.id(messageId);
          
          if (message && !message.readBy.some(read => read.user.toString() === socket.user._id.toString())) {
            message.readBy.push({
              user: socket.user._id,
              readAt: new Date()
            });
            
            updated = true;
          }
        } else {
          // Mark all messages as read
          chat.messages.forEach(message => {
            if (message.sender.toString() !== socket.user._id.toString() && 
                !message.readBy.some(read => read.user.toString() === socket.user._id.toString())) {
              message.readBy.push({
                user: socket.user._id,
                readAt: new Date()
              });
              
              updated = true;
            }
          });
        }
        
        if (updated) {
          await chat.save();
          
          // Emit read receipt to other participants
          const room = isGroupChat ? `group:${chatId}` : `chat:${chatId}`;
          
          socket.to(room).emit('message-read', {
            chatId,
            messageId,
            userId: socket.user._id,
            readAt: new Date()
          });
        }
      } catch (error) {
        console.error('Mark read error:', error);
        socket.emit('error', { message: 'Failed to mark message as read' });
      }
    });
    
    // Handle online status
    socket.on('set-status', (status) => {
      // Emit status to all users who might be interested
      io.emit('user-status', {
        userId: socket.user._id,
        status
      });
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name} (${socket.user._id})`);
      
      // Emit offline status
      io.emit('user-status', {
        userId: socket.user._id,
        status: 'offline'
      });
    });
  });
  
  return io;
};

module.exports = { initializeSocket };

