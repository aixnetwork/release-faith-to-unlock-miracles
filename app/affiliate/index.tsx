import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Share, Alert, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { DollarSign, Users, TrendingUp, Copy, Share as ShareIcon, ChevronRight, Clock, CheckCircle, AlertCircle, Award } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';
import { useAffiliateStore } from '@/store/affiliateStore';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';

export default function AffiliateDashboard() {
  const { isLoggedIn, name } = useUserStore();
  const { 
    isAffiliate, 
    referralCode, 
    referralLink, 
    totalEarnings, 
    availableBalance, 
    pendingBalance, 
    lifetimeReferrals, 
    activeReferrals, 
    referrals,
    becomeAffiliate 
  } = useAffiliateStore();
  
  const [copied, setCopied] = useState(false);

  // If not logged in, redirect to login screen
  React.useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/login');
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return null;
  }

  const handleBecomeAffiliate = () => {
    becomeAffiliate();
    
    // Provide haptic feedback on iOS/Android
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

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
      await Share.share({
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

  const navigateToAnalytics = () => {
    router.push('/affiliate/analytics');
  };

  const navigateToPayouts = () => {
    router.push('/affiliate/payouts');
  };

  const navigateToSettings = () => {
    router.push('/affiliate/settings');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'subscribed': return Colors.light.success;
      case 'registered': return Colors.light.warning;
      case 'pending': return Colors.light.textLight;
      case 'expired': return Colors.light.error;
      default: return Colors.light.textLight;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'subscribed': return <CheckCircle size={16} color={Colors.light.success} />;
      case 'registered': return <Clock size={16} color={Colors.light.warning} />;
      case 'pending': return <Clock size={16} color={Colors.light.textLight} />;
      case 'expired': return <AlertCircle size={16} color={Colors.light.error} />;
      default: return <Clock size={16} color={Colors.light.textLight} />;
    }
  };

  if (!isAffiliate) {
    return (
      <>
        <Stack.Screen options={{ title: "Affiliate Program" }} />
        <ScrollView 
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.becomeAffiliateCard}>
            <Award size={60} color={Colors.light.primary} style={styles.becomeAffiliateIcon} />
            <Text style={styles.becomeAffiliateTitle}>Become an Affiliate</Text>
            <Text style={styles.becomeAffiliateDescription}>
              Share Release Faith with your community and earn 20% commission on every subscription you refer.
            </Text>
            
            <View style={styles.benefitsContainer}>
              <View style={styles.benefitItem}>
                <CheckCircle size={18} color={Colors.light.primary} style={styles.benefitIcon} />
                <Text style={styles.benefitText}>20% commission on all referrals</Text>
              </View>
              <View style={styles.benefitItem}>
                <CheckCircle size={18} color={Colors.light.primary} style={styles.benefitIcon} />
                <Text style={styles.benefitText}>Easy sharing with your unique link</Text>
              </View>
              <View style={styles.benefitItem}>
                <CheckCircle size={18} color={Colors.light.primary} style={styles.benefitIcon} />
                <Text style={styles.benefitText}>Monthly payouts via bank transfer or PayPal</Text>
              </View>
              <View style={styles.benefitItem}>
                <CheckCircle size={18} color={Colors.light.primary} style={styles.benefitIcon} />
                <Text style={styles.benefitText}>Detailed analytics and reporting</Text>
              </View>
            </View>
            
            <Button
              title="Become an Affiliate"
              onPress={handleBecomeAffiliate}
              style={styles.becomeAffiliateButton}
              accessibilityLabel="Become an affiliate"
            />
          </View>
        </ScrollView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Affiliate Dashboard" }} />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>Welcome to your affiliate dashboard, {name}!</Text>
          <Text style={styles.welcomeSubtext}>Share your unique link and start earning commissions</Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <DollarSign size={24} color={Colors.light.primary} style={styles.statIcon} />
            <Text style={styles.statValue}>${totalEarnings.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Earnings</Text>
          </View>
          
          <View style={styles.statCard}>
            <Users size={24} color={Colors.light.secondary} style={styles.statIcon} />
            <Text style={styles.statValue}>{lifetimeReferrals}</Text>
            <Text style={styles.statLabel}>Total Referrals</Text>
          </View>
          
          <View style={styles.statCard}>
            <TrendingUp size={24} color={Colors.light.success} style={styles.statIcon} />
            <Text style={styles.statValue}>{activeReferrals}</Text>
            <Text style={styles.statLabel}>Active Referrals</Text>
          </View>
        </View>
        
        <View style={styles.balanceContainer}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceValue}>${availableBalance.toFixed(2)}</Text>
            <Button
              title="Request Payout"
              onPress={navigateToPayouts}
              size="small"
              disabled={availableBalance <= 0}
              style={styles.payoutButton}
              accessibilityLabel="Request payout"
            />
          </View>
          
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Pending Balance</Text>
            <Text style={styles.balanceValue}>${pendingBalance.toFixed(2)}</Text>
            <Text style={styles.pendingNote}>Available after 30 days</Text>
          </View>
        </View>
        
        <View style={styles.referralLinkCard}>
          <Text style={styles.referralLinkTitle}>Your Referral Link</Text>
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
        
        <View style={styles.navigationCards}>
          <TouchableOpacity 
            style={styles.navigationCard}
            onPress={navigateToAnalytics}
            activeOpacity={0.7}
          >
            <View style={styles.navigationCardContent}>
              <TrendingUp size={24} color={Colors.light.primary} style={styles.navigationIcon} />
              <View>
                <Text style={styles.navigationCardTitle}>Analytics</Text>
                <Text style={styles.navigationCardDescription}>
                  View detailed performance metrics
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={Colors.light.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navigationCard}
            onPress={navigateToPayouts}
            activeOpacity={0.7}
          >
            <View style={styles.navigationCardContent}>
              <DollarSign size={24} color={Colors.light.primary} style={styles.navigationIcon} />
              <View>
                <Text style={styles.navigationCardTitle}>Payouts</Text>
                <Text style={styles.navigationCardDescription}>
                  Manage your earnings and payouts
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={Colors.light.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navigationCard}
            onPress={navigateToSettings}
            activeOpacity={0.7}
          >
            <View style={styles.navigationCardContent}>
              <Award size={24} color={Colors.light.primary} style={styles.navigationIcon} />
              <View>
                <Text style={styles.navigationCardTitle}>Affiliate Settings</Text>
                <Text style={styles.navigationCardDescription}>
                  Update your payment methods
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={Colors.light.textLight} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.recentReferralsSection}>
          <Text style={styles.sectionTitle}>Recent Referrals</Text>
          
          {referrals.length === 0 ? (
            <View style={styles.emptyReferrals}>
              <Text style={styles.emptyReferralsText}>No referrals yet. Share your link to start earning!</Text>
            </View>
          ) : (
            referrals.slice(0, 5).map((referral) => (
              <View key={referral.id} style={styles.referralItem}>
                <View style={styles.referralInfo}>
                  <Text style={styles.referralName}>{referral.referredName || referral.referredEmail}</Text>
                  <View style={styles.referralStatusContainer}>
                    {getStatusIcon(referral.status)}
                    <Text style={[styles.referralStatus, { color: getStatusColor(referral.status) }]}>
                      {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                    </Text>
                  </View>
                </View>
                <View style={styles.referralDetails}>
                  <Text style={styles.referralDate}>
                    {new Date(referral.date).toLocaleDateString()}
                  </Text>
                  {referral.status === 'subscribed' && (
                    <Text style={styles.referralCommission}>${referral.commission.toFixed(2)}</Text>
                  )}
                </View>
              </View>
            ))
          )}
          
          {referrals.length > 5 && (
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={navigateToAnalytics}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllButtonText}>View All Referrals</Text>
              <ChevronRight size={16} color={Colors.light.primary} />
            </TouchableOpacity>
          )}
        </View>
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
  welcomeCard: {
    backgroundColor: Colors.light.primary + '15',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.primary,
  },
  welcomeText: {
    ...theme.typography.subtitle,
    fontSize: 18,
    marginBottom: 4,
  },
  welcomeSubtext: {
    ...theme.typography.body,
    color: Colors.light.textLight,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    width: '31%',
    ...theme.shadows.small,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    ...theme.typography.title,
    fontSize: 18,
    marginBottom: 2,
  },
  statLabel: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
    textAlign: 'center',
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
    marginBottom: 8,
  },
  payoutButton: {
    marginTop: 'auto',
  },
  pendingNote: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
    marginTop: 'auto',
    fontStyle: 'italic',
  },
  referralLinkCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.small,
  },
  referralLinkTitle: {
    ...theme.typography.subtitle,
    marginBottom: theme.spacing.sm,
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
  navigationCards: {
    marginBottom: theme.spacing.lg,
  },
  navigationCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  navigationCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navigationIcon: {
    marginRight: theme.spacing.md,
  },
  navigationCardTitle: {
    ...theme.typography.subtitle,
    fontSize: 16,
    marginBottom: 2,
  },
  navigationCardDescription: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
  },
  recentReferralsSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.subtitle,
    marginBottom: theme.spacing.md,
  },
  emptyReferrals: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  emptyReferralsText: {
    ...theme.typography.body,
    color: Colors.light.textLight,
    textAlign: 'center',
  },
  referralItem: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.small,
  },
  referralInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  referralName: {
    ...theme.typography.body,
    fontWeight: '500',
  },
  referralStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  referralStatus: {
    ...theme.typography.caption,
    marginLeft: 4,
  },
  referralDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  referralDate: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
  },
  referralCommission: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: Colors.light.success,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.sm,
  },
  viewAllButtonText: {
    ...theme.typography.body,
    color: Colors.light.primary,
    marginRight: 4,
  },
  becomeAffiliateCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  becomeAffiliateIcon: {
    marginBottom: theme.spacing.md,
  },
  becomeAffiliateTitle: {
    ...theme.typography.title,
    fontSize: 24,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  becomeAffiliateDescription: {
    ...theme.typography.body,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    color: Colors.light.textLight,
  },
  benefitsContainer: {
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  benefitIcon: {
    marginRight: theme.spacing.sm,
  },
  benefitText: {
    ...theme.typography.body,
  },
  becomeAffiliateButton: {
    width: '100%',
  },
});