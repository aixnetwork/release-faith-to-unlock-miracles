import { useUserStore } from '@/store/userStore';
import { useAdminStore } from '@/store/adminStore';
import { router } from 'expo-router';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '@/config/env';

const getApiUrl = (path: string) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (Platform.OS === 'web') {
    return `/api/proxy${cleanPath}`;
  }
  return `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}${cleanPath}`;
};

export const useLogout = () => {
  const { logout, user } = useUserStore();
  const { clearAdmin, logout: adminLogout } = useAdminStore();

  const handleLogout = async () => {
    try {
      console.log('🔄 Starting logout process...');

      if (user?.refreshToken) {
        try {
          console.log('🔄 Logging out from Directus API...');
          const response = await fetch(getApiUrl('/auth/logout'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              refresh_token: user.refreshToken,
            }),
          });

          if (response.ok) {
            console.log('✅ Successfully logged out from Directus API');
          } else {
            console.warn('⚠️ Directus logout returned non-OK status:', response.status);
          }
        } catch (apiError) {
          console.warn('⚠️ Failed to logout from Directus API:', apiError);
        }
      }

      try {
        console.log('🗑️ Clearing persisted auth storage keys...');
        await AsyncStorage.multiRemove(['user-storage', 'admin-storage']);
        console.log('✅ Storage cleared successfully');
      } catch (persistErr) {
        console.warn('⚠️ Failed to clear persisted storage keys:', persistErr);
      }

      console.log('🧹 Clearing user state...');
      logout();

      console.log('🧹 Clearing admin state...');
      clearAdmin();
      adminLogout();

      console.log('⏳ Waiting for state to propagate...');
      await new Promise(resolve => setTimeout(resolve, 150));

      console.log('🔄 Navigating to login screen...');
      
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      } else {
        try {
          router.replace('/login');
        } catch (navError) {
          console.warn('⚠️ Replace failed, trying push:', navError);
          router.push('/login');
        }
      }

      console.log('✅ Logout completed successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);

      try {
        console.log('🗑️ Emergency storage clear...');
        await AsyncStorage.clear();
      } catch (clearError) {
        console.error('❌ Emergency clear failed:', clearError);
      }

      try {
        logout();
        clearAdmin();
        adminLogout();
      } catch (stateError) {
        console.error('❌ Emergency state clear failed:', stateError);
      }

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        console.log('🔄 Force reload on web...');
        window.location.href = '/login';
      } else {
        try {
          console.log('🔄 Attempting emergency navigation...');
          router.replace('/login');
        } catch (navError) {
          console.error('❌ All navigation methods failed:', navError);
        }
      }
    }
  };

  return { handleLogout };
};