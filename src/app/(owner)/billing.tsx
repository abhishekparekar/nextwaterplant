import React, { useEffect, useState, useMemo } from 'react';
import { 
  View, 
  FlatList, 
  Text, 
  Modal, 
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCustomerStore } from '@/store/customerStore';
import { paymentService } from '@/services/paymentService';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Loader } from '@/components/common/Loader';
import { formatCurrency } from '@/utils/invoiceUtils';
import { ROUTES } from '@/constants/routes';
import { Ionicons } from '@expo/vector-icons';
import { Customer } from '@/types/customer';
import { PaymentMethod } from '@/types/payment';

type BillingFilter = 'all' | 'dues' | 'settled';

export default function BillingScreen() {
  const router = useRouter();
  const { customers, loading, fetchCustomers } = useCustomerStore();
  const { user } = useAuthStore();
  const [selectedCust, setSelectedCust] = useState<Customer | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<BillingFilter>('dues');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch = !searchQuery.trim() || 
        c.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        c.phone.includes(searchQuery.trim());
      
      let matchesFilter = true;
      if (filter === 'dues') matchesFilter = c.balance > 0;
      if (filter === 'settled') matchesFilter = c.balance <= 0;

      return matchesSearch && matchesFilter;
    });
  }, [customers, searchQuery, filter]);

  const summary = useMemo(() => {
    let totalDues = 0;
    let totalAdvance = 0;
    let countWithDues = 0;

    customers.forEach((c) => {
      if (c.balance > 0) {
        totalDues += c.balance;
        countWithDues++;
      } else if (c.balance < 0) {
        totalAdvance += Math.abs(c.balance);
      }
    });

    return { totalDues, totalAdvance, countWithDues };
  }, [customers]);

  const openPaymentModal = (cust: Customer) => {
    setSelectedCust(cust);
    setAmount(cust.balance > 0 ? cust.balance.toString() : '');
    setModalVisible(true);
  };

  const handleRecordPayment = async () => {
    if (!selectedCust) return;
    const payAmt = parseFloat(amount);
    
    if (isNaN(payAmt) || payAmt <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid amount greater than 0.');
      return;
    }

    setSubmitting(true);
    try {
      await paymentService.processPayment({
        customerId: selectedCust.id,
        customerName: selectedCust.name,
        amount: payAmt,
        method: paymentMethod,
        receivedById: user?.uid || 'unknown',
        receivedByName: user?.displayName || 'Owner',
        paymentDate: new Date().toISOString(),
      });
      
      Alert.alert('Success', `Payment of ${formatCurrency(payAmt)} received via ${paymentMethod.toUpperCase()}`);
      setModalVisible(false);
      setAmount('');
      setSelectedCust(null);
      fetchCustomers();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      <View className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 px-4 pt-3 pb-3">
        <View className="bg-rose-500 rounded-2xl p-4 mb-3 flex-row justify-between items-center shadow-sm shadow-rose-500/30">
          <View>
            <Text className="text-3xs font-black text-rose-100 uppercase tracking-widest">
              Total Uncollected Dues
            </Text>
            <Text className="text-2xl font-black text-white mt-0.5">
              {formatCurrency(summary.totalDues)}
            </Text>
            <Text className="text-3xs text-rose-100 font-semibold mt-1">
              Pending across {summary.countWithDues} clients
            </Text>
          </View>

          <View className="w-12 h-12 rounded-2xl bg-white/20 justify-center items-center">
            <Ionicons name="wallet-outline" size={24} color="#FFF" />
          </View>
        </View>

        {/* Quick Create Entry Actions */}
        <View className="flex-row gap-2 mb-2.5">
          <TouchableOpacity 
            onPress={() => router.push(ROUTES.ORDER.CREATE)}
            className="flex-1 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 py-2 rounded-xl flex-row justify-center items-center gap-1.5 active:opacity-75"
            activeOpacity={0.7}
          >
            <Ionicons name="cart" size={15} color="#0284c7" />
            <Text className="text-xs font-black text-sky-700 dark:text-sky-300">+ New Order / Entry</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push(ROUTES.OWNER.CUSTOMERS)}
            className="flex-1 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 py-2 rounded-xl flex-row justify-center items-center gap-1.5 active:opacity-75"
            activeOpacity={0.7}
          >
            <Ionicons name="person-add" size={14} color="#6366f1" />
            <Text className="text-xs font-black text-indigo-700 dark:text-indigo-300">+ New Client</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center bg-slate-100 dark:bg-slate-900/80 rounded-xl px-3 py-2 mb-2.5">
          <Ionicons name="search-outline" size={18} color="#94a3b8" />
          <TextInput
            placeholder="Search customer for payment..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-100 ml-2.5 py-0"
          />
        </View>

        <View className="flex-row gap-2">
          {(['dues', 'all', 'settled'] as BillingFilter[]).map((tab) => {
            const isActive = filter === tab;
            const label = tab === 'dues' ? `With Dues (${summary.countWithDues})` : tab === 'all' ? 'All Clients' : 'Settled';
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setFilter(tab)}
                className={`flex-1 py-1.5 rounded-xl items-center border ${
                  isActive ? 'bg-sky-600 border-sky-600' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                }`}
                activeOpacity={0.7}
              >
                <Text className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {loading && customers.length === 0 ? (
        <Loader />
      ) : (
        <FlatList
          data={filteredCustomers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const hasDues = item.balance > 0;
            return (
              <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-4 mb-3 shadow-2xs">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1 pr-2">
                    <Text className="text-base font-black text-slate-900 dark:text-slate-50">
                      {item.name}
                    </Text>
                    <Text className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                      📞 {item.phone}
                    </Text>
                  </View>

                  <View className="items-end">
                    <Text className={`text-base font-black ${hasDues ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {formatCurrency(Math.abs(item.balance))}
                    </Text>
                    <Text className="text-3xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {item.balance > 0 ? 'Dues to Collect' : item.balance < 0 ? 'Credit Advance' : 'Settled'}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center pt-2 mt-2 border-t border-slate-100 dark:border-slate-700/50">
                  <Text className="text-xs text-slate-500 dark:text-slate-400">
                    Holding <Text className="font-bold text-slate-700 dark:text-slate-200">{item.emptyBottlesHeld} Jars</Text>
                  </Text>

                  <TouchableOpacity 
                    className="bg-emerald-600 px-4 py-2 rounded-xl flex-row items-center gap-1.5 active:opacity-75"
                    onPress={() => openPaymentModal(item)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="card" size={14} color="#FFF" />
                    <Text className="text-xs font-black text-white">Receive Payment</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <EmptyState 
              message={filter === 'dues' ? "🎉 Excellent! All customer dues are currently cleared." : "No customer records found."} 
              iconName="cash-outline" 
            />
          }
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 justify-end bg-black/60"
        >
          <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-5 pb-8">
            <View className="flex-row justify-between items-center pb-3 mb-3 border-b border-slate-100 dark:border-slate-700/60">
              <View className="flex-row items-center gap-2">
                <View className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 justify-center items-center">
                  <Ionicons name="cash" size={16} color="#059669" />
                </View>
                <Text className="text-base font-black text-slate-900 dark:text-slate-50">
                  Receive Customer Payment
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 justify-center items-center"
              >
                <Ionicons name="close" size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            {selectedCust && (
              <View className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl mb-3 flex-row justify-between items-center">
                <View>
                  <Text className="text-xs font-bold text-slate-800 dark:text-slate-200">{selectedCust.name}</Text>
                  <Text className="text-3xs text-slate-400">{selectedCust.phone}</Text>
                </View>
                <Text className="text-sm font-black text-rose-600 dark:text-rose-400">
                  Dues: {formatCurrency(Math.max(0, selectedCust.balance))}
                </Text>
              </View>
            )}

            <Input
              label="Amount Collected (₹) *"
              placeholder="e.g. 500.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />

            {selectedCust && selectedCust.balance > 0 && (
              <TouchableOpacity 
                onPress={() => setAmount(selectedCust.balance.toString())}
                className="self-end mb-3"
              >
                <Text className="text-xs font-bold text-sky-600 dark:text-sky-400">
                  Set Full Dues ({formatCurrency(selectedCust.balance)})
                </Text>
              </TouchableOpacity>
            )}

            <Text className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Payment Method
            </Text>
            <View className="flex-row gap-2 mb-4">
              {(['cash', 'online', 'credit'] as PaymentMethod[]).map((mode) => {
                const isSelected = paymentMethod === mode;
                const modeLabel = mode === 'cash' ? '💵 Cash' : mode === 'online' ? '📱 UPI / Online' : '💳 Credit';
                return (
                  <TouchableOpacity
                    key={mode}
                    onPress={() => setPaymentMethod(mode)}
                    className={`flex-1 py-2.5 rounded-xl items-center border ${
                      isSelected 
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500' 
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text className={`text-xs font-black ${isSelected ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400'}`}>
                      {modeLabel}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Button
              title="Record Payment Entry"
              onPress={handleRecordPayment}
              loading={submitting}
              style={{ backgroundColor: '#059669' }}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
