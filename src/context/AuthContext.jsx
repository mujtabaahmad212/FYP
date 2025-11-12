import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../utils/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithPhoneNumber
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      if (firebaseUser) {
        // If phone or google login, may need to create the user profile
        let role = 'viewer';
        let displayName = firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User');
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            role = data.role || role;
            displayName = data.displayName || displayName;
          } else {
            // First time user, create profile
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              email: firebaseUser.email || '',
              displayName,
              role: role,
              createdAt: new Date().toISOString(),
            });
          }
        } catch (e) {
          // Ignore if profile fetch fails
        }
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
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

  // Direct Firebase login/signup
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      setIsLoading(false);
      return credential;
    } catch (e) {
      setIsLoading(false);
      throw e;
    }
  };

  const signup = async (email, password, role = 'viewer') => {
    setIsLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', credential.user.uid), {
        email,
        displayName: email.split('@')[0],
        role,
        createdAt: new Date().toISOString(),
      });
      setIsLoading(false);
      return credential;
    } catch (e) {
      setIsLoading(false);
      throw e;
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setIsLoading(false);
      return result;
    } catch (e) {
      setIsLoading(false);
      throw e;
    }
  };

  // Example only—show phone login with recaptchaVerifier
  const loginWithPhone = async (phoneNumber, recaptchaVerifier) => {
    setIsLoading(true);
    try {
      const result = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      setIsLoading(false);
      return result;
    } catch (e) {
      setIsLoading(false);
      throw e;
    }
  };

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
        loginWithPhone,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
