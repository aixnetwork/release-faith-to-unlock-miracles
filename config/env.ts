const getBackendUrl = () => {
  try {
    const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
    if (backendUrl && backendUrl.trim() !== '') {
      console.log('✅ Using Backend URL from env:', backendUrl);
      return backendUrl;
    }
    
    const { Platform } = require('react-native');
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
      const hostname = window.location.hostname || '';
      const origin = window.location.origin || '';
      const isLocal = hostname === 'localhost' || 
                      hostname === '127.0.0.1' || 
                      hostname.startsWith('192.168.') ||
                      hostname.endsWith('.local');
      
      if (isLocal) {
        console.log('✅ Using local origin as backend URL:', origin);
        return origin;
      }
    }
  } catch (e) {
    console.warn('Error resolving backend URL:', e);
  }
  
  return '';
};

export const ENV = {
  EXPO_PUBLIC_BACKEND_URL: getBackendUrl(), // Let lib/trpc.ts handle the fallback logic
  EXPO_PUBLIC_TOOLKIT_URL: process.env.EXPO_PUBLIC_TOOLKIT_URL || 'https://toolkit.rork.com',
  EXPO_PUBLIC_RORK_API_BASE_URL: 'https://rfdb.aixnetwork.net',
  EXPO_PUBLIC_API_TOKEN: 'JYc_xVPSAmVpM_GL8uch0rwab8m2qhA-',
  EXPO_PUBLIC_DIRECTUS_DEFAULT_ROLE_ID: 'd85dee49-a3e2-4e74-9171-9f9eb52837a6',
  EXPO_PUBLIC_DIRECTUS_ADMIN_ROLE_ID: 'edc21368-c9bf-4461-bcb3-391f28215d76',
  EXPO_PUBLIC_DIRECTUS_ORGANIZER_ROLE_ID: '92a14da6-a457-4634-869f-76e152d5b3aa',
  EXPO_PUBLIC_DIRECTUS_USER_ROLE_ID: '4e71c3e3-4530-427f-b3bf-840df5631fba',
  EXPO_PUBLIC_OPENAI_KEY: 'sk-proj-RSsGhzIySV2pDUNfK2InT3BlbkFJuu4hVokns4fBuNwZ6l6O',
  EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_51N1234567890abcdefghijklmnopqrstuvwxyz',
  STRIPE_SECRET_KEY: 'sk_test_51N1234567890abcdefghijklmnopqrstuvwxyz',
  EXPO_PUBLIC_PAYPAL_CLIENT_ID: 'AZabc123-defg456-hijk789-lmno012-pqrs345'
} as const;
