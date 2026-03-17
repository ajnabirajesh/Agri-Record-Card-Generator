import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Error signing in with Google", error);
    if (error.code === 'auth/popup-blocked') {
      alert("Login popup was blocked by your browser. Please allow popups for this site and try again.");
    } else if (error.code === 'auth/unauthorized-domain') {
      alert("This domain is not authorized for Firebase Auth. Please add it in the Firebase Console.");
    } else if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
      // User closed the popup, no need to alert aggressively
      console.log("Login cancelled by user.");
    } else {
      alert(`Login failed: ${error.message}`);
    }
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    console.error("Error signing in with email", error);
    
    // In newer Firebase versions, both "user not found" and "wrong password" 
    // return 'auth/invalid-credential' to prevent email enumeration.
    // So if we get this error, we'll try to create the account.
    // If the account already exists, creation will fail with 'auth/email-already-in-use',
    // which means the user just typed the wrong password.
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
      try {
        console.log("Account might not exist. Attempting to create it...");
        const newResult = await createUserWithEmailAndPassword(auth, email, password);
        console.log("Account created successfully!");
        return newResult.user;
      } catch (createError: any) {
        if (createError.code === 'auth/email-already-in-use') {
          // The account DOES exist, so the original error was indeed a wrong password.
          console.error("Account exists. The password was incorrect.");
          throw error; // Throw the original invalid-credential error
        }
        console.error("Failed to create account", createError);
        throw createError;
      }
    }
    
    throw error;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};
