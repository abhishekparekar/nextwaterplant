import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { reportService, DashboardReportSummary } from '@/services/reportService';
import { Loader } from '@/components/common/Loader';
import { formatCurrency } from '@/utils/invoiceUtils';
import { Ionicons } from '@expo/vector-icons';

export default function ReportsScreen() {
  const [data, setData] = useState<DashboardReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [expensesTotal] = useState(3650.00);

  const fetchReports = () => {
    setLoading(true);
    reportService.getDashboardSummary()
      .then(setData)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading && !data) {
    return <Loader />;
  }

  const revenue = data?.totalRevenue || 124850;
  const netProfit = revenue - expensesTotal;
  const totalDeliveries = (data?.completedDeliveries || 28) + (data?.pendingDeliveries || 4);
  const fulfillmentRate = totalDeliveries > 0 
    ? Math.round(((data?.completedDeliveries || 28) / totalDeliveries) * 100) 
    : 92;

  const profitMargin = revenue > 0 ? Math.round((netProfit / revenue) * 100) : 85;

  return (
    <ScrollView 
      className="flex-1 bg-slate-50 dark:bg-slate-900 px-3.5 py-3"
      contentContainerStyle={{ paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchReports} colors={['#0284c7']} />}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Circular / Gauge Visual Analytics Row */}
      <View className="flex-row gap-2.5 mb-3.5">
        {/* Gauge 1: Fulfillment Rate */}
        <View className="flex-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-3 items-center shadow-2xs">
          <View className="w-16 h-16 rounded-full border-4 border-emerald-500 border-t-emerald-200 justify-center items-center my-1">
            <Text className="text-sm font-black text-slate-900 dark:text-slate-50">{fulfillmentRate}%</Text>
            <Text className="text-4xs font-bold text-emerald-600">On Time</Text>
          </View>
          <Text className="text-3xs font-black text-slate-700 dark:text-slate-300 mt-1">
            Delivery Rate
          </Text>
        </View>

        {/* Gauge 2: Profit Margin */}
        <View className="flex-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-3 items-center shadow-2xs">
          <View className="w-16 h-16 rounded-full border-4 border-sky-600 border-t-sky-200 justify-center items-center my-1">
            <Text className="text-sm font-black text-slate-900 dark:text-slate-50">{profitMargin}%</Text>
            <Text className="text-4xs font-bold text-sky-600">Margin</Text>
          </View>
          <Text className="text-3xs font-black text-slate-700 dark:text-slate-300 mt-1">
            Operating Margin
          </Text>
        </View>
      </View>

      {/* 2. Compact Financial Overview Card */}
      <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-3.5 mb-3.5 shadow-2xs">
        <Text className="text-3xs font-black text-slate-400 uppercase tracking-wider mb-2.5">
          Profit & Loss Statement (P&L)
        </Text>

        <View className="space-y-2">
          {/* Revenue */}
          <View className="flex-row justify-between items-center py-1">
            <View className="flex-row items-center gap-2">
              <View className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 justify-center items-center">
                <Ionicons name="arrow-down" size={12} color="#059669" />
              </View>
              <Text className="text-xs font-bold text-slate-700 dark:text-slate-300">Gross Collections</Text>
            </View>
            <Text className="text-sm font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(revenue)}
            </Text>
          </View>

          {/* Expenses */}
          <View className="flex-row justify-between items-center py-1">
            <View className="flex-row items-center gap-2">
              <View className="w-6 h-6 rounded-lg bg-rose-50 dark:bg-rose-950/50 justify-center items-center">
                <Ionicons name="arrow-up" size={12} color="#E11D48" />
              </View>
              <Text className="text-xs font-bold text-slate-700 dark:text-slate-300">Operating Expenses</Text>
            </View>
            <Text className="text-sm font-black text-rose-600 dark:text-rose-400">
              -{formatCurrency(expensesTotal)}
            </Text>
          </View>

          {/* Dues */}
          <View className="flex-row justify-between items-center py-1">
            <View className="flex-row items-center gap-2">
              <View className="w-6 h-6 rounded-lg bg-amber-50 dark:bg-amber-950/50 justify-center items-center">
                <Ionicons name="time" size={12} color="#D97706" />
              </View>
              <Text className="text-xs font-bold text-slate-700 dark:text-slate-300">Pending Dues</Text>
            </View>
            <Text className="text-sm font-black text-amber-600 dark:text-amber-400">
              {formatCurrency(data?.outstandingBalance || 18750)}
            </Text>
          </View>

          <View className="h-px bg-slate-100 dark:bg-slate-700/60 my-1" />

          {/* Net Profit */}
          <View className="flex-row justify-between items-center pt-1">
            <Text className="text-xs font-black text-slate-900 dark:text-slate-50">Net Estimated Profit</Text>
            <Text className="text-base font-black text-sky-600 dark:text-sky-400">
              {formatCurrency(netProfit)}
            </Text>
          </View>
        </View>
      </View>

      {/* 3. Expense Distribution Breakdown Bars */}
      <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-3.5 mb-3.5 shadow-2xs">
        <Text className="text-3xs font-black text-slate-400 uppercase tracking-wider mb-2.5">
          Cost Breakdown by Category
        </Text>

        <View className="space-y-2.5">
          {/* Fuel */}
          <View>
            <View className="flex-row justify-between text-xs mb-1">
              <Text className="text-3xs font-bold text-slate-700 dark:text-slate-300">Vehicle Fuel & Diesel</Text>
              <Text className="text-3xs font-black text-slate-900 dark:text-slate-50">₹1,200 (33%)</Text>
            </View>
            <View className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
              <View className="h-full bg-sky-500 rounded-full" style={{ width: '33%' }} />
            </View>
          </View>

          {/* Electricity & RO Maintenance */}
          <View>
            <View className="flex-row justify-between text-xs mb-1">
              <Text className="text-3xs font-bold text-slate-700 dark:text-slate-300">Electricity & Plant Power</Text>
              <Text className="text-3xs font-black text-slate-900 dark:text-slate-50">₹1,450 (40%)</Text>
            </View>
            <View className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
              <View className="h-full bg-emerald-500 rounded-full" style={{ width: '40%' }} />
            </View>
          </View>

          {/* Helper Wages */}
          <View>
            <View className="flex-row justify-between text-xs mb-1">
              <Text className="text-3xs font-bold text-slate-700 dark:text-slate-300">Staff Wages & Logistics</Text>
              <Text className="text-3xs font-black text-slate-900 dark:text-slate-50">₹1,000 (27%)</Text>
            </View>
            <View className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
              <View className="h-full bg-amber-500 rounded-full" style={{ width: '27%' }} />
            </View>
          </View>
        </View>
      </View>

      {/* 4. Logistics Volume Counters */}
      <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-3.5 shadow-2xs">
        <Text className="text-3xs font-black text-slate-400 uppercase tracking-wider mb-2">
          Logistics Performance
        </Text>

        <View className="flex-row justify-between py-1">
          <Text className="text-xs font-bold text-slate-700 dark:text-slate-300">Total Customer Orders</Text>
          <Text className="text-xs font-black text-slate-900 dark:text-slate-50">{data?.totalOrders || 128}</Text>
        </View>
        <View className="flex-row justify-between py-1">
          <Text className="text-xs font-bold text-slate-700 dark:text-slate-300">Delivered Orders</Text>
          <Text className="text-xs font-black text-emerald-600 dark:text-emerald-400">{data?.completedDeliveries || 28}</Text>
        </View>
        <View className="flex-row justify-between py-1">
          <Text className="text-xs font-bold text-slate-700 dark:text-slate-300">Pending Route Runs</Text>
          <Text className="text-xs font-black text-sky-600 dark:text-sky-400">{data?.pendingDeliveries || 4}</Text>
        </View>
      </View>
    </ScrollView>
  );
}
