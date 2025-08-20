# Classroom Website

A comprehensive classroom management website with role-based access control, chat functionality, and various features for managing class information, schedules, finances, and more.

## Features

- **User Management**: Different roles with specific permissions (Super Admin, Teacher, Class Teacher, Class President, Vice President, Treasurer, Secretary)
- **Chat System**: Direct messaging and group chats with profile pictures
- **Class Management**: Create and manage classes, structures, and schedules
- **Financial Tracking**: Manage class funds with income and expense tracking
- **Photo Gallery**: Upload and display class photos and events
- **Public Pages**: Showcase class and school information

## Roles and Permissions

1. **Super Admin**
   - Full access to all features
   - Manage other admins and users
   - Create new classes
   - Modify class structures

2. **Teacher**
   - Assign tasks
   - Give warnings to students

3. **Class Teacher**
   - Same as Teacher
   - View class finances
   - Revoke positions in class structure

4. **Class President**
   - Add members to group chats
   - Report student behavior to teachers
   - Manage class privacy settings

5. **Vice President**
   - Similar to Class President
   - Actions require approval from Class President
   - Can be granted permission to act without approval

6. **Treasurer**
   - Manage class finances
   - Record income and expenses

7. **Secretary**
   - Provide task information to classmates

## Technology Stack

- **Frontend**: React.js with Next.js
- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **Real-time Chat**: Socket.io
- **File Storage**: Cloudinary
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/your-username/classroom-website.git
   cd classroom-website
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example` and fill in your configuration

4. Run the development server
   ```
   npm run dev
   ```

5. Seed the database with test accounts
   ```
   npm run seed
   ```

## Test Accounts

The seed script creates test accounts for each role:

- Super Admin: admin@example.com / password123
- Teacher: teacher@example.com / password123
- Class Teacher: classteacher@example.com / password123
- Class President: president@example.com / password123
- Vice President: vicepresident@example.com / password123
- Treasurer: treasurer@example.com / password123
- Secretary: secretary@example.com / password123
- Student: student1@example.com / password123

## Project Structure

```
classroom-website/
├── components/         # React components
│   ├── chat/           # Chat-related components
│   ├── dashboard/      # Dashboard components
│   ├── finance/        # Finance-related components
│   ├── gallery/        # Gallery components
│   └── public/         # Public page components
├── controllers/        # API controllers
├── data/               # Seed data
├── middleware/         # Express middleware
├── models/             # MongoDB models
├── pages/              # Next.js pages
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   ├── chat/           # Chat pages
│   ├── class/          # Class pages
│   ├── dashboard/      # Dashboard pages
│   ├── finance/        # Finance pages
│   ├── gallery/        # Gallery pages
│   └── school/         # School pages
├── public/             # Static files
├── scripts/            # Utility scripts
├── socket/             # Socket.io setup
├── styles/             # CSS styles
└── utils/              # Utility functions
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Socket.io](https://socket.io/)
- [Tailwind CSS](https://tailwindcss.com/)

