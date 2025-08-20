import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import { FaChalkboardTeacher, FaUsers, FaCalendarAlt, FaImages, FaArrowLeft, FaSignInAlt } from 'react-icons/fa';

export default function PublicClassPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
        
        // Fetch class data
        const response = await axios.get(`/api/public/class/${id}`);
        setClassData(response.data.class);
      } catch (error) {
        console.error('Error fetching class data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading class information...</p>
        </div>
      </div>
    );
  }
  
  if (!classData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Class Not Found</h2>
          <p className="text-gray-600 mb-4">The class you are looking for does not exist or is not publicly available.</p>
          <Link 
            href="/"
            className="inline-flex items-center text-blue-500 hover:text-blue-700"
          >
            <FaArrowLeft className="mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <Link 
            href="/"
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FaArrowLeft className="mr-2" />
            Back to Home
          </Link>
          
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
              <Link 
                href="/auth/login"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
              >
                <FaSignInAlt className="mr-2" />
                Login
              </Link>
            )}
          </div>
        </div>
      </header>
      
      {/* Class Banner */}
      <div className="relative h-64 bg-blue-600">
        <img 
          src={classData.classImage || 'https://via.placeholder.com/1200x400?text=Class+Banner'} 
          alt={classData.name} 
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-2">{classData.name}</h1>
            <p className="text-xl">Grade {classData.grade} - {classData.academicYear}</p>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            <button 
              className={`py-4 px-6 font-medium ${
                activeTab === 'info' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('info')}
            >
              <FaChalkboardTeacher className="inline mr-2" />
              Class Information
            </button>
            
            <button 
              className={`py-4 px-6 font-medium ${
                activeTab === 'structure' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('structure')}
            >
              <FaUsers className="inline mr-2" />
              Class Structure
            </button>
            
            <button 
              className={`py-4 px-6 font-medium ${
                activeTab === 'schedule' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('schedule')}
            >
              <FaCalendarAlt className="inline mr-2" />
              Schedule
            </button>
            
            <button 
              className={`py-4 px-6 font-medium ${
                activeTab === 'gallery' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('gallery')}
            >
              <FaImages className="inline mr-2" />
              Gallery
            </button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'info' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Class Information</h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700">{classData.description || 'No description available.'}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Class Details</h3>
                <ul className="space-y-2">
                  <li className="flex">
                    <span className="font-medium w-32">Grade:</span>
                    <span>{classData.grade}</span>
                  </li>
                  <li className="flex">
                    <span className="font-medium w-32">Academic Year:</span>
                    <span>{classData.academicYear}</span>
                  </li>
                  <li className="flex">
                    <span className="font-medium w-32">Class Teacher:</span>
                    <span>{classData.classTeacher?.name || 'Not assigned'}</span>
                  </li>
                  <li className="flex">
                    <span className="font-medium w-32">Students:</span>
                    <span>{classData.students?.length || 0} students</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                <p className="text-gray-700 mb-4">
                  For more information about this class, please contact the class teacher or school administration.
                </p>
                
                {isLoggedIn ? (
                  <button 
                    onClick={() => router.push(`/class/${id}`)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                  >
                    View Full Class Details
                  </button>
                ) : (
                  <Link 
                    href="/auth/login"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md inline-block"
                  >
                    Login to View More
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'structure' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Class Structure</h2>
            
            {classData.structure && classData.structure.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                      <th className="py-3 px-6 text-left">Position</th>
                      <th className="py-3 px-6 text-left">Name</th>
                      <th className="py-3 px-6 text-left">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 text-sm">
                    {classData.structure.map((position, index) => (
                      <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-6 text-left whitespace-nowrap font-medium">
                          {position.position}
                        </td>
                        <td className="py-3 px-6 text-left">
                          {position.user?.name || 'Not assigned'}
                        </td>
                        <td className="py-3 px-6 text-left">
                          {position.description || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-700">No class structure information available.</p>
            )}
            
            <div className="mt-6">
              {isLoggedIn ? (
                <button 
                  onClick={() => router.push(`/class/${id}`)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  View Full Class Details
                </button>
              ) : (
                <Link 
                  href="/auth/login"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md inline-block"
                >
                  Login to View More
                </Link>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'schedule' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Class Schedule</h2>
            
            {classData.privacySettings?.scheduleVisibility === 'public' ? (
              <div>
                {/* Schedule content would go here */}
                <p className="text-gray-700 mb-4">
                  Weekly schedule for {classData.name}:
                </p>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                        <th className="py-3 px-6 text-left">Day</th>
                        <th className="py-3 px-6 text-left">Time</th>
                        <th className="py-3 px-6 text-left">Subject</th>
                        <th className="py-3 px-6 text-left">Teacher</th>
                        <th className="py-3 px-6 text-left">Location</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm">
                      {/* Sample schedule data */}
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-6 text-left">Monday</td>
                        <td className="py-3 px-6 text-left">08:00 - 09:30</td>
                        <td className="py-3 px-6 text-left">Mathematics</td>
                        <td className="py-3 px-6 text-left">Mr. Smith</td>
                        <td className="py-3 px-6 text-left">Room 101</td>
                      </tr>
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-6 text-left">Monday</td>
                        <td className="py-3 px-6 text-left">10:00 - 11:30</td>
                        <td className="py-3 px-6 text-left">Science</td>
                        <td className="py-3 px-6 text-left">Mrs. Johnson</td>
                        <td className="py-3 px-6 text-left">Room 102</td>
                      </tr>
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-6 text-left">Tuesday</td>
                        <td className="py-3 px-6 text-left">08:00 - 09:30</td>
                        <td className="py-3 px-6 text-left">English</td>
                        <td className="py-3 px-6 text-left">Ms. Davis</td>
                        <td className="py-3 px-6 text-left">Room 103</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-700 mb-4">
                  The class schedule is not publicly available.
                </p>
                
                {isLoggedIn ? (
                  <button 
                    onClick={() => router.push(`/class/${id}/schedule`)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                  >
                    View Full Schedule
                  </button>
                ) : (
                  <Link 
                    href="/auth/login"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md inline-block"
                  >
                    Login to View Schedule
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'gallery' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Class Gallery</h2>
            
            {classData.privacySettings?.galleryVisibility === 'public' ? (
              <div>
                {/* Gallery content would go here */}
                <p className="text-gray-700 mb-4">
                  Photos from {classData.name} activities and events:
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Sample gallery items */}
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <div key={item} className="rounded-lg overflow-hidden shadow-md">
                      <img 
                        src={`https://via.placeholder.com/300x200?text=Class+Photo+${item}`} 
                        alt={`Class Photo ${item}`} 
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-700 mb-4">
                  The class gallery is not publicly available.
                </p>
                
                {isLoggedIn ? (
                  <button 
                    onClick={() => router.push(`/class/${id}/gallery`)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                  >
                    View Full Gallery
                  </button>
                ) : (
                  <Link 
                    href="/auth/login"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md inline-block"
                  >
                    Login to View Gallery
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-8">
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

