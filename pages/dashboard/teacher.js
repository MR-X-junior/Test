import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/dashboard/Layout';
import { FaUserGraduate, FaCalendarAlt, FaClipboardList, FaExclamationCircle } from 'react-icons/fa';

export default function TeacherDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    upcomingClasses: 0,
    pendingTasks: 0,
    announcements: 0
  });
  const [upcomingSchedule, setUpcomingSchedule] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real application, these would be actual API calls
        // For now, we'll simulate the data
        
        // Simulate stats
        setStats({
          totalStudents: 28,
          upcomingClasses: 5,
          pendingTasks: 3,
          announcements: 2
        });
        
        // Simulate upcoming schedule
        setUpcomingSchedule([
          {
            id: 1,
            title: 'Mathematics',
            day: 'Monday',
            startTime: '08:00',
            endTime: '09:30',
            location: 'Room 101'
          },
          {
            id: 2,
            title: 'Science',
            day: 'Monday',
            startTime: '10:00',
            endTime: '11:30',
            location: 'Room 102'
          },
          {
            id: 3,
            title: 'English',
            day: 'Tuesday',
            startTime: '08:00',
            endTime: '09:30',
            location: 'Room 103'
          }
        ]);
        
        // Simulate recent tasks
        setRecentTasks([
          {
            id: 1,
            title: 'Grade Mathematics Tests',
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            priority: 'high',
            status: 'pending'
          },
          {
            id: 2,
            title: 'Prepare Science Lab Materials',
            dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            priority: 'medium',
            status: 'pending'
          },
          {
            id: 3,
            title: 'Submit Monthly Report',
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            priority: 'low',
            status: 'pending'
          }
        ]);
      } catch (error) {
        console.error('Error fetching teacher dashboard data:', error);
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
    <DashboardLayout title="Teacher Dashboard">
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
                <FaUserGraduate className="text-blue-500 text-xl" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Total Students</h3>
                <p className="text-2xl font-semibold">{stats.totalStudents}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <FaCalendarAlt className="text-green-500 text-xl" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Upcoming Classes</h3>
                <p className="text-2xl font-semibold">{stats.upcomingClasses}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
              <div className="rounded-full bg-yellow-100 p-3 mr-4">
                <FaClipboardList className="text-yellow-500 text-xl" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Pending Tasks</h3>
                <p className="text-2xl font-semibold">{stats.pendingTasks}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
              <div className="rounded-full bg-red-100 p-3 mr-4">
                <FaExclamationCircle className="text-red-500 text-xl" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Announcements</h3>
                <p className="text-2xl font-semibold">{stats.announcements}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Schedule */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Upcoming Schedule</h2>
              
              <div className="space-y-4">
                {upcomingSchedule.map((item) => (
                  <div key={item.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-gray-600">
                          {item.day}, {item.startTime} - {item.endTime}
                        </p>
                        <p className="text-sm text-gray-600">{item.location}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {upcomingSchedule.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No upcoming classes
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <button className="text-blue-500 hover:text-blue-700 text-sm font-semibold">
                  View Full Schedule →
                </button>
              </div>
            </div>
            
            {/* Recent Tasks */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Pending Tasks</h2>
              
              <div className="space-y-4">
                {recentTasks.map((task) => (
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
                
                {recentTasks.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No pending tasks
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
                  Assign New Task
                </button>
                <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded">
                  Create Announcement
                </button>
                <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded">
                  Schedule Meeting
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

