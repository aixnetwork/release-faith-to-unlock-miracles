import React, { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useUserStore } from '@/store/userStore';
import { useAdminStore } from '@/store/adminStore';
import { Colors } from '@/constants/Colors';

export default function OrganizationLayout() {
  const { isLoggedIn, user } = useUserStore();
  const { isAdmin } = useAdminStore();
  const [isInitialized, setIsInitialized] = useState(false);

  // Prevent infinite loops by only checking auth once on mount
  useEffect(() => {
    const checkAuth = () => {
      const adminStatus = isAdmin();
      const userLoggedIn = isLoggedIn;
      const userOrgRole = user?.organizationRole;
      
      console.log('🏢 Organization layout auth check:', { 
        adminStatus, 
        userLoggedIn, 
        userOrgRole
      });
      
      // Allow access if:
      // 1. User is authenticated as admin (includes superadmin and organizer roles from Directus)
      // 2. User is logged in with organization admin role
      const hasAccess = adminStatus || (userLoggedIn && userOrgRole === 'admin');
      
      if (!hasAccess) {
        console.log('🔄 Redirecting from organization - no access');
        router.replace('/login');
      } else {
        console.log('✅ Organization access granted');
      }
      
      setIsInitialized(true);
    };

    // Add a small delay to prevent immediate redirects that could cause loops
    const timer = setTimeout(checkAuth, 100);
    
    return () => clearTimeout(timer);
  }, []); // Empty dependency array to run only once

  // Show loading while auth check is in progress
  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.org1} />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Organization Dashboard",
          headerTintColor: Colors.light.org1
        }} 
      />
      <Stack.Screen 
        name="members" 
        options={{ 
          title: "Manage Members",
          headerTintColor: Colors.light.org1
        }} 
      />
      <Stack.Screen 
        name="groups" 
        options={{ 
          title: "Manage Groups",
          headerTintColor: Colors.light.org1
        }} 
      />
      <Stack.Screen 
        name="content" 
        options={{ 
          title: "Organization Content",
          headerTintColor: Colors.light.org1
        }} 
      />
      <Stack.Screen 
        name="analytics" 
        options={{ 
          title: "Organization Analytics",
          headerTintColor: Colors.light.org1
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          title: "Organization Settings",
          headerTintColor: Colors.light.org1
        }} 
      />
      <Stack.Screen 
        name="group/[id]" 
        options={{ 
          title: "Group Details",
          headerTintColor: Colors.light.org1
        }} 
      />
      <Stack.Screen 
        name="admin-dashboard" 
        options={{ 
          title: "Church Admin Dashboard",
          headerTintColor: Colors.light.org1
        }} 
      />
      <Stack.Screen 
        name="prayers" 
        options={{ 
          title: "Church Prayers",
          headerTintColor: Colors.light.org1
        }} 
      />
      <Stack.Screen 
        name="content/new" 
        options={{ 
          title: "Create Content",
          presentation: "modal",
          headerTintColor: Colors.light.org1
        }} 
      />
      <Stack.Screen 
        name="content/manage" 
        options={{ 
          title: "Manage Content",
          headerTintColor: Colors.light.org1
        }} 
      />
      <Stack.Screen 
        name="features" 
        options={{ 
          title: "Feature Controls",
          headerTintColor: Colors.light.org1
        }} 
      />
      <Stack.Screen 
        name="content/edit/[id]" 
        options={{ 
          title: "Edit Content",
          presentation: "modal",
          headerTintColor: Colors.light.org1
        }} 
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});