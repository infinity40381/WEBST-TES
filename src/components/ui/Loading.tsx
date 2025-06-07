import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Gamepad2 } from 'lucide-react';

const Loading: React.FC = () => {
  const { darkMode } = useTheme();
  
  return (
    <div className={`fixed inset-0 flex flex-col items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex flex-col items-center">
        <Gamepad2 size={60} className="text-purple-500 animate-pulse mb-4" />
        <div className="text-4xl font-bold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
          ssocieyt
        </div>
        <div className="relative w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 w-1/2 animate-loading-bar"></div>
        </div>
        <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Connecting gamers...
        </p>
      </div>
    </div>
  );
};

export default Loading;