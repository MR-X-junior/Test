const Finance = require('../models/Finance');
const Class = require('../models/Class');
const { User, ROLES } = require('../models/User');

// Get class finance
const getClassFinance = async (req, res) => {
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
    
    // Check if user has permission to view finances
    const userId = req.user._id;
    const userRole = req.user.role;
    const userClass = req.user.class?.toString();
    
    // Super admin, admin, and class teacher can view any class finances
    const hasAdminAccess = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CLASS_TEACHER].includes(userRole);
    
    // Treasurer can view their class finances
    const isTreasurer = userRole === ROLES.TREASURER && userClass === classId;
    
    // Other class members can view if privacy settings allow
    const isClassMember = userClass === classId;
    const financeVisibility = classData.privacySettings.financeVisibility;
    
    const canViewFinances = 
      hasAdminAccess || 
      isTreasurer || 
      (isClassMember && financeVisibility === 'class_only') ||
      (financeVisibility === 'school') ||
      (financeVisibility === 'public');
    
    if (!canViewFinances) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view class finances'
      });
    }
    
    // Get finance data
    let finance = await Finance.findOne({ class: classId })
      .populate('transactions.recordedBy', 'name email')
      .populate('transactions.approvedBy', 'name email')
      .populate('createdBy', 'name email')
      .populate('lastUpdatedBy', 'name email');
    
    // If finance record doesn't exist, create it
    if (!finance) {
      finance = new Finance({
        class: classId,
        createdBy: userId
      });
      
      await finance.save();
    }
    
    res.status(200).json({
      success: true,
      finance
    });
  } catch (error) {
    console.error('Get class finance error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching class finances',
      error: error.message
    });
  }
};

// Add transaction
const addTransaction = async (req, res) => {
  try {
    const { classId } = req.params;
    const { type, amount, description, category, date, attachments, notes } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Validate transaction type
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Transaction type must be either income or expense'
      });
    }
    
    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number'
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
    
    // Check if user has permission to add transactions
    const isTreasurer = userRole === ROLES.TREASURER && req.user.class?.toString() === classId;
    const isClassTeacher = userRole === ROLES.CLASS_TEACHER && req.user.class?.toString() === classId;
    const isAdmin = [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(userRole);
    
    if (!isTreasurer && !isClassTeacher && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to add transactions'
      });
    }
    
    // Get finance record
    let finance = await Finance.findOne({ class: classId });
    
    // If finance record doesn't exist, create it
    if (!finance) {
      finance = new Finance({
        class: classId,
        createdBy: userId
      });
    }
    
    // Create transaction
    const transaction = {
      type,
      amount,
      description,
      category,
      date: date || new Date(),
      recordedBy: userId,
      attachments: attachments || [],
      notes,
      status: isAdmin || isClassTeacher ? 'approved' : 'pending',
    };
    
    // If admin or class teacher, auto-approve the transaction
    if (isAdmin || isClassTeacher) {
      transaction.approvedBy = userId;
      transaction.approvedAt = new Date();
    }
    
    // Add transaction
    await finance.addTransaction(transaction);
    
    res.status(201).json({
      success: true,
      message: 'Transaction added successfully',
      transaction,
      finance
    });
  } catch (error) {
    console.error('Add transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while adding transaction',
      error: error.message
    });
  }
};

// Approve transaction
const approveTransaction = async (req, res) => {
  try {
    const { classId, transactionId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Check if class exists
    const classData = await Class.findById(classId);
    
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    // Check if user has permission to approve transactions
    const isClassTeacher = userRole === ROLES.CLASS_TEACHER && req.user.class?.toString() === classId;
    const isAdmin = [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(userRole);
    
    if (!isClassTeacher && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to approve transactions'
      });
    }
    
    // Get finance record
    const finance = await Finance.findOne({ class: classId });
    
    if (!finance) {
      return res.status(404).json({
        success: false,
        message: 'Finance record not found'
      });
    }
    
    // Approve transaction
    await finance.approveTransaction(transactionId, userId);
    
    res.status(200).json({
      success: true,
      message: 'Transaction approved successfully',
      finance
    });
  } catch (error) {
    console.error('Approve transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while approving transaction',
      error: error.message
    });
  }
};

// Reject transaction
const rejectTransaction = async (req, res) => {
  try {
    const { classId, transactionId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Check if class exists
    const classData = await Class.findById(classId);
    
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    // Check if user has permission to reject transactions
    const isClassTeacher = userRole === ROLES.CLASS_TEACHER && req.user.class?.toString() === classId;
    const isAdmin = [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(userRole);
    
    if (!isClassTeacher && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to reject transactions'
      });
    }
    
    // Get finance record
    const finance = await Finance.findOne({ class: classId });
    
    if (!finance) {
      return res.status(404).json({
        success: false,
        message: 'Finance record not found'
      });
    }
    
    // Reject transaction
    await finance.rejectTransaction(transactionId, userId);
    
    res.status(200).json({
      success: true,
      message: 'Transaction rejected successfully',
      finance
    });
  } catch (error) {
    console.error('Reject transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while rejecting transaction',
      error: error.message
    });
  }
};

// Get transaction categories
const getTransactionCategories = async (req, res) => {
  try {
    const { classId } = req.params;
    
    // Get finance record
    const finance = await Finance.findOne({ class: classId });
    
    if (!finance) {
      return res.status(404).json({
        success: false,
        message: 'Finance record not found'
      });
    }
    
    res.status(200).json({
      success: true,
      categories: finance.categories
    });
  } catch (error) {
    console.error('Get transaction categories error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching categories',
      error: error.message
    });
  }
};

// Add transaction category
const addTransactionCategory = async (req, res) => {
  try {
    const { classId } = req.params;
    const { name, type, description } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Validate category type
    if (type && !['income', 'expense', 'both'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Category type must be income, expense, or both'
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
    
    // Check if user has permission to add categories
    const isTreasurer = userRole === ROLES.TREASURER && req.user.class?.toString() === classId;
    const isClassTeacher = userRole === ROLES.CLASS_TEACHER && req.user.class?.toString() === classId;
    const isAdmin = [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(userRole);
    
    if (!isTreasurer && !isClassTeacher && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to add categories'
      });
    }
    
    // Get finance record
    let finance = await Finance.findOne({ class: classId });
    
    // If finance record doesn't exist, create it
    if (!finance) {
      finance = new Finance({
        class: classId,
        createdBy: userId
      });
    }
    
    // Check if category already exists
    const categoryExists = finance.categories.some(
      category => category.name.toLowerCase() === name.toLowerCase()
    );
    
    if (categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }
    
    // Add category
    finance.categories.push({
      name,
      type: type || 'both',
      description
    });
    
    finance.lastUpdatedBy = userId;
    
    await finance.save();
    
    res.status(201).json({
      success: true,
      message: 'Category added successfully',
      categories: finance.categories
    });
  } catch (error) {
    console.error('Add transaction category error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while adding category',
      error: error.message
    });
  }
};

// Get finance summary
const getFinanceSummary = async (req, res) => {
  try {
    const { classId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Get finance record
    const finance = await Finance.findOne({ class: classId });
    
    if (!finance) {
      return res.status(404).json({
        success: false,
        message: 'Finance record not found'
      });
    }
    
    // Filter transactions by date if provided
    let transactions = finance.transactions;
    
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();
      
      transactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= start && transactionDate <= end;
      });
    }
    
    // Calculate summary
    const approvedTransactions = transactions.filter(t => t.status === 'approved');
    const pendingTransactions = transactions.filter(t => t.status === 'pending');
    const rejectedTransactions = transactions.filter(t => t.status === 'rejected');
    
    const totalIncome = approvedTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = approvedTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const pendingIncome = pendingTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const pendingExpenses = pendingTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Group by category
    const categorySummary = {};
    
    approvedTransactions.forEach(transaction => {
      const { category, type, amount } = transaction;
      
      if (!categorySummary[category]) {
        categorySummary[category] = {
          income: 0,
          expense: 0
        };
      }
      
      categorySummary[category][type] += amount;
    });
    
    res.status(200).json({
      success: true,
      summary: {
        balance: finance.balance,
        totalIncome,
        totalExpenses,
        pendingIncome,
        pendingExpenses,
        netBalance: totalIncome - totalExpenses,
        pendingBalance: pendingIncome - pendingExpenses,
        transactionCounts: {
          approved: approvedTransactions.length,
          pending: pendingTransactions.length,
          rejected: rejectedTransactions.length,
          total: transactions.length
        },
        categorySummary
      }
    });
  } catch (error) {
    console.error('Get finance summary error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while generating summary',
      error: error.message
    });
  }
};

module.exports = {
  getClassFinance,
  addTransaction,
  approveTransaction,
  rejectTransaction,
  getTransactionCategories,
  addTransactionCategory,
  getFinanceSummary
};

