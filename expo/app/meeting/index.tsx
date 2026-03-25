import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { router, Redirect } from 'expo-router';
import { useUserStore } from '@/store/userStore';

export default function MeetingIndexScreen() {
  const { isLoggedIn } = useUserStore();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/login');
    }
  }, [isLoggedIn]);

  // Redirect to the meetings tab
  return <Redirect href="/(tabs)/meetings" />;
}