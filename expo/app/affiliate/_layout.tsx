import { Stack } from 'expo-router';
import React from 'react';

export default function AffiliateLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          title: "Affiliate Program",
        }}
      />
      <Stack.Screen
        name="analytics"
        options={{
          headerShown: true,
          title: "Analytics",
        }}
      />
      <Stack.Screen
        name="payouts"
        options={{
          headerShown: true,
          title: "Payouts",
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          headerShown: true,
          title: "Affiliate Settings",
        }}
      />
    </Stack>
  );
}