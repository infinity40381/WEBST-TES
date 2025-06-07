import React, { useState } from 'react';
import { X, Image, Video, Gamepad } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface CreatePostModalProps {
  onClose: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose }) => {
  const { darkMode } = useTheme();
  const { user, userProfile } = useAuth();
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [gameTag, setGameTag] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.type.includes('image')) {
        setMedia(file);
        setMediaPreview(URL.createObjectURL(file));
      }
    }
  };

  const extractVideoEmbed = (url: string) => {
    // YouTube
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // TikTok
    if (url.includes('tiktok.com')) {
      // TikTok embed handling
      const videoId = url.split('/video/')[1]?.split('?')[0];
      if (videoId) {
        return `https://www.tiktok.com/embed/v2/${videoId}`;
      }
    }
    
    // Instagram
    if (url.includes('instagram.com/p/') || url.includes('instagram.com/reel/')) {
      const postId = url.split('/p/')[1]?.split('/')[0] || url.split('/reel/')[1]?.split('/')[0];
      if (postId) {
        return `https://www.instagram.com/p/${postId}/embed/`;
      }
    }
    
    // Twitter/X
    if (url.includes('twitter.com') || url.includes('x.com')) {
      const tweetId = url.split('/status/')[1]?.split('?')[0];
      if (tweetId) {
        return `https://platform.twitter.com/embed/Tweet.html?id=${tweetId}`;
      }
    }
    
    return url;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content && !media && !videoUrl) {
      toast.error('Please add content to your post');
      return;
    }
    
    try {
      setLoading(true);
      
      let mediaUrl = '';
      let mediaType = '';
      
      if (media) {
        const storageRef = ref(storage, `posts/${user?.uid}/${Date.now()}_${media.name}`);
        await uploadBytes(storageRef, media);
        mediaUrl = await getDownloadURL(storageRef);
        mediaType = 'image';
      } else if (videoUrl) {
        mediaUrl = extractVideoEmbed(videoUrl);
        mediaType = 'video';
      }
      
      const postData = {
        content,
        author: {
          id: user?.uid,
          username: userProfile?.username,
          displayName: userProfile?.displayName,
          photoURL: userProfile?.photoURL || ''
        },
        createdAt: serverTimestamp(),
        likes: [],
        saves: [],
        commentsCount: 0
      };
      
      if (mediaUrl) {
        Object.assign(postData, { mediaUrl, mediaType });
      }
      
      if (gameTag) {
        Object.assign(postData, { gameTag });
      }
      
      await addDoc(collection(db, 'posts'), postData);
      
      toast.success('Post created successfully');
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className={`w-full max-w-lg rounded-xl ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} overflow-hidden shadow-xl`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 border-gray-200">
            <h2 className="text-xl font-semibold">Create Post</h2>
            <button 
              onClick={onClose}
              className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="p-4">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-500 mr-3 flex items-center justify-center">
                  {userProfile?.photoURL ? (
                    <img src={userProfile.photoURL} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-medium">{userProfile?.username?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <div className="font-medium">{userProfile?.displayName}</div>
                  <div className="text-sm text-gray-500">@{userProfile?.username}</div>
                </div>
              </div>
              
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's happening in your gaming world?"
                className={`w-full p-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[120px] ${
                  darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'
                }`}
              ></textarea>
              
              {mediaPreview && (
                <div className="relative mt-3">
                  <img 
                    src={mediaPreview} 
                    alt="Preview" 
                    className="w-full h-auto rounded-lg max-h-[300px] object-contain"
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      setMedia(null);
                      setMediaPreview('');
                    }}
                    className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full"
                  >
                    <X size={18} className="text-white" />
                  </button>
                </div>
              )}
              
              {!mediaPreview && videoUrl && (
                <div className="relative mt-3">
                  <div className="relative pt-[56.25%]">
                    <iframe 
                      src={extractVideoEmbed(videoUrl)}
                      className="absolute top-0 left-0 w-full h-full rounded-md"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setVideoUrl('')}
                    className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full"
                  >
                    <X size={18} className="text-white" />
                  </button>
                </div>
              )}
              
              {!mediaPreview && !videoUrl && (
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Add Video (YouTube, TikTok, Instagram, X/Twitter)
                    </label>
                    <input
                      type="text"
                      placeholder="Paste video URL here"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className={`w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Game Tag
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Add a game tag (e.g., valorant, cs2)"
                        value={gameTag}
                        onChange={(e) => setGameTag(e.target.value)}
                        className={`w-full pl-10 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'
                        }`}
                      />
                      <Gamepad className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between p-4 border-t dark:border-gray-700 border-gray-200">
              <div className="flex space-x-2">
                <label className={`p-2 rounded-full cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleMediaChange}
                    disabled={!!videoUrl}
                  />
                  <Image size={20} className={videoUrl ? 'text-gray-400' : 'text-purple-500'} />
                </label>
                
                <button 
                  type="button"
                  className={`p-2 rounded-full ${mediaPreview ? 'text-gray-400' : 'text-purple-500'} ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  disabled={!!mediaPreview}
                >
                  <Video size={20} />
                </button>
              </div>
              
              <button
                type="submit"
                disabled={loading || (!content && !media && !videoUrl)}
                className={`px-4 py-2 rounded-lg flex justify-center items-center ${
                  loading || (!content && !media && !videoUrl)
                    ? 'bg-purple-400 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-700'
                } text-white font-medium transition`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Post'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreatePostModal;