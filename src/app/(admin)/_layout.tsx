import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, Image, useColorScheme, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants/routes';
import { Ionicons } from '@expo/vector-icons';

export default function AdminLayout() {
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const { signOut } = useAuthStore();
  const router = useRouter();

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
            await signOut();
            router.replace(ROUTES.LOGIN);
          }
        }
      ]
    );
  };

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? '#0F172A' : '#0B1E3B', // Deep SaaS Navy
        },
        headerTintColor: '#FFFFFF',
        headerTitle: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
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
        ),
        headerRight: () => (
          <TouchableOpacity 
            onPress={handleLogout}
            style={{ 
              backgroundColor: 'rgba(239, 68, 68, 0.2)', 
              paddingHorizontal: 12, 
              paddingVertical: 6, 
              borderRadius: 10,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              borderWidth: 1,
              borderColor: 'rgba(239, 68, 68, 0.4)'
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="power" size={14} color="#F87171" />
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#F87171' }}>Logout</Text>
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen name="dashboard" options={{ headerShown: true }} />
    </Stack>
  );
}
