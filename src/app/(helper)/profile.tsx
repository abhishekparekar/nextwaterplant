import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  Alert,
  KeyboardAvoidingView, 
  Platform,
  Linking
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ROUTES } from '@/constants/routes';
import { Ionicons } from '@expo/vector-icons';

export default function HelperProfileScreen() {
  const { user, signOut, updateProfile, loading } = useAuthStore();
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || 'Ramesh Driver');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '9822001122');
  const [address, setAddress] = useState(user?.address || 'Near Plant MIDC');
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    if (!displayName || !phoneNumber) {
      Alert.alert('Validation Error', 'Name and Phone Number are required.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        displayName: displayName.trim(),
        phoneNumber: phoneNumber.trim(),
        address: address.trim(),
      });
      Alert.alert('Profile Updated', 'Your staff profile has been updated successfully.');
      setModalVisible(false);
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace(ROUTES.LOGIN);
    } catch (err: any) {
      Alert.alert('Sign Out Error', err.message || 'Failed to sign out');
    }
  };

  return (
    <ScrollView 
      className="flex-1 bg-slate-50 dark:bg-slate-900 px-3.5 py-3" 
      contentContainerStyle={{ paddingBottom: 60 }}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Helper Profile Card */}
      <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 items-center shadow-2xs mb-3">
        <View className="w-18 h-18 rounded-full bg-teal-600 justify-center items-center mb-2 shadow-sm">
          <Text className="text-2xl font-black text-white">
            {user?.displayName?.substring(0, 2).toUpperCase() || 'RD'}
          </Text>
        </View>

        <Text className="text-base font-black text-slate-900 dark:text-slate-50 text-center">
          {user?.displayName || 'Ramesh Driver'}
        </Text>

        <Text className="text-xs font-bold text-teal-600 dark:text-teal-400 mt-0.5 text-center">
          Assigned Plant: {user?.businessName || 'Abhiraj Water Plant'}
        </Text>

        <View className="flex-row items-center gap-1 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800/60 mt-2">
          <Ionicons name="shield-checkmark" size={12} color="#0D9488" />
          <Text className="text-4xs font-black text-teal-700 dark:text-teal-300 uppercase tracking-wider">
            Verified Logistics Staff
          </Text>
        </View>
      </View>

      {/* 2. Staff Details Section */}
      <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl p-3.5 shadow-2xs mb-3">
        <View className="flex-row justify-between items-center mb-2.5 pb-2 border-b border-slate-100 dark:border-slate-700/50">
          <Text className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Staff Credentials & Info
          </Text>

          <TouchableOpacity 
            onPress={() => {
              setDisplayName(user?.displayName || 'Ramesh Driver');
              setPhoneNumber(user?.phoneNumber || '9822001122');
              setAddress(user?.address || 'Near Plant MIDC');
              setModalVisible(true);
            }}
            className="flex-row items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 active:opacity-75"
          >
            <Ionicons name="create-outline" size={13} color="#0D9488" />
            <Text className="text-3xs font-black text-teal-600">Edit Info</Text>
          </TouchableOpacity>
        </View>

        {/* Staff Full Name */}
        <View className="flex-row items-center gap-2.5 py-1.5">
          <View className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/50 justify-center items-center">
            <Ionicons name="person" size={14} color="#0D9488" />
          </View>
          <View className="flex-1">
            <Text className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Staff Full Name
            </Text>
            <Text className="text-[13.5px] font-black text-slate-800 dark:text-slate-100 mt-0.5">
              {user?.displayName || 'Ramesh Driver'}
            </Text>
          </View>
        </View>

        <View className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

        {/* Staff Mobile */}
        <View className="flex-row items-center gap-2.5 py-1.5">
          <View className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 justify-center items-center">
            <Ionicons name="call" size={14} color="#059669" />
          </View>
          <View className="flex-1">
            <Text className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Mobile Contact
            </Text>
            <Text className="text-[13.5px] font-black text-emerald-600 mt-0.5">
              {user?.phoneNumber || '9822001122'}
            </Text>
          </View>
        </View>

        <View className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

        {/* Staff Email */}
        <View className="flex-row items-center gap-2.5 py-1.5">
          <View className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/50 justify-center items-center">
            <Ionicons name="mail" size={14} color="#0284C7" />
          </View>
          <View className="flex-1">
            <Text className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Staff Login Email
            </Text>
            <Text className="text-[13.5px] font-black text-slate-800 dark:text-slate-100 mt-0.5">
              {user?.email || 'ramesh@driver.com'}
            </Text>
          </View>
        </View>

        <View className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

        {/* Address */}
        <View className="flex-row items-center gap-2.5 py-1.5">
          <View className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 justify-center items-center">
            <Ionicons name="location" size={14} color="#D97706" />
          </View>
          <View className="flex-1">
            <Text className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Current Address
            </Text>
            <Text className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
              {user?.address || 'Near Plant MIDC'}
            </Text>
          </View>
        </View>
      </View>

      {/* 3. Plant Helpline Card */}
      <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl p-3.5 shadow-2xs mb-4">
        <Text className="text-xs font-black text-slate-900 dark:text-slate-100 mb-2 pb-2 border-b border-slate-100 dark:border-slate-700/50 uppercase tracking-wider">
          Water Plant Support Helpline
        </Text>
        <Text className="text-3xs text-slate-500 mb-2.5">
          Contact your plant manager or supervisor for vehicle maintenance or dispatch issues.
        </Text>
        <TouchableOpacity
          onPress={() => Linking.openURL('tel:8485877633').catch(() => {})}
          className="bg-emerald-600 py-2.5 rounded-xl flex-row justify-center items-center gap-1.5"
        >
          <Ionicons name="call" size={15} color="#FFF" />
          <Text className="text-xs font-black text-white">Call Plant Manager (8485877633)</Text>
        </TouchableOpacity>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity 
        onPress={handleSignOut}
        className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 h-11 rounded-xl flex-row justify-center items-center gap-2 active:opacity-75"
        activeOpacity={0.8}
      >
        <Ionicons name="power" size={16} color="#E11D48" />
        <Text className="text-xs font-black text-rose-600">Sign Out Helper Account</Text>
      </TouchableOpacity>

      {/* EDIT MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-end bg-black/60"
        >
          <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-5 pb-8 max-h-[85%]">
            <View className="flex-row justify-between items-center pb-3 mb-3 border-b border-slate-100 dark:border-slate-700/60">
              <Text className="text-sm font-black text-slate-900 dark:text-slate-100">
                Edit Staff Information
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 justify-center items-center">
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Input
                label="Staff Full Name *"
                value={displayName}
                onChangeText={setDisplayName}
              />

              <Input
                label="Mobile Phone *"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />

              <Input
                label="Address"
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={2}
              />

              <View className="flex-row gap-2 mt-2">
                <View className="flex-1">
                  <Button
                    title="Cancel"
                    variant="outline"
                    onPress={() => setModalVisible(false)}
                    style={{ height: 42 }}
                  />
                </View>
                <View className="flex-1">
                  <Button
                    title="Save Profile"
                    onPress={handleSaveProfile}
                    loading={saving}
                    style={{ height: 42 }}
                  />
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}
