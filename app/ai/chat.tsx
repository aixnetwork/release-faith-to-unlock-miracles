import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import AIChat from '@/components/AIChat';
import { Colors } from '@/constants/Colors';

export default function AIChatScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'AI Assistant',
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: Colors.light.textPrimary,
          headerTitleStyle: { color: Colors.light.textPrimary },
        }}
      />
      <AIChat />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
});