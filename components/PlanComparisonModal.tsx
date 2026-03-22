import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { X, Check, Crown, Zap, Users, Building } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';

interface PlanFeature {
  name: string;
  free: boolean | string;
  premium: boolean | string;
  orgSmall: boolean | string;
  orgMedium: boolean | string;
  orgLarge: boolean | string;
}

interface PlanComparisonModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectPlan: (planId: string) => void;
  currentPlan: string;
}

const planFeatures: PlanFeature[] = [
  {
    name: 'Personal prayer requests',
    free: true,
    premium: true,
    orgSmall: true,
    orgMedium: true,
    orgLarge: true,
  },
  {
    name: 'Basic AI prayer generator',
    free: true,
    premium: true,
    orgSmall: true,
    orgMedium: true,
    orgLarge: true,
  },
  {
    name: 'Community prayer wall',
    free: true,
    premium: true,
    orgSmall: true,
    orgMedium: true,
    orgLarge: true,
  },
  {
    name: 'Daily inspiration',
    free: true,
    premium: true,
    orgSmall: true,
    orgMedium: true,
    orgLarge: true,
  },
  {
    name: 'Prayer streak tracking',
    free: true,
    premium: true,
    orgSmall: true,
    orgMedium: true,
    orgLarge: true,
  },
  {
    name: 'Mental health resources',
    free: false,
    premium: true,
    orgSmall: true,
    orgMedium: true,
    orgLarge: true,
  },
  {
    name: 'Custom prayer plans',
    free: false,
    premium: true,
    orgSmall: true,
    orgMedium: true,
    orgLarge: true,
  },
  {
    name: 'Advanced AI features',
    free: false,
    premium: true,
    orgSmall: true,
    orgMedium: true,
    orgLarge: true,
  },
  {
    name: 'External integrations',
    free: false,
    premium: true,
    orgSmall: true,
    orgMedium: true,
    orgLarge: true,
  },
  {
    name: 'Unlimited prayer requests',
    free: false,
    premium: true,
    orgSmall: true,
    orgMedium: true,
    orgLarge: true,
  },
  {
    name: 'Priority support',
    free: false,
    premium: true,
    orgSmall: false,
    orgMedium: true,
    orgLarge: true,
  },
  {
    name: 'Organization dashboard',
    free: false,
    premium: false,
    orgSmall: true,
    orgMedium: true,
    orgLarge: true,
  },
  {
    name: 'Member management',
    free: false,
    premium: false,
    orgSmall: true,
    orgMedium: true,
    orgLarge: true,
  },
  {
    name: 'Group prayer requests',
    free: false,
    premium: false,
    orgSmall: true,
    orgMedium: true,
    orgLarge: true,
  },
  {
    name: 'Custom branding',
    free: false,
    premium: false,
    orgSmall: true,
    orgMedium: true,
    orgLarge: true,
  },
  {
    name: 'Advanced analytics',
    free: false,
    premium: false,
    orgSmall: false,
    orgMedium: true,
    orgLarge: true,
  },
  {
    name: 'Custom integrations',
    free: false,
    premium: false,
    orgSmall: false,
    orgMedium: true,
    orgLarge: true,
  },
  {
    name: 'White-label options',
    free: false,
    premium: false,
    orgSmall: false,
    orgMedium: false,
    orgLarge: true,
  },
  {
    name: 'Dedicated support',
    free: false,
    premium: false,
    orgSmall: false,
    orgMedium: false,
    orgLarge: true,
  },
  {
    name: 'SLA guarantee',
    free: false,
    premium: false,
    orgSmall: false,
    orgMedium: false,
    orgLarge: true,
  },
];

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    icon: Crown,
    color: Colors.light.textMedium,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$9.99',
    period: 'month',
    icon: Zap,
    color: Colors.light.primary,
    popular: true,
  },
  {
    id: 'org_small',
    name: 'Small Church',
    price: '$49',
    period: 'month',
    icon: Users,
    color: Colors.light.secondary,
    subtitle: 'Up to 100 members',
  },
  {
    id: 'org_medium',
    name: 'Medium Church',
    price: '$99',
    period: 'month',
    icon: Building,
    color: Colors.light.success,
    subtitle: 'Up to 500 members',
  },
  {
    id: 'org_large',
    name: 'Large Church',
    price: '$199',
    period: 'month',
    icon: Building,
    color: Colors.light.warning,
    subtitle: 'Unlimited members',
  },
];

export const PlanComparisonModal = ({ visible, onClose, onSelectPlan, currentPlan }: PlanComparisonModalProps) => {
  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check size={16} color={Colors.light.success} />
      ) : (
        <View style={styles.noFeature}>
          <Text style={styles.noFeatureText}>—</Text>
        </View>
      );
    }
    return <Text style={styles.featureValueText}>{value}</Text>;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Compare Plans</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.light.textMedium} />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.plansScroll}>
          <View style={styles.comparisonTable}>
            {/* Plan Headers */}
            <View style={styles.planHeaders}>
              <View style={styles.featureNameColumn}>
                <Text style={styles.featuresTitle}>Features</Text>
              </View>
              {plans.map((plan) => {
                const Icon = plan.icon;
                const isCurrentPlan = currentPlan === plan.id;
                
                return (
                  <View key={plan.id} style={styles.planColumn}>
                    <View style={[styles.planHeader, isCurrentPlan && styles.currentPlanHeader]}>
                      {plan.popular && (
                        <View style={styles.popularBadge}>
                          <Text style={styles.popularText}>Popular</Text>
                        </View>
                      )}
                      {isCurrentPlan && (
                        <View style={styles.currentBadge}>
                          <Text style={styles.currentText}>Current</Text>
                        </View>
                      )}
                      <Icon size={24} color={plan.color} style={styles.planIcon} />
                      <Text style={styles.planName}>{plan.name}</Text>
                      {plan.subtitle && (
                        <Text style={styles.planSubtitle}>{plan.subtitle}</Text>
                      )}
                      <View style={styles.planPricing}>
                        <Text style={styles.planPrice}>{plan.price}</Text>
                        <Text style={styles.planPeriod}>/{plan.period}</Text>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.selectButton,
                          isCurrentPlan && styles.currentSelectButton,
                          { borderColor: plan.color }
                        ]}
                        onPress={() => onSelectPlan(plan.id)}
                        disabled={isCurrentPlan}
                      >
                        <Text style={[
                          styles.selectButtonText,
                          isCurrentPlan && styles.currentSelectButtonText,
                          { color: isCurrentPlan ? Colors.light.textMedium : plan.color }
                        ]}>
                          {isCurrentPlan ? 'Current' : 'Select'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Feature Rows */}
            {planFeatures.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <View style={styles.featureNameColumn}>
                  <Text style={styles.featureName}>{feature.name}</Text>
                </View>
                <View style={styles.planColumn}>
                  <View style={styles.featureValue}>
                    {renderFeatureValue(feature.free)}
                  </View>
                </View>
                <View style={styles.planColumn}>
                  <View style={styles.featureValue}>
                    {renderFeatureValue(feature.premium)}
                  </View>
                </View>
                <View style={styles.planColumn}>
                  <View style={styles.featureValue}>
                    {renderFeatureValue(feature.orgSmall)}
                  </View>
                </View>
                <View style={styles.planColumn}>
                  <View style={styles.featureValue}>
                    {renderFeatureValue(feature.orgMedium)}
                  </View>
                </View>
                <View style={styles.planColumn}>
                  <View style={styles.featureValue}>
                    {renderFeatureValue(feature.orgLarge)}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerNote}>
            All plans include a 14-day free trial. Cancel anytime.
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  plansScroll: {
    flex: 1,
  },
  comparisonTable: {
    minWidth: 800,
  },
  planHeaders: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.border,
  },
  featureNameColumn: {
    width: 200,
    padding: theme.spacing.md,
    justifyContent: 'center',
  },
  planColumn: {
    width: 120,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  planHeader: {
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: Colors.light.card,
    position: 'relative',
    minHeight: 180,
    justifyContent: 'space-between',
  },
  currentPlanHeader: {
    borderWidth: 2,
    borderColor: Colors.light.success,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    backgroundColor: Colors.light.warning,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.white,
  },
  currentBadge: {
    position: 'absolute',
    top: -8,
    backgroundColor: Colors.light.success,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  currentText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.white,
  },
  planIcon: {
    marginBottom: theme.spacing.xs,
  },
  planName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    textAlign: 'center',
  },
  planSubtitle: {
    fontSize: 10,
    color: Colors.light.textLight,
    textAlign: 'center',
    marginTop: 2,
  },
  planPricing: {
    alignItems: 'center',
    marginVertical: theme.spacing.xs,
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  planPeriod: {
    fontSize: 12,
    color: Colors.light.textLight,
  },
  selectButton: {
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    minWidth: 60,
  },
  currentSelectButton: {
    backgroundColor: Colors.light.backgroundLight,
  },
  selectButtonText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  currentSelectButtonText: {
    color: Colors.light.textMedium,
  },
  featureRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
    minHeight: 50,
  },
  featureName: {
    fontSize: 14,
    color: Colors.light.textPrimary,
    lineHeight: 18,
  },
  featureValue: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  featureValueText: {
    fontSize: 12,
    color: Colors.light.textMedium,
    textAlign: 'center',
  },
  noFeature: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noFeatureText: {
    fontSize: 16,
    color: Colors.light.textLight,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    alignItems: 'center',
  },
  footerNote: {
    fontSize: 12,
    color: Colors.light.textLight,
    textAlign: 'center',
  },
});