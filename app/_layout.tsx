import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import React, { useEffect, useState, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, trpcConfig } from '@/lib/trpc';
import { View, Platform, StyleSheet, StatusBar as RNStatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SuperwallProvider } from '@/components/SuperwallProvider';
import { NetworkStatusBar } from '@/components/NetworkStatusBar';
import FloatingCommunityButton from '@/components/FloatingCommunityButton';
import Toast from 'react-native-toast-message';
import { ErrorBoundary } from '@/app/error-boundary';
import { useUserStore } from '@/store/userStore';

// Safe splash screen handling
try {
  void SplashScreen.preventAutoHideAsync();
} catch {
  // Silent fallback
}

// Create QueryClient with minimal config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Create tRPC client
const trpcReactClient = trpc.createClient(trpcConfig);

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const colorScheme = useColorScheme();
  const hasAutoLoggedIn = useRef(false);

  useEffect(() => {
    if (Platform.OS === 'android') {
      SystemUI.setBackgroundColorAsync('transparent').catch(() => {});
      RNStatusBar.setTranslucent(true);
      RNStatusBar.setBackgroundColor('transparent');
    }
  }, []);

  useEffect(() => {
    if (!hasAutoLoggedIn.current) {
      hasAutoLoggedIn.current = true;
      const store = useUserStore.getState();
      if (!store.isLoggedIn) {
        console.log('Auto-login: Setting up demo individual account');
        const timestamp = Date.now();
        store.login({
          id: 'demo-user-individual-001',
          name: 'John Doe',
          email: 'john.doe@example.com',
          plan: 'individual',
          accessToken: `demo-token-${timestamp}`,
          refreshToken: `demo-refresh-${timestamp}`,
        });
        useUserStore.setState({
          prayerStreak: {
            currentStreak: 7,
            longestStreak: 21,
            lastPrayerDate: new Date().toDateString(),
            streakStartDate: new Date(Date.now() - 7 * 86400000).toDateString(),
          },
          totalPoints: 450,
          level: 3,
        });
      }
    }
  }, []);

  useEffect(() => {
    try {
      void SplashScreen.hideAsync();
    } catch {
      // Silent fallback
    }
    setIsReady(true);
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <trpc.Provider client={trpcReactClient} queryClient={queryClient}>
          <SuperwallProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <ErrorBoundary>
                <View style={styles.container}>
                  <NetworkStatusBar />
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="login" options={{ headerShown: false, presentation: 'modal' }} />
                    <Stack.Screen name="register" options={{ headerShown: false, presentation: 'modal' }} />
                  </Stack>
                  <FloatingCommunityButton />
                  <StatusBar style="auto" />
                </View>
              </ErrorBoundary>
            </ThemeProvider>
          </SuperwallProvider>
        </trpc.Provider>
      </QueryClientProvider>
      <Toast />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
