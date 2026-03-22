import React from 'react';
import { Stack } from 'expo-router';
import { Colors } from '@/constants/Colors';

export default function MeetingLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.light.background,
        },
        headerTintColor: Colors.light.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: Colors.light.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: 'Meetings',
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          headerTitle: 'Create Meeting',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerTitle: 'Meeting Details',
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{
          headerTitle: 'Edit Meeting',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="join/[id]"
        options={{
          headerTitle: 'Join Meeting',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}