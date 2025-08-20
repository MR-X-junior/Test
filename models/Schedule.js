const mongoose = require('mongoose');

// Schema for individual schedule items (classes, events, etc.)
const ScheduleItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['class', 'exam', 'event', 'holiday', 'other'],
    default: 'class'
  },
  subject: {
    type: String,
    trim: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dayOfWeek: {
    type: Number, // 0 = Sunday, 1 = Monday, etc.
    min: 0,
    max: 6
  },
  startTime: {
    type: String, // Format: "HH:MM" in 24-hour format
    required: true
  },
  endTime: {
    type: String, // Format: "HH:MM" in 24-hour format
    required: true
  },
  location: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    default: '#3788d8' // Default color for calendar display
  },
  isRecurring: {
    type: Boolean,
    default: true
  },
  specificDate: {
    type: Date // Only used for non-recurring items
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Schema for tasks and assignments
const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    trim: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'overdue'],
    default: 'pending'
  },
  attachments: [{
    type: String, // URL to attachment
    trim: true
  }],
  reminderDate: {
    type: Date
  }
});

// Main schedule schema for a class
const ScheduleSchema = new mongoose.Schema({
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  academicYear: {
    type: String,
    required: true,
    trim: true
  },
  semester: {
    type: String,
    trim: true
  },
  regularItems: [ScheduleItemSchema], // Regular weekly schedule
  specialItems: [ScheduleItemSchema], // One-time events, exams, etc.
  tasks: [TaskSchema], // Assignments and tasks
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Method to get schedule for a specific day
ScheduleSchema.methods.getDaySchedule = function(dayOfWeek) {
  // Get regular items for the specified day
  const regularItems = this.regularItems.filter(item => 
    item.dayOfWeek === dayOfWeek
  );
  
  // Sort by start time
  return regularItems.sort((a, b) => {
    const timeA = a.startTime.split(':').map(Number);
    const timeB = b.startTime.split(':').map(Number);
    
    if (timeA[0] !== timeB[0]) {
      return timeA[0] - timeB[0]; // Sort by hour
    }
    return timeA[1] - timeB[1]; // Sort by minute
  });
};

// Method to get upcoming tasks
ScheduleSchema.methods.getUpcomingTasks = function(days = 7) {
  const today = new Date();
  const endDate = new Date();
  endDate.setDate(today.getDate() + days);
  
  return this.tasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    return dueDate >= today && dueDate <= endDate && task.status === 'pending';
  }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
};

// Method to add a task
ScheduleSchema.methods.addTask = function(taskData) {
  this.tasks.push(taskData);
  this.lastUpdatedBy = taskData.assignedBy;
  
  return this.save();
};

// Method to mark a task as completed
ScheduleSchema.methods.completeTask = function(taskId, userId) {
  const task = this.tasks.id(taskId);
  
  if (!task) {
    throw new Error('Task not found');
  }
  
  task.status = 'completed';
  this.lastUpdatedBy = userId;
  
  return this.save();
};

module.exports = mongoose.models.Schedule || mongoose.model('Schedule', ScheduleSchema);

