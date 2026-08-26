import React, { useState, useEffect } from 'react';
import { 
  Text, 
  View, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  Image, 
  Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useCustomerStore } from '@/store/customerStore';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { ROUTES } from '@/constants/routes';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [selectedRole, setSelectedRole] = useState<'owner' | 'helper' | 'customer'>('owner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [helperPin, setHelperPin] = useState('');
  const [customerIdentifier, setCustomerIdentifier] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  
  const { customers, fetchCustomers } = useCustomerStore();
  const { signIn, setUser, loading, error } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleLogin = async () => {
    setValidationError('');

    if (selectedRole === 'customer') {
      const cleanIdent = customerIdentifier.trim().toLowerCase();
      if (!cleanIdent) {
        setValidationError('Please enter your registered Email or Mobile number.');
        return;
      }
      if (!customerPassword) {
        setValidationError('Please enter your password.');
        return;
      }

      // Check if matches an existing registered customer
      const matched = customers.find(
        (c) => 
          (c.email && c.email.toLowerCase() === cleanIdent) || 
          c.phone.replace(/[^0-9]/g, '') === cleanIdent.replace(/[^0-9]/g, '') ||
          c.name.toLowerCase() === cleanIdent
      );

      const customerName = matched ? matched.name : (cleanIdent.includes('@') ? cleanIdent.split('@')[0] : `Customer ${cleanIdent.slice(-4)}`);
      
      setUser({
        uid: matched ? matched.id : `cust_${Date.now()}`,
        email: matched?.email || `${cleanIdent}@customer.nextwater.app`,
        displayName: customerName,
        role: 'customer',
        phoneNumber: matched?.phone || cleanIdent,
        address: matched?.address || 'Water Delivery Address',
        customerId: matched?.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      router.replace('/(customer)/dashboard');
      return;
    }

    if (selectedRole === 'helper') {
      if (helperPin === '8492' || helperPin.length >= 4) {
        setUser({
          uid: 'helper_1',
          email: email || 'driver@nextwater.app',
          displayName: 'Ramesh Driver',
          role: 'helper',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        router.replace(ROUTES.HELPER.DASHBOARD);
        return;
      }
    }

    if (!email || !password) {
      setValidationError('Please enter your email and password.');
      return;
    }

    // SUPER ADMIN EXCLUSIVE DIRECT LOGIN
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === 'icoded@gmail.com' && password === 'icoded@1234') {
      setUser({
        uid: 'superadmin_01',
        email: 'icoded@gmail.com',
        displayName: 'SaaS Super Admin',
        role: 'superadmin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      router.replace(ROUTES.ADMIN.DASHBOARD);
      return;
    }
    
    try {
      const user = await signIn(email.trim(), password);
      if (user.role === 'owner') {
        router.replace(ROUTES.OWNER.DASHBOARD);
      } else {
        router.replace(ROUTES.HELPER.DASHBOARD);
      }
    } catch (err) {
      // Handled by store error state
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-50 dark:bg-slate-900"
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} 
        keyboardShouldPersistTaps="handled"
        className="px-5 py-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="max-w-md mx-auto w-full">
          {/* Header Brand & Welcome Title (Matching Mockup 1) */}
          <View className="items-center mb-6">
            <Image 
              source={require('../../../assets/images/logo1_transparent.png')} 
              style={{ width: 180, height: 110 }} 
              resizeMode="contain"
              className="mb-1"
            />
            <Text className="text-2xl font-black text-slate-900 dark:text-slate-50 text-center tracking-tight">
              Welcome to NextWater
            </Text>
            <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400 text-center mt-1">
              Please choose how you want to continue
            </Text>
          </View>

          {/* 3 Role Selection Cards (Matching Reference Mockup 1) */}
          <View className="gap-2.5 mb-5">
            {/* Card 1: Business Owner */}
            <TouchableOpacity 
              onPress={() => setSelectedRole('owner')}
              className={`bg-white dark:bg-slate-800 border p-3.5 rounded-2xl flex-row items-center justify-between shadow-2xs ${selectedRole === 'owner' ? 'border-sky-600 bg-sky-50/40 dark:bg-sky-950/30' : 'border-slate-100 dark:border-slate-700/60'}`}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center gap-3 flex-1 mr-2">
                <View className="w-11 h-11 rounded-2xl bg-sky-50 dark:bg-sky-950/60 justify-center items-center">
                  <Ionicons name="briefcase" size={20} color="#0284C7" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-black text-slate-900 dark:text-slate-50">
                    I'm Water Supply Business Owner
                  </Text>
                  <Text className="text-3xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    Manage water plant, billing and logistics
                  </Text>
                </View>
              </View>
              <Ionicons name={selectedRole === 'owner' ? "radio-button-on" : "chevron-forward"} size={18} color="#0284C7" />
            </TouchableOpacity>

            {/* Card 2: Staff / Delivery Driver */}
            <TouchableOpacity 
              onPress={() => setSelectedRole('helper')}
              className={`bg-white dark:bg-slate-800 border p-3.5 rounded-2xl flex-row items-center justify-between shadow-2xs ${selectedRole === 'helper' ? 'border-sky-600 bg-sky-50/40 dark:bg-sky-950/30' : 'border-slate-100 dark:border-slate-700/60'}`}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center gap-3 flex-1 mr-2">
                <View className="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-950/60 justify-center items-center">
                  <Ionicons name="bicycle" size={20} color="#0D9488" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-black text-slate-900 dark:text-slate-50">
                    I'm a Staff / Delivery Agent
                  </Text>
                  <Text className="text-3xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    Handle daily deliveries and jar drop-offs
                  </Text>
                </View>
              </View>
              <Ionicons name={selectedRole === 'helper' ? "radio-button-on" : "chevron-forward"} size={18} color="#0D9488" />
            </TouchableOpacity>

            {/* Card 3: Water Customer */}
            <TouchableOpacity 
              onPress={() => setSelectedRole('customer')}
              className={`bg-white dark:bg-slate-800 border p-3.5 rounded-2xl flex-row items-center justify-between shadow-2xs ${selectedRole === 'customer' ? 'border-sky-600 bg-sky-50/40 dark:bg-sky-950/30' : 'border-slate-100 dark:border-slate-700/60'}`}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center gap-3 flex-1 mr-2">
                <View className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 justify-center items-center">
                  <Ionicons name="person" size={20} color="#2563EB" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-black text-slate-900 dark:text-slate-50">
                    I'm a Customer
                  </Text>
                  <Text className="text-3xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    Order 20L jars, view balance and delivery status
                  </Text>
                </View>
              </View>
              <Ionicons name={selectedRole === 'customer' ? "radio-button-on" : "chevron-forward"} size={18} color="#2563EB" />
            </TouchableOpacity>
          </View>

          {/* Role-Specific Form Fields */}
          <View className="w-full">
            {selectedRole === 'customer' ? (
              <View>
                <Input
                  label="Registered Email or Mobile Number *"
                  placeholder="e.g. ramesh@email.com or 9876543210"
                  value={customerIdentifier}
                  onChangeText={setCustomerIdentifier}
                  autoCapitalize="none"
                />
                <Input
                  label="Customer Password *"
                  placeholder="enter password (default: water123)"
                  value={customerPassword}
                  onChangeText={setCustomerPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            ) : selectedRole === 'helper' ? (
              <View>
                <Input
                  label="Driver / Helper Email"
                  placeholder="driver@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Input
                  label="4-Digit Quick Auth PIN or Password"
                  placeholder="e.g. 8492"
                  value={helperPin || password}
                  onChangeText={(val) => {
                    setHelperPin(val);
                    setPassword(val);
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            ) : (
              <View>
                <Input
                  label="Owner Email Address"
                  placeholder="owner@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Input
                  label="Password"
                  placeholder="enter password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            )}

            {error || validationError ? (
              <Text className="text-xs text-rose-500 font-bold text-center mb-3">
                {error || validationError}
              </Text>
            ) : null}

            <Button
              title={selectedRole === 'customer' ? "Customer Sign In" : "Sign In & Continue"}
              onPress={handleLogin}
              loading={loading}
              style={{ height: 46, borderRadius: 14 }}
            />

            {selectedRole === 'owner' && (
              <View className="flex-row justify-center items-center mt-4">
                <Text className="text-xs text-slate-500 dark:text-slate-400">
                  New Water Plant Owner?
                </Text>
                <TouchableOpacity onPress={() => router.push(ROUTES.REGISTER)}>
                  <Text className="text-xs text-sky-600 dark:text-sky-400 font-bold ml-1.5">
                    Register Plant
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
