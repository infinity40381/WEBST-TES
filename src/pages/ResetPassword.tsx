import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const { darkMode } = useTheme();
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      await resetPassword(email);
      setSuccess(true);
    } catch (error) {
      setError('Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`w-full max-w-md p-8 rounded-xl shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
      >
        <Link to="/login" className="flex items-center text-purple-500 hover:text-purple-700 transition mb-6">
          <ArrowLeft size={18} className="mr-2" />
          Back to Login
        </Link>
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mb-4">
            <Shield size={36} className="text-purple-500" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
          <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>
        
        {error && (
          <div className="mb-6 p-3 rounded-md bg-red-100 border border-red-300 text-red-800 flex items-start">
            <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        {success ? (
          <div className="mb-6 p-4 rounded-md bg-green-100 border border-green-300 text-green-800">
            <h3 className="font-semibold mb-1">Password Reset Email Sent</h3>
            <p className="text-sm">
              Check your email ({email}) for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
            </p>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 focus:ring-purple-500 text-white' 
                      : 'bg-gray-100 border-gray-200 focus:ring-purple-500 text-gray-900'
                  }`}
                  placeholder="your.email@example.com"
                />
                <Mail className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-lg flex justify-center items-center ${
                loading 
                  ? 'bg-purple-400 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700'
              } text-white font-medium transition`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        )}
        
        <p className="mt-6 text-center text-sm">
          Remember your password?{' '}
          <Link to="/login" className="text-purple-500 hover:text-purple-700 font-medium">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ResetPassword;