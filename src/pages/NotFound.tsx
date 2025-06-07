import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Home } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const NotFound: React.FC = () => {
  const { darkMode } = useTheme();
  
  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="text-center p-8">
        <Gamepad2 className="w-20 h-20 text-purple-500 mx-auto mb-4" />
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-2xl font-semibold mb-2">Page Not Found</p>
        <p className={`mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition"
        >
          <Home size={18} className="mr-2" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;