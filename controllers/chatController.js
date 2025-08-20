const { DirectChat, GroupChat } = require('../models/Chat');
const { User, ROLES } = require('../models/User');
const Class = require('../models/Class');

// Create or get direct chat
const getOrCreateDirectChat = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const userId = req.user._id;
    
    if (userId.toString() === recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create chat with yourself'
      });
    }
    
    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }
    
    // Check if chat already exists
    let chat = await DirectChat.findOne({
      participants: { $all: [userId, recipientId] }
    }).populate('participants', 'name email profilePicture');
    
    // If chat doesn't exist, create it
    if (!chat) {
      chat = new DirectChat({
        participants: [userId, recipientId]
      });
      
      await chat.save();
      
      // Populate participants after saving
      chat = await DirectChat.findById(chat._id)
        .populate('participants', 'name email profilePicture');
    }
    
    res.status(200).json({
      success: true,
      chat
    });
  } catch (error) {
    console.error('Get or create direct chat error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing chat',
      error: error.message
    });
  }
};

// Get all direct chats for a user
const getUserDirectChats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const chats = await DirectChat.find({
      participants: userId
    })
      .populate('participants', 'name email profilePicture')
      .sort({ lastMessage: -1 });
    
    res.status(200).json({
      success: true,
      count: chats.length,
      chats
    });
  } catch (error) {
    console.error('Get user direct chats error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching chats',
      error: error.message
    });
  }
};

// Send message in direct chat
const sendDirectMessage = async (req, res) => {
  try {
    const { chatId, content, attachments } = req.body;
    const userId = req.user._id;
    
    const chat = await DirectChat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    // Check if user is a participant
    if (!chat.isParticipant(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this chat'
      });
    }
    
    // Create message
    const message = {
      sender: userId,
      content,
      attachments: attachments || [],
      readBy: [{ user: userId }]
    };
    
    // Add message to chat
    chat.messages.push(message);
    chat.lastMessage = new Date();
    
    await chat.save();
    
    // Populate sender info for the new message
    const populatedChat = await DirectChat.findById(chatId)
      .populate('participants', 'name email profilePicture')
      .populate('messages.sender', 'name email profilePicture');
    
    const newMessage = populatedChat.messages[populatedChat.messages.length - 1];
    
    res.status(201).json({
      success: true,
      message: newMessage
    });
  } catch (error) {
    console.error('Send direct message error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while sending message',
      error: error.message
    });
  }
};

// Mark direct messages as read
const markDirectMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;
    
    const chat = await DirectChat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    // Check if user is a participant
    if (!chat.isParticipant(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this chat'
      });
    }
    
    // Mark unread messages as read
    let updated = false;
    
    chat.messages.forEach(message => {
      // Skip messages sent by the user
      if (message.sender.toString() === userId.toString()) return;
      
      // Skip messages already read by the user
      if (message.readBy.some(read => read.user.toString() === userId.toString())) return;
      
      message.readBy.push({
        user: userId,
        readAt: new Date()
      });
      
      updated = true;
    });
    
    if (updated) {
      await chat.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark direct messages as read error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while marking messages as read',
      error: error.message
    });
  }
};

// Create group chat
const createGroupChat = async (req, res) => {
  try {
    const { name, description, participantIds, classId, groupImage } = req.body;
    const userId = req.user._id;
    
    // Validate participants
    if (!Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one participant'
      });
    }
    
    // Check if class exists if provided
    if (classId) {
      const classData = await Class.findById(classId);
      
      if (!classData) {
        return res.status(404).json({
          success: false,
          message: 'Class not found'
        });
      }
    }
    
    // Create participants array with creator as admin
    const participants = [
      {
        user: userId,
        role: 'admin',
        addedBy: userId
      }
    ];
    
    // Add other participants
    for (const participantId of participantIds) {
      // Skip if participant is the creator
      if (participantId === userId.toString()) continue;
      
      // Check if participant exists
      const participant = await User.findById(participantId);
      
      if (!participant) {
        return res.status(404).json({
          success: false,
          message: `Participant with ID ${participantId} not found`
        });
      }
      
      participants.push({
        user: participantId,
        role: 'member',
        addedBy: userId
      });
    }
    
    // Create group chat
    const groupChat = new GroupChat({
      name,
      description,
      participants,
      class: classId,
      groupImage: groupImage || undefined,
      createdBy: userId
    });
    
    await groupChat.save();
    
    // Populate participants
    const populatedChat = await GroupChat.findById(groupChat._id)
      .populate('participants.user', 'name email profilePicture')
      .populate('participants.addedBy', 'name email')
      .populate('createdBy', 'name email');
    
    res.status(201).json({
      success: true,
      message: 'Group chat created successfully',
      chat: populatedChat
    });
  } catch (error) {
    console.error('Create group chat error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while creating group chat',
      error: error.message
    });
  }
};

// Get all group chats for a user
const getUserGroupChats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const chats = await GroupChat.find({
      'participants.user': userId
    })
      .populate('participants.user', 'name email profilePicture')
      .populate('class', 'name grade')
      .sort({ lastMessage: -1 });
    
    res.status(200).json({
      success: true,
      count: chats.length,
      chats
    });
  } catch (error) {
    console.error('Get user group chats error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching group chats',
      error: error.message
    });
  }
};

// Get group chat by ID
const getGroupChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;
    
    const chat = await GroupChat.findById(chatId)
      .populate('participants.user', 'name email profilePicture role')
      .populate('participants.addedBy', 'name email')
      .populate('createdBy', 'name email')
      .populate('class', 'name grade')
      .populate('messages.sender', 'name email profilePicture');
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Group chat not found'
      });
    }
    
    // Check if user is a participant
    if (!chat.isParticipant(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this group chat'
      });
    }
    
    res.status(200).json({
      success: true,
      chat
    });
  } catch (error) {
    console.error('Get group chat by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching group chat',
      error: error.message
    });
  }
};

// Send message in group chat
const sendGroupMessage = async (req, res) => {
  try {
    const { chatId, content, attachments } = req.body;
    const userId = req.user._id;
    
    const chat = await GroupChat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Group chat not found'
      });
    }
    
    // Check if user is a participant
    if (!chat.isParticipant(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this group chat'
      });
    }
    
    // Create message
    const message = {
      sender: userId,
      content,
      attachments: attachments || [],
      readBy: [{ user: userId }]
    };
    
    // Add message to chat
    chat.messages.push(message);
    chat.lastMessage = new Date();
    
    await chat.save();
    
    // Populate sender info for the new message
    const populatedChat = await GroupChat.findById(chatId)
      .populate('messages.sender', 'name email profilePicture');
    
    const newMessage = populatedChat.messages[populatedChat.messages.length - 1];
    
    res.status(201).json({
      success: true,
      message: newMessage
    });
  } catch (error) {
    console.error('Send group message error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while sending message',
      error: error.message
    });
  }
};

// Add participants to group chat
const addGroupParticipants = async (req, res) => {
  try {
    const { chatId, participantIds } = req.body;
    const userId = req.user._id;
    
    // Validate participants
    if (!Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one participant'
      });
    }
    
    const chat = await GroupChat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Group chat not found'
      });
    }
    
    // Check if user is an admin or has permission to add participants
    const user = await User.findById(userId);
    const isAdmin = chat.isAdmin(userId);
    const isClassPresident = user.role === ROLES.CLASS_PRESIDENT;
    const isVicePresident = user.role === ROLES.VICE_PRESIDENT;
    
    if (!isAdmin && !isClassPresident && !isVicePresident) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to add participants'
      });
    }
    
    // If vice president, check if they need approval
    if (isVicePresident) {
      // Logic for vice president approval would go here
      // For now, we'll allow it without approval
    }
    
    // Add participants
    for (const participantId of participantIds) {
      // Skip if participant is already in the chat
      if (chat.isParticipant(participantId)) continue;
      
      // Check if participant exists
      const participant = await User.findById(participantId);
      
      if (!participant) {
        return res.status(404).json({
          success: false,
          message: `Participant with ID ${participantId} not found`
        });
      }
      
      chat.participants.push({
        user: participantId,
        role: 'member',
        addedBy: userId,
        addedAt: new Date()
      });
    }
    
    await chat.save();
    
    // Populate participants
    const populatedChat = await GroupChat.findById(chatId)
      .populate('participants.user', 'name email profilePicture')
      .populate('participants.addedBy', 'name email');
    
    res.status(200).json({
      success: true,
      message: 'Participants added successfully',
      chat: populatedChat
    });
  } catch (error) {
    console.error('Add group participants error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while adding participants',
      error: error.message
    });
  }
};

// Remove participant from group chat
const removeGroupParticipant = async (req, res) => {
  try {
    const { chatId, participantId } = req.body;
    const userId = req.user._id;
    
    const chat = await GroupChat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Group chat not found'
      });
    }
    
    // Check if user is an admin
    if (!chat.isAdmin(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to remove participants'
      });
    }
    
    // Check if participant is in the chat
    if (!chat.isParticipant(participantId)) {
      return res.status(400).json({
        success: false,
        message: 'Participant is not in this group chat'
      });
    }
    
    // Remove participant
    chat.participants = chat.participants.filter(
      participant => participant.user.toString() !== participantId
    );
    
    await chat.save();
    
    res.status(200).json({
      success: true,
      message: 'Participant removed successfully'
    });
  } catch (error) {
    console.error('Remove group participant error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while removing participant',
      error: error.message
    });
  }
};

// Make participant an admin
const makeGroupAdmin = async (req, res) => {
  try {
    const { chatId, participantId } = req.body;
    const userId = req.user._id;
    
    const chat = await GroupChat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Group chat not found'
      });
    }
    
    // Check if user is an admin
    if (!chat.isAdmin(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to manage admins'
      });
    }
    
    // Check if participant is in the chat
    const participantIndex = chat.participants.findIndex(
      participant => participant.user.toString() === participantId
    );
    
    if (participantIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Participant is not in this group chat'
      });
    }
    
    // Make participant an admin
    chat.participants[participantIndex].role = 'admin';
    
    await chat.save();
    
    res.status(200).json({
      success: true,
      message: 'Participant is now an admin'
    });
  } catch (error) {
    console.error('Make group admin error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating participant role',
      error: error.message
    });
  }
};

// Leave group chat
const leaveGroupChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;
    
    const chat = await GroupChat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Group chat not found'
      });
    }
    
    // Check if user is in the chat
    if (!chat.isParticipant(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You are not in this group chat'
      });
    }
    
    // Remove user from participants
    chat.participants = chat.participants.filter(
      participant => participant.user.toString() !== userId.toString()
    );
    
    // If no participants left, delete the chat
    if (chat.participants.length === 0) {
      await GroupChat.findByIdAndDelete(chatId);
      
      return res.status(200).json({
        success: true,
        message: 'You left the group chat and it was deleted'
      });
    }
    
    // If user was the only admin, make the oldest participant an admin
    const hasAdmin = chat.participants.some(participant => participant.role === 'admin');
    
    if (!hasAdmin) {
      // Sort participants by addedAt
      chat.participants.sort((a, b) => a.addedAt - b.addedAt);
      
      // Make the oldest participant an admin
      if (chat.participants.length > 0) {
        chat.participants[0].role = 'admin';
      }
    }
    
    await chat.save();
    
    res.status(200).json({
      success: true,
      message: 'You left the group chat'
    });
  } catch (error) {
    console.error('Leave group chat error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while leaving group chat',
      error: error.message
    });
  }
};

// Update group chat details
const updateGroupChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { name, description, groupImage } = req.body;
    const userId = req.user._id;
    
    const chat = await GroupChat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Group chat not found'
      });
    }
    
    // Check if user is an admin
    if (!chat.isAdmin(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update group details'
      });
    }
    
    // Update fields
    if (name) chat.name = name;
    if (description !== undefined) chat.description = description;
    if (groupImage) chat.groupImage = groupImage;
    
    await chat.save();
    
    res.status(200).json({
      success: true,
      message: 'Group chat updated successfully',
      chat
    });
  } catch (error) {
    console.error('Update group chat error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating group chat',
      error: error.message
    });
  }
};

module.exports = {
  getOrCreateDirectChat,
  getUserDirectChats,
  sendDirectMessage,
  markDirectMessagesAsRead,
  createGroupChat,
  getUserGroupChats,
  getGroupChatById,
  sendGroupMessage,
  addGroupParticipants,
  removeGroupParticipant,
  makeGroupAdmin,
  leaveGroupChat,
  updateGroupChat
};

