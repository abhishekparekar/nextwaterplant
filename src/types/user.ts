export type UserRole = 'owner' | 'helper' | 'customer' | 'superadmin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  supportPhone?: string;
  businessName?: string;
  address?: string;
  pricePerJar?: number;
  depositPerJar?: number;
  customerId?: string;
  createdAt: string;
  updatedAt: string;
}



