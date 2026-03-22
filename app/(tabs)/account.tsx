import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Stack, router } from 'expo-router';
import { 
  User, 
  Settings, 
  CreditCard, 
  Users, 
  Shield, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Database,
  BarChart
} from 'lucide-react-native';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';
import { useAdminStore } from '@/store/adminStore';
import { useLogout } from '@/hooks/useLogout';
import { useTranslation } from '@/utils/translations';

export default function AccountScreen() {
  const { isLoggedIn, user, name, email, plan, settings } = useUserStore();
  const { isAdmin, isSuperAdmin, canAccessOrganizations, canManageUsers } = useAdminStore();
  const { handleLogout } = useLogout();
  const { t } = useTranslation(settings.language);
  const [refreshing, setRefreshing] = React.useState(false);

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

  const hasFamilyAccess = plan === 'group_family';

  const getPlanDisplayName = (planType: string) => {
    switch (planType) {
      case 'premium':
        return t('plans.premium') + ' Member';
      case 'pro':
        return t('plans.pro') + ' Member';
      case 'group_family':
        return 'Group/Family Plan';
      case 'small_church':
        return 'Small Church Plan';
      case 'large_church':
        return 'Large Church Plan';
      case 'org_small':
        return 'Small Organization';
      case 'org_medium':
        return 'Medium Organization';
      case 'org_large':
        return 'Large Organization';
      default:
        return t('plans.free') + ' Member';
    }
  };

  const adminStatus = isAdmin();
  const superAdminStatus = isSuperAdmin();
  const canAccessOrgs = canAccessOrganizations();
  const canManageAllUsers = canManageUsers();

  const accountSections = [
    {
      title: t('nav.account'),
      items: [
        {
          id: 'profile',
          title: t('account.profile'),
          subtitle: 'Manage your personal information',
          icon: User,
          route: '/settings/profile',
        },
        {
          id: 'settings',
          title: t('nav.settings'),
          subtitle: 'App preferences and notifications',
          icon: Settings,
          route: '/settings',
        },
        {
          id: 'billing',
          title: t('account.membership'),
          subtitle: getPlanDisplayName(plan),
          icon: CreditCard,
          route: '/settings/billing',
        },
        ...(hasFamilyAccess ? [{
          id: 'family',
          title: 'Family Management',
          subtitle: 'Add and manage family members',
          icon: Users,
          route: '/family',
        }] : []),
      ],
    },
    {
      title: 'Administration',
      items: [
        // Show organization access for org admins OR system admins
        ...(user?.organizationRole === 'admin' || canAccessOrgs ? [{
          id: 'organization',
          title: 'Organization Dashboard',
          subtitle: 'Manage your organization',
          icon: Users,
          route: '/organization',
        }] : []),
        // Show super admin dashboard for super admins only
        ...(superAdminStatus ? [{
          id: 'admin',
          title: 'Super Admin Dashboard',
          subtitle: 'System administration',
          icon: Shield,
          route: '/admin',
        }] : []),
        // Show user management for super admins
        ...(canManageAllUsers ? [{
          id: 'users',
          title: 'User Management',
          subtitle: 'Manage all users',
          icon: Database,
          route: '/admin/users',
        }] : []),
        // Show analytics for admins
        ...(adminStatus ? [{
          id: 'analytics',
          title: 'Analytics',
          subtitle: 'View system analytics',
          icon: BarChart,
          route: superAdminStatus ? '/admin/analytics' : '/organization/analytics',
        }] : []),
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'security',
          title: t('account.security'),
          subtitle: 'Password and privacy settings',
          icon: Shield,
          route: '/settings/security',
        },
        {
          id: 'help',
          title: t('help.title'),
          subtitle: 'Get help and contact support',
          icon: HelpCircle,
          route: '/settings/help',
        },
      ],
    },
  ];

  if (!isLoggedIn && !adminStatus) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Profile',
            headerStyle: { backgroundColor: Colors.light.background },
            headerTintColor: Colors.light.text,
            headerTitleStyle: { color: Colors.light.text },
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
              <User size={40} color={Colors.light.icon} />
            </View>
            <Text style={styles.loginPromptTitle}>{t('account.signInPrompt')}</Text>
            <Text style={styles.loginPromptText}>
              Access your profile, settings, and personalized content
            </Text>
            <View style={styles.loginButtons}>
              <Button
                title={t('account.signIn')}
                onPress={() => router.push('/login')}
                style={styles.loginButton}
              />
              <Button
                title={t('account.createAccount')}
                variant="outline"
                onPress={() => router.push('/register')}
                style={styles.loginButton}
              />
              <Button
                title="Admin Access"
                variant="outline"
                onPress={() => router.push('/admin/auth')}
                style={[styles.loginButton, styles.adminButton]}
                textStyle={styles.adminButtonText}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Profile',
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: Colors.light.text,
          headerTitleStyle: { color: Colors.light.text },
        }}
      />

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* User Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{name || 'User'}</Text>
            <Text style={styles.profileEmail}>{email || 'user@example.com'}</Text>
            <View style={styles.profileBadges}>
              <Text style={styles.profilePlan}>
                {getPlanDisplayName(plan)}
              </Text>
              {adminStatus && (
                <View style={styles.adminBadge}>
                  <Shield size={12} color={Colors.light.white} />
                  <Text style={styles.adminBadgeText}>
                    {superAdminStatus ? 'Super Admin' : 'Admin'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Account Sections */}
        {accountSections.map((section) => (
          section.items.length > 0 && (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionCard}>
                {section.items.map((item, index) => (
                  <View key={item.id}>
                    <TouchableOpacity
                      style={styles.sectionItem}
                      onPress={() => navigateTo(item.route)}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      testID={`account-item-${item.id}`}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <View style={styles.sectionItemLeft}>
                        <View style={[
                          styles.sectionItemIcon,
                          section.title === 'Administration' && styles.adminSectionIcon
                        ]}>
                          <item.icon 
                            size={20} 
                            color={section.title === 'Administration' ? '#e74c3c' : Colors.light.tint} 
                          />
                        </View>
                        <View style={styles.sectionItemContent}>
                          <Text style={styles.sectionItemTitle}>{item.title}</Text>
                          <Text style={styles.sectionItemSubtitle}>{item.subtitle}</Text>
                        </View>
                      </View>
                      <ChevronRight size={20} color={Colors.light.icon} />
                    </TouchableOpacity>
                    {index < section.items.length - 1 && <View style={styles.separator} />}
                  </View>
                ))}
              </View>
            </View>
          )
        ))}

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} testID="account-logout-button" accessibilityRole="button" hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <LogOut size={20} color="#FF6B6B" />
            <Text style={styles.logoutButtonText}>{t('auth.signOut')}</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
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
    padding: theme.spacing.lg,
  },
  loginPrompt: {
    flex: 1,
  },
  loginPromptContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
    minHeight: 400,
  },
  loginIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  loginPromptTitle: {
    ...theme.typography.title,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  loginPromptText: {
    ...theme.typography.body,
    textAlign: 'center',
    color: Colors.light.icon,
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  loginButtons: {
    width: '100%',
    gap: theme.spacing.md,
  },
  loginButton: {
    width: '100%',
  },
  adminButton: {
    borderColor: '#e74c3c',
  },
  adminButtonText: {
    color: '#e74c3c',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  profileAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  profileAvatarText: {
    ...theme.typography.title,
    color: Colors.light.background,
    fontSize: 28,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...theme.typography.title,
    fontSize: 20,
    marginBottom: 2,
  },
  profileEmail: {
    ...theme.typography.body,
    color: Colors.light.icon,
    marginBottom: 4,
  },
  profileBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  profilePlan: {
    ...theme.typography.caption,
    color: Colors.light.tint,
    fontWeight: '600',
    marginRight: theme.spacing.sm,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 2,
  },
  adminBadgeText: {
    color: Colors.light.white,
    fontSize: 10,
    fontWeight: '600',
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.subtitle,
    fontSize: 16,
    marginBottom: theme.spacing.sm,
    color: Colors.light.text,
  },
  sectionCard: {
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  sectionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.tint + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  adminSectionIcon: {
    backgroundColor: '#e74c3c20',
  },
  sectionItemContent: {
    flex: 1,
  },
  sectionItemTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  sectionItemSubtitle: {
    ...theme.typography.caption,
    color: Colors.light.icon,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginLeft: theme.spacing.md + 40 + theme.spacing.md,
  },
  logoutSection: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xxl,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#FF6B6B' + '30',
  },
  logoutButtonText: {
    ...theme.typography.body,
    color: '#FF6B6B',
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  bottomSpacing: {
    height: 100,
  },
});