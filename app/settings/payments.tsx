import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Modal, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { CreditCard, DollarSign, Settings, ArrowRight, Shield, Bell, HelpCircle, FileText, Crown } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';
import * as Haptics from 'expo-haptics';
import PaymentManager from '@/components/PaymentManager';

export default function PaymentSettingsScreen() {
  const { isLoggedIn, plan } = useUserStore();
  const [showPaymentManager, setShowPaymentManager] = useState(false);

  const handleOpenPaymentManager = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setShowPaymentManager(true);
  };

  const handleClosePaymentManager = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setShowPaymentManager(false);
  };

  const handleUpgradePlan = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/membership');
  };

  const handleBillingHistory = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/settings/billing');
  };

  const handlePaymentNotifications = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/settings/notifications');
  };

  const handlePaymentHelp = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/settings/help');
  };

  const getPlanDisplayName = () => {
    switch (plan) {
      case 'premium': return 'Premium Plan';
      case 'pro': return 'Pro Plan';
      case 'lifetime': return 'Lifetime Access';
      case 'org_small': return 'Small Church Plan';
      case 'org_medium': return 'Medium Church Plan';
      case 'org_large': return 'Large Church Plan';
      default: return 'Free Plan';
    }
  };

  const getPlanPrice = () => {
    switch (plan) {
      case 'premium': return '$9.99/month';
      case 'pro': return '$9.99/month';
      case 'lifetime': return '$199.99 (one-time)';
      case 'org_small': return '$299/year';
      case 'org_medium': return '$599/year';
      case 'org_large': return '$999/year';
      default: return 'Free';
    }
  };

  if (!isLoggedIn) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Stack.Screen options={{ title: 'Payment Settings' }} />
        <Text style={styles.errorText}>Please log in to access payment settings</Text>
        <Button
          title="Go to Login"
          onPress={() => router.push('/login')}
          style={styles.loginButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Payment Settings' }} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Plan Card */}
        <View style={styles.currentPlanCard}>
          <View style={styles.planHeader}>
            <Crown size={24} color={plan === 'free' ? Colors.light.textMedium : Colors.light.primary} />
            <View style={styles.planInfo}>
              <Text style={styles.planName}>{getPlanDisplayName()}</Text>
              <Text style={styles.planPrice}>{getPlanPrice()}</Text>
            </View>
            {plan !== 'free' && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Active</Text>
              </View>
            )}
          </View>
          
          {plan === 'free' ? (
            <Text style={styles.planDescription}>
              Upgrade to unlock premium features and enhanced functionality
            </Text>
          ) : (
            <Text style={styles.planDescription}>
              You have access to all {getPlanDisplayName()} features
            </Text>
          )}
          
          <Button
            title={plan === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
            onPress={plan === 'free' ? handleUpgradePlan : handleOpenPaymentManager}
            style={styles.planButton}
            icon={plan === 'free' ? <Crown size={16} color={Colors.light.white} /> : <Settings size={16} color={Colors.light.white} />}
          />
        </View>

        {/* Payment Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment & Billing</Text>
          
          <TouchableOpacity
            style={styles.optionCard}
            onPress={handleOpenPaymentManager}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <CreditCard size={20} color={Colors.light.primary} />
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Payment Methods</Text>
                <Text style={styles.optionDescription}>
                  Manage your credit cards and PayPal accounts
                </Text>
              </View>
            </View>
            <ArrowRight size={16} color={Colors.light.textMedium} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={handleBillingHistory}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <FileText size={20} color={Colors.light.primary} />
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Billing History</Text>
                <Text style={styles.optionDescription}>
                  View and download your invoices
                </Text>
              </View>
            </View>
            <ArrowRight size={16} color={Colors.light.textMedium} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={handlePaymentNotifications}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <Bell size={20} color={Colors.light.primary} />
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Payment Notifications</Text>
                <Text style={styles.optionDescription}>
                  Configure billing and payment alerts
                </Text>
              </View>
            </View>
            <ArrowRight size={16} color={Colors.light.textMedium} />
          </TouchableOpacity>
        </View>

        {/* Security & Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security & Support</Text>
          
          <View style={styles.securityCard}>
            <Shield size={20} color={Colors.light.success} />
            <View style={styles.securityContent}>
              <Text style={styles.securityTitle}>Secure Payments</Text>
              <Text style={styles.securityText}>
                All payments are processed securely through Stripe and PayPal with industry-standard encryption
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={handlePaymentHelp}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <HelpCircle size={20} color={Colors.light.primary} />
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Payment Help</Text>
                <Text style={styles.optionDescription}>
                  Get help with billing and payment issues
                </Text>
              </View>
            </View>
            <ArrowRight size={16} color={Colors.light.textMedium} />
          </TouchableOpacity>
        </View>

        {/* Supported Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Supported Payment Methods</Text>
          
          <View style={styles.paymentMethodsGrid}>
            <View style={styles.supportedMethodCard}>
              <CreditCard size={24} color={Colors.light.primary} />
              <Text style={styles.supportedMethodTitle}>Credit Cards</Text>
              <Text style={styles.supportedMethodText}>Visa, Mastercard, American Express</Text>
            </View>
            
            <View style={styles.supportedMethodCard}>
              <View style={styles.paypalIconLarge}>
                <Text style={styles.paypalTextLarge}>PayPal</Text>
              </View>
              <Text style={styles.supportedMethodTitle}>PayPal</Text>
              <Text style={styles.supportedMethodText}>PayPal account or linked bank</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Payment Manager Modal */}
      <Modal
        visible={showPaymentManager}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClosePaymentManager}
      >
        <PaymentManager onClose={handleClosePaymentManager} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  currentPlanCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.medium,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.light.textPrimary,
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.primary,
  },
  activeBadge: {
    backgroundColor: Colors.light.success + '15',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.light.success,
  },
  planDescription: {
    fontSize: 14,
    color: Colors.light.textMedium,
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  planButton: {
    marginBottom: 0,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  optionCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...theme.shadows.small,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.md,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.textPrimary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.light.textMedium,
    lineHeight: 18,
  },
  securityCard: {
    backgroundColor: Colors.light.success + '10',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.success + '20',
  },
  securityContent: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.success,
    marginBottom: 4,
  },
  securityText: {
    fontSize: 14,
    color: Colors.light.success,
    lineHeight: 18,
    opacity: 0.9,
  },
  paymentMethodsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  supportedMethodCard: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  supportedMethodTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.textPrimary,
    marginTop: theme.spacing.sm,
    marginBottom: 4,
  },
  supportedMethodText: {
    fontSize: 12,
    color: Colors.light.textMedium,
    textAlign: 'center',
    lineHeight: 16,
  },
  paypalIconLarge: {
    backgroundColor: '#0070ba',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  paypalTextLarge: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700' as const,
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.error,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  loginButton: {
    marginBottom: 0,
  },
});