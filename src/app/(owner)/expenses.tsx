import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  Alert 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrency } from '@/utils/invoiceUtils';
import { formatDate } from '@/utils/dateUtils';
import { Ionicons } from '@expo/vector-icons';

interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
}

const CATEGORY_PRESETS = [
  { label: '⛽ Fuel', value: 'Vehicle Fuel' },
  { label: '⚡ Electricity', value: 'Plant Electricity' },
  { label: '🔧 Maintenance', value: 'Vehicle Maintenance' },
  { label: '🧪 RO Filters', value: 'RO Filters & Chemical' },
  { label: '👷 Staff Wages', value: 'Wages & Driver Pay' },
  { label: '📦 Jars Purchase', value: 'New Jar Purchase' },
];

const EXPENSES_CACHE_KEY = '@nextwater_expenses_cache';

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [category, setCategory] = useState(CATEGORY_PRESETS[0].value);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const { getTenantCollection } = await import('@/services/firebase');
        const { getDocs, query, orderBy } = await import('firebase/firestore');
        const q = query(getTenantCollection('expenses'), orderBy('date', 'desc'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const list: Expense[] = [];
          snap.forEach(d => list.push({ id: d.id, ...d.data() } as Expense));
          setExpenses(list);
          await AsyncStorage.setItem(EXPENSES_CACHE_KEY, JSON.stringify(list));
          return;
        }
      } catch (e) {}

      try {
        const cached = await AsyncStorage.getItem(EXPENSES_CACHE_KEY);
        if (cached) {
          setExpenses(JSON.parse(cached));
        }
      } catch (e) {}
    })();
  }, []);

  const totalExpense = useMemo(() => {
    return expenses.reduce((sum, item) => sum + item.amount, 0);
  }, [expenses]);

  const handleAddExpense = async () => {
    const val = parseFloat(amount);
    if (!category || isNaN(val) || val <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid expense amount.');
      return;
    }

    setSubmitting(true);
    const newEntry: Expense = {
      id: `exp_${Date.now()}`,
      category,
      amount: val,
      description: description.trim() || category,
      date: new Date().toISOString()
    };

    try {
      const { getTenantCollection } = await import('@/services/firebase');
      const { addDoc } = await import('firebase/firestore');
      const docRef = await addDoc(getTenantCollection('expenses'), newEntry);
      newEntry.id = docRef.id;
    } catch (e) {}

    const updated = [newEntry, ...expenses];
    setExpenses(updated);
    try {
      await AsyncStorage.setItem(EXPENSES_CACHE_KEY, JSON.stringify(updated));
    } catch (e) {}

    setSubmitting(false);
    setAmount('');
    setDescription('');
    setModalVisible(false);
    Alert.alert('Success', `Expense of ${formatCurrency(val)} recorded.`);
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      {/* Top Compact Expenses Overview */}
      <View className="px-3.5 pt-3 pb-2">
        <View className="bg-rose-500 rounded-2xl p-3.5 flex-row justify-between items-center shadow-sm shadow-rose-500/30">
          <View>
            <Text className="text-3xs font-black text-rose-100 uppercase tracking-widest">
              Total Operating Expenses
            </Text>
            <Text className="text-xl font-black text-white mt-0.5">
              {formatCurrency(totalExpense)}
            </Text>
            <Text className="text-4xs text-rose-100 font-semibold mt-0.5">
              {expenses.length} operating expense entries recorded
            </Text>
          </View>

          <View className="w-10 h-10 rounded-xl bg-white/20 justify-center items-center">
            <Ionicons name="receipt" size={20} color="#FFF" />
          </View>
        </View>
      </View>

      {/* Expenses List */}
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 14, paddingBottom: 90 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-3 mb-2.5 shadow-2xs">
            <View className="flex-row justify-between items-start mb-1">
              <View className="flex-1 pr-2">
                <Text className="text-sm font-black text-slate-900 dark:text-slate-50">
                  {item.category}
                </Text>
                <Text className="text-3xs font-medium text-slate-400 mt-0.5">
                  📅 {formatDate(item.date)}
                </Text>
              </View>

              <Text className="text-sm font-black text-rose-600 dark:text-rose-400">
                {formatCurrency(item.amount)}
              </Text>
            </View>

            {item.description ? (
              <View className="bg-slate-50 dark:bg-slate-900/60 px-2.5 py-1.5 rounded-lg mt-1">
                <Text className="text-3xs text-slate-600 dark:text-slate-300">
                  {item.description}
                </Text>
              </View>
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          <EmptyState message="No business expenses logged yet. Tap (+) to log costs." iconName="receipt-outline" />
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity 
        className="absolute bottom-6 right-6 bg-rose-600 w-12 h-12 rounded-full justify-center items-center shadow-lg active:opacity-85 shadow-rose-600/40"
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={26} color="#FFF" />
      </TouchableOpacity>

      {/* Log Expense Modal */}
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
          <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-5 pb-8 max-h-[90%]">
            <View className="flex-row justify-between items-center pb-3 mb-3 border-b border-slate-100 dark:border-slate-700/60">
              <View className="flex-row items-center gap-2">
                <View className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 justify-center items-center">
                  <Ionicons name="receipt" size={16} color="#E11D48" />
                </View>
                <Text className="text-sm font-black text-slate-900 dark:text-slate-50">
                  Log Operating Expense
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 justify-center items-center"
              >
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Category Selector Chips */}
              <Text className="text-3xs font-black text-slate-400 uppercase tracking-wider mb-2">
                Expense Category
              </Text>
              <View className="flex-row flex-wrap gap-1.5 mb-3">
                {CATEGORY_PRESETS.map((preset) => {
                  const isSelected = category === preset.value;
                  return (
                    <TouchableOpacity
                      key={preset.value}
                      onPress={() => setCategory(preset.value)}
                      className={`px-2.5 py-1.5 rounded-xl border ${
                        isSelected 
                          ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-500' 
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                      }`}
                      activeOpacity={0.7}
                    >
                      <Text className={`text-3xs font-bold ${isSelected ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'}`}>
                        {preset.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Input
                label="Amount (₹)"
                placeholder="e.g. 500.00"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />

              <Input
                label="Expense Description"
                placeholder="e.g. 20 Liters Diesel for delivery pickup"
                value={description}
                onChangeText={setDescription}
              />

              <Button
                title="Log Expense Record"
                onPress={handleAddExpense}
                loading={submitting}
                style={{ backgroundColor: '#E11D48', height: 44, marginTop: 6 }}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
