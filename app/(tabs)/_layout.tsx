import { Tabs, router } from 'expo-router';
import React from 'react';
import { Platform, TouchableOpacity } from 'react-native';
import { Home, Heart, BookOpen, Ellipsis } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import TabBarIcon from '@/components/TabBarIcon';
import { useUserStore } from '@/store/userStore';
import { useAdminStore } from '@/store/adminStore';
import { useTranslation } from '@/utils/translations';
import { useNavigationBar } from '@/hooks/useNavigationBar';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  useNavigationBar();
  
  const userStore = useUserStore();
  const adminStore = useAdminStore();
  
  let settings = { language: 'en' };
  let isAdminUser = false;
  let isSuperAdminUser = false;
  
  try {
    if (userStore?.settings) {
      settings = userStore.settings;
    }
    
    isAdminUser = adminStore.isAdmin();
    isSuperAdminUser = adminStore.isSuperAdmin();
  } catch (error) {
    console.warn('Error accessing stores in TabLayout:', error);
  }
  
  const translation = useTranslation(settings.language);
  
  const t = (key: string) => {
    try {
      return translation.t(key as any);
    } catch {
      const fallbackTranslations: Record<string, string> = {
        'nav.home': 'Home',
        'nav.prayers': 'Prayers',
        'nav.devotional': 'Daily Devotional',
        'nav.more': 'More'
      };
      return fallbackTranslations[key] || key;
    }
  };

  const tintColor = Colors[colorScheme ?? 'light']?.tint || '#3B82F6';

  const CustomHomeButton = (props: any) => {
    const { 
      children, 
      onPress, 
      accessibilityRole, 
      accessibilityState, 
      testID, 
      style, 
      disabled, 
      activeOpacity
    } = props;
    return (
      <TouchableOpacity
        style={style}
        testID={testID}
        accessibilityRole={accessibilityRole}
        accessibilityState={accessibilityState}
        disabled={disabled}
        activeOpacity={activeOpacity}
        onPress={(e) => {
          if (isAdminUser) {
            if (isSuperAdminUser) {
              router.push('/admin');
            } else {
              router.push('/organization');
            }
          } else if (onPress) {
            onPress(e);
          }
        }}
      >
        {children}
      </TouchableOpacity>
    );
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tintColor,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: '#FFFFFF',
            borderTopWidth: 0,
            elevation: 0,
            shadowColor: '#1E293B',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.08,
            shadowRadius: 16,
            height: 84,
            paddingBottom: 30,
            paddingTop: 10,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          },
          default: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 0,
            elevation: 16,
            height: 68 + insets.bottom,
            paddingBottom: Math.max(insets.bottom, 10),
            paddingTop: 10,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            shadowColor: '#1E293B',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.08,
            shadowRadius: 16,
          },
        }),
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
          letterSpacing: 0.2,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('nav.home'),
          tabBarActiveTintColor: '#1E40AF',
          tabBarButton: CustomHomeButton,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon icon={Home} focused={focused} accentColor="#1E40AF" testID="tab-icon-home" />
          ),
        }}
      />
      <Tabs.Screen
        name="prayers"
        options={{
          title: t('nav.prayers'),
          tabBarActiveTintColor: '#DC2626',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon icon={Heart} focused={focused} accentColor="#DC2626" testID="tab-icon-prayers" />
          ),
        }}
      />
      <Tabs.Screen
        name="devotional"
        options={{
          title: t('nav.devotional'),
          tabBarActiveTintColor: '#7C3AED',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon icon={BookOpen} focused={focused} accentColor="#7C3AED" testID="tab-icon-devotional" />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: t('nav.more'),
          tabBarActiveTintColor: '#64748B',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon icon={Ellipsis} focused={focused} accentColor="#64748B" testID="tab-icon-more" />
          ),
        }}
      />
      <Tabs.Screen 
        name="habits" 
        options={{ 
          href: null,
        }} 
      />
      <Tabs.Screen 
        name="community" 
        options={{ 
          href: null,
        }} 
      />
      <Tabs.Screen 
        name="account" 
        options={{ 
          href: null,
        }} 
      />
      <Tabs.Screen 
        name="ai-assistant" 
        options={{ 
          href: null,
        }} 
      />
      <Tabs.Screen 
        name="songs" 
        options={{ 
          href: null,
        }} 
      />
      <Tabs.Screen 
        name="inspiration" 
        options={{ 
          href: null,
        }} 
      />
      <Tabs.Screen 
        name="testimonials" 
        options={{ 
          href: null,
        }} 
      />
      <Tabs.Screen 
        name="meetings" 
        options={{ 
          href: null,
        }} 
      />
      <Tabs.Screen 
        name="content" 
        options={{ 
          href: null,
        }} 
      />
      <Tabs.Screen 
        name="prayer-plans" 
        options={{ 
          href: null,
        }} 
      />
      <Tabs.Screen 
        name="services" 
        options={{ 
          href: null,
        }} 
      />
    </Tabs>
  );
}