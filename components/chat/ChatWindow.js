import { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaImage, FaSmile, FaEllipsisV } from 'react-icons/fa';

const ChatWindow = ({ chat, user, onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (message.trim() === '') return;
    
    onSendMessage(message);
    setMessage('');
  };
  
  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    // Simulate typing indicator
    if (!isTyping && e.target.value.trim() !== '') {
      setIsTyping(true);
      // In a real app, you would emit a socket event here
    } else if (isTyping && e.target.value.trim() === '') {
      setIsTyping(false);
      // In a real app, you would emit a socket event here
    }
  };
  
  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Check if message is from current user
  const isCurrentUser = (senderId) => {
    return senderId === user?._id;
  };
  
  // Group messages by date
  const groupMessagesByDate = (messages) => {
    if (!messages || messages.length === 0) return [];
    
    const groups = [];
    let currentDate = null;
    let currentGroup = [];
    
    messages.forEach(message => {
      const messageDate = new Date(message.createdAt);
      const dateString = messageDate.toLocaleDateString();
      
      if (dateString !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({
            date: currentDate,
            messages: currentGroup
          });
        }
        
        currentDate = dateString;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });
    
    if (currentGroup.length > 0) {
      groups.push({
        date: currentDate,
        messages: currentGroup
      });
    }
    
    return groups;
  };
  
  // Get chat title
  const getChatTitle = () => {
    if (!chat) return '';
    
    if (chat.name) {
      // Group chat
      return chat.name;
    } else if (chat.participants) {
      // Direct chat
      const otherParticipant = chat.participants.find(p => p._id !== user?._id);
      return otherParticipant?.name || '';
    }
    
    return '';
  };
  
  // Get chat image
  const getChatImage = () => {
    if (!chat) return 'https://via.placeholder.com/40';
    
    if (chat.groupImage) {
      // Group chat
      return chat.groupImage;
    } else if (chat.participants) {
      // Direct chat
      const otherParticipant = chat.participants.find(p => p._id !== user?._id);
      return otherParticipant?.profilePicture || 'https://via.placeholder.com/40';
    }
    
    return 'https://via.placeholder.com/40';
  };
  
  const messageGroups = groupMessagesByDate(chat?.messages || []);
  
  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <img 
            src={getChatImage()} 
            alt={getChatTitle()} 
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <h3 className="font-semibold">{getChatTitle()}</h3>
            {chat?.participants && chat.participants.length > 2 && (
              <p className="text-xs text-gray-500">
                {chat.participants.length} participants
              </p>
            )}
          </div>
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          <FaEllipsisV />
        </button>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {!chat && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Select a chat to start messaging</p>
          </div>
        )}
        
        {chat && messageGroups.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No messages yet</p>
          </div>
        )}
        
        {messageGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            <div className="flex justify-center my-4">
              <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                {group.date}
              </span>
            </div>
            
            {group.messages.map((msg, msgIndex) => {
              const isSender = isCurrentUser(msg.sender._id);
              
              return (
                <div 
                  key={msgIndex} 
                  className={`flex mb-4 ${isSender ? 'justify-end' : 'justify-start'}`}
                >
                  {!isSender && (
                    <img 
                      src={msg.sender.profilePicture || 'https://via.placeholder.com/40'} 
                      alt={msg.sender.name} 
                      className="w-8 h-8 rounded-full mr-2 self-end"
                    />
                  )}
                  
                  <div 
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isSender 
                        ? 'bg-blue-500 text-white rounded-br-none' 
                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    {!isSender && (
                      <p className="text-xs font-semibold mb-1">{msg.sender.name}</p>
                    )}
                    
                    <p>{msg.content}</p>
                    
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2">
                        {msg.attachments.map((attachment, index) => (
                          <img 
                            key={index} 
                            src={attachment} 
                            alt="Attachment" 
                            className="max-w-full rounded-md mt-1"
                          />
                        ))}
                      </div>
                    )}
                    
                    <p className={`text-xs mt-1 ${isSender ? 'text-blue-100' : 'text-gray-500'}`}>
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat Input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <button 
            type="button" 
            className="text-gray-500 hover:text-gray-700 mr-2"
            title="Attach image"
          >
            <FaImage />
          </button>
          
          <button 
            type="button" 
            className="text-gray-500 hover:text-gray-700 mr-2"
            title="Insert emoji"
          >
            <FaSmile />
          </button>
          
          <input 
            type="text" 
            value={message} 
            onChange={handleTyping}
            placeholder="Type a message..." 
            className="flex-1 border rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <button 
            type="submit" 
            className={`ml-2 rounded-full p-2 ${
              message.trim() === '' 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            disabled={message.trim() === ''}
          >
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;

