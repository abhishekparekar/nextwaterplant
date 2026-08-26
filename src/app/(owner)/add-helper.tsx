import React, { useEffect, useState } from 'react';
import { 
  Text, 
  View, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Linking,
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { useStaffStore } from '@/store/staffStore';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { StaffMember, StaffStatus } from '@/types/staff';
import { Ionicons } from '@expo/vector-icons';

export default function StaffManagementScreen() {
  const { staffList, loading, fetchStaff, addStaff, updateStaff, toggleStaffStatus, deleteStaff } = useStaffStore();
  const { user } = useAuthStore();
  const router = useRouter();

  // Create Modal
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('water123');
  const [role, setRole] = useState<'driver' | 'helper'>('driver');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [assignedRoute, setAssignedRoute] = useState('');
  const [salaryOrCommission, setSalaryOrCommission] = useState('₹14,000 / mo');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit Modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editVehicle, setEditVehicle] = useState('');
  const [editRoute, setEditRoute] = useState('');
  const [editSalary, setEditSalary] = useState('');
  const [editStatus, setEditStatus] = useState<StaffStatus>('active');
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const activeCount = staffList.filter(s => s.status === 'active').length;
  const stoppedCount = staffList.filter(s => s.status === 'inactive').length;
  const totalTodayDeliveries = staffList.reduce((acc, s) => acc + (s.todayDeliveries || 0), 0);

  const handleOpenCreate = () => {
    setName('');
    setPhone('');
    setEmail('');
    setPassword('water123');
    setVehicleNumber('');
    setAssignedRoute('');
    setSalaryOrCommission('₹14,000 / mo');
    setAddress('');
    setCreateModalVisible(true);
  };

  const handleCreateStaff = async () => {
    if (!name.trim() || !phone.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Name, Mobile, Login Email, and Password are required.');
      return;
    }

    setSubmitting(true);
    try {
      await addStaff({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        role,
        status: 'active',
        vehicleNumber: vehicleNumber.trim() || 'Plant Tempo',
        assignedRoute: assignedRoute.trim() || 'All Plant Routes',
        salaryOrCommission: salaryOrCommission.trim(),
        address: address.trim(),
        ownerId: user?.uid || 'owner_1',
        businessName: user?.businessName || 'Abhiraj Water Plant',
        totalDeliveriesCompleted: 0,
        todayDeliveries: 0,
      });

      Alert.alert('Staff Created', `Logistics helper ${name} added successfully! They can now log in using ${email} and their password.`);
      setCreateModalVisible(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add staff member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setEditName(staff.name);
    setEditPhone(staff.phone);
    setEditEmail(staff.email);
    setEditPassword(staff.password || 'water123');
    setEditVehicle(staff.vehicleNumber || '');
    setEditRoute(staff.assignedRoute || '');
    setEditSalary(staff.salaryOrCommission || '');
    setEditStatus(staff.status);
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedStaff) return;
    if (!editName.trim() || !editPhone.trim() || !editEmail.trim()) {
      Alert.alert('Validation Error', 'Name, Mobile, and Email are required.');
      return;
    }

    setSavingEdit(true);
    try {
      await updateStaff(selectedStaff.id, {
        name: editName.trim(),
        phone: editPhone.trim(),
        email: editEmail.trim().toLowerCase(),
        password: editPassword.trim(),
        vehicleNumber: editVehicle.trim(),
        assignedRoute: editRoute.trim(),
        salaryOrCommission: editSalary.trim(),
        status: editStatus,
      });

      Alert.alert('Updated', 'Staff credentials and details updated successfully.');
      setEditModalVisible(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update staff.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleStatus = (staff: StaffMember) => {
    const nextStatus = staff.status === 'active' ? 'inactive' : 'active';
    toggleStaffStatus(staff.id, nextStatus);
    Alert.alert('Status Updated', `${staff.name} is now ${nextStatus === 'active' ? 'ACTIVE (On Duty)' : 'STOPPED (Inactive)'}.`);
  };

  const handleDeleteStaff = (staff: StaffMember) => {
    Alert.alert(
      'Remove Staff Member',
      `Are you sure you want to remove ${staff.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => deleteStaff(staff.id)
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      {/* 1. TOP STAFF METRICS BAR */}
      <View className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 px-4 pt-3 pb-3">
        <View className="flex-row gap-2 mb-2.5">
          <View className="flex-1 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 rounded-xl p-2.5">
            <Text className="text-4xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest">Total Staff</Text>
            <Text className="text-lg font-black text-sky-900 dark:text-sky-100 mt-0.5">{staffList.length}</Text>
            <Text className="text-4xs text-sky-600 font-semibold">{activeCount} On Duty</Text>
          </View>

          <View className="flex-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-2.5">
            <Text className="text-4xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Active On Route</Text>
            <Text className="text-lg font-black text-emerald-900 dark:text-emerald-100 mt-0.5">{activeCount}</Text>
            <Text className="text-4xs text-emerald-600 font-semibold">Ready for runs</Text>
          </View>

          <View className="flex-1 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl p-2.5">
            <Text className="text-4xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">Stopped</Text>
            <Text className="text-lg font-black text-rose-900 dark:text-rose-100 mt-0.5">{stoppedCount}</Text>
            <Text className="text-4xs text-rose-600 font-semibold">Access Paused</Text>
          </View>
        </View>

        {/* Add Staff Header Action */}
        <TouchableOpacity
          onPress={handleOpenCreate}
          className="bg-sky-600 py-2.5 rounded-xl flex-row justify-center items-center gap-1.5 shadow-sm active:opacity-75"
          activeOpacity={0.8}
        >
          <Ionicons name="person-add" size={15} color="#FFF" />
          <Text className="text-xs font-black text-white">+ Add New Delivery Staff / Helper</Text>
        </TouchableOpacity>
      </View>

      {/* 2. STAFF LISTING */}
      <ScrollView 
        className="flex-1 px-3.5 py-3" 
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-2.5">
          Plant Delivery Staff ({staffList.length})
        </Text>

        <View className="gap-3">
          {staffList.map((staff) => {
            const isActive = staff.status === 'active';

            return (
              <View 
                key={staff.id}
                className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/70 rounded-2xl p-3.5 shadow-2xs"
              >
                {/* Header Row */}
                <View className="flex-row justify-between items-start mb-2.5">
                  <View className="flex-row items-center flex-1 pr-2">
                    <View className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200/60 dark:border-teal-800/60 justify-center items-center mr-2.5">
                      <Ionicons name={staff.role === 'driver' ? "bus" : "person"} size={20} color="#0D9488" />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-1.5">
                        <Text className="text-sm font-black text-slate-900 dark:text-slate-50">
                          {staff.name}
                        </Text>
                        <View className="px-1.5 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950/80">
                          <Text className="text-4xs font-bold text-teal-800 dark:text-teal-300 uppercase">
                            {staff.role}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-3xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                        📞 {staff.phone} • ✉️ {staff.email}
                      </Text>
                    </View>
                  </View>

                  {/* Active / Stop Toggle Switch */}
                  <TouchableOpacity
                    onPress={() => handleToggleStatus(staff)}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    className={`px-3 py-1.5 rounded-full flex-row items-center gap-1.5 border shadow-2xs ${
                      isActive 
                        ? 'bg-emerald-600 border-emerald-600' 
                        : 'bg-rose-600 border-rose-600'
                    }`}
                    activeOpacity={0.8}
                  >
                    <Ionicons 
                      name={isActive ? "checkmark-circle" : "pause-circle"} 
                      size={14} 
                      color="#FFFFFF" 
                    />
                    <Text className="text-3xs font-black uppercase text-white tracking-wide">
                      {isActive ? 'Active (ON)' : 'Stopped (OFF)'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Assignment & Salary Details Box */}
                <View className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl mb-2.5 border border-slate-100 dark:border-slate-800 gap-1.5">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-4xs font-bold text-slate-400 uppercase">Vehicle</Text>
                    <Text className="text-3xs font-black text-slate-800 dark:text-slate-200">{staff.vehicleNumber || 'Tempo 1'}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-4xs font-bold text-slate-400 uppercase">Assigned Route</Text>
                    <Text className="text-3xs font-bold text-sky-600 dark:text-sky-400">{staff.assignedRoute || 'Main Area'}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-4xs font-bold text-slate-400 uppercase">Salary / Rate</Text>
                    <Text className="text-3xs font-black text-emerald-600">{staff.salaryOrCommission || '₹14,000 / mo'}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-4xs font-bold text-slate-400 uppercase">Login Password</Text>
                    <Text className="text-3xs font-mono font-bold text-slate-600 dark:text-slate-300">
                      {staff.password || 'water123'}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-700/50">
                  <TouchableOpacity
                    onPress={() => handleOpenEdit(staff)}
                    className="flex-1 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 py-1.5 rounded-lg flex-row justify-center items-center gap-1 active:opacity-75"
                  >
                    <Ionicons name="create-outline" size={13} color="#0284c7" />
                    <Text className="text-3xs font-black text-sky-700 dark:text-sky-300">Edit Profile & Password</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => Linking.openURL(`tel:${staff.phone}`).catch(() => {})}
                    className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 justify-center items-center"
                  >
                    <Ionicons name="call" size={13} color="#059669" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => Linking.openURL(`https://wa.me/91${staff.phone.replace(/[^0-9]/g, '')}`).catch(() => {})}
                    className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 justify-center items-center"
                  >
                    <Ionicons name="logo-whatsapp" size={13} color="#059669" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDeleteStaff(staff)}
                    className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 justify-center items-center"
                  >
                    <Ionicons name="trash-outline" size={13} color="#E11D48" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* CREATE STAFF MODAL */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 justify-end bg-black/60">
          <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-5 pb-8 max-h-[90%]">
            <View className="flex-row justify-between items-center pb-3 mb-3 border-b border-slate-100 dark:border-slate-700">
              <Text className="text-base font-black text-slate-900 dark:text-slate-50">Register Delivery Staff Member</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 justify-center items-center">
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Input
                label="Staff / Driver Full Name *"
                placeholder="e.g. Ramesh Driver"
                value={name}
                onChangeText={setName}
              />

              <Input
                label="Mobile Phone Number *"
                placeholder="e.g. 9822001122"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              <Input
                label="Staff Login Email Address *"
                placeholder="e.g. ramesh@driver.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Input
                label="Staff Login Password *"
                placeholder="set login password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              <Input
                label="Assigned Vehicle (Tempo / Van)"
                placeholder="e.g. MH-12-AB-4050"
                value={vehicleNumber}
                onChangeText={setVehicleNumber}
              />

              <Input
                label="Assigned Delivery Route / Area"
                placeholder="e.g. Route 1: Sector 4 & MIDC"
                value={assignedRoute}
                onChangeText={setAssignedRoute}
              />

              <Input
                label="Salary / Commission"
                placeholder="e.g. ₹14,000 / mo"
                value={salaryOrCommission}
                onChangeText={setSalaryOrCommission}
              />

              <Input
                label="Staff Address"
                placeholder="e.g. Sector 4, Water Hub"
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
                    onPress={() => setCreateModalVisible(false)}
                    style={{ height: 42 }}
                  />
                </View>
                <View className="flex-1">
                  <Button
                    title="Add Staff"
                    onPress={handleCreateStaff}
                    loading={submitting}
                    style={{ height: 42 }}
                  />
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* EDIT STAFF MODAL */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 justify-end bg-black/60">
          <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-5 pb-8 max-h-[90%]">
            <View className="flex-row justify-between items-center pb-3 mb-3 border-b border-slate-100 dark:border-slate-700">
              <Text className="text-base font-black text-slate-900 dark:text-slate-50">Edit Staff Profile & Credentials</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 justify-center items-center">
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Input
                label="Full Name *"
                value={editName}
                onChangeText={setEditName}
              />

              <Input
                label="Mobile Phone *"
                value={editPhone}
                onChangeText={setEditPhone}
                keyboardType="phone-pad"
              />

              <Input
                label="Staff Login Email *"
                value={editEmail}
                onChangeText={setEditEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Input
                label="Staff Login Password *"
                value={editPassword}
                onChangeText={setEditPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              <Input
                label="Assigned Vehicle"
                value={editVehicle}
                onChangeText={setEditVehicle}
              />

              <Input
                label="Assigned Delivery Route"
                value={editRoute}
                onChangeText={setEditRoute}
              />

              <Input
                label="Salary / Commission"
                value={editSalary}
                onChangeText={setEditSalary}
              />

              {/* Status Switch in Edit */}
              <Text className="text-[11px] font-bold text-slate-400 uppercase mb-1">Staff Working Status</Text>
              <View className="flex-row gap-2 mb-4">
                <TouchableOpacity
                  onPress={() => setEditStatus('active')}
                  className={`flex-1 py-2.5 rounded-xl items-center border ${
                    editStatus === 'active' ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Text className={`text-xs font-black ${editStatus === 'active' ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400'}`}>
                    🟢 Active (On Duty)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setEditStatus('inactive')}
                  className={`flex-1 py-2.5 rounded-xl items-center border ${
                    editStatus === 'inactive' ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Text className={`text-xs font-black ${editStatus === 'inactive' ? 'text-rose-700 dark:text-rose-300' : 'text-slate-600 dark:text-slate-400'}`}>
                    🔴 Stop / Inactive
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row gap-2">
                <View className="flex-1">
                  <Button
                    title="Cancel"
                    variant="outline"
                    onPress={() => setEditModalVisible(false)}
                    style={{ height: 42 }}
                  />
                </View>
                <View className="flex-1">
                  <Button
                    title="Save Staff Details"
                    onPress={handleSaveEdit}
                    loading={savingEdit}
                    style={{ height: 42 }}
                  />
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
