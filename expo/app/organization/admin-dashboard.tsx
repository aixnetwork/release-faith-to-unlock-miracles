import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Users, Settings, BarChart3, MessageCircle, 
  Heart, Calendar, Shield, FileText, DollarSign 
} from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';
import { ChurchAdminRole, getPermissions, ChurchContentStats } from '@/types/church-admin';

interface AdminCard {
  id: string;
  title: string;
  icon: any;
  color: string;
  route: string;
  permission?: keyof ReturnType<typeof getPermissions>;
  count?: number;
  description: string;
}

export default function ChurchAdminDashboard() {
  const insets = useSafeAreaInsets();
  const { user, organization, plan } = useUserStore();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<ChurchContentStats>({
    totalPrayers: 0,
    activePrayers: 0,
    answeredPrayers: 0,
    totalTestimonials: 0,
    approvedTestimonials: 0,
    pendingTestimonials: 0,
    totalSongs: 0,
    totalQuotes: 0,
    totalPromises: 0,
    totalMembers: 0,
    activeMembers: 0,
    totalGroups: 0,
    totalMeetings: 0,
    upcomingMeetings: 0,
  });

  const adminRole = (user?.organizationRole || 'member') as ChurchAdminRole;
  const permissions = getPermissions(adminRole);

  const isChurchPlan = plan === 'small_church' || plan === 'large_church';

  const loadStats = useCallback(async () => {
    console.log('📊 Loading church admin stats...');
    setStats({
      totalPrayers: 12,
      activePrayers: 8,
      answeredPrayers: 4,
      totalTestimonials: 24,
      approvedTestimonials: 20,
      pendingTestimonials: 4,
      totalSongs: 35,
      totalQuotes: 18,
      totalPromises: 42,
      totalMembers: organization?.memberCount || 0,
      activeMembers: Math.floor((organization?.memberCount || 0) * 0.8),
      totalGroups: 5,
      totalMeetings: 8,
      upcomingMeetings: 3,
    });
  }, [organization?.memberCount]);

  useEffect(() => {
    if (!isChurchPlan) {
      router.replace('/organization');
    } else {
      loadStats();
    }
  }, [isChurchPlan, loadStats]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }, [loadStats]);

  const adminCards: AdminCard[] = [
    {
      id: 'members',
      title: 'Member Management',
      icon: Users,
      color: Colors.light.primary,
      route: '/organization/members',
      permission: 'canManageMembers',
      count: stats.totalMembers,
      description: 'Manage church members, roles & permissions',
    },
    {
      id: 'prayers',
      title: 'Prayer Management',
      icon: MessageCircle,
      color: Colors.light.secondary,
      route: '/organization/prayers',
      permission: 'canManagePrayers',
      count: stats.activePrayers,
      description: 'Moderate & manage prayer requests',
    },
    {
      id: 'testimonials',
      title: 'Testimonials',
      icon: Heart,
      color: Colors.light.success,
      route: '/organization/testimonials',
      permission: 'canManageTestimonials',
      count: stats.pendingTestimonials,
      description: 'Review & approve testimonials',
    },
    {
      id: 'content',
      title: 'Content Management',
      icon: FileText,
      color: Colors.light.warning,
      route: '/organization/content/manage',
      permission: 'canCreateContent',
      count: stats.totalSongs + stats.totalQuotes + stats.totalPromises,
      description: 'Manage sermons, bible studies & more',
    },
    {
      id: 'groups',
      title: 'Groups',
      icon: Users,
      color: Colors.light.org2,
      route: '/organization/groups',
      permission: 'canManageGroups',
      count: stats.totalGroups,
      description: 'Create & manage church groups',
    },
    {
      id: 'meetings',
      title: 'Meetings',
      icon: Calendar,
      color: Colors.light.org3,
      route: '/organization/meetings',
      permission: 'canManageMeetings',
      count: stats.upcomingMeetings,
      description: 'Schedule & manage church meetings',
    },
    {
      id: 'marketplace',
      title: 'Marketplace',
      icon: DollarSign,
      color: Colors.light.secondary,
      route: '/organization/marketplace',
      permission: 'canManageMarketplace',
      count: 0,
      description: 'Manage service listings',
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: BarChart3,
      color: Colors.light.primary,
      route: '/organization/analytics',
      permission: 'canViewAnalytics',
      description: 'View insights & reports',
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: Settings,
      color: Colors.light.textMedium,
      route: '/organization/settings',
      permission: 'canManageSettings',
      description: 'Configure church settings',
    },
  ];

  const filteredCards = adminCards.filter(card => {
    if (!card.permission) return true;
    return permissions[card.permission];
  });

  if (!isChurchPlan) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Church Admin Dashboard',
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: Colors.light.text,
        }}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + theme.spacing.xxl }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>{organization?.name || 'Church'} Admin</Text>
          <Text style={styles.subtitle}>
            {adminRole === 'owner' ? '👑 Church Owner' : 
             adminRole === 'admin' ? '⚡ Administrator' :
             adminRole === 'content_manager' ? '📝 Content Manager' :
             adminRole === 'moderator' ? '🛡️ Moderator' : 'Member'}
          </Text>
          <View style={styles.planBadge}>
            <Shield size={16} color={Colors.light.white} />
            <Text style={styles.planBadgeText}>
              {plan === 'small_church' ? 'Small Church Plan' : 'Large Church Plan'}
            </Text>
          </View>
        </View>

        <View style={styles.statsOverview}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalMembers}</Text>
              <Text style={styles.statLabel}>Members</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.activePrayers}</Text>
              <Text style={styles.statLabel}>Active Prayers</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.pendingTestimonials}</Text>
              <Text style={styles.statLabel}>Pending Reviews</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.upcomingMeetings}</Text>
              <Text style={styles.statLabel}>Upcoming Events</Text>
            </View>
          </View>
        </View>

        <View style={styles.adminSection}>
          <Text style={styles.sectionTitle}>Management Tools</Text>
          <View style={styles.cardsGrid}>
            {filteredCards.map((card) => {
              const Icon = card.icon;
              return (
                <TouchableOpacity
                  key={card.id}
                  style={styles.adminCard}
                  onPress={() => router.push(card.route as any)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconContainer, { backgroundColor: card.color + '15' }]}>
                    <Icon size={24} color={card.color} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{card.title}</Text>
                    <Text style={styles.cardDescription}>{card.description}</Text>
                    {card.count !== undefined && (
                      <View style={[styles.countBadge, { backgroundColor: card.color }]}>
                        <Text style={styles.countText}>{card.count}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>💡 Admin Tips</Text>
          <Text style={styles.helpText}>
            • Regularly review pending content for approval{'\n'}
            • Check member engagement in Analytics{'\n'}
            • Schedule recurring meetings in advance{'\n'}
            • Assign roles to trusted church leaders{'\n'}
            • Monitor prayer requests for pastoral care needs
          </Text>
        </View>
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
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.title,
    fontSize: 28,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: Colors.light.textMedium,
    fontSize: 16,
    marginBottom: theme.spacing.sm,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    gap: 6,
  },
  planBadgeText: {
    color: Colors.light.white,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  statsOverview: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.subtitle,
    fontSize: 18,
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.light.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.light.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    ...theme.typography.caption,
    color: Colors.light.textMedium,
    textAlign: 'center',
  },
  adminSection: {
    marginBottom: theme.spacing.xl,
  },
  cardsGrid: {
    gap: theme.spacing.md,
  },
  adminCard: {
    flexDirection: 'row',
    backgroundColor: Colors.light.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    ...theme.typography.subtitle,
    fontSize: 16,
    marginBottom: 2,
  },
  cardDescription: {
    ...theme.typography.caption,
    color: Colors.light.textMedium,
  },
  countBadge: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  countText: {
    color: Colors.light.white,
    fontSize: 12,
    fontWeight: '700' as const,
  },
  helpSection: {
    backgroundColor: Colors.light.primary + '10',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.primary,
  },
  helpTitle: {
    ...theme.typography.subtitle,
    marginBottom: theme.spacing.sm,
  },
  helpText: {
    ...theme.typography.body,
    color: Colors.light.textMedium,
    lineHeight: 22,
  },
});
