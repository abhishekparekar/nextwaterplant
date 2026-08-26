import React, { useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { 
  useColorScheme, 
  TouchableOpacity, 
  Image, 
  View, 
  Text, 
  Platform, 
  Modal, 
  ScrollView, 
  Linking,
  Alert,
  TouchableWithoutFeedback
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { ROUTES } from '@/constants/routes';

export default function OwnerLayout() {
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [generatedPin, setGeneratedPin] = useState('8492');

  const handleLogout = async () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of NextWater?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          setSidebarVisible(false);
          await authService.signOut();
          router.replace(ROUTES.LOGIN);
        }
      }
    ]);
  };

  const handleGeneratePin = () => {
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedPin(randomPin);
    setPinModalVisible(true);
  };

  // Top App Bar Left (☰ Hamburger + Plant Name)
  const renderHeaderLeft = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 16, gap: 10 }}>
      <TouchableOpacity 
        onPress={() => setSidebarVisible(true)}
        activeOpacity={0.7}
        style={{ padding: 4 }}
      >
        <Ionicons name="menu" size={26} color={isDark ? '#F8FAFC' : '#0F172A'} />
      </TouchableOpacity>

      <Image 
        source={require('../../../assets/images/logo1_transparent.png')} 
        style={{ width: 32, height: 32 }} 
        resizeMode="contain"
      />

      <View style={{ maxWidth: 160 }}>
        <Text style={{ fontSize: 16, fontWeight: '900', color: isDark ? '#F8FAFC' : '#0F172A' }} numberOfLines={1}>
          {user?.businessName || 'abhiraj water plant'}
        </Text>
        <Text style={{ fontSize: 9.5, fontWeight: '700', color: '#0284C7' }}>
          Water Plant Management
        </Text>
      </View>
    </View>
  );

  // Top App Bar Right (Notify, QR Scan, Help)
  const renderHeaderRight = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 12, gap: 10 }}>
      {/* Notify */}
      <TouchableOpacity 
        onPress={() => router.push(ROUTES.OWNER.ORDERS)}
        style={{ alignItems: 'center', padding: 2 }}
        activeOpacity={0.7}
      >
        <Ionicons name="notifications" size={19} color="#0284C7" />
        <Text style={{ fontSize: 8, fontWeight: '800', color: '#64748B' }}>Notify</Text>
      </TouchableOpacity>

      {/* QR Scan */}
      <TouchableOpacity 
        onPress={() => Alert.alert('QR Scanner', 'Scanner active for Customer Jar QR codes & delivery confirmation.')}
        style={{ alignItems: 'center', padding: 2 }}
        activeOpacity={0.7}
      >
        <Ionicons name="qr-code-outline" size={19} color="#0284C7" />
        <Text style={{ fontSize: 8, fontWeight: '800', color: '#64748B' }}>QR Scan</Text>
      </TouchableOpacity>

      {/* Help */}
      <TouchableOpacity 
        onPress={() => Linking.openURL('tel:8485877633').catch(() => {})}
        style={{ alignItems: 'center', padding: 2 }}
        activeOpacity={0.7}
      >
        <Ionicons name="help-circle-outline" size={19} color="#0284C7" />
        <Text style={{ fontSize: 8, fontWeight: '800', color: '#64748B' }}>Help</Text>
      </TouchableOpacity>
    </View>
  );

  const renderBackButton = () => (
    <TouchableOpacity 
      onPress={() => router.replace('/(owner)/dashboard')}
      style={{ paddingLeft: 16 }}
      activeOpacity={0.7}
    >
      <Ionicons name="arrow-back" size={24} color={isDark ? '#F8FAFC' : '#0F172A'} />
    </TouchableOpacity>
  );

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: '#0B1E3B', // Deep dark navy
            borderTopWidth: 0,
            height: 66 + (insets.bottom > 0 ? insets.bottom : 8),
            paddingBottom: insets.bottom > 0 ? insets.bottom + 4 : 10,
            paddingTop: 8,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
          },
          tabBarActiveTintColor: '#38BDF8',
          tabBarInactiveTintColor: '#94A3B8',
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '700',
            marginTop: 2,
          },
          headerStyle: {
            backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
            shadowColor: 'transparent',
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#1E293B' : '#F1F5F9',
          },
          headerTitle: '',
          headerLeft: renderHeaderLeft,
          headerRight: renderHeaderRight,
        }}
      >
        {/* 1. Home (Menu & Dashboard) */}
        <Tabs.Screen 
          name="dashboard" 
          options={{ 
            title: 'Home',
            tabBarIcon: ({ focused }) => (
              <View style={{
                backgroundColor: focused ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
                paddingHorizontal: 14,
                paddingVertical: 3,
                borderRadius: 14,
                alignItems: 'center'
              }}>
                <Ionicons name={focused ? "home" : "home-outline"} size={20} color={focused ? '#38BDF8' : '#94A3B8'} />
              </View>
            ),
          }} 
        />

        {/* 2. Orders */}
        <Tabs.Screen 
          name="orders" 
          options={{ 
            title: 'Orders',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "receipt" : "receipt-outline"} size={20} color={color} />
            ),
          }} 
        />

        {/* 3. Center Elevated Floating Action (+) Button */}
        <Tabs.Screen 
          name="billing" 
          options={{ 
            title: '',
            tabBarIcon: () => (
              <View style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: '#0284C7',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: Platform.OS === 'ios' ? 24 : 30,
                shadowColor: '#0284C7',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 6,
                elevation: 8,
                borderWidth: 3,
                borderColor: '#0B1E3B'
              }}>
                <Ionicons name="add" size={28} color="#FFFFFF" />
              </View>
            ),
          }} 
        />

        {/* 4. Customers */}
        <Tabs.Screen 
          name="customers" 
          options={{ 
            title: 'Customers',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "people" : "people-outline"} size={20} color={color} />
            ),
          }} 
        />

        {/* 5. Profile (Renamed from More) */}
        <Tabs.Screen 
          name="profile" 
          options={{ 
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "person-circle" : "person-circle-outline"} size={21} color={color} />
            ),
          }} 
        />

        {/* Sub-screens */}
        <Tabs.Screen name="deliveries" options={{ href: null, headerLeft: renderBackButton }} />
        <Tabs.Screen name="inventory" options={{ href: null, headerLeft: renderBackButton }} />
        <Tabs.Screen name="expenses" options={{ href: null, headerLeft: renderBackButton }} />
        <Tabs.Screen name="reports" options={{ href: null, headerLeft: renderBackButton }} />
        <Tabs.Screen name="add-helper" options={{ href: null, headerLeft: renderBackButton }} />
      </Tabs>

      {/* SIDEBAR DRAWER MODAL (PROFESSIONAL BUSINESS DRAWER) */}
      <Modal
        visible={sidebarVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSidebarVisible(false)}
      >
        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.55)' }}>
          {/* Drawer Content */}
          <View style={{
            width: '82%',
            maxWidth: 320,
            backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
            height: '100%',
            paddingTop: Math.max(insets.top, 20),
            paddingBottom: Math.max(insets.bottom, 16),
            shadowColor: '#000',
            shadowOffset: { width: 4, height: 0 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 16
          }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header with Plant Branding & Profile Details */}
              <View style={{ paddingHorizontal: 18, paddingTop: 12, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: isDark ? '#1E293B' : '#F1F5F9' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <Image 
                    source={require('../../../assets/images/logo1_transparent.png')} 
                    style={{ width: 48, height: 48 }} 
                    resizeMode="contain"
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '900', color: isDark ? '#F8FAFC' : '#0F172A' }} numberOfLines={1}>
                      {user?.businessName || 'abhiraj water plant'}
                    </Text>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#0284C7', marginTop: 1 }}>
                      {user?.displayName || 'Abhishek'} (Owner)
                    </Text>
                  </View>
                </View>

                <View style={{ backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: isDark ? '#334155' : '#E2E8F0' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: '#64748B' }}>
                      Current Plan :
                    </Text>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#059669' }}>
                      Pro Plant (14 Days left)
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: '#64748B' }}>
                      Client Limit :
                    </Text>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#0284C7' }}>
                      Unlimited Storage
                    </Text>
                  </View>
                </View>
              </View>

              {/* Business Owner Navigation Tables & Modules */}
              <View style={{ paddingVertical: 6 }}>
                {/* 1. Home / Dashboard */}
                <TouchableOpacity 
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 18, gap: 12 }}
                  onPress={() => {
                    setSidebarVisible(false);
                    router.push('/(owner)/dashboard');
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="home-outline" size={18} color="#0284C7" />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#E2E8F0' : '#1E293B' }}>
                    Home & Dashboard
                  </Text>
                </TouchableOpacity>

                {/* 2. Customer Management */}
                <TouchableOpacity 
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 18, gap: 12 }}
                  onPress={() => {
                    setSidebarVisible(false);
                    router.push(ROUTES.OWNER.CUSTOMERS);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="people-outline" size={18} color="#0284C7" />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#E2E8F0' : '#1E293B' }}>
                    Customer Management
                  </Text>
                </TouchableOpacity>

                {/* 3. Products & 20L Stock */}
                <TouchableOpacity 
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 18, gap: 12 }}
                  onPress={() => {
                    setSidebarVisible(false);
                    router.push(ROUTES.OWNER.INVENTORY);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="cube-outline" size={18} color="#2563EB" />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#E2E8F0' : '#1E293B' }}>
                    20L Jars Inventory
                  </Text>
                </TouchableOpacity>

                {/* 4. Delivery Routes */}
                <TouchableOpacity 
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 18, gap: 12 }}
                  onPress={() => {
                    setSidebarVisible(false);
                    router.push(ROUTES.OWNER.DELIVERIES);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="map-outline" size={18} color="#0D9488" />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#E2E8F0' : '#1E293B' }}>
                    Delivery Routes & Dispatch
                  </Text>
                </TouchableOpacity>

                {/* 5. Invoices & Billing */}
                <TouchableOpacity 
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 18, gap: 12 }}
                  onPress={() => {
                    setSidebarVisible(false);
                    router.push(ROUTES.OWNER.BILLING);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="receipt-outline" size={18} color="#0284C7" />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#E2E8F0' : '#1E293B' }}>
                    Invoices & Billing
                  </Text>
                </TouchableOpacity>

                {/* 6. Helpers / Delivery Staff */}
                <TouchableOpacity 
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 18, gap: 12 }}
                  onPress={() => {
                    setSidebarVisible(false);
                    router.push('/(owner)/add-helper');
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="bicycle-outline" size={18} color="#EA580C" />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#E2E8F0' : '#1E293B' }}>
                    Delivery Helpers & Staff
                  </Text>
                </TouchableOpacity>

                {/* 7. Expense Tracker */}
                <TouchableOpacity 
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 18, gap: 12 }}
                  onPress={() => {
                    setSidebarVisible(false);
                    router.push(ROUTES.OWNER.EXPENSES);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="wallet-outline" size={18} color="#D97706" />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#E2E8F0' : '#1E293B' }}>
                    Expense & Cost Tracker
                  </Text>
                </TouchableOpacity>

                {/* 8. Reports & Analytics */}
                <TouchableOpacity 
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 18, gap: 12 }}
                  onPress={() => {
                    setSidebarVisible(false);
                    router.push(ROUTES.OWNER.REPORTS);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="stats-chart-outline" size={18} color="#059669" />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#E2E8F0' : '#1E293B' }}>
                    Business Reports & P&L
                  </Text>
                </TouchableOpacity>

                {/* 9. Generate Driver Auth PIN */}
                <TouchableOpacity 
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 18, gap: 12 }}
                  onPress={() => {
                    setSidebarVisible(false);
                    handleGeneratePin();
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="key-outline" size={18} color="#D97706" />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#E2E8F0' : '#1E293B' }}>
                    Generate Driver Auth PIN
                  </Text>
                </TouchableOpacity>

                {/* 10. Owner Profile & Settings */}
                <TouchableOpacity 
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 18, gap: 12 }}
                  onPress={() => {
                    setSidebarVisible(false);
                    router.push(ROUTES.OWNER.PROFILE);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="settings-outline" size={18} color="#6366F1" />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#E2E8F0' : '#1E293B' }}>
                    Plant Profile & Settings
                  </Text>
                </TouchableOpacity>

                {/* 11. Support Helpline */}
                <TouchableOpacity 
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 18, gap: 12 }}
                  onPress={() => Linking.openURL('tel:8485877633').catch(() => {})}
                  activeOpacity={0.7}
                >
                  <Ionicons name="call-outline" size={18} color="#059669" />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#E2E8F0' : '#1E293B' }}>
                    Helpline (8485877633)
                  </Text>
                </TouchableOpacity>

                {/* 12. Log Out */}
                <TouchableOpacity 
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 18, gap: 12, marginTop: 4 }}
                  onPress={handleLogout}
                  activeOpacity={0.7}
                >
                  <Ionicons name="power-outline" size={18} color="#EF4444" />
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#EF4444' }}>
                    Log Out
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Compact Footer */}
              <View style={{ paddingHorizontal: 18, paddingVertical: 12, borderTopWidth: 1, borderTopColor: isDark ? '#1E293B' : '#F1F5F9' }}>
                <Text style={{ fontSize: 9, color: '#94A3B8' }}>
                  UID: {user?.uid ? user.uid.substring(0, 16) : '0aNoBUTgS9NSGUYo'}
                </Text>
                <Text style={{ fontSize: 9, color: '#94A3B8', marginTop: 1 }}>
                  NextWater Pro Business Suite v1.85.0
                </Text>
              </View>
            </ScrollView>
          </View>

          {/* Backdrop Touch to Close */}
          <TouchableWithoutFeedback onPress={() => setSidebarVisible(false)}>
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
        </View>
      </Modal>

      {/* GENERATE AUTH PIN MODAL */}
      <Modal
        visible={pinModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPinModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 20 }}>
          <View style={{ width: '100%', maxWidth: 340, backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderRadius: 24, padding: 24, alignItems: 'center' }}>
            <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(217, 119, 6, 0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
              <Ionicons name="key" size={26} color="#D97706" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '900', color: isDark ? '#F8FAFC' : '#0F172A', textAlign: 'center' }}>
              Driver Quick Auth PIN
            </Text>
            <Text style={{ fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 4 }}>
              Provide this one-time PIN to your logistics helper to sign in without email password.
            </Text>

            <View style={{ backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderWidth: 2, borderColor: '#D97706', borderStyle: 'dashed', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16, marginVertical: 20 }}>
              <Text style={{ fontSize: 32, fontWeight: '900', color: '#D97706', letterSpacing: 8 }}>
                {generatedPin}
              </Text>
            </View>

            <TouchableOpacity 
              onPress={() => setPinModalVisible(false)}
              style={{ width: '100%', height: 48, backgroundColor: '#0284C7', borderRadius: 14, justifyContent: 'center', alignItems: 'center' }}
            >
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFF' }}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}
