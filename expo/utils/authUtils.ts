import { ENV } from '@/config/env';
import { useUserStore } from '@/store/userStore';
import { router } from 'expo-router';
import { mockFetch } from './mockApi';
import { getDirectusApiUrl, getBackendBaseUrl } from './api';
import { Platform } from 'react-native';

interface RefreshTokenResponse {
  data: {
    access_token: string;
    refresh_token: string;
    expires: number;
  };
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const userState = useUserStore.getState();
      const refreshToken = userState.user?.refreshToken;

      if (!refreshToken) {
        console.error('❌ No refresh token available');
        handleTokenExpired();
        return null;
      }

      // Handle demo tokens locally to avoid hitting real backend
      if (refreshToken.startsWith('demo-refresh-')) {
        console.log('🔄 Refreshing demo token locally...');
        const userId = refreshToken.split('-')[2]; // Extract user ID from demo token format
        const newAccessToken = `demo-token-${userId}-${Date.now()}`;
        const newRefreshToken = `demo-refresh-${userId}-${Date.now()}`;
        
        userState.updateProfile({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });
        
        return newAccessToken;
      }

      console.log('🔄 Refreshing access token...');

      const response = await fetch(`${getDirectusApiUrl()}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
          mode: 'json',
        }),
      });

      if (!response.ok) {
        console.error('❌ Token refresh failed:', response.status);
        handleTokenExpired();
        return null;
      }

      const data: RefreshTokenResponse = await response.json();
      const newAccessToken = data.data.access_token;
      const newRefreshToken = data.data.refresh_token;

      console.log('✅ Token refreshed successfully');

      userState.updateProfile({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });

      return newAccessToken;
    } catch (error) {
      console.error('❌ Error refreshing token:', error);
      handleTokenExpired();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

function handleTokenExpired() {
  console.log('🔄 Token expired, logging out...');
  const userState = useUserStore.getState();
  userState.logout();
  
  if (typeof window !== 'undefined') {
    router.replace('/login');
  }
}

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const userState = useUserStore.getState();
  let accessToken = userState.user?.accessToken;

  if (!accessToken) {
    throw new Error('No access token available');
  }

  // Intercept demo tokens and use mock API
  if (accessToken.startsWith('demo-token-')) {
    return mockFetch(url, options);
  }

  let finalUrl = url;
  // Rewrite Directus URL to use proxy on Web to avoid CORS issues
  if (Platform.OS === 'web' && url.startsWith(ENV.EXPO_PUBLIC_RORK_API_BASE_URL)) {
    const cleanPath = url.replace(ENV.EXPO_PUBLIC_RORK_API_BASE_URL, '');
    finalUrl = `${getBackendBaseUrl()}/api/proxy${cleanPath}`;
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  let response = await fetch(finalUrl, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    console.log('🔄 Got 401, attempting token refresh...');
    
    const newAccessToken = await refreshAccessToken();
    
    if (newAccessToken) {
      console.log('✅ Retrying request with new token...');
      
      const newHeaders = {
        ...options.headers,
        'Authorization': `Bearer ${newAccessToken}`,
        'Content-Type': 'application/json',
      };

      response = await fetch(finalUrl, {
        ...options,
        headers: newHeaders,
      });
    } else {
      console.error('❌ Failed to refresh token');
    }
  }

  return response;
}

export function isTokenExpiredError(error: any): boolean {
  return (
    error?.errors?.[0]?.extensions?.code === 'TOKEN_EXPIRED' ||
    error?.errors?.[0]?.message?.includes('Token expired')
  );
}
