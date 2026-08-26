import React, { useEffect, useState } from 'react';
import { 
  Text, 
  View, 
  ScrollView, 
  RefreshControl, 
  TouchableOpacity,
  Modal,
  Alert,
  Linking
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useDashboard } from '@/hooks/useDashboard';
import { Loader } from '@/components/common/Loader';
import { ROUTES } from '@/constants/routes';
import { formatCurrency } from '@/utils/invoiceUtils';
import { Ionicons } from '@expo/vector-icons';

export default function OwnerDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data, loading, refresh } = useDashboard();
  
  // Segmented Tab Switch: 'menu' | 'dashboard'
  const [activeTab, setActiveTab] = useState<'menu' | 'dashboard'>('menu');
  
  // Modals for special feature cards
  const [modalType, setModalType] = useState<string | null>(null);

  // Live Date State for Dashboard
  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '-');

  if (loading && !data) {
    return <Loader />;
  }

  const revenueDisplay = data?.totalRevenue || 0;
  const duesDisplay = data?.outstandingBalance || 0;
  const ordersCount = data?.totalOrders || 0;
  const activeRunsCount = data?.pendingDeliveries || 0;
  const completedRunsCount = data?.completedDeliveries || 0;

  // 18 Interactive Business Modules for [Menu] View (Image 2 & 5)
  const menuModules = [
    {
      id: 'customers',
      title: 'Customers',
      icon: 'people',
      color: '#0284C7',
      bg: '#E0F2FE',
      onPress: () => router.push(ROUTES.OWNER.CUSTOMERS)
    },
    {
      id: 'routes',
      title: 'Delivery Routes',
      icon: 'map',
      color: '#0D9488',
      bg: '#CCFBF1',
      onPress: () => router.push(ROUTES.OWNER.DELIVERIES)
    },
    {
      id: 'delivery_entry',
      title: 'Delivery Entry',
      icon: 'cart',
      color: '#E11D48',
      bg: '#FFE4E6',
      onPress: () => router.push(ROUTES.ORDER.CREATE)
    },
    {
      id: 'my_products',
      title: 'My Products',
      icon: 'cube',
      color: '#2563EB',
      bg: '#DBEAFE',
      onPress: () => router.push(ROUTES.OWNER.INVENTORY)
    },
    {
      id: 'products_in_use',
      title: 'Products in Use',
      icon: 'clipboard',
      color: '#D97706',
      bg: '#FEF3C7',
      onPress: () => setModalType('products_in_use')
    },
    {
      id: 'entry_statement',
      title: 'Entry Statement',
      icon: 'list',
      color: '#059669',
      bg: '#D1FAE5',
      onPress: () => router.push(ROUTES.OWNER.ORDERS)
    },
    {
      id: 'load_unload',
      title: 'Load/Unload',
      icon: 'bus',
      color: '#EA580C',
      bg: '#FFEDD5',
      onPress: () => setModalType('load_unload')
    },
    {
      id: 'billing',
      title: 'Billing',
      icon: 'receipt',
      color: '#0284C7',
      bg: '#E0F2FE',
      onPress: () => router.push(ROUTES.OWNER.BILLING)
    },
    {
      id: 'monthly_card',
      title: 'Monthly Card',
      icon: 'calendar',
      color: '#0D9488',
      bg: '#CCFBF1',
      onPress: () => setModalType('monthly_card')
    },
    {
      id: 'events_orders',
      title: 'Event / Orders Management',
      icon: 'calendar-number',
      color: '#E11D48',
      bg: '#FFE4E6',
      onPress: () => router.push(ROUTES.OWNER.ORDERS)
    },
    {
      id: 'transactions',
      title: 'Transactions History',
      icon: 'calculator',
      color: '#059669',
      bg: '#D1FAE5',
      onPress: () => router.push(ROUTES.OWNER.BILLING)
    },
    {
      id: 'payment_entry',
      title: 'Payment Entry Inc / Exp',
      icon: 'cash',
      color: '#D97706',
      bg: '#FEF3C7',
      onPress: () => router.push(ROUTES.OWNER.EXPENSES)
    },
    {
      id: 'reports',
      title: 'Reports',
      icon: 'stats-chart',
      color: '#0284C7',
      bg: '#E0F2FE',
      onPress: () => router.push(ROUTES.OWNER.REPORTS)
    },
    {
      id: 'staff',
      title: 'Staff',
      icon: 'construct',
      color: '#2563EB',
      bg: '#DBEAFE',
      onPress: () => router.push('/(owner)/add-helper')
    },
    {
      id: 'locate',
      title: 'Locate Staff and Customer',
      icon: 'navigate-circle',
      color: '#0D9488',
      bg: '#CCFBF1',
      onPress: () => setModalType('locate')
    },
    {
      id: 'recharge',
      title: 'Recharge',
      icon: 'card',
      color: '#059669',
      bg: '#D1FAE5',
      onPress: () => setModalType('recharge')
    },
    {
      id: 'tutorials',
      title: 'Help Tutorials',
      icon: 'play-circle',
      color: '#EA580C',
      bg: '#FFEDD5',
      onPress: () => Linking.openURL('https://www.youtube.com').catch(() => {})
    },
    {
      id: 'personal_app',
      title: 'Personal Application',
      icon: 'phone-portrait',
      color: '#0284C7',
      bg: '#E0F2FE',
      onPress: () => router.push(ROUTES.OWNER.PROFILE)
    },
  ];

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      {/* 1. TOP SEGMENTED CONTROLLER ( [ Menu ] | [ Dashboard ] ) */}
      <View className="bg-sky-600 px-3 pt-1.5 pb-2.5">
        <View className="flex-row bg-slate-200/90 dark:bg-slate-800/90 p-1 rounded-xl">
          <TouchableOpacity 
            className={`flex-1 py-2 rounded-lg items-center justify-center ${activeTab === 'menu' ? 'bg-white dark:bg-slate-700 shadow-2xs' : 'bg-transparent'}`}
            onPress={() => setActiveTab('menu')}
            activeOpacity={0.8}
          >
            <Text className={`text-xs font-black ${activeTab === 'menu' ? 'text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
              Menu
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className={`flex-1 py-2 rounded-lg items-center justify-center ${activeTab === 'dashboard' ? 'bg-white dark:bg-slate-700 shadow-2xs' : 'bg-transparent'}`}
            onPress={() => setActiveTab('dashboard')}
            activeOpacity={0.8}
          >
            <Text className={`text-xs font-black ${activeTab === 'dashboard' ? 'text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
              Dashboard
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. SCROLL CONTENT (BASED ON ACTIVE TAB) */}
      <ScrollView 
        className="flex-1 px-3 py-3"
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} colors={['#0284c7']} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ========================================================================= */}
        {/* VIEW 1: [ MENU ] — 3-COLUMN GRID OF ALL 18 BUSINESS MODULES (COMPACT DESIGN) */}
        {/* ========================================================================= */}
        {activeTab === 'menu' && (
          <View className="gap-2.5">
            {/* Live Plant Status & Delivery Fleet Ribbon */}
            <View className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 shadow-2xs">
              <View className="flex-row justify-between items-center pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                <View className="flex-row items-center gap-1.5">
                  <View className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <Text className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                    Plant Status: Active & Purifying
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => router.push('/(owner)/add-helper')}
                  className="flex-row items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/40 active:opacity-75"
                >
                  <Text className="text-3xs font-bold text-sky-600">Manage Staff</Text>
                  <Ionicons name="chevron-forward" size={10} color="#0284C7" />
                </TouchableOpacity>
              </View>

              <View className="flex-row justify-between items-center">
                <View className="items-center flex-1 border-r border-slate-100 dark:border-slate-800">
                  <Text className="text-4xs font-bold text-slate-400 uppercase">Stock Ready</Text>
                  <Text className="text-xs font-black text-sky-600">Pure RO Jars</Text>
                </View>
                <View className="items-center flex-1 border-r border-slate-100 dark:border-slate-800">
                  <Text className="text-4xs font-bold text-slate-400 uppercase">Drivers Active</Text>
                  <Text className="text-xs font-black text-emerald-600">On Duty</Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-4xs font-bold text-slate-400 uppercase">Rate / 20L</Text>
                  <Text className="text-xs font-black text-indigo-600">
                    {user?.pricePerJar ? `₹${user.pricePerJar}.00` : '₹35.00'}
                  </Text>
                </View>
              </View>
            </View>

            {/* 3-Column Grid of 18 Modules */}
            <View className="flex-row flex-wrap justify-between gap-y-2">
              {menuModules.map((mod) => (
                <TouchableOpacity
                  key={mod.id}
                  onPress={mod.onPress}
                  className="w-[31.6%] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl py-2 px-1.5 items-center justify-center shadow-2xs active:opacity-75 min-h-[90px]"
                  activeOpacity={0.7}
                >
                  <View 
                    className="w-9 h-9 rounded-xl justify-center items-center"
                    style={{ backgroundColor: mod.bg }}
                  >
                    <Ionicons name={mod.icon as any} size={18} color={mod.color} />
                  </View>
                  <Text 
                    className="text-[10.5px] font-bold text-slate-800 dark:text-slate-100 text-center leading-tight mt-1.5 px-0.5"
                    numberOfLines={2}
                  >
                    {mod.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: [ DASHBOARD ] — LIVE BILLING & DELIVERY LOGISTICS (MATCHING IMAGE 4) */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <View className="gap-3">
            {/* Date Selector Row (Matching Screenshot) */}
            <View className="flex-row items-center gap-2">
              <View className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 flex-row items-center gap-2">
                <Ionicons name="calendar-outline" size={18} color="#475569" />
                <Text className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Selected Date: {todayStr}
                </Text>
              </View>

              <TouchableOpacity 
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 items-center justify-center active:opacity-75"
                onPress={() => Alert.alert('Date Filter', 'Filter records by current month or custom date range.')}
                activeOpacity={0.7}
              >
                <Ionicons name="calendar" size={16} color="#334155" />
                <Text className="text-4xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                  Set Month
                </Text>
              </TouchableOpacity>
            </View>

            {/* Total Billing Box (Bill, Collection, Remain - Matching Screenshot) */}
            <View>
              <Text className="text-xs font-black text-slate-900 dark:text-slate-50 mb-1.5 pl-0.5">
                Total Billing :
              </Text>
              <View className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 shadow-2xs">
                <View className="flex-row justify-between">
                  <View className="items-center flex-1">
                    <Text className="text-lg font-black text-sky-600 dark:text-sky-400">
                      {formatCurrency(revenueDisplay + duesDisplay)}
                    </Text>
                    <Text className="text-3xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                      Total Bill
                    </Text>
                  </View>

                  <View className="w-px bg-slate-100 dark:bg-slate-700" />

                  <View className="items-center flex-1">
                    <Text className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(revenueDisplay)}
                    </Text>
                    <Text className="text-3xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                      Total Collection
                    </Text>
                  </View>

                  <View className="w-px bg-slate-100 dark:bg-slate-700" />

                  <View className="items-center flex-1">
                    <Text className="text-lg font-black text-rose-600 dark:text-rose-400">
                      {formatCurrency(duesDisplay)}
                    </Text>
                    <Text className="text-3xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                      Amount Remain
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Total Delivery Box (Given, Taken, Remain - Matching Screenshot) */}
            <View>
              <Text className="text-xs font-black text-slate-900 dark:text-slate-50 mb-1.5 pl-0.5">
                Total Delivery :
              </Text>
              <View className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 shadow-2xs">
                <View className="flex-row justify-between">
                  <View className="items-center flex-1">
                    <Text className="text-xl font-black text-amber-500">
                      {completedRunsCount * 2 + activeRunsCount}
                    </Text>
                    <Text className="text-3xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                      Total Given
                    </Text>
                  </View>

                  <View className="w-px bg-slate-100 dark:bg-slate-700" />

                  <View className="items-center flex-1">
                    <Text className="text-xl font-black text-sky-600 dark:text-sky-400">
                      {completedRunsCount * 2}
                    </Text>
                    <Text className="text-3xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                      Total Taken
                    </Text>
                  </View>

                  <View className="w-px bg-slate-100 dark:bg-slate-700" />

                  <View className="items-center flex-1">
                    <Text className="text-xl font-black text-teal-600 dark:text-teal-400">
                      {activeRunsCount}
                    </Text>
                    <Text className="text-3xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                      Total Remain
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Detailed Accordion Summary Sections (Matching Image 4) */}
            {/* 1. Product Supply */}
            <TouchableOpacity 
              onPress={() => router.push(ROUTES.OWNER.INVENTORY)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3.5 shadow-2xs active:opacity-75"
              activeOpacity={0.7}
            >
              <Text className="text-xs font-black text-slate-900 dark:text-slate-100">
                1. Product Supply :
              </Text>
            </TouchableOpacity>

            {/* 2. Group Delivery */}
            <TouchableOpacity 
              onPress={() => router.push(ROUTES.OWNER.DELIVERIES)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3.5 shadow-2xs active:opacity-75"
              activeOpacity={0.7}
            >
              <Text className="text-xs font-black text-slate-900 dark:text-slate-100">
                2. Group Delivery :
              </Text>
            </TouchableOpacity>

            {/* 3. Staff Delivery Report */}
            <TouchableOpacity 
              onPress={() => router.push('/(owner)/add-helper')}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3.5 shadow-2xs active:opacity-75"
              activeOpacity={0.7}
            >
              <Text className="text-xs font-black text-slate-900 dark:text-slate-100">
                3. Staff Delivery Report :
              </Text>
            </TouchableOpacity>

            {/* 4. Transactions */}
            <TouchableOpacity 
              onPress={() => router.push(ROUTES.OWNER.BILLING)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3.5 shadow-2xs active:opacity-75"
              activeOpacity={0.7}
            >
              <Text className="text-xs font-black text-slate-900 dark:text-slate-100">
                4. Transactions :
              </Text>
            </TouchableOpacity>

            {/* 5. Delivery Reports */}
            <TouchableOpacity 
              onPress={() => router.push(ROUTES.OWNER.REPORTS)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3.5 shadow-2xs active:opacity-75"
              activeOpacity={0.7}
            >
              <Text className="text-xs font-black text-slate-900 dark:text-slate-100">
                5. Delivery Reports :
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* MODALS FOR MODULE CARDS */}
      {/* 1. Products in Use / Field Jars Modal */}
      <Modal
        visible={modalType === 'products_in_use'}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalType(null)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-5 pb-8 max-h-[80%]">
            <View className="flex-row justify-between items-center pb-3 mb-3 border-b border-slate-100 dark:border-slate-700">
              <Text className="text-base font-black text-slate-900 dark:text-slate-50">Products in Use (Field Jars)</Text>
              <TouchableOpacity onPress={() => setModalType(null)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 justify-center items-center">
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text className="text-xs text-slate-500 dark:text-slate-400 mb-4">Live breakdown of water containers currently circulated with customers:</Text>
            <View className="bg-sky-50 dark:bg-sky-950/40 p-4 rounded-2xl border border-sky-100 dark:border-sky-800 mb-3">
              <Text className="text-xs font-bold text-sky-800 dark:text-sky-200">20L Standard Bubbletop Jars</Text>
              <Text className="text-2xl font-black text-sky-700 dark:text-sky-300 mt-1">450 Jars in Circulation</Text>
            </View>
            <View className="bg-teal-50 dark:bg-teal-950/40 p-4 rounded-2xl border border-teal-100 dark:border-teal-800 mb-4">
              <Text className="text-xs font-bold text-teal-800 dark:text-teal-200">Total Security Deposits Held</Text>
              <Text className="text-2xl font-black text-teal-700 dark:text-teal-300 mt-1">₹ 67,500</Text>
            </View>
            <TouchableOpacity onPress={() => { setModalType(null); router.push(ROUTES.OWNER.CUSTOMERS); }} className="bg-sky-600 h-12 rounded-xl justify-center items-center">
              <Text className="text-white text-xs font-black">View Customer Jar Ledgers</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 2. Load / Unload Warehouse Modal */}
      <Modal
        visible={modalType === 'load_unload'}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalType(null)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-5 pb-8 max-h-[80%]">
            <View className="flex-row justify-between items-center pb-3 mb-3 border-b border-slate-100 dark:border-slate-700">
              <Text className="text-base font-black text-slate-900 dark:text-slate-50">Truck Load / Unload Dispatch</Text>
              <TouchableOpacity onPress={() => setModalType(null)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 justify-center items-center">
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text className="text-xs text-slate-500 dark:text-slate-400 mb-4">Record truck inventory loading at plant dock:</Text>
            <View className="flex-row gap-2.5 mb-4">
              <TouchableOpacity onPress={() => { Alert.alert('Dispatch Loaded', '100 filled 20L jars logged to Truck 01.'); setModalType(null); }} className="flex-1 bg-emerald-600 p-4 rounded-2xl items-center">
                <Ionicons name="arrow-up-circle" size={24} color="#FFF" />
                <Text className="text-white text-xs font-black mt-1">Load Truck (+100)</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { Alert.alert('Empties Unloaded', '90 empty returned jars returned to wash plant.'); setModalType(null); }} className="flex-1 bg-sky-600 p-4 rounded-2xl items-center">
                <Ionicons name="arrow-down-circle" size={24} color="#FFF" />
                <Text className="text-white text-xs font-black mt-1">Unload Empties</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 3. Monthly Card Modal */}
      <Modal
        visible={modalType === 'monthly_card'}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalType(null)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-5 pb-8 max-h-[80%]">
            <View className="flex-row justify-between items-center pb-3 mb-3 border-b border-slate-100 dark:border-slate-700">
              <Text className="text-base font-black text-slate-900 dark:text-slate-50">Customer Monthly Card Subscriptions</Text>
              <TouchableOpacity onPress={() => setModalType(null)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 justify-center items-center">
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text className="text-xs text-slate-500 dark:text-slate-400 mb-4">Monthly subscription cards with automatic recurring billing:</Text>
            <View className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 mb-4">
              <Text className="text-xs font-bold text-slate-800 dark:text-slate-200">Active Monthly Subscriptions</Text>
              <Text className="text-2xl font-black text-emerald-600 mt-1">128 Clients Active</Text>
            </View>
            <TouchableOpacity onPress={() => { setModalType(null); router.push(ROUTES.OWNER.CUSTOMERS); }} className="bg-sky-600 h-12 rounded-xl justify-center items-center">
              <Text className="text-white text-xs font-black">Manage Subscribed Clients</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 4. Locate Staff & Customer Modal */}
      <Modal
        visible={modalType === 'locate'}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalType(null)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-5 pb-8 max-h-[80%]">
            <View className="flex-row justify-between items-center pb-3 mb-3 border-b border-slate-100 dark:border-slate-700">
              <Text className="text-base font-black text-slate-900 dark:text-slate-50">Live GPS & Route Locator</Text>
              <TouchableOpacity onPress={() => setModalType(null)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 justify-center items-center">
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text className="text-xs text-slate-500 dark:text-slate-400 mb-4">Active delivery vehicles in transit:</Text>
            <View className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800 mb-4">
              <Text className="text-xs font-bold text-emerald-800 dark:text-emerald-200">🚚 Helper 1 (Driver Ramesh)</Text>
              <Text className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">Sector 4, Main Market • Next drop: Sharma Sweets</Text>
            </View>
            <TouchableOpacity onPress={() => { setModalType(null); router.push(ROUTES.OWNER.DELIVERIES); }} className="bg-sky-600 h-12 rounded-xl justify-center items-center">
              <Text className="text-white text-xs font-black">View Full Route Map</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 5. Recharge Modal */}
      <Modal
        visible={modalType === 'recharge'}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalType(null)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-5 pb-8 max-h-[80%]">
            <View className="flex-row justify-between items-center pb-3 mb-3 border-b border-slate-100 dark:border-slate-700">
              <Text className="text-base font-black text-slate-900 dark:text-slate-50">Plant Subscription Recharge</Text>
              <TouchableOpacity onPress={() => setModalType(null)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 justify-center items-center">
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
            <View className="bg-sky-50 dark:bg-sky-950/40 p-4 rounded-2xl border border-sky-100 dark:border-sky-800 mb-4">
              <Text className="text-xs font-bold text-sky-800 dark:text-sky-200">Current Plan: Pro Plant Plan</Text>
              <Text className="text-lg font-black text-sky-700 dark:text-sky-300 mt-1">14 Days Remaining</Text>
            </View>
            <TouchableOpacity onPress={() => Linking.openURL('tel:8485877633').catch(() => {})} className="bg-emerald-600 h-12 rounded-xl justify-center items-center">
              <Text className="text-white text-xs font-black">Contact Account Manager to Renew</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
