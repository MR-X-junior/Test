import { useState } from 'react';
import { FaBell, FaEnvelope, FaBars } from 'react-icons/fa';

const Header = ({ title, toggleSidebar }) => {
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowMessages(false);
  };
  
  const toggleMessages = () => {
    setShowMessages(!showMessages);
    setShowNotifications(false);
  };
  
  return (
    <header className="bg-white shadow-md py-4 px-6 flex items-center justify-between">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="mr-4 text-gray-600 lg:hidden"
        >
          <FaBars size={20} />
        </button>
        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <button 
            onClick={toggleNotifications}
            className="text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            <FaBell size={20} />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10 py-2">
              <div className="px-4 py-2 border-b border-gray-200">
                <h3 className="text-sm font-semibold">Notifications</h3>
              </div>
              
              {notifications.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500">
                  No new notifications
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  {notifications.map((notification, index) => (
                    <div 
                      key={index} 
                      className="px-4 py-3 hover:bg-gray-100 border-b border-gray-100"
                    >
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.time).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="px-4 py-2 border-t border-gray-200">
                <button className="text-sm text-blue-500 hover:text-blue-700">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="relative">
          <button 
            onClick={toggleMessages}
            className="text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            <FaEnvelope size={20} />
            {messages.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {messages.length}
              </span>
            )}
          </button>
          
          {showMessages && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10 py-2">
              <div className="px-4 py-2 border-b border-gray-200">
                <h3 className="text-sm font-semibold">Messages</h3>
              </div>
              
              {messages.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500">
                  No new messages
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  {messages.map((message, index) => (
                    <div 
                      key={index} 
                      className="px-4 py-3 hover:bg-gray-100 border-b border-gray-100 flex items-start"
                    >
                      <img 
                        src={message.sender.profilePicture || 'https://via.placeholder.com/40'} 
                        alt={message.sender.name} 
                        className="w-8 h-8 rounded-full mr-3"
                      />
                      <div>
                        <p className="text-sm font-semibold">{message.sender.name}</p>
                        <p className="text-sm truncate">{message.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(message.time).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="px-4 py-2 border-t border-gray-200">
                <button className="text-sm text-blue-500 hover:text-blue-700">
                  View all messages
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

