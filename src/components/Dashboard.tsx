import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Receipt, 
  CreditCard, 
  Calendar, 
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Target,
  Award,
  Plus,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Shield,
  Bell,
  CheckCircle
} from 'lucide-react';
import { useDatabase } from '../hooks/useDatabase';
import { useAuth } from '../contexts/AuthContext';
import { format, startOfMonth, endOfMonth, subMonths, isToday } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

interface DashboardProps {
  onPageChange: (page: string) => void;
  onOpenForm: (formType: 'receipt' | 'client' | 'expense') => void;
}

export default function Dashboard({ onPageChange, onOpenForm }: DashboardProps) {
  const { receipts, expenses, clients, employees, attendance } = useDatabase();
  const { user } = useAuth();

  // Calculate statistics
  const totalRevenue = receipts.reduce((sum, receipt) => sum + (receipt.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  const activeClients = clients.length;
  const activeEmployees = employees.filter(emp => emp.status === 'active').length;

  // Monthly data
  const thisMonth = receipts.filter(r => 
    format(r.date, 'yyyy-MM') === format(new Date(), 'yyyy-MM')
  ).reduce((sum, r) => sum + r.amount, 0);

  const lastMonth = receipts.filter(r => 
    format(r.date, 'yyyy-MM') === format(subMonths(new Date(), 1), 'yyyy-MM')
  ).reduce((sum, r) => sum + r.amount, 0);

  const monthlyGrowth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

  // Recent data
  const recentReceipts = receipts.slice(0, 5);
  const recentExpenses = expenses.slice(0, 5);

  // Chart data
  const monthlyData = React.useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      const monthReceipts = receipts.filter(r => 
        r.date >= monthStart && r.date <= monthEnd
      );
      const monthExpenses = expenses.filter(e => 
        e.date >= monthStart && e.date <= monthEnd
      );
      
      const revenue = monthReceipts.reduce((sum, r) => sum + r.amount, 0);
      const expense = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
      
      months.push({
        month: format(monthDate, 'MMM'),
        revenue,
        expenses: expense,
        profit: revenue - expense
      });
    }
    return months;
  }, [receipts, expenses]);

  // Client type distribution
  const clientTypeData = React.useMemo(() => {
    const types = clients.reduce((acc, client) => {
      acc[client.type] = (acc[client.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(types).map(([name, value]) => ({
      name,
      value
    }));
  }, [clients]);

  // Today's attendance for employees
  const todayAttendance = attendance.filter(a => isToday(a.date));
  const presentToday = todayAttendance.filter(a => a.status === 'present').length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
            Welcome back, {user?.username}! Here's your business overview.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onOpenForm('receipt')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <Plus size={18} />
            New Receipt
          </button>
          <button
            onClick={() => onOpenForm('expense')}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <Plus size={18} />
            New Expense
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 dashboard-metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold mt-2">PKR {totalRevenue.toLocaleString('en-PK')}</p>
              <div className="flex items-center mt-2">
                {monthlyGrowth >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-green-300 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-300 mr-1" />
                )}
                <span className="text-blue-100 text-sm">
                  {monthlyGrowth >= 0 ? '+' : ''}{monthlyGrowth.toFixed(1)}% from last month
                </span>
              </div>
            </div>
            <DollarSign size={32} className="text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 dashboard-metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Net Profit</p>
              <p className="text-3xl font-bold mt-2">PKR {netProfit.toLocaleString('en-PK')}</p>
              <p className="text-green-100 text-sm mt-2">
                {totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0}% profit margin
              </p>
            </div>
            <TrendingUp size={32} className="text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 dashboard-metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Active Clients</p>
              <p className="text-3xl font-bold mt-2">{activeClients}</p>
              <p className="text-purple-100 text-sm mt-2">
                {new Set(receipts.map(r => r.clientCnic)).size} paying clients
              </p>
            </div>
            <Users size={32} className="text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 dashboard-metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">This Month</p>
              <p className="text-3xl font-bold mt-2">PKR {thisMonth.toLocaleString('en-PK')}</p>
              <p className="text-orange-100 text-sm mt-2">
                {receipts.filter(r => format(r.date, 'yyyy-MM') === format(new Date(), 'yyyy-MM')).length} receipts
              </p>
            </div>
            <Calendar size={32} className="text-orange-200" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Revenue Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              Revenue vs Expenses
            </h3>
            <button
              onClick={() => onPageChange('analytics')}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1"
            >
              View Details <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#d1d5db' }}
                tickFormatter={(value) => `${(value / 1000)}K`}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `PKR ${value.toLocaleString('en-PK')}`, 
                  name === 'revenue' ? 'Revenue' : name === 'expenses' ? 'Expenses' : 'Profit'
                ]}
                contentStyle={{ 
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#EF4444" name="Expenses" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Client Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <PieChart className="w-6 h-6 text-purple-600" />
              Client Types
            </h3>
            <button
              onClick={() => onPageChange('clients')}
              className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-medium flex items-center gap-1"
            >
              Manage Clients <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          {clientTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={clientTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {clientTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [value, 'Clients']}
                  contentStyle={{ 
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-80">
              <div className="text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No client data available</p>
                <button
                  onClick={() => onOpenForm('client')}
                  className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Add First Client
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-600" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => onOpenForm('receipt')}
              className="w-full flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-all duration-300 hover:scale-105 border border-blue-200 dark:border-blue-800"
            >
              <Receipt className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-700 dark:text-blue-300">Create Receipt</span>
            </button>
            <button
              onClick={() => onOpenForm('client')}
              className="w-full flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-xl transition-all duration-300 hover:scale-105 border border-green-200 dark:border-green-800"
            >
              <Users className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-700 dark:text-green-300">Add Client</span>
            </button>
            <button
              onClick={() => onOpenForm('expense')}
              className="w-full flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-all duration-300 hover:scale-105 border border-red-200 dark:border-red-800"
            >
              <CreditCard className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-700 dark:text-red-300">Record Expense</span>
            </button>
            <button
              onClick={() => onPageChange('tax-calculator')}
              className="w-full flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-xl transition-all duration-300 hover:scale-105 border border-purple-200 dark:border-purple-800"
            >
              <Target className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-700 dark:text-purple-300">Tax Calculator</span>
            </button>
          </div>
        </div>

        {/* Recent Receipts */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-6 h-6 text-green-600" />
              Recent Receipts
            </h3>
            <button
              onClick={() => onPageChange('receipts')}
              className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {recentReceipts.length > 0 ? (
              recentReceipts.map((receipt) => (
                <div key={receipt.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{receipt.clientName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{format(receipt.date, 'MMM dd, yyyy')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 dark:text-green-400 text-sm">
                      PKR {receipt.amount.toLocaleString('en-PK')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {receipt.paymentMethod.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">No receipts yet</p>
                <button
                  onClick={() => onOpenForm('receipt')}
                  className="mt-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Create First Receipt
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-red-600" />
              Recent Expenses
            </h3>
            <button
              onClick={() => onPageChange('expenses')}
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {recentExpenses.length > 0 ? (
              recentExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{expense.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{format(expense.date, 'MMM dd, yyyy')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600 dark:text-red-400 text-sm">
                      PKR {expense.amount.toLocaleString('en-PK')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {expense.category}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">No expenses yet</p>
                <button
                  onClick={() => onOpenForm('expense')}
                  className="mt-2 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Record First Expense
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Receipts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{receipts.length}</p>
            </div>
            <Receipt className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{expenses.length}</p>
            </div>
            <CreditCard className="w-8 h-8 text-red-500" />
          </div>
        </div>

        {user?.role === 'admin' && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Employees</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeEmployees}</p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Present Today</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{presentToday}</p>
                </div>
                <Clock className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </>
        )}

        {user?.role === 'employee' && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">My Attendance</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {attendance.filter(a => a.employeeId === user.id && isToday(a.date)).length > 0 ? 'Marked' : 'Pending'}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tasks Status</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">Active</p>
                </div>
                <Target className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Performance Insights */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl p-8 shadow-2xl">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Award className="w-6 h-6" />
          Business Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm border border-white/30">
            <p className="text-indigo-100 text-sm">Average Receipt</p>
            <p className="text-2xl font-bold">
              PKR {receipts.length > 0 ? Math.round(totalRevenue / receipts.length).toLocaleString('en-PK') : 0}
            </p>
          </div>
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm border border-white/30">
            <p className="text-indigo-100 text-sm">Monthly Growth</p>
            <p className="text-2xl font-bold">
              {monthlyGrowth >= 0 ? '+' : ''}{monthlyGrowth.toFixed(1)}%
            </p>
          </div>
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm border border-white/30">
            <p className="text-indigo-100 text-sm">Client Retention</p>
            <p className="text-2xl font-bold">
              {((new Set(receipts.map(r => r.clientCnic)).size / Math.max(activeClients, 1)) * 100).toFixed(0)}%
            </p>
          </div>
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm border border-white/30">
            <p className="text-indigo-100 text-sm">Profit Margin</p>
            <p className="text-2xl font-bold">
              {totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600" />
          System Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Firebase Sync</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Connected & Active</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Database</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Operational</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Security</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">All Systems Secure</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}