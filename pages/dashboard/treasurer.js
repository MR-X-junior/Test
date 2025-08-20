import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/dashboard/Layout';
import { FaMoneyBillWave, FaArrowUp, FaArrowDown, FaChartPie, FaClipboardList } from 'react-icons/fa';

export default function TreasurerDashboard() {
  const [stats, setStats] = useState({
    balance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    pendingTransactions: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real application, these would be actual API calls
        // For now, we'll simulate the data
        
        // Simulate stats
        setStats({
          balance: 550,
          totalIncome: 800,
          totalExpenses: 250,
          pendingTransactions: 2
        });
        
        // Simulate recent transactions
        setRecentTransactions([
          {
            id: 1,
            type: 'income',
            amount: 500,
            description: 'Monthly class dues collection',
            category: 'Class Dues',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            status: 'approved'
          },
          {
            id: 2,
            type: 'expense',
            amount: 150,
            description: 'Classroom decorations',
            category: 'Supplies',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            status: 'approved'
          },
          {
            id: 3,
            type: 'income',
            amount: 200,
            description: 'Donation from parent association',
            category: 'Donations',
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            status: 'approved'
          },
          {
            id: 4,
            type: 'expense',
            amount: 100,
            description: 'Class event supplies',
            category: 'Events',
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            status: 'pending'
          }
        ]);
      } catch (error) {
        console.error('Error fetching treasurer dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <DashboardLayout title="Treasurer Dashboard">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <FaMoneyBillWave className="text-blue-500 text-xl" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Current Balance</h3>
                <p className="text-2xl font-semibold">${stats.balance}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <FaArrowUp className="text-green-500 text-xl" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Total Income</h3>
                <p className="text-2xl font-semibold">${stats.totalIncome}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
              <div className="rounded-full bg-red-100 p-3 mr-4">
                <FaArrowDown className="text-red-500 text-xl" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Total Expenses</h3>
                <p className="text-2xl font-semibold">${stats.totalExpenses}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
              <div className="rounded-full bg-yellow-100 p-3 mr-4">
                <FaClipboardList className="text-yellow-500 text-xl" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Pending Transactions</h3>
                <p className="text-2xl font-semibold">{stats.pendingTransactions}</p>
              </div>
            </div>
          </div>
          
          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">Date</th>
                    <th className="py-3 px-6 text-left">Description</th>
                    <th className="py-3 px-6 text-left">Category</th>
                    <th className="py-3 px-6 text-right">Amount</th>
                    <th className="py-3 px-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm">
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-6 text-left whitespace-nowrap">
                        {transaction.date.toLocaleDateString()}
                      </td>
                      <td className="py-3 px-6 text-left">
                        {transaction.description}
                      </td>
                      <td className="py-3 px-6 text-left">
                        {transaction.category}
                      </td>
                      <td className={`py-3 px-6 text-right ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {recentTransactions.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No transactions found
              </div>
            )}
            
            <div className="mt-4">
              <button className="text-blue-500 hover:text-blue-700 text-sm font-semibold">
                View All Transactions →
              </button>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded">
                  Record Income
                </button>
                <button className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded">
                  Record Expense
                </button>
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
                  Generate Report
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
              <h3 className="font-semibold mb-4">Financial Summary</h3>
              <div className="flex items-center justify-center h-48">
                <div className="text-center">
                  <FaChartPie className="text-6xl text-blue-500 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Income vs Expenses Chart would be displayed here
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

