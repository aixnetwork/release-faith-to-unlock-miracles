import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { Calendar, Filter, TrendingUp, Users, DollarSign, ChevronDown, CheckCircle, Clock, AlertCircle } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useAffiliateStore, Referral } from '@/store/affiliateStore';

// Mock data for charts
const mockMonthlyData = [
  { month: 'Jan', earnings: 0 },
  { month: 'Feb', earnings: 0 },
  { month: 'Mar', earnings: 0 },
  { month: 'Apr', earnings: 120 },
  { month: 'May', earnings: 240 },
  { month: 'Jun', earnings: 180 },
  { month: 'Jul', earnings: 320 },
  { month: 'Aug', earnings: 280 },
  { month: 'Sep', earnings: 400 },
  { month: 'Oct', earnings: 350 },
  { month: 'Nov', earnings: 0 },
  { month: 'Dec', earnings: 0 },
];

export default function AffiliateAnalytics() {
  const { referrals, totalEarnings, lifetimeReferrals, activeReferrals } = useAffiliateStore();
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState('all');
  
  const screenWidth = Dimensions.get('window').width - 40; // Accounting for padding
  const maxEarnings = Math.max(...mockMonthlyData.map(d => d.earnings));
  
  const getFilteredReferrals = () => {
    let filtered = [...referrals];
    
    if (statusFilter) {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    
    if (timeFilter !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();
      
      if (timeFilter === '30days') {
        cutoffDate.setDate(now.getDate() - 30);
      } else if (timeFilter === '90days') {
        cutoffDate.setDate(now.getDate() - 90);
      } else if (timeFilter === 'year') {
        cutoffDate.setFullYear(now.getFullYear() - 1);
      }
      
      filtered = filtered.filter(r => new Date(r.date) >= cutoffDate);
    }
    
    return filtered;
  };
  
  const filteredReferrals = getFilteredReferrals();
  
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
  
  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
  };
  
  const handleStatusFilter = (status: string | null) => {
    setStatusFilter(status);
  };
  
  const handleTimeFilter = (time: string) => {
    setTimeFilter(time);
  };
  
  const calculateConversionRate = () => {
    if (lifetimeReferrals === 0) return 0;
    return (activeReferrals / lifetimeReferrals) * 100;
  };
  
  const calculateAverageCommission = () => {
    const subscribedReferrals = referrals.filter(r => r.status === 'subscribed');
    if (subscribedReferrals.length === 0) return 0;
    
    const totalCommission = subscribedReferrals.reduce((sum, r) => sum + r.commission, 0);
    return totalCommission / subscribedReferrals.length;
  };

  return (
    <>
      <Stack.Screen options={{ title: "Analytics" }} />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
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
            <Text style={styles.statValue}>{calculateConversionRate().toFixed(1)}%</Text>
            <Text style={styles.statLabel}>Conversion Rate</Text>
          </View>
        </View>
        
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Monthly Earnings</Text>
          <View style={styles.chart}>
            {mockMonthlyData.map((data, index) => (
              <View key={index} style={styles.chartColumn}>
                <View 
                  style={[
                    styles.chartBar, 
                    { 
                      height: data.earnings > 0 ? (data.earnings / maxEarnings) * 150 : 2,
                      backgroundColor: data.earnings > 0 ? Colors.light.primary : Colors.light.border
                    }
                  ]} 
                />
                <Text style={styles.chartLabel}>{data.month}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>Performance Insights</Text>
          
          <View style={styles.insightItem}>
            <View style={styles.insightIconContainer}>
              <DollarSign size={18} color={Colors.light.white} />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightLabel}>Average Commission</Text>
              <Text style={styles.insightValue}>${calculateAverageCommission().toFixed(2)} per referral</Text>
            </View>
          </View>
          
          <View style={styles.insightItem}>
            <View style={[styles.insightIconContainer, { backgroundColor: Colors.light.secondary }]}>
              <Users size={18} color={Colors.light.white} />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightLabel}>Active Subscribers</Text>
              <Text style={styles.insightValue}>{activeReferrals} active referrals</Text>
            </View>
          </View>
          
          <View style={styles.insightItem}>
            <View style={[styles.insightIconContainer, { backgroundColor: Colors.light.success }]}>
              <TrendingUp size={18} color={Colors.light.white} />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightLabel}>Conversion Rate</Text>
              <Text style={styles.insightValue}>{calculateConversionRate().toFixed(1)}% of referrals subscribe</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.referralsSection}>
          <View style={styles.referralsHeader}>
            <Text style={styles.sectionTitle}>All Referrals</Text>
            
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={toggleFilter}
              activeOpacity={0.7}
            >
              <Filter size={18} color={Colors.light.text} />
              <Text style={styles.filterButtonText}>Filter</Text>
              <ChevronDown size={16} color={Colors.light.text} />
            </TouchableOpacity>
          </View>
          
          {filterOpen && (
            <View style={styles.filterContainer}>
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Status</Text>
                <View style={styles.filterOptions}>
                  <TouchableOpacity 
                    style={[
                      styles.filterOption, 
                      statusFilter === null && styles.filterOptionActive
                    ]}
                    onPress={() => handleStatusFilter(null)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      statusFilter === null && styles.filterOptionTextActive
                    ]}>All</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.filterOption, 
                      statusFilter === 'subscribed' && styles.filterOptionActive
                    ]}
                    onPress={() => handleStatusFilter('subscribed')}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      statusFilter === 'subscribed' && styles.filterOptionTextActive
                    ]}>Subscribed</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.filterOption, 
                      statusFilter === 'registered' && styles.filterOptionActive
                    ]}
                    onPress={() => handleStatusFilter('registered')}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      statusFilter === 'registered' && styles.filterOptionTextActive
                    ]}>Registered</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.filterOption, 
                      statusFilter === 'pending' && styles.filterOptionActive
                    ]}
                    onPress={() => handleStatusFilter('pending')}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      statusFilter === 'pending' && styles.filterOptionTextActive
                    ]}>Pending</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Time Period</Text>
                <View style={styles.filterOptions}>
                  <TouchableOpacity 
                    style={[
                      styles.filterOption, 
                      timeFilter === 'all' && styles.filterOptionActive
                    ]}
                    onPress={() => handleTimeFilter('all')}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      timeFilter === 'all' && styles.filterOptionTextActive
                    ]}>All Time</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.filterOption, 
                      timeFilter === '30days' && styles.filterOptionActive
                    ]}
                    onPress={() => handleTimeFilter('30days')}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      timeFilter === '30days' && styles.filterOptionTextActive
                    ]}>Last 30 Days</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.filterOption, 
                      timeFilter === '90days' && styles.filterOptionActive
                    ]}
                    onPress={() => handleTimeFilter('90days')}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      timeFilter === '90days' && styles.filterOptionTextActive
                    ]}>Last 90 Days</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.filterOption, 
                      timeFilter === 'year' && styles.filterOptionActive
                    ]}
                    onPress={() => handleTimeFilter('year')}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      timeFilter === 'year' && styles.filterOptionTextActive
                    ]}>Last Year</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          
          {filteredReferrals.length === 0 ? (
            <View style={styles.emptyReferrals}>
              <Text style={styles.emptyReferralsText}>No referrals match your filters</Text>
            </View>
          ) : (
            filteredReferrals.map((referral) => (
              <View key={referral.id} style={styles.referralItem}>
                <View style={styles.referralHeader}>
                  <Text style={styles.referralName}>{referral.referredName || referral.referredEmail}</Text>
                  <View style={styles.referralStatusContainer}>
                    {getStatusIcon(referral.status)}
                    <Text style={[styles.referralStatus, { color: getStatusColor(referral.status) }]}>
                      {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.referralDetails}>
                  <View style={styles.referralDetail}>
                    <Calendar size={14} color={Colors.light.textLight} style={styles.referralDetailIcon} />
                    <Text style={styles.referralDetailText}>
                      {new Date(referral.date).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  {referral.plan && (
                    <View style={styles.referralDetail}>
                      <Text style={styles.referralPlan}>{referral.plan}</Text>
                    </View>
                  )}
                </View>
                
                {referral.status === 'subscribed' && (
                  <View style={styles.referralCommissionContainer}>
                    <Text style={styles.referralCommissionLabel}>Commission:</Text>
                    <Text style={styles.referralCommission}>${referral.commission.toFixed(2)}</Text>
                  </View>
                )}
              </View>
            ))
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
  chartCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.small,
  },
  chartTitle: {
    ...theme.typography.subtitle,
    marginBottom: theme.spacing.md,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
  },
  chartColumn: {
    alignItems: 'center',
    width: 20,
  },
  chartBar: {
    width: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.primary,
  },
  chartLabel: {
    ...theme.typography.caption,
    marginTop: 4,
    color: Colors.light.textLight,
  },
  insightsCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.small,
  },
  insightsTitle: {
    ...theme.typography.subtitle,
    marginBottom: theme.spacing.md,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  insightIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  insightContent: {
    flex: 1,
  },
  insightLabel: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
    marginBottom: 2,
  },
  insightValue: {
    ...theme.typography.body,
    fontWeight: '500',
  },
  referralsSection: {
    marginBottom: theme.spacing.lg,
  },
  referralsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.subtitle,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterButtonText: {
    ...theme.typography.caption,
    marginHorizontal: 4,
  },
  filterContainer: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  filterSection: {
    marginBottom: theme.spacing.md,
  },
  filterSectionTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterOptionActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterOptionText: {
    ...theme.typography.caption,
  },
  filterOptionTextActive: {
    color: Colors.light.white,
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
  referralHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
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
    marginBottom: theme.spacing.sm,
  },
  referralDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  referralDetailIcon: {
    marginRight: 4,
  },
  referralDetailText: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
  },
  referralPlan: {
    ...theme.typography.caption,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  referralCommissionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: theme.spacing.sm,
  },
  referralCommissionLabel: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
    marginRight: theme.spacing.xs,
  },
  referralCommission: {
    ...theme.typography.body,
    fontWeight: '600',
    color: Colors.light.success,
  },
});