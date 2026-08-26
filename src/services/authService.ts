import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile, UserRole } from '@/types/user';

export const authService = {
  /**
   * Signs in user with email and password and loads their role/profile
   */
  async signIn(email: string, password: string): Promise<UserProfile> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Fetch user profile from Firestore
    const userDocRef = doc(db, 'tenants', 'waterplant', 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      throw new Error('User profile not found in database.');
    }
    
    return userDoc.data() as UserProfile;
  },

  /**
   * Registers a new user and sets their initial role in Firestore
   */
  async signUp(
    email: string, 
    password: string, 
    displayName: string, 
    role: UserRole, 
    phoneNumber?: string,
    businessName?: string,
    address?: string
  ): Promise<UserProfile> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update display name in Firebase Auth
    await updateProfile(user, { displayName });
    
    const now = new Date().toISOString();
    const profile: UserProfile = {
      uid: user.uid,
      email,
      displayName,
      role,
      phoneNumber,
      businessName,
      address,
      createdAt: now,
      updatedAt: now
    };
    
    // Save profile to Firestore
    await setDoc(doc(db, 'tenants', 'waterplant', 'users', user.uid), profile);
    
    return profile;
  },

  /**
   * Registers a helper (driver) via a secondary Firebase app instance to avoid logging out the current owner
   */
  async registerHelper(
    email: string, 
    password: string, 
    displayName: string, 
    phoneNumber: string, 
    address?: string
  ): Promise<UserProfile> {
    // Lazy import setup configuration to avoid circular dependencies
    const { initializeApp } = require('firebase/app');
    const { getAuth, createUserWithEmailAndPassword, updateProfile } = require('firebase/auth');
    const { APP_CONFIG } = require('@/constants/config');

    const tempAppName = `HelperTempApp_${Date.now()}`;
    const tempApp = initializeApp(APP_CONFIG.firebase, tempAppName);
    const tempAuth = getAuth(tempApp);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(tempAuth, email, password);
      const tempUser = userCredential.user;
      
      await updateProfile(tempUser, { displayName });
      
      const now = new Date().toISOString();
      const profile: UserProfile = {
        uid: tempUser.uid,
        email,
        displayName,
        role: 'helper',
        phoneNumber,
        address,
        createdAt: now,
        updatedAt: now
      };
      
      // Save profile to Firestore using the primary db reference
      await setDoc(doc(db, 'tenants', 'waterplant', 'users', tempUser.uid), profile);
      
      return profile;
    } finally {
      // Clean up temporary application context
      await tempApp.delete();
    }
  },

  /**
   * Logs out current user
   */
  async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  },

  /**
   * Get user profile from db
   */
  async getProfile(uid: string): Promise<UserProfile | null> {
    const userDocRef = doc(db, 'tenants', 'waterplant', 'users', uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  },

  /**
   * Updates user profile in Firestore
   */
  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const { updateDoc } = require('firebase/firestore');
    const userDocRef = doc(db, 'tenants', 'waterplant', 'users', uid);
    const now = new Date().toISOString();
    const payload = {
      ...updates,
      updatedAt: now
    };
    await updateDoc(userDocRef, payload);
    
    // Update display name in Firebase auth session if modified
    if (updates.displayName && auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: updates.displayName });
    }

    const updatedDoc = await getDoc(userDocRef);
    return updatedDoc.data() as UserProfile;
  }
};
