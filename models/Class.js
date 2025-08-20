const mongoose = require('mongoose');

const ClassStructureSchema = new mongoose.Schema({
  position: {
    type: String,
    required: true,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  description: {
    type: String,
    trim: true
  }
});

const ClassSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a class name'],
    trim: true,
    maxlength: [100, 'Class name cannot be more than 100 characters']
  },
  grade: {
    type: String,
    required: [true, 'Please provide a grade level'],
    trim: true
  },
  academicYear: {
    type: String,
    required: [true, 'Please provide an academic year'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  classTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  structure: [ClassStructureSchema],
  schedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule'
  },
  classImage: {
    type: String,
    default: 'https://res.cloudinary.com/demo/image/upload/v1580125392/samples/landscapes/default-class.jpg'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  privacySettings: {
    financeVisibility: {
      type: String,
      enum: ['class_only', 'school', 'public'],
      default: 'class_only'
    },
    galleryVisibility: {
      type: String,
      enum: ['class_only', 'school', 'public'],
      default: 'class_only'
    },
    scheduleVisibility: {
      type: String,
      enum: ['class_only', 'school', 'public'],
      default: 'class_only'
    }
  }
}, { timestamps: true });

// Virtual for getting class president
ClassSchema.virtual('classPresident').get(function() {
  const president = this.structure.find(position => 
    position.position.toLowerCase() === 'class president' || 
    position.position.toLowerCase() === 'president'
  );
  return president ? president.user : null;
});

// Virtual for getting vice president
ClassSchema.virtual('vicePresident').get(function() {
  const vicePresident = this.structure.find(position => 
    position.position.toLowerCase() === 'vice president' || 
    position.position.toLowerCase() === 'vice-president'
  );
  return vicePresident ? vicePresident.user : null;
});

// Virtual for getting treasurer
ClassSchema.virtual('treasurer').get(function() {
  const treasurer = this.structure.find(position => 
    position.position.toLowerCase() === 'treasurer'
  );
  return treasurer ? treasurer.user : null;
});

// Virtual for getting secretary
ClassSchema.virtual('secretary').get(function() {
  const secretary = this.structure.find(position => 
    position.position.toLowerCase() === 'secretary'
  );
  return secretary ? secretary.user : null;
});

module.exports = mongoose.models.Class || mongoose.model('Class', ClassSchema);

