import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Target, Clock, Users, Plus, Star, Calendar, TrendingUp, BookOpen } from 'lucide-react-native';
import { EmptyState } from '@/components/EmptyState';
import { useSuperwall } from '@/components/SuperwallProvider';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { usePrayerStore, PrayerPlan } from '@/store/prayerStore';
import { useUserStore } from '@/store/userStore';
import { useTranslation } from '@/utils/translations';

const { width } = Dimensions.get('window');

export default function PrayerPlansScreen() {
  const { prayerPlans, fetchPrayerPlans, isLoading } = usePrayerStore();
  const { isLoggedIn, activePrayerPlans, joinPrayerPlan, settings, user, isAdmin } = useUserStore();
  const { checkFeatureAccess } = useSuperwall();
  const { t } = useTranslation(settings.language);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'popular' | 'new' | 'my-plans'>('all');
  
  const isOrganizer = user?.organizationRole === 'admin';
  const canCreatePlan = isAdmin || isOrganizer;

  useEffect(() => {
    if (isLoggedIn) {
      fetchPrayerPlans();
    }
  }, [isLoggedIn, fetchPrayerPlans]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPrayerPlans();
    setRefreshing(false);
  };

  const categories = [
    { id: 'all', label: t('prayerPlans.all'), icon: Target },
    { id: 'popular', label: t('prayerPlans.popular'), icon: TrendingUp },
    { id: 'new', label: t('prayerPlans.new'), icon: Plus },
    { id: 'my-plans', label: t('prayerPlans.mine'), icon: BookOpen },
  ];

  const filteredPlans = React.useMemo(() => {
    if (!Array.isArray(prayerPlans)) return [];
    
    return prayerPlans.filter(plan => {
      if (!plan) return false;
      
      switch (selectedCategory) {
        case 'popular':
          return (plan.participants || 0) > 500;
        case 'new':
          return plan.createdAt && new Date(plan.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000;
        case 'my-plans':
          return Array.isArray(activePrayerPlans) && activePrayerPlans.some(userPlan => userPlan && userPlan.planId === plan.id);
        default:
          return true;
      }
    });
  }, [prayerPlans, selectedCategory, activePrayerPlans]);

  const isUserJoined = (planId: string) => {
    return Array.isArray(activePrayerPlans) && activePrayerPlans.some(userPlan => userPlan.planId === planId);
  };

  const handleJoinPlan = (planId: string) => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    
    // Check feature access for premium prayer plans
    if (!checkFeatureAccess('Premium Prayer Plans')) {
      return;
    }
    
    joinPrayerPlan(planId);
  };

  const PrayerPlanCard = ({ plan }: { plan: PrayerPlan }) => {
    const joined = isUserJoined(plan.id);
    
    return (
      <TouchableOpacity
        style={styles.planCard}
        onPress={() => router.push(`/prayer-plan/${plan.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.titleSection}>
              <Text style={styles.planTitle} numberOfLines={1}>{plan.title}</Text>
              <Text style={styles.planDescription} numberOfLines={2}>{plan.description}</Text>
            </View>
            {joined && (
              <View style={styles.joinedBadge}>
                <Text style={styles.joinedText}>✓</Text>
              </View>
            )}
          </View>
          
          <View style={styles.cardMeta}>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Clock size={12} color={Colors.light.textMedium} />
                <Text style={styles.metaText}>{plan.duration}d</Text>
              </View>
              <View style={styles.metaItem}>
                <Users size={12} color={Colors.light.textMedium} />
                <Text style={styles.metaText}>{plan.participants || 0}</Text>
              </View>
            </View>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>{plan.category}</Text>
            </View>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, joined && styles.actionButtonJoined]}
              onPress={(e) => {
                e.stopPropagation();
                joined ? router.push(`/prayer-plan/${plan.id}`) : handleJoinPlan(plan.id);
              }}
            >
              <Text style={[styles.actionButtonText, joined && styles.actionButtonTextJoined]}>
                {joined ? t('prayerPlans.continue') : t('prayerPlans.joinPlan')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.meetingButton}
              onPress={(e) => {
                e.stopPropagation();
                router.push('/(tabs)/meetings');
              }}
            >
              <Calendar size={16} color={Colors.light.primary} />
              <Text style={styles.meetingButtonText}>{t('prayerPlans.meetings')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Compact Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleSection}>
            <Text style={styles.headerTitle}>{t('prayerPlans.title')}</Text>
            <View style={styles.quickStats}>
              <Text style={styles.quickStatsText}>
                {(prayerPlans || []).length} {t('prayerPlans.available')} • {Array.isArray(activePrayerPlans) ? activePrayerPlans.length : 0} {t('prayerPlans.active')}
              </Text>
            </View>
          </View>
          {canCreatePlan && (
            <TouchableOpacity
              onPress={() => {
                if (checkFeatureAccess('Create Prayer Plans')) {
                  router.push('/prayer-plans/create');
                }
              }}
              style={styles.createButton}
            >
              <Plus size={20} color={Colors.light.white} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.content}>
        {/* Compact Categories */}
        <View style={styles.categoriesSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category.id && styles.categoryChipActive
                  ]}
                  onPress={() => setSelectedCategory(category.id as any)}
                >
                  <IconComponent 
                    size={14} 
                    color={selectedCategory === category.id ? Colors.light.white : Colors.light.textMedium} 
                  />
                  <Text style={[
                    styles.categoryChipText,
                    selectedCategory === category.id && styles.categoryChipTextActive
                  ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Progress Indicator for Active Plans */}
        {isLoggedIn && Array.isArray(activePrayerPlans) && activePrayerPlans.length > 0 && (
          <View style={styles.progressSection}>
            <Text style={styles.progressTitle}>{t('prayerPlans.yourProgress')}</Text>
            <View style={styles.progressCards}>
              {activePrayerPlans.slice(0, 2).map((userPlan) => {
                const plan = (prayerPlans || []).find(p => p.id === userPlan.planId);
                if (!plan) return null;
                
                const progress = (Array.isArray(userPlan.completedDays) ? userPlan.completedDays.length : 0) / plan.duration * 100;
                
                return (
                  <TouchableOpacity
                    key={userPlan.planId}
                    style={styles.progressCard}
                    onPress={() => router.push(`/prayer-plan/${userPlan.planId}`)}
                  >
                    <Text style={styles.progressCardTitle} numberOfLines={1}>{plan.title}</Text>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${progress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>
                      {t('prayerPlans.day')} {userPlan.currentDay || 1} {t('prayerPlans.of')} {plan.duration}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <ScrollView
          style={styles.plansList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {!isLoggedIn ? (
            <EmptyState
              icon="prayer"
              title={t('prayerPlans.joinPrayerPlans')}
              description={t('prayerPlans.signInToAccess')}
              actionText={t('auth.login')}
              onAction={() => router.push('/login')}
            />
          ) : filteredPlans.length === 0 ? (
            <EmptyState
              icon="prayer"
              title={t('prayerPlans.noPlansFound')}
              description={user?.organizationId ? t('prayerPlans.tryDifferentFilter') : 'Join an organization to see prayer plans'}
              actionText={canCreatePlan ? t('prayerPlans.createPlan') : undefined}
              onAction={canCreatePlan ? () => router.push('/prayer-plans/create') : undefined}
            />
          ) : (
            <View style={styles.plansGrid}>
              {filteredPlans.map((plan) => (
                <PrayerPlanCard key={plan.id} plan={plan} />
              ))}
            </View>
          )}
          
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  titleSection: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: 2,
  },
  quickStats: {
    marginTop: 2,
  },
  quickStatsText: {
    fontSize: 13,
    color: Colors.light.textMedium,
    fontWeight: '500',
  },
  createButton: {
    backgroundColor: Colors.light.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.small,
  },
  content: {
    flex: 1,
  },
  categoriesSection: {
    backgroundColor: Colors.light.background,
    paddingVertical: theme.spacing.sm,
  },
  categoriesContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    gap: theme.spacing.xs,
  },
  categoryChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.light.textMedium,
  },
  categoryChipTextActive: {
    color: Colors.light.white,
    fontWeight: '600',
  },
  progressSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: Colors.light.background,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  progressCards: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  progressCard: {
    flex: 1,
    backgroundColor: Colors.light.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  progressCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.light.borderLight,
    borderRadius: 2,
    marginBottom: theme.spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    color: Colors.light.textMedium,
    fontWeight: '500',
  },
  plansList: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  plansGrid: {
    gap: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  planCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  cardContent: {
    padding: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  planDescription: {
    fontSize: 13,
    color: Colors.light.textMedium,
    lineHeight: 18,
  },
  joinedBadge: {
    width: 20,
    height: 20,
    backgroundColor: Colors.light.success,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinedText: {
    fontSize: 10,
    color: Colors.light.white,
    fontWeight: '600',
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  metaText: {
    fontSize: 11,
    color: Colors.light.textMedium,
    fontWeight: '500',
  },
  categoryTag: {
    backgroundColor: Colors.light.primary + '15',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  actionButtonJoined: {
    backgroundColor: Colors.light.success,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.white,
  },
  actionButtonTextJoined: {
    color: Colors.light.white,
  },
  meetingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    gap: theme.spacing.xs,
  },
  meetingButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  bottomSpacing: {
    height: 120,
  },
});