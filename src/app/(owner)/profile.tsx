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
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ROUTES } from '@/constants/routes';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, signOut, updateProfile, loading } = useAuthStore();
  const router = useRouter();

  // Modal State for Editing Profile
  const [modalVisible, setModalVisible] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState(user?.businessName || 'Abhiraj Water Plant');
  const [displayName, setDisplayName] = useState(user?.displayName || 'Abhishek');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '8485877633');
  const [whatsappNumber, setWhatsappNumber] = useState(user?.whatsappNumber || '8485877633');
  const [address, setAddress] = useState(user?.address || 'Industrial MIDC, Sector 4, Water Hub');
  const [gstin, setGstin] = useState('27AAACN1234F1Z5');
  const [dailyCapacity, setDailyCapacity] = useState('350 Jars (7,000 L)');
  const [saving, setSaving] = useState(false);

  const avatarOptions = [
    { id: '1', name: 'Water Drop Logo', icon: 'water', bg: '#0284C7', color: '#FFF' },
    { id: '2', name: 'Executive Plant Boss', icon: 'person', bg: '#2563EB', color: '#FFF' },
    { id: '3', name: 'Pure Springs Eco', icon: 'leaf', bg: '#059669', color: '#FFF' },
    { id: '4', name: 'RO Industrial Plant', icon: 'business', bg: '#0D9488', color: '#FFF' },
    { id: '5', name: 'Logistics Fleet', icon: 'bus', bg: '#D97706', color: '#FFF' },
  ];

  const openEditModal = () => {
    setBusinessName(user?.businessName || 'Abhiraj Water Plant');
    setDisplayName(user?.displayName || 'Abhishek');
    setPhoneNumber(user?.phoneNumber || '8485877633');
    setWhatsappNumber(user?.whatsappNumber || '8485877633');
    setAddress(user?.address || 'Industrial MIDC, Sector 4, Water Hub');
    setModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!businessName || !displayName) {
      Alert.alert('Validation Error', 'Business Name and Owner Name are required.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        businessName: businessName.trim(),
        displayName: displayName.trim(),
        phoneNumber: phoneNumber.trim(),
        whatsappNumber: whatsappNumber.trim(),
        address: address.trim(),
      });

      Alert.alert('Success', 'Plant profile and support contact numbers updated successfully.');
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

  const handleCropAndSavePhoto = () => {
    setPhotoModalVisible(false);
    Alert.alert('Profile Photo Set', 'Profile photo cropped and updated successfully!');
  };

  return (
    <ScrollView 
      className="flex-1 bg-slate-50 dark:bg-slate-900 px-3.5 py-3" 
      contentContainerStyle={{ paddingBottom: 80 }} 
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Profile Avatar & Plant Header Card */}
      <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 items-center shadow-2xs mb-3">
        {/* Avatar with Camera Crop Badge */}
        <View className="relative mb-2">
          <View className="w-18 h-18 rounded-full bg-sky-600 justify-center items-center shadow-sm overflow-hidden">
            {selectedAvatar ? (
              <Ionicons name="water" size={36} color="#FFF" />
            ) : (
              <Text className="text-2xl font-black text-white">
                {user?.displayName?.substring(0, 2).toUpperCase() || 'AP'}
              </Text>
            )}
          </View>
          <TouchableOpacity 
            onPress={() => setPhotoModalVisible(true)}
            className="absolute bottom-0 right-0 bg-white dark:bg-slate-700 w-7 h-7 rounded-full justify-center items-center border border-slate-200 dark:border-slate-600 shadow-sm active:opacity-75"
            activeOpacity={0.7}
          >
            <Ionicons name="camera" size={13} color="#0284C7" />
          </TouchableOpacity>
        </View>

        <Text className="text-base font-black text-slate-900 dark:text-slate-50 text-center">
          {user?.displayName || 'Abhishek'}
        </Text>

        <Text className="text-xs font-bold text-sky-600 dark:text-sky-400 mt-0.5 text-center">
          {user?.businessName || 'Abhiraj Water Plant'}
        </Text>

        <View className="flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200/60 dark:border-sky-800/60 mt-2">
          <Ionicons name="shield-checkmark" size={12} color="#0284c7" />
          <Text className="text-4xs font-black text-sky-700 dark:text-sky-300 uppercase tracking-wider">
            Verified Water Plant Owner
          </Text>
        </View>
      </View>

      {/* 2. Plant Information Section (Balanced Professional Typography) */}
      <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl p-3.5 shadow-2xs mb-3">
        <View className="flex-row justify-between items-center mb-2.5 pb-2 border-b border-slate-100 dark:border-slate-700/50">
          <Text className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Plant & Business Details
          </Text>

          <TouchableOpacity 
            onPress={openEditModal}
            className="flex-row items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/40 active:opacity-75"
          >
            <Ionicons name="create-outline" size={13} color="#0284C7" />
            <Text className="text-3xs font-black text-sky-600">Edit Info</Text>
          </TouchableOpacity>
        </View>

        {/* Business Name */}
        <View className="flex-row items-center gap-2.5 py-1.5">
          <View className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/50 justify-center items-center">
            <Ionicons name="business" size={14} color="#0284C7" />
          </View>
          <View className="flex-1">
            <Text className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Plant / Business Name
            </Text>
            <Text className="text-[13.5px] font-black text-slate-800 dark:text-slate-100 mt-0.5">
              {user?.businessName || 'Abhiraj Water Plant'}
            </Text>
          </View>
        </View>

        <View className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

        {/* Owner Name */}
        <View className="flex-row items-center gap-2.5 py-1.5">
          <View className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 justify-center items-center">
            <Ionicons name="person" size={14} color="#6366F1" />
          </View>
          <View className="flex-1">
            <Text className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Owner Name
            </Text>
            <Text className="text-[13.5px] font-black text-slate-800 dark:text-slate-100 mt-0.5">
              {user?.displayName || 'Abhishek'}
            </Text>
          </View>
        </View>

        <View className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

        {/* Plant Calling Helpline */}
        <View className="flex-row items-center gap-2.5 py-1.5">
          <View className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 justify-center items-center">
            <Ionicons name="call" size={14} color="#059669" />
          </View>
          <View className="flex-1">
            <Text className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Helpline Phone (For Clients & Drivers)
            </Text>
            <Text className="text-[13.5px] font-black text-emerald-600 mt-0.5">
              {user?.phoneNumber || '8485877633'}
            </Text>
          </View>
        </View>

        <View className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

        {/* WhatsApp Support */}
        <View className="flex-row items-center gap-2.5 py-1.5">
          <View className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 justify-center items-center">
            <Ionicons name="logo-whatsapp" size={14} color="#059669" />
          </View>
          <View className="flex-1">
            <Text className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              WhatsApp Support Number
            </Text>
            <Text className="text-[13.5px] font-black text-emerald-600 mt-0.5">
              {user?.whatsappNumber || '8485877633'}
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
              Plant Physical Address
            </Text>
            <Text className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
              {user?.address || 'Industrial MIDC, Sector 4, Water Hub'}
            </Text>
          </View>
        </View>
      </View>

      {/* 3. Operational Defaults & Licenses */}
      <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl p-3.5 shadow-2xs mb-4">
        <Text className="text-xs font-black text-slate-900 dark:text-slate-100 mb-2.5 pb-2 border-b border-slate-100 dark:border-slate-700/50 uppercase tracking-wider">
          Operational Capacity & Licenses
        </Text>

        <View className="flex-row justify-between items-center py-1.5">
          <Text className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Daily Plant Capacity</Text>
          <Text className="text-[13px] font-black text-sky-600">{dailyCapacity}</Text>
        </View>
        <View className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

        <View className="flex-row justify-between items-center py-1.5">
          <Text className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Standard 20L Jar Price</Text>
          <Text className="text-[13px] font-black text-emerald-600">₹35.00 / Jar</Text>
        </View>
        <View className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

        <View className="flex-row justify-between items-center py-1.5">
          <Text className="text-[11px] font-bold text-slate-500 dark:text-slate-400">GST / FSSAI License</Text>
          <Text className="text-[13px] font-black text-slate-800 dark:text-slate-200">{gstin}</Text>
        </View>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity 
        onPress={handleSignOut}
        className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 h-11 rounded-xl flex-row justify-center items-center gap-2 active:opacity-75"
        activeOpacity={0.8}
      >
        <Ionicons name="power" size={16} color="#E11D48" />
        <Text className="text-xs font-black text-rose-600">Sign Out Account</Text>
      </TouchableOpacity>

      {/* EDIT PROFILE MODAL */}
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
                Edit Plant & Helpline Numbers
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 justify-center items-center">
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Input
                label="Business / Plant Name *"
                value={businessName}
                onChangeText={setBusinessName}
                placeholder="e.g. Abhiraj Water Plant"
              />

              <Input
                label="Owner Full Name *"
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="e.g. Abhishek"
              />

              <Input
                label="Plant Calling Support Number *"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                placeholder="e.g. 8485877633"
              />

              <Input
                label="Plant WhatsApp Support Number *"
                value={whatsappNumber}
                onChangeText={setWhatsappNumber}
                keyboardType="phone-pad"
                placeholder="e.g. 8485877633"
              />

              <Input
                label="Plant Address"
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={2}
                placeholder="e.g. Sector 4, Industrial Area"
              />

              <View className="flex-row gap-3 mt-3">
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
                    title="Save Changes"
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

      {/* PHOTO UPLOAD & CROP AVATAR MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={photoModalVisible}
        onRequestClose={() => setPhotoModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-5 pb-8">
            <View className="flex-row justify-between items-center pb-3 mb-3 border-b border-slate-100 dark:border-slate-700">
              <Text className="text-base font-black text-slate-900 dark:text-slate-50">Set & Crop Plant Logo</Text>
              <TouchableOpacity onPress={() => setPhotoModalVisible(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 justify-center items-center">
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text className="text-xs text-slate-500 mb-3">
              Choose an official avatar preset or upload a custom logo:
            </Text>

            {/* Avatar Presets Grid */}
            <View className="flex-row flex-wrap gap-2.5 mb-4">
              {avatarOptions.map((av) => (
                <TouchableOpacity
                  key={av.id}
                  onPress={() => setSelectedAvatar(av.id)}
                  className={`p-3 rounded-2xl border items-center flex-1 min-w-[45%] ${
                    selectedAvatar === av.id ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                  }`}
                  activeOpacity={0.7}
                >
                  <View className="w-10 h-10 rounded-xl justify-center items-center mb-1" style={{ backgroundColor: av.bg }}>
                    <Ionicons name={av.icon as any} size={20} color={av.color} />
                  </View>
                  <Text className="text-3xs font-bold text-slate-800 dark:text-slate-200 text-center">{av.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="flex-row gap-2.5">
              <TouchableOpacity
                onPress={() => {
                  setSelectedAvatar('1');
                  handleCropAndSavePhoto();
                }}
                className="flex-1 bg-sky-600 py-3 rounded-xl items-center"
              >
                <Text className="text-xs font-black text-white">Crop & Apply Logo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}


