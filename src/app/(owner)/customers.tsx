import React, { useEffect, useState, useMemo } from 'react';
import { 
  View, 
  FlatList, 
  Text, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  Alert,
  Linking
} from 'react-native';
import { useCustomerStore } from '@/store/customerStore';
import { CustomerCard } from '@/components/customer/CustomerCard';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Loader } from '@/components/common/Loader';
import { formatCurrency } from '@/utils/invoiceUtils';
import { Customer } from '@/types/customer';
import { Ionicons } from '@expo/vector-icons';

export default function CustomersScreen() {
  const { customers, loading, fetchCustomers, addCustomer, updateCustomer, deleteCustomer } = useCustomerStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Add Customer Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('water123');
  const [pricePerJar, setPricePerJar] = useState('35');
  const [address, setAddress] = useState('');
  const [emptyBottles, setEmptyBottles] = useState('0');
  const [depositPaid, setDepositPaid] = useState('0');
  const [submitting, setSubmitting] = useState(false);

  // Selected Customer Details Modal State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Edit Customer Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editPricePerJar, setEditPricePerJar] = useState('35');
  const [editBottles, setEditBottles] = useState('0');
  const [editDeposit, setEditDeposit] = useState('0');
  const [editBalance, setEditBalance] = useState('0');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Filtered customer list by query
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const q = searchQuery.toLowerCase().trim();
    return customers.filter(
      (c) => 
        c.name.toLowerCase().includes(q) || 
        c.phone.toLowerCase().includes(q) || 
        (c.email && c.email.toLowerCase().includes(q)) ||
        c.address.toLowerCase().includes(q)
    );
  }, [customers, searchQuery]);

  // Summary Metrics
  const summaryStats = useMemo(() => {
    let totalJars = 0;
    let totalDues = 0;
    customers.forEach((c) => {
      totalJars += c.emptyBottlesHeld || 0;
      if (c.balance > 0) totalDues += c.balance;
    });
    return {
      totalCount: customers.length,
      totalJars,
      totalDues
    };
  }, [customers]);

  const handleAddCustomer = async () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      Alert.alert('Validation Error', 'Please fill name, phone, and delivery address.');
      return;
    }
    setSubmitting(true);
    try {
      const cleanPhone = phone.trim();
      await addCustomer({
        name: name.trim(),
        phone: cleanPhone,
        email: email.trim() || `${cleanPhone}@customer.com`,
        password: password.trim() || 'water123',
        pricePerJar: parseFloat(pricePerJar) || 35,
        address: address.trim(),
        emptyBottlesHeld: parseInt(emptyBottles) || 0,
        depositPaid: parseFloat(depositPaid) || 0,
        balance: 0,
      });
      setModalVisible(false);
      setName('');
      setPhone('');
      setEmail('');
      setPassword('water123');
      setPricePerJar('35');
      setAddress('');
      setEmptyBottles('0');
      setDepositPaid('0');
      Alert.alert('Success', 'Customer registered successfully with login credentials!');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add customer');
    } finally {
      setSubmitting(false);
    }
  };

  const openCustomerReport = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const openEditModal = (customer: Customer) => {
    setEditName(customer.name);
    setEditPhone(customer.phone);
    setEditEmail(customer.email || `${customer.phone}@customer.com`);
    setEditAddress(customer.address);
    setEditPricePerJar((customer.pricePerJar || 35).toString());
    setEditBottles((customer.emptyBottlesHeld || 0).toString());
    setEditDeposit((customer.depositPaid || 0).toString());
    setEditBalance((customer.balance || 0).toString());
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedCustomer) return;
    if (!editName.trim() || !editPhone.trim() || !editAddress.trim()) {
      Alert.alert('Validation Error', 'Name, phone, and address are required.');
      return;
    }

    setUpdating(true);
    try {
      const updates = {
        name: editName.trim(),
        phone: editPhone.trim(),
        email: editEmail.trim(),
        address: editAddress.trim(),
        pricePerJar: parseFloat(editPricePerJar) || 35,
        emptyBottlesHeld: parseInt(editBottles) || 0,
        depositPaid: parseFloat(editDeposit) || 0,
        balance: parseFloat(editBalance) || 0,
      };

      await updateCustomer(selectedCustomer.id, updates);
      
      setSelectedCustomer((prev) => prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null);
      setEditModalVisible(false);
      Alert.alert('Updated', 'Customer details saved successfully.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update customer');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteCustomer = (customerId: string) => {
    Alert.alert(
      'Delete Customer',
      'Are you sure you want to remove this customer record?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCustomer(customerId);
              setSelectedCustomer(null);
              Alert.alert('Deleted', 'Customer record removed.');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete');
            }
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      {/* Top Search & Action Header */}
      <View className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800/80 px-4 pt-3 pb-3">
        {/* Search Bar & Prominent [ + Add Customer ] Button */}
        <View className="flex-row items-center gap-2 mb-2.5">
          <View className="flex-1 flex-row items-center bg-slate-100 dark:bg-slate-900/80 rounded-xl px-3 py-2">
            <Ionicons name="search-outline" size={17} color="#94a3b8" />
            <TextInput
              placeholder="Search clients..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 text-xs font-medium text-slate-800 dark:text-slate-100 ml-2 py-0"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Prominent Header [ + Add Client ] Button */}
          <TouchableOpacity 
            onPress={() => setModalVisible(true)}
            className="bg-sky-600 px-3.5 py-2 rounded-xl flex-row items-center gap-1 shadow-sm active:opacity-75"
            activeOpacity={0.8}
          >
            <Ionicons name="person-add" size={14} color="#FFF" />
            <Text className="text-xs font-black text-white">+ Add Client</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Metrics Bar */}
        <View className="flex-row gap-2">
          <View className="flex-1 bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-800/50 rounded-xl p-2 items-center">
            <Text className="text-sm font-black text-sky-900 dark:text-sky-100">
              {summaryStats.totalCount}
            </Text>
            <Text className="text-4xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              Total Clients
            </Text>
          </View>

          <View className="flex-1 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/50 rounded-xl p-2 items-center">
            <Text className="text-sm font-black text-indigo-900 dark:text-indigo-100">
              {summaryStats.totalJars}
            </Text>
            <Text className="text-4xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Jars in Field
            </Text>
          </View>

          <View className="flex-1 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-800/50 rounded-xl p-2 items-center">
            <Text className="text-sm font-black text-rose-700 dark:text-rose-300" numberOfLines={1}>
              {formatCurrency(summaryStats.totalDues)}
            </Text>
            <Text className="text-4xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Total Dues
            </Text>
          </View>
        </View>
      </View>

      {/* Customer FlatList */}
      {loading && customers.length === 0 ? (
        <Loader />
      ) : (
        <FlatList
          data={filteredCustomers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CustomerCard 
              customer={item} 
              onPress={() => openCustomerReport(item)} 
            />
          )}
          contentContainerStyle={{ padding: 14, paddingBottom: 90 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState 
              message={searchQuery ? `No clients matching "${searchQuery}"` : "No clients registered yet. Click [+ Add Client] above to register your first customer."} 
              iconName="people-outline" 
            />
          }
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity 
        className="absolute bottom-6 right-5 bg-sky-600 w-13 h-13 rounded-full justify-center items-center shadow-lg active:opacity-85 shadow-sky-600/40"
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* 1. ADD NEW CUSTOMER MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 justify-end bg-black/60"
        >
          <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-5 pb-8 max-h-[90%]">
            <View className="flex-row justify-between items-center pb-3 mb-3 border-b border-slate-100 dark:border-slate-700/60">
              <View className="flex-row items-center gap-2">
                <View className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 justify-center items-center">
                  <Ionicons name="person-add" size={16} color="#0284c7" />
                </View>
                <Text className="text-base font-black text-slate-900 dark:text-slate-50">
                  Register New Client
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 justify-center items-center"
              >
                <Ionicons name="close" size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Input
                label="Customer Full Name *"
                placeholder="e.g. Sharma Sweets / Ramesh Kumar"
                value={name}
                onChangeText={setName}
              />

              <Input
                label="Mobile Phone Number *"
                placeholder="e.g. 9876543210"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Input
                    label="Customer Email (For App Login)"
                    placeholder="client@email.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label="Password"
                    placeholder="water123"
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Input
                    label="Rate per 20L Jar (₹)"
                    placeholder="35"
                    value={pricePerJar}
                    onChangeText={setPricePerJar}
                    keyboardType="numeric"
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label="Initial Jars in Possession"
                    placeholder="0"
                    value={emptyBottles}
                    onChangeText={setEmptyBottles}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <Input
                label="Security Deposit Paid (₹)"
                placeholder="0"
                value={depositPaid}
                onChangeText={setDepositPaid}
                keyboardType="numeric"
              />

              <Input
                label="Delivery Address *"
                placeholder="e.g. Shop 12, Main Market, Sector 4"
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={2}
              />

              <Button
                title="Save & Register Client"
                onPress={handleAddCustomer}
                loading={submitting}
                style={{ marginTop: 6 }}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 2. FULL CUSTOMER REPORT & PROFILE MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!selectedCustomer}
        onRequestClose={() => setSelectedCustomer(null)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-5 pb-8 max-h-[90%]">
            <View className="flex-row justify-between items-center pb-3 mb-3 border-b border-slate-100 dark:border-slate-700/60">
              <View className="flex-row items-center gap-2">
                <View className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 justify-center items-center">
                  <Ionicons name="document-text" size={16} color="#0284c7" />
                </View>
                <Text className="text-base font-black text-slate-900 dark:text-slate-50">
                  Customer Profile & Report
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setSelectedCustomer(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 justify-center items-center"
              >
                <Ionicons name="close" size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            {selectedCustomer && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Card */}
                <View className="bg-sky-600 rounded-2xl p-4 mb-3.5">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1 pr-2">
                      <Text className="text-xl font-black text-white">
                        {selectedCustomer.name}
                      </Text>
                      <Text className="text-xs font-semibold text-sky-100 mt-0.5">
                        📞 {selectedCustomer.phone}
                      </Text>
                      <Text className="text-3xs text-sky-200 mt-1">
                        📍 {selectedCustomer.address}
                      </Text>
                    </View>

                    <View className="flex-row gap-1.5">
                      <TouchableOpacity 
                        onPress={() => Linking.openURL(`https://wa.me/91${selectedCustomer.phone.replace(/[^0-9]/g, '')}`).catch(() => {})}
                        className="w-9 h-9 rounded-full bg-emerald-500 justify-center items-center active:opacity-75"
                      >
                        <Ionicons name="logo-whatsapp" size={17} color="#FFF" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => Linking.openURL(`tel:${selectedCustomer.phone}`).catch(() => {})}
                        className="w-9 h-9 rounded-full bg-white/25 justify-center items-center active:opacity-75"
                      >
                        <Ionicons name="call" size={15} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Ledger & Jar Breakdown */}
                <View className="bg-slate-50 dark:bg-slate-900/70 rounded-2xl p-3.5 border border-slate-100 dark:border-slate-700/60 mb-3.5">
                  <Text className="text-xs font-black text-slate-800 dark:text-slate-100 mb-2.5 uppercase tracking-wider">
                    Ledger & Possession Balance
                  </Text>
                  
                  <View className="flex-row justify-between mb-2 pb-2 border-b border-slate-200/60 dark:border-slate-800">
                    <Text className="text-xs text-slate-600 dark:text-slate-400">Rate per 20L Jar</Text>
                    <Text className="text-xs font-black text-sky-600 dark:text-sky-400">
                      ₹{selectedCustomer.pricePerJar || 35} / Jar
                    </Text>
                  </View>

                  <View className="flex-row justify-between mb-2 pb-2 border-b border-slate-200/60 dark:border-slate-800">
                    <Text className="text-xs text-slate-600 dark:text-slate-400">Jars Currently in Possession</Text>
                    <Text className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                      {selectedCustomer.emptyBottlesHeld || 0} Jars
                    </Text>
                  </View>

                  <View className="flex-row justify-between mb-2 pb-2 border-b border-slate-200/60 dark:border-slate-800">
                    <Text className="text-xs text-slate-600 dark:text-slate-400">Security Deposit Held</Text>
                    <Text className="text-xs font-black text-teal-600 dark:text-teal-400">
                      {formatCurrency(selectedCustomer.depositPaid || 0)}
                    </Text>
                  </View>

                  <View className="flex-row justify-between">
                    <Text className="text-xs font-bold text-slate-700 dark:text-slate-200">Current Outstanding Dues</Text>
                    <Text className={`text-sm font-black ${selectedCustomer.balance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {formatCurrency(selectedCustomer.balance || 0)}
                    </Text>
                  </View>
                </View>

                {/* Login Credentials & Meta Dates */}
                <View className="bg-slate-50 dark:bg-slate-900/70 rounded-2xl p-3.5 border border-slate-100 dark:border-slate-700/60 mb-4">
                  <Text className="text-xs font-black text-slate-800 dark:text-slate-100 mb-2 uppercase tracking-wider">
                    Account & Record Dates
                  </Text>
                  <Text className="text-3xs text-slate-500 mb-1">
                    Login Email: <Text className="font-bold text-slate-700 dark:text-slate-200">{selectedCustomer.email || `${selectedCustomer.phone}@customer.com`}</Text>
                  </Text>
                  <Text className="text-3xs text-slate-500 mb-1">
                    Registered On: <Text className="font-semibold text-slate-700 dark:text-slate-300">{new Date(selectedCustomer.createdAt || Date.now()).toLocaleDateString('en-IN')}</Text>
                  </Text>
                  <Text className="text-3xs text-slate-500">
                    Last Edited Date: <Text className="font-semibold text-sky-600">{new Date(selectedCustomer.updatedAt || Date.now()).toLocaleString('en-IN')}</Text>
                  </Text>
                </View>

                {/* Action Buttons: Edit & Delete */}
                <View className="flex-row gap-2.5">
                  <TouchableOpacity 
                    onPress={() => openEditModal(selectedCustomer)}
                    className="flex-1 bg-sky-600 py-3 rounded-xl flex-row justify-center items-center gap-1.5 active:opacity-75"
                    activeOpacity={0.8}
                  >
                    <Ionicons name="create-outline" size={16} color="#FFF" />
                    <Text className="text-xs font-black text-white">Edit Details</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => handleDeleteCustomer(selectedCustomer.id)}
                    className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-4 py-3 rounded-xl flex-row justify-center items-center gap-1.5 active:opacity-75"
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash-outline" size={16} color="#E11D48" />
                    <Text className="text-xs font-bold text-rose-600">Delete</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* 3. EDIT CUSTOMER MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 justify-end bg-black/60"
        >
          <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-5 pb-8 max-h-[90%]">
            <View className="flex-row justify-between items-center pb-3 mb-3 border-b border-slate-100 dark:border-slate-700/60">
              <View className="flex-row items-center gap-2">
                <View className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 justify-center items-center">
                  <Ionicons name="create" size={16} color="#0284c7" />
                </View>
                <Text className="text-base font-black text-slate-900 dark:text-slate-50">
                  Edit Client Information
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setEditModalVisible(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 justify-center items-center"
              >
                <Ionicons name="close" size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Input
                label="Full Name *"
                value={editName}
                onChangeText={setEditName}
              />

              <Input
                label="Phone Number *"
                value={editPhone}
                onChangeText={setEditPhone}
                keyboardType="phone-pad"
              />

              <Input
                label="Email"
                value={editEmail}
                onChangeText={setEditEmail}
                autoCapitalize="none"
              />

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Input
                    label="Rate / Jar (₹)"
                    value={editPricePerJar}
                    onChangeText={setEditPricePerJar}
                    keyboardType="numeric"
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label="Jars Held"
                    value={editBottles}
                    onChangeText={setEditBottles}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Input
                    label="Deposit (₹)"
                    value={editDeposit}
                    onChangeText={setEditDeposit}
                    keyboardType="numeric"
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label="Dues Balance (₹)"
                    value={editBalance}
                    onChangeText={setEditBalance}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Input
                label="Delivery Address *"
                value={editAddress}
                onChangeText={setEditAddress}
                multiline
                numberOfLines={2}
              />

              <View className="flex-row gap-3 mt-2">
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
                    title="Save Changes"
                    onPress={handleSaveEdit}
                    loading={updating}
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

