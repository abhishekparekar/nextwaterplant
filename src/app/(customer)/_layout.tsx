import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity, View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants/routes';

export default function CustomerLayout() {
  const router = useRouter();
  const { signOut } = useAuthStore();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerShadowVisible: false,
        headerTintColor: '#0F172A',
        headerTitle: '',
        headerLeft: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Image 
              source={require('../../../assets/images/logo1_transparent.png')} 
              style={{ width: 32, height: 32 }} 
              resizeMode="contain"
            />
            <View>
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#0F172A' }}>
                NextWater
              </Text>
              <Text style={{ fontSize: 10, fontWeight: '600', color: '#0284C7' }}>
                Customer Portal
              </Text>
            </View>
          </View>
        ),
        headerRight: () => (
          <TouchableOpacity 
            onPress={() => {
              signOut();
              router.replace(ROUTES.LOGIN);
            }}
            style={{ padding: 6, backgroundColor: '#F1F5F9', borderRadius: 12 }}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen name="dashboard" options={{ headerShown: true }} />
    </Stack>
  );
}
