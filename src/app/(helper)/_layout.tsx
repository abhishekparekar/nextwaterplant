import React from 'react';
import { Tabs } from 'expo-router';
import { useColorScheme, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

export default function HelperLayout() {
  const isDark = useColorScheme() === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const renderHeaderRightLogo = () => (
    <Image 
      source={require('../../../assets/images/logo1_transparent.png')} 
      style={{ width: 90, height: 36, marginRight: 14 }} 
      resizeMode="contain"
    />
  );

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 64 + (insets.bottom > 0 ? insets.bottom : 8),
          paddingBottom: insets.bottom > 0 ? insets.bottom + 4 : 12,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#0284c7', // Sky Blue 600
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        headerStyle: {
          backgroundColor: colors.card,
          shadowColor: 'transparent',
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        headerRight: renderHeaderRightLogo,
      }}
    >
      <Tabs.Screen 
        name="dashboard" 
        options={{ 
          title: 'Runs',
          headerTitle: 'Active Delivery Runs',
          tabBarIcon: ({ color }) => (
            <Ionicons name="bicycle" size={22} color={color} />
          ),
        }} 
      />

      <Tabs.Screen 
        name="deliveries" 
        options={{ 
          title: 'History',
          headerTitle: 'Completed Deliveries',
          tabBarIcon: ({ color }) => (
            <Ionicons name="checkmark-done-circle" size={22} color={color} />
          ),
        }} 
      />

      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profile',
          headerTitle: 'Driver Profile',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={22} color={color} />
          ),
        }} 
      />
    </Tabs>
  );
}
