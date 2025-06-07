import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Heart, Send } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getPostComments, addComment } from '../services/postService';
import { format } from 'date-fns';
import PostCard from '../components/feed/PostCard';
import Loading from '../components/ui/Loading';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { darkMode } = useTheme();
  const { user, userProfile } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPostAndComments = async () => {
      if (!id) return;

      try {
        // Get post
        const postDoc = await getDoc(doc(db, 'posts', id));
        
        if (postDoc.exists()) {
          setPost({
            id: postDoc.id,
            ...postDoc.data()
          });
        }

        // Get comments
        const fetchedComments = await getPostComments(id);
        setComments(fetchedComments);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching post:', error);
        setLoading(false);
      }
    };

    fetchPostAndComments();
  }, [id]);

  // For demo purposes, add sample data if no post exists
  useEffect(() => {
    if (!loading && !post) {
      const samplePost = {
        id: id,
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
      };
      
      setPost(samplePost);
      
      if (comments.length === 0) {
        const sampleComments = [
          {
            id: 'comment1',
            text: 'Amazing play! What agent were you using?',
            author: {
              id: 'user2',
              username: 'gamerfan',
              displayName: 'Gamer Fan',
              photoURL: ''
            },
            createdAt: { toDate: () => new Date(Date.now() - 3600000) },
            likes: []
          },
          {
            id: 'comment2',
            text: 'We should team up sometime!',
            author: {
              id: 'user3',
              username: 'teammateready',
              displayName: 'Teammate',
              photoURL: 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
            },
            createdAt: { toDate: () => new Date(Date.now() - 7200000) },
            likes: []
          },
          {
            id: 'comment3',
            text: 'Share some tips please!',
            author: {
              id: 'user4',
              username: 'newbie',
              displayName: 'Newbie Player',
              photoURL: ''
            },
            createdAt: { toDate: () => new Date(Date.now() - 10800000) },
            likes: []
          }
        ];
        
        setComments(sampleComments);
      }
    }
  }, [loading, post, comments.length, id]);

  const handleSubmitComment = async () => {
    if (!comment.trim() || !id || !user) return;
    
    try {
      setSubmitting(true);
      await addComment(id, user.uid, comment);
      
      // Add new comment to the list
      const newComment = {
        id: `temp-${Date.now()}`,
        text: comment,
        author: {
          id: user.uid,
          username: userProfile?.username,
          displayName: userProfile?.displayName,
          photoURL: userProfile?.photoURL || ''
        },
        createdAt: { toDate: () => new Date() },
        likes: []
      };
      
      setComments([newComment, ...comments]);
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <p>Post not found</p>
        <Link to="/" className="text-purple-500 hover:underline">Go back home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link to="/" className="flex items-center text-purple-500">
          <ArrowLeft size={20} className="mr-1" />
          Back to feed
        </Link>
      </div>

      <PostCard post={post} />

      {/* Comments Section */}
      <div className={`rounded-xl shadow-md overflow-hidden ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} mb-6`}>
        <div className="p-4 border-b dark:border-gray-700 border-gray-200">
          <h2 className="text-xl font-semibold">Comments ({comments.length})</h2>
        </div>

        {/* Comment Input */}
        <div className="p-4 border-b dark:border-gray-700 border-gray-200">
          <div className="flex space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-500 flex items-center justify-center">
                {userProfile?.photoURL ? (
                  <img src={userProfile.photoURL} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <User size={18} className="text-white" />
                )}
              </div>
            </div>
            <div className="flex-grow">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                rows={2}
                className={`w-full p-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'
                }`}
              ></textarea>
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleSubmitComment}
                  disabled={!comment.trim() || submitting}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    !comment.trim() || submitting
                      ? 'bg-purple-400 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700'
                  } text-white font-medium transition`}
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send size={16} className="mr-2" />
                      Post
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="p-4 space-y-4">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-500 flex items-center justify-center">
                    {comment.author.photoURL ? (
                      <img src={comment.author.photoURL} alt={comment.author.username} className="w-full h-full object-cover" />
                    ) : (
                      <User size={18} className="text-white" />
                    )}
                  </div>
                </div>
                <div className="flex-grow">
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <Link to={`/profile/${comment.author.id}`} className="font-medium hover:underline">
                          {comment.author.displayName}
                        </Link>
                        <span className="text-sm text-gray-500 ml-2">
                          @{comment.author.username}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {comment.createdAt && format(new Date(comment.createdAt.toDate()), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <p>{comment.text}</p>
                    <div className="mt-2 flex items-center">
                      <button className="flex items-center text-gray-500 hover:text-red-500 transition">
                        <Heart size={16} />
                        <span className="ml-1 text-xs">{comment.likes?.length || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Be the first to comment on this post!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;