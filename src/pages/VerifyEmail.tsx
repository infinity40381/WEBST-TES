import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const VerifyEmail: React.FC = () => {
  const { user, verifyEmail, logout } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [sending, setSending] = React.useState(false);
  const [countdown, setCountdown] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  
  const handleSendVerification = async () => {
    try {
      setSending(true);
      setError(null);
      await verifyEmail();
      setCountdown(60);
      
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      if (error.code === 'auth/too-many-requests') {
        setError('Too many verification attempts. Please try again later.');
      } else {
        setError('Failed to send verification email. Please try again.');
      }
    } finally {
      setSending(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`w-full max-w-md p-8 rounded-xl shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
      >
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mb-6">
            <Mail size={36} className="text-purple-500" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2 text-center">Verify Your Email</h1>
          <p className={`text-center mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            We sent a verification email to<br />
            <span className="font-medium">{user?.email}</span>
          </p>
          
          <div className={`w-full p-4 rounded-lg mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Please check your email and click on the verification link to complete your registration. If you don't see the email, check your spam folder.
            </p>
          </div>

          {error && (
            <div className={`w-full p-4 rounded-lg mb-4 bg-red-100 dark:bg-red-900`}>
              <p className="text-sm text-red-600 dark:text-red-200">{error}</p>
            </div>
          )}
          
          <button 
            onClick={handleSendVerification}
            disabled={sending || countdown > 0}
            className={`w-full py-2.5 rounded-lg flex justify-center items-center mb-4 ${
              sending || countdown > 0
                ? 'bg-purple-400 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700'
            } text-white font-medium transition`}
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            ) : countdown > 0 ? (
              <>
                <RefreshCw size={18} className="mr-2" />
                Resend Email ({countdown}s)
              </>
            ) : (
              <>
                <RefreshCw size={18} className="mr-2" />
                Resend Verification Email
              </>
            )}
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition"
          >
            Logout
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;