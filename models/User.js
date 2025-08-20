const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define user roles with numeric values for easy comparison
const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  TEACHER: 'teacher',
  CLASS_TEACHER: 'class_teacher',
  CLASS_PRESIDENT: 'class_president',
  VICE_PRESIDENT: 'vice_president',
  TREASURER: 'treasurer',
  SECRETARY: 'secretary',
  STUDENT: 'student'
};

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email'
    ],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password in queries by default
  },
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.STUDENT
  },
  profilePicture: {
    type: String,
    default: 'https://res.cloudinary.com/demo/image/upload/v1580125392/samples/people/default-avatar.jpg'
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user has specific permissions
UserSchema.methods.hasPermission = function(requiredRole) {
  const roleHierarchy = {
    [ROLES.SUPER_ADMIN]: 100,
    [ROLES.ADMIN]: 90,
    [ROLES.TEACHER]: 80,
    [ROLES.CLASS_TEACHER]: 70,
    [ROLES.CLASS_PRESIDENT]: 60,
    [ROLES.VICE_PRESIDENT]: 50,
    [ROLES.TREASURER]: 40,
    [ROLES.SECRETARY]: 30,
    [ROLES.STUDENT]: 10
  };

  return roleHierarchy[this.role] >= roleHierarchy[requiredRole];
};

// Export the model and roles
module.exports = {
  User: mongoose.models.User || mongoose.model('User', UserSchema),
  ROLES
};

