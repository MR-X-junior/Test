import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/dashboard/Layout';
import { FaUsers, FaChalkboardTeacher, FaUserClock, FaExclamationTriangle } from 'react-icons/fa';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClasses: 0,
    pendingApprovals: 0,
    blockedUsers: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch dashboard stats
        const statsResponse = await axios.get('/api/admin/stats');
        setStats(statsResponse.data);
        
        // Fetch recent users
        const usersResponse = await axios.get('/api/admin/recent-users');
        setRecentUsers(usersResponse.data.users);
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  return (
    <DashboardLayout title="Admin Dashboard">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <FaUsers className="text-blue-500 text-xl" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Total Users</h3>
                <p className="text-2xl font-semibold">{stats.totalUsers}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <FaChalkboardTeacher className="text-green-500 text-xl" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Total Classes</h3>
                <p className="text-2xl font-semibold">{stats.totalClasses}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
              <div className="rounded-full bg-yellow-100 p-3 mr-4">
                <FaUserClock className="text-yellow-500 text-xl" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Pending Approvals</h3>
                <p className="text-2xl font-semibold">{stats.pendingApprovals}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
              <div className="rounded-full bg-red-100 p-3 mr-4">
                <FaExclamationTriangle className="text-red-500 text-xl" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Blocked Users</h3>
                <p className="text-2xl font-semibold">{stats.blockedUsers}</p>
              </div>
            </div>
          </div>
          
          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Users</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">Name</th>
                    <th className="py-3 px-6 text-left">Email</th>
                    <th className="py-3 px-6 text-left">Role</th>
                    <th className="py-3 px-6 text-left">Status</th>
                    <th className="py-3 px-6 text-left">Joined</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm">
                  {recentUsers.map((user) => (
                    <tr key={user._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-6 text-left whitespace-nowrap">
                        <div className="flex items-center">
                          <img 
                            src={user.profilePicture || 'https://via.placeholder.com/40'} 
                            alt={user.name} 
                            className="w-8 h-8 rounded-full mr-2"
                          />
                          <span>{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-left">{user.email}</td>
                      <td className="py-3 px-6 text-left capitalize">{user.role.replace('_', ' ')}</td>
                      <td className="py-3 px-6 text-left">
                        {!user.isApproved ? (
                          <span className="bg-yellow-100 text-yellow-800 py-1 px-3 rounded-full text-xs">Pending</span>
                        ) : user.isBlocked ? (
                          <span className="bg-red-100 text-red-800 py-1 px-3 rounded-full text-xs">Blocked</span>
                        ) : (
                          <span className="bg-green-100 text-green-800 py-1 px-3 rounded-full text-xs">Active</span>
                        )}
                      </td>
                      <td className="py-3 px-6 text-left">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {recentUsers.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No users found
              </div>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
                  Approve Users
                </button>
                <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded">
                  Create New Class
                </button>
                <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded">
                  Manage Roles
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

