import React, { useEffect, useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCustomerStore } from '@/store/customerStore';
import { useOrderStore } from '@/store/orderStore';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Loader } from '@/components/common/Loader';
import { APP_CONFIG } from '@/constants/config';
import { Customer } from '@/types/customer';
import { formatCurrency } from '@/utils/invoiceUtils';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '@/store/authStore';

export default function CreateOrderScreen() {
  const { user } = useAuthStore();
  const { customers, loading, fetchCustomers } = useCustomerStore();
  const { addOrder } = useOrderStore();
  const router = useRouter();

  const defaultPrice = user?.pricePerJar || APP_CONFIG.defaultWaterPrice || 35;
  const [selectedCust, setSelectedCust] = useState<Customer | null>(null);
  const [custSearch, setCustSearch] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [pricePerUnit, setPricePerUnit] = useState(defaultPrice.toString());
  const [helperName, setHelperName] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Filter customers based on search
  const filteredCustomers = useMemo(() => {
    if (!custSearch.trim()) return customers;
    const q = custSearch.toLowerCase().trim();
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)
    );
  }, [customers, custSearch]);

  const priceNum = parseFloat(pricePerUnit) || 0;
  const totalAmount = quantity * priceNum;

  const handleCreateOrder = async () => {
    if (!selectedCust) {
      Alert.alert('Validation Error', 'Please select a customer.');
      return;
    }

    if (quantity <= 0) {
      Alert.alert('Validation Error', 'Please enter at least 1 bottle.');
      return;
    }
    if (priceNum <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid price per bottle.');
      return;
    }

    setSubmitting(true);
    
    try {
      await addOrder({
        customerId: selectedCust.id,
        customerName: selectedCust.name,
        customerPhone: selectedCust.phone,
        deliveryAddress: selectedCust.address,
        items: [
          {
            itemId: 'jar-20l',
            itemName: '20L RO Water Jar',
            quantity: quantity,
            pricePerUnit: priceNum,
            totalPrice: totalAmount,
          }
        ],
        totalAmount: totalAmount,
        status: 'pending',
        paymentStatus: 'pending',
        amountPaid: 0,
        deliveryDate: new Date().toISOString(),
        assignedHelperName: helperName.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      Alert.alert('Success', 'Order created and dispatched successfully!');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && customers.length === 0) {
    return <Loader />;
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      className="flex-1 bg-slate-50 dark:bg-slate-900"
    >
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 150 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Customer Selection Card */}
        <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-4 mb-4 shadow-2xs">
          <View className="flex-row items-center gap-2 mb-3">
            <Ionicons name="person" size={18} color="#0284c7" />
            <Text className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Select Customer *
            </Text>
          </View>

          {/* Customer Search */}
          <View className="flex-row items-center bg-slate-100 dark:bg-slate-900 rounded-xl px-3 py-2 mb-3">
            <Ionicons name="search-outline" size={16} color="#94a3b8" />
            <TextInput
              placeholder="Search customer by name or phone..."
              placeholderTextColor="#94a3b8"
              value={custSearch}
              onChangeText={setCustSearch}
              className="flex-1 text-xs font-medium text-slate-800 dark:text-slate-100 ml-2 py-0"
            />
          </View>

        {/* Horizontal Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-2">
          {filteredCustomers.slice(0, 10).map((cust) => {
            const isSelected = selectedCust?.id === cust.id;
            return (
              <TouchableOpacity 
                key={cust.id} 
                className={`mr-2 px-3 py-2 rounded-xl border flex-row items-center gap-1.5 ${
                  isSelected 
                    ? 'bg-sky-600 border-sky-600' 
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                }`}
                onPress={() => setSelectedCust(cust)}
                activeOpacity={0.7}
              >
                <Text className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                  {cust.name}
                </Text>
                {isSelected && <Ionicons name="checkmark-circle" size={14} color="#FFF" />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {selectedCust && (
          <View className="bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-800/50 rounded-xl p-3 mt-2">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-xs font-bold text-sky-900 dark:text-sky-100">
                {selectedCust.name} ({selectedCust.phone})
              </Text>
              <Text className="text-3xs font-bold text-sky-700 dark:text-sky-300">
                {selectedCust.emptyBottlesHeld} Jars with customer
              </Text>
            </View>
            <Text className="text-xs text-slate-600 dark:text-slate-300">
              📍 {selectedCust.address}
            </Text>
          </View>
        )}
      </View>

      {/* 2. Bottle Quantity & Price Stepper Card */}
      <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-4 mb-4 shadow-2xs">
        <View className="flex-row items-center gap-2 mb-3">
          <Ionicons name="cube" size={18} color="#0284c7" />
          <Text className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Water Jars (20L Bottles)
          </Text>
        </View>

        {/* Stepper Controls */}
        <View className="flex-row items-center justify-between bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 mb-3">
          <TouchableOpacity 
            className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 justify-center items-center active:opacity-75 shadow-2xs"
            onPress={() => setQuantity((prev) => Math.max(1, prev - 1))}
            activeOpacity={0.7}
          >
            <Ionicons name="remove" size={22} color="#0284c7" />
          </TouchableOpacity>

          <View className="items-center">
            <Text className="text-3xl font-black text-slate-900 dark:text-slate-50">
              {quantity}
            </Text>
            <Text className="text-3xs font-bold text-slate-400 uppercase tracking-wider">
              20L Jars
            </Text>
          </View>

          <TouchableOpacity 
            className="w-12 h-12 rounded-xl bg-sky-600 justify-center items-center active:opacity-75 shadow-2xs"
            onPress={() => setQuantity((prev) => prev + 1)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Fast Preset Chips */}
        <View className="flex-row gap-2 mb-4">
          {[1, 2, 5, 10, 20].map((preset) => (
            <TouchableOpacity
              key={preset}
              className={`flex-1 py-1.5 rounded-lg items-center border ${
                quantity === preset 
                  ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500' 
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
              }`}
              onPress={() => setQuantity(preset)}
              activeOpacity={0.7}
            >
              <Text className={`text-xs font-bold ${quantity === preset ? 'text-sky-600 dark:text-sky-400' : 'text-slate-600 dark:text-slate-400'}`}>
                {preset}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Rate Per Jar */}
        <Input
          label="Price Per Bottle (₹) *"
          placeholder="20.00"
          value={pricePerUnit}
          onChangeText={setPricePerUnit}
          keyboardType="decimal-pad"
        />
      </View>

      {/* 3. Driver & Instructions Card */}
      <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-4 mb-4 shadow-2xs">
        <View className="flex-row items-center gap-2 mb-3">
          <Ionicons name="bicycle" size={18} color="#0284c7" />
          <Text className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Dispatch & Logistics
          </Text>
        </View>

        <Input
          label="Assign Driver / Helper (Optional)"
          placeholder="e.g. Ramesh / Driver 1"
          value={helperName}
          onChangeText={setHelperName}
        />

        <Input
          label="Special Delivery Notes"
          placeholder="e.g. Leave near gate, ring calling bell"
          value={notes}
          onChangeText={setNotes}
        />
      </View>

      {/* 4. Live Calculation & Place Order CTA */}
      <View className="bg-sky-500 dark:bg-sky-600 rounded-2xl p-4 mb-6 shadow-md shadow-sky-500/30">
        <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-sky-400/40">
          <View>
            <Text className="text-3xs font-black text-sky-100 uppercase tracking-widest">
              Live Order Estimate
            </Text>
            <Text className="text-xs text-sky-100">
              {quantity} Jars × {formatCurrency(priceNum)}
            </Text>
          </View>
          <Text className="text-2xl font-black text-white">
            {formatCurrency(totalAmount)}
          </Text>
        </View>

        <Button
          title={submitting ? "Placing Order..." : "Confirm & Dispatch Order"}
          onPress={handleCreateOrder}
          loading={submitting}
          style={{ backgroundColor: '#0f172a' }}
        />
      </View>
    </ScrollView>
  </KeyboardAvoidingView>
  );
}
