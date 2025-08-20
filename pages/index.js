import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import { FaChalkboardTeacher, FaUsers, FaCalendarAlt, FaComments, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

export default function HomePage() {
  const router = useRouter();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
        
        // Fetch public classes
        const response = await axios.get('/api/public/classes');
        setClasses(response.data.classes || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">Classroom Website</h1>
            <p className="text-gray-600">Manage your classroom efficiently</p>
          </div>
          
          <div className="flex space-x-4">
            {isLoggedIn ? (
              <button 
                onClick={() => router.push('/dashboard')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
              >
                <FaChalkboardTeacher className="mr-2" />
                Dashboard
              </button>
            ) : (
              <>
                <Link 
                  href="/auth/login"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
                >
                  <FaSignInAlt className="mr-2" />
                  Login
                </Link>
                <Link 
                  href="/auth/register"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center"
                >
                  <FaUserPlus className="mr-2" />
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Welcome to Classroom Website</h2>
          <p className="text-xl mb-8">A comprehensive platform for managing classroom activities, communication, and resources</p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white text-blue-600 rounded-lg p-6 shadow-md w-64 flex flex-col items-center">
              <FaChalkboardTeacher className="text-4xl mb-4" />
              <h3 className="text-xl font-semibold mb-2">Class Management</h3>
              <p className="text-gray-600 text-center">Manage class information, structure, and schedules</p>
            </div>
            
            <div className="bg-white text-blue-600 rounded-lg p-6 shadow-md w-64 flex flex-col items-center">
              <FaUsers className="text-4xl mb-4" />
              <h3 className="text-xl font-semibold mb-2">Role-Based Access</h3>
              <p className="text-gray-600 text-center">Different roles with specific permissions and capabilities</p>
            </div>
            
            <div className="bg-white text-blue-600 rounded-lg p-6 shadow-md w-64 flex flex-col items-center">
              <FaCalendarAlt className="text-4xl mb-4" />
              <h3 className="text-xl font-semibold mb-2">Schedules & Tasks</h3>
              <p className="text-gray-600 text-center">Manage class schedules, events, and assignments</p>
            </div>
            
            <div className="bg-white text-blue-600 rounded-lg p-6 shadow-md w-64 flex flex-col items-center">
              <FaComments className="text-4xl mb-4" />
              <h3 className="text-xl font-semibold mb-2">Communication</h3>
              <p className="text-gray-600 text-center">Direct and group messaging for effective communication</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Classes Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Classes</h2>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.length === 0 ? (
                <div className="col-span-3 text-center py-8 text-gray-500">
                  No classes available
                </div>
              ) : (
                classes.map((classItem) => (
                  <div key={classItem._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <img 
                      src={classItem.classImage || 'https://via.placeholder.com/400x200?text=Class+Image'} 
                      alt={classItem.name} 
                      className="w-full h-48 object-cover"
                    />
                    
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2">{classItem.name}</h3>
                      <p className="text-gray-600 mb-4">{classItem.description}</p>
                      
                      <div className="flex justify-between text-sm text-gray-500 mb-4">
                        <span>Grade: {classItem.grade}</span>
                        <span>Academic Year: {classItem.academicYear}</span>
                      </div>
                      
                      <Link 
                        href={`/class/${classItem._id}/public`}
                        className="block text-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                      >
                        View Class
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">For Teachers</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Manage class information and structure</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Assign tasks and track progress</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Communicate with students and parents</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Create and manage class schedules</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Monitor class performance and activities</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">For Students</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Access class information and schedules</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Communicate with teachers and classmates</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>View and complete assigned tasks</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Participate in class activities and discussions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Access class resources and materials</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8">Join our platform today and experience the benefits of efficient classroom management</p>
          
          <div className="flex justify-center space-x-4">
            <Link 
              href="/auth/register"
              className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-md font-semibold"
            >
              Register Now
            </Link>
            <Link 
              href="/auth/login"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-6 py-3 rounded-md font-semibold"
            >
              Login
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">Classroom Website</h3>
              <p className="text-gray-400">© 2023 All Rights Reserved</p>
            </div>
            
            <div className="flex space-x-4">
              <Link href="/about" className="hover:text-blue-400">About</Link>
              <Link href="/contact" className="hover:text-blue-400">Contact</Link>
              <Link href="/privacy" className="hover:text-blue-400">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-blue-400">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

