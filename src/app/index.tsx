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
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 450,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading && !showSplash) {
      if (isAuthenticated) {
        if (role === 'owner') {
          router.replace(ROUTES.OWNER.DASHBOARD);
        } else if (role === 'helper') {
          router.replace(ROUTES.HELPER.DASHBOARD);
        } else {
          router.replace(ROUTES.OWNER.DASHBOARD);
        }
      } else {
        router.replace(ROUTES.LOGIN);
      }
    }
  }, [isAuthenticated, role, loading, showSplash, router]);

  return (
    <View className="flex-1 bg-slate-900 justify-between items-center px-6 py-14">
      <StatusBar barStyle="light-content" />
      <View className="w-16 h-1 rounded-full bg-sky-500/30 mt-4" />

      <View className="items-center w-full max-w-sm">
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [{ scale: logoScale }]
          }}
          className="items-center mb-3"
        >
          <Image 
            source={require('../../assets/images/logo1_transparent.png')} 
            style={{ width: 280, height: 210 }} 
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View
          style={{ opacity: contentOpacity }}
          className="items-center w-full"
        >
          <Text className="text-lg font-black text-white text-center tracking-wide mb-2">
            NextWater Plant Management
          </Text>
          <Text className="text-xs font-semibold text-sky-300 text-center tracking-wide mb-6">
            Pure Water. Smart Business. Better Future.
          </Text>
          <ActivityIndicator size="small" color="#38bdf8" />
        </Animated.View>
      </View>

      <Animated.View 
        style={{ opacity: contentOpacity }}
        className="items-center w-full pt-4 border-t border-slate-800"
      >
        <Text className="text-3xs font-bold text-slate-500 uppercase tracking-widest mb-0.5">
          Enterprise Water Platform
        </Text>
        <Text className="text-xs font-bold text-slate-300 tracking-wide">
          NextWater Solutions
        </Text>
      </Animated.View>
    </View>
  );
}
