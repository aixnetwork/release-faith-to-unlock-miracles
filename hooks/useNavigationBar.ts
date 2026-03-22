import { useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';
import * as SystemUI from 'expo-system-ui';

export function useNavigationBar() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      const setupNavigationBar = async () => {
        try {
          await SystemUI.setBackgroundColorAsync('transparent');
          StatusBar.setTranslucent(true);
          StatusBar.setBackgroundColor('transparent');
        } catch {
          console.log('Navigation bar setup not available');
        }
      };

      setupNavigationBar();
    }
  }, []);
}
