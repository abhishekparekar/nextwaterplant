import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from './firebase';
import { StaffMember } from '@/types/staff';

const CACHE_KEY = '@nextwater_staff_cache';

const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'staff_1',
    name: 'Ramesh Driver',
    phone: '9822001122',
    email: 'ramesh@driver.com',
    password: 'password123',
    role: 'driver',
    status: 'active',
    vehicleNumber: 'MH-12-AB-4050 (Tempo)',
    assignedRoute: 'Sector 4 & Industrial Zone',
    salaryOrCommission: '₹14,000 / mo',
    address: 'Near Water Plant, MIDC Phase 1',
    ownerId: 'owner_1',
    businessName: 'Abhiraj Water Plant',
    totalDeliveriesCompleted: 340,
    todayDeliveries: 18,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'staff_2',
    name: 'Suresh Patil',
    phone: '9860334455',
    email: 'suresh@driver.com',
    password: 'password123',
    role: 'helper',
    status: 'active',
    vehicleNumber: 'MH-12-CD-8812 (Mini Van)',
    assignedRoute: 'City Center & Market Yard',
    salaryOrCommission: '₹12,500 / mo',
    address: 'Station Road, Pune',
    ownerId: 'owner_1',
    businessName: 'Abhiraj Water Plant',
    totalDeliveriesCompleted: 195,
    todayDeliveries: 12,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'staff_3',
    name: 'Ganesh Shinde',
    phone: '9423889900',
    email: 'ganesh@driver.com',
    password: 'password123',
    role: 'driver',
    status: 'inactive',
    vehicleNumber: 'MH-12-XY-9009 (Pickup)',
    assignedRoute: 'Highway Hotels & Cafes',
    salaryOrCommission: '₹5 / Jar Delivered',
    address: 'Bypass Chowk',
    ownerId: 'owner_1',
    businessName: 'Abhiraj Water Plant',
    totalDeliveriesCompleted: 80,
    todayDeliveries: 0,
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const sanitizeData = (data: any): any => {
  const sanitized: any = {};
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined) {
      sanitized[key] = data[key];
    }
  });
  return sanitized;
};

export const staffService = {
  async getAll(): Promise<StaffMember[]> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      let localStaff = cached ? JSON.parse(cached) : INITIAL_STAFF;

      try {
        const q = query(collection(db, 'staff'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const remoteStaff: StaffMember[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            remoteStaff.push({
              id: d.id,
              name: data.name || 'Staff Member',
              phone: data.phone || '',
              email: data.email || '',
              password: data.password || 'password123',
              role: data.role || 'driver',
              status: data.status || 'active',
              vehicleNumber: data.vehicleNumber || '',
              assignedRoute: data.assignedRoute || '',
              salaryOrCommission: data.salaryOrCommission || '',
              address: data.address || '',
              ownerId: data.ownerId || 'owner_1',
              businessName: data.businessName || 'Abhiraj Water Plant',
              totalDeliveriesCompleted: data.totalDeliveriesCompleted || 0,
              todayDeliveries: data.todayDeliveries || 0,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt || new Date().toISOString(),
            });
          });
          await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(remoteStaff));
          return remoteStaff;
        }
      } catch (cloudErr) {
        console.warn('Using local staff store cache:', cloudErr);
      }

      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(localStaff));
      return localStaff;
    } catch (e) {
      return INITIAL_STAFF;
    }
  },

  async create(staffData: Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<StaffMember> {
    const newStaff: StaffMember = {
      ...staffData,
      id: `staff_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const sanitized = sanitizeData({
        ...staffData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      const docRef = await addDoc(collection(db, 'staff'), sanitized);
      newStaff.id = docRef.id;
    } catch (err) {
      console.warn('Offline: Saved staff locally');
    }

    const current = await this.getAll();
    const updated = [newStaff, ...current.filter(s => s.id !== newStaff.id)];
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    return newStaff;
  },

  async update(id: string, updates: Partial<StaffMember>): Promise<void> {
    const current = await this.getAll();
    const updated = current.map((s) => {
      if (s.id === id) {
        return {
          ...s,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      return s;
    });

    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(updated));

    try {
      const sanitized = sanitizeData({
        ...updates,
        updatedAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'staff', id), sanitized);
    } catch (err) {
      console.warn('Offline update for staff:', id);
    }
  },

  async toggleStatus(id: string, newStatus: 'active' | 'inactive'): Promise<void> {
    await this.update(id, { status: newStatus });
  },

  async delete(id: string): Promise<void> {
    const current = await this.getAll();
    const filtered = current.filter(s => s.id !== id);
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(filtered));

    try {
      await deleteDoc(doc(db, 'staff', id));
    } catch (err) {
      console.warn('Offline delete for staff:', id);
    }
  }
};
