import React, { useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { 
  TouchableOpacity, 
  View, 
  Text, 
  Image, 
  Linking, 
  Alert, 
  Modal, 
  ScrollView, 
  TouchableWithoutFeedback,
  useColorScheme
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants/routes';

export default function CustomerLayout() {
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          setSidebarVisible(false);
          await signOut();
          router.replace(ROUTES.LOGIN);
        }
      }
    ]);
  };

  // Top App Bar Left
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
        <Text style={{ fontSize: 16, fontWeight: '900', color: isDark ? '#FFFFFF' : '#0F172A' }} numberOfLines={1}>
          {user?.businessName || 'abhiraj water plant'}
        </Text>
        <Text style={{ fontSize: 9.5, fontWeight: '700', color: '#0284C7' }}>
          Customer Portal & Delivery
        </Text>
      </View>
    </View>
  );

  // Top App Bar Right
  const renderHeaderRight = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 12, gap: 10 }}>
      <TouchableOpacity 
        onPress={() => Alert.alert('Notifications', 'Your water deliveries are active and on track!')}
        style={{ alignItems: 'center', padding: 2 }}
        activeOpacity={0.7}
      >
        <Ionicons name="notifications" size={19} color="#0284C7" />
        <Text style={{ fontSize: 8, fontWeight: '800', color: '#64748B' }}>Notify</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => Alert.alert('Jar QR', 'Show this QR to delivery driver during jar drop-off.')}
        style={{ alignItems: 'center', padding: 2 }}
        activeOpacity={0.7}
      >
        <Ionicons name="qr-code-outline" size={19} color="#0284C7" />
        <Text style={{ fontSize: 8, fontWeight: '800', color: '#64748B' }}>QR Scan</Text>
      </TouchableOpacity>

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
        {/* 1. Home */}
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

        {/* 2. Elevated Floating (+) Button */}
        <Tabs.Screen 
          name="order-fab" 
          options={{ 
            title: '',
            tabBarIcon: () => (
              <View style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: '#0284C7',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 24,
                borderWidth: 4,
                borderColor: '#0B1E3B',
                elevation: 8,
                shadowColor: '#0284C7',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.5,
                shadowRadius: 6,
              }}>
                <Ionicons name="add" size={32} color="#FFFFFF" />
              </View>
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              router.push('/(customer)/dashboard');
            }
          }}
        />

        {/* 3. Customer Profile */}
        <Tabs.Screen 
          name="profile" 
          options={{ 
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "person" : "person-outline"} size={20} color={color} />
            ),
          }} 
        />
      </Tabs>

      {/* Customer Sidebar Drawer */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={sidebarVisible}
        onRequestClose={() => setSidebarVisible(false)}
      >
        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View style={{ width: '80%', maxWidth: 320, backgroundColor: isDark ? '#0F172A' : '#FFFFFF', height: '100%', padding: 20, paddingTop: insets.top + 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: isDark ? '#334155' : '#E2E8F0' }}>
              <Image source={require('../../../assets/images/logo1_transparent.png')} style={{ width: 44, height: 44 }} resizeMode="contain" />
              <View>
                <Text style={{ fontSize: 16, fontWeight: '900', color: isDark ? '#FFFFFF' : '#0F172A' }}>
                  {user?.displayName || 'Customer'}
                </Text>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#0284C7' }}>
                  Water Customer Account
                </Text>
              </View>
            </View>

            <ScrollView style={{ marginTop: 16 }}>
              <TouchableOpacity onPress={() => { setSidebarVisible(false); router.push('/(customer)/dashboard'); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
                <Ionicons name="water" size={20} color="#0284C7" />
                <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#F1F5F9' : '#1E293B' }}>Order Water Jars</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { setSidebarVisible(false); router.push('/(customer)/profile'); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
                <Ionicons name="person" size={20} color="#4F46E5" />
                <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#F1F5F9' : '#1E293B' }}>My Profile & Address</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { setSidebarVisible(false); Linking.openURL('tel:8485877633'); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
                <Ionicons name="call" size={20} color="#10B981" />
                <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#F1F5F9' : '#1E293B' }}>Plant Support (8485877633)</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleLogout} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, marginTop: 20 }}>
                <Ionicons name="power" size={20} color="#EF4444" />
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#EF4444' }}>Log Out</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
          <TouchableWithoutFeedback onPress={() => setSidebarVisible(false)}>
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
        </View>
      </Modal>
    </>
  );
}
