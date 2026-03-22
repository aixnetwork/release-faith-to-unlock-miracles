import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Modal, Platform, Alert } from 'react-native';
import { X, Crown, Zap, Star, Gift, Check, ArrowRight, Sparkles, Heart, Shield } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';
import * as Haptics from 'expo-haptics';

interface SuperwallModalProps {
  visible: boolean;
  onClose: () => void;
  feature?: string;
  context?: 'trial' | 'feature_limit' | 'upgrade_prompt' | 'onboarding';
  title?: string;
  description?: string;
}

interface PlanOption {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  period: string;
  description: string;
  features: string[];
  icon: any;
  gradient: [string, string, string];
  popular?: boolean;
  isLifetime?: boolean;
  badge?: string;
  savings?: string;
}

export const SuperwallModal = ({ 
  visible, 
  onClose, 
  feature = 'premium features',
  context = 'upgrade_prompt',
  title,
  description 
}: SuperwallModalProps) => {
  const { plan: currentPlan, updatePlan } = useUserStore();
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [showAnnualDiscount, setShowAnnualDiscount] = useState(false);

  // Auto-show annual discount after 3 seconds
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        setShowAnnualDiscount(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const plans: PlanOption[] = [
    {
      id: 'premium',
      name: 'Premium',
      price: '$9.99',
      period: 'month',
      description: 'Perfect for dedicated believers',
      features: [
        'Unlimited prayer requests',
        'Advanced AI prayer assistant',
        'Mental health resources',
        'Custom prayer plans',
        'Priority support',
        'Advanced analytics',
        'External integrations',
        'Offline access'
      ],
      icon: Zap,
      gradient: [Colors.light.primary, Colors.light.primaryDark, '#002266'],
      popular: true,
    },
    {
      id: 'lifetime',
      name: 'Lifetime Access',
      price: '$199.99',
      originalPrice: '$299.99',
      period: 'one-time',
      description: 'Complete access forever',
      features: [
        'Everything in Premium',
        'Lifetime access guarantee',
        'Future updates included',
        'Exclusive member benefits',
        'No recurring payments',
        'Transfer to family',
        'Early feature access',
        'Lifetime community'
      ],
      icon: Gift,
      gradient: [Colors.light.warning, Colors.light.warningDark, '#B91C1C'],
      isLifetime: true,
      badge: 'LIMITED TIME',
      savings: 'Save $100',
    },
  ];

  const contextMessages = {
    trial: {
      title: title || 'Your Free Trial is Ending',
      description: description || `Continue enjoying ${feature} with a premium subscription.`,
      urgency: 'Only 2 days left in your trial',
    },
    feature_limit: {
      title: title || 'Unlock Premium Features',
      description: description || `You've reached the limit for ${feature}. Upgrade to continue.`,
      urgency: 'Upgrade now to continue',
    },
    upgrade_prompt: {
      title: title || 'Enhance Your Spiritual Journey',
      description: description || `Unlock ${feature} and transform your prayer life.`,
      urgency: 'Join thousands of believers',
    },
    onboarding: {
      title: title || 'Welcome to Release Faith',
      description: description || 'Start your spiritual journey with premium features.',
      urgency: 'Special launch pricing',
    },
  };

  const currentMessage = contextMessages[context];
  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  };

  const handleUpgrade = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Close modal first
    onClose();
    
    // Navigate to checkout with selected plan
    setTimeout(() => {
      router.push({
        pathname: '/checkout',
        params: { plan: selectedPlan }
      });
    }, 300);
  };

  const handleStartTrial = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    Alert.alert(
      'Free Trial Started!',
      'You now have 14 days of premium access. Enjoy all the features!',
      [
        {
          text: 'Get Started',
          onPress: () => {
            updatePlan('premium');
            onClose();
          }
        }
      ]
    );
  };

  const handleClose = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color={Colors.light.textMedium} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <LinearGradient
            colors={['#667eea', '#764ba2', '#f093fb'] as const}
            style={styles.heroSection}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.heroContent}>
              <Sparkles size={48} color={Colors.light.white} style={styles.heroIcon} />
              <Text style={styles.heroTitle}>{currentMessage.title}</Text>
              <Text style={styles.heroDescription}>{currentMessage.description}</Text>
              
              {context === 'trial' && (
                <View style={styles.urgencyBadge}>
                  <Text style={styles.urgencyText}>{currentMessage.urgency}</Text>
                </View>
              )}
            </View>
          </LinearGradient>

          {/* Social Proof */}
          <View style={styles.socialProof}>
            <View style={styles.socialProofItem}>
              <Heart size={20} color={Colors.light.error} />
              <Text style={styles.socialProofText}>
                <Text style={styles.socialProofNumber}>50,000+</Text> believers trust us
              </Text>
            </View>
            <View style={styles.socialProofItem}>
              <Star size={20} color={Colors.light.warning} />
              <Text style={styles.socialProofText}>
                <Text style={styles.socialProofNumber}>4.9</Text> app store rating
              </Text>
            </View>
            <View style={styles.socialProofItem}>
              <Shield size={20} color={Colors.light.success} />
              <Text style={styles.socialProofText}>
                <Text style={styles.socialProofNumber}>100%</Text> secure & private
              </Text>
            </View>
          </View>

          {/* Plan Selection */}
          <View style={styles.plansSection}>
            <Text style={styles.plansTitle}>Choose Your Plan</Text>
            
            {showAnnualDiscount && (
              <View style={styles.discountBanner}>
                <Text style={styles.discountText}>
                  💰 Limited Time: Save 33% with Lifetime Access!
                </Text>
              </View>
            )}

            <View style={styles.plansContainer}>
              {plans.map((plan) => {
                const Icon = plan.icon;
                const isSelected = selectedPlan === plan.id;
                
                return (
                  <TouchableOpacity
                    key={plan.id}
                    style={[
                      styles.planCard,
                      isSelected && styles.selectedPlanCard,
                      plan.popular && styles.popularPlanCard,
                    ]}
                    onPress={() => handleSelectPlan(plan.id)}
                    activeOpacity={0.8}
                  >
                    {plan.popular && (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularText}>MOST POPULAR</Text>
                      </View>
                    )}
                    
                    {plan.badge && (
                      <View style={styles.lifetimeBadge}>
                        <Text style={styles.lifetimeBadgeText}>{plan.badge}</Text>
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
                      
                      <View style={styles.planPricing}>
                        {plan.originalPrice && (
                          <Text style={styles.originalPrice}>{plan.originalPrice}</Text>
                        )}
                        <Text style={styles.planPrice}>{plan.price}</Text>
                        <Text style={styles.planPeriod}>/{plan.period}</Text>
                      </View>
                      
                      {plan.savings && (
                        <View style={styles.savingsBadge}>
                          <Text style={styles.savingsText}>{plan.savings}</Text>
                        </View>
                      )}
                    </LinearGradient>

                    <View style={styles.planBody}>
                      <Text style={styles.planDescription}>{plan.description}</Text>
                      
                      <View style={styles.featuresContainer}>
                        {plan.features.map((feature, index) => (
                          <View key={index} style={styles.featureRow}>
                            <Check size={16} color={Colors.light.success} />
                            <Text style={styles.featureText}>{feature}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {isSelected && (
                      <View style={styles.selectedIndicator}>
                        <Check size={20} color={Colors.light.white} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Testimonial */}
          <View style={styles.testimonial}>
            <Text style={styles.testimonialText}>
              "This app has transformed my prayer life. The AI suggestions are incredibly thoughtful and the community support is amazing."
            </Text>
            <Text style={styles.testimonialAuthor}>- Sarah M., Premium Member</Text>
          </View>

          {/* Money Back Guarantee */}
          <View style={styles.guarantee}>
            <Shield size={24} color={Colors.light.success} />
            <View style={styles.guaranteeContent}>
              <Text style={styles.guaranteeTitle}>30-Day Money-Back Guarantee</Text>
              <Text style={styles.guaranteeText}>
                Try risk-free. If you're not completely satisfied, get a full refund.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.bottomCTA}>
          {currentPlan === 'free' && context !== 'trial' && (
            <TouchableOpacity
              style={styles.trialButton}
              onPress={handleStartTrial}
              activeOpacity={0.8}
            >
              <Text style={styles.trialButtonText}>Start 14-Day Free Trial</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={handleUpgrade}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={selectedPlanData?.gradient || [Colors.light.primary, Colors.light.primaryDark, '#002266']}
              style={styles.upgradeButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.upgradeButtonText}>
                {selectedPlan === 'lifetime' 
                  ? `Get Lifetime Access - ${selectedPlanData?.price}` 
                  : `Upgrade to Premium - ${selectedPlanData?.price}/month`}
              </Text>
              <ArrowRight size={20} color={Colors.light.white} />
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            {selectedPlan === 'lifetime' 
              ? 'One-time payment. No recurring charges. Lifetime access guaranteed.'
              : 'Cancel anytime. No commitment required.'}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  closeButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: Colors.light.backgroundLight,
  },
  content: {
    flex: 1,
  },
  heroSection: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.lg,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroIcon: {
    marginBottom: theme.spacing.md,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.light.white,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  heroDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  urgencyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  urgencyText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.white,
  },
  socialProof: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    backgroundColor: Colors.light.card,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.small,
  },
  socialProofItem: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  socialProofText: {
    fontSize: 12,
    color: Colors.light.textMedium,
    textAlign: 'center',
  },
  socialProofNumber: {
    fontWeight: '700' as const,
    color: Colors.light.textPrimary,
  },
  plansSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  plansTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.light.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  discountBanner: {
    backgroundColor: Colors.light.warning + '20',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.warning + '40',
  },
  discountText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.warning,
    textAlign: 'center',
  },
  plansContainer: {
    gap: theme.spacing.lg,
  },
  planCard: {
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.light.border,
    position: 'relative',
    ...theme.shadows.medium,
  },
  selectedPlanCard: {
    borderColor: Colors.light.primary,
    transform: [{ scale: 1.02 }],
  },
  popularPlanCard: {
    borderColor: Colors.light.warning,
  },
  popularBadge: {
    position: 'absolute',
    top: theme.spacing.md,
    left: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: Colors.light.warning,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    zIndex: 1,
  },
  popularText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.light.white,
    textAlign: 'center',
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
  planHeader: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    paddingTop: theme.spacing.xxl,
  },
  planName: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.light.white,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  planPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: theme.spacing.sm,
  },
  originalPrice: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.6)',
    textDecorationLine: 'line-through',
    marginRight: theme.spacing.sm,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: '900' as const,
    color: Colors.light.white,
  },
  planPeriod: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  savingsBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.light.white,
  },
  planBody: {
    padding: theme.spacing.xl,
  },
  planDescription: {
    fontSize: 16,
    color: Colors.light.textMedium,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
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
  featureText: {
    fontSize: 14,
    color: Colors.light.textPrimary,
    flex: 1,
  },
  selectedIndicator: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  testimonial: {
    backgroundColor: Colors.light.card,
    margin: theme.spacing.lg,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
    ...theme.shadows.small,
  },
  testimonialText: {
    fontSize: 16,
    color: Colors.light.textPrimary,
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: theme.spacing.sm,
  },
  testimonialAuthor: {
    fontSize: 14,
    color: Colors.light.textMedium,
    fontWeight: '600' as const,
  },
  guarantee: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.success + '10',
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.md,
  },
  guaranteeContent: {
    flex: 1,
  },
  guaranteeTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.success,
    marginBottom: 4,
  },
  guaranteeText: {
    fontSize: 14,
    color: Colors.light.success,
    lineHeight: 18,
  },
  bottomCTA: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    backgroundColor: Colors.light.background,
    gap: theme.spacing.md,
  },
  trialButton: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  trialButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.primary,
  },
  upgradeButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  upgradeButtonGradient: {
    paddingVertical: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.light.white,
  },
  termsText: {
    fontSize: 12,
    color: Colors.light.textMedium,
    textAlign: 'center',
    lineHeight: 16,
  },
});