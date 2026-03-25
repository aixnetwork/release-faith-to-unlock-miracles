import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Platform, Modal } from 'react-native';
import { Stack, router } from 'expo-router';
import { CreditCard, Plus, Trash2, Edit2, Calendar, CheckCircle, AlertCircle, RefreshCw, ArrowLeft, HelpCircle, BarChart3, MessageCircle, Settings, Crown } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore, PlanType } from '@/store/userStore';
import * as Haptics from 'expo-haptics';
import { trpc, trpcClient } from '@/lib/trpc';
import { LinearGradient } from 'expo-linear-gradient';
import PaymentManager from '@/components/PaymentManager';

interface PaymentMethod {
  id: string;
  type: 'card';
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: 'paid' | 'pending' | 'failed';
  downloadUrl: string;
}

export default function BillingScreen() {
  const { isLoggedIn, plan, setPlan, name, email } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showPaymentManager, setShowPaymentManager] = useState(false);

  // Mock payment methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'pm_1',
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expMonth: 12,
      expYear: 2025,
      isDefault: true
    }
  ]);

  // Mock invoices
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 'in_1',
      date: '2025-05-01',
      amount: plan === 'lifetime' ? '$199.99' : plan === 'individual' ? '$5.99' : plan === 'group_family' ? '$19.00' :
              plan === 'small_church' ? '$99.00' : plan === 'large_church' ? '$299.00' : '$0.00',
      status: 'paid',
      downloadUrl: 'https://example.com/invoice/1'
    },
    {
      id: 'in_2',
      date: '2025-04-01',
      amount: plan === 'lifetime' ? '$199.99' : plan === 'individual' ? '$5.99' : plan === 'group_family' ? '$19.00' :
              plan === 'small_church' ? '$99.00' : plan === 'large_church' ? '$299.00' : '$0.00',
      status: 'paid',
      downloadUrl: 'https://example.com/invoice/2'
    }
  ]);

  // If not logged in, redirect to login screen
  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/login');
    }
  }, [isLoggedIn]);

  // Use tRPC hooks for data fetching with proper error handling
  const paymentMethodsQuery = trpc.payments.getPaymentMethods.useQuery(undefined, {
    enabled: false, // Disabled until backend is properly set up
    retry: false,
  });
  
  const invoicesQuery = trpc.stripe.listInvoices.useQuery(undefined, {
    enabled: false, // Disabled until backend is properly set up
    retry: false,
  });
  
  const subscriptionStatusQuery = trpc.payments.getSubscriptionStatus.useQuery(
    { currentPlan: plan },
    { 
      enabled: false, // Disabled until backend is properly set up
      retry: false,
    }
  );

  const loadBillingData = useCallback(async () => {
    setRefreshing(true);
    
    try {
      // Refetch the data
      await Promise.all([
        paymentMethodsQuery.refetch(),
        invoicesQuery.refetch(),
      ]);
    } catch (error) {
      console.error('Error loading billing data:', error);
      Alert.alert('Error', 'Failed to load billing data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, [paymentMethodsQuery, invoicesQuery]);

  // Load billing data on mount
  useEffect(() => {
    if (isLoggedIn && plan !== 'free') {
      loadBillingData();
    }
  }, [isLoggedIn, plan, loadBillingData]);
  
  // Update payment methods when query data changes
  useEffect(() => {
    if (paymentMethodsQuery.data?.success) {
      const convertedMethods = paymentMethodsQuery.data.paymentMethods.map((pm: any) => ({
        id: pm.id,
        type: 'card' as const,
        last4: pm.last4 || '0000',
        brand: pm.brand || 'Unknown',
        expMonth: pm.expMonth || 12,
        expYear: pm.expYear || 2025,
        isDefault: pm.isDefault,
      }));
      setPaymentMethods(convertedMethods);
    }
  }, [paymentMethodsQuery.data]);
  
  // Update invoices when query data changes
  useEffect(() => {
    if (invoicesQuery.data && Array.isArray(invoicesQuery.data)) {
      // Map and validate the invoice data to match our interface
      const validatedInvoices: Invoice[] = invoicesQuery.data.map((invoice: any) => ({
        id: invoice.id,
        date: invoice.date,
        amount: invoice.amount,
        status: ['paid', 'pending', 'failed'].includes(invoice.status) ? invoice.status : 'paid',
        downloadUrl: invoice.downloadUrl,
      }));
      setInvoices(validatedInvoices);
    }
  }, [invoicesQuery.data]);

  if (!isLoggedIn) {
    return null;
  }

  const getPlanName = () => {
    switch (plan) {
      case 'individual': return 'Individual Plan';
      case 'group_family': return 'Group/Family Plan';
      case 'small_church': return 'Small Church Plan';
      case 'large_church': return 'Large Church Plan';
      case 'lifetime': return 'Lifetime Plan';
      default: return 'Free Plan';
    }
  };

  const getPlanPrice = () => {
    switch (plan) {
      case 'individual': return '$5.99/month';
      case 'group_family': return '$19.99/month';
      case 'small_church': return '$99/month';
      case 'large_church': return '$299/month';
      case 'lifetime': return '$199.99 (one-time)';
      default: return 'Free';
    }
  };

  const getPriceId = () => {
    switch (plan) {
      case 'premium': return 'price_1OxYzAXXXXXXXXXXXXXXXXXX';
      case 'pro': return 'price_1OxYzBXXXXXXXXXXXXXXXXXX';
      case 'lifetime': return 'price_1OxYzCXXXXXXXXXXXXXXXXXX';
      case 'org_small': return 'price_1OxYzDXXXXXXXXXXXXXXXXXX';
      case 'org_medium': return 'price_1OxYzEXXXXXXXXXXXXXXXXXX';
      case 'org_large': return 'price_1OxYzFXXXXXXXXXXXXXXXXXX';
      default: return '';
    }
  };

  const handleAddPaymentMethod = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setShowPaymentManager(true);
  };

  const handleClosePaymentManager = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setShowPaymentManager(false);
    loadBillingData(); // Refresh data when closing
  };

  const handleRemovePaymentMethod = (id: string) => {
    // Provide haptic feedback on iOS/Android
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    
    Alert.alert(
      "Remove Payment Method",
      "Are you sure you want to remove this payment method?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            
            try {
              // In a real app, you would call your backend to remove the payment method
              // await trpcClient.stripe.removePaymentMethod.mutate({ paymentMethodId: id });
              
              // Simulate API call
              await new Promise(resolve => setTimeout(resolve, 500));
              
              setPaymentMethods(paymentMethods.filter(method => method.id !== id));
            } catch (error) {
              console.error('Error removing payment method:', error);
              Alert.alert('Error', 'Failed to remove payment method. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleSetDefaultPaymentMethod = async (id: string) => {
    // Provide haptic feedback on iOS/Android
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    
    setLoading(true);
    
    try {
      // In a real app, you would call your backend to set the default payment method
      // await trpcClient.stripe.setDefaultPaymentMethod.mutate({ paymentMethodId: id });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPaymentMethods(paymentMethods.map(method => ({
        ...method,
        isDefault: method.id === id
      })));
    } catch (error) {
      console.error('Error setting default payment method:', error);
      Alert.alert('Error', 'Failed to set default payment method. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    // In a real app, this would download the invoice or open it in a browser
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    Alert.alert(
      "Download Invoice",
      "In a real app, this would download the invoice or open it in a browser.",
      [{ text: "OK" }]
    );
  };

  const handleChangePlan = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    console.log('🔄 Navigating to membership screen for plan change');
    
    // Navigate directly to membership screen
    // Subscription status check removed as it's not critical for navigation
    router.push('/membership');
  };

  const handleUpdatePayment = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setLoading(true);
    
    try {
      // In a real app, you would create a checkout session for updating the payment method
      // const response = await trpcClient.stripe.createUpdatePaymentSession.mutate({
      //   customerEmail: email || '',
      //   customerName: name || '',
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Open payment manager instead
      setShowPaymentManager(true);
    } catch (error) {
      console.error('Error updating payment method:', error);
      Alert.alert('Error', 'Failed to update payment method. Please try again.');
      setLoading(false);
    }
  };

  const handleBottomMenuAction = (action: string) => {
    switch (action) {
      case 'back':
        router.back();
        break;
      case 'help':
        router.push('/settings/help');
        break;
      case 'plans':
        router.push('/membership');
        break;
      case 'support':
        router.push('/settings/contact');
        break;
      case 'settings':
        router.push('/settings');
        break;
      default:
        break;
    }
  };

  const handleCancelSubscription = () => {
    // Provide haptic feedback on iOS/Android
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    
    Alert.alert(
      "Cancel Subscription",
      "Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your billing period.",
      [
        { text: "No, Keep It", style: "cancel" },
        { 
          text: "Yes, Cancel", 
          style: "destructive",
          onPress: async () => {
            setCancelLoading(true);
            
            try {
              // In a real app, you would call your backend to cancel the subscription
              // await trpcClient.stripe.cancelSubscription.mutate();
              
              // Simulate API call
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              setPlan('free');
              
              Alert.alert(
                "Subscription Cancelled",
                "Your subscription has been cancelled. You'll have access to premium features until the end of your current billing period.",
                [{ text: "OK" }]
              );
            } catch (error) {
              console.error('Error cancelling subscription:', error);
              Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
            } finally {
              setCancelLoading(false);
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getCardIcon = (brand: string) => {
    // In a real app, you would return different icons based on the card brand
    return <CreditCard size={20} color={Colors.light.textPrimary} />;
  };

  return (
    <>
      <Stack.Screen options={{ title: "Billing & Payments" }} />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {refreshing && (
          <View style={styles.refreshingContainer}>
            <RefreshCw size={20} color={Colors.light.primary} />
            <Text style={styles.refreshingText}>Refreshing billing information...</Text>
          </View>
        )}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Plan</Text>
          
          <View style={styles.planCard}>
            <View style={styles.planCardHeader}>
              <Text style={styles.planName}>{getPlanName()}</Text>
              <Text style={styles.planPrice}>{getPlanPrice()}</Text>
            </View>
            
            <Text style={styles.planDescription}>
              {plan === 'free' 
                ? "You're currently on the free plan with basic features." 
                : `Your next billing date is ${formatDate('2025-06-01')}.`}
            </Text>
            
            <View style={styles.planActions}>
              <Button
                title={plan === 'free' ? "Upgrade Plan" : "Change Plan"}
                onPress={handleChangePlan}
                size="small"
                style={styles.planActionButton}
              />
              
              {plan !== 'free' && (
                <Button
                  title="Cancel Subscription"
                  onPress={handleCancelSubscription}
                  variant="outline"
                  size="small"
                  loading={cancelLoading}
                  disabled={cancelLoading || loading}
                  style={styles.planActionButton}
                />
              )}
            </View>
          </View>
        </View>

        {plan !== 'free' && (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Payment Methods</Text>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={handleAddPaymentMethod}
                  disabled={loading}
                >
                  <Plus size={16} color={Colors.light.primary} />
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.paymentMethodsContainer}>
                {paymentMethods.map((method) => (
                  <View key={method.id} style={styles.paymentMethodCard}>
                    <View style={styles.paymentMethodInfo}>
                      {getCardIcon(method.brand)}
                      <View style={styles.paymentMethodDetails}>
                        <Text style={styles.paymentMethodName}>
                          {`${method.brand} •••• ${method.last4}`}
                        </Text>
                        <View style={styles.paymentMethodExpiry}>
                          <Calendar size={12} color={Colors.light.textLight} />
                          <Text style={styles.expiryText}>
                            Expires {method.expMonth}/{method.expYear}
                          </Text>
                        </View>
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
                      
                      <View style={styles.paymentMethodButtons}>
                        <TouchableOpacity 
                          style={styles.paymentMethodButton}
                          onPress={handleUpdatePayment}
                          disabled={loading}
                        >
                          <Edit2 size={16} color={Colors.light.textPrimary} />
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={styles.paymentMethodButton}
                          onPress={() => handleRemovePaymentMethod(method.id)}
                          disabled={loading}
                        >
                          <Trash2 size={16} color={Colors.light.error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Billing History</Text>
              
              <View style={styles.invoicesContainer}>
                {invoices.map((invoice) => (
                  <TouchableOpacity 
                    key={invoice.id} 
                    style={styles.invoiceCard}
                    onPress={() => handleDownloadInvoice(invoice)}
                    disabled={loading}
                  >
                    <View style={styles.invoiceInfo}>
                      <Text style={styles.invoiceDate}>{formatDate(invoice.date)}</Text>
                      <Text style={styles.invoiceAmount}>{invoice.amount}</Text>
                    </View>
                    
                    <View style={styles.invoiceStatus}>
                      {invoice.status === 'paid' ? (
                        <View style={styles.statusBadge}>
                          <CheckCircle size={12} color={Colors.light.success} />
                          <Text style={[styles.statusText, styles.paidStatus]}>Paid</Text>
                        </View>
                      ) : invoice.status === 'pending' ? (
                        <View style={styles.statusBadge}>
                          <AlertCircle size={12} color="#f39c12" />
                          <Text style={[styles.statusText, styles.pendingStatus]}>Pending</Text>
                        </View>
                      ) : (
                        <View style={styles.statusBadge}>
                          <AlertCircle size={12} color={Colors.light.error} />
                          <Text style={[styles.statusText, styles.failedStatus]}>Failed</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Need Help?</Text>
          <Text style={styles.helpText}>
            If you have any questions about billing or your subscription, please contact our support team.
          </Text>
          <Button
            title="Contact Support"
            onPress={() => Alert.alert("Contact Support", "This feature is not implemented in the demo.")}
            variant="outline"
            size="small"
            style={styles.helpButton}
            disabled={loading}
          />
        </View>

        {/* Add bottom spacing to account for bottom menu */}
        <View style={styles.bottomSpacing} />
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

      {/* Bottom Menu */}
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
              <Text style={styles.bottomMenuText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bottomMenuItem}
              onPress={() => handleBottomMenuAction('plans')}
              activeOpacity={0.7}
            >
              <Crown size={20} color={Colors.light.textMedium} />
              <Text style={styles.bottomMenuText}>Plans</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bottomMenuItem}
              onPress={() => handleBottomMenuAction('help')}
              activeOpacity={0.7}
            >
              <HelpCircle size={20} color={Colors.light.textMedium} />
              <Text style={styles.bottomMenuText}>Help</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bottomMenuItem}
              onPress={() => handleBottomMenuAction('support')}
              activeOpacity={0.7}
            >
              <MessageCircle size={20} color={Colors.light.textMedium} />
              <Text style={styles.bottomMenuText}>Support</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bottomMenuItem}
              onPress={() => handleBottomMenuAction('settings')}
              activeOpacity={0.7}
            >
              <Settings size={20} color={Colors.light.textMedium} />
              <Text style={styles.bottomMenuText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </>
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
  refreshingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary + '15',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  refreshingIcon: {
    marginRight: theme.spacing.xs,
  },
  refreshingText: {
    ...theme.typography.body,
    color: Colors.light.primary,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.subtitle,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.md,
  },
  planCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
  },
  planCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  planName: {
    ...theme.typography.subtitle,
    fontSize: 18,
    color: Colors.light.textPrimary,
  },
  planPrice: {
    ...theme.typography.subtitle,
    color: Colors.light.primary,
  },
  planDescription: {
    ...theme.typography.body,
    color: Colors.light.textLight,
    marginBottom: theme.spacing.md,
  },
  planActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  planActionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    ...theme.typography.body,
    color: Colors.light.primary,
    marginLeft: 4,
  },
  paymentMethodsContainer: {
    marginBottom: theme.spacing.md,
  },
  paymentMethodCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  paymentMethodDetails: {
    marginLeft: theme.spacing.md,
  },
  paymentMethodName: {
    ...theme.typography.body,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  paymentMethodExpiry: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  expiryIcon: {
    marginRight: 4,
  },
  expiryText: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
  },
  paymentMethodActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  defaultIcon: {
    marginRight: 4,
  },
  defaultText: {
    ...theme.typography.caption,
    color: Colors.light.success,
    fontWeight: '600',
  },
  setDefaultButton: {
    padding: 4,
  },
  setDefaultText: {
    ...theme.typography.caption,
    color: Colors.light.primary,
  },
  paymentMethodButtons: {
    flexDirection: 'row',
  },
  paymentMethodButton: {
    padding: 6,
    marginLeft: theme.spacing.sm,
  },
  invoicesContainer: {
    marginBottom: theme.spacing.md,
  },
  invoiceCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...theme.shadows.small,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceDate: {
    ...theme.typography.body,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  invoiceAmount: {
    ...theme.typography.body,
    color: Colors.light.textLight,
  },
  invoiceStatus: {
    marginLeft: theme.spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.light.card,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
  paidStatus: {
    color: Colors.light.success,
  },
  pendingStatus: {
    color: '#f39c12',
  },
  failedStatus: {
    color: Colors.light.error,
  },
  helpSection: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  helpTitle: {
    ...theme.typography.subtitle,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  helpText: {
    ...theme.typography.body,
    textAlign: 'center',
    color: Colors.light.textLight,
    marginBottom: theme.spacing.md,
  },
  helpButton: {
    width: '60%',
  },
  bottomSpacing: {
    height: 100, // Space for bottom menu
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
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    minWidth: 50,
  },
  bottomMenuText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.light.textMedium,
    marginTop: 4,
    textAlign: 'center',
  },
});