require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, ROLES } = require('../models/User');
const Class = require('../models/Class');
const Schedule = require('../models/Schedule');
const Finance = require('../models/Finance');
const { Gallery } = require('../models/Gallery');
const { DirectChat, GroupChat } = require('../models/Chat');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Test user data
const users = [
  {
    name: 'Super Admin',
    email: 'admin@example.com',
    password: 'password123',
    role: ROLES.SUPER_ADMIN,
    isApproved: true
  },
  {
    name: 'Teacher',
    email: 'teacher@example.com',
    password: 'password123',
    role: ROLES.TEACHER,
    isApproved: true
  },
  {
    name: 'Class Teacher',
    email: 'classteacher@example.com',
    password: 'password123',
    role: ROLES.CLASS_TEACHER,
    isApproved: true
  },
  {
    name: 'Class President',
    email: 'president@example.com',
    password: 'password123',
    role: ROLES.CLASS_PRESIDENT,
    isApproved: true
  },
  {
    name: 'Vice President',
    email: 'vicepresident@example.com',
    password: 'password123',
    role: ROLES.VICE_PRESIDENT,
    isApproved: true
  },
  {
    name: 'Treasurer',
    email: 'treasurer@example.com',
    password: 'password123',
    role: ROLES.TREASURER,
    isApproved: true
  },
  {
    name: 'Secretary',
    email: 'secretary@example.com',
    password: 'password123',
    role: ROLES.SECRETARY,
    isApproved: true
  },
  {
    name: 'Student 1',
    email: 'student1@example.com',
    password: 'password123',
    role: ROLES.STUDENT,
    isApproved: true
  },
  {
    name: 'Student 2',
    email: 'student2@example.com',
    password: 'password123',
    role: ROLES.STUDENT,
    isApproved: true
  },
  {
    name: 'Student 3',
    email: 'student3@example.com',
    password: 'password123',
    role: ROLES.STUDENT,
    isApproved: true
  }
];

// Class data
const classData = {
  name: 'Class 10A',
  grade: '10',
  academicYear: '2023-2024',
  description: 'A sample class for demonstration purposes',
  privacySettings: {
    financeVisibility: 'class_only',
    galleryVisibility: 'class_only',
    scheduleVisibility: 'class_only'
  }
};

// Schedule data
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
  }
];

// Tasks data
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
  }
];

// Finance categories
const financeCategories = [
  {
    name: 'Class Dues',
    type: 'income',
    description: 'Regular dues collected from students'
  },
  {
    name: 'Events',
    type: 'expense',
    description: 'Expenses for class events'
  },
  {
    name: 'Supplies',
    type: 'expense',
    description: 'Classroom supplies and materials'
  },
  {
    name: 'Donations',
    type: 'income',
    description: 'Donations to the class'
  }
];

// Transactions data
const transactions = [
  {
    type: 'income',
    amount: 500,
    description: 'Monthly class dues collection',
    category: 'Class Dues',
    status: 'approved'
  },
  {
    type: 'expense',
    amount: 150,
    description: 'Classroom decorations',
    category: 'Supplies',
    status: 'approved'
  },
  {
    type: 'income',
    amount: 200,
    description: 'Donation from parent association',
    category: 'Donations',
    status: 'approved'
  }
];

// Seed data function
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Class.deleteMany({});
    await Schedule.deleteMany({});
    await Finance.deleteMany({});
    await Gallery.deleteMany({});
    await DirectChat.deleteMany({});
    await GroupChat.deleteMany({});
    
    console.log('Cleared existing data');
    
    // Create users
    const createdUsers = [];
    
    for (const userData of users) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      
      await user.save();
      createdUsers.push(user);
    }
    
    console.log('Created users');
    
    // Create class
    const classTeacher = createdUsers.find(user => user.role === ROLES.CLASS_TEACHER);
    const superAdmin = createdUsers.find(user => user.role === ROLES.SUPER_ADMIN);
    
    const newClass = new Class({
      ...classData,
      classTeacher: classTeacher._id,
      createdBy: superAdmin._id
    });
    
    // Add students to class
    const studentUsers = createdUsers.filter(user => 
      user.role === ROLES.STUDENT || 
      user.role === ROLES.CLASS_PRESIDENT || 
      user.role === ROLES.VICE_PRESIDENT || 
      user.role === ROLES.TREASURER || 
      user.role === ROLES.SECRETARY
    );
    
    newClass.students = studentUsers.map(user => user._id);
    
    // Create class structure
    const president = createdUsers.find(user => user.role === ROLES.CLASS_PRESIDENT);
    const vicePresident = createdUsers.find(user => user.role === ROLES.VICE_PRESIDENT);
    const treasurer = createdUsers.find(user => user.role === ROLES.TREASURER);
    const secretary = createdUsers.find(user => user.role === ROLES.SECRETARY);
    
    newClass.structure = [
      {
        position: 'Class President',
        user: president._id,
        description: 'Leads the class and represents students'
      },
      {
        position: 'Vice President',
        user: vicePresident._id,
        description: 'Assists the president and takes over when needed'
      },
      {
        position: 'Treasurer',
        user: treasurer._id,
        description: 'Manages class finances'
      },
      {
        position: 'Secretary',
        user: secretary._id,
        description: 'Keeps records and manages communication'
      }
    ];
    
    await newClass.save();
    console.log('Created class');
    
    // Update users with class ID
    for (const user of studentUsers) {
      user.class = newClass._id;
      await user.save();
    }
    
    classTeacher.class = newClass._id;
    await classTeacher.save();
    
    console.log('Updated users with class ID');
    
    // Create schedule
    const schedule = new Schedule({
      class: newClass._id,
      academicYear: newClass.academicYear,
      createdBy: superAdmin._id
    });
    
    // Add regular schedule items
    const teacher = createdUsers.find(user => user.role === ROLES.TEACHER);
    
    for (const item of scheduleItems) {
      schedule.regularItems.push({
        ...item,
        teacher: teacher._id,
        createdBy: classTeacher._id
      });
    }
    
    // Add tasks
    for (const task of tasks) {
      schedule.tasks.push({
        ...task,
        assignedBy: classTeacher._id
      });
    }
    
    await schedule.save();
    console.log('Created schedule');
    
    // Update class with schedule
    newClass.schedule = schedule._id;
    await newClass.save();
    
    // Create finance
    const finance = new Finance({
      class: newClass._id,
      createdBy: superAdmin._id
    });
    
    // Add categories
    finance.categories = financeCategories;
    
    // Add transactions
    for (const transaction of transactions) {
      await finance.addTransaction({
        ...transaction,
        recordedBy: treasurer._id,
        approvedBy: classTeacher._id,
        approvedAt: new Date()
      });
    }
    
    console.log('Created finance');
    
    // Create gallery
    const gallery = new Gallery({
      class: newClass._id,
      createdBy: superAdmin._id
    });
    
    // Create album
    const album = {
      title: 'Class Activities',
      description: 'Photos from various class activities',
      createdBy: president._id,
      createdAt: new Date()
    };
    
    await gallery.createAlbum(album);
    console.log('Created gallery');
    
    // Create group chat for class
    const groupChat = new GroupChat({
      name: 'Class 10A Group',
      description: 'Official group chat for Class 10A',
      participants: [
        ...studentUsers.map(user => ({
          user: user._id,
          role: user.role === ROLES.CLASS_PRESIDENT ? 'admin' : 'member',
          addedBy: president._id,
          addedAt: new Date()
        })),
        {
          user: classTeacher._id,
          role: 'admin',
          addedBy: president._id,
          addedAt: new Date()
        }
      ],
      class: newClass._id,
      createdBy: president._id
    });
    
    await groupChat.save();
    console.log('Created group chat');
    
    // Create some direct chats
    const directChat1 = new DirectChat({
      participants: [president._id, vicePresident._id],
      messages: [
        {
          sender: president._id,
          content: 'Hey, can we discuss the upcoming class event?',
          readBy: [{ user: president._id }]
        }
      ]
    });
    
    await directChat1.save();
    
    const directChat2 = new DirectChat({
      participants: [classTeacher._id, president._id],
      messages: [
        {
          sender: classTeacher._id,
          content: 'Please remind everyone about the homework due next week.',
          readBy: [{ user: classTeacher._id }]
        }
      ]
    });
    
    await directChat2.save();
    
    console.log('Created direct chats');
    
    console.log('Data seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Data seeding error:', error);
    process.exit(1);
  }
};

// Run the seed function
seedData();

