import React, { useMemo, useEffect, useRef } from 'react';
import { StyleProp, StyleSheet, ViewStyle, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export type LucideIconComponent = React.ComponentType<{
  color?: string;
  size?: number;
  strokeWidth?: number;
}>;

interface TabBarIconProps {
  icon: LucideIconComponent;
  focused: boolean;
  size?: number;
  accentColor: string;
  testID?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

const ACCENT_GRADIENTS: Record<string, [string, string]> = {
  '#1E40AF': ['rgba(30,64,175,0.12)', 'rgba(30,64,175,0.22)'],
  '#DC2626': ['rgba(220,38,38,0.12)', 'rgba(220,38,38,0.22)'],
  '#7C3AED': ['rgba(124,58,237,0.12)', 'rgba(124,58,237,0.22)'],
  '#64748B': ['rgba(100,116,139,0.10)', 'rgba(100,116,139,0.18)'],
  '#3B82F6': ['rgba(59,130,246,0.12)', 'rgba(59,130,246,0.22)'],
  '#EF4444': ['rgba(239,68,68,0.12)', 'rgba(239,68,68,0.22)'],
  '#22C55E': ['rgba(34,197,94,0.12)', 'rgba(34,197,94,0.22)'],
  '#059669': ['rgba(5,150,105,0.12)', 'rgba(5,150,105,0.22)'],
  '#F59E0B': ['rgba(245,158,11,0.12)', 'rgba(245,158,11,0.22)'],
  '#A855F7': ['rgba(168,85,247,0.12)', 'rgba(168,85,247,0.22)'],
  '#8B5CF6': ['rgba(139,92,246,0.12)', 'rgba(139,92,246,0.22)'],
};

export default function TabBarIcon({
  icon: Icon,
  focused,
  size = 24,
  accentColor,
  testID,
  containerStyle,
}: TabBarIconProps) {
  const scaleAnim = useRef(new Animated.Value(focused ? 1.08 : 1)).current;
  const opacityAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1.08 : 1,
        friction: 6,
        tension: 140,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: focused ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused, scaleAnim, opacityAnim]);

  const [start, end] = useMemo(() => {
    return ACCENT_GRADIENTS[accentColor] ?? ['rgba(0,0,0,0.08)', 'rgba(0,0,0,0.18)'];
  }, [accentColor]);

  const iconColor = focused ? accentColor : 'rgba(100,116,139,0.85)';

  return (
    <Animated.View 
      style={[
        styles.container, 
        containerStyle,
        { transform: [{ scale: scaleAnim }] }
      ]} 
      testID={testID} 
      accessibilityRole="image"
    >
      <Animated.View style={[styles.focusBgWrapper, { opacity: opacityAnim }]}>
        <LinearGradient
          colors={[start, end]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.focusBg}
        />
      </Animated.View>
      <Icon color={iconColor} size={focused ? size + 2 : size} strokeWidth={focused ? 2.4 : 1.8} />
      <Animated.View 
        style={[
          styles.indicator, 
          { 
            backgroundColor: accentColor,
            opacity: opacityAnim,
            transform: [{ scaleX: Animated.multiply(opacityAnim, 1) }]
          }
        ]} 
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusBgWrapper: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    overflow: 'hidden',
  },
  focusBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    width: 18,
    height: 3,
    borderRadius: 2,
  },
});