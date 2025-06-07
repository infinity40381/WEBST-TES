import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, collection, addDoc, serverTimestamp, query, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const likePost = async (postId: string, userId: string, like: boolean) => {
  const postRef = doc(db, 'posts', postId);
  
  try {
    if (like) {
      await updateDoc(postRef, {
        likes: arrayUnion(userId)
      });
      
      // Create notification for post author
      const postDoc = await getDoc(postRef);
      if (postDoc.exists()) {
        const postData = postDoc.data();
        if (postData.author.id !== userId) {
          const userDoc = await getDoc(doc(db, 'users', userId));
          const userData = userDoc.data();
          
          await addDoc(collection(db, 'notifications'), {
            userId: postData.author.id,
            type: 'like',
            from: {
              id: userId,
              username: userData?.username,
              displayName: userData?.displayName,
              photoURL: userData?.photoURL || ''
            },
            content: `${userData?.displayName} liked your post`,
            resourceId: postId,
            createdAt: serverTimestamp(),
            read: false
          });
        }
      }
    } else {
      await updateDoc(postRef, {
        likes: arrayRemove(userId)
      });
    }
  } catch (error) {
    console.error('Error updating post likes:', error);
    throw error;
  }
};

export const savePost = async (postId: string, userId: string, save: boolean) => {
  const postRef = doc(db, 'posts', postId);
  const userRef = doc(db, 'users', userId);
  
  try {
    if (save) {
      await updateDoc(postRef, {
        saves: arrayUnion(userId)
      });
      
      // Also update user's saved posts list
      await updateDoc(userRef, {
        savedPosts: arrayUnion(postId)
      });
    } else {
      await updateDoc(postRef, {
        saves: arrayRemove(userId)
      });
      
      // Also update user's saved posts list
      await updateDoc(userRef, {
        savedPosts: arrayRemove(postId)
      });
    }
  } catch (error) {
    console.error('Error updating saved post:', error);
    throw error;
  }
};

export const addComment = async (postId: string, userId: string, comment: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();
    
    const commentData = {
      text: comment,
      author: {
        id: userId,
        username: userData?.username,
        displayName: userData?.displayName,
        photoURL: userData?.photoURL || ''
      },
      createdAt: serverTimestamp(),
      likes: []
    };
    
    // Add comment to comments collection
    const commentsRef = collection(db, 'posts', postId, 'comments');
    await addDoc(commentsRef, commentData);
    
    // Update comment count on post
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    const currentCount = postSnap.data()?.commentsCount || 0;
    const postData = postSnap.data();
    
    await updateDoc(postRef, {
      commentsCount: currentCount + 1
    });
    
    // Create notification for post author
    if (postData && postData.author.id !== userId) {
      await addDoc(collection(db, 'notifications'), {
        userId: postData.author.id,
        type: 'comment',
        from: {
          id: userId,
          username: userData?.username,
          displayName: userData?.displayName,
          photoURL: userData?.photoURL || ''
        },
        content: `${userData?.displayName} commented on your post`,
        resourceId: postId,
        createdAt: serverTimestamp(),
        read: false
      });
    }
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const getPostComments = async (postId: string) => {
  try {
    const commentsRef = collection(db, 'posts', postId, 'comments');
    const q = query(commentsRef);
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

export const deletePost = async (postId: string, userId: string) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    
    if (!postSnap.exists()) {
      throw new Error('Post not found');
    }
    
    const postData = postSnap.data();
    
    if (postData.author.id !== userId) {
      throw new Error('Not authorized to delete this post');
    }
    
    await deleteDoc(postRef);
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};