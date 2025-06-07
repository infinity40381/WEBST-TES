import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Bell, Heart, MessageCircle, UserPlus, User } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(notifs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow':
        return <UserPlus size={20} className="text-blue-500" />;
      case 'like':
        return <Heart size={20} className="text-red-500" />;
      case 'comment':
        return <MessageCircle size={20} className="text-green-500" />;
      default:
        return <Bell size={20} className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className={`rounded-xl shadow-md overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} mb-6`}>
        <div className="p-6 border-b dark:border-gray-700 border-gray-200">
          <h1 className="text-2xl font-bold flex items-center">
            <Bell size={28} className="mr-3 text-purple-500" />
            Notifications
          </h1>
        </div>

        <div className="divide-y dark:divide-gray-700 divide-gray-200">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer ${
                  !notification.read ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                }`}
                onClick={() => {
                  if (!notification.read) {
                    markAsRead(notification.id);
                  }
                }}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-purple-500 flex items-center justify-center">
                        {notification.from?.photoURL ? (
                          <img 
                            src={notification.from.photoURL} 
                            alt={notification.from.displayName} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <User size={16} className="text-white" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          <Link 
                            to={`/profile/${notification.from?.id}`}
                            className="font-medium hover:underline"
                          >
                            {notification.from?.displayName}
                          </Link>
                          {' '}
                          {notification.type === 'follow' && 'started following you'}
                          {notification.type === 'like' && 'liked your post'}
                          {notification.type === 'comment' && 'commented on your post'}
                        </p>
                        
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {notification.createdAt && format(
                            notification.createdAt.toDate ? 
                            notification.createdAt.toDate() : 
                            new Date(notification.createdAt), 
                            'MMM d, yyyy · h:mm a'
                          )}
                        </p>
                      </div>
                      
                      {!notification.read && (
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      )}
                    </div>
                    
                    {notification.resourceId && (
                      <Link 
                        to={`/post/${notification.resourceId}`}
                        className={`text-sm mt-2 block ${darkMode ? 'text-gray-300' : 'text-gray-600'} hover:underline`}
                      >
                        View post
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <Bell size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                No notifications yet
              </h3>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                When someone follows you, likes your posts, or comments, you'll see it here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;