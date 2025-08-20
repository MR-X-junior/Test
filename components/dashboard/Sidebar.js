import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  FaHome, FaUsers, FaCalendarAlt, FaMoneyBillWave, 
  FaImages, FaComments, FaCog, FaSignOutAlt,
  FaChalkboardTeacher, FaUserTie, FaUserGraduate
} from 'react-icons/fa';

const Sidebar = ({ user }) => {
  const router = useRouter();
  const [activeLink, setActiveLink] = useState('');
  
  useEffect(() => {
    // Set active link based on current path
    const path = router.pathname;
    const mainPath = path.split('/')[2]; // Get the main section (e.g., 'dashboard', 'chat')
    setActiveLink(mainPath || 'dashboard');
  }, [router.pathname]);
  
  const handleLogout = () => {
    // Clear token from localStorage
    localStorage.removeItem('token');
    
    // Redirect to login page
    router.push('/auth/login');
  };
  
  // Define navigation links based on user role
  const getNavLinks = () => {
    const links = [
      {
        name: 'Dashboard',
        icon: <FaHome className="mr-3" />,
        href: getRoleDashboardPath(),
        key: 'dashboard'
      },
      {
        name: 'Chat',
        icon: <FaComments className="mr-3" />,
        href: '/chat',
        key: 'chat'
      }
    ];
    
    // Add role-specific links
    if (user?.role === 'super_admin' || user?.role === 'admin') {
      links.push(
        {
          name: 'Users',
          icon: <FaUsers className="mr-3" />,
          href: '/admin/users',
          key: 'users'
        },
        {
          name: 'Classes',
          icon: <FaChalkboardTeacher className="mr-3" />,
          href: '/admin/classes',
          key: 'classes'
        },
        {
          name: 'Settings',
          icon: <FaCog className="mr-3" />,
          href: '/admin/settings',
          key: 'settings'
        }
      );
    }
    
    if (user?.role === 'teacher' || user?.role === 'class_teacher') {
      links.push(
        {
          name: 'Students',
          icon: <FaUserGraduate className="mr-3" />,
          href: '/teacher/students',
          key: 'students'
        },
        {
          name: 'Schedule',
          icon: <FaCalendarAlt className="mr-3" />,
          href: '/teacher/schedule',
          key: 'schedule'
        }
      );
    }
    
    if (user?.class) {
      links.push(
        {
          name: 'Class',
          icon: <FaChalkboardTeacher className="mr-3" />,
          href: `/class/${user.class}`,
          key: 'class'
        },
        {
          name: 'Schedule',
          icon: <FaCalendarAlt className="mr-3" />,
          href: `/class/${user.class}/schedule`,
          key: 'schedule'
        },
        {
          name: 'Gallery',
          icon: <FaImages className="mr-3" />,
          href: `/class/${user.class}/gallery`,
          key: 'gallery'
        }
      );
      
      // Add finance link for treasurer, class teacher, and admins
      if (['treasurer', 'class_teacher', 'super_admin', 'admin'].includes(user?.role)) {
        links.push({
          name: 'Finance',
          icon: <FaMoneyBillWave className="mr-3" />,
          href: `/class/${user.class}/finance`,
          key: 'finance'
        });
      }
    }
    
    return links;
  };
  
  // Get dashboard path based on user role
  const getRoleDashboardPath = () => {
    if (!user) return '/dashboard';
    
    switch (user.role) {
      case 'super_admin':
      case 'admin':
        return '/dashboard/admin';
      case 'teacher':
      case 'class_teacher':
        return '/dashboard/teacher';
      case 'class_president':
        return '/dashboard/president';
      case 'vice_president':
        return '/dashboard/vice-president';
      case 'treasurer':
        return '/dashboard/treasurer';
      case 'secretary':
        return '/dashboard/secretary';
      default:
        return '/dashboard/student';
    }
  };
  
  const navLinks = getNavLinks();
  
  return (
    <div className="h-screen bg-gray-800 text-white w-64 flex flex-col">
      <div className="p-5 border-b border-gray-700">
        <h1 className="text-xl font-bold">Classroom Website</h1>
      </div>
      
      {user && (
        <div className="p-5 border-b border-gray-700 flex items-center">
          <img 
            src={user.profilePicture || 'https://via.placeholder.com/50'} 
            alt={user.name} 
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-gray-400 capitalize">{user.role.replace('_', ' ')}</p>
          </div>
        </div>
      )}
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul>
          {navLinks.map((link) => (
            <li key={link.key} className="px-2 py-1">
              <Link 
                href={link.href}
                className={`flex items-center px-4 py-2 rounded-md ${
                  activeLink === link.key 
                    ? 'bg-gray-700 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-700">
        <button 
          onClick={handleLogout}
          className="flex items-center text-gray-300 hover:text-white w-full px-4 py-2 rounded-md hover:bg-gray-700"
        >
          <FaSignOutAlt className="mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

