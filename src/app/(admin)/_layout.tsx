import React, { useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, Image, useColorScheme, Alert, Modal, ScrollView, TouchableWithoutFeedback, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants/routes';
import { Ionicons } from '@expo/vector-icons';

export default function AdminLayout() {
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const { signOut } = useAuthStore();
  const router = useRouter();
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Super Admin Logout',
      'Do you want to log out of the Super Admin SaaS platform?',
      [
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
      ]
    );
  };

  const renderHeaderLeft = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 16, gap: 10 }}>
      <TouchableOpacity 
        onPress={() => setSidebarVisible(true)}
        activeOpacity={0.7}
        style={{ padding: 4 }}
      >
        <Ionicons name="menu" size={26} color="#FFFFFF" />
      </TouchableOpacity>

      <Image 
        source={require('../../../assets/images/logo1_transparent.png')} 
        style={{ width: 34, height: 34 }} 
        resizeMode="contain"
      />

      <View>
        <Text style={{ fontSize: 15, fontWeight: '900', color: '#FFFFFF' }}>
          NextWater SaaS
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' }} />
          <Text style={{ fontSize: 9, fontWeight: '800', color: '#38BDF8', letterSpacing: 0.5 }}>
            SUPER ADMIN PORTAL
          </Text>
        </View>
      </View>
    </View>
  );

  const renderHeaderRight = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 12, gap: 10 }}>
      <TouchableOpacity 
        onPress={() => Alert.alert('Platform Notifications', 'All cloud database microservices operating normally.')}
        style={{ alignItems: 'center', padding: 2 }}
        activeOpacity={0.7}
      >
        <Ionicons name="notifications" size={19} color="#38BDF8" />
        <Text style={{ fontSize: 8, fontWeight: '800', color: '#94A3B8' }}>Notify</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => Linking.openURL('tel:8485877633').catch(() => {})}
        style={{ alignItems: 'center', padding: 2 }}
        activeOpacity={0.7}
      >
        <Ionicons name="help-circle-outline" size={19} color="#38BDF8" />
        <Text style={{ fontSize: 8, fontWeight: '800', color: '#94A3B8' }}>Help</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: '#0B1E3B',
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
            backgroundColor: '#0B1E3B',
            shadowColor: 'transparent',
            borderBottomWidth: 1,
            borderBottomColor: '#1E293B',
          },
          headerTitle: '',
          headerLeft: renderHeaderLeft,
          headerRight: renderHeaderRight,
        }}
      >
        {/* 1. Dashboard (Plants & Plans) */}
        <Tabs.Screen 
          name="dashboard" 
          options={{ 
            title: 'Plants',
            tabBarIcon: ({ focused }) => (
              <View style={{
                backgroundColor: focused ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
                paddingHorizontal: 14,
                paddingVertical: 3,
                borderRadius: 14,
                alignItems: 'center'
              }}>
                <Ionicons name={focused ? "business" : "business-outline"} size={20} color={focused ? '#38BDF8' : '#94A3B8'} />
              </View>
            ),
          }} 
        />

        {/* 2. Super Admin Profile */}
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

      {/* Sidebar Drawer */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={sidebarVisible}
        onRequestClose={() => setSidebarVisible(false)}
      >
        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View style={{ width: '80%', maxWidth: 320, backgroundColor: '#0F172A', height: '100%', padding: 20, paddingTop: insets.top + 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#334155' }}>
              <Image source={require('../../../assets/images/logo1_transparent.png')} style={{ width: 44, height: 44 }} resizeMode="contain" />
              <View>
                <Text style={{ fontSize: 16, fontWeight: '900', color: '#FFFFFF' }}>
                  Super Admin
                </Text>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#38BDF8' }}>
                  icoded@gmail.com
                </Text>
              </View>
            </View>

            <ScrollView style={{ marginTop: 16 }}>
              <TouchableOpacity onPress={() => { setSidebarVisible(false); router.push('/(admin)/dashboard'); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
                <Ionicons name="business" size={20} color="#38BDF8" />
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#F1F5F9' }}>Registered Plants</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { setSidebarVisible(false); router.push('/(admin)/profile'); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
                <Ionicons name="person" size={20} color="#818CF8" />
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#F1F5F9' }}>Super Admin Settings</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { setSidebarVisible(false); Linking.openURL('tel:8485877633'); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
                <Ionicons name="call" size={20} color="#10B981" />
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#F1F5F9' }}>Helpline (8485877633)</Text>
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
