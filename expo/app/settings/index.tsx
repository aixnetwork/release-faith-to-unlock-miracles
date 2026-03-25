import React, { useRef, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Switch, RefreshControl, Animated, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { 
  Bell, 
  Shield, 
  HelpCircle, 
  Mail, 
  LogOut,
  ChevronRight,
  User,
  Lock,
  Globe,
  Brain,
  Link,
  Trophy,
  Target,
  Users
} from 'lucide-react-native';

import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';
import { useLogout } from '@/hooks/useLogout';
import { getLanguageName } from '@/mocks/languages';
import BottomNavigation from '@/components/BottomNavigation';
import * as Haptics from 'expo-haptics';

interface BaseSettingsItem {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  route: string;
}

interface ToggleSettingsItem extends BaseSettingsItem {
  hasToggle: true;
  toggleValue: boolean;
  onToggle: (value: boolean) => void;
}

interface NavigationSettingsItem extends BaseSettingsItem {
  hasToggle?: false;
}

type SettingsItem = ToggleSettingsItem | NavigationSettingsItem;

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

interface AnimatedSettingsItemProps {
  item: SettingsItem;
  index: number;
  totalItems: number;
  isToggleItem: boolean;
  onPress: () => void;
}

function AnimatedSettingsItem({ item, index, totalItems, isToggleItem, onPress }: AnimatedSettingsItemProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    if (!isToggleItem) {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        friction: 8,
        tension: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [scaleAnim, isToggleItem]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 150,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePress = () => {
    if (!isToggleItem) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress();
    }
  };

  const itemAsToggle = item as ToggleSettingsItem;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.sectionItem}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={isToggleItem ? 1 : 0.95}
      >
        <View style={styles.sectionItemLeft}>
          <View style={styles.sectionItemIcon}>
            <item.icon size={20} color={Colors.light.primary} />
          </View>
          <View style={styles.sectionItemContent}>
            <Text style={styles.sectionItemTitle}>{item.title}</Text>
            <Text style={styles.sectionItemSubtitle}>{item.subtitle}</Text>
          </View>
        </View>
        {isToggleItem ? (
          <Switch
            value={itemAsToggle.toggleValue}
            onValueChange={itemAsToggle.onToggle}
            trackColor={{ false: Colors.light.borderLight, true: Colors.light.primary + '40' }}
            thumbColor={itemAsToggle.toggleValue ? Colors.light.primary : '#f4f3f4'}
          />
        ) : (
          <View style={styles.arrowContainer}>
            <ChevronRight size={18} color={Colors.light.textLight} />
          </View>
        )}
      </TouchableOpacity>
      {index < totalItems - 1 && <View style={styles.separator} />}
    </Animated.View>
  );
}

export default function SettingsScreen() {
  const { isLoggedIn, settings, updateSettings, prayerStreak, achievements, integrations, plan } = useUserStore();
  const { handleLogout } = useLogout();
  const [refreshing, setRefreshing] = React.useState(false);

  // Safe fallbacks for potentially undefined values
  const safeAchievements = achievements || [];
  const safeIntegrations = integrations || [];
  const safePrayerStreak = prayerStreak || { currentStreak: 0, longestStreak: 0 };
  const safeSettings = settings || {
    language: 'en',
    notifications: true,
    mentalHealthReminders: false
  };

  const hasFamilyAccess = plan === 'group_family';

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const navigateTo = (route: string) => {
    try {
      router.push(route as any);
    } catch (error) {
      console.error('Error navigating to:', route, error);
    }
  };

  const toggleNotifications = (value: boolean) => {
    updateSettings({ notifications: value });
  };

  const toggleMentalHealthReminders = (value: boolean) => {
    updateSettings({ mentalHealthReminders: value });
  };

  const isToggleItem = (item: SettingsItem): item is ToggleSettingsItem => {
    return 'hasToggle' in item && item.hasToggle === true;
  };

  const connectedIntegrationsCount = safeIntegrations.filter(i => i.isConnected).length;

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Settings',
            headerStyle: { backgroundColor: Colors.light.background },
            headerTintColor: Colors.light.textPrimary,
            headerTitleStyle: { color: Colors.light.textPrimary },
          }}
        />
        
        <ScrollView 
          style={styles.loginPrompt}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.loginPromptContent}>
            <View style={styles.loginIcon}>
              <User size={40} color={Colors.light.textMedium} />
            </View>
            <Text style={styles.loginPromptTitle}>Sign in to access settings</Text>
            <Text style={styles.loginPromptText}>
              Login to customize your app preferences and manage your account
            </Text>
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => router.push('/login')}
            >
              <Text style={styles.loginButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <BottomNavigation />
      </View>
    );
  }

  const settingsSections: SettingsSection[] = [
    {
      title: 'Quick Actions',
      items: [
        ...(hasFamilyAccess ? [{
          id: 'family',
          title: 'Family Management',
          subtitle: 'Manage members & roles',
          icon: Users,
          route: '/family',
        }] : []),
        {
          id: 'achievements',
          title: 'Achievements',
          subtitle: `${safeAchievements.length} unlocked • ${safePrayerStreak.currentStreak} day streak`,
          icon: Trophy,
          route: '/achievements',
        },
        {
          id: 'prayer-plans',
          title: 'Prayer Plans',
          subtitle: 'Manage your prayer journey',
          icon: Target,
          route: '/prayer-plans',
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          id: 'notifications',
          title: 'Notifications',
          subtitle: 'Prayer reminders and updates',
          icon: Bell,
          route: '/settings/notifications',
          hasToggle: true,
          toggleValue: safeSettings.notifications,
          onToggle: toggleNotifications,
        },
        {
          id: 'mental-health',
          title: 'Wellness Reminders',
          subtitle: 'Daily check-ins',
          icon: Brain,
          route: '/settings/mental-health',
          hasToggle: true,
          toggleValue: safeSettings.mentalHealthReminders,
          onToggle: toggleMentalHealthReminders,
        },
        {
          id: 'language',
          title: 'Language',
          subtitle: getLanguageName(safeSettings.language || 'en'),
          icon: Globe,
          route: '/settings/language',
        },
      ],
    },
    {
      title: 'Integrations',
      items: [
        {
          id: 'external-apps',
          title: 'Connected Apps',
          subtitle: `${connectedIntegrationsCount} connected`,
          icon: Link,
          route: '/settings/integrations',
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          id: 'privacy',
          title: 'Privacy',
          subtitle: 'Control your data',
          icon: Shield,
          route: '/settings/privacy',
        },
        {
          id: 'security',
          title: 'Security',
          subtitle: 'Password settings',
          icon: Lock,
          route: '/settings/security',
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          title: 'Help',
          subtitle: 'Get support',
          icon: HelpCircle,
          route: '/settings/help',
        },
        {
          id: 'contact',
          title: 'Contact',
          subtitle: 'Send feedback',
          icon: Mail,
          route: '/settings/contact',
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: Colors.light.textPrimary,
          headerTitleStyle: { color: Colors.light.textPrimary },
        }}
      />

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Simplified Progress Card */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Your Journey</Text>
          <View style={styles.progressStats}>
            <View style={styles.progressStat}>
              <Text style={styles.progressNumber}>{safePrayerStreak.currentStreak}</Text>
              <Text style={styles.progressLabel}>Day Streak</Text>
            </View>
            <View style={styles.progressStat}>
              <Text style={styles.progressNumber}>{safeAchievements.length}</Text>
              <Text style={styles.progressLabel}>Achievements</Text>
            </View>
          </View>
        </View>

        {/* Simplified Settings Sections */}
        {settingsSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, index) => (
                <AnimatedSettingsItem
                  key={item.id}
                  item={item}
                  index={index}
                  totalItems={section.items.length}
                  isToggleItem={isToggleItem(item)}
                  onPress={() => navigateTo(item.route)}
                />
              ))}
            </View>
          </View>
        ))}

        {/* Simple Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#FF6B6B" />
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Bottom spacing for navigation */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loginPrompt: {
    flex: 1,
  },
  loginPromptContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: 400,
  },
  loginIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.light.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  loginPromptTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center' as const,
    marginBottom: 8,
    color: Colors.light.textPrimary,
    letterSpacing: -0.3,
  },
  loginPromptText: {
    fontSize: 15,
    textAlign: 'center' as const,
    color: Colors.light.textMedium,
    marginBottom: 24,
    lineHeight: 22,
    maxWidth: 280,
  },
  loginButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  loginButtonText: {
    color: Colors.light.white,
    fontWeight: '600',
    fontSize: 16,
  },
  progressCard: {
    backgroundColor: Colors.light.backgroundLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center' as const,
    color: Colors.light.textPrimary,
    letterSpacing: -0.3,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressStat: {
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.light.primary,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  progressLabel: {
    fontSize: 13,
    color: Colors.light.textMedium,
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    color: Colors.light.textLight,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  sectionCard: {
    backgroundColor: Colors.light.backgroundLight,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  sectionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionItemIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.light.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  sectionItemContent: {
    flex: 1,
  },
  sectionItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
    color: Colors.light.textPrimary,
    letterSpacing: -0.2,
  },
  sectionItemSubtitle: {
    fontSize: 13,
    color: Colors.light.textMedium,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginLeft: 72,
  },
  arrowContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.backgroundLight,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.error + '30',
    marginTop: 20,
    minHeight: 56,
  },
  logoutButtonText: {
    fontSize: 16,
    color: Colors.light.error,
    fontWeight: '600',
    marginLeft: 10,
  },
  bottomSpacing: {
    height: 100,
  },
});