const Class = require('../models/Class');
const { User, ROLES } = require('../models/User');
const Schedule = require('../models/Schedule');
const Finance = require('../models/Finance');
const { Gallery } = require('../models/Gallery');

// Create a new class
const createClass = async (req, res) => {
  try {
    const { name, grade, academicYear, description, classTeacherId } = req.body;
    
    // Create new class
    const newClass = new Class({
      name,
      grade,
      academicYear,
      description,
      classTeacher: classTeacherId,
      createdBy: req.user._id
    });
    
    await newClass.save();
    
    // Create schedule for the class
    const schedule = new Schedule({
      class: newClass._id,
      academicYear,
      createdBy: req.user._id
    });
    
    await schedule.save();
    
    // Create finance record for the class
    const finance = new Finance({
      class: newClass._id,
      createdBy: req.user._id
    });
    
    await finance.save();
    
    // Create gallery for the class
    const gallery = new Gallery({
      class: newClass._id,
      createdBy: req.user._id
    });
    
    await gallery.save();
    
    // Update class with schedule
    newClass.schedule = schedule._id;
    await newClass.save();
    
    // If class teacher is specified, update their role and class
    if (classTeacherId) {
      await User.findByIdAndUpdate(classTeacherId, {
        role: ROLES.CLASS_TEACHER,
        class: newClass._id
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      class: newClass
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while creating class',
      error: error.message
    });
  }
};

// Get all classes
const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate('classTeacher', 'name email profilePicture')
      .populate('createdBy', 'name email');
    
    res.status(200).json({
      success: true,
      count: classes.length,
      classes
    });
  } catch (error) {
    console.error('Get all classes error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching classes',
      error: error.message
    });
  }
};

// Get a single class by ID
const getClassById = async (req, res) => {
  try {
    const classId = req.params.classId;
    
    const classData = await Class.findById(classId)
      .populate('classTeacher', 'name email profilePicture')
      .populate('students', 'name email profilePicture role')
      .populate('createdBy', 'name email')
      .populate('schedule');
    
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    res.status(200).json({
      success: true,
      class: classData
    });
  } catch (error) {
    console.error('Get class by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching class',
      error: error.message
    });
  }
};

// Update class details
const updateClass = async (req, res) => {
  try {
    const classId = req.params.classId;
    const { name, grade, academicYear, description, classTeacherId, classImage } = req.body;
    
    const classData = await Class.findById(classId);
    
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    // Update fields
    if (name) classData.name = name;
    if (grade) classData.grade = grade;
    if (academicYear) classData.academicYear = academicYear;
    if (description) classData.description = description;
    if (classImage) classData.classImage = classImage;
    
    // If class teacher is changed
    if (classTeacherId && classTeacherId !== classData.classTeacher?.toString()) {
      // Update old class teacher role if exists
      if (classData.classTeacher) {
        await User.findByIdAndUpdate(classData.classTeacher, {
          role: ROLES.TEACHER
        });
      }
      
      // Update new class teacher
      await User.findByIdAndUpdate(classTeacherId, {
        role: ROLES.CLASS_TEACHER,
        class: classId
      });
      
      classData.classTeacher = classTeacherId;
    }
    
    await classData.save();
    
    res.status(200).json({
      success: true,
      message: 'Class updated successfully',
      class: classData
    });
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating class',
      error: error.message
    });
  }
};

// Add students to class
const addStudentsToClass = async (req, res) => {
  try {
    const classId = req.params.classId;
    const { studentIds } = req.body;
    
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of student IDs'
      });
    }
    
    const classData = await Class.findById(classId);
    
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    // Add students to class
    for (const studentId of studentIds) {
      // Skip if student is already in class
      if (classData.students.includes(studentId)) continue;
      
      classData.students.push(studentId);
      
      // Update student's class
      await User.findByIdAndUpdate(studentId, {
        class: classId
      });
    }
    
    await classData.save();
    
    res.status(200).json({
      success: true,
      message: 'Students added to class successfully',
      class: classData
    });
  } catch (error) {
    console.error('Add students to class error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while adding students',
      error: error.message
    });
  }
};

// Remove student from class
const removeStudentFromClass = async (req, res) => {
  try {
    const classId = req.params.classId;
    const { studentId } = req.body;
    
    const classData = await Class.findById(classId);
    
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    // Check if student is in class
    if (!classData.students.includes(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Student is not in this class'
      });
    }
    
    // Remove student from class
    classData.students = classData.students.filter(id => id.toString() !== studentId);
    
    // Remove student from class structure if they have a position
    classData.structure = classData.structure.filter(position => 
      position.user?.toString() !== studentId
    );
    
    await classData.save();
    
    // Update student's class
    await User.findByIdAndUpdate(studentId, {
      class: null,
      // Reset role to student if they had a class officer role
      role: ROLES.STUDENT
    });
    
    res.status(200).json({
      success: true,
      message: 'Student removed from class successfully',
      class: classData
    });
  } catch (error) {
    console.error('Remove student from class error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while removing student',
      error: error.message
    });
  }
};

// Update class structure
const updateClassStructure = async (req, res) => {
  try {
    const classId = req.params.classId;
    const { structure } = req.body;
    
    if (!Array.isArray(structure)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of positions'
      });
    }
    
    const classData = await Class.findById(classId);
    
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    // Reset roles for current structure members
    for (const position of classData.structure) {
      if (position.user) {
        await User.findByIdAndUpdate(position.user, {
          role: ROLES.STUDENT
        });
      }
    }
    
    // Update structure and set roles for new positions
    classData.structure = structure;
    
    // Update roles for new structure members
    for (const position of structure) {
      if (!position.user) continue;
      
      const positionLower = position.position.toLowerCase();
      let newRole = ROLES.STUDENT;
      
      if (positionLower.includes('president') && !positionLower.includes('vice')) {
        newRole = ROLES.CLASS_PRESIDENT;
      } else if (positionLower.includes('vice president') || positionLower.includes('vice-president')) {
        newRole = ROLES.VICE_PRESIDENT;
      } else if (positionLower.includes('treasurer')) {
        newRole = ROLES.TREASURER;
      } else if (positionLower.includes('secretary')) {
        newRole = ROLES.SECRETARY;
      }
      
      await User.findByIdAndUpdate(position.user, {
        role: newRole
      });
    }
    
    await classData.save();
    
    res.status(200).json({
      success: true,
      message: 'Class structure updated successfully',
      class: classData
    });
  } catch (error) {
    console.error('Update class structure error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating class structure',
      error: error.message
    });
  }
};

// Update class privacy settings
const updatePrivacySettings = async (req, res) => {
  try {
    const classId = req.params.classId;
    const { financeVisibility, galleryVisibility, scheduleVisibility } = req.body;
    
    const classData = await Class.findById(classId);
    
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    // Update privacy settings
    if (financeVisibility) {
      classData.privacySettings.financeVisibility = financeVisibility;
    }
    
    if (galleryVisibility) {
      classData.privacySettings.galleryVisibility = galleryVisibility;
    }
    
    if (scheduleVisibility) {
      classData.privacySettings.scheduleVisibility = scheduleVisibility;
    }
    
    await classData.save();
    
    res.status(200).json({
      success: true,
      message: 'Privacy settings updated successfully',
      class: classData
    });
  } catch (error) {
    console.error('Update privacy settings error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating privacy settings',
      error: error.message
    });
  }
};

// Get class structure
const getClassStructure = async (req, res) => {
  try {
    const classId = req.params.classId;
    
    const classData = await Class.findById(classId)
      .populate('structure.user', 'name email profilePicture role');
    
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    res.status(200).json({
      success: true,
      structure: classData.structure
    });
  } catch (error) {
    console.error('Get class structure error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching class structure',
      error: error.message
    });
  }
};

// Get students in class
const getClassStudents = async (req, res) => {
  try {
    const classId = req.params.classId;
    
    const classData = await Class.findById(classId)
      .populate('students', 'name email profilePicture role');
    
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    res.status(200).json({
      success: true,
      students: classData.students
    });
  } catch (error) {
    console.error('Get class students error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching class students',
      error: error.message
    });
  }
};

module.exports = {
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
  addStudentsToClass,
  removeStudentFromClass,
  updateClassStructure,
  updatePrivacySettings,
  getClassStructure,
  getClassStudents
};

