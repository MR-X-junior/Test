const classes = [
  {
    name: 'Class 10A',
    grade: '10',
    academicYear: '2023-2024',
    description: 'A sample class for demonstration purposes',
    privacySettings: {
      financeVisibility: 'class_only',
      galleryVisibility: 'class_only',
      scheduleVisibility: 'class_only'
    }
  },
  {
    name: 'Class 11B',
    grade: '11',
    academicYear: '2023-2024',
    description: 'Science stream class focusing on physics, chemistry, and mathematics',
    privacySettings: {
      financeVisibility: 'class_only',
      galleryVisibility: 'public',
      scheduleVisibility: 'school'
    }
  },
  {
    name: 'Class 9C',
    grade: '9',
    academicYear: '2023-2024',
    description: 'Junior class with a focus on building strong fundamentals',
    privacySettings: {
      financeVisibility: 'class_only',
      galleryVisibility: 'school',
      scheduleVisibility: 'public'
    }
  }
];

module.exports = classes;

