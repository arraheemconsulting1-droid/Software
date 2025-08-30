import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Users, 
  Mail, 
  Phone, 
  Calendar, 
  DollarSign,
  X,
  CheckCircle,
  AlertCircle,
  User,
  Building,
  Clock,
  Target,
  CheckSquare,
  Square,
  Send,
  Filter,
  Download
} from 'lucide-react';
import { useDatabase } from '../hooks/useDatabase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { Employee, Task } from '../types';

const EmployeeManagement: React.FC = () => {
  const { 
    employees, 
    createEmployee, 
    updateEmployee, 
    deleteEmployee, 
    tasks,
    createTask,
    updateTask,
    deleteTask,
    getTasksByAssigner,
    loading 
  } = useDatabase();
  const { user, isAdmin } = useAuth();
  
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    salary: '',
    joinDate: format(new Date(), 'yyyy-MM-dd'),
    status: 'active' as 'active' | 'inactive' | 'terminated',
    username: '',
    password: '',
    role: 'employee' as 'employee' | 'manager'
  });

  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    dueDate: ''
  });

  // Safe date formatting utility
  const safeFormat = (date: any, formatStr = 'MMM dd, yyyy') => {
    try {
      if (!date) return '-';
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) return '-';
      return format(dateObj, formatStr);
    } catch {
      return '-';
    }
  };

  // Load assigned tasks when component mounts
  useEffect(() => {
    const loadAssignedTasks = async () => {
      if (user?.id && getTasksByAssigner) {
        try {
          const tasks = await getTasksByAssigner(user.id);
          setAssignedTasks(tasks);
        } catch (error) {
          console.error('Error loading assigned tasks:', error);
          setAssignedTasks([]);
        }
      }
    };
    
    loadAssignedTasks();
  }, [user?.id, getTasksByAssigner]);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      name: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      salary: '',
      joinDate: format(new Date(), 'yyyy-MM-dd'),
      status: 'active',
      username: '',
      password: '',
      role: 'employee'
    });
    setEditingEmployee(null);
  };

  const resetTaskForm = () => {
    setTaskFormData({
      title: '',
      description: '',
      assignedTo: '',
      priority: 'medium',
      dueDate: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdmin) {
      showMessage('Only administrators can manage employees', 'error');
      return;
    }

    try {
      const employeeData = {
        ...formData,
        salary: parseFloat(formData.salary.replace(/,/g, '')) || 0,
        joinDate: new Date(formData.joinDate),
        employeeId: formData.employeeId || `EMP${Date.now()}`
      };

      if (editingEmployee) {
        const updatedEmployee = {
          ...editingEmployee,
          ...employeeData,
          updatedAt: new Date()
        };
        await updateEmployee(updatedEmployee);
        showMessage('Employee updated successfully!', 'success');
      } else {
        await createEmployee({
          ...employeeData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        showMessage('Employee created successfully!', 'success');
      }

      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving employee:', error);
      showMessage('Error saving employee. Please try again.', 'error');
    }
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdmin) {
      showMessage('Only administrators can assign tasks', 'error');
      return;
    }

    try {
      await createTask({
        title: taskFormData.title,
        description: taskFormData.description,
        assignedTo: taskFormData.assignedTo,
        assignedBy: user!.id,
        priority: taskFormData.priority,
        status: 'pending',
        dueDate: taskFormData.dueDate ? new Date(taskFormData.dueDate) : undefined
      });

      resetTaskForm();
      setShowTaskForm(false);
      showMessage('Task assigned successfully!', 'success');

      // Reload assigned tasks
      if (getTasksByAssigner) {
        const tasks = await getTasksByAssigner(user.id);
        setAssignedTasks(tasks);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      showMessage('Error assigning task. Please try again.', 'error');
    }
  };

  const handleEdit = (employee: Employee) => {
    if (!isAdmin) {
      showMessage('Only administrators can edit employees', 'error');
      return;
    }

    setFormData({
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      position: employee.position,
      department: employee.department,
      salary: employee.salary.toString(),
      joinDate: safeFormat(employee.joinDate, 'yyyy-MM-dd'),
      status: employee.status,
      username: employee.username,
      password: employee.password,
      role: employee.role
    });
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!isAdmin) {
      showMessage('Only administrators can delete employees', 'error');
      return;
    }

    if (confirm(`Are you sure you want to delete employee "${name}"?`)) {
      try {
        await deleteEmployee(id);
        showMessage('Employee deleted successfully!', 'success');
      } catch (error) {
        console.error('Error deleting employee:', error);
        showMessage('Error deleting employee', 'error');
      }
    }
  };

  const handleViewDetails = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowDetails(true);
  };

  const handleTaskStatusUpdate = async (task: Task, newStatus: string) => {
    try {
      const updatedTask = {
        ...task,
        status: newStatus,
        updatedAt: new Date(),
        completedAt: newStatus === 'completed' ? new Date() : undefined
      };
      
      await updateTask(updatedTask);
      
      // Update local state
      setAssignedTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));
      
      showMessage(`Task status updated to ${newStatus}`, 'success');
    } catch (error) {
      console.error('Error updating task status:', error);
      showMessage('Error updating task status', 'error');
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = !searchTerm || 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || employee.status === filterStatus;
    const matchesDepartment = !filterDepartment || employee.department === filterDepartment;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'inactive': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'terminated': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default: return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'high': return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'low': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      default: return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'in_progress': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'pending': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'cancelled': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default: return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
    }
  };

  // Get unique departments for filter
  const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
        } animate-slideInRight`}>
          <div className="flex items-center">
            {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
            {message.text}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" />
            Employee Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage employee profiles and assign tasks • {employees.length} total employees
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowTaskForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300 hover:scale-105"
            >
              <Target size={20} />
              Assign Task
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105"
            >
              <Plus size={20} />
              Add Employee
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{employees.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {employees.filter(e => e.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Departments</p>
              <p className="text-2xl font-bold text-purple-600">{departments.length}</p>
            </div>
            <Building className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Salary</p>
              <p className="text-2xl font-bold text-orange-600">
                PKR {employees.reduce((sum, emp) => sum + (emp.salary || 0), 0).toLocaleString('en-PK')}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Task Management Section */}
      {isAdmin && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Task Management ({assignedTasks.length} assigned)
              </h2>
              <button
                onClick={() => setShowTaskForm(true)}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                <Plus size={16} />
                Assign Task
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {assignedTasks.length > 0 ? (
              <div className="space-y-4">
                {assignedTasks.map((task) => {
                  const assignedEmployee = employees.find(emp => emp.id === task.assignedTo);
                  return (
                    <div key={task.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{task.title}</h3>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTaskStatusColor(task.status)}`}>
                              {task.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{task.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>Assigned to: {assignedEmployee?.name || 'Unknown'}</span>
                            {task.dueDate && (
                              <span>Due: {safeFormat(task.dueDate, 'MMM dd, yyyy')}</span>
                            )}
                            <span>Created: {safeFormat(task.createdAt, 'MMM dd, yyyy')}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {task.status !== 'completed' && task.status !== 'cancelled' && (
                            <>
                              <button
                                onClick={() => handleTaskStatusUpdate(task, 'completed')}
                                className="text-green-600 hover:text-green-700 transition-colors"
                                title="Mark as completed"
                              >
                                <CheckSquare className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleTaskStatusUpdate(task, 'cancelled')}
                                className="text-red-600 hover:text-red-700 transition-colors"
                                title="Cancel task"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={async () => {
                              if (confirm('Are you sure you want to delete this task?')) {
                                try {
                                  await deleteTask(task.id);
                                  setAssignedTasks(prev => prev.filter(t => t.id !== task.id));
                                  showMessage('Task deleted successfully!', 'success');
                                } catch (error) {
                                  console.error('Error deleting task:', error);
                                  showMessage('Error deleting task', 'error');
                                }
                              }
                            }}
                            className="text-red-600 hover:text-red-700 transition-colors"
                            title="Delete task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No tasks assigned yet</p>
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Assign First Task
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search employees..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="terminated">Terminated</option>
          </select>

          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Filter className="w-4 h-4 mr-2" />
            Showing {filteredEmployees.length} of {employees.length} employees
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden min-h-[500px]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEmployees.map((employee, index) => (
                <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-medium">
                    #{index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {employee.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {employee.employeeId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {employee.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {employee.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                    PKR {employee.salary.toLocaleString('en-PK')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {safeFormat(employee.joinDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(employee)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => handleEdit(employee)}
                            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 transition-colors"
                            title="Edit Employee"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(employee.id, employee.name)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                            title="Delete Employee"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No employees found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {employees.length === 0 
                ? "Add your first employee to get started" 
                : "Try adjusting your search or filter criteria"
              }
            </p>
            {isAdmin && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                Add Employee
              </button>
            )}
          </div>
        )}
      </div>

      {/* Employee Form Modal */}
      {showForm && isAdmin && (
        <div className="form-modal">
          <div className="form-container animate-slideInRight">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              {editingEmployee ? 'Edit Employee' : 'New Employee'}
            </h2>
            
            <div className="max-h-[60vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Employee ID
                    </label>
                    <input
                      type="text"
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      placeholder="Auto-generated if empty"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter full name"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter email address"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter phone number"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Position *
                    </label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="Enter position/title"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Department *
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="Enter department"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Monthly Salary
                    </label>
                    <input
                      type="text"
                      value={formData.salary}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, '');
                        setFormData({ ...formData, salary: value ? parseInt(value).toLocaleString() : '' });
                      }}
                      placeholder="Enter monthly salary"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Join Date *
                    </label>
                    <input
                      type="date"
                      value={formData.joinDate}
                      onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="terminated">Terminated</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Role *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    >
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Username *
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="Enter username for login"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter password"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingEmployee ? 'Update Employee' : 'Create Employee'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Assignment Modal */}
      {showTaskForm && isAdmin && (
        <div className="form-modal">
          <div className="form-container animate-slideInRight">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5" />
              Assign New Task
            </h2>
            
            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                  placeholder="Enter task title"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={taskFormData.description}
                  onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                  placeholder="Enter task description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assign To *
                </label>
                <select
                  value={taskFormData.assignedTo}
                  onChange={(e) => setTaskFormData({ ...taskFormData, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.filter(emp => emp.status === 'active').map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} - {employee.position}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priority *
                  </label>
                  <select
                    value={taskFormData.priority}
                    onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={taskFormData.dueDate}
                    onChange={(e) => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </form>

            <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
              <button
                type="button"
                onClick={() => {
                  resetTaskForm();
                  setShowTaskForm(false);
                }}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTaskSubmit}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <Send size={16} />
                Assign Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Details Modal */}
      {showDetails && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-filter backdrop-blur-sm bg-black bg-opacity-70">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slideInRight">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Employee Details
              </h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedEmployee.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400">{selectedEmployee.position}</p>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Employee ID:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{selectedEmployee.employeeId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Email:</span>
                    <span className="text-gray-900 dark:text-white">{selectedEmployee.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                    <span className="text-gray-900 dark:text-white">{selectedEmployee.phone || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Department:</span>
                    <span className="text-gray-900 dark:text-white">{selectedEmployee.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Salary:</span>
                    <span className="text-gray-900 dark:text-white">PKR {selectedEmployee.salary.toLocaleString('en-PK')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Join Date:</span>
                    <span className="text-gray-900 dark:text-white">{safeFormat(selectedEmployee.joinDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Status:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedEmployee.status)}`}>
                      {selectedEmployee.status}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Recent Tasks</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {tasks.filter(task => task.assignedTo === selectedEmployee.id).slice(0, 5).map((task) => (
                    <div key={task.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTaskStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{task.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Created: {safeFormat(task.createdAt, 'MMM dd')}
                        {task.dueDate && ` • Due: ${safeFormat(task.dueDate, 'MMM dd')}`}
                      </p>
                    </div>
                  ))}
                  {tasks.filter(task => task.assignedTo === selectedEmployee.id).length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No tasks assigned yet
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              {isAdmin && (
                <>
                  <button
                    onClick={() => {
                      setShowDetails(false);
                      handleEdit(selectedEmployee);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setShowDetails(false);
                      handleDelete(selectedEmployee.id, selectedEmployee.name);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;