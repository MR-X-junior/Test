const mongoose = require('mongoose');

// Schema for individual messages
const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true
  },
  attachments: [{
    type: String, // URL to attachment
    trim: true
  }],
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Schema for direct chats (between two users)
const DirectChatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  messages: [MessageSchema],
  lastMessage: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Schema for group chats
const GroupChatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  messages: [MessageSchema],
  groupImage: {
    type: String,
    default: 'https://res.cloudinary.com/demo/image/upload/v1580125392/samples/people/default-group.jpg'
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastMessage: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Method to check if a user is a participant in a direct chat
DirectChatSchema.methods.isParticipant = function(userId) {
  return this.participants.some(participant => 
    participant.toString() === userId.toString()
  );
};

// Method to check if a user is a participant in a group chat
GroupChatSchema.methods.isParticipant = function(userId) {
  return this.participants.some(participant => 
    participant.user.toString() === userId.toString()
  );
};

// Method to check if a user is an admin in a group chat
GroupChatSchema.methods.isAdmin = function(userId) {
  const participant = this.participants.find(p => 
    p.user.toString() === userId.toString()
  );
  return participant && participant.role === 'admin';
};

// Create and export the models
const DirectChat = mongoose.models.DirectChat || mongoose.model('DirectChat', DirectChatSchema);
const GroupChat = mongoose.models.GroupChat || mongoose.model('GroupChat', GroupChatSchema);

module.exports = {
  DirectChat,
  GroupChat,
  MessageSchema
};

