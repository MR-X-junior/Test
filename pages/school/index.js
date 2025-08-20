import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import { FaSchool, FaChalkboardTeacher, FaCalendarAlt, FaNewspaper, FaSignInAlt, FaArrowLeft } from 'react-icons/fa';

export default function SchoolPage() {
  const router = useRouter();
  
  const [schoolData, setSchoolData] = useState({
    name: 'Sample School',
    description: 'A comprehensive educational institution dedicated to providing quality education and fostering academic excellence.',
    address: '123 School Street, City, Country',
    phone: '+1 234 567 8900',
    email: 'info@sampleschool.edu',
    website: 'www.sampleschool.edu',
    principal: 'Dr. John Smith',
    foundedYear: '1985',
    motto: 'Knowledge, Character, Excellence'
  });
  const [classes, setClasses] = useState([]);
  const [events, setEvents] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
        
        // Fetch school data
        // const schoolResponse = await axios.get('/api/public/school');
        // setSchoolData(schoolResponse.data.school);
        
        // Fetch classes
        const classesResponse = await axios.get('/api/public/classes');
        setClasses(classesResponse.data.classes || []);
        
        // Simulate events data
        setEvents([
          {
            id: 1,
            title: 'Annual Sports Day',
            date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            description: 'Annual sports competition featuring various athletic events and team sports.'
          },
          {
            id: 2,
            title: 'Science Fair',
            date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            description: 'Students showcase their science projects and innovations.'
          },
          {
            id: 3,
            title: 'Parent-Teacher Meeting',
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            description: 'Discuss student progress and address any concerns.'
          }
        ]);
        
        // Simulate news data
        setNews([
          {
            id: 1,
            title: 'School Wins Regional Academic Competition',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            summary: 'Our school team secured first place in the regional academic competition, showcasing exceptional knowledge and teamwork.'
          },
          {
            id: 2,
            title: 'New Library Resources Available',
            date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            summary: 'The school library has been updated with new books and digital resources to enhance learning opportunities.'
          },
          {
            id: 3,
            title: 'Upcoming Curriculum Changes',
            date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            summary: 'Important updates to the curriculum will be implemented next semester to align with educational standards.'
          }
        ]);
      } catch (error) {
        console.error('Error fetching school data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading school information...</p>
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
      
      {/* School Banner */}
      <div className="relative h-64 bg-blue-600">
        <img 
          src="https://via.placeholder.com/1200x400?text=School+Banner" 
          alt={schoolData.name} 
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-2">{schoolData.name}</h1>
            <p className="text-xl">{schoolData.motto}</p>
          </div>
        </div>
      </div>
      
      {/* School Information */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">About Our School</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-700 mb-4">{schoolData.description}</p>
              
              <h3 className="text-lg font-semibold mb-2">Our Mission</h3>
              <p className="text-gray-700 mb-4">
                To provide a nurturing and inclusive learning environment that empowers students to achieve academic excellence, develop critical thinking skills, and become responsible global citizens.
              </p>
              
              <h3 className="text-lg font-semibold mb-2">Our Vision</h3>
              <p className="text-gray-700">
                To be a leading educational institution that inspires lifelong learning, fosters innovation, and prepares students for the challenges of the future.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">School Details</h3>
              <ul className="space-y-2">
                <li className="flex">
                  <span className="font-medium w-32">Founded:</span>
                  <span>{schoolData.foundedYear}</span>
                </li>
                <li className="flex">
                  <span className="font-medium w-32">Principal:</span>
                  <span>{schoolData.principal}</span>
                </li>
                <li className="flex">
                  <span className="font-medium w-32">Address:</span>
                  <span>{schoolData.address}</span>
                </li>
                <li className="flex">
                  <span className="font-medium w-32">Phone:</span>
                  <span>{schoolData.phone}</span>
                </li>
                <li className="flex">
                  <span className="font-medium w-32">Email:</span>
                  <span>{schoolData.email}</span>
                </li>
                <li className="flex">
                  <span className="font-medium w-32">Website:</span>
                  <span>{schoolData.website}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Classes */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Our Classes</h2>
          
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
        </div>
        
        {/* Upcoming Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FaCalendarAlt className="text-blue-500 text-xl mr-2" />
              <h2 className="text-2xl font-bold">Upcoming Events</h2>
            </div>
            
            {events.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                No upcoming events
              </p>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <h3 className="font-semibold">{event.title}</h3>
                    <p className="text-sm text-gray-500 mb-1">
                      {event.date.toLocaleDateString()}
                    </p>
                    <p className="text-gray-700">{event.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Latest News */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FaNewspaper className="text-blue-500 text-xl mr-2" />
              <h2 className="text-2xl font-bold">Latest News</h2>
            </div>
            
            {news.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                No news available
              </p>
            ) : (
              <div className="space-y-4">
                {news.map((item) => (
                  <div key={item.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-gray-500 mb-1">
                      {item.date.toLocaleDateString()}
                    </p>
                    <p className="text-gray-700">{item.summary}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Facilities */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Our Facilities</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 text-blue-500 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FaSchool className="text-2xl" />
              </div>
              <h3 className="font-semibold mb-2">Modern Classrooms</h3>
              <p className="text-gray-700">
                Equipped with the latest technology and designed for optimal learning experiences.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 text-green-500 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FaSchool className="text-2xl" />
              </div>
              <h3 className="font-semibold mb-2">Library</h3>
              <p className="text-gray-700">
                Extensive collection of books, digital resources, and quiet study spaces.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-100 text-yellow-500 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FaSchool className="text-2xl" />
              </div>
              <h3 className="font-semibold mb-2">Sports Facilities</h3>
              <p className="text-gray-700">
                Indoor and outdoor sports areas for various physical activities and team sports.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">{schoolData.name}</h3>
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

