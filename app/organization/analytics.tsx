import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { Calendar, ChevronDown, Users, MessageSquare, Book, Music, Quote, Activity, TrendingUp, TrendingDown, Filter, UserCheck, Clock } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';

// Mock data for organization analytics
const mockMemberData = [
  { month: 'Jan', count: 25 },
  { month: 'Feb', count: 28 },
  { month: 'Mar', count: 30 },
  { month: 'Apr', count: 32 },
  { month: 'May', count: 35 },
  { month: 'Jun', count: 38 },
  { month: 'Jul', count: 40 },
  { month: 'Aug', count: 42 },
  { month: 'Sep', count: 45 },
  { month: 'Oct', count: 48 },
  { month: 'Nov', count: 50 },
  { month: 'Dec', count: 52 },
];

const mockContentData = {
  prayers: 78,
  testimonials: 23,
  promises: 42,
  songs: 35,
  quotes: 18,
};

const mockEngagementData = {
  dailyActiveMembers: 28,
  weeklyActiveMembers: 42,
  monthlyActiveMembers: 52,
  averageSessionTime: '12m 18s',
  prayersPerMember: 1.8,
  testimonialConversion: '29.5%',
};

const mockGroupData = [
  { name: 'Youth Group', members: 12, engagement: 85 },
  { name: 'Women\'s Ministry', members: 18, engagement: 92 },
  { name: 'Men\'s Fellowship', members: 15, engagement: 78 },
  { name: 'Worship Team', members: 8, engagement: 95 },
  { name: 'Prayer Warriors', members: 10, engagement: 88 },
];

export default function OrganizationAnalyticsScreen() {
  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const { organization } = useUserStore();
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - (theme.spacing.lg * 2);
  
  // Calculate the max value for scaling the chart
  const maxMemberCount = Math.max(...mockMemberData.map(item => item.count));
  
  // Function to render the member growth chart
  const renderMemberGrowthChart = () => {
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartBars}>
          {mockMemberData.map((item, index) => (
            <View key={index} style={styles.barContainer}>
              <View 
                style={[
                  styles.bar, 
                  { 
                    height: (item.count / maxMemberCount) * 150,
                    backgroundColor: index > 8 ? Colors.light.org1 : '#4a6fa550',
                  }
                ]} 
              />
              <Text style={styles.barLabel}>{item.month}</Text>
            </View>
          ))}
        </View>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: Colors.light.org1 }]} />
            <Text style={styles.legendText}>Current Quarter</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#4a6fa550' }]} />
            <Text style={styles.legendText}>Previous Quarters</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen 
        options={{
          title: "Organization Analytics",
          headerTintColor: Colors.light.org1
        }}
      />

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{organization?.name || 'Organization'} Analytics</Text>
          <Text style={styles.subtitle}>Track your organization's growth and engagement</Text>
        </View>
        <TouchableOpacity style={styles.timeRangeSelector}>
          <Calendar size={16} color={Colors.light.text} />
          <Text style={styles.timeRangeText}>{timeRange}</Text>
          <ChevronDown size={16} color={Colors.light.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.overviewCards}>
        <View style={styles.overviewCard}>
          <Users size={24} color={Colors.light.org1} style={styles.overviewIcon} />
          <Text style={styles.overviewValue}>{organization?.memberCount || 52}</Text>
          <Text style={styles.overviewLabel}>Total Members</Text>
        </View>
        
        <View style={styles.overviewCard}>
          <UserCheck size={24} color={Colors.light.org2} style={styles.overviewIcon} />
          <Text style={styles.overviewValue}>{mockEngagementData.weeklyActiveMembers}</Text>
          <Text style={styles.overviewLabel}>Active Members</Text>
        </View>
        
        <View style={styles.overviewCard}>
          <MessageSquare size={24} color={Colors.light.org3} style={styles.overviewIcon} />
          <Text style={styles.overviewValue}>{mockContentData.prayers}</Text>
          <Text style={styles.overviewLabel}>Prayers</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Member Growth</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={16} color={Colors.light.textLight} />
            <Text style={styles.filterText}>Filter</Text>
          </TouchableOpacity>
        </View>
        
        {renderMemberGrowthChart()}
        
        <View style={styles.growthStats}>
          <View style={styles.growthStat}>
            <Text style={styles.growthValue}>+4</Text>
            <Text style={styles.growthLabel}>This Month</Text>
          </View>
          
          <View style={styles.growthStat}>
            <Text style={styles.growthValue}>+12</Text>
            <Text style={styles.growthLabel}>This Quarter</Text>
          </View>
          
          <View style={styles.growthStat}>
            <Text style={styles.growthValue}>+27</Text>
            <Text style={styles.growthLabel}>This Year</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Member Engagement</Text>
        
        <View style={styles.engagementCards}>
          <View style={styles.engagementCard}>
            <View style={styles.engagementHeader}>
              <Activity size={18} color={Colors.light.org1} />
              <Text style={styles.engagementTitle}>Activity Rate</Text>
            </View>
            <Text style={styles.engagementValue}>81%</Text>
            <Text style={styles.engagementLabel}>Weekly active members</Text>
            <View style={styles.engagementTrend}>
              <TrendingUp size={14} color="#2ecc71" />
              <Text style={[styles.engagementTrendText, { color: '#2ecc71' }]}>+5%</Text>
            </View>
          </View>
          
          <View style={styles.engagementCard}>
            <View style={styles.engagementHeader}>
              <Clock size={18} color={Colors.light.org1} />
              <Text style={styles.engagementTitle}>Session Time</Text>
            </View>
            <Text style={styles.engagementValue}>{mockEngagementData.averageSessionTime}</Text>
            <Text style={styles.engagementLabel}>Avg. time per session</Text>
            <View style={styles.engagementTrend}>
              <TrendingUp size={14} color="#2ecc71" />
              <Text style={[styles.engagementTrendText, { color: '#2ecc71' }]}>+2m</Text>
            </View>
          </View>
          
          <View style={styles.engagementCard}>
            <View style={styles.engagementHeader}>
              <MessageSquare size={18} color={Colors.light.org1} />
              <Text style={styles.engagementTitle}>Prayer Activity</Text>
            </View>
            <Text style={styles.engagementValue}>{mockEngagementData.prayersPerMember}</Text>
            <Text style={styles.engagementLabel}>Prayers per member</Text>
            <View style={styles.engagementTrend}>
              <TrendingDown size={14} color="#e74c3c" />
              <Text style={[styles.engagementTrendText, { color: '#e74c3c' }]}>-0.2</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Content Engagement</Text>
        
        <View style={styles.contentCards}>
          <View style={styles.contentCard}>
            <MessageSquare size={24} color={Colors.light.org1} style={styles.contentIcon} />
            <Text style={styles.contentValue}>{mockContentData.prayers}</Text>
            <Text style={styles.contentLabel}>Prayers</Text>
          </View>
          
          <View style={styles.contentCard}>
            <Quote size={24} color={Colors.light.org2} style={styles.contentIcon} />
            <Text style={styles.contentValue}>{mockContentData.testimonials}</Text>
            <Text style={styles.contentLabel}>Testimonials</Text>
          </View>
          
          <View style={styles.contentCard}>
            <Book size={24} color={Colors.light.org3} style={styles.contentIcon} />
            <Text style={styles.contentValue}>{mockContentData.promises}</Text>
            <Text style={styles.contentLabel}>Promises</Text>
          </View>
          
          <View style={styles.contentCard}>
            <Music size={24} color="#9c27b0" style={styles.contentIcon} />
            <Text style={styles.contentValue}>{mockContentData.songs}</Text>
            <Text style={styles.contentLabel}>Songs</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Group Performance</Text>
        
        <View style={styles.groupsTable}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Group</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Members</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Engagement</Text>
          </View>
          
          {mockGroupData.map((group, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]}>{group.name}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{group.members}</Text>
              <View style={[styles.tableCell, { flex: 1 }]}>
                <View style={styles.engagementBar}>
                  <View 
                    style={[
                      styles.engagementFill, 
                      { 
                        width: `${group.engagement}%`,
                        backgroundColor: group.engagement > 90 ? Colors.light.org2 : 
                                        group.engagement > 80 ? Colors.light.org1 : Colors.light.org3
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.engagementPercent}>{group.engagement}%</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.title,
    color: Colors.light.org1,
  },
  subtitle: {
    ...theme.typography.body,
    color: Colors.light.textLight,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
    gap: 6,
  },
  timeRangeText: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
  overviewCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  overviewCard: {
    width: '31%',
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  overviewIcon: {
    marginBottom: theme.spacing.sm,
  },
  overviewValue: {
    ...theme.typography.subtitle,
    fontSize: 20,
    marginBottom: 4,
  },
  overviewLabel: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
    textAlign: 'center',
  },
  section: {
    marginBottom: theme.spacing.xl,
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.small,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.subtitle,
    marginBottom: theme.spacing.md,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterText: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
  },
  chartContainer: {
    marginTop: theme.spacing.md,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
    paddingBottom: 20,
  },
  barContainer: {
    alignItems: 'center',
    width: 20,
  },
  bar: {
    width: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.org1,
  },
  barLabel: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
    marginTop: 4,
    fontSize: 10,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
  },
  growthStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  growthStat: {
    alignItems: 'center',
  },
  growthValue: {
    ...theme.typography.subtitle,
    color: Colors.light.org1,
    fontSize: 18,
  },
  growthLabel: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
  },
  engagementCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  engagementCard: {
    width: '31%',
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  engagementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: 4,
  },
  engagementTitle: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
  engagementValue: {
    ...theme.typography.subtitle,
    fontSize: 18,
    marginBottom: 2,
  },
  engagementLabel: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
    fontSize: 10,
    marginBottom: 4,
  },
  engagementTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  engagementTrendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  contentCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  contentCard: {
    width: '48%',
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  contentIcon: {
    marginBottom: theme.spacing.sm,
  },
  contentValue: {
    ...theme.typography.subtitle,
    fontSize: 20,
    marginBottom: 4,
  },
  contentLabel: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
  },
  groupsTable: {
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.light.background,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  tableHeaderCell: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: Colors.light.textLight,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  tableCell: {
    ...theme.typography.body,
    fontSize: 14,
  },
  engagementBar: {
    height: 6,
    backgroundColor: '#f1f1f1',
    borderRadius: 3,
    marginBottom: 4,
    width: '100%',
  },
  engagementFill: {
    height: '100%',
    borderRadius: 3,
  },
  engagementPercent: {
    ...theme.typography.caption,
    fontSize: 12,
  },
});