import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { Calendar, ChevronDown, Users, MessageSquare, Book, Music, Quote, Activity, TrendingUp, TrendingDown, Filter } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';

// Mock data for analytics
const mockUserData = [
  { month: 'Jan', count: 120 },
  { month: 'Feb', count: 150 },
  { month: 'Mar', count: 180 },
  { month: 'Apr', count: 210 },
  { month: 'May', count: 250 },
  { month: 'Jun', count: 310 },
  { month: 'Jul', count: 350 },
  { month: 'Aug', count: 420 },
  { month: 'Sep', count: 480 },
  { month: 'Oct', count: 520 },
  { month: 'Nov', count: 580 },
  { month: 'Dec', count: 650 },
];

const mockContentData = {
  prayers: 3892,
  testimonials: 421,
  promises: 365,
  songs: 248,
  quotes: 512,
};

const mockEngagementData = {
  dailyActiveUsers: 842,
  weeklyActiveUsers: 1247,
  monthlyActiveUsers: 2105,
  averageSessionTime: '8m 42s',
  prayersPerUser: 3.2,
  testimonialConversion: '10.8%',
};

const mockPlatformData = {
  ios: 62,
  android: 35,
  web: 3,
};

const mockOrganizationData = [
  { name: 'First Baptist Church', members: 120, engagement: 78 },
  { name: 'Grace Community', members: 85, engagement: 92 },
  { name: 'Hope Fellowship', members: 210, engagement: 65 },
  { name: 'Cornerstone Chapel', members: 45, engagement: 88 },
  { name: 'New Life Church', members: 175, engagement: 71 },
];

export default function AnalyticsScreen() {
  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - (theme.spacing.lg * 2);
  
  // Calculate the max value for scaling the chart
  const maxUserCount = Math.max(...mockUserData.map(item => item.count));
  
  // Function to render the user growth chart
  const renderUserGrowthChart = () => {
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartBars}>
          {mockUserData.map((item, index) => (
            <View key={index} style={styles.barContainer}>
              <View 
                style={[
                  styles.bar, 
                  { 
                    height: (item.count / maxUserCount) * 150,
                    backgroundColor: index > 8 ? Colors.light.tint : '#3498db50',
                  }
                ]} 
              />
              <Text style={styles.barLabel}>{item.month}</Text>
            </View>
          ))}
        </View>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: Colors.light.tint }]} />
            <Text style={styles.legendText}>Current Quarter</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#3498db50' }]} />
            <Text style={styles.legendText}>Previous Quarters</Text>
          </View>
        </View>
      </View>
    );
  };

  // Function to render the platform distribution chart
  const renderPlatformChart = () => {
    return (
      <View style={styles.pieChartContainer}>
        <View style={styles.pieChart}>
          <View style={[styles.pieSlice, styles.iosSlice]} />
          <View style={[styles.pieSlice, styles.androidSlice]} />
          <View style={[styles.pieSlice, styles.webSlice]} />
          <View style={styles.pieCenter} />
        </View>
        <View style={styles.pieLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#3498db' }]} />
            <Text style={styles.legendText}>iOS ({mockPlatformData.ios}%)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#2ecc71' }]} />
            <Text style={styles.legendText}>Android ({mockPlatformData.android}%)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#9b59b6' }]} />
            <Text style={styles.legendText}>Web ({mockPlatformData.web}%)</Text>
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
          title: "Analytics Dashboard",
          headerTintColor: "#e74c3c"
        }}
      />

      <View style={styles.header}>
        <Text style={styles.title}>Analytics Dashboard</Text>
        <TouchableOpacity style={styles.timeRangeSelector}>
          <Calendar size={16} color={Colors.light.text} />
          <Text style={styles.timeRangeText}>{timeRange}</Text>
          <ChevronDown size={16} color={Colors.light.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>User Growth</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={16} color={Colors.light.icon} />
            <Text style={styles.filterText}>Filter</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>1,247</Text>
            <Text style={styles.kpiLabel}>Weekly Active Users</Text>
            <View style={styles.kpiTrend}>
              <TrendingUp size={14} color="#2ecc71" />
              <Text style={[styles.kpiTrendText, { color: '#2ecc71' }]}>+12%</Text>
            </View>
          </View>
          
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>2,105</Text>
            <Text style={styles.kpiLabel}>Monthly Active Users</Text>
            <View style={styles.kpiTrend}>
              <TrendingUp size={14} color="#2ecc71" />
              <Text style={[styles.kpiTrendText, { color: '#2ecc71' }]}>+8%</Text>
            </View>
          </View>
          
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>68%</Text>
            <Text style={styles.kpiLabel}>Retention Rate</Text>
            <View style={styles.kpiTrend}>
              <TrendingDown size={14} color="#e74c3c" />
              <Text style={[styles.kpiTrendText, { color: '#e74c3c' }]}>-2%</Text>
            </View>
          </View>
        </View>
        
        {renderUserGrowthChart()}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Content Engagement</Text>
        
        <View style={styles.contentCards}>
          <View style={styles.contentCard}>
            <MessageSquare size={24} color="#3498db" style={styles.contentIcon} />
            <Text style={styles.contentValue}>{mockContentData.prayers}</Text>
            <Text style={styles.contentLabel}>Prayers</Text>
          </View>
          
          <View style={styles.contentCard}>
            <Quote size={24} color="#9b59b6" style={styles.contentIcon} />
            <Text style={styles.contentValue}>{mockContentData.testimonials}</Text>
            <Text style={styles.contentLabel}>Testimonials</Text>
          </View>
          
          <View style={styles.contentCard}>
            <Book size={24} color="#f39c12" style={styles.contentIcon} />
            <Text style={styles.contentValue}>{mockContentData.promises}</Text>
            <Text style={styles.contentLabel}>Promises</Text>
          </View>
          
          <View style={styles.contentCard}>
            <Music size={24} color="#2ecc71" style={styles.contentIcon} />
            <Text style={styles.contentValue}>{mockContentData.songs}</Text>
            <Text style={styles.contentLabel}>Songs</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Engagement</Text>
        
        <View style={styles.engagementCards}>
          <View style={styles.engagementCard}>
            <View style={styles.engagementHeader}>
              <Activity size={18} color={Colors.light.tint} />
              <Text style={styles.engagementTitle}>Session Time</Text>
            </View>
            <Text style={styles.engagementValue}>{mockEngagementData.averageSessionTime}</Text>
            <Text style={styles.engagementLabel}>Avg. time per session</Text>
          </View>
          
          <View style={styles.engagementCard}>
            <View style={styles.engagementHeader}>
              <MessageSquare size={18} color={Colors.light.tint} />
              <Text style={styles.engagementTitle}>Prayer Activity</Text>
            </View>
            <Text style={styles.engagementValue}>{mockEngagementData.prayersPerUser}</Text>
            <Text style={styles.engagementLabel}>Prayers per user</Text>
          </View>
          
          <View style={styles.engagementCard}>
            <View style={styles.engagementHeader}>
              <Quote size={18} color={Colors.light.tint} />
              <Text style={styles.engagementTitle}>Testimonial Rate</Text>
            </View>
            <Text style={styles.engagementValue}>{mockEngagementData.testimonialConversion}</Text>
            <Text style={styles.engagementLabel}>Prayer to testimony conversion</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Platform Distribution</Text>
        {renderPlatformChart()}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Organizations</Text>
        
        <View style={styles.organizationsTable}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Organization</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Members</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Engagement</Text>
          </View>
          
          {mockOrganizationData.map((org, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]}>{org.name}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{org.members}</Text>
              <View style={[styles.tableCell, { flex: 1 }]}>
                <View style={styles.engagementBar}>
                  <View 
                    style={[
                      styles.engagementFill, 
                      { 
                        width: `${org.engagement}%`,
                        backgroundColor: org.engagement > 80 ? '#2ecc71' : 
                                        org.engagement > 70 ? '#f39c12' : '#e74c3c'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.engagementPercent}>{org.engagement}%</Text>
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
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.title,
    color: '#e74c3c',
  },
  timeRangeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  timeRangeText: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
  section: {
    marginBottom: theme.spacing.xl,
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.small,
    borderWidth: 1,
    borderColor: '#E5E5E5',
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
    color: Colors.light.icon,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  kpiCard: {
    width: '31%',
    backgroundColor: '#F8F9FA',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  kpiValue: {
    ...theme.typography.subtitle,
    fontSize: 20,
    marginBottom: 4,
  },
  kpiLabel: {
    ...theme.typography.caption,
    color: Colors.light.icon,
    textAlign: 'center',
    marginBottom: 4,
  },
  kpiTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  kpiTrendText: {
    fontSize: 12,
    fontWeight: '600',
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
    backgroundColor: Colors.light.tint,
  },
  barLabel: {
    ...theme.typography.caption,
    color: Colors.light.icon,
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
    color: Colors.light.icon,
  },
  contentCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  contentCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
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
    color: Colors.light.icon,
  },
  engagementCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  engagementCard: {
    width: '31%',
    backgroundColor: '#F8F9FA',
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
    color: Colors.light.icon,
    fontSize: 10,
  },
  pieChartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pieChart: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f1f1f1',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  pieSlice: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  iosSlice: {
    backgroundColor: '#3498db',
    width: '100%',
    height: '100%',
  },
  androidSlice: {
    backgroundColor: '#2ecc71',
    width: '62%',
    height: '100%',
    borderTopRightRadius: 75,
    borderBottomRightRadius: 75,
    right: 0,
    transform: [{ rotate: '0deg' }],
  },
  webSlice: {
    backgroundColor: '#9b59b6',
    width: '35%',
    height: '100%',
    borderTopRightRadius: 75,
    borderBottomRightRadius: 75,
    right: 0,
    transform: [{ rotate: '0deg' }],
  },
  pieCenter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.background,
    position: 'absolute',
  },
  pieLegend: {
    flex: 1,
    marginLeft: theme.spacing.lg,
  },
  organizationsTable: {
    backgroundColor: '#F8F9FA',
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tableHeaderCell: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: Colors.light.icon,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
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