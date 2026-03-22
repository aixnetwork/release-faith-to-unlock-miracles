import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function TabBarBackground() {
  return (
    <View style={StyleSheet.absoluteFill} testID="tabbar-bg">
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.96)', 'rgba(255, 255, 255, 0.9)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {Platform.OS !== 'web' ? (
        <BlurView
          tint="light"
          intensity={80}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
    </View>
  );
}