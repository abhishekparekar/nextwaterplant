import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  runTransaction, 
  query, 
  where,
  orderBy 
} from 'firebase/firestore';
import { db, getTenantCollection } from './firebase';
import { Payment } from '@/types/payment';

const COLLECTION_NAME = 'payments';

export const paymentService = {
  /**
   * Get payments by customer
   */
  async getByCustomer(customerId: string): Promise<Payment[]> {
    const q = query(
      getTenantCollection(COLLECTION_NAME),
      where('customerId', '==', customerId),
      orderBy('paymentDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const payments: Payment[] = [];
    querySnapshot.forEach((doc) => {
      payments.push({ id: doc.id, ...doc.data() } as Payment);
    });
    return payments;
  },

  /**
   * Process a payment transaction, updating the customer outstanding balance transactionally
   */
  async processPayment(paymentData: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    const customerDocRef = doc(db, 'tenants', 'waterplant', 'customers', paymentData.customerId);
    const paymentsCollectionRef = getTenantCollection(COLLECTION_NAME);
    const now = new Date().toISOString();
    
    let createdPayment: Payment | null = null;

    await runTransaction(db, async (transaction) => {
      const customerDoc = await transaction.get(customerDocRef);
      if (!customerDoc.exists()) {
        throw new Error('Customer does not exist.');
      }
      
      const currentBalance = customerDoc.data().balance || 0;
      // Deduct payment amount from customer balance dues
      const newBalance = currentBalance - paymentData.amount;
      
      // Update balance
      transaction.update(customerDocRef, {
        balance: newBalance,
        updatedAt: now
      });
      
      // Create payment document reference inside the transaction
      const newPaymentDocRef = doc(paymentsCollectionRef);
      createdPayment = {
        id: newPaymentDocRef.id,
        ...paymentData,
        createdAt: now
      };
      
      transaction.set(newPaymentDocRef, {
        ...paymentData,
        createdAt: now
      });
    });

    if (!createdPayment) {
      throw new Error('Transaction failed.');
    }
    return createdPayment;
  }
};
