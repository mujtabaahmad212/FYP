import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../utils/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [originalRole, setOriginalRole] = useState(null); // For role switching

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (firebaseUser.isAnonymous) {
          const guestUser = { ...firebaseUser, role: 'guest', displayName: 'Guest User' };
          setUser(guestUser);
          setOriginalRole('guest');
        } else {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = { ...firebaseUser, ...userDoc.data() };
            setUser(userData);
            if (!originalRole) { // Only set originalRole once on login
              setOriginalRole(userData.role);
            }
          } else {
            // If user exists in auth but not in firestore, create a doc
            const newUser = {
              email: firebaseUser.email,
              role: 'viewer', // Default role for new signups
              displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              photoURL: firebaseUser.photoURL,
              createdAt: new Date()
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newUser, { merge: true });
            setUser({ ...firebaseUser, ...newUser });
            if (!originalRole) {
              setOriginalRole(newUser.role);
            }
          }
        }
      } else {
        setUser(null);
        setOriginalRole(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [originalRole]); // Added originalRole as dependency

  const login = (email, password) => {
    // Reset originalRole on login
    setOriginalRole(null); 
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email, password, role = 'viewer') => { // Default to viewer
    setOriginalRole(null);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;
    const newUser = {
      email: user.email,
      role: role,
      displayName: user.email.split('@')[0],
      createdAt: new Date()
    };
    await setDoc(doc(db, 'users', user.uid), newUser);
    setUser({ ...user, ...newUser });
    setOriginalRole(role);
    return userCredential;
  };

  const loginAsGuest = async () => {
    setOriginalRole(null);
    const userCredential = await signInAnonymously(auth);
    const guestUser = { ...userCredential.user, role: 'guest', displayName: 'Guest User' };
    setUser(guestUser);
    setOriginalRole('guest');
    return userCredential;
  };

  const loginWithGoogle = async () => {
    setOriginalRole(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // The onAuthStateChanged listener will handle the user creation/update
    } catch (error) {
      console.error("Error during Google login:", error);
      throw error;
    }
  };

  const loginWithPhone = (phoneNumber, recaptchaVerifier) => {
    setOriginalRole(null);
    return signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  };

  const logout = () => {
    return signOut(auth);
  };

  // ADDED: Function for RoleSwitcher
  const switchRole = (newRole) => {
    if (user && originalRole === 'admin') {
      setUser(prevUser => ({ ...prevUser, role: newRole }));
    } else {
      console.warn('Only admins can switch roles.');
    }
  };

  // ADDED: Function for RoleSwitcher
  const resetRole = () => {
    if (user && originalRole) {
      setUser(prevUser => ({ ...prevUser, role: originalRole }));
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    userRole: user?.role, // <-- Added this for convenience
    isLoading,
    login,
    signup,
    loginAsGuest,
    logout,
    originalRole,
    loginWithGoogle,
    loginWithPhone,
    switchRole, // <-- ADDED
    resetRole,  // <-- ADDED
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};