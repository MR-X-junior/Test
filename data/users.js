const { ROLES } = require('../models/User');

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

module.exports = users;

