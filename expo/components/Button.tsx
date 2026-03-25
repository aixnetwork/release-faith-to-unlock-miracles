import React, { useRef, useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, ViewStyle, TextStyle, View, Platform, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  leftIcon,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
  testID
}: ButtonProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      friction: 8,
      tension: 200,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 150,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePress = () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress();
    } catch (error) {
      console.error('Button press error:', error);
      onPress();
    }
  };

  const getContainerStyle = () => {
    const sizeStyle = {
      small: styles.smallContainer,
      medium: styles.mediumContainer,
      large: styles.largeContainer
    }[size];

    return [
      styles.container,
      sizeStyle,
      disabled && styles.disabledContainer,
      style
    ];
  };

  const getTextStyle = () => {
    const variantStyle = {
      primary: styles.primaryText,
      secondary: styles.secondaryText,
      outline: styles.outlineText,
      danger: styles.dangerText
    }[variant];

    const sizeStyle = {
      small: styles.smallText,
      medium: styles.mediumText,
      large: styles.largeText
    }[size];

    return [
      styles.text,
      variantStyle,
      sizeStyle,
      disabled && styles.disabledText,
      textStyle
    ];
  };

  const getLoaderColor = () => {
    if (variant === 'outline') return Colors.light.primary;
    return Colors.light.white;
  };

  // Use either leftIcon or icon prop (leftIcon takes precedence)
  const iconToDisplay = leftIcon || icon;

  if ((variant === 'primary' || variant === 'secondary') && !disabled) {
    const gradientColors = variant === 'primary' 
      ? [Colors.light.primary, Colors.light.primaryDark, '#002266'] as const
      : [Colors.light.secondary, Colors.light.secondaryDark, '#4C1D95'] as const;

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={getContainerStyle()}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          activeOpacity={0.9}
          accessibilityLabel={accessibilityLabel || title}
          accessibilityHint={accessibilityHint}
          accessibilityRole="button"
          accessibilityState={{ disabled: disabled || loading, busy: loading }}
          testID={testID}
        >
          <LinearGradient
            colors={gradientColors}
            style={styles.gradientContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {loading ? (
              <ActivityIndicator 
                color={getLoaderColor()} 
                size="small" 
              />
            ) : (
              <View style={styles.content}>
                {iconToDisplay && <View style={styles.iconContainer}>{iconToDisplay}</View>}
                <Text style={getTextStyle()}>{title}</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          getContainerStyle(),
          variant === 'outline' && styles.outlineContainer,
          variant === 'danger' && styles.dangerContainer,
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.9}
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled || loading, busy: loading }}
        testID={testID}
      >
        {loading ? (
          <ActivityIndicator 
            color={getLoaderColor()} 
            size="small" 
          />
        ) : (
          <View style={styles.content}>
            {iconToDisplay && <View style={styles.iconContainer}>{iconToDisplay}</View>}
            <Text style={getTextStyle()}>{title}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  gradientContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.light.primary,
    shadowOpacity: 0,
    elevation: 0,
  },
  dangerContainer: {
    backgroundColor: Colors.light.error,
  },
  smallContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    minHeight: 42,
  },
  mediumContainer: {
    paddingVertical: 14,
    paddingHorizontal: 26,
    minHeight: 50,
  },
  largeContainer: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    minHeight: 56,
  },
  disabledContainer: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '700' as const,
    textAlign: 'center' as const,
    letterSpacing: 0.3,
  },
  primaryText: {
    color: Colors.light.white,
  },
  secondaryText: {
    color: Colors.light.white,
  },
  outlineText: {
    color: Colors.light.primary,
    fontWeight: '700' as const,
  },
  dangerText: {
    color: Colors.light.white,
  },
  smallText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  mediumText: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  largeText: {
    fontSize: 17,
    fontWeight: '700' as const,
  },
  disabledText: {
    opacity: 0.8,
  },
  iconContainer: {
    marginRight: 10,
  },
});