import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { ENV } from '@/config/env';

/**
 * Returns the base URL for the backend API.
 * This handles local development, device testing, and production.
 */
export const getBackendBaseUrl = () => {
  // 1. Use configured backend URL if available
  const backendUrl = ENV.EXPO_PUBLIC_BACKEND_URL;
  if (backendUrl && backendUrl.trim() !== '') {
    return backendUrl;
  }
  
  // 2. On Web, use current origin
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // 3. For mobile development (Expo Go / Simulators)
  if (Constants.expoConfig?.hostUri) {
    // Use the hostUri directly as it contains the correct IP and Port
    // e.g., 192.168.1.5:8081
    return `http://${Constants.expoConfig.hostUri}`; 
  }
  
  // 4. Fallback for simulators if hostUri is missing
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8081';
  }
  
  if (Platform.OS === 'ios') {
    return 'http://localhost:8081';
  }
  
  return 'https://rork.com'; // Final fallback
};

/**
 * Returns the URL for the Directus API.
 * On web, it returns the proxy URL to avoid CORS.
 * On mobile, it returns the direct URL.
 */
export const getDirectusApiUrl = () => {
  if (Platform.OS === 'web') {
    return `${getBackendBaseUrl()}/api/proxy`;
  }
  
  // On mobile, use direct URL unless it's not set
  return ENV.EXPO_PUBLIC_RORK_API_BASE_URL;
};
