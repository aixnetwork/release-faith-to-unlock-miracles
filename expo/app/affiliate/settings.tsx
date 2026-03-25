import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Alert, Platform, Share as RNShare } from 'react-native';
import { Stack } from 'expo-router';
import { Building, DollarSign, CreditCard, CheckCircle, Copy, Share as ShareIcon, AlertCircle } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useAffiliateStore } from '@/store/affiliateStore';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';

export default function AffiliateSettings() {
  const { 
    referralCode, 
    referralLink, 
    paymentMethod,
    updatePaymentMethod
  } = useAffiliateStore();
  
  const [activeTab, setActiveTab] = useState('referral');
  const [copied, setCopied] = useState(false);
  
  // Bank transfer form
  const [accountName, setAccountName] = useState(paymentMethod.details?.accountName || '');
  const [accountNumber, setAccountNumber] = useState(paymentMethod.details?.accountNumber || '');
  const [routingNumber, setRoutingNumber] = useState(paymentMethod.details?.routingNumber || '');
  
  // PayPal form
  const [paypalEmail, setPaypalEmail] = useState(paymentMethod.details?.email || '');
  
  // Stripe form
  const [stripeEmail, setStripeEmail] = useState(paymentMethod.details?.email || '');
  
  const copyReferralLink = async () => {
    if (!referralLink) return;
    
    await Clipboard.setStringAsync(referralLink);
    setCopied(true);
    
    // Provide haptic feedback on iOS/Android
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    setTimeout(() => setCopied(false), 3000);
  };

  const shareReferralLink = async () => {
    if (!referralLink) return;
    
    try {
      await RNShare.share({
        message: `Join Release Faith using my referral link and get 20% off your first month! ${referralLink}`,
        url: referralLink,
        title: 'Join Release Faith'
      });
      
      // Provide haptic feedback on iOS/Android
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while sharing');
    }
  };
  
  const handleSaveBankTransfer = () => {
    if (!accountName || !accountNumber || !routingNumber) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }
    
    updatePaymentMethod('bank_transfer', {
      accountName,
      accountNumber,
      routingNumber
    });
    
    // Provide haptic feedback on iOS/Android
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    Alert.alert('Success', 'Your bank transfer details have been saved');
  };
  
  const handleSavePayPal = () => {
    if (!paypalEmail) {
      Alert.alert('Missing Information', 'Please enter your PayPal email');
      return;
    }
    
    updatePaymentMethod('paypal', {
      email: paypalEmail
    });
    
    // Provide haptic feedback on iOS/Android
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    Alert.alert('Success', 'Your PayPal details have been saved');
  };
  
  const handleSaveStripe = () => {
    if (!stripeEmail) {
      Alert.alert('Missing Information', 'Please enter your email for Stripe');
      return;
    }
    
    updatePaymentMethod('stripe', {
      email: stripeEmail
    });
    
    // Provide haptic feedback on iOS/Android
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    Alert.alert('Success', 'Your Stripe details have been saved');
  };

  return (
    <>
      <Stack.Screen options={{ title: "Affiliate Settings" }} />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'referral' && styles.activeTab]}
            onPress={() => setActiveTab('referral')}
          >
            <Text style={[styles.tabText, activeTab === 'referral' && styles.activeTabText]}>
              Referral Link
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'payment' && styles.activeTab]}
            onPress={() => setActiveTab('payment')}
          >
            <Text style={[styles.tabText, activeTab === 'payment' && styles.activeTabText]}>
              Payment Methods
            </Text>
          </TouchableOpacity>
        </View>
        
        {activeTab === 'referral' ? (
          <View style={styles.referralSection}>
            <View style={styles.referralCard}>
              <Text style={styles.referralCardTitle}>Your Referral Link</Text>
              <Text style={styles.referralCardDescription}>
                Share this link with others to earn commission when they subscribe
              </Text>
              
              <View style={styles.referralLinkContainer}>
                <Text style={styles.referralLink} numberOfLines={1} ellipsizeMode="middle">
                  {referralLink}
                </Text>
                <TouchableOpacity onPress={copyReferralLink} style={styles.copyButton}>
                  <Copy size={20} color={Colors.light.primary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.referralCodeContainer}>
                <Text style={styles.referralCodeLabel}>Referral Code:</Text>
                <Text style={styles.referralCode}>{referralCode}</Text>
              </View>
              
              {copied && (
                <Text style={styles.copiedText}>Copied to clipboard!</Text>
              )}
              
              <Button
                title="Share Your Link"
                onPress={shareReferralLink}
                variant="outline"
                icon={<ShareIcon size={18} color={Colors.light.primary} />}
                style={styles.shareButton}
                accessibilityLabel="Share your referral link"
              />
            </View>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>How It Works</Text>
              
              <View style={styles.infoStep}>
                <View style={styles.infoStepNumber}>
                  <Text style={styles.infoStepNumberText}>1</Text>
                </View>
                <View style={styles.infoStepContent}>
                  <Text style={styles.infoStepTitle}>Share Your Link</Text>
                  <Text style={styles.infoStepDescription}>
                    Share your unique referral link with friends, family, or on social media
                  </Text>
                </View>
              </View>
              
              <View style={styles.infoStep}>
                <View style={styles.infoStepNumber}>
                  <Text style={styles.infoStepNumberText}>2</Text>
                </View>
                <View style={styles.infoStepContent}>
                  <Text style={styles.infoStepTitle}>They Subscribe</Text>
                  <Text style={styles.infoStepDescription}>
                    When someone uses your link to sign up and subscribe to a paid plan
                  </Text>
                </View>
              </View>
              
              <View style={styles.infoStep}>
                <View style={styles.infoStepNumber}>
                  <Text style={styles.infoStepNumberText}>3</Text>
                </View>
                <View style={styles.infoStepContent}>
                  <Text style={styles.infoStepTitle}>You Earn Commission</Text>
                  <Text style={styles.infoStepDescription}>
                    You earn 20% commission on their subscription fee
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.paymentSection}>
            <View style={styles.paymentMethodTabs}>
              <TouchableOpacity 
                style={[
                  styles.paymentMethodTab, 
                  activeTab === 'payment' && styles.activePaymentMethodTab
                ]}
                onPress={() => setActiveTab('payment')}
              >
                <Building size={20} color={Colors.light.primary} />
                <Text style={styles.paymentMethodTabText}>Bank Transfer</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.paymentMethodTab, 
                  activeTab === 'paypal' && styles.activePaymentMethodTab
                ]}
                onPress={() => setActiveTab('paypal')}
              >
                <DollarSign size={20} color={Colors.light.primary} />
                <Text style={styles.paymentMethodTabText}>PayPal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.paymentMethodTab, 
                  activeTab === 'stripe' && styles.activePaymentMethodTab
                ]}
                onPress={() => setActiveTab('stripe')}
              >
                <CreditCard size={20} color={Colors.light.primary} />
                <Text style={styles.paymentMethodTabText}>Stripe</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.paymentMethodCard}>
              <Text style={styles.paymentMethodCardTitle}>Bank Transfer Details</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Account Holder Name</Text>
                <TextInput
                  style={styles.formInput}
                  value={accountName}
                  onChangeText={setAccountName}
                  placeholder="Enter account holder name"
                  placeholderTextColor={Colors.light.textLight}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Account Number</Text>
                <TextInput
                  style={styles.formInput}
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  placeholder="Enter account number"
                  placeholderTextColor={Colors.light.textLight}
                  keyboardType="number-pad"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Routing Number</Text>
                <TextInput
                  style={styles.formInput}
                  value={routingNumber}
                  onChangeText={setRoutingNumber}
                  placeholder="Enter routing number"
                  placeholderTextColor={Colors.light.textLight}
                  keyboardType="number-pad"
                />
              </View>
              
              <View style={styles.securityNote}>
                <AlertCircle size={16} color={Colors.light.textLight} style={styles.securityIcon} />
                <Text style={styles.securityText}>
                  Your banking information is encrypted and securely stored
                </Text>
              </View>
              
              <Button
                title="Save Bank Details"
                onPress={handleSaveBankTransfer}
                style={styles.saveButton}
                accessibilityLabel="Save bank transfer details"
              />
              
              {paymentMethod.type === 'bank_transfer' && paymentMethod.details && (
                <View style={styles.savedMethodContainer}>
                  <CheckCircle size={16} color={Colors.light.success} style={styles.savedIcon} />
                  <Text style={styles.savedText}>Bank transfer details saved</Text>
                </View>
              )}
            </View>
            
            <View style={styles.paymentMethodCard}>
              <Text style={styles.paymentMethodCardTitle}>PayPal Details</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>PayPal Email</Text>
                <TextInput
                  style={styles.formInput}
                  value={paypalEmail}
                  onChangeText={setPaypalEmail}
                  placeholder="Enter PayPal email address"
                  placeholderTextColor={Colors.light.textLight}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              
              <Button
                title="Save PayPal Details"
                onPress={handleSavePayPal}
                style={styles.saveButton}
                accessibilityLabel="Save PayPal details"
              />
              
              {paymentMethod.type === 'paypal' && paymentMethod.details && (
                <View style={styles.savedMethodContainer}>
                  <CheckCircle size={16} color={Colors.light.success} style={styles.savedIcon} />
                  <Text style={styles.savedText}>PayPal details saved</Text>
                </View>
              )}
            </View>
            
            <View style={styles.paymentMethodCard}>
              <Text style={styles.paymentMethodCardTitle}>Stripe Details</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email for Stripe</Text>
                <TextInput
                  style={styles.formInput}
                  value={stripeEmail}
                  onChangeText={setStripeEmail}
                  placeholder="Enter email for Stripe"
                  placeholderTextColor={Colors.light.textLight}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              
              <Button
                title="Save Stripe Details"
                onPress={handleSaveStripe}
                style={styles.saveButton}
                accessibilityLabel="Save Stripe details"
              />
              
              {paymentMethod.type === 'stripe' && paymentMethod.details && (
                <View style={styles.savedMethodContainer}>
                  <CheckCircle size={16} color={Colors.light.success} style={styles.savedIcon} />
                  <Text style={styles.savedText}>Stripe details saved</Text>
                </View>
              )}
            </View>
          </View>
        )}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.small,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
  },
  activeTab: {
    backgroundColor: Colors.light.primary,
  },
  tabText: {
    ...theme.typography.body,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.light.white,
  },
  referralSection: {},
  referralCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.small,
  },
  referralCardTitle: {
    ...theme.typography.subtitle,
    marginBottom: theme.spacing.xs,
  },
  referralCardDescription: {
    ...theme.typography.body,
    color: Colors.light.textLight,
    marginBottom: theme.spacing.md,
  },
  referralLinkContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
  },
  referralLink: {
    ...theme.typography.body,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  copyButton: {
    padding: 4,
  },
  referralCodeContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  referralCodeLabel: {
    ...theme.typography.body,
    color: Colors.light.textLight,
    marginRight: theme.spacing.xs,
  },
  referralCode: {
    ...theme.typography.body,
    fontWeight: '600',
  },
  copiedText: {
    ...theme.typography.caption,
    color: Colors.light.success,
    marginBottom: theme.spacing.sm,
  },
  shareButton: {
    marginTop: theme.spacing.xs,
  },
  infoCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.small,
  },
  infoCardTitle: {
    ...theme.typography.subtitle,
    marginBottom: theme.spacing.md,
  },
  infoStep: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  infoStepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  infoStepNumberText: {
    ...theme.typography.body,
    color: Colors.light.white,
    fontWeight: '600',
  },
  infoStepContent: {
    flex: 1,
  },
  infoStepTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  infoStepDescription: {
    ...theme.typography.body,
    color: Colors.light.textLight,
  },
  paymentSection: {},
  paymentMethodTabs: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  paymentMethodTab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activePaymentMethodTab: {
    borderBottomColor: Colors.light.primary,
  },
  paymentMethodTabText: {
    ...theme.typography.caption,
    marginTop: 4,
  },
  paymentMethodCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.small,
  },
  paymentMethodCardTitle: {
    ...theme.typography.subtitle,
    marginBottom: theme.spacing.md,
  },
  formGroup: {
    marginBottom: theme.spacing.md,
  },
  formLabel: {
    ...theme.typography.body,
    marginBottom: 4,
  },
  formInput: {
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    ...theme.typography.body,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  securityIcon: {
    marginRight: theme.spacing.xs,
  },
  securityText: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
    flex: 1,
  },
  saveButton: {
    marginBottom: theme.spacing.sm,
  },
  savedMethodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
  },
  savedIcon: {
    marginRight: theme.spacing.xs,
  },
  savedText: {
    ...theme.typography.body,
    color: Colors.light.success,
  },
});