const Schedule = require('../models/Schedule');
const Class = require('../models/Class');
const { User, ROLES } = require('../models/User');

// Get class schedule
const getClassSchedule = async (req, res) => {
  try {
    const { classId } = req.params;
    
    // Check if class exists
    const classData = await Class.findById(classId);
    
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    // Check if user has permission to view schedule
    const userId = req.user._id;
    const userRole = req.user.role;
    const userClass = req.user.class?.toString();
    
    // Super admin, admin can view any class schedule
    const hasAdminAccess = [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(userRole);
    
    // Class members can view their class schedule
    const isClassMember = userClass === classId;
    const scheduleVisibility = classData.privacySettings.scheduleVisibility;
    
    const canViewSchedule = 
      hasAdminAccess || 
      (isClassMember && scheduleVisibility === 'class_only') ||
      (scheduleVisibility === 'school') ||
      (scheduleVisibility === 'public');
    
    if (!canViewSchedule) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view class schedule'
      });
    }
    
    // Get schedule data
    let schedule = await Schedule.findOne({ class: classId })
      .populate('regularItems.teacher', 'name email profilePicture')
      .populate('specialItems.teacher', 'name email profilePicture')
      .populate('tasks.assignedBy', 'name email profilePicture')
      .populate('createdBy', 'name email')
      .populate('lastUpdatedBy', 'name email');
    
    // If schedule doesn't exist, create it
    if (!schedule) {
      schedule = new Schedule({
        class: classId,
        academicYear: classData.academicYear,
        createdBy: userId
      });
      
      await schedule.save();
    }
    
    res.status(200).json({
      success: true,
      schedule
    });
  } catch (error) {
    console.error('Get class schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching class schedule',
      error: error.message
    });
  }
};

// Add regular schedule item
const addRegularScheduleItem = async (req, res) => {
  try {
    const { classId } = req.params;
    const { 
      title, type, subject, teacherId, dayOfWeek, 
      startTime, endTime, location, description, color 
    } = req.body;
    const userId = req.user._id;
    
    // Validate required fields
    if (!title || !dayOfWeek || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Title, day of week, start time, and end time are required'
      });
    }
    
    // Validate day of week
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return res.status(400).json({
        success: false,
        message: 'Day of week must be between 0 (Sunday) and 6 (Saturday)'
      });
    }
    
    // Check if class exists
    const classData = await Class.findById(classId);
    
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    // Check if user has permission to add schedule items
    const userRole = req.user.role;
    
    const hasAdminAccess = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CLASS_TEACHER, ROLES.TEACHER].includes(userRole);
    const isClassSecretary = userRole === ROLES.SECRETARY && req.user.class?.toString() === classId;
    
    if (!hasAdminAccess && !isClassSecretary) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to add schedule items'
      });
    }
    
    // Get schedule
    let schedule = await Schedule.findOne({ class: classId });
    
    // If schedule doesn't exist, create it
    if (!schedule) {
      schedule = new Schedule({
        class: classId,
        academicYear: classData.academicYear,
        createdBy: userId
      });
    }
    
    // Create schedule item
    const scheduleItem = {
      title,
      type: type || 'class',
      subject,
      teacher: teacherId,
      dayOfWeek,
      startTime,
      endTime,
      location,
      description,
      color,
      isRecurring: true,
      createdBy: userId,
      createdAt: new Date()
    };
    
    // Add to regular items
    schedule.regularItems.push(scheduleItem);
    schedule.lastUpdatedBy = userId;
    
    await schedule.save();
    
    // Populate teacher info
    const populatedSchedule = await Schedule.findOne({ class: classId })
      .populate('regularItems.teacher', 'name email profilePicture');
    
    const newItem = populatedSchedule.regularItems[populatedSchedule.regularItems.length - 1];
    
    res.status(201).json({
      success: true,
      message: 'Schedule item added successfully',
      scheduleItem: newItem
    });
  } catch (error) {
    console.error('Add regular schedule item error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while adding schedule item',
      error: error.message
    });
  }
};

// Add special schedule item (one-time event)
const addSpecialScheduleItem = async (req, res) => {
  try {
    const { classId } = req.params;
    const { 
      title, type, subject, teacherId, specificDate,
      startTime, endTime, location, description, color 
    } = req.body;
    const userId = req.user._id;
    
    // Validate required fields
    if (!title || !specificDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Title, specific date, start time, and end time are required'
      });
    }
    
    // Check if class exists
    const classData = await Class.findById(classId);
    
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    // Check if user has permission to add schedule items
    const userRole = req.user.role;
    
    const hasAdminAccess = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CLASS_TEACHER, ROLES.TEACHER].includes(userRole);
    const isClassSecretary = userRole === ROLES.SECRETARY && req.user.class?.toString() === classId;
    const isClassPresident = userRole === ROLES.CLASS_PRESIDENT && req.user.class?.toString() === classId;
    
    if (!hasAdminAccess && !isClassSecretary && !isClassPresident) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to add special schedule items'
      });
    }
    
    // Get schedule
    let schedule = await Schedule.findOne({ class: classId });
    
    // If schedule doesn't exist, create it
    if (!schedule) {
      schedule = new Schedule({
        class: classId,
        academicYear: classData.academicYear,
        createdBy: userId
      });
    }
    
    // Create schedule item
    const scheduleItem = {
      title,
      type: type || 'event',
      subject,
      teacher: teacherId,
      startTime,
      endTime,
      location,
      description,
      color,
      isRecurring: false,
      specificDate: new Date(specificDate),
      createdBy: userId,
      createdAt: new Date()
    };
    
    // Add to special items
    schedule.specialItems.push(scheduleItem);
    schedule.lastUpdatedBy = userId;
    
    await schedule.save();
    
    // Populate teacher info
    const populatedSchedule = await Schedule.findOne({ class: classId })
      .populate('specialItems.teacher', 'name email profilePicture');
    
    const newItem = populatedSchedule.specialItems[populatedSchedule.specialItems.length - 1];
    
    res.status(201).json({
      success: true,
      message: 'Special schedule item added successfully',
      scheduleItem: newItem
    });
  } catch (error) {
    console.error('Add special schedule item error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while adding special schedule item',
      error: error.message
    });
  }
};

// Add task
const addTask = async (req, res) => {
  try {
    const { classId } = req.params;
    const { title, description, subject, dueDate, priority, attachments, reminderDate } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Validate required fields
    if (!title || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Title and due date are required'
      });
    }
    
    // Check if class exists
    const classData = await Class.findById(classId);
    
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    // Check if user has permission to add tasks
    const hasAdminAccess = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CLASS_TEACHER, ROLES.TEACHER].includes(userRole);
    const isClassSecretary = userRole === ROLES.SECRETARY && req.user.class?.toString() === classId;
    
    if (!hasAdminAccess && !isClassSecretary) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to add tasks'
      });
    }
    
    // Get schedule
    let schedule = await Schedule.findOne({ class: classId });
    
    // If schedule doesn't exist, create it
    if (!schedule) {
      schedule = new Schedule({
        class: classId,
        academicYear: classData.academicYear,
        createdBy: userId
      });
    }
    
    // Create task
    const taskData = {
      title,
      description,
      subject,
      dueDate: new Date(dueDate),
      assignedBy: userId,
      priority: priority || 'medium',
      attachments: attachments || [],
      reminderDate: reminderDate ? new Date(reminderDate) : undefined
    };
    
    // Add task
    await schedule.addTask(taskData);
    
    // Populate assigned by info
    const populatedSchedule = await Schedule.findOne({ class: classId })
      .populate('tasks.assignedBy', 'name email profilePicture');
    
    const newTask = populatedSchedule.tasks[populatedSchedule.tasks.length - 1];
    
    res.status(201).json({
      success: true,
      message: 'Task added successfully',
      task: newTask
    });
  } catch (error) {
    console.error('Add task error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while adding task',
      error: error.message
    });
  }
};

// Complete task
const completeTask = async (req, res) => {
  try {
    const { classId, taskId } = req.params;
    const userId = req.user._id;
    
    // Get schedule
    const schedule = await Schedule.findOne({ class: classId });
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }
    
    // Find task
    const task = schedule.tasks.id(taskId);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // Complete task
    await schedule.completeTask(taskId, userId);
    
    res.status(200).json({
      success: true,
      message: 'Task marked as completed'
    });
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while completing task',
      error: error.message
    });
  }
};

// Get day schedule
const getDaySchedule = async (req, res) => {
  try {
    const { classId } = req.params;
    const { dayOfWeek } = req.query;
    
    // Validate day of week
    if (dayOfWeek === undefined || dayOfWeek < 0 || dayOfWeek > 6) {
      return res.status(400).json({
        success: false,
        message: 'Valid day of week (0-6) is required'
      });
    }
    
    // Get schedule
    const schedule = await Schedule.findOne({ class: classId })
      .populate('regularItems.teacher', 'name email profilePicture');
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }
    
    // Get day schedule
    const daySchedule = schedule.getDaySchedule(parseInt(dayOfWeek));
    
    res.status(200).json({
      success: true,
      daySchedule
    });
  } catch (error) {
    console.error('Get day schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching day schedule',
      error: error.message
    });
  }
};

// Get upcoming tasks
const getUpcomingTasks = async (req, res) => {
  try {
    const { classId } = req.params;
    const { days } = req.query;
    
    // Get schedule
    const schedule = await Schedule.findOne({ class: classId })
      .populate('tasks.assignedBy', 'name email profilePicture');
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }
    
    // Get upcoming tasks
    const upcomingTasks = schedule.getUpcomingTasks(days ? parseInt(days) : 7);
    
    res.status(200).json({
      success: true,
      tasks: upcomingTasks
    });
  } catch (error) {
    console.error('Get upcoming tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching upcoming tasks',
      error: error.message
    });
  }
};

// Update regular schedule item
const updateRegularScheduleItem = async (req, res) => {
  try {
    const { classId, itemId } = req.params;
    const { 
      title, type, subject, teacherId, dayOfWeek, 
      startTime, endTime, location, description, color 
    } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Get schedule
    const schedule = await Schedule.findOne({ class: classId });
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }
    
    // Find schedule item
    const scheduleItem = schedule.regularItems.id(itemId);
    
    if (!scheduleItem) {
      return res.status(404).json({
        success: false,
        message: 'Schedule item not found'
      });
    }
    
    // Check if user has permission to update schedule items
    const hasAdminAccess = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CLASS_TEACHER, ROLES.TEACHER].includes(userRole);
    const isClassSecretary = userRole === ROLES.SECRETARY && req.user.class?.toString() === classId;
    const isCreator = scheduleItem.createdBy?.toString() === userId.toString();
    
    if (!hasAdminAccess && !isClassSecretary && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this schedule item'
      });
    }
    
    // Update fields
    if (title) scheduleItem.title = title;
    if (type) scheduleItem.type = type;
    if (subject !== undefined) scheduleItem.subject = subject;
    if (teacherId !== undefined) scheduleItem.teacher = teacherId;
    if (dayOfWeek !== undefined) scheduleItem.dayOfWeek = dayOfWeek;
    if (startTime) scheduleItem.startTime = startTime;
    if (endTime) scheduleItem.endTime = endTime;
    if (location !== undefined) scheduleItem.location = location;
    if (description !== undefined) scheduleItem.description = description;
    if (color) scheduleItem.color = color;
    
    schedule.lastUpdatedBy = userId;
    
    await schedule.save();
    
    // Populate teacher info
    const populatedSchedule = await Schedule.findOne({ class: classId })
      .populate('regularItems.teacher', 'name email profilePicture');
    
    const updatedItem = populatedSchedule.regularItems.id(itemId);
    
    res.status(200).json({
      success: true,
      message: 'Schedule item updated successfully',
      scheduleItem: updatedItem
    });
  } catch (error) {
    console.error('Update regular schedule item error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating schedule item',
      error: error.message
    });
  }
};

// Delete regular schedule item
const deleteRegularScheduleItem = async (req, res) => {
  try {
    const { classId, itemId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Get schedule
    const schedule = await Schedule.findOne({ class: classId });
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }
    
    // Find schedule item
    const scheduleItem = schedule.regularItems.id(itemId);
    
    if (!scheduleItem) {
      return res.status(404).json({
        success: false,
        message: 'Schedule item not found'
      });
    }
    
    // Check if user has permission to delete schedule items
    const hasAdminAccess = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CLASS_TEACHER].includes(userRole);
    const isCreator = scheduleItem.createdBy?.toString() === userId.toString();
    
    if (!hasAdminAccess && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this schedule item'
      });
    }
    
    // Remove schedule item
    schedule.regularItems = schedule.regularItems.filter(item => item._id.toString() !== itemId);
    schedule.lastUpdatedBy = userId;
    
    await schedule.save();
    
    res.status(200).json({
      success: true,
      message: 'Schedule item deleted successfully'
    });
  } catch (error) {
    console.error('Delete regular schedule item error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting schedule item',
      error: error.message
    });
  }
};

module.exports = {
  getClassSchedule,
  addRegularScheduleItem,
  addSpecialScheduleItem,
  addTask,
  completeTask,
  getDaySchedule,
  getUpcomingTasks,
  updateRegularScheduleItem,
  deleteRegularScheduleItem
};

