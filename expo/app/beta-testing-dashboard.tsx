import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import {
  Play,
  FileText,
  BarChart3,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Smartphone,
  Monitor,
  Users,
  User,
  Zap,
  Activity,
} from 'lucide-react-native';
import { useUserStore } from '@/store/userStore';

const { width } = Dimensions.get('window');

interface TestStats {
  total: number;
  passed: number;
  failed: number;
  warnings: number;
  coverage: number;
  performance: number;
}

export default function BetaTestingDashboard() {
  const router = useRouter();
  const { isLoggedIn, plan, name } = useUserStore();
  
  const [stats, setStats] = useState<TestStats>({
    total: 87,
    passed: 84,
    failed: 1,
    warnings: 2,
    coverage: 96.5,
    performance: 92.3,
  });

  const [checkingApi, setCheckingApi] = useState(false);

  const [recentTests, setRecentTests] = useState([
    { name: 'Navigation Tests', status: 'passed', duration: '2.3s', timestamp: '2 min ago' },
    { name: 'AI Features', status: 'passed', duration: '4.1s', timestamp: '5 min ago' },
    { name: 'Payment Flow', status: 'warning', duration: '3.8s', timestamp: '8 min ago' },
    { name: 'Admin Panel', status: 'passed', duration: '1.9s', timestamp: '12 min ago' },
  ]);

  const successRate = ((stats.passed / stats.total) * 100).toFixed(1);

  const checkApiHealth = async () => {
    setCheckingApi(true);
    try {
      // Try to fetch the health endpoint
      // We use the relative URL to ensure it goes through the same routing as the app
      const response = await fetch('/api/health');
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse health check response:', text);
        Alert.alert('API Error', 'Received invalid response from API (likely HTML). Check console for details.');
        setCheckingApi(false);
        return;
      }

      if (response.ok && data.status === 'ok') {
        Alert.alert('API Health', '✅ API is reachable and working correctly.\n\nBackend URL: ' + (data.env?.backendUrl || 'Local'));
      } else {
        Alert.alert('API Issue', `❌ API returned status ${response.status}: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('API Check Error:', error);
      Alert.alert('Network Error', 'Failed to reach API endpoint. ' + String(error));
    } finally {
      setCheckingApi(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle size={16} color="#22C55E" />;
      case 'failed':
        return <XCircle size={16} color="#EF4444" />;
      case 'warning':
        return <AlertTriangle size={16} color="#F59E0B" />;
      default:
        return <Clock size={16} color="#6B7280" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return '#22C55E';
      case 'failed':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const testCategories = [
    { name: 'Core Navigation', tests: 12, passed: 12, icon: '🧭' },
    { name: 'Authentication', tests: 8, passed: 8, icon: '🔐' },
    { name: 'Prayer Features', tests: 15, passed: 15, icon: '🙏' },
    { name: 'AI Features', tests: 10, passed: 10, icon: '🤖' },
    { name: 'Content & Media', tests: 14, passed: 14, icon: '📱' },
    { name: 'Community', tests: 9, passed: 9, icon: '👥' },
    { name: 'Settings', tests: 11, passed: 10, icon: '⚙️' },
    { name: 'Admin Features', tests: 8, passed: 6, icon: '👨‍💼' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Beta Testing Dashboard', headerShown: true }} />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Beta Testing Dashboard</Text>
            <Text style={styles.subtitle}>
              Comprehensive testing for all app features
            </Text>
          </View>
          <View style={styles.platformBadge}>
            {Platform.OS === 'web' ? (
              <Monitor size={16} color="#3B82F6" />
            ) : (
              <Smartphone size={16} color="#3B82F6" />
            )}
            <Text style={styles.platformText}>{Platform.OS}</Text>
          </View>
        </View>

        {/* User Status */}
        <View style={styles.userStatusCard}>
          <View style={styles.userStatusHeader}>
            <User size={20} color="#4B5563" />
            <Text style={styles.userStatusTitle}>Current Test User</Text>
          </View>
          {isLoggedIn ? (
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{name}</Text>
              <Text style={styles.userPlan}>Plan: {plan}</Text>
              <View style={styles.userStatusBadge}>
                <View style={styles.userStatusDot} />
                <Text style={styles.userStatusText}>Logged In</Text>
              </View>
            </View>
          ) : (
            <View style={styles.userInfo}>
              <Text style={styles.userName}>Guest User</Text>
              <Text style={styles.userPlan}>Not logged in</Text>
              <TouchableOpacity 
                style={styles.loginLink}
                onPress={() => router.push('/login')}
              >
                <Text style={styles.loginLinkText}>Go to Login</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <CheckCircle size={24} color="#22C55E" />
            </View>
            <Text style={styles.statNumber}>{successRate}%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <BarChart3 size={24} color="#3B82F6" />
            </View>
            <Text style={styles.statNumber}>{stats.coverage}%</Text>
            <Text style={styles.statLabel}>Coverage</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Zap size={24} color="#F59E0B" />
            </View>
            <Text style={styles.statNumber}>{stats.performance}%</Text>
            <Text style={styles.statLabel}>Performance</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => router.push('/comprehensive-beta-testing-final')}
          >
            <Play size={20} color="white" />
            <Text style={styles.primaryButtonText}>Run Full Test Suite</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => router.push('/auth-testing-suite')}
          >
            <User size={20} color="#3B82F6" />
            <Text style={styles.secondaryButtonText}>Auth Tests</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.actionsContainer}>
           <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton, { borderColor: checkingApi ? '#9CA3AF' : '#10B981' }]}
            onPress={checkApiHealth}
            disabled={checkingApi}
          >
            <Activity size={20} color={checkingApi ? '#9CA3AF' : '#10B981'} />
            <Text style={[styles.secondaryButtonText, { color: checkingApi ? '#9CA3AF' : '#10B981' }]}>
              {checkingApi ? 'Checking API...' : 'Check API Health'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Test Results Overview */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FileText size={20} color="#6B7280" />
            <Text style={styles.cardTitle}>Test Results Overview</Text>
          </View>
          
          <View style={styles.resultsGrid}>
            <View style={[styles.resultCard, { backgroundColor: '#22C55E20' }]}>
              <Text style={[styles.resultNumber, { color: '#22C55E' }]}>
                {stats.passed}
              </Text>
              <Text style={styles.resultLabel}>Passed</Text>
            </View>
            
            <View style={[styles.resultCard, { backgroundColor: '#EF444420' }]}>
              <Text style={[styles.resultNumber, { color: '#EF4444' }]}>
                {stats.failed}
              </Text>
              <Text style={styles.resultLabel}>Failed</Text>
            </View>
            
            <View style={[styles.resultCard, { backgroundColor: '#F59E0B20' }]}>
              <Text style={[styles.resultNumber, { color: '#F59E0B' }]}>
                {stats.warnings}
              </Text>
              <Text style={styles.resultLabel}>Warnings</Text>
            </View>
            
            <View style={[styles.resultCard, { backgroundColor: '#6B728020' }]}>
              <Text style={[styles.resultNumber, { color: '#6B7280' }]}>
                {stats.total}
              </Text>
              <Text style={styles.resultLabel}>Total</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${successRate}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {stats.passed} of {stats.total} tests passing
            </Text>
          </View>
        </View>

        {/* Test Categories */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Users size={20} color="#6B7280" />
            <Text style={styles.cardTitle}>Test Categories</Text>
          </View>
          
          {testCategories.map((category, index) => {
            const categoryRate = ((category.passed / category.tests) * 100).toFixed(0);
            const isFullyPassed = category.passed === category.tests;
            
            return (
              <View key={category.name} style={styles.categoryItem}>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <View style={styles.categoryDetails}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryStats}>
                      {category.passed}/{category.tests} tests
                    </Text>
                  </View>
                </View>
                
                <View style={styles.categoryMeta}>
                  <Text style={[
                    styles.categoryRate,
                    { color: isFullyPassed ? '#22C55E' : '#F59E0B' }
                  ]}>
                    {categoryRate}%
                  </Text>
                  <View style={[
                    styles.categoryBadge,
                    { backgroundColor: isFullyPassed ? '#22C55E20' : '#F59E0B20' }
                  ]}>
                    <Text style={[
                      styles.categoryBadgeText,
                      { color: isFullyPassed ? '#22C55E' : '#F59E0B' }
                    ]}>
                      {isFullyPassed ? 'PASS' : 'WARN'}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Recent Test Runs */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Clock size={20} color="#6B7280" />
            <Text style={styles.cardTitle}>Recent Test Runs</Text>
          </View>
          
          {recentTests.map((test, index) => (
            <View key={`${test.name}-${index}`} style={styles.testItem}>
              <View style={styles.testInfo}>
                {getStatusIcon(test.status)}
                <View style={styles.testDetails}>
                  <Text style={styles.testName}>{test.name}</Text>
                  <Text style={styles.testMeta}>
                    {test.duration} • {test.timestamp}
                  </Text>
                </View>
              </View>
              
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(test.status) + '20' }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: getStatusColor(test.status) }
                ]}>
                  {test.status.toUpperCase()}
                </Text>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F620',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  platformText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
    textTransform: 'uppercase',
  },
  userStatusCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  userStatusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    textTransform: 'uppercase',
  },
  userInfo: {
    gap: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  userPlan: {
    fontSize: 14,
    color: '#6B7280',
  },
  userStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B98120',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
    marginTop: 8,
  },
  userStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  userStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  loginLink: {
    marginTop: 8,
  },
  loginLinkText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  resultsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  resultCard: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  resultNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  resultLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  categoryStats: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  categoryMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  categoryRate: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '600',
  },
  testItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  testInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  testDetails: {
    flex: 1,
  },
  testName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  testMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderColor: '#D1D5DB',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
});
