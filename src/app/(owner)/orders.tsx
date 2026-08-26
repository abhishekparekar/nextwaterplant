import React, { useEffect, useState, useMemo } from 'react';
import { 
  View, 
  FlatList, 
  Text, 
  TouchableOpacity, 
  TextInput,
  Modal,
  Alert,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { useOrderStore } from '@/store/orderStore';
import { useStaffStore } from '@/store/staffStore';
import { EmptyState } from '@/components/common/EmptyState';
import { Loader } from '@/components/common/Loader';
import { formatCurrency, getOrderSummaryText } from '@/utils/invoiceUtils';
import { formatDate } from '@/utils/dateUtils';
import { Ionicons } from '@expo/vector-icons';
import { Order } from '@/types/order';

type FilterTab = 'all' | 'pending' | 'assigned' | 'delivered' | 'cancelled';

export default function OrdersScreen() {
  const { orders, loading, fetchOrders, updateOrderStatus } = useOrderStore();
  const { staffList, fetchStaff } = useStaffStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Staff Assignment State
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchStaff();
  }, [fetchOrders, fetchStaff]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesTab = activeTab === 'all' || o.status === activeTab;
      const matchesQuery = !searchQuery.trim() || 
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        o.id.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchesTab && matchesQuery;
    });
  }, [orders, activeTab, searchQuery]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400', label: 'Delivered' };
      case 'cancelled':
        return { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-600 dark:text-rose-400', label: 'Cancelled' };
      case 'assigned':
        return { bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-600 dark:text-sky-400', label: 'In Transit' };
      default:
        return { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-600 dark:text-amber-400', label: 'Pending' };
    }
  };

  const getPaymentBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'paid':
        return { bg: 'bg-emerald-100/80 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-300', label: 'Paid' };
      case 'partial':
        return { bg: 'bg-amber-100/80 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300', label: 'Partial' };
      default:
        return { bg: 'bg-rose-100/80 dark:bg-rose-900/40', text: 'text-rose-700 dark:text-rose-300', label: 'Unpaid' };
    }
  };

  const handleAssignToDriver = async (driver: { id: string; name: string }) => {
    if (!selectedOrder) return;
    setAssigning(true);
    try {
      const { orderService } = await import('@/services/orderService');
      const { deliveryService } = await import('@/services/deliveryService');

      await orderService.assignHelper(selectedOrder.id, driver.id, driver.name);

      // Also create/sync delivery record for this driver
      try {
        const bottleQty = selectedOrder.items.reduce((sum, it) => sum + it.quantity, 0);
        await deliveryService.create({
          orderId: selectedOrder.id,
          helperId: driver.id,
          helperName: driver.name,
          customerId: selectedOrder.customerId,
          customerName: selectedOrder.customerName,
          status: 'pending',
          scheduledDate: selectedOrder.deliveryDate || new Date().toISOString(),
          bottlesDelivered: bottleQty,
          emptyBottlesReturned: 0,
          cashCollected: 0,
        });
      } catch (e) {}

      Alert.alert('Delivery Assigned', `Order has been assigned to driver: ${driver.name}!`);
      setAssignModalVisible(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err: any) {
      Alert.alert('Assignment Error', err.message || 'Failed to assign driver.');
    } finally {
      setAssigning(false);
    }
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      {/* Search and Tab Filters */}
      <View className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800/80 px-4 pt-3 pb-2">
        <View className="flex-row items-center bg-slate-100 dark:bg-slate-900/80 rounded-xl px-3 py-2 mb-3">
          <Ionicons name="search-outline" size={18} color="#94a3b8" />
          <TextInput
            placeholder="Search orders by customer or ID..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-100 ml-2.5 py-0"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Status Filter Chips */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={tabs}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => {
            const isActive = activeTab === item.key;
            return (
              <TouchableOpacity
                onPress={() => setActiveTab(item.key)}
                className={`mr-2 px-3.5 py-1.5 rounded-full border ${
                  isActive 
                    ? 'bg-sky-600 border-sky-600' 
                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700'
                }`}
                activeOpacity={0.7}
              >
                <Text 
                  className={`text-xs font-bold ${
                    isActive ? 'text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ paddingBottom: 4 }}
        />
      </View>

      {/* Orders List */}
      {loading && orders.length === 0 ? (
        <Loader />
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const status = getStatusBadge(item.status);
            const payment = getPaymentBadge(item.paymentStatus);

            return (
              <View 
                className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-4 mb-3 shadow-2xs"
              >
                <TouchableOpacity
                  onPress={() => router.push(`/order/${item.id}`)}
                  activeOpacity={0.7}
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1 pr-2">
                      <Text className="text-base font-extrabold text-slate-900 dark:text-slate-50">
                        {item.customerName}
                      </Text>
                      <Text className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                        📅 {formatDate(item.deliveryDate)}
                      </Text>
                    </View>

                    <View className="items-end gap-1">
                      <View className={`px-2.5 py-0.5 rounded-full ${status.bg}`}>
                        <Text className={`text-3xs font-black uppercase tracking-wider ${status.text}`}>
                          {status.label}
                        </Text>
                      </View>
                      <View className={`px-2 py-0.5 rounded-md ${payment.bg}`}>
                        <Text className={`text-3xs font-bold ${payment.text}`}>
                          {payment.label}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="bg-slate-50 dark:bg-slate-900/60 px-3 py-2 rounded-xl my-2 flex-row items-center gap-2">
                    <Ionicons name="cube-outline" size={14} color="#0284c7" />
                    <Text className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex-1" numberOfLines={1}>
                      {getOrderSummaryText(item)}
                    </Text>
                  </View>

                  {item.assignedHelperName && (
                    <View className="flex-row items-center gap-1.5 mb-2">
                      <Ionicons name="bicycle" size={13} color="#0D9488" />
                      <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Assigned Driver: <Text className="font-bold text-teal-600 dark:text-teal-400">{item.assignedHelperName}</Text>
                      </Text>
                    </View>
                  )}

                  <View className="flex-row justify-between items-center pt-2.5 border-t border-slate-100 dark:border-slate-700/50">
                    <Text className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Total Amount
                    </Text>
                    <Text className="text-base font-black text-slate-900 dark:text-slate-50">
                      {formatCurrency(item.totalAmount)}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* ASSIGN WORK TO DRIVER BUTTON (For Pending / Unassigned Orders) */}
                {item.status !== 'delivered' && item.status !== 'cancelled' && (
                  <View className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedOrder(item);
                        setAssignModalVisible(true);
                      }}
                      className="flex-1 bg-teal-600 py-2.5 rounded-xl flex-row justify-center items-center gap-1.5 active:opacity-75"
                      activeOpacity={0.8}
                    >
                      <Ionicons name="bicycle" size={14} color="#FFF" />
                      <Text className="text-xs font-black text-white">
                        {item.assignedHelperName ? 'Re-assign Driver' : 'Assign to Delivery Staff'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            <EmptyState 
              message={searchQuery ? `No orders matching "${searchQuery}"` : "No orders found in this category. Click + to create a new delivery order."} 
              iconName="receipt-outline" 
            />
          }
        />
      )}

      {/* ASSIGN DRIVER MODAL */}
      <Modal
        visible={assignModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAssignModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-5 pb-8 max-h-[80%]">
            <View className="flex-row justify-between items-center pb-3 mb-3 border-b border-slate-100 dark:border-slate-700">
              <View>
                <Text className="text-base font-black text-slate-900 dark:text-slate-50">
                  Assign Delivery to Staff
                </Text>
                <Text className="text-3xs text-slate-500 mt-0.5">
                  Order for: {selectedOrder?.customerName || 'Customer'} ({getOrderSummaryText(selectedOrder)})
                </Text>
              </View>
              <TouchableOpacity onPress={() => setAssignModalVisible(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 justify-center items-center">
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Active Delivery Drivers
              </Text>

              {staffList.filter(s => s.status === 'active').length === 0 ? (
                <View className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl items-center my-2">
                  <Ionicons name="people-outline" size={32} color="#94A3B8" />
                  <Text className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-2 text-center">
                    No active staff found.
                  </Text>
                  <TouchableOpacity 
                    onPress={() => {
                      setAssignModalVisible(false);
                      router.push('/(owner)/add-helper');
                    }}
                    className="mt-3 bg-sky-600 px-4 py-2 rounded-xl"
                  >
                    <Text className="text-xs font-black text-white">+ Add Staff Driver</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                staffList.filter(s => s.status === 'active').map((staff) => (
                  <TouchableOpacity
                    key={staff.id}
                    onPress={() => handleAssignToDriver(staff)}
                    disabled={assigning}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3.5 rounded-2xl mb-2.5 flex-row justify-between items-center active:opacity-75"
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center gap-3">
                      <View className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/60 justify-center items-center">
                        <Ionicons name="bicycle" size={20} color="#0D9488" />
                      </View>
                      <View>
                        <Text className="text-sm font-black text-slate-900 dark:text-slate-50">
                          {staff.name}
                        </Text>
                        <Text className="text-3xs font-semibold text-slate-500 mt-0.5">
                          📞 {staff.phone} {staff.vehicleNumber ? `• 🚚 ${staff.vehicleNumber}` : ''}
                        </Text>
                      </View>
                    </View>

                    <View className="bg-teal-600 px-3 py-1.5 rounded-xl">
                      <Text className="text-xs font-black text-white">Assign Run</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Floating Action Button */}
      <TouchableOpacity 
        className="absolute bottom-6 right-6 bg-sky-600 w-14 h-14 rounded-full justify-center items-center shadow-lg active:opacity-85 shadow-sky-600/40"
        onPress={() => router.push('/order/create')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={30} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}
