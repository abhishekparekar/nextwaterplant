import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { 
  View, 
  Text, 
  Image, 
  Animated, 
  Easing, 
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

export default function IndexScreen() {
  const { isAuthenticated, role, loading } = useAuth();
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.92)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 500,
        delay: 250,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1300);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading && !showSplash) {
      if (isAuthenticated) {
        if (role === 'superadmin') {
          router.replace('/(admin)/dashboard');
        } else if (role === 'owner') {
          router.replace(ROUTES.OWNER.DASHBOARD);
        } else if (role === 'helper') {
          router.replace(ROUTES.HELPER.DASHBOARD);
        } else if (role === 'customer') {
          router.replace('/(customer)/dashboard');
        } else {
          router.replace(ROUTES.OWNER.DASHBOARD);
        }
      } else {
        router.replace(ROUTES.LOGIN);
      }
    }
  }, [isAuthenticated, role, loading, showSplash, router]);

  return (
    <View className="flex-1 bg-white dark:bg-slate-900 justify-between items-center px-6 py-14">
      <StatusBar barStyle="dark-content" />
      <View className="w-16 h-1 rounded-full bg-sky-100 dark:bg-sky-900/40 mt-4" />

      <View className="items-center w-full max-w-sm">
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [{ scale: logoScale }]
          }}
          className="items-center mb-4"
        >
          <Image 
            source={require('../../assets/images/logo1_transparent.png')} 
            style={{ width: 260, height: 180 }} 
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View
          style={{ opacity: contentOpacity }}
          className="items-center w-full"
        >
          <Text className="text-xl font-black text-slate-900 dark:text-slate-50 text-center tracking-tight mb-1">
            NextWater Plant Management
          </Text>
          <Text className="text-xs font-bold text-sky-600 dark:text-sky-400 text-center tracking-wide mb-6">
            Pure Water • Smart Business • Seamless Logistics
          </Text>
          <ActivityIndicator size="small" color="#0284C7" />
        </Animated.View>
      </View>

      <Animated.View 
        style={{ opacity: contentOpacity }}
        className="items-center w-full pt-4 border-t border-slate-100 dark:border-slate-800"
      >
        <Text className="text-4xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">
          Enterprise SaaS Water Platform
        </Text>
        <Text className="text-xs font-extrabold text-slate-700 dark:text-slate-300 tracking-wide">
          NextWater Plant Management
        </Text>
      </Animated.View>
    </View>
  );
}
