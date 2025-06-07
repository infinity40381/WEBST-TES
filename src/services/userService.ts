import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export const followUser = async (currentUserId: string, targetUserId: string) => {
  try {
    const currentUserRef = doc(db, 'users', currentUserId);
    const targetUserRef = doc(db, 'users', targetUserId);
    
    // Update current user's following list
    await updateDoc(currentUserRef, {
      following: arrayUnion(targetUserId)
    });
    
    // Update target user's followers list
    await updateDoc(targetUserRef, {
      followers: arrayUnion(currentUserId)
    });
    
    // Get current user data for notification
    const currentUserDoc = await getDoc(currentUserRef);
    const currentUserData = currentUserDoc.data();
    
    // Create notification for the followed user
    await addDoc(collection(db, 'notifications'), {
      userId: targetUserId,
      type: 'follow',
      from: {
        id: currentUserId,
        username: currentUserData?.username,
        displayName: currentUserData?.displayName,
        photoURL: currentUserData?.photoURL || ''
      },
      content: `${currentUserData?.displayName} started following you`,
      resourceId: '',
      createdAt: serverTimestamp(),
      read: false
    });
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

export const unfollowUser = async (currentUserId: string, targetUserId: string) => {
  try {
    const currentUserRef = doc(db, 'users', currentUserId);
    const targetUserRef = doc(db, 'users', targetUserId);
    
    // Update current user's following list
    await updateDoc(currentUserRef, {
      following: arrayRemove(targetUserId)
    });
    
    // Update target user's followers list
    await updateDoc(targetUserRef, {
      followers: arrayRemove(currentUserId)
    });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};

export const getUserFollowers = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();
    return userData?.followers || [];
  } catch (error) {
    console.error('Error getting followers:', error);
    throw error;
  }
};

export const getUserFollowing = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();
    return userData?.following || [];
  } catch (error) {
    console.error('Error getting following:', error);
    throw error;
  }
};