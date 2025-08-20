import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = ({ children, title }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          router.push('/auth/login');
          return;
        }
        
        // Set default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        const response = await axios.get('/api/auth/me');
        setUser(response.data.user);
      } catch (error) {
        console.error('Error fetching user:', error);
        localStorage.removeItem('token');
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [router]);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block`}>
        <Sidebar user={user} />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

