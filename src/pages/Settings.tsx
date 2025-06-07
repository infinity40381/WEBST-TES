import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Save, Globe, Moon, Sun, ArrowLeft, LogOut, Mail, Key, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useIntl } from 'react-intl';
import { doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';

interface SettingsProps {
  setLocale: (locale: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ setLocale }) => {
  const { user, userProfile, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const intl = useIntl();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [isPrivate, setIsPrivate] = useState(userProfile?.isPrivate || false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState(userProfile?.photoURL || '');
  
  // Social Links
  const [twitchLink, setTwitchLink] = useState(userProfile?.socialLinks?.twitch || '');
  const [youtubeLink, setYoutubeLink] = useState(userProfile?.socialLinks?.youtube || '');
  const [twitterLink, setTwitterLink] = useState(userProfile?.socialLinks?.twitter || '');
  const [instagramLink, setInstagramLink] = useState(userProfile?.socialLinks?.instagram || '');
  
  const [saving, setSaving] = useState(false);
  const [currentLocale, setCurrentLocale] = useState(localStorage.getItem('locale') || 'en');
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };
  
  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      let photoURL = userProfile?.photoURL || '';
      
      if (profileImage) {
        const storage = getStorage();
        const storageRef = ref(storage, `profile/${user.uid}`);
        await uploadBytes(storageRef, profileImage);
        photoURL = await getDownloadURL(storageRef);
      }
      
      const userData = {
        displayName,
        bio,
        isPrivate,
        photoURL,
        socialLinks: {
          twitch: twitchLink,
          youtube: youtubeLink,
          twitter: twitterLink,
          instagram: instagramLink
        }
      };
      
      await updateDoc(doc(db, 'users', user.uid), userData);
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
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
  
  const changeLanguage = (locale: string) => {
    setCurrentLocale(locale);
    setLocale(locale);
    localStorage.setItem('locale', locale);
    // Force page reload to apply language changes
    window.location.reload();
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-purple-500 hover:text-purple-700 transition font-medium"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </button>
      </div>
      
      <div className={`rounded-2xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
        <div className="sm:flex">
          {/* Sidebar */}
          <div className={`sm:w-72 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6 space-y-2`}>
            <h2 className="text-lg font-bold mb-4">Settings</h2>
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-4 py-3 rounded-xl transition font-medium ${
                activeTab === 'profile' 
                  ? `${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow-md` 
                  : `${darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-white text-gray-700'}`
              }`}
            >
              <User size={18} className="inline mr-3" />
              Profile Settings
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`w-full text-left px-4 py-3 rounded-xl transition font-medium ${
                activeTab === 'privacy' 
                  ? `${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow-md` 
                  : `${darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-white text-gray-700'}`
              }`}
            >
              <Key size={18} className="inline mr-3" />
              Privacy
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`w-full text-left px-4 py-3 rounded-xl transition font-medium ${
                activeTab === 'account' 
                  ? `${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow-md` 
                  : `${darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-white text-gray-700'}`
              }`}
            >
              <Mail size={18} className="inline mr-3" />
              Account
            </button>
            <button
              onClick={() => setActiveTab('appearance')}
              className={`w-full text-left px-4 py-3 rounded-xl transition font-medium ${
                activeTab === 'appearance' 
                  ? `${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow-md` 
                  : `${darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-white text-gray-700'}`
              }`}
            >
              {darkMode ? <Moon size={18} className="inline mr-3" /> : <Sun size={18} className="inline mr-3" />}
              Appearance
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 p-6">
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Profile Settings</h2>
                  <p className="text-gray-500">Manage your public profile information</p>
                </div>
                
                {/* Profile Picture */}
                <div className="flex flex-col items-center sm:items-start sm:flex-row sm:space-x-6">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-purple-500 flex items-center justify-center shadow-lg">
                      {profileImagePreview ? (
                        <img src={profileImagePreview} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User size={48} className="text-white" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center cursor-pointer shadow-lg hover:bg-purple-600 transition">
                      <Camera size={20} />
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                  
                  <div className="mt-6 sm:mt-0 w-full sm:max-w-md space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-200'
                        } border`}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Bio
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                          darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-200'
                        } border`}
                        placeholder="Tell us about yourself..."
                      ></textarea>
                    </div>
                  </div>
                </div>
                
                {/* Social Links */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Social Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Twitch
                      </label>
                      <input
                        type="text"
                        value={twitchLink}
                        onChange={(e) => setTwitchLink(e.target.value)}
                        placeholder="https://twitch.tv/username"
                        className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-200'
                        } border`}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        YouTube
                      </label>
                      <input
                        type="text"
                        value={youtubeLink}
                        onChange={(e) => setYoutubeLink(e.target.value)}
                        placeholder="https://youtube.com/c/username"
                        className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-200'
                        } border`}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Twitter/X
                      </label>
                      <input
                        type="text"
                        value={twitterLink}
                        onChange={(e) => setTwitterLink(e.target.value)}
                        placeholder="https://twitter.com/username"
                        className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-200'
                        } border`}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Instagram
                      </label>
                      <input
                        type="text"
                        value={instagramLink}
                        onChange={(e) => setInstagramLink(e.target.value)}
                        placeholder="https://instagram.com/username"
                        className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-200'
                        } border`}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center transition shadow-lg"
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                      <Save size={20} className="mr-2" />
                    )}
                    Save Changes
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'privacy' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Privacy Settings</h2>
                  <p className="text-gray-500">Control who can see your content</p>
                </div>
                
                <div className="space-y-6">
                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="private-account"
                          type="checkbox"
                          checked={isPrivate}
                          onChange={() => setIsPrivate(!isPrivate)}
                          className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                      </div>
                      <label htmlFor="private-account" className="ml-4 text-sm">
                        <span className="font-semibold text-lg">Private Account</span>
                        <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Only your followers can see your posts, likes, and game activity. Your profile will still be visible.
                        </p>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center transition shadow-lg"
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                      <Save size={20} className="mr-2" />
                    )}
                    Save Changes
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'account' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Account Settings</h2>
                  <p className="text-gray-500">Manage your account information</p>
                </div>
                
                <div className="space-y-4">
                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Mail size={24} className="mr-4 text-gray-500" />
                        <div>
                          <h3 className="font-semibold text-lg">Email</h3>
                          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Key size={24} className="mr-4 text-gray-500" />
                        <div>
                          <h3 className="font-semibold text-lg">Password</h3>
                          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Change your password
                          </p>
                        </div>
                      </div>
                      <button className="px-4 py-2 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 font-medium transition">
                        Reset
                      </button>
                    </div>
                  </div>
                  
                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <LogOut size={24} className="mr-4 text-red-500" />
                        <div>
                          <h3 className="font-semibold text-lg text-red-600">Sign out</h3>
                          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Log out of your account
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-medium transition"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'appearance' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Appearance</h2>
                  <p className="text-gray-500">Customize your app experience</p>
                </div>
                
                <div className="space-y-6">
                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {darkMode ? (
                          <Moon size={24} className="mr-4 text-purple-400" />
                        ) : (
                          <Sun size={24} className="mr-4 text-yellow-500" />
                        )}
                        <div>
                          <h3 className="font-semibold text-lg">Theme</h3>
                          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {darkMode ? 'Dark Mode' : 'Light Mode'} is currently active
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={toggleTheme} 
                        className={`px-4 py-2 rounded-lg ${
                          darkMode 
                            ? 'bg-gray-600 hover:bg-gray-500' 
                            : 'bg-gray-200 hover:bg-gray-300'
                        } font-medium transition`}
                      >
                        {darkMode ? 'Light Mode' : 'Dark Mode'}
                      </button>
                    </div>
                  </div>
                  
                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Globe size={24} className="mr-4 text-gray-500" />
                        <div>
                          <h3 className="font-semibold text-lg">Language</h3>
                          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {currentLocale === 'en' ? 'English' : 'Türkçe'}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => changeLanguage('en')}
                          className={`px-4 py-2 rounded-lg ${
                            currentLocale === 'en'
                              ? 'bg-purple-500 text-white'
                              : darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'
                          } font-medium transition`}
                        >
                          English
                        </button>
                        <button 
                          onClick={() => changeLanguage('tr')}
                          className={`px-4 py-2 rounded-lg ${
                            currentLocale === 'tr'
                              ? 'bg-purple-500 text-white'
                              : darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'
                          } font-medium transition`}
                        >
                          Türkçe
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;