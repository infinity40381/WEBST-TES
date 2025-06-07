import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, Trophy, Bell, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const MobileNav: React.FC = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const location = useLocation();
  
  if (!user) return null;
  
  return (
    <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-40 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="grid grid-cols-5 gap-1">
        <Link 
          to="/" 
          className={`flex flex-col items-center justify-center py-3 hover:text-purple-500 transition ${location.pathname === '/' ? 'text-purple-500' : ''}`}
        >
          <Home size={24} />
          <span className="text-xs mt-1">Home</span>
        </Link>
        
        <Link 
          to="/tournament" 
          className={`flex flex-col items-center justify-center py-3 hover:text-purple-500 transition ${location.pathname.includes('/tournament') ? 'text-purple-500' : ''}`}
        >
          <Trophy size={24} />
          <span className="text-xs mt-1">Turnuva</span>
        </Link>
        
        <Link 
          to="/messages" 
          className={`flex flex-col items-center justify-center py-3 hover:text-purple-500 transition ${location.pathname.includes('/messages') ? 'text-purple-500' : ''}`}
        >
          <MessageSquare size={24} />
          <span className="text-xs mt-1">Messages</span>
        </Link>
        
        <Link 
          to="/notifications" 
          className={`flex flex-col items-center justify-center py-3 hover:text-purple-500 transition ${location.pathname.includes('/notifications') ? 'text-purple-500' : ''}`}
        >
          <Bell size={24} />
          <span className="text-xs mt-1">Notifications</span>
        </Link>
        
        <Link 
          to={`/profile/${user.uid}`} 
          className={`flex flex-col items-center justify-center py-3 hover:text-purple-500 transition ${location.pathname.includes('/profile') ? 'text-purple-500' : ''}`}
        >
          <User size={24} />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </nav>
  );
};

export default MobileNav;