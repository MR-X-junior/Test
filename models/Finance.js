const mongoose = require('mongoose');

// Schema for individual transactions
const TransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be a positive number']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  category: {
    type: String,
    trim: true,
    required: [true, 'Category is required']
  },
  date: {
    type: Date,
    default: Date.now
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attachments: [{
    type: String, // URL to receipt or other document
    trim: true
  }],
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true
  }
}, { timestamps: true });

// Main finance schema for a class
const FinanceSchema = new mongoose.Schema({
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  balance: {
    type: Number,
    default: 0
  },
  transactions: [TransactionSchema],
  categories: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['income', 'expense', 'both'],
      default: 'both'
    },
    description: {
      type: String,
      trim: true
    }
  }],
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

// Method to add a transaction and update balance
FinanceSchema.methods.addTransaction = async function(transactionData) {
  const transaction = {
    ...transactionData,
    date: transactionData.date || new Date()
  };
  
  // If transaction is approved, update balance
  if (transaction.status === 'approved') {
    if (transaction.type === 'income') {
      this.balance += transaction.amount;
    } else if (transaction.type === 'expense') {
      this.balance -= transaction.amount;
    }
  }
  
  this.transactions.push(transaction);
  this.lastUpdatedBy = transaction.recordedBy;
  
  return this.save();
};

// Method to approve a transaction
FinanceSchema.methods.approveTransaction = async function(transactionId, approverId) {
  const transaction = this.transactions.id(transactionId);
  
  if (!transaction) {
    throw new Error('Transaction not found');
  }
  
  if (transaction.status !== 'pending') {
    throw new Error('Transaction is already processed');
  }
  
  transaction.status = 'approved';
  transaction.approvedBy = approverId;
  transaction.approvedAt = new Date();
  
  // Update balance
  if (transaction.type === 'income') {
    this.balance += transaction.amount;
  } else if (transaction.type === 'expense') {
    this.balance -= transaction.amount;
  }
  
  this.lastUpdatedBy = approverId;
  
  return this.save();
};

// Method to reject a transaction
FinanceSchema.methods.rejectTransaction = async function(transactionId, approverId) {
  const transaction = this.transactions.id(transactionId);
  
  if (!transaction) {
    throw new Error('Transaction not found');
  }
  
  if (transaction.status !== 'pending') {
    throw new Error('Transaction is already processed');
  }
  
  transaction.status = 'rejected';
  transaction.approvedBy = approverId;
  transaction.approvedAt = new Date();
  
  this.lastUpdatedBy = approverId;
  
  return this.save();
};

// Method to get total income
FinanceSchema.methods.getTotalIncome = function() {
  return this.transactions
    .filter(t => t.type === 'income' && t.status === 'approved')
    .reduce((sum, t) => sum + t.amount, 0);
};

// Method to get total expenses
FinanceSchema.methods.getTotalExpenses = function() {
  return this.transactions
    .filter(t => t.type === 'expense' && t.status === 'approved')
    .reduce((sum, t) => sum + t.amount, 0);
};

module.exports = mongoose.models.Finance || mongoose.model('Finance', FinanceSchema);

