import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, logOut, db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  freeCredits: number;
  loading: boolean;
  signIn: () => Promise<User | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  freeCredits: 0,
  loading: true,
  signIn: async () => null,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [freeCredits, setFreeCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;
    
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }
      
      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              email: currentUser.email,
              name: currentUser.displayName || '',
              role: 'user',
              freeCredits: 0,
              createdAt: serverTimestamp()
            });
            setIsAdmin(false);
            setFreeCredits(0);
          }
          
          // Listen to user document to get real-time updates for freeCredits and role
          unsubscribeSnapshot = onSnapshot(userRef, (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              const role = data.role;
              setFreeCredits(data.freeCredits || 0);

              const userEmail = currentUser.email?.toLowerCase() || '';
              const adminStatus = role === 'admin' || 
                                  userEmail === 'rajeshkumar1112000@gmail.com' || 
                                  userEmail === 'admin@agrirecord.com';
              setIsAdmin(adminStatus);
            }
          });
          
        } catch (error) {
          console.error("Error fetching user role:", error);
          const userEmail = currentUser.email?.toLowerCase() || '';
          setIsAdmin(userEmail === 'rajeshkumar1112000@gmail.com' || userEmail === 'admin@agrirecord.com');
          setFreeCredits(0);
        }
      } else {
        setIsAdmin(false);
        setFreeCredits(0);
      }
      
      setLoading(false);
    });
    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
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
    <AuthContext.Provider value={{ user, isAdmin, freeCredits, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
