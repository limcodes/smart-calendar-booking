import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// User profile interface
export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  displayName?: string;
  createdAt: Date;
}

// Register a new user
export const registerUser = async (email: string, password: string, username: string, displayName: string): Promise<UserProfile> => {
  try {
    // Check if username is already taken
    const usernameDoc = await getDoc(doc(db, 'usernames', username));
    if (usernameDoc.exists()) {
      throw new Error('Username is already taken');
    }

    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with display name
    await updateProfile(user, {
      displayName: displayName || username
    });
    
    // Create user profile in Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      username,
      displayName: displayName || username,
      createdAt: new Date()
    };
    
    // Save user profile to Firestore
    await setDoc(doc(db, 'users', user.uid), userProfile);
    
    // Reserve the username
    await setDoc(doc(db, 'usernames', username), { uid: user.uid });
    
    return userProfile;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Sign in existing user
export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Sign out user
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Get user profile by username
export const getUserProfileByUsername = async (username: string): Promise<UserProfile | null> => {
  try {
    // Find the user ID associated with this username
    const usernameDoc = await getDoc(doc(db, 'usernames', username));
    if (!usernameDoc.exists()) {
      return null;
    }

    const uid = usernameDoc.data().uid;
    
    // Get the user profile using the user ID
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      return null;
    }
    
    return userDoc.data() as UserProfile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};
