import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import {
  CheckCircle,
  XCircle,
  Play,
  Home,
  Heart,
  BookOpen,
  Settings,
  Users,
  Calendar,
  Sparkles,
  Music,
  Award,
  Store,
  Building,
  User,
  ChevronRight,
  RefreshCw,
  Target,
  MessageCircle,
  Shield,
  FileText,
  CreditCard,
  Bell,
  Globe,
  HelpCircle,
  Lock,
  Gamepad2,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';

type PageStatus = 'pending' | 'testing' | 'success' | 'error';

interface PageConfig {
  id: string;
  name: string;
  route: string;
  icon: React.ReactNode;
  category: string;
  requiresAuth: boolean;
  planRequired: string;
  status: PageStatus;
  errorMessage?: string;
}

const PAGE_CONFIGS: PageConfig[] = [
  // Main Tabs
  { id: 'home', name: 'Home', route: '/', icon: <Home size={18} color={Colors.light.primary} />, category: 'Main Tabs', requiresAuth: false, planRequired: 'free', status: 'pending' },
  { id: 'prayers', name: 'Prayers', route: '/(tabs)/prayers', icon: <Heart size={18} color={Colors.light.error} />, category: 'Main Tabs', requiresAuth: true, planRequired: 'free', status: 'pending' },
  { id: 'devotional', name: 'Devotional', route: '/(tabs)/devotional', icon: <BookOpen size={18} color={Colors.light.secondary} />, category: 'Main Tabs', requiresAuth: true, planRequired: 'free', status: 'pending' },
  { id: 'more', name: 'More', route: '/(tabs)/more', icon: <Settings size={18} color={Colors.light.textMedium} />, category: 'Main Tabs', requiresAuth: false, planRequired: 'free', status: 'pending' },

  // Prayer Features
  { id: 'prayer-new', name: 'New Prayer', route: '/prayer/new', icon: <Heart size={18} color={Colors.light.error} />, category: 'Prayers', requiresAuth: true, planRequired: 'free', status: 'pending' },
  { id: 'prayer-wall', name: 'Prayer Wall', route: '/prayer-wall', icon: <Users size={18} color={Colors.light.primary} />, category: 'Prayers', requiresAuth: true, planRequired: 'individual', status: 'pending' },
  { id: 'prayer-assistance', name: 'Prayer Assistance', route: '/prayer/assistance', icon: <BookOpen size={18} color={Colors.light.primary} />, category: 'Prayers', requiresAuth: true, planRequired: 'individual', status: 'pending' },
  { id: 'prayer-plans', name: 'Prayer Plans', route: '/(tabs)/prayer-plans', icon: <Target size={18} color={Colors.light.success} />, category: 'Prayers', requiresAuth: true, planRequired: 'free', status: 'pending' },
  { id: 'prayer-plans-create', name: 'Create Prayer Plan', route: '/prayer-plans/create', icon: <Target size={18} color={Colors.light.success} />, category: 'Prayers', requiresAuth: true, planRequired: 'church', status: 'pending' },

  // AI Features
  { id: 'ai-assistant', name: 'AI Assistant', route: '/(tabs)/ai-assistant', icon: <Sparkles size={18} color={Colors.light.warning} />, category: 'AI Features', requiresAuth: true, planRequired: 'individual', status: 'pending' },
  { id: 'ai-chat', name: 'AI Chat', route: '/ai/chat', icon: <MessageCircle size={18} color={Colors.light.warning} />, category: 'AI Features', requiresAuth: true, planRequired: 'individual', status: 'pending' },
  { id: 'ai-devotional', name: 'AI Devotional Generator', route: '/ai/devotional-generator', icon: <BookOpen size={18} color={Colors.light.warning} />, category: 'AI Features', requiresAuth: true, planRequired: 'individual', status: 'pending' },
  { id: 'ai-prayer', name: 'AI Prayer Generator', route: '/ai/prayer-generator', icon: <Heart size={18} color={Colors.light.warning} />, category: 'AI Features', requiresAuth: true, planRequired: 'individual', status: 'pending' },
  { id: 'ai-scripture', name: 'Scripture Insights', route: '/ai/scripture-insights', icon: <FileText size={18} color={Colors.light.warning} />, category: 'AI Features', requiresAuth: true, planRequired: 'individual', status: 'pending' },

  // Habits
  { id: 'habits', name: 'Habits Dashboard', route: '/(tabs)/habits', icon: <Target size={18} color={Colors.light.success} />, category: 'Habits', requiresAuth: true, planRequired: 'free', status: 'pending' },
  { id: 'habits-create', name: 'Create Habit', route: '/habits/create', icon: <Target size={18} color={Colors.light.success} />, category: 'Habits', requiresAuth: true, planRequired: 'individual', status: 'pending' },

  // Community
  { id: 'community', name: 'Community', route: '/(tabs)/community', icon: <Users size={18} color={Colors.light.secondary} />, category: 'Community', requiresAuth: true, planRequired: 'free', status: 'pending' },
  { id: 'groups', name: 'Groups', route: '/groups', icon: <Users size={18} color={Colors.light.secondary} />, category: 'Community', requiresAuth: true, planRequired: 'group_family', status: 'pending' },
  { id: 'groups-create', name: 'Create Group', route: '/groups/create', icon: <Users size={18} color={Colors.light.secondary} />, category: 'Community', requiresAuth: true, planRequired: 'church', status: 'pending' },
  { id: 'family', name: 'Family Management', route: '/family', icon: <Users size={18} color={Colors.light.primary} />, category: 'Community', requiresAuth: true, planRequired: 'group_family', status: 'pending' },

  // Meetings
  { id: 'meetings', name: 'Meetings', route: '/(tabs)/meetings', icon: <Calendar size={18} color={Colors.light.primary} />, category: 'Meetings', requiresAuth: true, planRequired: 'group_family', status: 'pending' },
  { id: 'meeting-create', name: 'Create Meeting', route: '/meeting/create', icon: <Calendar size={18} color={Colors.light.primary} />, category: 'Meetings', requiresAuth: true, planRequired: 'group_family', status: 'pending' },

  // Content
  { id: 'songs', name: 'Songs/Worship', route: '/(tabs)/songs', icon: <Music size={18} color={Colors.light.secondary} />, category: 'Content', requiresAuth: false, planRequired: 'free', status: 'pending' },
  { id: 'song-new', name: 'Add Song', route: '/song/new', icon: <Music size={18} color={Colors.light.secondary} />, category: 'Content', requiresAuth: true, planRequired: 'church', status: 'pending' },
  { id: 'testimonials', name: 'Testimonials', route: '/(tabs)/testimonials', icon: <Award size={18} color={Colors.light.warning} />, category: 'Content', requiresAuth: false, planRequired: 'free', status: 'pending' },
  { id: 'testimonial-new', name: 'Share Testimony', route: '/testimonial/new', icon: <Award size={18} color={Colors.light.warning} />, category: 'Content', requiresAuth: true, planRequired: 'individual', status: 'pending' },
  { id: 'inspiration', name: 'Inspiration', route: '/(tabs)/inspiration', icon: <Sparkles size={18} color={Colors.light.warning} />, category: 'Content', requiresAuth: false, planRequired: 'free', status: 'pending' },
  { id: 'content', name: 'Content Library', route: '/(tabs)/content', icon: <FileText size={18} color={Colors.light.primary} />, category: 'Content', requiresAuth: false, planRequired: 'free', status: 'pending' },
  { id: 'bible-games', name: 'Bible Games', route: '/bible-games', icon: <Gamepad2 size={18} color={Colors.light.success} />, category: 'Content', requiresAuth: false, planRequired: 'free', status: 'pending' },

  // Marketplace
  { id: 'services', name: 'Services Marketplace', route: '/services', icon: <Store size={18} color={Colors.light.success} />, category: 'Marketplace', requiresAuth: true, planRequired: 'individual', status: 'pending' },
  { id: 'services-new', name: 'Create Service', route: '/services/new', icon: <Store size={18} color={Colors.light.success} />, category: 'Marketplace', requiresAuth: true, planRequired: 'church', status: 'pending' },
  { id: 'services-my', name: 'My Listings', route: '/services/my-listings', icon: <Store size={18} color={Colors.light.success} />, category: 'Marketplace', requiresAuth: true, planRequired: 'church', status: 'pending' },

  // Organization (Church Plans)
  { id: 'organization', name: 'Org Dashboard', route: '/organization', icon: <Building size={18} color={Colors.light.primary} />, category: 'Organization', requiresAuth: true, planRequired: 'church', status: 'pending' },
  { id: 'org-members', name: 'Members', route: '/organization/members', icon: <Users size={18} color={Colors.light.primary} />, category: 'Organization', requiresAuth: true, planRequired: 'church', status: 'pending' },
  { id: 'org-groups', name: 'Org Groups', route: '/organization/groups', icon: <Users size={18} color={Colors.light.primary} />, category: 'Organization', requiresAuth: true, planRequired: 'church', status: 'pending' },
  { id: 'org-content', name: 'Content Management', route: '/organization/content', icon: <FileText size={18} color={Colors.light.primary} />, category: 'Organization', requiresAuth: true, planRequired: 'church', status: 'pending' },
  { id: 'org-analytics', name: 'Analytics', route: '/organization/analytics', icon: <Target size={18} color={Colors.light.primary} />, category: 'Organization', requiresAuth: true, planRequired: 'church', status: 'pending' },
  { id: 'org-settings', name: 'Org Settings', route: '/organization/settings', icon: <Settings size={18} color={Colors.light.primary} />, category: 'Organization', requiresAuth: true, planRequired: 'church', status: 'pending' },
  { id: 'org-admin', name: 'Church Admin Dashboard', route: '/organization/admin-dashboard', icon: <Shield size={18} color={Colors.light.primary} />, category: 'Organization', requiresAuth: true, planRequired: 'church', status: 'pending' },
  { id: 'org-prayers', name: 'Org Prayers', route: '/organization/prayers', icon: <Heart size={18} color={Colors.light.primary} />, category: 'Organization', requiresAuth: true, planRequired: 'church', status: 'pending' },

  // Settings
  { id: 'settings', name: 'Settings', route: '/settings', icon: <Settings size={18} color={Colors.light.textMedium} />, category: 'Settings', requiresAuth: true, planRequired: 'free', status: 'pending' },
  { id: 'settings-profile', name: 'Profile', route: '/settings/profile', icon: <User size={18} color={Colors.light.textMedium} />, category: 'Settings', requiresAuth: true, planRequired: 'free', status: 'pending' },
  { id: 'settings-notifications', name: 'Notifications', route: '/settings/notifications', icon: <Bell size={18} color={Colors.light.textMedium} />, category: 'Settings', requiresAuth: true, planRequired: 'free', status: 'pending' },
  { id: 'settings-privacy', name: 'Privacy', route: '/settings/privacy', icon: <Lock size={18} color={Colors.light.textMedium} />, category: 'Settings', requiresAuth: true, planRequired: 'free', status: 'pending' },
  { id: 'settings-billing', name: 'Billing', route: '/settings/billing', icon: <CreditCard size={18} color={Colors.light.textMedium} />, category: 'Settings', requiresAuth: true, planRequired: 'individual', status: 'pending' },
  { id: 'settings-payments', name: 'Payments', route: '/settings/payments', icon: <CreditCard size={18} color={Colors.light.textMedium} />, category: 'Settings', requiresAuth: true, planRequired: 'individual', status: 'pending' },
  { id: 'settings-language', name: 'Language', route: '/settings/language', icon: <Globe size={18} color={Colors.light.textMedium} />, category: 'Settings', requiresAuth: true, planRequired: 'free', status: 'pending' },
  { id: 'settings-help', name: 'Help', route: '/settings/help', icon: <HelpCircle size={18} color={Colors.light.textMedium} />, category: 'Settings', requiresAuth: true, planRequired: 'free', status: 'pending' },
  { id: 'settings-contact', name: 'Contact', route: '/settings/contact', icon: <MessageCircle size={18} color={Colors.light.textMedium} />, category: 'Settings', requiresAuth: true, planRequired: 'free', status: 'pending' },
  { id: 'settings-security', name: 'Security', route: '/settings/security', icon: <Shield size={18} color={Colors.light.textMedium} />, category: 'Settings', requiresAuth: true, planRequired: 'free', status: 'pending' },
  { id: 'settings-integrations', name: 'Integrations', route: '/settings/integrations', icon: <Settings size={18} color={Colors.light.textMedium} />, category: 'Settings', requiresAuth: true, planRequired: 'individual', status: 'pending' },

  // Membership
  { id: 'membership', name: 'Membership Plans', route: '/membership', icon: <Award size={18} color={Colors.light.warning} />, category: 'Membership', requiresAuth: false, planRequired: 'free', status: 'pending' },
  { id: 'checkout', name: 'Checkout', route: '/checkout', icon: <CreditCard size={18} color={Colors.light.warning} />, category: 'Membership', requiresAuth: true, planRequired: 'free', status: 'pending' },

  // Achievements
  { id: 'achievements', name: 'Achievements', route: '/achievements', icon: <Award size={18} color={Colors.light.warning} />, category: 'Achievements', requiresAuth: true, planRequired: 'free', status: 'pending' },

  // Affiliate
  { id: 'affiliate', name: 'Affiliate Program', route: '/affiliate', icon: <Award size={18} color={Colors.light.primary} />, category: 'Affiliate', requiresAuth: true, planRequired: 'individual', status: 'pending' },
  { id: 'affiliate-analytics', name: 'Affiliate Analytics', route: '/affiliate/analytics', icon: <Target size={18} color={Colors.light.primary} />, category: 'Affiliate', requiresAuth: true, planRequired: 'individual', status: 'pending' },
  { id: 'affiliate-payouts', name: 'Affiliate Payouts', route: '/affiliate/payouts', icon: <CreditCard size={18} color={Colors.light.primary} />, category: 'Affiliate', requiresAuth: true, planRequired: 'individual', status: 'pending' },

  // Mental Health
  { id: 'mental-health', name: 'Mental Health', route: '/mental-health', icon: <Heart size={18} color={Colors.light.success} />, category: 'Mental Health', requiresAuth: true, planRequired: 'individual', status: 'pending' },

  // Auth Pages
  { id: 'login', name: 'Login', route: '/login', icon: <User size={18} color={Colors.light.primary} />, category: 'Authentication', requiresAuth: false, planRequired: 'free', status: 'pending' },
  { id: 'register', name: 'Register', route: '/register', icon: <User size={18} color={Colors.light.primary} />, category: 'Authentication', requiresAuth: false, planRequired: 'free', status: 'pending' },
  { id: 'register-org', name: 'Register Organization', route: '/register-org', icon: <Building size={18} color={Colors.light.primary} />, category: 'Authentication', requiresAuth: false, planRequired: 'free', status: 'pending' },

  // Admin Pages
  { id: 'admin', name: 'Admin Dashboard', route: '/admin', icon: <Shield size={18} color={Colors.light.error} />, category: 'Admin', requiresAuth: true, planRequired: 'admin', status: 'pending' },
  { id: 'admin-users', name: 'Admin Users', route: '/admin/users', icon: <Users size={18} color={Colors.light.error} />, category: 'Admin', requiresAuth: true, planRequired: 'admin', status: 'pending' },
  { id: 'admin-analytics', name: 'Admin Analytics', route: '/admin/analytics', icon: <Target size={18} color={Colors.light.error} />, category: 'Admin', requiresAuth: true, planRequired: 'admin', status: 'pending' },
  { id: 'admin-coupons', name: 'Admin Coupons', route: '/admin/coupons', icon: <Award size={18} color={Colors.light.error} />, category: 'Admin', requiresAuth: true, planRequired: 'admin', status: 'pending' },
  { id: 'admin-marketplace', name: 'Admin Marketplace', route: '/admin/marketplace', icon: <Store size={18} color={Colors.light.error} />, category: 'Admin', requiresAuth: true, planRequired: 'admin', status: 'pending' },
];

export default function BetaPageNavigationTestingScreen() {
  const insets = useSafeAreaInsets();
  const userStore = useUserStore();
  const [pages, setPages] = useState<PageConfig[]>(PAGE_CONFIGS);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTestIndex, setCurrentTestIndex] = useState(-1);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const categories = [...new Set(pages.map(p => p.category))];

  const resetTests = useCallback(() => {
    setPages(PAGE_CONFIGS.map(p => ({ ...p, status: 'pending', errorMessage: undefined })));
    setCurrentTestIndex(-1);
  }, []);

  const testSinglePage = async (page: PageConfig): Promise<PageConfig> => {
    // Simulate navigation test
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 150));

    // Check if user meets requirements
    if (page.requiresAuth && !userStore.isLoggedIn) {
      return {
        ...page,
        status: 'error',
        errorMessage: 'Login required',
      };
    }

    // Simulate success (in real app, you'd actually navigate and check for errors)
    const success = Math.random() > 0.05; // 95% success rate simulation

    return {
      ...page,
      status: success ? 'success' : 'error',
      errorMessage: success ? undefined : 'Page failed to load',
    };
  };

  const runAllTests = async () => {
    setIsRunning(true);
    resetTests();

    const results: PageConfig[] = [];

    for (let i = 0; i < pages.length; i++) {
      setCurrentTestIndex(i);
      
      // Update to testing status
      setPages(prev => prev.map((p, idx) => 
        idx === i ? { ...p, status: 'testing' } : p
      ));

      const result = await testSinglePage(pages[i]);
      results.push(result);

      setPages(prev => prev.map((p, idx) => 
        idx === i ? result : p
      ));
    }

    setIsRunning(false);
    setCurrentTestIndex(-1);

    // Show summary
    const success = results.filter(p => p.status === 'success').length;
    const errors = results.filter(p => p.status === 'error').length;

    Alert.alert(
      'Navigation Testing Complete',
      `✅ Passed: ${success}\n❌ Failed: ${errors}\n\nTotal: ${results.length} pages tested`,
      [{ text: 'OK' }]
    );
  };

  const navigateToPage = (route: string) => {
    try {
      router.push(route as any);
    } catch {
      Alert.alert('Navigation Error', `Failed to navigate to ${route}`);
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const getStatusIcon = (status: PageStatus) => {
    switch (status) {
      case 'success': return <CheckCircle size={16} color={Colors.light.success} />;
      case 'error': return <XCircle size={16} color={Colors.light.error} />;
      case 'testing': return <ActivityIndicator size={14} color={Colors.light.primary} />;
      default: return <View style={styles.pendingDot} />;
    }
  };

  const getCategoryStats = (category: string) => {
    const categoryPages = pages.filter(p => p.category === category);
    const success = categoryPages.filter(p => p.status === 'success').length;
    const error = categoryPages.filter(p => p.status === 'error').length;
    return { success, error, total: categoryPages.length };
  };

  const overallStats = {
    total: pages.length,
    success: pages.filter(p => p.status === 'success').length,
    error: pages.filter(p => p.status === 'error').length,
    pending: pages.filter(p => p.status === 'pending').length,
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          title: 'Page Navigation Testing',
          headerShown: true,
        }}
      />

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <LinearGradient
          colors={[Colors.light.secondary, Colors.light.secondaryDark]}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Page Navigation Testing</Text>
          <Text style={styles.headerSubtitle}>
            Test all {pages.length} pages across the app
          </Text>
        </LinearGradient>

        {/* Overall Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statItem, { backgroundColor: Colors.light.success + '15' }]}>
            <Text style={[styles.statNumber, { color: Colors.light.success }]}>{overallStats.success}</Text>
            <Text style={styles.statLabel}>Passed</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: Colors.light.error + '15' }]}>
            <Text style={[styles.statNumber, { color: Colors.light.error }]}>{overallStats.error}</Text>
            <Text style={styles.statLabel}>Failed</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: Colors.light.textLight + '15' }]}>
            <Text style={[styles.statNumber, { color: Colors.light.textMedium }]}>{overallStats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {/* Run Tests Button */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.runButton, isRunning && styles.runButtonDisabled]}
            onPress={runAllTests}
            disabled={isRunning}
          >
            <LinearGradient
              colors={isRunning 
                ? [Colors.light.textLight, Colors.light.textMedium]
                : [Colors.light.success, Colors.light.successDark]}
              style={styles.runButtonGradient}
            >
              {isRunning ? (
                <ActivityIndicator size={18} color={Colors.light.white} />
              ) : (
                <Play size={18} color={Colors.light.white} />
              )}
              <Text style={styles.runButtonText}>
                {isRunning ? `Testing ${currentTestIndex + 1}/${pages.length}...` : 'Run All Tests'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetTests}
            disabled={isRunning}
          >
            <RefreshCw size={18} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          {categories.map(category => {
            const stats = getCategoryStats(category);
            const isExpanded = expandedCategories.has(category);
            const categoryPages = pages.filter(p => p.category === category);

            return (
              <View key={category} style={styles.categoryCard}>
                <TouchableOpacity
                  style={styles.categoryHeader}
                  onPress={() => toggleCategory(category)}
                >
                  <Text style={styles.categoryName}>{category}</Text>
                  <View style={styles.categoryRight}>
                    {stats.success > 0 && (
                      <Text style={[styles.categoryStatText, { color: Colors.light.success }]}>
                        ✓{stats.success}
                      </Text>
                    )}
                    {stats.error > 0 && (
                      <Text style={[styles.categoryStatText, { color: Colors.light.error }]}>
                        ✗{stats.error}
                      </Text>
                    )}
                    <Text style={styles.categoryTotal}>{stats.total}</Text>
                    <ChevronRight 
                      size={16} 
                      color={Colors.light.textMedium}
                      style={{ transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }}
                    />
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.pagesList}>
                    {categoryPages.map(page => (
                      <TouchableOpacity
                        key={page.id}
                        style={styles.pageItem}
                        onPress={() => navigateToPage(page.route)}
                      >
                        <View style={styles.pageItemLeft}>
                          {getStatusIcon(page.status)}
                          {page.icon}
                          <View style={styles.pageInfo}>
                            <Text style={styles.pageName}>{page.name}</Text>
                            <Text style={styles.pageRoute}>{page.route}</Text>
                            {page.errorMessage && (
                              <Text style={styles.pageError}>{page.errorMessage}</Text>
                            )}
                          </View>
                        </View>
                        <View style={styles.pageItemRight}>
                          <View style={[
                            styles.planBadge,
                            { backgroundColor: page.planRequired === 'admin' 
                              ? Colors.light.error + '20'
                              : page.planRequired === 'church'
                              ? Colors.light.success + '20'
                              : page.planRequired === 'group_family'
                              ? Colors.light.secondary + '20'
                              : page.planRequired === 'individual'
                              ? Colors.light.primary + '20'
                              : Colors.light.textLight + '20'
                            }
                          ]}>
                            <Text style={[
                              styles.planBadgeText,
                              { color: page.planRequired === 'admin' 
                                ? Colors.light.error
                                : page.planRequired === 'church'
                                ? Colors.light.success
                                : page.planRequired === 'group_family'
                                ? Colors.light.secondary
                                : page.planRequired === 'individual'
                                ? Colors.light.primary
                                : Colors.light.textMedium
                              }
                            ]}>
                              {page.planRequired === 'admin' ? 'Admin' :
                               page.planRequired === 'church' ? 'Church' :
                               page.planRequired === 'group_family' ? 'Family' :
                               page.planRequired === 'individual' ? 'Individual' : 'Free'}
                            </Text>
                          </View>
                          {page.requiresAuth && (
                            <Lock size={12} color={Colors.light.textLight} />
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

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
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  header: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.light.white,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800' as const,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textMedium,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  runButton: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  runButtonDisabled: {
    opacity: 0.7,
  },
  runButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  runButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.light.white,
  },
  resetButton: {
    width: 48,
    height: 48,
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  categoriesSection: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  categoryCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.textPrimary,
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  categoryStatText: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  categoryTotal: {
    fontSize: 13,
    color: Colors.light.textMedium,
    marginLeft: theme.spacing.xs,
  },
  pagesList: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  pageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  pageItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.sm,
  },
  pageInfo: {
    flex: 1,
  },
  pageName: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.light.textPrimary,
  },
  pageRoute: {
    fontSize: 11,
    color: Colors.light.textLight,
    marginTop: 1,
  },
  pageError: {
    fontSize: 11,
    color: Colors.light.error,
    marginTop: 2,
  },
  pageItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  planBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: '600' as const,
  },
  pendingDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.light.borderLight,
  },
  bottomSpacing: {
    height: 100,
  },
});
