import { useColorScheme as useNativeColorScheme } from 'react-native';

// This hook ensures we always return a valid color scheme
export function useColorScheme(): 'light' | 'dark' {
  const colorScheme = useNativeColorScheme();
  return colorScheme || 'light'; // Default to light if null/undefined
}