import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import DashboardLayout from '../../components/dashboard/Layout';
import ContactList from '../../components/chat/ContactList';
import ChatWindow from '../../components/chat/ChatWindow';
import { FaUsers, FaTimes } from 'react-icons/fa';

export default function ChatPage() {
  const [user, setUser] = useState(null);
  const [directChats, setDirectChats] = useState([]);
  const [groupChats, setGroupChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  
  // Initialize socket connection
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const userResponse = await axios.get('/api/auth/me');
        setUser(userResponse.data.user);
        
        // Get direct chats
        const directChatsResponse = await axios.get('/api/chat/direct');
        setDirectChats(directChatsResponse.data.chats || []);
        
        // Get group chats
        const groupChatsResponse = await axios.get('/api/chat/group');
        setGroupChats(groupChatsResponse.data.chats || []);
        
        // Initialize socket
        const token = localStorage.getItem('token');
        const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || '', {
          auth: { token }
        });
        
        setSocket(socketInstance);
        
        // Socket event listeners
        socketInstance.on('connect', () => {
          console.log('Socket connected');
        });
        
        socketInstance.on('direct-message', handleNewMessage);
        socketInstance.on('group-message', handleNewMessage);
        socketInstance.on('user-typing', handleUserTyping);
        socketInstance.on('message-read', handleMessageRead);
        
        // Clean up on unmount
        return () => {
          socketInstance.disconnect();
        };
      } catch (error) {
        console.error('Error fetching chat data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Join chat room when active chat changes
  useEffect(() => {
    if (!socket || !activeChat) return;
    
    if (activeChat.participants) {
      // Direct chat
      socket.emit('join-direct-chat', activeChat._id);
    } else {
      // Group chat
      socket.emit('join-group-chat', activeChat._id);
    }
    
    // Mark messages as read
    socket.emit('mark-read', {
      chatId: activeChat._id,
      isGroupChat: !activeChat.participants
    });
  }, [socket, activeChat]);
  
  // Handle new message
  const handleNewMessage = (data) => {
    const { chatId, message } = data;
    
    // Update direct chats
    setDirectChats(prevChats => 
      prevChats.map(chat => {
        if (chat._id === chatId) {
          return {
            ...chat,
            messages: [...chat.messages, message],
            lastMessage: new Date()
          };
        }
        return chat;
      })
    );
    
    // Update group chats
    setGroupChats(prevChats => 
      prevChats.map(chat => {
        if (chat._id === chatId) {
          return {
            ...chat,
            messages: [...chat.messages, message],
            lastMessage: new Date()
          };
        }
        return chat;
      })
    );
    
    // Update active chat
    if (activeChat && activeChat._id === chatId) {
      setActiveChat(prevChat => ({
        ...prevChat,
        messages: [...prevChat.messages, message],
        lastMessage: new Date()
      }));
      
      // Mark message as read
      socket.emit('mark-read', {
        chatId,
        messageId: message._id,
        isGroupChat: !activeChat.participants
      });
    }
  };
  
  // Handle user typing
  const handleUserTyping = (data) => {
    // Implement typing indicator logic
    console.log('User typing:', data);
  };
  
  // Handle message read
  const handleMessageRead = (data) => {
    // Update read status for messages
    console.log('Message read:', data);
  };
  
  // Send message
  const handleSendMessage = (content) => {
    if (!socket || !activeChat || !content.trim()) return;
    
    if (activeChat.participants) {
      // Direct chat
      socket.emit('send-direct-message', {
        chatId: activeChat._id,
        content,
        attachments: []
      });
    } else {
      // Group chat
      socket.emit('send-group-message', {
        chatId: activeChat._id,
        content,
        attachments: []
      });
    }
  };
  
  // Select chat
  const handleSelectChat = (chat) => {
    setActiveChat(chat);
  };
  
  // Open new chat modal
  const handleNewChat = () => {
    setShowNewChatModal(true);
    setSearchTerm('');
    setSearchResults([]);
  };
  
  // Open new group modal
  const handleNewGroup = () => {
    setShowNewGroupModal(true);
    setSearchTerm('');
    setSearchResults([]);
    setSelectedUsers([]);
    setGroupName('');
  };
  
  // Search users
  const handleSearchUsers = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      const response = await axios.get(`/api/users/search?query=${searchTerm}`);
      setSearchResults(response.data.users || []);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };
  
  // Create direct chat
  const handleCreateDirectChat = async (userId) => {
    try {
      const response = await axios.post('/api/chat/direct', {
        recipientId: userId
      });
      
      const newChat = response.data.chat;
      
      // Add to direct chats if not already present
      if (!directChats.some(chat => chat._id === newChat._id)) {
        setDirectChats([...directChats, newChat]);
      }
      
      // Set as active chat
      setActiveChat(newChat);
      
      // Close modal
      setShowNewChatModal(false);
    } catch (error) {
      console.error('Error creating direct chat:', error);
    }
  };
  
  // Create group chat
  const handleCreateGroupChat = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) return;
    
    try {
      const response = await axios.post('/api/chat/group', {
        name: groupName,
        participantIds: selectedUsers.map(user => user._id)
      });
      
      const newChat = response.data.chat;
      
      // Add to group chats
      setGroupChats([...groupChats, newChat]);
      
      // Set as active chat
      setActiveChat(newChat);
      
      // Close modal
      setShowNewGroupModal(false);
    } catch (error) {
      console.error('Error creating group chat:', error);
    }
  };
  
  // Toggle user selection for group chat
  const toggleUserSelection = (user) => {
    if (selectedUsers.some(u => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter(u => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };
  
  return (
    <DashboardLayout title="Chat">
      <div className="h-[calc(100vh-10rem)] flex">
        {/* Contact List */}
        <div className="w-1/3 mr-4">
          <ContactList 
            directChats={directChats}
            groupChats={groupChats}
            activeChat={activeChat}
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
            onNewGroup={handleNewGroup}
            user={user}
          />
        </div>
        
        {/* Chat Window */}
        <div className="flex-1">
          <ChatWindow 
            chat={activeChat}
            user={user}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
      
      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">New Conversation</h3>
              <button 
                onClick={() => setShowNewChatModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="mb-4">
              <div className="flex">
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 border rounded-l py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  onClick={handleSearchUsers}
                  className="bg-blue-500 text-white px-4 rounded-r hover:bg-blue-600"
                >
                  Search
                </button>
              </div>
            </div>
            
            <div className="max-h-60 overflow-y-auto">
              {searchResults.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  {searchTerm ? 'No users found' : 'Search for users to start a conversation'}
                </p>
              ) : (
                searchResults.map(user => (
                  <div 
                    key={user._id} 
                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer rounded-md"
                    onClick={() => handleCreateDirectChat(user._id)}
                  >
                    <img 
                      src={user.profilePicture || 'https://via.placeholder.com/40'} 
                      alt={user.name} 
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* New Group Modal */}
      {showNewGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New Group</h3>
              <button 
                onClick={() => setShowNewGroupModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Group Name
              </label>
              <input 
                type="text" 
                placeholder="Enter group name" 
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full border rounded py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Add Participants
              </label>
              <div className="flex">
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 border rounded-l py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  onClick={handleSearchUsers}
                  className="bg-blue-500 text-white px-4 rounded-r hover:bg-blue-600"
                >
                  Search
                </button>
              </div>
            </div>
            
            {selectedUsers.length > 0 && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Selected Users ({selectedUsers.length})
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map(user => (
                    <div 
                      key={user._id} 
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
                    >
                      <span>{user.name}</span>
                      <button 
                        onClick={() => toggleUserSelection(user)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="max-h-40 overflow-y-auto mb-4">
              {searchResults.length === 0 ? (
                <p className="text-center text-gray-500 py-2">
                  {searchTerm ? 'No users found' : 'Search for users to add to the group'}
                </p>
              ) : (
                searchResults.map(user => (
                  <div 
                    key={user._id} 
                    className={`flex items-center p-2 hover:bg-gray-50 cursor-pointer rounded-md ${
                      selectedUsers.some(u => u._id === user._id) ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => toggleUserSelection(user)}
                  >
                    <img 
                      src={user.profilePicture || 'https://via.placeholder.com/40'} 
                      alt={user.name} 
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={() => setShowNewGroupModal(false)}
                className="mr-2 px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateGroupChat}
                className={`px-4 py-2 rounded text-white ${
                  groupName.trim() && selectedUsers.length > 0
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
                disabled={!groupName.trim() || selectedUsers.length === 0}
              >
                <FaUsers className="inline mr-2" />
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

