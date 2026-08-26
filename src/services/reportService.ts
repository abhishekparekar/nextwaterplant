import { 
  getDocs 
} from 'firebase/firestore';
import { getTenantCollection } from './firebase';

export interface DashboardReportSummary {
  totalRevenue: number;
  totalOrders: number;
  completedDeliveries: number;
  pendingDeliveries: number;
  outstandingBalance: number;
}

export const reportService = {
  /**
   * Generates summary statistics for a given date range
   */
  async getDashboardSummary(): Promise<DashboardReportSummary> {
    // Note: In production, these calculations would ideally be done via Cloud Functions or indices
    // Here we perform basic client-side aggregations over snapshots
    const ordersSnap = await getDocs(getTenantCollection('orders'));
    const customersSnap = await getDocs(getTenantCollection('customers'));
    const deliveriesSnap = await getDocs(getTenantCollection('deliveries'));

    let totalRevenue = 0;
    let totalOrders = 0;
    let completedDeliveries = 0;
    let pendingDeliveries = 0;
    let outstandingBalance = 0;

    ordersSnap.forEach((doc) => {
      const data = doc.data();
      totalOrders++;
      if (data.paymentStatus === 'paid') {
        totalRevenue += data.totalAmount || 0;
      } else if (data.paymentStatus === 'partial') {
        totalRevenue += data.amountPaid || 0;
      }
    });

    deliveriesSnap.forEach((doc) => {
      const data = doc.data();
      if (data.status === 'completed') {
        completedDeliveries++;
      } else if (data.status === 'pending' || data.status === 'in_progress') {
        pendingDeliveries++;
      }
    });

    customersSnap.forEach((doc) => {
      const data = doc.data();
      outstandingBalance += data.balance || 0;
    });

    return {
      totalRevenue,
      totalOrders,
      completedDeliveries,
      pendingDeliveries,
      outstandingBalance
    };
  }
};
