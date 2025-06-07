import React, { useState, useEffect } from 'react';
import { X, User } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  userIds: string[];
  title: string;
}

const FollowersModal: React.FC<FollowersModalProps> = ({ isOpen, onClose, userIds, title }) => {
  const { darkMode } = useTheme();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!userIds.length) {
        setUsers([]);
        setLoading(false);
        return;
      }

      try {
        const userPromises = userIds.map(async (userId) => {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            return { id: userDoc.id, ...userDoc.data() };
          }
          return null;
        });

        const fetchedUsers = await Promise.all(userPromises);
        setUsers(fetchedUsers.filter(user => user !== null));
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, userIds]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className={`w-full max-w-md rounded-xl ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} overflow-hidden shadow-xl`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 border-gray-200">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button 
              onClick={onClose}
              className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : users.length > 0 ? (
              <div className="divide-y dark:divide-gray-700 divide-gray-200">
                {users.map((user) => (
                  <Link
                    key={user.id}
                    to={`/profile/${user.id}`}
                    className={`flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition`}
                    onClick={onClose}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-purple-500 flex items-center justify-center mr-3">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <User size={24} className="text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{user.displayName}</div>
                      <div className="text-sm text-gray-500">@{user.username}</div>
                      {user.bio && (
                        <div className="text-sm text-gray-400 mt-1 truncate">{user.bio}</div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <User size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No {title.toLowerCase()} yet
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FollowersModal;