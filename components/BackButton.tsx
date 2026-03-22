import React from 'react';
import { TouchableOpacity, StyleSheet, Platform, Text } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';

interface BackButtonProps {
  color?: string;
  size?: number;
  onPress?: () => void;
  showText?: boolean;
  text?: string;
}

export function BackButton({ 
  color = Colors.light.primary, 
  size = 28, 
  onPress,
  showText = true,
  text = 'Back'
}: BackButtonProps) {
  const handlePress = () => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (onPress) {
      onPress();
    } else {
      let canNav = false;
      try { canNav = router.canGoBack(); } catch { canNav = false; }
      if (canNav) {
        router.back();
      } else {
        router.replace('/');
      }
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      activeOpacity={0.7}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      testID="back-button"
    >
      <ChevronLeft size={size} color={color} strokeWidth={2.5} />
      {showText && <Text style={[styles.text, { color }]}>{text}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 16,
    paddingVertical: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  text: {
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 2,
  },
});
