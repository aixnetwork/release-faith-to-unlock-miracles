/**
 * Utility functions for handling image URIs safely
 */

import { Platform } from 'react-native';

// Validate if a URI is valid and safe to use
export const isValidImageUri = (uri: string | undefined | null): boolean => {
  if (!uri || typeof uri !== 'string' || uri.trim() === '') return false;
  
  // Handle data URIs (base64 images)
  if (uri.startsWith('data:image/')) {
    return true;
  }
  
  // Handle local file URIs for mobile
  if (Platform.OS !== 'web' && (uri.startsWith('file://') || uri.startsWith('content://'))) {
    return true;
  }
  
  // Check if it's a valid HTTP/HTTPS URL
  try {
    const url = new URL(uri);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
};

// Get a safe image source with fallback - NEVER returns empty string
export const getSafeImageSource = (uri: string | undefined | null, fallbackUri?: string): { uri: string } | null => {
  // First try the primary URI
  if (uri && typeof uri === 'string') {
    const trimmedUri = uri.trim();
    if (trimmedUri.length > 0 && isValidImageUri(trimmedUri)) {
      return { uri: trimmedUri };
    }
  }
  
  // Then try the fallback URI
  if (fallbackUri && typeof fallbackUri === 'string') {
    const trimmedFallback = fallbackUri.trim();
    if (trimmedFallback.length > 0 && isValidImageUri(trimmedFallback)) {
      return { uri: trimmedFallback };
    }
  }
  
  // Return null instead of default fallback - let component decide
  return null;
};

// Get a safe URI string (for WebView and other components that need just the URI) - NEVER returns empty string
export const getSafeUri = (uri: string | undefined | null, fallbackUri?: string): string => {
  // First try the primary URI
  if (uri && typeof uri === 'string') {
    const trimmedUri = uri.trim();
    if (trimmedUri.length > 0 && isValidImageUri(trimmedUri)) {
      return trimmedUri;
    }
  }
  
  // Then try the fallback URI
  if (fallbackUri && typeof fallbackUri === 'string') {
    const trimmedFallback = fallbackUri.trim();
    if (trimmedFallback.length > 0 && isValidImageUri(trimmedFallback)) {
      return trimmedFallback;
    }
  }
  
  // Default fallback image - NEVER empty
  const defaultFallback = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center';
  return defaultFallback;
};

// Validate and sanitize image source for React Native Image component - NEVER returns empty uri
export const getValidImageSource = (source: any): { uri: string } | number | null => {
  // Handle null/undefined
  if (!source) {
    return null;
  }
  
  // Handle string URI
  if (typeof source === 'string') {
    // Prevent empty strings
    if (source.trim().length === 0) {
      return null;
    }
    return getSafeImageSource(source);
  }
  
  // Handle object with uri property
  if (typeof source === 'object' && 'uri' in source) {
    // Prevent empty strings in uri property
    if (!source.uri || (typeof source.uri === 'string' && source.uri.trim().length === 0)) {
      return null;
    }
    return getSafeImageSource(source.uri);
  }
  
  // Handle require() statements (local images)
  if (typeof source === 'number') {
    return source;
  }
  
  // Fallback for any other case
  return null;
};

// Common fallback images for different contexts
export const FALLBACK_IMAGES = {
  user: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  song: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop&crop=center',
  quote: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center',
  promise: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center',
  testimonial: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=400&h=300&fit=crop&crop=center',
  service: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&crop=center',
  default: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center'
};

// Handle image load errors
export const handleImageError = (context: string, error: any) => {
  console.error(`Failed to load ${context} image:`, error);
};