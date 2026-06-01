import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, logOut, db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: () => Promise<User | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  signIn: async () => null,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          let role = 'user';
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              email: currentUser.email,
              role: 'user',
              createdAt: serverTimestamp()
            });
          } else {
            role = userSnap.data().role;
          }
          
          const userEmail = currentUser.email?.toLowerCase() || '';
          const adminStatus = role === 'admin' || 
                              userEmail === 'rajeshkumar1112000@gmail.com' || 
                              userEmail === 'admin@agrirecord.com';
          setIsAdmin(adminStatus);
        } catch (error) {
          console.error("Error fetching user role:", error);
          const userEmail = currentUser.email?.toLowerCase() || '';
          setIsAdmin(userEmail === 'rajeshkumar1112000@gmail.com' || userEmail === 'admin@agrirecord.com');
        }
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      const loggedInUser = await signInWithGoogle();
      return loggedInUser;
    } catch (error) {
      console.error("Sign in failed in context:", error);
      throw error;
    }
  };

  const signOut = async () => {
    await logOut();
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
