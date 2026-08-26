import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Customer } from '@/types/customer';
import { formatCurrency } from '@/utils/invoiceUtils';

interface CustomerCardProps {
  customer: Customer;
  onPress?: () => void;
  onCallPress?: () => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({ 
  customer, 
  onPress,
  onCallPress 
}) => {
  const hasDues = customer.balance > 0;

  const handleCall = () => {
    if (onCallPress) {
      onCallPress();
    } else {
      Linking.openURL(`tel:${customer.phone}`).catch(() => {});
    }
  };

  const handleWhatsApp = () => {
    const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
    Linking.openURL(`https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(customer.name)},%20this%20is%20NextWater%20Plant.`).catch(() => {});
  };

  return (
    <TouchableOpacity 
      className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-xl p-3.5 mb-2.5 shadow-2xs active:opacity-80"
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center flex-1 pr-2">
          <View className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-950/50 border border-sky-100 dark:border-sky-800/50 justify-center items-center mr-2.5">
            <Text className="text-sky-700 dark:text-sky-300 font-black text-xs">
              {customer.name.substring(0, 2).toUpperCase()}
            </Text>
          </View>
          
          <View className="flex-1">
            <Text className="text-sm font-extrabold text-slate-900 dark:text-slate-50" numberOfLines={1}>
              {customer.name}
            </Text>
            <Text className="text-3xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
              {customer.phone}
            </Text>
          </View>
        </View>
        
        {/* Quick Communication Actions */}
        <View className="flex-row items-center gap-1.5">
          <TouchableOpacity 
            className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 justify-center items-center active:opacity-75" 
            onPress={handleWhatsApp}
            activeOpacity={0.7}
          >
            <Ionicons name="logo-whatsapp" size={15} color="#059669" />
          </TouchableOpacity>

          <TouchableOpacity 
            className="w-8 h-8 rounded-full bg-sky-50 dark:bg-sky-950/50 border border-sky-200/60 dark:border-sky-800/60 justify-center items-center active:opacity-75" 
            onPress={handleCall}
            activeOpacity={0.7}
          >
            <Ionicons name="call" size={14} color="#0284c7" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row items-center gap-1.5 mb-2.5 bg-slate-50 dark:bg-slate-900/60 px-2.5 py-1.5 rounded-lg">
        <Ionicons name="location-outline" size={13} color="#64748b" />
        <Text className="text-3xs font-medium text-slate-600 dark:text-slate-300 flex-1" numberOfLines={1}>
          {customer.address}
        </Text>
      </View>

      <View className="flex-row justify-between items-center pt-1.5 border-t border-slate-100 dark:border-slate-700/50">
        <View className="flex-row items-center gap-1.5">
          <View className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-950/50 justify-center items-center">
            <Ionicons name="cube-outline" size={12} color="#6366f1" />
          </View>
          <View>
            <Text className="text-3xs font-black text-slate-800 dark:text-slate-100">
              {customer.emptyBottlesHeld} Jars
            </Text>
            <Text className="text-4xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              With Client
            </Text>
          </View>
        </View>

        <View className="items-end">
          <Text className={`text-xs font-black ${hasDues ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {formatCurrency(Math.abs(customer.balance))}
          </Text>
          <Text className="text-4xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {customer.balance > 0 ? 'Pending Dues' : customer.balance < 0 ? 'Advance Credit' : 'All Settled'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CustomerCard;
