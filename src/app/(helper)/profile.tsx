import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  useColorScheme, 
  Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/common/Button';
import { Colors } from '@/constants/colors';
import { ROUTES } from '@/constants/routes';
import { Ionicons } from '@expo/vector-icons';

export default function HelperProfileScreen() {
  const { user, signOut, loading } = useAuthStore();
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace(ROUTES.LOGIN);
    } catch (err: any) {
      Alert.alert('Sign Out Error', err.message || 'Failed to sign out');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.profileHeader, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.displayName?.substring(0, 2).toUpperCase() || 'HL'}
          </Text>
        </View>
        <Text style={[styles.name, { color: colors.text }]}>
          {user?.displayName || 'Delivery Helper'}
        </Text>
        <Text style={[styles.role, { color: Colors.primary }]}>
          {user?.role?.toUpperCase() || 'HELPER / DRIVER'}
        </Text>
      </View>

      <View style={[styles.infoSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
          <View style={styles.infoCol}>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Email</Text>
            <Text style={[styles.infoVal, { color: colors.text }]}>{user?.email || 'N/A'}</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={20} color={colors.textSecondary} />
          <View style={styles.infoCol}>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Phone</Text>
            <Text style={[styles.infoVal, { color: colors.text }]}>{user?.phoneNumber || 'N/A'}</Text>
          </View>
        </View>
      </View>

      <Button
        title="Sign Out"
        variant="danger"
        onPress={handleSignOut}
        loading={loading}
        style={styles.signOutBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  role: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  infoSection: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoVal: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  signOutBtn: {
    marginTop: 'auto',
    marginBottom: 16,
  },
});
