import React, { useState } from 'react';
import { Stack, useRouter } from 'expo-router';
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

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
          },
          headerShadowVisible: false,
          headerTintColor: isDark ? '#FFFFFF' : '#0F172A',
          headerTitle: '',
          headerLeft: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
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

              <View>
                <Text style={{ fontSize: 16, fontWeight: '900', color: isDark ? '#FFFFFF' : '#0F172A' }}>
                  {user?.businessName || 'abhiraj water plant'}
                </Text>
                <Text style={{ fontSize: 9.5, fontWeight: '700', color: '#0284C7' }}>
                  Customer Portal & Delivery
                </Text>
              </View>
            </View>
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 12, gap: 10 }}>
              <TouchableOpacity 
                onPress={() => Alert.alert('Notifications', 'Your next jar delivery is on schedule!')}
                style={{ alignItems: 'center', padding: 2 }}
                activeOpacity={0.7}
              >
                <Ionicons name="notifications" size={19} color="#0284C7" />
                <Text style={{ fontSize: 8, fontWeight: '800', color: '#64748B' }}>Notify</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => Alert.alert('Jar QR', 'Show this QR to the delivery agent to record your jar exchange.')}
                style={{ alignItems: 'center', padding: 2 }}
                activeOpacity={0.7}
              >
                <Ionicons name="qr-code-outline" size={19} color="#0284C7" />
                <Text style={{ fontSize: 8, fontWeight: '800', color: '#64748B' }}>QR Code</Text>
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
          ),
        }}
      >
        <Stack.Screen name="dashboard" options={{ headerShown: true }} />
      </Stack>

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
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#4F46E5' }}>
                  Water Customer Account
                </Text>
              </View>
            </View>

            <ScrollView style={{ marginTop: 16 }}>
              <TouchableOpacity onPress={() => { setSidebarVisible(false); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
                <Ionicons name="water" size={20} color="#0284C7" />
                <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#F1F5F9' : '#1E293B' }}>Order Water Jars</Text>
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
