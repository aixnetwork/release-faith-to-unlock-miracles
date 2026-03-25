import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Animated, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Users, UserPlus, MessageCircle, Book, Settings, BarChart2, ChevronRight, LogOut, Shield } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';
import { useLogout } from '@/hooks/useLogout';
import BottomNavigation from '@/components/BottomNavigation';
import { useAdminStore } from '@/store/adminStore';
import * as Haptics from 'expo-haptics';
import { ENV } from '@/config/env';
import { fetchWithAuth } from '@/utils/authUtils';

const getApiUrl = (path: string) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (Platform.OS === 'web') {
    return `/api/proxy${cleanPath}`;
  }
  return `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}${cleanPath}`;
};

interface DirectusOrganization {
  id: number;
  name: string;
  city?: string;
  status: string;
  organizer_id: string;
  plan: number;
  maxMembers: number;
  date_created: string;
}

interface DirectusPlan {
  id: number;
  name: string;
  maxMembers: number;
  description: string;
  features: any;
  period: string;
  price: number;
}

interface AnimatedQuickActionProps {
  icon: React.ComponentType<{ size: number; color: string }>;
  color: string;
  label: string;
  onPress: () => void;
}

function AnimatedQuickAction({ icon: Icon, color, label, onPress }: AnimatedQuickActionProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 8,
      tension: 200,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 150,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], flex: 1 }}>
      <TouchableOpacity
        style={styles.quickAction}
        onPress={() => {
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          onPress();
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
      >
        <View style={[styles.quickActionIcon, { backgroundColor: color + '15' }]}>
          <Icon size={24} color={color} />
        </View>
        <Text style={styles.quickActionText}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function OrganizationDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { organization, plan, setOrganization, user } = useUserStore();
  const { handleLogout } = useLogout();
  const { directusToken, directusUserId } = useAdminStore();
  const [loading, setLoading] = useState(true);
  const [planDetails, setPlanDetails] = useState<DirectusPlan | null>(null);
  
  const [stats, setStats] = useState({
    activeMembers: 0,
    totalMembers: organization?.memberCount || 0,
    groups: 0,
    prayers: 0,
    testimonials: 0
  });

  useEffect(() => {
    fetchOrganizationDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [directusToken, directusUserId, user?.accessToken]);

  const fetchOrganizationDetails = async () => {
    const hasAdminAuth = !!(directusToken && directusUserId);
    const hasUserAuth = !!(user?.accessToken && (user?.organizationId || user?.id));
    
    if (!hasAdminAuth && !hasUserAuth) {
      console.log('⚠️ No directus token or user ID available');
      setLoading(false);
      return;
    }

    const apiCall = async (url: string) => {
      if (hasUserAuth) {
        return fetchWithAuth(url);
      } else {
        return fetch(url, {
          headers: {
            'Authorization': `Bearer ${directusToken}`,
            'Content-Type': 'application/json',
          }
        });
      }
    };

    try {
      setLoading(true);
      console.log('📊 Fetching organization details...');

      let orgId = organization?.id;
      let directusOrg: DirectusOrganization | null = null;

      // 1. Fetch Organization
      if (!orgId) {
        // Try to find organization by organizer_id (user id)
        const userId = hasAdminAuth ? directusUserId : user?.id;
        const orgResponse = await apiCall(
          getApiUrl(`/items/organizations?filter[organizer_id][_eq]=${userId}&limit=1`)
        );

        if (orgResponse.ok) {
          const orgData = await orgResponse.json();
          if (orgData.data && orgData.data.length > 0) {
             directusOrg = orgData.data[0];
             orgId = directusOrg?.id;
          }
        }
      } else {
         // Fetch by ID
         const orgResponse = await apiCall(
          getApiUrl(`/items/organizations/${orgId}`)
        );
         if (orgResponse.ok) {
           const orgData = await orgResponse.json();
           directusOrg = orgData.data;
         }
      }

      if (directusOrg) {
          console.log('✅ Organization fetched:', directusOrg);
          orgId = directusOrg.id;

          // Fetch plan details
          let fetchedPlanDetails: DirectusPlan | null = null;
          if (directusOrg.plan) {
            try {
              // Plans are public or require API token
               const planResponse = await fetch(
                getApiUrl(`/items/plans/${directusOrg.plan}`),
                {
                  headers: {
                    'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
                    'Content-Type': 'application/json',
                  },
                }
              );

              if (planResponse.ok) {
                const contentType = planResponse.headers.get('content-type');
                if (contentType && contentType.includes('text/html')) {
                   console.warn('⚠️ Plan details fetch returned HTML (likely 404 or proxy error). Using fallback defaults.');
                } else {
                  const planData = await planResponse.json();
                  fetchedPlanDetails = planData.data;
                  setPlanDetails(fetchedPlanDetails);
                }
              }
            } catch (error) {
              console.error('❌ Error fetching plan details:', error);
            }
          }

          const mappedOrg = {
            id: directusOrg.id,
            name: directusOrg.name,
            city: directusOrg.city,
            plan: directusOrg.plan as any,
            memberCount: 0,
            maxMembers: fetchedPlanDetails?.maxMembers || directusOrg.maxMembers,
            createdAt: directusOrg.date_created,
            adminId: directusOrg.organizer_id,
            status: directusOrg.status,
            organizerId: directusOrg.organizer_id,
          };

          setOrganization(mappedOrg);

          // Fetch Members
          const membersResponse = await apiCall(
            getApiUrl(`/items/organization_users?filter[organization_id][_eq]=${orgId}`)
          );

          if (membersResponse.ok) {
            const membersData = await membersResponse.json();
            const memberCount = membersData.data?.length || 0;
            const activeMemberCount = membersData.data?.filter((m: any) => m.status === 'active')?.length || 0;
            
            mappedOrg.memberCount = memberCount;
            setOrganization(mappedOrg);
            
            setStats(prev => ({
              ...prev,
              totalMembers: memberCount,
              activeMembers: activeMemberCount,
            }));
          }

          // Fetch Groups
          const groupsResponse = await apiCall(
            getApiUrl(`/items/groups?filter[organization_id][_eq]=${orgId}`)
          );

          if (groupsResponse.ok) {
            const groupsData = await groupsResponse.json();
            setStats(prev => ({ ...prev, groups: groupsData.data?.length || 0 }));
          }

          // Fetch Prayers
          const prayersResponse = await apiCall(
            getApiUrl(`/items/prayers?filter[organization_id][_eq]=${orgId}`)
          );

          if (prayersResponse.ok) {
            const prayersData = await prayersResponse.json();
            setStats(prev => ({ ...prev, prayers: prayersData.data?.length || 0 }));
          }

          // Fetch Testimonials
          const testimonialsResponse = await apiCall(
            getApiUrl(`/items/testimonials?filter[organization_id][_eq]=${orgId}`)
          );

          if (testimonialsResponse.ok) {
            const testimonialsData = await testimonialsResponse.json();
            setStats(prev => ({ ...prev, testimonials: testimonialsData.data?.length || 0 }));
          }

          console.log('✅ Organization stats loaded');
        } else {
          console.log('⚠️ No organization found');
        }

    } catch (error) {
      console.error('❌ Error fetching organization details:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const orgName = organization?.name || 'Your Organization';

  const getPlanName = () => {
    if (planDetails) {
      return planDetails.name;
    }
    return 'No Plan';
  };

  const getMaxMembers = () => {
    if (planDetails) {
      return planDetails.maxMembers === 0 || planDetails.maxMembers > 10000 
        ? 'Unlimited' 
        : planDetails.maxMembers;
    }
    return organization?.maxMembers || 0;
  };

  const navigateTo = (route: string) => {
    try {
      switch (route) {
        case 'members':
          router.push('/organization/members');
          break;
        case 'groups':
          router.push('/organization/groups');
          break;
        case 'content':
          router.push('/organization/content');
          break;
        case 'analytics':
          router.push('/organization/analytics');
          break;
        case 'settings':
          router.push('/organization/settings');
          break;
        default:
          console.log('Unknown route:', route);
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Loading organization details...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom + 20 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{orgName}</Text>
        <Text style={styles.subtitle}>Organization Dashboard</Text>
        {organization?.city && (
          <Text style={styles.cityText}>{organization.city}</Text>
        )}
      </View>

      <View style={styles.planInfoCard}>
        <View style={styles.planInfoHeader}>
          <Text style={styles.planInfoTitle}>
            {getPlanName()}
          </Text>
          <TouchableOpacity onPress={() => router.push('/membership')}>
            <Text style={styles.upgradeLink}>Upgrade</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.planLimits}>
          <View style={styles.planLimit}>
            <Text style={styles.planLimitLabel}>Members</Text>
            <Text style={styles.planLimitValue}>
              {stats.totalMembers} / {getMaxMembers()}
            </Text>
          </View>
          {planDetails?.description && (
            <View style={styles.planLimit}>
              <Text style={styles.planLimitLabel}>Plan Details</Text>
              <Text style={styles.planDescriptionText} numberOfLines={2}>
                {planDetails.description}
              </Text>
            </View>
          )}
        </View>
      </View>

      {(plan === 'small_church' || plan === 'large_church') && user?.organizationRole === 'admin' && (
        <TouchableOpacity
          style={styles.churchAdminBanner}
          onPress={() => router.push('/organization/admin-dashboard')}
        >
          <View style={styles.churchAdminBannerContent}>
            <Shield size={28} color={Colors.light.white} />
            <View style={styles.churchAdminBannerText}>
              <Text style={styles.churchAdminBannerTitle}>Church Admin Dashboard</Text>
              <Text style={styles.churchAdminBannerSubtitle}>Manage all church content and features</Text>
            </View>
            <ChevronRight size={24} color={Colors.light.white} />
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.quickActions}>
        <AnimatedQuickAction 
          icon={UserPlus}
          color={Colors.light.org1}
          label="Add Member"
          onPress={() => navigateTo('members')}
        />
        <AnimatedQuickAction 
          icon={Users}
          color={Colors.light.org2}
          label="Create Group"
          onPress={() => navigateTo('groups')}
        />
        <AnimatedQuickAction 
          icon={Book}
          color={Colors.light.org3}
          label="Add Content"
          onPress={() => navigateTo('content')}
        />
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statsHeader}>
          <Text style={styles.statsTitle}>Organization Stats</Text>
          <TouchableOpacity 
            style={styles.viewAnalyticsButton}
            onPress={() => navigateTo('analytics')}
          >
            <Text style={styles.viewAnalyticsText}>View Analytics</Text>
            <BarChart2 size={16} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.activeMembers}</Text>
            <Text style={styles.statLabel}>Active Members</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.groups}</Text>
            <Text style={styles.statLabel}>Groups</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.prayers}</Text>
            <Text style={styles.statLabel}>Prayers</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.testimonials}</Text>
            <Text style={styles.statLabel}>Testimonials</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Manage</Text>
        
        <View style={styles.menuCard}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigateTo('members')}
          >
            <View style={styles.menuItemLeft}>
              <Users size={20} color={Colors.light.text} style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Members</Text>
            </View>
            <ChevronRight size={20} color={Colors.light.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigateTo('groups')}
          >
            <View style={styles.menuItemLeft}>
              <Users size={20} color={Colors.light.text} style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Groups</Text>
            </View>
            <ChevronRight size={20} color={Colors.light.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigateTo('content')}
          >
            <View style={styles.menuItemLeft}>
              <Book size={20} color={Colors.light.text} style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Content</Text>
            </View>
            <ChevronRight size={20} color={Colors.light.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/prayer-wall')}
          >
            <View style={styles.menuItemLeft}>
              <MessageCircle size={20} color={Colors.light.text} style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Prayer Wall</Text>
            </View>
            <ChevronRight size={20} color={Colors.light.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigateTo('settings')}
          >
            <View style={styles.menuItemLeft}>
              <Settings size={20} color={Colors.light.text} style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Organization Settings</Text>
            </View>
            <ChevronRight size={20} color={Colors.light.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigateTo('analytics')}
          >
            <View style={styles.menuItemLeft}>
              <BarChart2 size={20} color={Colors.light.text} style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Analytics</Text>
            </View>
            <ChevronRight size={20} color={Colors.light.textLight} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.helpCard}>
        <Text style={styles.helpTitle}>Need Help?</Text>
        <Text style={styles.helpText}>
          Learn how to make the most of your organization&apos;s membership with our helpful resources.
        </Text>
        <Button
          title="View Organization Guide"
          variant="outline"
          size="small"
          style={styles.helpButton}
          onPress={() => {}}
        />
      </View>
      
      {/* Logout Button */}
      <Button
        title="Log Out"
        onPress={handleLogout}
        variant="outline"
        icon={<LogOut size={18} color={Colors.light.primary} />}
        style={styles.logoutButton}
        textStyle={{ color: Colors.light.primary }}
      />
      
      <BottomNavigation />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.title,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: Colors.light.textLight,
  },
  planInfoCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.small,
  },
  planInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  planInfoTitle: {
    ...theme.typography.subtitle,
    fontSize: 16,
  },
  upgradeLink: {
    ...theme.typography.body,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  planLimits: {
    flexDirection: 'row',
  },
  planLimit: {
    marginRight: theme.spacing.xl,
  },
  planLimitLabel: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
  },
  planLimitValue: {
    ...theme.typography.body,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  quickAction: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    ...theme.shadows.small,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  quickActionText: {
    ...theme.typography.caption,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  statsCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    ...theme.shadows.small,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  statsTitle: {
    ...theme.typography.subtitle,
    fontSize: 16,
  },
  viewAnalyticsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAnalyticsText: {
    ...theme.typography.caption,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    marginBottom: theme.spacing.md,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.light.primary,
    letterSpacing: -0.5,
  },
  statLabel: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.subtitle,
    marginBottom: theme.spacing.sm,
  },
  menuCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: theme.spacing.md,
  },
  menuItemText: {
    ...theme.typography.body,
  },
  helpCard: {
    backgroundColor: Colors.light.primary + '15',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.primary,
  },
  helpTitle: {
    ...theme.typography.subtitle,
    marginBottom: theme.spacing.sm,
  },
  helpText: {
    ...theme.typography.body,
    color: Colors.light.textLight,
    marginBottom: theme.spacing.md,
  },
  helpButton: {
    alignSelf: 'flex-start',
  },
  logoutButton: {
    marginTop: theme.spacing.lg,
    borderColor: Colors.light.primary,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...theme.typography.body,
    color: Colors.light.textLight,
  },
  cityText: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
    marginTop: theme.spacing.xs,
  },
  planDescriptionText: {
    ...theme.typography.caption,
    color: Colors.light.text,
    marginTop: theme.spacing.xs,
  },
  churchAdminBanner: {
    backgroundColor: Colors.light.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  churchAdminBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  churchAdminBannerText: {
    flex: 1,
  },
  churchAdminBannerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.white,
    marginBottom: 2,
  },
  churchAdminBannerSubtitle: {
    fontSize: 13,
    color: Colors.light.white,
    opacity: 0.9,
  },
});