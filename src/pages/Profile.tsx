import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, MessageSquare, Settings, Users, Calendar } from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs, orderBy, updateDoc, arrayUnion, arrayRemove, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import PostCard from '../components/feed/PostCard';
import FollowersModal from '../components/profile/FollowersModal';
import Loading from '../components/ui/Loading';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [tab, setTab] = useState('posts');
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followers, setFollowers] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;

      try {
        const profileDoc = await getDoc(doc(db, 'users', id));
        
        if (profileDoc.exists()) {
          const profileData = profileDoc.data();
          setProfile(profileData);
          setFollowerCount(profileData.followers?.length || 0);
          setFollowingCount(profileData.following?.length || 0);
          setFollowers(profileData.followers || []);
          setFollowing(profileData.following || []);
          
          if (user) {
            setIsFollowing(profileData.followers?.includes(user.uid) || false);
          }
        }

        const q = query(
          collection(db, 'posts'),
          where('author.id', '==', id),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedPosts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setPosts(fetchedPosts);

        const likedPostsQuery = query(
          collection(db, 'posts'),
          where('likes', 'array-contains', id)
        );
        
        const likedPostsSnapshot = await getDocs(likedPostsQuery);
        const fetchedLikedPosts = likedPostsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setLikedPosts(fetchedLikedPosts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, user]);

  const handleFollow = async () => {
    if (!user || !id || user.uid === id) return;

    try {
      const userRef = doc(db, 'users', id);
      const currentUserRef = doc(db, 'users', user.uid);

      if (isFollowing) {
        await updateDoc(userRef, {
          followers: arrayRemove(user.uid)
        });
        await updateDoc(currentUserRef, {
          following: arrayRemove(id)
        });
        setFollowerCount(prev => prev - 1);
        setFollowers(prev => prev.filter(f => f !== user.uid));
        toast.success('Unfollowed successfully');
      } else {
        await updateDoc(userRef, {
          followers: arrayUnion(user.uid)
        });
        await updateDoc(currentUserRef, {
          following: arrayUnion(id)
        });
        setFollowerCount(prev => prev + 1);
        setFollowers(prev => [...prev, user.uid]);
        
        const notificationData = {
          userId: id,
          type: 'follow',
          from: {
            id: user.uid,
            username: user.displayName || user.email?.split('@')[0],
            displayName: user.displayName || user.email?.split('@')[0],
            photoURL: user.photoURL || ''
          },
          content: `${user.displayName || user.email?.split('@')[0]} started following you`,
          resourceId: '',
          createdAt: new Date(),
          read: false
        };
        
        await addDoc(collection(db, 'notifications'), notificationData);
        toast.success('Following successfully');
      }

      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error updating follow status:', error);
      toast.error('Failed to update follow status');
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <p>User not found</p>
        <Link to="/" className="text-purple-500 hover:underline">Go back home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className={`rounded-2xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} mb-8`}>
        <div className="h-48 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 relative">
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>
        
        <div className="px-6 py-6 relative">
          <div className="flex flex-col lg:flex-row lg:items-start">
            <div className="flex flex-col items-center lg:items-start lg:mr-8">
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-purple-500 flex items-center justify-center -mt-20 shadow-2xl">
                {profile.photoURL ? (
                  <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-white" />
                )}
              </div>
            </div>
            
            <div className="flex-1 mt-6 lg:mt-0">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="text-center lg:text-left">
                  <h1 className="text-3xl font-bold mb-2">{profile.displayName}</h1>
                  <p className={`text-lg mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>@{profile.username}</p>
                  
                  {profile.bio && (
                    <p className="text-base mb-4 max-w-md">{profile.bio}</p>
                  )}
                  
                  {profile.createdAt && (
                    <div className={`flex items-center justify-center lg:justify-start mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Calendar size={18} className="mr-2" />
                      <span>
                        Joined {new Date(profile.createdAt.toDate()).toLocaleDateString('en-US', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 lg:mt-0 flex flex-col items-center lg:items-end space-y-3">
                  {user?.uid === profile.uid ? (
                    <Link 
                      to="/settings" 
                      className="px-6 py-3 rounded-xl bg-purple-100 text-purple-700 hover:bg-purple-200 font-semibold flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <Settings size={20} className="mr-2" />
                      Edit Profile
                    </Link>
                  ) : (
                    <div className="flex space-x-3">
                      <button 
                        onClick={handleFollow}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${
                          isFollowing 
                            ? 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
                      >
                        <Users size={20} className="mr-2 inline" />
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                      
                      <Link 
                        to={`/messages/${profile.uid}`}
                        className="px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 font-semibold flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        <MessageSquare size={20} className="mr-2" />
                        Message
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* ✅ DÜZENLENEN STATS BÖLÜMÜ */}
              <div className="grid grid-cols-3 gap-4 mt-6 text-center">
                <button
                  onClick={() => setShowFollowersModal(true)}
                  className="p-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="text-xl font-bold">{followerCount}</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Followers</div>
                </button>
                <button
                  onClick={() => setShowFollowingModal(true)}
                  className="p-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="text-xl font-bold">{followingCount}</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Following</div>
                </button>
                <div className="p-3 rounded-lg">
                  <div className="text-xl font-bold">{posts.length}</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Posts</div>
                </div>
              </div>
              {/* ✅ SON */}
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className={`flex border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {['posts', 'media', 'likes'].map(tabType => (
            <button
              key={tabType}
              onClick={() => setTab(tabType)}
              className={`flex-1 py-4 font-semibold text-center transition-colors ${
                tab === tabType
                  ? 'text-purple-500 border-b-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : darkMode
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {tabType.charAt(0).toUpperCase() + tabType.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="space-y-6">
        {tab === 'posts' && (
          posts.length > 0 ? posts.map(post => (
            <PostCard key={post.id} post={post} />
          )) : (
            <EmptyState text="No posts yet" subtext={user?.uid === profile.uid ? 'Share your first gaming moment!' : 'This user hasn\'t posted anything yet.'} darkMode={darkMode} />
          )
        )}
        {tab === 'media' && (
          <EmptyState text="Media content" subtext="Photos and videos will be displayed here" darkMode={darkMode} />
        )}
        {tab === 'likes' && (
          likedPosts.length > 0 ? likedPosts.map(post => (
            <PostCard key={post.id} post={post} />
          )) : (
            <EmptyState text="No liked posts" subtext="Liked posts will be displayed here" darkMode={darkMode} />
          )
        )}
      </div>

      <FollowersModal isOpen={showFollowersModal} onClose={() => setShowFollowersModal(false)} userIds={followers} title="Followers" />
      <FollowersModal isOpen={showFollowingModal} onClose={() => setShowFollowingModal(false)} userIds={following} title="Following" />
    </div>
  );
};

const EmptyState = ({ text, subtext, darkMode }: { text: string; subtext: string; darkMode: boolean }) => (
  <div className={`p-12 text-center rounded-2xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
    <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
      <User size={32} className="text-purple-500" />
    </div>
    <h3 className="text-xl font-semibold mb-2">{text}</h3>
    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{subtext}</p>
  </div>
);

export default Profile;
