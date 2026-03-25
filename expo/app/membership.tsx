import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { Check, Crown, Users, Building, HelpCircle, BarChart3, MessageCircle, ArrowLeft, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';
import { PlanComparisonModal } from '@/components/PlanComparisonModal';
import { FAQModal } from '@/components/FAQModal';
import { useTranslation } from '@/utils/translations';


interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  period: string;
  description: string;
  features: PlanFeature[];
  icon: any;
  gradient: [string, string, string];
  popular?: boolean;
  isLifetime?: boolean;
  churchSize?: string;
  badge?: string;
}

export default function MembershipScreen() {
  const { plan: currentPlan, settings, user } = useUserStore();
  const [selectedPlan, setSelectedPlan] = useState<string>(currentPlan);
  const [showComparison, setShowComparison] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [isLoading] = useState(false);
  const { t } = useTranslation(settings.language);

  const isChurchUser = user?.organizationRole === 'admin' || ['small_church', 'large_church', 'org_small', 'org_medium', 'org_large'].includes(currentPlan);

  const plans: Plan[] = isChurchUser ? [
    {
      id: 'small_church',
      name: 'Small Church',
      price: '$149',
      period: 'month',
      description: 'Complete church management solution - everything in Group plan, plus AI sermon drafting, donor management, volunteer scheduling, event management, 10 marketplace listings, church analytics, and member management tools',
      churchSize: 'Up to 250 members',
      icon: Building,
      gradient: [Colors.light.success, Colors.light.successDark, '#047857'],
      features: [
        { text: 'Everything in Group/Family plan', included: true },
        { text: 'Up to 250 members', included: true },
        { text: 'AI sermon drafting & ministry planning', included: true },
        { text: 'AI devotional & content generation', included: true },
        { text: 'Donor management & giving analytics', included: true },
        { text: '10 marketplace service listings', included: true },
        { text: 'Volunteer scheduling & management', included: true },
        { text: 'Event management & RSVP tracking', included: true },
        { text: 'Church dashboard & member directory', included: true },
        { text: 'Church-wide announcements & notifications', included: true },
        { text: 'Prayer request moderation tools', included: true },
        { text: 'Member engagement analytics', included: true },
        { text: 'Basic reporting & insights', included: true },
        { text: 'Email & chat support', included: true },
        { text: 'Custom church branding (logo)', included: true },
      ],
    },
    {
      id: 'large_church',
      name: 'Large Church',
      price: '$499',
      period: 'month',
      description: 'Enterprise church solution - everything in Small Church, plus multi-campus management, advanced volunteer automation, unlimited marketplace listings, priority support, custom training, white-label branding, and dedicated success manager',
      churchSize: 'Unlimited members',
      icon: Building,
      gradient: [Colors.light.warning, Colors.light.warningDark, '#B91C1C'],
      features: [
        { text: 'Everything in Small Church plan', included: true },
        { text: 'Unlimited members & groups', included: true },
        { text: 'Multi-campus management dashboards', included: true },
        { text: 'Advanced volunteer & event automation', included: true },
        { text: 'Unlimited marketplace service listings', included: true },
        { text: 'Custom marketplace commission rates', included: true },
        { text: 'Priority support & onboarding', included: true },
        { text: 'Custom training & webinars', included: true },
        { text: 'Advanced analytics & reporting suite', included: true },
        { text: 'Advanced member segmentation & targeting', included: true },
        { text: 'Custom branding & white-label options', included: true },
        { text: 'Dedicated account manager', included: true },
        { text: 'API access for integrations', included: true },
        { text: 'Early access to new features', included: true },
        { text: 'Customizable workflows', included: true },
      ],
    },
  ] : [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started - basic prayer journal, limited daily practices, community access, basic Bible games, and prayer wall access',
      icon: Crown,
      gradient: [Colors.light.textMedium, Colors.light.textLight, '#6B7280'],
      features: [
        { text: 'Basic prayer journal', included: true },
        { text: 'Limited daily practices (3/day)', included: true },
        { text: 'Basic Bible games', included: true },
        { text: 'Community forum access', included: true },
        { text: 'Prayer wall access (view & pray)', included: true },
        { text: 'Basic achievements', included: true },
        { text: 'Habit tracking (1 habit)', included: true },
        { text: 'AI prayer assistant', included: false },
        { text: 'MIRACLE prayer templates', included: false },
        { text: 'Advanced features', included: false },
      ],
    },
    {
      id: 'individual',
      name: 'Individual',
      price: '$9.99',
      period: 'month',
      description: 'Complete personal growth package with AI-powered prayer assistance, MIRACLE prayer templates, unlimited habits, prayer wall participation, daily devotionals, and full marketplace access',
      icon: Crown,
      gradient: [Colors.light.primary, Colors.light.primaryDark, '#002266'],
      popular: true,
      features: [
        { text: 'Everything in Free plan', included: true },
        { text: 'AI prayer assistant (unlimited)', included: true },
        { text: 'MIRACLE prayer templates (9 categories)', included: true },
        { text: 'Unlimited habit tracking', included: true },
        { text: 'Prayer wall (post & manage prayers)', included: true },
        { text: 'Daily devotional generator', included: true },
        { text: 'Scripture insights & AI commentary', included: true },
        { text: 'Prayer streak tracking & reminders', included: true },
        { text: 'Advanced achievements & badges', included: true },
        { text: 'Mental health resources', included: true },
        { text: 'Multilingual content', included: true },
        { text: 'Full marketplace access (browse & purchase)', included: true },
        { text: 'Interactive Bible games (all levels)', included: true },
        { text: 'Testimonial sharing', included: true },
      ],
    },
    {
      id: 'group_family',
      name: 'Group/Family',
      price: '$19.99',
      period: 'month',
      description: 'Perfect for families & small groups - everything in Individual, plus shared prayer boards, virtual group meetings, collaborative Bible games, group devotionals, prayer plans, and unified habit tracking',
      churchSize: 'Up to 10 users',
      icon: Users,
      gradient: [Colors.light.secondary, Colors.light.secondaryDark, '#4C1D95'],
      features: [
        { text: 'Everything in Individual plan', included: true },
        { text: 'Up to 10 family members/users', included: true },
        { text: 'Shared family prayer boards', included: true },
        { text: 'Group prayer plans & challenges', included: true },
        { text: 'Virtual family meetings & group video calls', included: true },
        { text: 'Collaborative family Bible games', included: true },
        { text: 'Group devotionals and study plans', included: true },
        { text: 'Family prayer request sharing & updates', included: true },
        { text: 'Shared habit tracking & accountability', included: true },
        { text: 'Group admin dashboard', included: true },
        { text: 'Shared achievements & milestones', included: true },
        { text: 'Family testimonial collection', included: true },
        { text: 'Group chat & messaging', included: true },
        { text: 'Church admin features', included: false },
        { text: 'Marketplace listings', included: false },
      ],
    },
  ];

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId as any);
  };

  const handleUpgrade = async () => {
    if (selectedPlan === currentPlan) {
      Alert.alert('Current Plan', 'This is your current plan!');
      return;
    }

    console.log('🚀 Starting plan upgrade/change process');
    console.log('Current plan:', currentPlan);
    console.log('Selected plan:', selectedPlan);

    if (currentPlan === 'free') {
      console.log('📝 Free plan user, navigating to checkout');
      router.push({
        pathname: '/checkout',
        params: { plan: selectedPlan }
      });
      return;
    }

    console.log('📝 Navigating to checkout');
    router.push({
      pathname: '/checkout',
      params: { plan: selectedPlan }
    });
  };

  const handleBottomMenuAction = (action: string) => {
    switch (action) {
      case 'faq':
        setShowFAQ(true);
        break;
      case 'compare':
        setShowComparison(true);
        break;
      case 'support':
        router.push('/settings/contact');
        break;
      case 'back':
        router.back();
        break;
      default:
        break;
    }
  };

  const isCurrentPlan = (planId: string) => planId === currentPlan;
  const isSelectedPlan = (planId: string) => planId === selectedPlan;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: isChurchUser ? 'Church Plans' : 'Membership Plans',
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: Colors.light.text,
        }}
      />

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            {isChurchUser ? 'Church Membership Pricing' : 'Faith Membership Pricing'}
          </Text>
          <Text style={styles.subtitle}>
            {isChurchUser 
              ? 'Choose the perfect church plan to manage your congregation and grow your ministry'
              : 'Choose the perfect plan to grow your faith with AI-powered tools and community'
            }
          </Text>
          <View style={styles.competitiveNote}>
            <Text style={styles.competitiveText}>
              💡 All plans can be canceled anytime with no long-term contracts
            </Text>
          </View>
          {!isChurchUser && (
            <TouchableOpacity 
              style={styles.switchLink}
              onPress={() => router.push('/register-org')}
            >
              <Text style={styles.switchLinkText}>
                Looking for church plans? Register your organization →
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.plansContainer}>
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = isCurrentPlan(plan.id);
            const isSelected = isSelectedPlan(plan.id);
            
            return (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  isSelected && styles.selectedPlan,
                  isCurrent && styles.currentPlan,
                  plan.isLifetime && styles.lifetimePlan,
                ]}
                onPress={() => handleSelectPlan(plan.id)}
                activeOpacity={0.8}
              >
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>{t('plans.popular')}</Text>
                  </View>
                )}
                
                {plan.badge && (
                  <View style={styles.lifetimeBadge}>
                    <Text style={styles.lifetimeBadgeText}>{plan.badge}</Text>
                  </View>
                )}
                
                {isCurrent && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentText}>{t('plans.current')}</Text>
                  </View>
                )}

                <LinearGradient
                  colors={plan.gradient}
                  style={styles.planHeader}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Icon size={32} color={Colors.light.white} />
                  <Text style={styles.planName}>{plan.name}</Text>
                  <View style={styles.priceContainer}>
                    {plan.originalPrice && (
                      <Text style={styles.originalPrice}>{plan.originalPrice}</Text>
                    )}
                    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                      <Text style={styles.planPrice}>{plan.price}</Text>
                      <Text style={styles.planPeriod}>/{plan.period}</Text>
                    </View>
                  </View>
                  {plan.churchSize && (
                    <Text style={styles.churchSize}>{plan.churchSize}</Text>
                  )}
                  {plan.isLifetime && (
                    <View style={styles.lifetimeFeature}>
                      <Star size={16} color={Colors.light.white} />
                      <Text style={styles.lifetimeFeatureText}>No recurring payments</Text>
                    </View>
                  )}
                </LinearGradient>

                <View style={styles.planBody}>
                  <Text style={styles.planDescription}>{plan.description}</Text>
                  
                  <View style={styles.featuresContainer}>
                    {plan.features.map((feature, index) => (
                      <View key={index} style={styles.featureRow}>
                        <View style={[
                          styles.featureIcon,
                          { backgroundColor: feature.included ? Colors.light.success : '#E0E0E0' }
                        ]}>
                          <Check 
                            size={12} 
                            color={feature.included ? Colors.light.white : '#999'} 
                          />
                        </View>
                        <Text style={[
                          styles.featureText,
                          !feature.included && styles.featureTextDisabled
                        ]}>
                          {feature.text}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.upgradeButton,
              (selectedPlan === currentPlan || isLoading) && styles.upgradeButtonDisabled
            ]}
            onPress={handleUpgrade}
            disabled={selectedPlan === currentPlan || isLoading}
          >
            <LinearGradient
              colors={(selectedPlan === currentPlan || isLoading) ? [Colors.light.textLight, Colors.light.textMedium, '#94A3B8'] as const : 
                     selectedPlan === 'large_church' ? [Colors.light.warning, Colors.light.warningDark, '#B91C1C'] as const :
                     [Colors.light.primary, Colors.light.primaryDark, '#002266'] as const}
              style={styles.upgradeButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.light.white} size="small" />
              ) : (
                <Text style={styles.upgradeButtonText}>
                  {selectedPlan === currentPlan ? t('plans.current') : 
                   selectedPlan === 'large_church' ? 'Unlock Unlimited Growth' :
                   t('plans.upgrade')}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={styles.footerNote}>
            All plans can be canceled anytime with no long-term contracts. Start your faith journey today.
          </Text>
          
          <View style={styles.differentiators}>
            <Text style={styles.differentiatorsTitle}>🔑 Key Features</Text>
            {isChurchUser ? (
              <>
                <Text style={styles.differentiatorText}>• Complete church management and member engagement</Text>
                <Text style={styles.differentiatorText}>• AI-powered sermon drafting and content generation</Text>
                <Text style={styles.differentiatorText}>• Donor management and giving analytics</Text>
                <Text style={styles.differentiatorText}>• Marketplace service listings for revenue generation</Text>
              </>
            ) : (
              <>
                <Text style={styles.differentiatorText}>• AI-powered prayer assistance and spiritual guidance</Text>
                <Text style={styles.differentiatorText}>• Interactive Bible games and daily practices</Text>
                <Text style={styles.differentiatorText}>• Global community forums and family sharing</Text>
                <Text style={styles.differentiatorText}>• Full marketplace access (browse & purchase services)</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <View style={styles.bottomMenu}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.98)'] as const}
          style={styles.bottomMenuGradient}
        >
          <View style={styles.bottomMenuContent}>
            <TouchableOpacity
              style={styles.bottomMenuItem}
              onPress={() => handleBottomMenuAction('back')}
              activeOpacity={0.7}
            >
              <ArrowLeft size={20} color={Colors.light.textMedium} />
              <Text style={styles.bottomMenuText}>{t('common.back')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bottomMenuItem}
              onPress={() => handleBottomMenuAction('faq')}
              activeOpacity={0.7}
            >
              <HelpCircle size={20} color={Colors.light.textMedium} />
              <Text style={styles.bottomMenuText}>{t('help.faq')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bottomMenuItem}
              onPress={() => handleBottomMenuAction('compare')}
              activeOpacity={0.7}
            >
              <BarChart3 size={20} color={Colors.light.textMedium} />
              <Text style={styles.bottomMenuText}>{t('plans.compare')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bottomMenuItem}
              onPress={() => handleBottomMenuAction('support')}
              activeOpacity={0.7}
            >
              <MessageCircle size={20} color={Colors.light.textMedium} />
              <Text style={styles.bottomMenuText}>Support</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <PlanComparisonModal
        visible={showComparison}
        onClose={() => setShowComparison(false)}
        onSelectPlan={handleSelectPlan}
        currentPlan={currentPlan}
      />

      <FAQModal
        visible={showFAQ}
        onClose={() => setShowFAQ(false)}
      />
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
  title: {
    ...theme.typography.title,
    fontSize: 28,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.body,
    color: Colors.light.textMedium,
    textAlign: 'center',
    lineHeight: 22,
  },
  plansContainer: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  planCard: {
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    position: 'relative',
    ...theme.shadows.medium,
  },
  selectedPlan: {
    borderColor: Colors.light.primary,
    transform: [{ scale: 1.02 }],
  },
  currentPlan: {
    borderColor: Colors.light.success,
  },
  lifetimePlan: {
    borderColor: Colors.light.warning,
  },
  popularBadge: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: Colors.light.warning,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    zIndex: 1,
  },
  popularText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.light.white,
  },
  lifetimeBadge: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: Colors.light.error,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    zIndex: 1,
  },
  lifetimeBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.light.white,
  },
  currentBadge: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: Colors.light.success,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    zIndex: 1,
  },
  currentText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.light.white,
  },
  planHeader: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  planName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.light.white,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: theme.spacing.sm,
  },
  originalPrice: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.6)',
    textDecorationLine: 'line-through',
    marginRight: theme.spacing.sm,
  },
  planPrice: {
    fontSize: 36,
    fontWeight: '900' as const,
    color: Colors.light.white,
  },
  planPeriod: {
    fontSize: 16,
    color: Colors.light.white,
    opacity: 0.8,
  },
  churchSize: {
    fontSize: 14,
    color: Colors.light.white,
    opacity: 0.9,
    fontWeight: '600' as const,
  },
  lifetimeFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.sm,
    gap: 4,
  },
  lifetimeFeatureText: {
    fontSize: 12,
    color: Colors.light.white,
    fontWeight: '600' as const,
  },
  planBody: {
    padding: theme.spacing.xl,
  },
  planDescription: {
    ...theme.typography.body,
    color: Colors.light.textMedium,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  featuresContainer: {
    gap: theme.spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  featureIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    ...theme.typography.body,
    flex: 1,
  },
  featureTextDisabled: {
    color: Colors.light.textLight,
    textDecorationLine: 'line-through',
  },
  footer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  upgradeButton: {
    width: '100%',
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  upgradeButtonDisabled: {
    opacity: 0.6,
  },
  upgradeButtonGradient: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.white,
  },
  footerNote: {
    ...theme.typography.caption,
    color: Colors.light.textMedium,
    textAlign: 'center',
    lineHeight: 18,
  },
  bottomSpacing: {
    height: 100,
  },
  bottomMenu: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    ...theme.shadows.large,
  },
  bottomMenuGradient: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  bottomMenuContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  bottomMenuItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    minWidth: 60,
  },
  bottomMenuText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.light.textMedium,
    marginTop: 4,
    textAlign: 'center',
  },
  competitiveNote: {
    backgroundColor: Colors.light.success + '20',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
  },
  competitiveText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.success,
    textAlign: 'center',
  },
  differentiators: {
    backgroundColor: Colors.light.primary + '10',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.lg,
  },
  differentiatorsTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.light.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  differentiatorText: {
    fontSize: 14,
    color: Colors.light.textMedium,
    lineHeight: 20,
    marginBottom: theme.spacing.xs,
  },
  switchLink: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.sm,
  },
  switchLinkText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
});
