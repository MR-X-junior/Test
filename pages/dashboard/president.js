import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/dashboard/Layout';
import { FaUsers, FaCalendarAlt, FaMoneyBillWave, FaClipboardList } from 'react-icons/fa';

export default function PresidentDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    upcomingEvents: 0,
    classBalance: 0,
    pendingTasks: 0
  });
  const [classMembers, setClassMembers] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real application, these would be actual API calls
        // For now, we'll simulate the data
        
        // Simulate stats
        setStats({
          totalStudents: 28,
          upcomingEvents: 3,
          classBalance: 550,
          pendingTasks: 5
        });
        
        // Simulate class members
        setClassMembers([
          {
            id: 1,
            name: 'Vice President',
            role: 'vice_president',
            email: 'vicepresident@example.com',
            profilePicture: 'https://via.placeholder.com/40'
          },
          {
            id: 2,
            name: 'Treasurer',
            role: 'treasurer',
            email: 'treasurer@example.com',
            profilePicture: 'https://via.placeholder.com/40'
          },
          {
            id: 3,
            name: 'Secretary',
            role: 'secretary',
            email: 'secretary@example.com',
            profilePicture: 'https://via.placeholder.com/40'
          },
          {
            id: 4,
            name: 'Student 1',
            role: 'student',
            email: 'student1@example.com',
            profilePicture: 'https://via.placeholder.com/40'
          },
          {
            id: 5,
            name: 'Student 2',
            role: 'student',
            email: 'student2@example.com',
            profilePicture: 'https://via.placeholder.com/40'
          }
        ]);
        
        // Simulate upcoming tasks
        setUpcomingTasks([
          {
            id: 1,
            title: 'Class Meeting',
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            priority: 'high',
            status: 'pending'
          },
          {
            id: 2,
            title: 'Organize Class Event',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            priority: 'medium',
            status: 'pending'
          },
          {
            id: 3,
            title: 'Update Class Structure',
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            priority: 'low',
            status: 'pending'
          }
        ]);
      } catch (error) {
        console.error('Error fetching president dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <DashboardLayout title="Class President Dashboard">
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
                <h3 className="text-gray-500 text-sm">Class Members</h3>
                <p className="text-2xl font-semibold">{stats.totalStudents}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <FaCalendarAlt className="text-green-500 text-xl" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Upcoming Events</h3>
                <p className="text-2xl font-semibold">{stats.upcomingEvents}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
              <div className="rounded-full bg-yellow-100 p-3 mr-4">
                <FaMoneyBillWave className="text-yellow-500 text-xl" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Class Balance</h3>
                <p className="text-2xl font-semibold">${stats.classBalance}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
              <div className="rounded-full bg-red-100 p-3 mr-4">
                <FaClipboardList className="text-red-500 text-xl" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Pending Tasks</h3>
                <p className="text-2xl font-semibold">{stats.pendingTasks}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Class Members */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Class Members</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                      <th className="py-3 px-6 text-left">Name</th>
                      <th className="py-3 px-6 text-left">Role</th>
                      <th className="py-3 px-6 text-left">Email</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 text-sm">
                    {classMembers.map((member) => (
                      <tr key={member.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-6 text-left whitespace-nowrap">
                          <div className="flex items-center">
                            <img 
                              src={member.profilePicture} 
                              alt={member.name} 
                              className="w-8 h-8 rounded-full mr-2"
                            />
                            <span>{member.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-6 text-left capitalize">
                          {member.role.replace('_', ' ')}
                        </td>
                        <td className="py-3 px-6 text-left">{member.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {classMembers.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No class members found
                </div>
              )}
              
              <div className="mt-4">
                <button className="text-blue-500 hover:text-blue-700 text-sm font-semibold">
                  View All Members →
                </button>
              </div>
            </div>
            
            {/* Upcoming Tasks */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Upcoming Tasks</h2>
              
              <div className="space-y-4">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{task.title}</h3>
                        <p className="text-sm text-gray-600">
                          Due: {task.dueDate.toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getPriorityClass(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    
                    <div className="mt-2 flex justify-end">
                      <button className="text-green-500 hover:text-green-700 text-sm mr-2">
                        Complete
                      </button>
                      <button className="text-blue-500 hover:text-blue-700 text-sm">
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
                
                {upcomingTasks.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No upcoming tasks
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <button className="text-blue-500 hover:text-blue-700 text-sm font-semibold">
                  View All Tasks →
                </button>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
                  Create Announcement
                </button>
                <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded">
                  Schedule Class Event
                </button>
                <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded">
                  Manage Class Structure
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

