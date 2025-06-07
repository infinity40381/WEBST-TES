import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, User, UserPlus, UserCheck } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { likePost, savePost } from '../../services/postService';
import { followUser, unfollowUser } from '../../services/userService';
import { sharePost } from '../../services/shareService';
import toast from 'react-hot-toast';

interface PostCardProps {
  post: any;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { user, userProfile } = useAuth();
  const { darkMode } = useTheme();
  const [liked, setLiked] = useState(post.likes?.includes(user?.uid));
  const [saved, setSaved] = useState(post.saves?.includes(user?.uid));
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(userProfile?.following?.includes(post.author.id) || false);
  const [followLoading, setFollowLoading] = useState(false);
  
  const handleLike = async () => {
    if (!user) return;
    
    try {
      await likePost(post.id, user.uid, !liked);
      setLiked(!liked);
      setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };
  
  const handleSave = async () => {
    if (!user) return;
    
    try {
      await savePost(post.id, user.uid, !saved);
      setSaved(!saved);
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const handleFollow = async () => {
    if (!user || user.uid === post.author.id || followLoading) return;
    
    try {
      setFollowLoading(true);
      if (isFollowing) {
        await unfollowUser(user.uid, post.author.id);
        setIsFollowing(false);
        toast.success('Unfollowed successfully');
      } else {
        await followUser(user.uid, post.author.id);
        setIsFollowing(true);
        toast.success('Following successfully');
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
      toast.error('Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await sharePost(post);
      toast.success('Post shared successfully');
    } catch (error) {
      console.error('Error sharing post:', error);
      toast.error('Failed to share post');
    }
  };

  const renderMedia = () => {
    if (post.mediaType === 'image') {
      return (
        <img 
          src={post.mediaUrl} 
          alt="Post" 
          className="w-full h-auto rounded-md object-cover max-h-[600px]" 
        />
      );
    } else if (post.mediaType === 'video') {
      return (
        <div className="relative pt-[56.25%]">
          <iframe 
            src={post.mediaUrl} 
            className="absolute top-0 left-0 w-full h-full rounded-md"
            allowFullScreen
          ></iframe>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`mb-6 rounded-xl overflow-hidden shadow-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
      {/* Post Header */}
      <div className="flex items-center justify-between p-4">
        <Link to={`/profile/${post.author.id}`} className="flex items-center flex-1">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-500 flex items-center justify-center mr-3">
            {post.author.photoURL ? (
              <img src={post.author.photoURL} alt={post.author.username} className="w-full h-full object-cover" />
            ) : (
              <User size={20} className="text-white" />
            )}
          </div>
          <div>
            <h3 className="font-semibold">{post.author.displayName}</h3>
            <p className="text-sm text-gray-500">@{post.author.username}</p>
          </div>
        </Link>
        
        <div className="flex items-center space-x-2">
          {/* Follow Button */}
          {user?.uid !== post.author.id && (
            <button
              onClick={handleFollow}
              disabled={followLoading}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                isFollowing
                  ? 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {followLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  {isFollowing ? (
                    <>
                      <UserCheck size={14} className="mr-1 inline" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus size={14} className="mr-1 inline" />
                      Follow
                    </>
                  )}
                </>
              )}
            </button>
          )}
          
          {/* More Options */}
          <div className="relative">
            <button 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <MoreHorizontal size={20} />
            </button>
            
            {isDropdownOpen && (
              <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-10 ${darkMode ? 'bg-gray-700' : 'bg-white'} ring-1 ring-black ring-opacity-5`}>
                <button 
                  className={`block w-full text-left px-4 py-2 text-sm ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Report Post
                </button>
                {post.author.id === user?.uid && (
                  <button 
                    className={`block w-full text-left px-4 py-2 text-sm ${darkMode ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-gray-100 text-red-500'}`}
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Delete Post
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Post Content */}
      <div className="px-4 pb-2">
        <p className="mb-3">{post.content}</p>
        {post.mediaUrl && renderMedia()}
      </div>
      
      {/* Post Game Tag */}
      {post.gameTag && (
        <div className="px-4 py-2">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            #{post.gameTag}
          </span>
        </div>
      )}
      
      {/* Post Stats */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-b dark:border-gray-700 border-gray-200">
        <div className="flex space-x-4">
          <button 
            className={`flex items-center ${liked ? 'text-red-500' : ''} hover:text-red-500 transition`}
            onClick={handleLike}
          >
            <Heart size={18} className={liked ? 'fill-current' : ''} />
            <span className="ml-1">{likesCount}</span>
          </button>
          
          <Link to={`/post/${post.id}`} className="flex items-center hover:text-purple-500 transition">
            <MessageCircle size={18} />
            <span className="ml-1">{post.commentsCount || 0}</span>
          </Link>
          
          <button 
            className="flex items-center hover:text-purple-500 transition"
            onClick={handleShare}
          >
            <Share size={18} />
          </button>
        </div>
        
        <button 
          className={`${saved ? 'text-yellow-500' : ''} hover:text-yellow-500 transition`}
          onClick={handleSave}
        >
          <Bookmark size={18} className={saved ? 'fill-current' : ''} />
        </button>
      </div>
      
      {/* Post Footer */}
      <div className="px-4 py-2 text-xs text-gray-500">
        {post.createdAt && format(new Date(post.createdAt.toDate()), 'MMM d, yyyy · h:mm a')}
      </div>
    </div>
  );
};

export default PostCard;