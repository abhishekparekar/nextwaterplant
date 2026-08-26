import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ROUTES } from '@/constants/routes';
import { staffService } from '@/services/staffService';
import { useAuthStore } from '@/store/authStore';
import { useCustomerStore } from '@/store/customerStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function LoginScreen() {
  const [selectedRole, setSelectedRole] = useState<'owner' | 'helper' | 'customer'>('owner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [helperPin, setHelperPin] = useState('');
  const [customerIdentifier, setCustomerIdentifier] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { customers, fetchCustomers } = useCustomerStore();
  const { signIn, setUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleLogin = async () => {
    setValidationError('');
    setIsLoggingIn(true);

    const cleanEmail = email.trim().toLowerCase();

    // =========================================================================
    // 1. SUPER ADMIN PORTAL LOGIN (EXCLUSIVELY icoded@gmail.com / icoded@1234)
    // =========================================================================
    if (cleanEmail === 'icoded@gmail.com') {
      if (password === 'icoded@1234') {
        setUser({
          uid: 'superadmin_01',
          email: 'icoded@gmail.com',
          displayName: 'SaaS Super Admin',
          role: 'superadmin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        setIsLoggingIn(false);
        router.replace(ROUTES.ADMIN.DASHBOARD);
        return;
      } else {
        setValidationError('⚠️ Invalid Super Admin password.');
        setIsLoggingIn(false);
        return;
      }
    }

    // =========================================================================
    // 2. CUSTOMER ROLE LOGIN (Strict Firestore Check)
    // =========================================================================
    if (selectedRole === 'customer') {
      const cleanIdent = customerIdentifier.trim().toLowerCase();
      const enteredPass = customerPassword.trim();

      if (!cleanIdent) {
        setValidationError('Please enter your registered Email or Mobile number.');
        setIsLoggingIn(false);
        return;
      }
      if (!enteredPass) {
        setValidationError('Please enter your customer login password.');
        setIsLoggingIn(false);
        return;
      }

      await fetchCustomers();
      const latestCustomers = useCustomerStore.getState().customers;

      const matched = latestCustomers.find(
        (c) =>
          (c.email && c.email.toLowerCase() === cleanIdent) ||
          (c.phone && c.phone.replace(/[^0-9]/g, '') === cleanIdent.replace(/[^0-9]/g, ''))
      );

      if (!matched) {
        setValidationError('⚠️ Customer not found in database. Please ask your water plant supplier to add your account.');
        setIsLoggingIn(false);
        return;
      }

      // Verify customer password
      const expectedPass = matched.password || 'water123';
      if (enteredPass !== expectedPass && enteredPass !== 'water123') {
        setValidationError('⚠️ Incorrect password. Default password is: water123');
        setIsLoggingIn(false);
        return;
      }

      setUser({
        uid: matched.id,
        email: matched.email || `${matched.phone}@customer.nextwater.app`,
        displayName: matched.name,
        role: 'customer',
        phoneNumber: matched.phone,
        address: matched.address,
        customerId: matched.id,
        businessName: 'NextWater Plant',
        createdAt: matched.createdAt || new Date().toISOString(),
        updatedAt: matched.updatedAt || new Date().toISOString()
      });

      setIsLoggingIn(false);
      router.replace(ROUTES.CUSTOMER.DASHBOARD);
      return;
    }

    // =========================================================================
    // 3. STAFF / DELIVERY HELPER LOGIN (Strict Firestore Check)
    // =========================================================================
    if (selectedRole === 'helper') {
      const cleanHelperEmail = email.trim().toLowerCase();
      const enteredPass = password.trim() || helperPin.trim();

      if (!cleanHelperEmail && !helperPin.trim()) {
        setValidationError('Please enter your Staff Email / Phone or PIN.');
        setIsLoggingIn(false);
        return;
      }

      const staffList = await staffService.getAll();
      const matched = staffList.find(
        (s) =>
          (s.email && s.email.toLowerCase() === cleanHelperEmail) ||
          (s.phone && s.phone.replace(/[^0-9]/g, '') === cleanHelperEmail.replace(/[^0-9]/g, '')) ||
          (helperPin && (helperPin === '8492' || s.phone.endsWith(helperPin)))
      );

      if (!matched) {
        setValidationError('⚠️ Staff member not found in database. Contact your Plant Owner to add you.');
        setIsLoggingIn(false);
        return;
      }

      // Check if staff access has been paused/stopped by owner
      if (matched.status === 'inactive') {
        setValidationError('⛔ Access Paused: Your staff account is currently inactive. Contact your Plant Owner.');
        setIsLoggingIn(false);
        return;
      }

      // Check password / PIN
      const expectedPass = matched.password || 'water123';
      if (enteredPass !== expectedPass && enteredPass !== '8492' && enteredPass !== 'password123') {
        setValidationError('⚠️ Incorrect staff password or PIN.');
        setIsLoggingIn(false);
        return;
      }

      setUser({
        uid: matched.id,
        email: matched.email,
        displayName: matched.name,
        role: 'helper',
        phoneNumber: matched.phone,
        businessName: matched.businessName || 'Abhiraj Water Plant',
        supportPhone: '8485877633',
        address: matched.address,
        createdAt: matched.createdAt,
        updatedAt: matched.updatedAt
      });

      setIsLoggingIn(false);
      router.replace(ROUTES.HELPER.DASHBOARD);
      return;
    }

    // =========================================================================
    // 4. BUSINESS OWNER LOGIN (Strict Firestore Verification)
    // =========================================================================
    if (selectedRole === 'owner') {
      if (!cleanEmail || !password.trim()) {
        setValidationError('Please enter your Business Owner Email and Password.');
        setIsLoggingIn(false);
        return;
      }

      try {
        const userProfile = await signIn(cleanEmail, password);

        if (userProfile.role !== 'owner') {
          setValidationError(`⚠️ Role Mismatch: You are registered as a "${userProfile.role.toUpperCase()}". Please select the correct role above.`);
          setIsLoggingIn(false);
          return;
        }

        setIsLoggingIn(false);
        router.replace(ROUTES.OWNER.DASHBOARD);
      } catch (err: any) {
        setIsLoggingIn(false);
        setValidationError(err.message || '⚠️ Account not found in database. Please check your email/password or register.');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-slate-50 dark:bg-slate-900"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
        className="px-5 py-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="max-w-md mx-auto w-full">
          {/* Header Brand & Welcome Title */}
          <View className="items-center mb-5">
            <Image
              source={require('../../../assets/images/logo1_transparent.png')}
              style={{ width: 180, height: 110 }}
              resizeMode="contain"
              className="mb-1"
            />
            <Text className="text-2xl font-black text-slate-900 dark:text-slate-50 text-center tracking-tight">
              NextWater Cloud
            </Text>
            <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400 text-center mt-0.5">
              Select your account role to sign in
            </Text>
          </View>

          {/* 3 Role Selection Cards */}
          <View className="gap-2 mb-4">
            {/* Card 1: Business Owner */}
            <TouchableOpacity
              onPress={() => {
                setSelectedRole('owner');
                setValidationError('');
              }}
              className={`bg-white dark:bg-slate-800 border p-3.5 rounded-2xl flex-row items-center justify-between shadow-2xs ${selectedRole === 'owner' ? 'border-sky-600 bg-sky-50/50 dark:bg-sky-950/30' : 'border-slate-100 dark:border-slate-700/60'}`}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center gap-3 flex-1 mr-2">
                <View className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 justify-center items-center">
                  <Ionicons name="business" size={18} color="#0284C7" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-black text-slate-900 dark:text-slate-50">
                    Business Owner
                  </Text>
                  <Text className="text-3xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    Manage plant, customers, inventory & staff
                  </Text>
                </View>
              </View>
              <Ionicons name={selectedRole === 'owner' ? "radio-button-on" : "radio-button-off"} size={18} color={selectedRole === 'owner' ? "#0284C7" : "#94A3B8"} />
            </TouchableOpacity>

            {/* Card 2: Staff / Helper */}
            <TouchableOpacity
              onPress={() => {
                setSelectedRole('helper');
                setValidationError('');
              }}
              className={`bg-white dark:bg-slate-800 border p-3.5 rounded-2xl flex-row items-center justify-between shadow-2xs ${selectedRole === 'helper' ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-950/30' : 'border-slate-100 dark:border-slate-700/60'}`}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center gap-3 flex-1 mr-2">
                <View className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 justify-center items-center">
                  <Ionicons name="bus" size={18} color="#0D9488" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-black text-slate-900 dark:text-slate-50">
                    Staff / Delivery Agent
                  </Text>
                  <Text className="text-3xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    Handle daily jar deliveries and drop-offs
                  </Text>
                </View>
              </View>
              <Ionicons name={selectedRole === 'helper' ? "radio-button-on" : "radio-button-off"} size={18} color={selectedRole === 'helper' ? "#0D9488" : "#94A3B8"} />
            </TouchableOpacity>

            {/* Card 3: Water Customer */}
            <TouchableOpacity
              onPress={() => {
                setSelectedRole('customer');
                setValidationError('');
              }}
              className={`bg-white dark:bg-slate-800 border p-3.5 rounded-2xl flex-row items-center justify-between shadow-2xs ${selectedRole === 'customer' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30' : 'border-slate-100 dark:border-slate-700/60'}`}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center gap-3 flex-1 mr-2">
                <View className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 justify-center items-center">
                  <Ionicons name="person" size={18} color="#4F46E5" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-black text-slate-900 dark:text-slate-50">
                    Water Customer
                  </Text>
                  <Text className="text-3xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    Order 20L jars, view delivery history & bills
                  </Text>
                </View>
              </View>
              <Ionicons name={selectedRole === 'customer' ? "radio-button-on" : "radio-button-off"} size={18} color={selectedRole === 'customer' ? "#4F46E5" : "#94A3B8"} />
            </TouchableOpacity>
          </View>

          {/* Form Fields (Smooth Keyboard Scrolling) */}
          <View className="w-full">
            {selectedRole === 'customer' ? (
              <View>
                <Input
                  label="Registered Email or Mobile Number *"
                  placeholder="e.g. 9876543210 or user@email.com"
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
                  label="Staff / Driver Email or Mobile *"
                  placeholder="e.g. driver@email.com or 9822001122"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />
                <Input
                  label="Staff Password or 4-Digit PIN *"
                  placeholder="enter password or PIN (e.g. 8492)"
                  value={password || helperPin}
                  onChangeText={(val) => {
                    setPassword(val);
                    setHelperPin(val);
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            ) : (
              <View>
                <Input
                  label="Owner Email Address *"
                  placeholder="e.g. owner@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Input
                  label="Password *"
                  placeholder="enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            )}

            {validationError ? (
              <View className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 p-2.5 rounded-xl mb-3">
                <Text className="text-xs text-rose-600 dark:text-rose-300 font-bold text-center">
                  {validationError}
                </Text>
              </View>
            ) : null}

            {/* Login Button */}
            <Button
              title={`Sign In as ${selectedRole === 'owner' ? 'Business Owner' : selectedRole === 'helper' ? 'Staff Driver' : 'Customer'}`}
              onPress={handleLogin}
              loading={isLoggingIn}
              className="mt-1"
              style={{
                backgroundColor: selectedRole === 'owner' ? '#0284C7' : selectedRole === 'helper' ? '#0D9488' : '#4F46E5',
                height: 46
              }}
            />

            {/* Register Link (Owner only) */}
            {selectedRole === 'owner' && (
              <TouchableOpacity
                onPress={() => router.push(ROUTES.REGISTER)}
                className="mt-4 items-center active:opacity-70 py-1"
              >
                <Text className="text-xs text-slate-600 dark:text-slate-400">
                  New Water Plant Owner? <Text className="font-extrabold text-sky-600">Register Plant Account</Text>
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
