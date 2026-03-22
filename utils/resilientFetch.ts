import { Platform } from 'react-native';
import { ENV } from '@/config/env';
import { mockFetch } from '@/utils/mockApi';

const API_TIMEOUT_MS = 8000;

export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (Platform.OS === 'web') {
    return `/api/proxy${cleanPath}`;
  }
  return `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}${cleanPath}`;
};

export const getDirectusUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}${cleanPath}`;
};

export async function resilientFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`⚠️ API returned ${response.status} for ${url}, falling back to mock`);
      return mockFetch(url, options);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      console.warn(`⚠️ API returned non-JSON (${contentType}) for ${url}, falling back to mock`);
      return mockFetch(url, options);
    }

    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error?.name === 'AbortError') {
      console.warn(`⏱️ API timeout for ${url}, falling back to mock`);
    } else {
      console.warn(`🔌 API unreachable for ${url}: ${error?.message}, falling back to mock`);
    }
    return mockFetch(url, options);
  }
}

export function directusHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
  };
}
