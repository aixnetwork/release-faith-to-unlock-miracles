import React, { useEffect, useState } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { TouchableOpacity, View, ActivityIndicator, StyleSheet } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { useAdminStore } from '@/store/adminStore';
import { useLogout } from '@/hooks/useLogout';


export default function AdminLayout() {
  const { isAdmin, isSuperAdmin } = useAdminStore();
  const { handleLogout } = useLogout();
  const segments = useSegments();
  const [isInitialized, setIsInitialized] = useState(false);

  // Prevent infinite loops by only checking auth once on mount
  useEffect(() => {
    const checkAuth = () => {
      const adminStatus = isAdmin();
      const superAdminStatus = isSuperAdmin();
      
      console.log('🔐 Admin layout auth check:', { adminStatus, superAdminStatus, segments });
      
      // Only redirect if we're not already on the auth page
      const isOnAuthPage = segments.some(segment => segment === 'auth');
      
      if (!adminStatus && !isOnAuthPage) {
        console.log('🔄 Redirecting to admin auth - no admin access');
        router.replace('/admin/auth');
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
        <ActivityIndicator size="large" color="#e74c3c" />
      </View>
    );
  }

  const signOutButton = () => (
    <TouchableOpacity
      onPress={handleLogout}
      style={{ marginRight: 16 }}
    >
      <LogOut size={20} color="#e74c3c" />
    </TouchableOpacity>
  );

  return (
    <Stack
      screenOptions={{
        headerRight: signOutButton,
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Admin Dashboard",
          headerTintColor: "#e74c3c"
        }} 
      />
      <Stack.Screen 
        name="auth" 
        options={{ 
          title: "Admin Authentication",
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="organizations" 
        options={{ 
          title: "Manage Organizations",
          headerTintColor: "#e74c3c"
        }} 
      />
      <Stack.Screen 
        name="promises" 
        options={{ 
          title: "Manage Promises",
          headerTintColor: "#e74c3c"
        }} 
      />
      <Stack.Screen 
        name="songs" 
        options={{ 
          title: "Manage Songs",
          headerTintColor: "#e74c3c"
        }} 
      />
      <Stack.Screen 
        name="quotes" 
        options={{ 
          title: "Manage Quotes",
          headerTintColor: "#e74c3c"
        }} 
      />
      <Stack.Screen 
        name="testimonials" 
        options={{ 
          title: "Manage Testimonials",
          headerTintColor: "#e74c3c"
        }} 
      />
      <Stack.Screen 
        name="users" 
        options={{ 
          title: "Manage Users",
          headerTintColor: "#e74c3c"
        }} 
      />
      <Stack.Screen 
        name="analytics" 
        options={{ 
          title: "Analytics Dashboard",
          headerTintColor: "#e74c3c"
        }} 
      />
      <Stack.Screen 
        name="database" 
        options={{ 
          title: "Database Management",
          headerTintColor: "#e74c3c"
        }} 
      />
      <Stack.Screen 
        name="api" 
        options={{ 
          title: "API Management",
          headerTintColor: "#e74c3c"
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          title: "System Settings",
          headerTintColor: "#e74c3c"
        }} 
      />
      <Stack.Screen 
        name="create-promise" 
        options={{ 
          title: "Create Promise",
          presentation: "modal",
          headerTintColor: "#e74c3c"
        }} 
      />
      <Stack.Screen 
        name="create-quote" 
        options={{ 
          title: "Create Quote",
          presentation: "modal",
          headerTintColor: "#e74c3c"
        }} 
      />
      <Stack.Screen 
        name="edit-promise" 
        options={{ 
          title: "Edit Promise",
          presentation: "modal",
          headerTintColor: "#e74c3c"
        }} 
      />
      <Stack.Screen 
        name="edit-song" 
        options={{ 
          title: "Edit Song",
          presentation: "modal",
          headerTintColor: "#e74c3c"
        }} 
      />
      <Stack.Screen 
        name="edit-quote" 
        options={{ 
          title: "Edit Quote",
          presentation: "modal",
          headerTintColor: "#e74c3c"
        }} 
      />
      <Stack.Screen 
        name="edit-testimonial" 
        options={{ 
          title: "Edit Testimonial",
          presentation: "modal",
          headerTintColor: "#e74c3c"
        }} 
      />
      <Stack.Screen 
        name="marketplace" 
        options={{ 
          title: "Marketplace Settings",
          headerTintColor: "#e74c3c"
        }} 
      />
      <Stack.Screen 
        name="service-approvals" 
        options={{ 
          title: "Service Approvals",
          headerTintColor: "#e74c3c"
        }} 
      />
      <Stack.Screen 
        name="coupons" 
        options={{ 
          title: "Coupon Management",
          headerTintColor: "#e74c3c"
        }} 
      />
      <Stack.Screen 
        name="plans" 
        options={{ 
          title: "Manage Plans",
          headerTintColor: "#e74c3c"
        }} 
      />
      <Stack.Screen 
        name="features" 
        options={{ 
          title: "Feature Management",
          headerTintColor: "#e74c3c"
        }} 
      />
      <Stack.Screen 
        name="create-testimonial" 
        options={{ 
          title: "Create Testimonial",
          presentation: "modal",
          headerTintColor: "#e74c3c"
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