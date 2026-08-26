import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeAuth, 
  // @ts-ignore
  getReactNativePersistence, 
  getAuth,
  Auth
} from 'firebase/auth';
import { getFirestore, collection, doc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '@/constants/config';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(APP_CONFIG.firebase) : getApp();

// Initialize Firebase Auth with React Native AsyncStorage persistence
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  // If already initialized, get current auth instance
  auth = getAuth(app);
}

const db = getFirestore(app);

// Root path for the current water plant tenant
export const getTenantDocRef = () => doc(db, 'tenants', 'waterplant');

// Helper to get a tenant-scoped subcollection reference
export const getTenantCollection = (subcollectionName: string) => {
  return collection(db, 'tenants', 'waterplant', subcollectionName);
};

export { app, auth, db };
export default app;
