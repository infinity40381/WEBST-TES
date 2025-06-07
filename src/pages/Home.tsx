import React, { useEffect, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import PostCard from '../components/feed/PostCard';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import CreatePostModal from '../components/feed/CreatePostModal';

const Home: React.FC = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedPosts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setPosts(fetchedPosts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, []);

  // For demo purposes, add sample posts if no posts exist
  useEffect(() => {
    if (!loading && posts.length === 0) {
      // Add sample post data
      const samplePosts = [
        {
          id: 'sample1',
          content: 'Just had an amazing match in Valorant! 30 kills and match MVP 🎮',
          author: {
            id: 'sample-user-1',
            username: 'valorantpro',
            displayName: 'Valorant Pro',
            photoURL: 'https://images.pexels.com/photos/2691608/pexels-photo-2691608.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
          },
          createdAt: { toDate: () => new Date() },
          likes: [],
          saves: [],
          commentsCount: 3,
          gameTag: 'valorant'
        },
        {
          id: 'sample2',
          content: 'New CS2 update is looking great! Check out this gameplay:',
          mediaUrl: 'https://www.youtube.com/embed/edYCtaNueQY',
          mediaType: 'video',
          author: {
            id: 'sample-user-2',
            username: 'cs2player',
            displayName: 'CS2 Player',
            photoURL: 'https://images.pexels.com/photos/1486064/pexels-photo-1486064.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
          },
          createdAt: { toDate: () => new Date(Date.now() - 3600000) },
          likes: [],
          saves: [],
          commentsCount: 7,
          gameTag: 'cs2'
        },
        {
          id: 'sample3',
          content: 'Our team just qualified for the regional League finals! So excited for this opportunity to showcase our skills.',
          author: {
            id: 'sample-user-3',
            username: 'leaguepro',
            displayName: 'League Pro',
            photoURL: ''
          },
          createdAt: { toDate: () => new Date(Date.now() - 7200000) },
          likes: [],
          saves: [],
          commentsCount: 12,
          gameTag: 'leagueoflegends'
        }
      ];
      
      setPosts(samplePosts);
    }
  }, [loading, posts.length]);
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className={`mb-8 p-4 rounded-xl shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <button 
          onClick={() => setShowCreatePost(true)}
          className="w-full text-left flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-500 mr-3 flex items-center justify-center">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-medium">{user?.email?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            What's on your gaming mind?
          </p>
          <PlusCircle className="ml-auto text-purple-500" />
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </>
      )}
      
      {showCreatePost && (
        <CreatePostModal onClose={() => setShowCreatePost(false)} />
      )}
    </div>
  );
};

export default Home;