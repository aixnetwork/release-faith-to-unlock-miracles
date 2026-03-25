import { createTRPCReact } from "@trpc/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/types";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { ENV } from "@/config/env";
import superjson from "superjson";
import { useUserStore } from "@/store/userStore";

export type { AppRouter };

export const trpc = createTRPCReact<AppRouter>();

export const getBaseUrl = () => {
  const backendUrl = ENV.EXPO_PUBLIC_BACKEND_URL;
  if (backendUrl && backendUrl.trim() !== '') {
    return backendUrl.replace(/\/$/, '');
  }
  
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  if (Constants.expoConfig?.hostUri) {
    return `http://${Constants.expoConfig.hostUri}`;
  }
  
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8081';
  }
  
  if (Platform.OS === 'ios') {
    return 'http://localhost:8081';
  }
  
  return 'https://rork.app';
};

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  try {
    const { user } = useUserStore.getState();
    const accessToken = user?.accessToken;
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
      headers['x-access-token'] = accessToken;
    }
    
    if (user) {
      headers['x-user-id'] = user.id;
      headers['x-user-email'] = user.email;
      if (user.name) headers['x-user-name'] = user.name;
      if (user.plan) headers['x-user-plan'] = user.plan;
      if (user.organizationRole === 'admin') headers['x-user-is-admin'] = 'true';
    }
  } catch {
    // Ignore store errors
  }
  
  return headers;
};

const customFetch: typeof fetch = async (input, init) => {
  const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  const endpoint = urlStr.split('?')[0].split('/api/trpc/')[1] || urlStr.split('?')[0];
  
  try {
    const response = await fetch(input, init);
    
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      console.log(`📋 [tRPC] ${endpoint} - using offline mode`);
      throw new Error('API returned HTML - backend may not be running');
    }
    
    if (!response.ok) {
      const clone = response.clone();
      const text = await clone.text();
      if (text.startsWith('<!') || text.startsWith('<html')) {
        console.log(`📋 [tRPC] ${endpoint} - using offline mode`);
        throw new Error(`API Error: HTML response (${response.status})`);
      }
    }
    
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('HTML') || errorMessage.includes('backend may not be running')) {
      throw error;
    }
    console.warn(`⚠️ [tRPC] ${endpoint}:`, errorMessage);
    throw error;
  }
};

export const trpcConfig = {
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      headers: getHeaders,
      fetch: customFetch as any,
      transformer: superjson,
    }),
  ],
};

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      headers: getHeaders,
      fetch: customFetch as any,
      transformer: superjson,
    }),
  ],
});
