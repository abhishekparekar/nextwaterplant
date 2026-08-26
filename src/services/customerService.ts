import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, getTenantCollection } from './firebase';
import { Customer } from '@/types/customer';

const COLLECTION_NAME = 'customers';
const CACHE_KEY = '@nextwater_customers_cache';

// Helper to remove any undefined fields before Firestore operations
const sanitizeData = <T extends Record<string, any>>(obj: T): Partial<T> => {
  const clean: Record<string, any> = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined) {
      clean[key] = obj[key];
    }
  });
  return clean as Partial<T>;
};

export const customerService = {
  /**
   * Fetch all customers ordered by name (with local cache fallback)
   */
  async getAll(): Promise<Customer[]> {
    try {
      const q = query(getTenantCollection(COLLECTION_NAME), orderBy('name', 'asc'));
      const querySnapshot = await getDocs(q);
      const customers: Customer[] = [];
      querySnapshot.forEach((docSnap) => {
        customers.push({ id: docSnap.id, ...docSnap.data() } as Customer);
      });

      if (customers.length > 0) {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(customers));
        return customers;
      }
    } catch (err) {
      console.warn('Firestore fetch failed, checking local cache:', err);
    }

    // Check local AsyncStorage cache
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {}

    return [];
  },

  /**
   * Get single customer by id
   */
  async getById(id: string): Promise<Customer | null> {
    try {
      const docRef = doc(db, 'tenants', 'waterplant', COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Customer;
      }
    } catch (e) {}

    const all = await this.getAll();
    return all.find((c) => c.id === id) || null;
  },

  /**
   * Create a new customer record
   */
  async create(customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    const now = new Date().toISOString();
    const cleanPayload = sanitizeData({
      ...customerData,
      createdAt: now,
      updatedAt: now
    });

    let newId = `cust_${Date.now()}`;

    try {
      const docRef = await addDoc(getTenantCollection(COLLECTION_NAME), cleanPayload);
      newId = docRef.id;
    } catch (err) {
      console.warn('Firestore create customer failed, persisting to local storage:', err);
    }

    const newCustomer: Customer = {
      id: newId,
      ...customerData,
      createdAt: now,
      updatedAt: now
    };

    // Update local cache
    try {
      const currentList = await this.getAll();
      const updatedList = [newCustomer, ...currentList.filter((c) => c.id !== newId)];
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(updatedList));
    } catch (e) {}

    return newCustomer;
  },

  /**
   * Update existing customer
   */
  async update(id: string, updates: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const now = new Date().toISOString();
    const cleanUpdates = sanitizeData({
      ...updates,
      updatedAt: now
    });

    try {
      const docRef = doc(db, 'tenants', 'waterplant', COLLECTION_NAME, id);
      await updateDoc(docRef, cleanUpdates);
    } catch (err) {
      console.warn('Firestore update failed, updating local cache:', err);
    }

    try {
      const currentList = await this.getAll();
      const updatedList = currentList.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: now } : c));
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(updatedList));
    } catch (e) {}
  },

  /**
   * Delete customer
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'tenants', 'waterplant', COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (e) {}

    try {
      const currentList = await this.getAll();
      const updatedList = currentList.filter((c) => c.id !== id);
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(updatedList));
    } catch (e) {}
  }
};

