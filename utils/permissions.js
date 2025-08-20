const { ROLES } = require('../models/User');

// Check if user has admin access
const hasAdminAccess = (userRole) => {
  return [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(userRole);
};

// Check if user has teacher access
const hasTeacherAccess = (userRole) => {
  return [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.CLASS_TEACHER].includes(userRole);
};

// Check if user is a class officer
const isClassOfficer = (userRole) => {
  return [
    ROLES.CLASS_PRESIDENT,
    ROLES.VICE_PRESIDENT,
    ROLES.TREASURER,
    ROLES.SECRETARY
  ].includes(userRole);
};

// Check if user belongs to a class
const belongsToClass = (userClassId, classId) => {
  return userClassId && userClassId.toString() === classId.toString();
};

// Check if user can manage class structure
const canManageClassStructure = (userRole, userClassId, classId) => {
  return (
    hasAdminAccess(userRole) ||
    (userRole === ROLES.CLASS_TEACHER && belongsToClass(userClassId, classId))
  );
};

// Check if user can manage class finances
const canManageFinances = (userRole, userClassId, classId) => {
  return (
    hasAdminAccess(userRole) ||
    (userRole === ROLES.CLASS_TEACHER && belongsToClass(userClassId, classId)) ||
    (userRole === ROLES.TREASURER && belongsToClass(userClassId, classId))
  );
};

// Check if user can view class finances
const canViewFinances = (userRole, userClassId, classId, privacySettings) => {
  const isClassMember = belongsToClass(userClassId, classId);
  const { financeVisibility } = privacySettings;
  
  return (
    hasAdminAccess(userRole) ||
    (userRole === ROLES.CLASS_TEACHER && isClassMember) ||
    (userRole === ROLES.TREASURER && isClassMember) ||
    (isClassMember && financeVisibility === 'class_only') ||
    (financeVisibility === 'school') ||
    (financeVisibility === 'public')
  );
};

// Check if user can manage tasks
const canManageTasks = (userRole, userClassId, classId) => {
  return (
    hasTeacherAccess(userRole) ||
    (userRole === ROLES.SECRETARY && belongsToClass(userClassId, classId))
  );
};

// Check if user can add members to group chat
const canAddGroupMembers = (userRole, userClassId, classId, isGroupAdmin) => {
  return (
    hasAdminAccess(userRole) ||
    isGroupAdmin ||
    (userRole === ROLES.CLASS_PRESIDENT && belongsToClass(userClassId, classId)) ||
    (userRole === ROLES.VICE_PRESIDENT && belongsToClass(userClassId, classId))
  );
};

// Check if vice president needs approval
const vicePresidentNeedsApproval = (classData, action) => {
  // This would be implemented based on class settings
  // For now, we'll return false (no approval needed)
  return false;
};

module.exports = {
  hasAdminAccess,
  hasTeacherAccess,
  isClassOfficer,
  belongsToClass,
  canManageClassStructure,
  canManageFinances,
  canViewFinances,
  canManageTasks,
  canAddGroupMembers,
  vicePresidentNeedsApproval
};

