import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, User, LogOut, Moon, Sun, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';

const Header: React.FC = () => {
  const { user, userProfile, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSearch = async (searchText: string) => {
    setSearchQuery(searchText);
    
    if (searchText.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      setSearchLoading(true);
      
      // Search by username (case insensitive)
      const usernameQuery = query(
        collection(db, 'users'),
        where('username', '>=', searchText.toLowerCase()),
        where('username', '<=', searchText.toLowerCase() + '\uf8ff'),
        orderBy('username'),
        limit(10)
      );
      
      // Search by display name (case insensitive)
      const displayNameQuery = query(
        collection(db, 'users'),
        where('displayName', '>=', searchText),
        where('displayName', '<=', searchText + '\uf8ff'),
        orderBy('displayName'),
        limit(10)
      );

      const [usernameResults, displayNameResults] = await Promise.all([
        getDocs(usernameQuery),
        getDocs(displayNameQuery)
      ]);

      const users = new Map();
      
      // Add username search results
      usernameResults.docs.forEach(doc => {
        users.set(doc.id, { id: doc.id, ...doc.data() });
      });
      
      // Add display name search results
      displayNameResults.docs.forEach(doc => {
        users.set(doc.id, { id: doc.id, ...doc.data() });
      });

      // Additional fuzzy search for partial matches
      const allUsersQuery = query(collection(db, 'users'), limit(50));
      const allUsersSnapshot = await getDocs(allUsersQuery);
      
      allUsersSnapshot.docs.forEach(doc => {
        const userData = doc.data();
        const searchLower = searchText.toLowerCase();
        
        if (
          userData.username?.toLowerCase().includes(searchLower) ||
          userData.displayName?.toLowerCase().includes(searchLower)
        ) {
          users.set(doc.id, { id: doc.id, ...userData });
        }
      });

      const finalResults = Array.from(users.values()).slice(0, 8);
      setSearchResults(finalResults);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-md backdrop-blur-sm bg-opacity-95`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            ssocieyt
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <div className="relative">
              <input 
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                className={`pl-10 pr-4 py-2 w-64 rounded-full ${darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-gray-100 text-gray-800 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200`}
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              
              {searchLoading && (
                <div className="absolute right-3 top-2.5">
                  <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              
              {showSearchResults && searchResults.length > 0 && (
                <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-xl py-2 z-50 ${darkMode ? 'bg-gray-700' : 'bg-white'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'} max-h-80 overflow-y-auto`}>
                  {searchResults.map(user => (
                    <Link
                      key={user.id}
                      to={`/profile/${user.id}`}
                      className={`flex items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors`}
                      onClick={() => {
                        setShowSearchResults(false);
                        setSearchQuery('');
                      }}
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-500 flex items-center justify-center mr-3 flex-shrink-0">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <User size={20} className="text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{user.displayName}</div>
                        <div className="text-sm text-gray-500 truncate">@{user.username}</div>
                        {user.bio && (
                          <div className="text-xs text-gray-400 truncate mt-1">{user.bio}</div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            <nav className="flex items-center space-x-6">
              <Link to="/" className="hover:text-purple-500 transition font-medium">
                Home
              </Link>
              <Link to="/live-stream" className="hover:text-purple-500 transition font-medium">
                Live Stream
              </Link>
              <Link to="/messages" className="hover:text-purple-500 transition font-medium">
                Messages
              </Link>
              <Link to="/notifications" className="hover:text-purple-500 transition relative">
                <Bell size={20} />
                {/* Notification badge can be added here */}
              </Link>
              
              <button 
                onClick={toggleTheme} 
                className="hover:text-purple-500 transition p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <div className="relative">
                <button 
                  className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full transition"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-purple-500 flex items-center justify-center">
                    {userProfile?.photoURL ? (
                      <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={18} className="text-white" />
                    )}
                  </div>
                </button>
                
                {isMenuOpen && (
                  <div className={`absolute right-0 mt-2 w-56 rounded-xl shadow-xl py-2 ${darkMode ? 'bg-gray-700' : 'bg-white'} ring-1 ring-black ring-opacity-5 border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div className="px-4 py-3 border-b dark:border-gray-600 border-gray-200">
                      <div className="font-medium">{userProfile?.displayName}</div>
                      <div className="text-sm text-gray-500">@{userProfile?.username}</div>
                    </div>
                    <Link 
                      to={`/profile/${user?.uid}`} 
                      className={`block px-4 py-3 text-sm ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'} transition`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Your Profile
                    </Link>
                    <Link 
                      to="/settings" 
                      className={`block px-4 py-3 text-sm ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'} transition`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }}
                      className={`block w-full text-left px-4 py-3 text-sm ${darkMode ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-gray-100 text-red-500'} transition`}
                    >
                      <LogOut size={16} className="inline mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>
          
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu size={24} />
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t dark:border-gray-700 border-gray-200">
          <div className={`px-4 py-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-purple-500 flex items-center justify-center">
                {userProfile?.photoURL ? (
                  <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={24} className="text-white" />
                )}
              </div>
              <div>
                <div className="font-medium">{userProfile?.displayName}</div>
                <div className="text-sm text-gray-500">@{userProfile?.username}</div>
              </div>
            </div>
            
            <div className="relative mb-4">
              <input 
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl ${darkMode ? 'bg-gray-600 text-white placeholder-gray-400' : 'bg-white text-gray-800 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
              <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            </div>
            
            <nav className="space-y-2">
              <Link 
                to="/" 
                className="block py-3 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/live-stream" 
                className="block py-3 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Live Stream
              </Link>
              <Link 
                to="/messages" 
                className="block py-3 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Messages
              </Link>
              <Link 
                to="/notifications" 
                className="block py-3 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Notifications
              </Link>
              <Link 
                to={`/profile/${user?.uid}`}
                className="block py-3 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition font-medium" 
                onClick={() => setIsMenuOpen(false)}
              >
                Your Profile
              </Link>
              <Link 
                to="/settings"
                className="block py-3 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition font-medium" 
                onClick={() => setIsMenuOpen(false)}
              >
                Settings
              </Link>
              <button 
                className="flex items-center w-full py-3 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition font-medium"
                onClick={toggleTheme}
              >
                {darkMode ? (
                  <>
                    <Sun size={18} className="mr-3" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon size={18} className="mr-3" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
              <button 
                className="flex items-center w-full py-3 px-4 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition font-medium"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
              >
                <LogOut size={18} className="mr-3" />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;