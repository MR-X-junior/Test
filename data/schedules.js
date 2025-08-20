const scheduleItems = [
  {
    title: 'Mathematics',
    type: 'class',
    subject: 'Mathematics',
    dayOfWeek: 1, // Monday
    startTime: '08:00',
    endTime: '09:30',
    location: 'Room 101',
    color: '#4285F4'
  },
  {
    title: 'Science',
    type: 'class',
    subject: 'Science',
    dayOfWeek: 1, // Monday
    startTime: '10:00',
    endTime: '11:30',
    location: 'Room 102',
    color: '#0F9D58'
  },
  {
    title: 'English',
    type: 'class',
    subject: 'English',
    dayOfWeek: 2, // Tuesday
    startTime: '08:00',
    endTime: '09:30',
    location: 'Room 103',
    color: '#DB4437'
  },
  {
    title: 'History',
    type: 'class',
    subject: 'History',
    dayOfWeek: 2, // Tuesday
    startTime: '10:00',
    endTime: '11:30',
    location: 'Room 104',
    color: '#F4B400'
  },
  {
    title: 'Physical Education',
    type: 'class',
    subject: 'PE',
    dayOfWeek: 3, // Wednesday
    startTime: '08:00',
    endTime: '09:30',
    location: 'Gymnasium',
    color: '#4285F4'
  },
  {
    title: 'Art',
    type: 'class',
    subject: 'Art',
    dayOfWeek: 3, // Wednesday
    startTime: '10:00',
    endTime: '11:30',
    location: 'Art Studio',
    color: '#DB4437'
  },
  {
    title: 'Computer Science',
    type: 'class',
    subject: 'CS',
    dayOfWeek: 4, // Thursday
    startTime: '08:00',
    endTime: '09:30',
    location: 'Computer Lab',
    color: '#0F9D58'
  },
  {
    title: 'Music',
    type: 'class',
    subject: 'Music',
    dayOfWeek: 4, // Thursday
    startTime: '10:00',
    endTime: '11:30',
    location: 'Music Room',
    color: '#F4B400'
  },
  {
    title: 'Language',
    type: 'class',
    subject: 'Language',
    dayOfWeek: 5, // Friday
    startTime: '08:00',
    endTime: '09:30',
    location: 'Room 105',
    color: '#4285F4'
  },
  {
    title: 'Social Studies',
    type: 'class',
    subject: 'Social Studies',
    dayOfWeek: 5, // Friday
    startTime: '10:00',
    endTime: '11:30',
    location: 'Room 106',
    color: '#DB4437'
  }
];

const tasks = [
  {
    title: 'Mathematics Homework',
    description: 'Complete exercises 1-10 on page 25',
    subject: 'Mathematics',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    priority: 'high'
  },
  {
    title: 'Science Project',
    description: 'Prepare a presentation on renewable energy',
    subject: 'Science',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    priority: 'medium'
  },
  {
    title: 'English Essay',
    description: 'Write a 500-word essay on your favorite book',
    subject: 'English',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    priority: 'medium'
  },
  {
    title: 'History Research',
    description: 'Research and write about a historical event of your choice',
    subject: 'History',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    priority: 'low'
  },
  {
    title: 'Art Project',
    description: 'Create a self-portrait using any medium',
    subject: 'Art',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    priority: 'medium'
  }
];

module.exports = {
  scheduleItems,
  tasks
};

