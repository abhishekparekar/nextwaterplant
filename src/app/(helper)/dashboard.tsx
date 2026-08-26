import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Modal, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Linking
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useDeliveryStore } from '@/store/deliveryStore';
import { DeliveryCard } from '@/components/delivery/DeliveryCard';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Loader } from '@/components/common/Loader';
import { ROUTES } from '@/constants/routes';
import { Delivery } from '@/types/delivery';
import { Ionicons } from '@expo/vector-icons';

export default function HelperDashboard() {
  const { user } = useAuthStore();
  const { deliveries, loading, fetchHelperDeliveries, updateDeliveryStatus } = useDeliveryStore();
  const router = useRouter();

  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [emptyReturned, setEmptyReturned] = useState(0);
  const [cashCollected, setCashCollected] = useState('0');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      fetchHelperDeliveries(user.uid);
    }
  }, [user, fetchHelperDeliveries]);

  const openCompletionModal = (item: Delivery) => {
    setSelectedDelivery(item);
    setEmptyReturned(item.bottlesDelivered || 1);
    setCashCollected('0');
    setModalVisible(true);
  };

  const handleCompleteDelivery = async () => {
    if (!selectedDelivery) return;

    const cash = parseFloat(cashCollected);
    if (isNaN(cash) || cash < 0) {
      Alert.alert('Validation Error', 'Please enter a valid amount of cash collected (or 0 if unpaid).');
      return;
    }

    setSubmitting(true);
    try {
      await updateDeliveryStatus(selectedDelivery.id, 'completed', {
        emptyBottlesReturned: emptyReturned,
        cashCollected: cash,
      });
      
      Alert.alert('Success', 'Delivery completed and logged successfully.');
      setModalVisible(false);
      setSelectedDelivery(null);
      if (user?.uid) {
        fetchHelperDeliveries(user.uid);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update run status');
    } finally {
      setSubmitting(false);
    }
  };

  const activeDeliveries = deliveries.filter((d) => d.status !== 'completed' && d.status !== 'failed');
  const completedCount = deliveries.filter((d) => d.status === 'completed').length;

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      {/* Top Driver Header */}
      <View className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 px-4 pt-3 pb-3">
        <View className="flex-row justify-between items-center mb-3">
          <View>
            <Text className="text-3xs font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest">
              Logistics Driver
            </Text>
            <Text className="text-xl font-black text-slate-900 dark:text-slate-50">
              {user?.displayName || 'Driver'}
            </Text>
          </View>

          <TouchableOpacity 
            className="w-10 h-10 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 justify-center items-center active:opacity-75"
            onPress={() => router.push(ROUTES.HELPER.PROFILE)}
          >
            <Ionicons name="person" size={18} color="#0284c7" />
          </TouchableOpacity>
        </View>

        {/* Status Counters */}
        <View className="flex-row gap-2 mb-2.5">
          <View className="flex-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/40 rounded-xl p-2.5 flex-row items-center gap-2">
            <Ionicons name="checkmark-done" size={18} color="#059669" />
            <View>
              <Text className="text-base font-black text-emerald-900 dark:text-emerald-100">{completedCount}</Text>
              <Text className="text-4xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Completed</Text>
            </View>
          </View>

          <View className="flex-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-800/40 rounded-xl p-2.5 flex-row items-center gap-2">
            <Ionicons name="time" size={18} color="#D97706" />
            <View>
              <Text className="text-base font-black text-amber-900 dark:text-amber-100">{activeDeliveries.length}</Text>
              <Text className="text-4xs font-bold text-amber-600 dark:text-amber-400 uppercase">Remaining</Text>
            </View>
          </View>
        </View>

        {/* Quick Contact Plant Owner Actions */}
        <View className="flex-row gap-2">
          <TouchableOpacity 
            onPress={() => Linking.openURL(`tel:${user?.phoneNumber || '8485877633'}`).catch(() => {})}
            className="flex-1 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/50 py-1.5 rounded-lg flex-row justify-center items-center gap-1.5 active:opacity-75"
            activeOpacity={0.7}
          >
            <Ionicons name="call" size={13} color="#0284C7" />
            <Text className="text-3xs font-black text-sky-700 dark:text-sky-300">Call Plant Owner</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => Linking.openURL(`https://wa.me/91${(user?.whatsappNumber || '8485877633').replace(/[^0-9]/g, '')}?text=Hi%20Owner%2C%20driver%20update%20from%20delivery%20route`).catch(() => {})}
            className="flex-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 py-1.5 rounded-lg flex-row justify-center items-center gap-1.5 active:opacity-75"
            activeOpacity={0.7}
          >
            <Ionicons name="logo-whatsapp" size={13} color="#059669" />
            <Text className="text-3xs font-black text-emerald-700 dark:text-emerald-300">WhatsApp Plant</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Route List */}
      {loading && deliveries.length === 0 ? (
        <Loader />
      ) : (
        <FlatList
          data={activeDeliveries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <DeliveryCard 
              delivery={item}
              onCompletePress={() => openCompletionModal(item)}
            />
          )}
          ListEmptyComponent={
            <EmptyState message="All caught up! No pending deliveries on your route right now." iconName="happy-outline" />
          }
        />
      )}

      {/* Complete Delivery Modal */}
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
              <View>
                <Text className="text-base font-black text-slate-900 dark:text-slate-50">
                  Complete Water Drop-off
                </Text>
                <Text className="text-xs text-sky-600 dark:text-sky-400 font-bold mt-0.5">
                  Client: {selectedDelivery?.customerName}
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 justify-center items-center"
              >
                <Ionicons name="close" size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Bottles Delivered Info */}
              <View className="bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-800/50 rounded-xl p-3 mb-4 flex-row justify-between items-center">
                <Text className="text-xs font-bold text-sky-900 dark:text-sky-100">
                  Bottles Delivered to Client:
                </Text>
                <Text className="text-base font-black text-sky-700 dark:text-sky-300">
                  {selectedDelivery?.bottlesDelivered} Jars
                </Text>
              </View>

              {/* Empty Jars Return Stepper */}
              <Text className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Empty Jars Collected Back
              </Text>
              <View className="flex-row items-center justify-between bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 mb-4">
                <TouchableOpacity 
                  className="w-11 h-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 justify-center items-center active:opacity-75"
                  onPress={() => setEmptyReturned((prev) => Math.max(0, prev - 1))}
                  activeOpacity={0.7}
                >
                  <Ionicons name="remove" size={20} color="#0284c7" />
                </TouchableOpacity>

                <View className="items-center">
                  <Text className="text-2xl font-black text-slate-900 dark:text-slate-50">
                    {emptyReturned}
                  </Text>
                  <Text className="text-3xs font-bold text-slate-400 uppercase">
                    Empty Jars Returned
                  </Text>
                </View>

                <TouchableOpacity 
                  className="w-11 h-11 rounded-xl bg-sky-600 justify-center items-center active:opacity-75"
                  onPress={() => setEmptyReturned((prev) => prev + 1)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>

              {/* Cash Collection Input */}
              <Input
                label="Cash Collected on Delivery (₹)"
                placeholder="0.00"
                value={cashCollected}
                onChangeText={setCashCollected}
                keyboardType="decimal-pad"
              />

              <Button
                title="Confirm & Complete Drop-off"
                onPress={handleCompleteDelivery}
                loading={submitting}
                style={{ backgroundColor: '#059669', marginTop: 8 }}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
