import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function NetworkStatusBar() {
  const { isOffline } = useNetworkStatus();
  const [slideAnim] = useState(new Animated.Value(-100));
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (isOffline) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 10,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOffline, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          top: Platform.OS === 'ios' ? insets.top : 0,
        },
      ]}
    >
      <View style={styles.content}>
        <WifiOff size={16} color="#fff" />
        <Text style={styles.text}>No Internet Connection</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#EF4444',
    zIndex: 9999,
    elevation: 999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
});
