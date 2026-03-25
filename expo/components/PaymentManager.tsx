import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { CreditCard, Trash2, Calendar, CheckCircle, AlertCircle, RefreshCw, Star, Crown, DollarSign } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';
import * as Haptics from 'expo-haptics';
import { trpc } from '@/lib/trpc';
import { LinearGradient } from 'expo-linear-gradient';

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal';
  provider: 'stripe' | 'paypal';
  last4?: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
  email?: string;
  isDefault: boolean;
  createdAt: string;
}

interface Subscription {
  id: string;
  planId: string;
  planName: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'completed';
  amount: number;
  currency: string;
  interval: 'month' | 'year' | null;
  intervalCount: number | null;
  provider: 'stripe' | 'paypal';
  currentPeriodStart: string;
  currentPeriodEnd: string | null;
  trialStart: string | null;
  trialEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  createdAt: string;
  paymentMethodId: string;
}

interface PaymentManagerProps {
  onClose?: () => void;
}

export default function PaymentManager({ onClose }: PaymentManagerProps) {
  const { isLoggedIn, updatePlan } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'methods' | 'subscription'>('overview');

  // tRPC queries
  const paymentMethodsQuery = trpc.payments.getPaymentMethods.useQuery(undefined, {
    enabled: isLoggedIn,
  });

  const subscriptionStatusQuery = trpc.payments.getSubscriptionStatus.useQuery(undefined, {
    enabled: isLoggedIn,
  });

  // tRPC mutations
  const addPaymentMethodMutation = trpc.payments.addPaymentMethod.useMutation();
  const removePaymentMethodMutation = trpc.stripe.removePaymentMethod.useMutation();
  const setDefaultPaymentMethodMutation = trpc.stripe.setDefaultPaymentMethod.useMutation();
  const cancelSubscriptionMutation = trpc.stripe.cancelSubscription.useMutation();
  // const updateSubscriptionMutation = trpc.stripe.updateSubscription.useMutation();

  useEffect(() => {
    if (paymentMethodsQuery.data?.success) {
      setPaymentMethods(paymentMethodsQuery.data.paymentMethods);
    }
  }, [paymentMethodsQuery.data]);

  useEffect(() => {
    if (subscriptionStatusQuery.data?.success) {
      setSubscription(subscriptionStatusQuery.data.subscription);
    }
  }, [subscriptionStatusQuery.data]);

  const handleRefresh = async () => {
    setRefreshing(true);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    try {
      await Promise.all([
        paymentMethodsQuery.refetch(),
        subscriptionStatusQuery.refetch(),
      ]);
    } catch (error) {
      console.error('Error refreshing payment data:', error);
      Alert.alert('Error', 'Failed to refresh payment data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddStripeCard = async () => {
    setLoading(true);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    try {
      // In a real app, you would open Stripe's payment sheet here
      // For demo purposes, we'll simulate adding a card
      const result = await addPaymentMethodMutation.mutateAsync({
        provider: 'stripe',
        paymentMethodId: `pm_mock_${Date.now()}`,
        setAsDefault: paymentMethods.length === 0,
      });

      if (result.success) {
        Alert.alert('Success', result.message);
        await paymentMethodsQuery.refetch();
      } else {
        throw new Error('Failed to process request');
      }
    } catch (error) {
      console.error('Error adding Stripe card:', error);
      Alert.alert('Error', 'Failed to add card. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayPal = async () => {
    setLoading(true);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    try {
      // In a real app, you would integrate with PayPal SDK here
      const result = await addPaymentMethodMutation.mutateAsync({
        provider: 'paypal',
        email: 'user@example.com', // This would come from PayPal auth
        setAsDefault: paymentMethods.length === 0,
      });

      if (result.success) {
        Alert.alert('Success', result.message);
        await paymentMethodsQuery.refetch();
      } else {
        throw new Error('Failed to process request');
      }
    } catch (error) {
      console.error('Error adding PayPal:', error);
      Alert.alert('Error', 'Failed to add PayPal account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePaymentMethod = (paymentMethod: PaymentMethod) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    
    Alert.alert(
      'Remove Payment Method',
      `Are you sure you want to remove this ${paymentMethod.type === 'card' ? 'card' : 'PayPal account'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            
            try {
              const result = await removePaymentMethodMutation.mutateAsync({
                paymentMethodId: paymentMethod.id,
              });

              if (result.success) {
                Alert.alert('Success', 'Payment method removed successfully');
                await paymentMethodsQuery.refetch();
              } else {
                throw new Error('Failed to process request');
              }
            } catch (error) {
              console.error('Error removing payment method:', error);
              Alert.alert('Error', 'Failed to remove payment method. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSetDefaultPaymentMethod = async (paymentMethodId: string) => {
    setLoading(true);
    
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    
    try {
      const result = await setDefaultPaymentMethodMutation.mutateAsync({
        paymentMethodId,
      });

      if (result.success) {
        Alert.alert('Success', 'Default payment method updated');
        await paymentMethodsQuery.refetch();
      } else {
        throw new Error('Failed to process request');
      }
    } catch (error) {
      console.error('Error setting default payment method:', error);
      Alert.alert('Error', 'Failed to update default payment method. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = () => {
    if (!subscription) return;
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You\'ll lose access to premium features at the end of your billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            
            try {
              const result = await cancelSubscriptionMutation.mutateAsync();

              if (result.success) {
                Alert.alert('Subscription Cancelled', 'Your subscription has been cancelled. You\'ll have access to premium features until the end of your current billing period.');
                updatePlan('free');
                await subscriptionStatusQuery.refetch();
              } else {
                throw new Error('Failed to process request');
              }
            } catch (error) {
              console.error('Error cancelling subscription:', error);
              Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return Colors.light.success;
      case 'trialing':
        return Colors.light.primary;
      case 'past_due':
        return Colors.light.warning;
      case 'canceled':
        return Colors.light.error;
      default:
        return Colors.light.textMedium;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return <CheckCircle size={16} color={Colors.light.success} />;
      case 'trialing':
        return <Star size={16} color={Colors.light.primary} />;
      case 'past_due':
      case 'canceled':
        return <AlertCircle size={16} color={Colors.light.error} />;
      default:
        return <AlertCircle size={16} color={Colors.light.textMedium} />;
    }
  };

  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Subscription Status */}
      {subscription ? (
        <View style={styles.subscriptionCard}>
          <LinearGradient
            colors={subscription.status === 'active' 
              ? [Colors.light.success, Colors.light.successDark] as const
              : [Colors.light.primary, Colors.light.primaryDark] as const
            }
            style={styles.subscriptionGradient}
          >
            <View style={styles.subscriptionHeader}>
              <Crown size={24} color="#ffffff" />
              <Text style={styles.subscriptionTitle}>{subscription.planName}</Text>
              <View style={styles.statusBadge}>
                {getStatusIcon(subscription.status)}
                <Text style={[styles.statusText, { color: '#ffffff' }]}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </Text>
              </View>
            </View>
            
            <Text style={styles.subscriptionAmount}>
              {formatAmount(subscription.amount, subscription.currency)}
              {subscription.interval && `/${subscription.interval}`}
            </Text>
            
            {subscription.currentPeriodEnd && (
              <Text style={styles.subscriptionNextBilling}>
                Next billing: {formatDate(subscription.currentPeriodEnd)}
              </Text>
            )}
          </LinearGradient>
        </View>
      ) : (
        <View style={styles.noSubscriptionCard}>
          <Text style={styles.noSubscriptionTitle}>No Active Subscription</Text>
          <Text style={styles.noSubscriptionText}>
            You&apos;re currently on the free plan. Upgrade to unlock premium features.
          </Text>
        </View>
      )}

      {/* Payment Methods Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Payment Methods</Text>
        <Text style={styles.summaryCount}>{paymentMethods.length} method{paymentMethods.length !== 1 ? 's' : ''}</Text>
        
        {paymentMethods.slice(0, 2).map((method) => (
          <View key={method.id} style={styles.summaryMethodRow}>
            {method.type === 'card' ? (
              <CreditCard size={16} color={Colors.light.textMedium} />
            ) : (
              <View style={styles.paypalIconSmall}>
                <Text style={styles.paypalTextSmall}>PP</Text>
              </View>
            )}
            <Text style={styles.summaryMethodText}>
              {method.type === 'card' 
                ? `${method.brand} •••• ${method.last4}`
                : method.email
              }
            </Text>
            {method.isDefault && (
              <View style={styles.defaultBadgeSmall}>
                <Text style={styles.defaultTextSmall}>Default</Text>
              </View>
            )}
          </View>
        ))}
        
        {paymentMethods.length > 2 && (
          <Text style={styles.summaryMoreText}>
            +{paymentMethods.length - 2} more
          </Text>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={handleAddStripeCard}
          disabled={loading}
        >
          <CreditCard size={20} color={Colors.light.primary} />
          <Text style={styles.quickActionText}>Add Card</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={handleAddPayPal}
          disabled={loading}
        >
          <View style={styles.paypalIcon}>
            <Text style={styles.paypalText}>PayPal</Text>
          </View>
          <Text style={styles.quickActionText}>Add PayPal</Text>
        </TouchableOpacity>
        
        {subscription && (
          <TouchableOpacity
            style={[styles.quickActionButton, styles.cancelButton]}
            onPress={handleCancelSubscription}
            disabled={loading}
          >
            <AlertCircle size={20} color={Colors.light.error} />
            <Text style={[styles.quickActionText, { color: Colors.light.error }]}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderPaymentMethods = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Payment Methods</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw size={16} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>

      {paymentMethods.map((method) => (
        <View key={method.id} style={styles.paymentMethodCard}>
          <View style={styles.paymentMethodInfo}>
            {method.type === 'card' ? (
              <CreditCard size={24} color={Colors.light.textPrimary} />
            ) : (
              <View style={styles.paypalIcon}>
                <Text style={styles.paypalText}>PayPal</Text>
              </View>
            )}
            
            <View style={styles.paymentMethodDetails}>
              <Text style={styles.paymentMethodName}>
                {method.type === 'card' 
                  ? `${method.brand} •••• ${method.last4}`
                  : method.email
                }
              </Text>
              
              {method.type === 'card' && method.expMonth && method.expYear && (
                <View style={styles.paymentMethodExpiry}>
                  <Calendar size={12} color={Colors.light.textLight} />
                  <Text style={styles.expiryText}>
                    Expires {method.expMonth}/{method.expYear}
                  </Text>
                </View>
              )}
              
              <Text style={styles.providerText}>
                via {method.provider === 'stripe' ? 'Stripe' : 'PayPal'}
              </Text>
            </View>
          </View>
          
          <View style={styles.paymentMethodActions}>
            {method.isDefault ? (
              <View style={styles.defaultBadge}>
                <CheckCircle size={12} color={Colors.light.success} />
                <Text style={styles.defaultText}>Default</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.setDefaultButton}
                onPress={() => handleSetDefaultPaymentMethod(method.id)}
                disabled={loading}
              >
                <Text style={styles.setDefaultText}>Set as default</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemovePaymentMethod(method)}
              disabled={loading}
            >
              <Trash2 size={16} color={Colors.light.error} />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {paymentMethods.length === 0 && (
        <View style={styles.emptyState}>
          <CreditCard size={48} color={Colors.light.textLight} />
          <Text style={styles.emptyStateTitle}>No Payment Methods</Text>
          <Text style={styles.emptyStateText}>
            Add a payment method to manage your subscriptions
          </Text>
        </View>
      )}

      {/* Add Payment Method Buttons */}
      <View style={styles.addMethodButtons}>
        <Button
          title="Add Credit/Debit Card"
          onPress={handleAddStripeCard}
          loading={loading}
          disabled={loading}
          style={styles.addMethodButton}
          icon={<CreditCard size={20} color={Colors.light.white} />}
        />
        
        <Button
          title="Add PayPal Account"
          onPress={handleAddPayPal}
          loading={loading}
          disabled={loading}
          variant="outline"
          style={styles.addMethodButton}
          icon={
            <View style={styles.paypalIconButton}>
              <Text style={styles.paypalTextButton}>PayPal</Text>
            </View>
          }
        />
      </View>
    </View>
  );

  const renderSubscription = () => (
    <View style={styles.tabContent}>
      {subscription ? (
        <>
          <View style={styles.subscriptionDetailsCard}>
            <Text style={styles.sectionTitle}>Subscription Details</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Plan</Text>
              <Text style={styles.detailValue}>{subscription.planName}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <View style={styles.statusContainer}>
                {getStatusIcon(subscription.status)}
                <Text style={[styles.detailValue, { color: getStatusColor(subscription.status) }]}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount</Text>
              <Text style={styles.detailValue}>
                {formatAmount(subscription.amount, subscription.currency)}
                {subscription.interval && `/${subscription.interval}`}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Provider</Text>
              <Text style={styles.detailValue}>
                {subscription.provider === 'stripe' ? 'Stripe' : 'PayPal'}
              </Text>
            </View>
            
            {subscription.currentPeriodEnd && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Next Billing</Text>
                <Text style={styles.detailValue}>
                  {formatDate(subscription.currentPeriodEnd)}
                </Text>
              </View>
            )}
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Created</Text>
              <Text style={styles.detailValue}>
                {formatDate(subscription.createdAt)}
              </Text>
            </View>
          </View>

          {/* Subscription Actions */}
          <View style={styles.subscriptionActions}>
            <Button
              title="Cancel Subscription"
              onPress={handleCancelSubscription}
              variant="outline"
              loading={loading}
              disabled={loading || subscription.status === 'canceled'}
              style={styles.cancelSubscriptionButton}
            />
          </View>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Crown size={48} color={Colors.light.textLight} />
          <Text style={styles.emptyStateTitle}>No Active Subscription</Text>
          <Text style={styles.emptyStateText}>
            You&apos;re currently on the free plan. Upgrade to unlock premium features.
          </Text>
        </View>
      )}
    </View>
  );

  if (!isLoggedIn) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Please log in to manage payments</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Payment Manager</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Done</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <DollarSign size={16} color={activeTab === 'overview' ? Colors.light.primary : Colors.light.textMedium} />
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'methods' && styles.activeTab]}
          onPress={() => setActiveTab('methods')}
        >
          <CreditCard size={16} color={activeTab === 'methods' ? Colors.light.primary : Colors.light.textMedium} />
          <Text style={[styles.tabText, activeTab === 'methods' && styles.activeTabText]}>
            Methods
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'subscription' && styles.activeTab]}
          onPress={() => setActiveTab('subscription')}
        >
          <Crown size={16} color={activeTab === 'subscription' ? Colors.light.primary : Colors.light.textMedium} />
          <Text style={[styles.tabText, activeTab === 'subscription' && styles.activeTabText]}>
            Subscription
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {refreshing && (
          <View style={styles.refreshingContainer}>
            <RefreshCw size={20} color={Colors.light.primary} />
            <Text style={styles.refreshingText}>Refreshing...</Text>
          </View>
        )}
        
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'methods' && renderPaymentMethods()}
        {activeTab === 'subscription' && renderSubscription()}
      </ScrollView>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      )}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.light.textPrimary,
  },
  closeButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.primary,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.textMedium,
  },
  activeTabText: {
    color: Colors.light.primary,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: theme.spacing.lg,
  },
  refreshingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary + '15',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  refreshingText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600' as const,
  },
  subscriptionCard: {
    marginBottom: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  subscriptionGradient: {
    padding: theme.spacing.xl,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  subscriptionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#ffffff',
  },
  subscriptionAmount: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#ffffff',
    marginBottom: theme.spacing.sm,
  },
  subscriptionNextBilling: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  noSubscriptionCard: {
    backgroundColor: Colors.light.card,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    ...theme.shadows.small,
  },
  noSubscriptionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  noSubscriptionText: {
    fontSize: 14,
    color: Colors.light.textMedium,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: Colors.light.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.small,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  summaryCount: {
    fontSize: 14,
    color: Colors.light.textMedium,
    marginBottom: theme.spacing.md,
  },
  summaryMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  summaryMethodText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.textPrimary,
  },
  summaryMoreText: {
    fontSize: 12,
    color: Colors.light.textLight,
    fontStyle: 'italic',
  },
  quickActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: Colors.light.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    gap: theme.spacing.xs,
    ...theme.shadows.small,
  },
  cancelButton: {
    backgroundColor: Colors.light.error + '10',
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.light.textPrimary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.textPrimary,
  },
  refreshButton: {
    padding: theme.spacing.sm,
  },
  paymentMethodCard: {
    backgroundColor: Colors.light.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  paymentMethodDetails: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.textPrimary,
    marginBottom: 4,
  },
  paymentMethodExpiry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  expiryText: {
    fontSize: 12,
    color: Colors.light.textLight,
  },
  providerText: {
    fontSize: 12,
    color: Colors.light.textMedium,
  },
  paymentMethodActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.success + '15',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    gap: 4,
  },
  defaultBadgeSmall: {
    backgroundColor: Colors.light.success + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.xs,
  },
  defaultText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.light.success,
  },
  defaultTextSmall: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.light.success,
  },
  setDefaultButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
  },
  setDefaultText: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: '600' as const,
  },
  removeButton: {
    padding: theme.spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    padding: theme.spacing.xxl,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.textPrimary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.light.textMedium,
    textAlign: 'center',
  },
  addMethodButtons: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  addMethodButton: {
    marginBottom: 0,
  },
  subscriptionDetailsCard: {
    backgroundColor: Colors.light.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.small,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.light.textMedium,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.textPrimary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  subscriptionActions: {
    gap: theme.spacing.md,
  },
  cancelSubscriptionButton: {
    borderColor: Colors.light.error,
  },
  paypalIcon: {
    backgroundColor: '#0070ba',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  paypalIconSmall: {
    backgroundColor: '#0070ba',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paypalIconButton: {
    backgroundColor: 'rgba(0, 112, 186, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  paypalText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700' as const,
  },
  paypalTextSmall: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '700' as const,
  },
  paypalTextButton: {
    color: '#0070ba',
    fontSize: 10,
    fontWeight: '700' as const,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.error,
    textAlign: 'center',
  },
});