import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock, Moon, Sun, Shield, AlertCircle, CheckCircle, Loader, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' ||
        (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'admin' as 'admin' | 'employee'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validation
      if (!formData.username.trim()) {
        throw new Error('Username is required');
      }
      
      if (formData.username.length < 3) {
        throw new Error('Username must be at least 3 characters long');
      }
      
      if (!formData.password) {
        throw new Error('Password is required');
      }
      
      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      if (isLogin) {
        await login(formData.username, formData.password);
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        
        await register(formData.username, formData.password, formData.role);
        setSuccess('Account created successfully! You can now login.');
        
        // Switch to login mode after successful registration
        setTimeout(() => {
          setIsLogin(true);
          setFormData({
            username: '',
            password: '',
            confirmPassword: '',
            role: 'admin'
          });
          setSuccess('');
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    
    // Clear errors when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      role: e.target.value as 'admin' | 'employee'
    }));
  };

  return (
    <div className="login-page h-screen overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Dark Mode Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={toggleDarkMode}
          className="p-3 rounded-xl bg-white/20 dark:bg-gray-800/50 backdrop-blur-sm border border-white/30 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-gray-700/50 transition-all duration-300 hover:scale-110"
          title="Toggle Dark Mode"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className="h-full grid grid-cols-2">
        {/* Left side - Branding */}
        <div className="flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white p-12 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-24 h-24 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>
          
          <div className="text-center max-w-md">
            <div className="mb-8 relative z-10">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/30">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Arkive
              </h1>
              <p className="text-xl text-blue-100 font-medium">
                Professional Tax Management System
              </p>
            </div>
            <div className="space-y-4 text-left relative z-10">
              <div className="flex items-center space-x-4 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-blue-100 font-medium">Real-time Firebase Sync</span>
              </div>
              <div className="flex items-center space-x-4 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <span className="text-blue-100 font-medium">Employee Management</span>
              </div>
              <div className="flex items-center space-x-4 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                <span className="text-blue-100 font-medium">Financial Analytics</span>
              </div>
              <div className="flex items-center space-x-4 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                <span className="text-blue-100 font-medium">Tax Calculations</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="w-full max-w-md">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {isLogin ? 'Sign in to access your dashboard' : 'Join the Arkive platform'}
              </p>
            </div>

            <>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Success Message */}
                {success && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-slideInRight">
                    <CheckCircle className="w-5 h-5" />
                    {success}
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-slideInRight">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300 text-lg font-medium"
                      placeholder="Enter your username"
                      minLength={3}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-14 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300 text-lg font-medium"
                      placeholder="Enter your password"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Account Type
                      </label>
                      <select
                        value={formData.role}
                        onChange={handleRoleChange}
                        className="w-full px-4 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300 text-lg font-medium"
                      >
                        <option value="admin">Administrator</option>
                        <option value="employee">Employee</option>
                      </select>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {formData.role === 'admin' 
                          ? 'Full access to all features and settings' 
                          : 'Limited access for daily operations'
                        }
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-14 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300 text-lg font-medium"
                          placeholder="Confirm your password"
                          minLength={6}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:transform-none disabled:shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                    </div>
                  ) : (
                    <span>{isLogin ? 'Sign In to Arkive' : 'Create Account'}</span>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setSuccess('');
                    setFormData({
                      username: '',
                      password: '',
                      confirmPassword: '',
                      role: 'admin'
                    });
                  }}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold text-lg transition-colors duration-200 hover:underline"
                >
                  {isLogin ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
                </button>
              </div>
              </div>

              {isLogin && (
              <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm font-bold text-blue-700 dark:text-blue-300">Demo Access</p>
                </div>
                <div className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
                  <div className="flex justify-between">
                    <span className="font-medium">Username:</span>
                    <span className="font-mono bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded">admin</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Password:</span>
                    <span className="font-mono bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded">admin123</span>
                  </div>
                </div>
              </div>
              )}

              {!isLogin && (
              <div className="mt-6 p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <p className="text-sm font-bold text-amber-700 dark:text-amber-300">Account Limits</p>
                </div>
                <div className="text-sm text-amber-600 dark:text-amber-400 space-y-1">
                  <p>• Maximum 2 admin accounts allowed</p>
                  <p>• Unlimited employee accounts</p>
                  <p>• All accounts sync across devices</p>
                </div>
              </div>
              )}
            </>
          </div>
        </div>
      </div>
    </div>
  );
}