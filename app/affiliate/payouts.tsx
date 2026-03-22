import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { DollarSign, CreditCard, AlertCircle, CheckCircle, Clock, ChevronRight, Building, ArrowRight } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useAffiliateStore, Payout } from '@/store/affiliateStore';
import * as Haptics from 'expo-haptics';

export default function AffiliatePayouts() {
  const { 
    availableBalance, 
    pendingBalance, 
    payouts, 
    paymentMethod,
    requestPayout
  } = useAffiliateStore();
  
  const [selectedMethod, setSelectedMethod] = useState<'bank_transfer' | 'paypal' | 'stripe'>(
    paymentMethod.type || 'bank_transfer'
  );

  const handleRequestPayout = () => {
    if (availableBalance <= 0) {
      Alert.alert(
        "No Available Balance",
        "You don't have any funds available for payout."
      );
      return;
    }
    
    if (!paymentMethod.type || !paymentMethod.details) {
      Alert.alert(
        "Payment Method Required",
        "Please set up your payment method in Affiliate Settings before requesting a payout."
      );
      return;
    }
    
    Alert.alert(
      "Request Payout",
      `Are you sure you want to request a payout of $${availableBalance.toFixed(2)}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Request", onPress: () => {
          // Provide haptic feedback on iOS/Android
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          
          requestPayout(selectedMethod);
          
          Alert.alert(
            "Payout Requested",
            "Your payout request has been submitted. You'll receive an update when it's processed."
          );
        }}
      ]
    );
  };
  
  const getPayoutStatusColor = (status: Payout['status']) => {
    switch (status) {
      case 'completed': return Colors.light.success;
      case 'processing': return Colors.light.warning;
      case 'pending': return Colors.light.textLight;
      case 'failed': return Colors.light.error;
      default: return Colors.light.textLight;
    }
  };

  const getPayoutStatusIcon = (status: Payout['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} color={Colors.light.success} />;
      case 'processing': return <Clock size={16} color={Colors.light.warning} />;
      case 'pending': return <Clock size={16} color={Colors.light.textLight} />;
      case 'failed': return <AlertCircle size={16} color={Colors.light.error} />;
      default: return <Clock size={16} color={Colors.light.textLight} />;
    }
  };
  
  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'bank_transfer': return <Building size={20} color={Colors.light.text} />;
      case 'paypal': return <DollarSign size={20} color={Colors.light.text} />;
      case 'stripe': return <CreditCard size={20} color={Colors.light.text} />;
      default: return <Building size={20} color={Colors.light.text} />;
    }
  };
  
  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'bank_transfer': return 'Bank Transfer';
      case 'paypal': return 'PayPal';
      case 'stripe': return 'Stripe';
      default: return 'Unknown Method';
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Payouts" }} />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.balanceContainer}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceValue}>${availableBalance.toFixed(2)}</Text>
            <Text style={styles.balanceNote}>Available for payout</Text>
          </View>
          
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Pending Balance</Text>
            <Text style={styles.balanceValue}>${pendingBalance.toFixed(2)}</Text>
            <Text style={styles.balanceNote}>Available after 30 days</Text>
          </View>
        </View>
        
        <View style={styles.payoutCard}>
          <Text style={styles.payoutCardTitle}>Request Payout</Text>
          
          <View style={styles.paymentMethodSection}>
            <Text style={styles.paymentMethodTitle}>Select Payment Method</Text>
            
            <TouchableOpacity 
              style={[
                styles.paymentMethodOption,
                selectedMethod === 'bank_transfer' && styles.paymentMethodSelected
              ]}
              onPress={() => setSelectedMethod('bank_transfer')}
              activeOpacity={0.7}
            >
              <Building size={20} color={selectedMethod === 'bank_transfer' ? Colors.light.primary : Colors.light.text} />
              <Text style={[
                styles.paymentMethodText,
                selectedMethod === 'bank_transfer' && styles.paymentMethodTextSelected
              ]}>Bank Transfer</Text>
              {selectedMethod === 'bank_transfer' && (
                <View style={styles.paymentMethodSelectedIndicator} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.paymentMethodOption,
                selectedMethod === 'paypal' && styles.paymentMethodSelected
              ]}
              onPress={() => setSelectedMethod('paypal')}
              activeOpacity={0.7}
            >
              <DollarSign size={20} color={selectedMethod === 'paypal' ? Colors.light.primary : Colors.light.text} />
              <Text style={[
                styles.paymentMethodText,
                selectedMethod === 'paypal' && styles.paymentMethodTextSelected
              ]}>PayPal</Text>
              {selectedMethod === 'paypal' && (
                <View style={styles.paymentMethodSelectedIndicator} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.paymentMethodOption,
                selectedMethod === 'stripe' && styles.paymentMethodSelected
              ]}
              onPress={() => setSelectedMethod('stripe')}
              activeOpacity={0.7}
            >
              <CreditCard size={20} color={selectedMethod === 'stripe' ? Colors.light.primary : Colors.light.text} />
              <Text style={[
                styles.paymentMethodText,
                selectedMethod === 'stripe' && styles.paymentMethodTextSelected
              ]}>Stripe</Text>
              {selectedMethod === 'stripe' && (
                <View style={styles.paymentMethodSelectedIndicator} />
              )}
            </TouchableOpacity>
          </View>
          
          {!paymentMethod.type && (
            <View style={styles.paymentMethodWarning}>
              <AlertCircle size={18} color={Colors.light.warning} style={styles.warningIcon} />
              <Text style={styles.warningText}>
                Please set up your payment details in Affiliate Settings before requesting a payout.
              </Text>
            </View>
          )}
          
          <View style={styles.payoutSummary}>
            <View style={styles.payoutSummaryRow}>
              <Text style={styles.payoutSummaryLabel}>Amount</Text>
              <Text style={styles.payoutSummaryValue}>${availableBalance.toFixed(2)}</Text>
            </View>
            <View style={styles.payoutSummaryRow}>
              <Text style={styles.payoutSummaryLabel}>Payment Method</Text>
              <Text style={styles.payoutSummaryValue}>{getPaymentMethodName(selectedMethod)}</Text>
            </View>
            <View style={styles.payoutSummaryRow}>
              <Text style={styles.payoutSummaryLabel}>Processing Time</Text>
              <Text style={styles.payoutSummaryValue}>3-5 business days</Text>
            </View>
          </View>
          
          <Button
            title="Request Payout"
            onPress={handleRequestPayout}
            disabled={availableBalance <= 0 || !paymentMethod.type}
            style={styles.requestButton}
            accessibilityLabel="Request payout"
          />
        </View>
        
        <View style={styles.payoutHistorySection}>
          <Text style={styles.sectionTitle}>Payout History</Text>
          
          {payouts.length === 0 ? (
            <View style={styles.emptyPayouts}>
              <Text style={styles.emptyPayoutsText}>No payout history yet</Text>
            </View>
          ) : (
            payouts.map((payout) => (
              <View key={payout.id} style={styles.payoutItem}>
                <View style={styles.payoutItemHeader}>
                  <View style={styles.payoutItemLeft}>
                    {getPaymentMethodIcon(payout.method)}
                    <View style={styles.payoutItemDetails}>
                      <Text style={styles.payoutItemMethod}>
                        {getPaymentMethodName(payout.method)}
                      </Text>
                      <Text style={styles.payoutItemDate}>
                        {new Date(payout.date).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.payoutItemAmount}>${payout.amount.toFixed(2)}</Text>
                </View>
                
                <View style={styles.payoutItemStatus}>
                  {getPayoutStatusIcon(payout.status)}
                  <Text style={[styles.payoutItemStatusText, { color: getPayoutStatusColor(payout.status) }]}>
                    {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                  </Text>
                </View>
                
                {payout.reference && (
                  <Text style={styles.payoutItemReference}>Ref: {payout.reference}</Text>
                )}
              </View>
            ))
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.settingsLink}
          onPress={() => router.push('/affiliate/settings')}
          activeOpacity={0.7}
        >
          <Text style={styles.settingsLinkText}>Manage Payment Methods</Text>
          <ChevronRight size={16} color={Colors.light.primary} />
        </TouchableOpacity>
      </ScrollView>
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
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  balanceCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    width: '48%',
    ...theme.shadows.small,
  },
  balanceLabel: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
    marginBottom: 4,
  },
  balanceValue: {
    ...theme.typography.title,
    fontSize: 22,
    marginBottom: 4,
  },
  balanceNote: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
  },
  payoutCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.small,
  },
  payoutCardTitle: {
    ...theme.typography.subtitle,
    marginBottom: theme.spacing.md,
  },
  paymentMethodSection: {
    marginBottom: theme.spacing.md,
  },
  paymentMethodTitle: {
    ...theme.typography.body,
    marginBottom: theme.spacing.sm,
  },
  paymentMethodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.sm,
  },
  paymentMethodSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary + '10',
  },
  paymentMethodText: {
    ...theme.typography.body,
    marginLeft: theme.spacing.md,
  },
  paymentMethodTextSelected: {
    color: Colors.light.primary,
    fontWeight: '500',
  },
  paymentMethodSelectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
    marginLeft: 'auto',
  },
  paymentMethodWarning: {
    flexDirection: 'row',
    backgroundColor: Colors.light.warning + '20',
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  warningIcon: {
    marginRight: theme.spacing.sm,
  },
  warningText: {
    ...theme.typography.caption,
    color: Colors.light.warning,
    flex: 1,
  },
  payoutSummary: {
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  payoutSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  payoutSummaryLabel: {
    ...theme.typography.body,
    color: Colors.light.textLight,
  },
  payoutSummaryValue: {
    ...theme.typography.body,
    fontWeight: '500',
  },
  requestButton: {
    marginTop: theme.spacing.sm,
  },
  payoutHistorySection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.subtitle,
    marginBottom: theme.spacing.md,
  },
  emptyPayouts: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  emptyPayoutsText: {
    ...theme.typography.body,
    color: Colors.light.textLight,
    textAlign: 'center',
  },
  payoutItem: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.small,
  },
  payoutItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  payoutItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payoutItemDetails: {
    marginLeft: theme.spacing.md,
  },
  payoutItemMethod: {
    ...theme.typography.body,
    fontWeight: '500',
  },
  payoutItemDate: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
  },
  payoutItemAmount: {
    ...theme.typography.subtitle,
  },
  payoutItemStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payoutItemStatusText: {
    ...theme.typography.caption,
    marginLeft: 4,
  },
  payoutItemReference: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
    marginTop: 4,
  },
  settingsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
  },
  settingsLinkText: {
    ...theme.typography.body,
    color: Colors.light.primary,
    marginRight: 4,
  },
});