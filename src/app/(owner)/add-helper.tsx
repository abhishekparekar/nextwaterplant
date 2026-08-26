import React, { useState } from 'react';
import { 
  Text, 
  View, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { authService } from '@/services/authService';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';

export default function AddHelperScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessConfig, setAccessConfig] = useState('Full Route Access');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleAddHelper = async () => {
    setError('');
    if (!name || !phone || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      await authService.registerHelper(
        email.trim(),
        password,
        name.trim(),
        phone.trim(),
        address.trim() || undefined
      );

      Alert.alert(
        'Helper Registered',
        `Logistics Helper "${name}" has been created successfully. They can now log in using email: ${email}`,
        [
          {
            text: 'Return to Dashboard',
            onPress: () => {
              router.replace('/(owner)/dashboard');
            }
          }
        ]
      );
    } catch (err: any) {
      setError(err.message || 'Failed to add logistics helper.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-50 dark:bg-slate-900"
    >
      <ScrollView 
        keyboardShouldPersistTaps="handled"
        className="px-6 py-6"
      >
        <View className="max-w-md mx-auto w-full pb-10">
          <Text className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-5">
            Helper Credentials & Details
          </Text>

          <Input
            label="Helper Full Name *"
            placeholder="e.g. Sunil Dutt"
            value={name}
            onChangeText={setName}
            error={error && !name ? 'Name is required' : undefined}
          />

          <Input
            label="Mobile Number *"
            placeholder="e.g. +91 98765 43210"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            error={error && !phone ? 'Mobile is required' : undefined}
          />

          <Input
            label="Email Address *"
            placeholder="e.g. sunil@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={error && !email ? 'Email is required' : undefined}
          />

          <Input
            label="Default Password *"
            placeholder="choose helper login password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            error={error && !password ? 'Password is required' : undefined}
          />

          <Input
            label="Helper Address"
            placeholder="e.g. Flat 402, Ganga Heights, Mumbai"
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={2}
          />

          <Input
            label="Access Configuration / Permissions"
            placeholder="e.g. Full Route Access, Cash Collections"
            value={accessConfig}
            onChangeText={setAccessConfig}
          />

          {error ? (
            <Text className="text-sm text-rose-500 font-medium text-center mb-4">
              {error}
            </Text>
          ) : null}

          <Button
            title="Create Helper Profile"
            onPress={handleAddHelper}
            loading={submitting}
            className="mt-4"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
