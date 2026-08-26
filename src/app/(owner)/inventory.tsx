import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  Alert 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Ionicons } from '@expo/vector-icons';

interface InventoryItem {
  id: string;
  name: string;
  category: 'jars' | 'parts' | 'accessories';
  quantity: number;
  unit: string;
  reorderLevel: number;
}

const INVENTORY_CACHE_KEY = '@nextwater_inventory_cache';

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: '1', name: '20L Filled Water Jars', category: 'jars', quantity: 0, unit: 'jars', reorderLevel: 50 },
  { id: '2', name: '20L Empty Returned Jars', category: 'jars', quantity: 0, unit: 'jars', reorderLevel: 30 },
  { id: '3', name: 'Sanitized Bottle Caps', category: 'parts', quantity: 0, unit: 'caps', reorderLevel: 300 },
  { id: '4', name: 'Water Dispenser Stands', category: 'accessories', quantity: 0, unit: 'units', reorderLevel: 10 }
];

export default function InventoryScreen() {
  const [stock, setStock] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustVal, setAdjustVal] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const cached = await AsyncStorage.getItem(INVENTORY_CACHE_KEY);
        if (cached) {
          setStock(JSON.parse(cached));
        }
      } catch (e) {}
    })();
  }, []);

  const saveStock = async (newStock: InventoryItem[]) => {
    setStock(newStock);
    try {
      await AsyncStorage.setItem(INVENTORY_CACHE_KEY, JSON.stringify(newStock));
    } catch (e) {}
  };

  const quickAdjust = (id: string, delta: number) => {
    const updated = stock.map((item) => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    saveStock(updated);
  };

  const handleAdjustStock = (type: 'add' | 'subtract') => {
    if (!selectedItem) return;
    const value = parseInt(adjustVal);
    if (isNaN(value) || value <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid number greater than 0');
      return;
    }

    const updated = stock.map((item) => {
      if (item.id === selectedItem.id) {
        const newQty = type === 'add' ? item.quantity + value : Math.max(0, item.quantity - value);
        return { ...item, quantity: newQty };
      }
      return item;
    });

    saveStock(updated);

    setModalVisible(false);
    setAdjustVal('');
    setSelectedItem(null);
    Alert.alert('Success', 'Stock levels updated successfully.');
  };

  return (
    <ScrollView 
      className="flex-1 bg-slate-50 dark:bg-slate-900 px-3.5 py-3"
      contentContainerStyle={{ paddingBottom: 60 }}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Circular Stock Gauges Row */}
      <View className="flex-row gap-2.5 mb-3.5">
        {/* Gauge 1: Filled Stock */}
        <View className="flex-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-3 items-center shadow-2xs">
          <View className="w-14 h-14 rounded-full border-4 border-sky-600 border-t-sky-200 justify-center items-center my-0.5">
            <Text className="text-sm font-black text-slate-900 dark:text-slate-50">{stock[0]?.quantity || 0}</Text>
          </View>
          <Text className="text-3xs font-black text-slate-700 dark:text-slate-300 mt-1">
            Filled Jars
          </Text>
        </View>

        {/* Gauge 2: Empty Jars */}
        <View className="flex-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-3 items-center shadow-2xs">
          <View className="w-14 h-14 rounded-full border-4 border-amber-500 border-t-amber-200 justify-center items-center my-0.5">
            <Text className="text-sm font-black text-slate-900 dark:text-slate-50">{stock[1]?.quantity || 0}</Text>
          </View>
          <Text className="text-3xs font-black text-slate-700 dark:text-slate-300 mt-1">
            Empty Ready
          </Text>
        </View>

        {/* Gauge 3: In Field Circulation */}
        <View className="flex-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-3 items-center shadow-2xs">
          <View className="w-14 h-14 rounded-full border-4 border-emerald-500 border-t-emerald-200 justify-center items-center my-0.5">
            <Text className="text-sm font-black text-slate-900 dark:text-slate-50">450</Text>
          </View>
          <Text className="text-3xs font-black text-slate-700 dark:text-slate-300 mt-1">
            In Field
          </Text>
        </View>
      </View>

      {/* Stock Items Grid */}
      <Text className="text-3xs font-black text-slate-400 uppercase tracking-wider mb-2.5 pl-1">
        Inventory & Materials
      </Text>

      {stock.map((item) => {
        const isLow = item.quantity <= item.reorderLevel;
        return (
          <View 
            key={item.id} 
            className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-3 mb-2.5 shadow-2xs"
          >
            <View className="flex-row justify-between items-start mb-1.5">
              <View className="flex-1 pr-2">
                <Text className="text-sm font-extrabold text-slate-900 dark:text-slate-50">
                  {item.name}
                </Text>
                <Text className="text-3xs font-medium text-slate-400 mt-0.5">
                  Min Level: {item.reorderLevel} {item.unit}
                </Text>
              </View>

              <View className="items-end">
                <Text className="text-base font-black text-sky-600 dark:text-sky-400">
                  {item.quantity}
                </Text>
                <Text className="text-4xs font-bold text-slate-400 uppercase">
                  {item.unit}
                </Text>
              </View>
            </View>

            {isLow && (
              <View className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 rounded-xl px-2.5 py-1 flex-row items-center gap-1.5 my-1">
                <Ionicons name="warning" size={12} color="#D97706" />
                <Text className="text-4xs font-bold text-amber-700 dark:text-amber-300">
                  Low Stock Warning: Refill batch recommended.
                </Text>
              </View>
            )}

            {/* Quick Adjustment Controls */}
            <View className="flex-row justify-between items-center pt-2 mt-1.5 border-t border-slate-100 dark:border-slate-700/50">
              <View className="flex-row gap-1">
                <TouchableOpacity
                  onPress={() => quickAdjust(item.id, -10)}
                  className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                  activeOpacity={0.7}
                >
                  <Text className="text-3xs font-bold text-slate-700 dark:text-slate-300">-10</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => quickAdjust(item.id, 10)}
                  className="px-2 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800"
                  activeOpacity={0.7}
                >
                  <Text className="text-3xs font-bold text-sky-700 dark:text-sky-300">+10</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => quickAdjust(item.id, 50)}
                  className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800"
                  activeOpacity={0.7}
                >
                  <Text className="text-3xs font-bold text-emerald-700 dark:text-emerald-300">+50</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                className="bg-slate-900 dark:bg-slate-700 px-2.5 py-1 rounded-lg flex-row items-center gap-1 active:opacity-75"
                onPress={() => {
                  setSelectedItem(item);
                  setModalVisible(true);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="create-outline" size={12} color="#FFF" />
                <Text className="text-3xs font-bold text-white">Custom</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      {/* Adjust Stock Custom Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-5 pb-8">
            <View className="flex-row justify-between items-center pb-3 mb-3 border-b border-slate-100 dark:border-slate-700/60">
              <View>
                <Text className="text-sm font-black text-slate-900 dark:text-slate-50">
                  Adjust Inventory Stock
                </Text>
                <Text className="text-3xs text-slate-400 mt-0.5">
                  Item: {selectedItem?.name} (Current: {selectedItem?.quantity} {selectedItem?.unit})
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 justify-center items-center"
              >
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Input
              label="Units to Add or Subtract"
              placeholder="e.g. 25"
              value={adjustVal}
              onChangeText={setAdjustVal}
              keyboardType="number-pad"
            />

            <View className="flex-row gap-3 mt-3">
              <View className="flex-1">
                <Button
                  title="Deduct (-)"
                  onPress={() => handleAdjustStock('subtract')}
                  style={{ backgroundColor: '#E11D48', height: 42 }}
                />
              </View>
              <View className="flex-1">
                <Button
                  title="Add Stock (+)"
                  onPress={() => handleAdjustStock('add')}
                  style={{ backgroundColor: '#059669', height: 42 }}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
