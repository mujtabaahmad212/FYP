import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../utils/firebase';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to auth state and pull user role from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let role = null;
        let email = firebaseUser.email || '';
        let displayName =
          firebaseUser.displayName || email?.split('@')[0] || 'User';

        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            role = data.role || null;
            displayName = data.displayName || displayName;
          }
        } catch (e) {}

        // If role not found or not admin/officer, sign out immediately
        if (!role || (role !== 'admin' && role !== 'officer')) {
          await signOut(auth);
          setUser(null);
          setIsLoading(false);
          return;
        }

        setUser({
          uid: firebaseUser.uid,
          email,
          displayName,
          role,
          isAnonymous: firebaseUser.isAnonymous || false,
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Only admin/officer can login now
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = credential.user;
      // Fetch Firestore role
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!userDoc.exists() || !['admin', 'officer'].includes(userDoc.data().role)) {
        await signOut(auth);
        setIsLoading(false);
        throw new Error('Not authorized! Only admin and officer can login.');
      }
      setIsLoading(false);
      return credential;
    } catch (e) {
      setIsLoading(false);
      throw e;
    }
  };

  // Disable signup for new users
  const signup = async () => {
    throw new Error('Sign up is not allowed. Contact the administrator.');
  };

  // Google login (block unless user role set)
  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!userDoc.exists() || !['admin', 'officer'].includes(userDoc.data().role)) {
        await signOut(auth);
        setIsLoading(false);
        throw new Error('Not authorized! Only admin and officer can login.');
      }
      setIsLoading(false);
      return result;
    } catch (e) {
      setIsLoading(false);
      throw e;
    }
  };

  // Guest login (OPTIONAL, leave if you want guest/anonymous support)
  const loginAsGuest = async () => {
    setIsLoading(true);
    try {
      const credential = await signInAnonymously(auth);
      setIsLoading(false);
      return credential;
    } catch (e) {
      setIsLoading(false);
      throw e;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        userRole: user?.role || 'guest',
        isLoading,
        login,
        signup,
        loginAsGuest,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
