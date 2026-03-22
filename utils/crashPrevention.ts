/**
 * Ultra-minimal crash prevention - production safe
 */

// Simple safe wrapper
export const safeCall = <T>(fn: () => T, fallback: T): T => {
  try {
    return fn();
  } catch {
    return fallback;
  }
};

// Initialize with minimal setup
export const initializeCrashPrevention = (): void => {
  // Production-safe initialization
  if (typeof console !== 'undefined') {
    console.log('✅ App initialized');
  }
};

export default {
  safeCall,
  initializeCrashPrevention,
};