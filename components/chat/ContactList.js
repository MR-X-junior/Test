import { useState } from 'react';
import { FaSearch, FaPlus, FaUsers, FaUserFriends } from 'react-icons/fa';

const ContactList = ({ 
  directChats, 
  groupChats, 
  activeChat, 
  onSelectChat, 
  onNewChat, 
  onNewGroup,
  user
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('direct'); // 'direct' or 'group'
  
  // Filter chats based on search term
  const filteredDirectChats = directChats.filter(chat => {
    const otherParticipant = chat.participants.find(p => p._id !== user?._id);
    return otherParticipant?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  const filteredGroupChats = groupChats.filter(chat => 
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Format last message time
  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    
    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this week, show day name
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Otherwise show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };
  
  // Get last message preview
  const getLastMessagePreview = (chat) => {
    if (!chat.messages || chat.messages.length === 0) {
      return 'No messages yet';
    }
    
    const lastMessage = chat.messages[chat.messages.length - 1];
    
    if (lastMessage.attachments && lastMessage.attachments.length > 0) {
      return '📎 Attachment';
    }
    
    return lastMessage.content.length > 30
      ? `${lastMessage.content.substring(0, 30)}...`
      : lastMessage.content;
  };
  
  // Get chat name for direct chats
  const getDirectChatName = (chat) => {
    const otherParticipant = chat.participants.find(p => p._id !== user?._id);
    return otherParticipant?.name || 'Unknown User';
  };
  
  // Get chat image
  const getChatImage = (chat) => {
    if (activeTab === 'group') {
      return chat.groupImage || 'https://via.placeholder.com/40';
    } else {
      const otherParticipant = chat.participants.find(p => p._id !== user?._id);
      return otherParticipant?.profilePicture || 'https://via.placeholder.com/40';
    }
  };
  
  // Check if chat has unread messages
  const hasUnreadMessages = (chat) => {
    if (!chat.messages || chat.messages.length === 0) {
      return false;
    }
    
    return chat.messages.some(msg => 
      msg.sender._id !== user?._id && 
      !msg.readBy.some(read => read.user === user?._id)
    );
  };
  
  // Count unread messages
  const countUnreadMessages = (chat) => {
    if (!chat.messages) return 0;
    
    return chat.messages.filter(msg => 
      msg.sender._id !== user?._id && 
      !msg.readBy.some(read => read.user === user?._id)
    ).length;
  };
  
  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-4">Messages</h2>
        
        {/* Search */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
        
        {/* Tabs */}
        <div className="flex mt-4">
          <button 
            className={`flex-1 py-2 text-center ${
              activeTab === 'direct' 
                ? 'text-blue-500 border-b-2 border-blue-500 font-semibold' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('direct')}
          >
            <FaUserFriends className="inline mr-2" />
            Direct
          </button>
          <button 
            className={`flex-1 py-2 text-center ${
              activeTab === 'group' 
                ? 'text-blue-500 border-b-2 border-blue-500 font-semibold' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('group')}
          >
            <FaUsers className="inline mr-2" />
            Groups
          </button>
        </div>
      </div>
      
      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'direct' ? (
          <>
            {/* New Chat Button */}
            <button 
              onClick={onNewChat}
              className="flex items-center w-full p-4 hover:bg-gray-50 border-b"
            >
              <div className="rounded-full bg-blue-100 p-2 mr-3">
                <FaPlus className="text-blue-500" />
              </div>
              <span className="font-medium text-blue-500">New Conversation</span>
            </button>
            
            {/* Direct Chats */}
            {filteredDirectChats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No chats found' : 'No conversations yet'}
              </div>
            ) : (
              filteredDirectChats.map(chat => (
                <div 
                  key={chat._id} 
                  className={`flex items-center p-4 border-b cursor-pointer ${
                    activeChat?._id === chat._id ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onSelectChat(chat)}
                >
                  <div className="relative">
                    <img 
                      src={getChatImage(chat)} 
                      alt={getDirectChatName(chat)} 
                      className="w-12 h-12 rounded-full mr-3"
                    />
                    {/* Online indicator would go here */}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <h3 className="font-semibold truncate">{getDirectChatName(chat)}</h3>
                      <span className="text-xs text-gray-500">
                        {formatLastMessageTime(chat.lastMessage)}
                      </span>
                    </div>
                    
                    <p className={`text-sm truncate ${
                      hasUnreadMessages(chat) ? 'font-semibold text-gray-900' : 'text-gray-500'
                    }`}>
                      {getLastMessagePreview(chat)}
                    </p>
                  </div>
                  
                  {hasUnreadMessages(chat) && (
                    <div className="ml-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {countUnreadMessages(chat)}
                    </div>
                  )}
                </div>
              ))
            )}
          </>
        ) : (
          <>
            {/* New Group Button */}
            <button 
              onClick={onNewGroup}
              className="flex items-center w-full p-4 hover:bg-gray-50 border-b"
            >
              <div className="rounded-full bg-blue-100 p-2 mr-3">
                <FaPlus className="text-blue-500" />
              </div>
              <span className="font-medium text-blue-500">New Group</span>
            </button>
            
            {/* Group Chats */}
            {filteredGroupChats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No groups found' : 'No group chats yet'}
              </div>
            ) : (
              filteredGroupChats.map(chat => (
                <div 
                  key={chat._id} 
                  className={`flex items-center p-4 border-b cursor-pointer ${
                    activeChat?._id === chat._id ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onSelectChat(chat)}
                >
                  <img 
                    src={getChatImage(chat)} 
                    alt={chat.name} 
                    className="w-12 h-12 rounded-full mr-3"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <h3 className="font-semibold truncate">{chat.name}</h3>
                      <span className="text-xs text-gray-500">
                        {formatLastMessageTime(chat.lastMessage)}
                      </span>
                    </div>
                    
                    <p className={`text-sm truncate ${
                      hasUnreadMessages(chat) ? 'font-semibold text-gray-900' : 'text-gray-500'
                    }`}>
                      {chat.messages && chat.messages.length > 0 && (
                        <span className="font-semibold mr-1">
                          {chat.messages[chat.messages.length - 1].sender.name.split(' ')[0]}:
                        </span>
                      )}
                      {getLastMessagePreview(chat)}
                    </p>
                  </div>
                  
                  {hasUnreadMessages(chat) && (
                    <div className="ml-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {countUnreadMessages(chat)}
                    </div>
                  )}
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ContactList;

