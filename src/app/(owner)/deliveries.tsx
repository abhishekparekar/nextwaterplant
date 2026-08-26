import React, { useEffect } from 'react';
import { StyleSheet, View, FlatList, useColorScheme } from 'react-native';
import { useDeliveryStore } from '@/store/deliveryStore';
import { DeliveryCard } from '@/components/delivery/DeliveryCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Loader } from '@/components/common/Loader';
import { Colors } from '@/constants/colors';

export default function DeliveriesScreen() {
  const { deliveries, loading, fetchDeliveries } = useDeliveryStore();
  const isDark = useColorScheme() === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loading && deliveries.length === 0 ? (
        <Loader />
      ) : (
        <FlatList
          data={deliveries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <DeliveryCard 
              delivery={item}
            />
          )}
          ListEmptyComponent={
            <EmptyState message="No delivery runs currently scheduled." iconName="bicycle-outline" />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
});
