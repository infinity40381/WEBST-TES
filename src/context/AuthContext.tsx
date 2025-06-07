import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  sendPasswordResetEmail, 
  sendEmailVerification 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, query, collection, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  userProfile: any;
  loading: boolean;
  registerWithEmail: (email: string, password: string, username: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const checkUsernameExists = async (username: string): Promise<boolean> => {
    const q = query(collection(db, 'users'), where('username', '==', username.toLowerCase()));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const registerWithEmail = async (email: string, password: string, username: string) => {
    try {
      // Check if username already exists
      const usernameExists = await checkUsernameExists(username);
      if (usernameExists) {
        throw new Error('Username already taken');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      
      // Create user profile
      const userDoc = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDoc, {
        uid: userCredential.user.uid,
        email,
        username: username.toLowerCase(),
        displayName: username,
        photoURL: '',
        createdAt: serverTimestamp(),
        isPrivate: false,
        gameIds: {},
        bio: '',
        socialLinks: {},
        followers: [],
        following: [],
        savedPosts: []
      });
      
      toast.success('Registration successful! Please verify your email.');
    } catch (error: any) {
      if (error.message === 'Username already taken') {
        toast.error('Username already taken. Please choose a different one.');
      } else {
        toast.error(error.message);
      }
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login successful!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user already exists
      const userDoc = doc(db, 'users', result.user.uid);
      const userSnapshot = await getDoc(userDoc);
      
      if (!userSnapshot.exists()) {
        // Generate unique username from email
        let baseUsername = result.user.email?.split('@')[0]?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'user';
        let username = baseUsername;
        let counter = 1;
        
        // Check if username exists and generate unique one
        while (await checkUsernameExists(username)) {
          username = `${baseUsername}${counter}`;
          counter++;
        }
        
        // Create new user profile
        await setDoc(userDoc, {
          uid: result.user.uid,
          email: result.user.email,
          username: username,
          displayName: result.user.displayName || username,
          photoURL: result.user.photoURL || '',
          createdAt: serverTimestamp(),
          isPrivate: false,
          gameIds: {},
          bio: '',
          socialLinks: {},
          followers: [],
          following: [],
          savedPosts: []
        });
      }
      
      toast.success('Login successful!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const verifyEmail = async () => {
    try {
      if (user) {
        await sendEmailVerification(user);
        toast.success('Verification email sent');
      }
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
    logout,
    resetPassword,
    verifyEmail
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};