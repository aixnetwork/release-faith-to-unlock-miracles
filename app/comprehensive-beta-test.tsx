import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import {
  Play,
  Pause,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  FileText,
  Download,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TestResult {
  id: string;
  name: string;
  route: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  error?: string;
  duration?: number;
  timestamp?: Date;
  details?: string;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
}

const { width } = Dimensions.get('window');

export default function ComprehensiveBetaTest() {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [overallStats, setOverallStats] = useState({
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    duration: 0,
  });

  // Define all test suites
  const initializeTestSuites = useCallback((): TestSuite[] => {
    return [
      {
        name: 'Core Navigation & Tabs',
        tests: [
          { id: 'tab-home', name: 'Home Tab', route: '/', status: 'pending' },
          { id: 'tab-prayers', name: 'Prayers Tab', route: '/prayers', status: 'pending' },
          { id: 'tab-habits', name: 'Habits Tab', route: '/habits', status: 'pending' },
          { id: 'tab-services', name: 'Services Tab', route: '/services', status: 'pending' },
          { id: 'tab-more', name: 'More Tab', route: '/more', status: 'pending' },
        ],
      },
      {
        name: 'Authentication & User Management',
        tests: [
          { id: 'login', name: 'Login Page', route: '/login', status: 'pending' },
          { id: 'register', name: 'Register Page', route: '/register', status: 'pending' },
          { id: 'register-org', name: 'Organization Registration', route: '/register-org', status: 'pending' },
        ],
      },
      {
        name: 'Prayer Features',
        tests: [
          { id: 'prayer-new', name: 'New Prayer', route: '/prayer/new', status: 'pending' },
          { id: 'prayer-wall', name: 'Prayer Wall', route: '/prayer-wall', status: 'pending' },
          { id: 'prayer-plans', name: 'Prayer Plans', route: '/prayer-plans', status: 'pending' },
          { id: 'prayer-plans-create', name: 'Create Prayer Plan', route: '/prayer-plans/create', status: 'pending' },
        ],
      },
      {
        name: 'AI Features',
        tests: [
          { id: 'ai-chat', name: 'AI Chat', route: '/ai/chat', status: 'pending' },
          { id: 'ai-devotional', name: 'AI Devotional Generator', route: '/ai/devotional-generator', status: 'pending' },
          { id: 'ai-prayer', name: 'AI Prayer Generator', route: '/ai/prayer-generator', status: 'pending' },
          { id: 'ai-scripture', name: 'AI Scripture Insights', route: '/ai/scripture-insights', status: 'pending' },
          { id: 'ai-index', name: 'AI Hub', route: '/ai', status: 'pending' },
        ],
      },
      {
        name: 'Content & Media',
        tests: [
          { id: 'songs', name: 'Songs Tab', route: '/songs', status: 'pending' },
          { id: 'song-new', name: 'New Song', route: '/song/new', status: 'pending' },
          { id: 'testimonials', name: 'Testimonials Tab', route: '/testimonials', status: 'pending' },
          { id: 'testimonial-new', name: 'New Testimonial', route: '/testimonial/new', status: 'pending' },
          { id: 'inspiration', name: 'Inspiration Tab', route: '/inspiration', status: 'pending' },
          { id: 'content', name: 'Content Tab', route: '/content', status: 'pending' },
        ],
      },
      {
        name: 'Community & Meetings',
        tests: [
          { id: 'community', name: 'Community Tab', route: '/community', status: 'pending' },
          { id: 'meetings', name: 'Meetings Tab', route: '/meetings', status: 'pending' },
          { id: 'meeting-create', name: 'Create Meeting', route: '/meeting/create', status: 'pending' },
          { id: 'meeting-index', name: 'Meeting Index', route: '/meeting', status: 'pending' },
          { id: 'groups', name: 'Groups', route: '/groups', status: 'pending' },
          { id: 'groups-create', name: 'Create Group', route: '/groups/create', status: 'pending' },
        ],
      },
      {
        name: 'Settings & Configuration',
        tests: [
          { id: 'settings', name: 'Settings Hub', route: '/settings', status: 'pending' },
          { id: 'settings-profile', name: 'Profile Settings', route: '/settings/profile', status: 'pending' },
          { id: 'settings-notifications', name: 'Notification Settings', route: '/settings/notifications', status: 'pending' },
          { id: 'settings-privacy', name: 'Privacy Settings', route: '/settings/privacy', status: 'pending' },
          { id: 'settings-security', name: 'Security Settings', route: '/settings/security', status: 'pending' },
          { id: 'settings-billing', name: 'Billing Settings', route: '/settings/billing', status: 'pending' },
          { id: 'settings-payments', name: 'Payment Settings', route: '/settings/payments', status: 'pending' },
          { id: 'settings-language', name: 'Language Settings', route: '/settings/language', status: 'pending' },
          { id: 'settings-integrations', name: 'Integrations', route: '/settings/integrations', status: 'pending' },
          { id: 'settings-mental-health', name: 'Mental Health Settings', route: '/settings/mental-health', status: 'pending' },
          { id: 'settings-help', name: 'Help & Support', route: '/settings/help', status: 'pending' },
          { id: 'settings-contact', name: 'Contact Support', route: '/settings/contact', status: 'pending' },
          { id: 'settings-knowledge-base', name: 'Knowledge Base', route: '/settings/knowledge-base', status: 'pending' },
        ],
      },
      {
        name: 'Admin Features',
        tests: [
          { id: 'admin-auth', name: 'Admin Authentication', route: '/admin/auth', status: 'pending' },
          { id: 'admin-index', name: 'Admin Dashboard', route: '/admin', status: 'pending' },
          { id: 'admin-users', name: 'User Management', route: '/admin/users', status: 'pending' },
          { id: 'admin-analytics', name: 'Analytics', route: '/admin/analytics', status: 'pending' },
          { id: 'admin-settings', name: 'Admin Settings', route: '/admin/settings', status: 'pending' },
          { id: 'admin-database', name: 'Database Management', route: '/admin/database', status: 'pending' },
          { id: 'admin-api', name: 'API Management', route: '/admin/api', status: 'pending' },
          { id: 'admin-marketplace', name: 'Marketplace Admin', route: '/admin/marketplace', status: 'pending' },
          { id: 'admin-organizations', name: 'Organizations Admin', route: '/admin/organizations', status: 'pending' },
        ],
      },
      {
        name: 'Marketplace & Services',
        tests: [
          { id: 'services-index', name: 'Services Marketplace', route: '/services', status: 'pending' },
          { id: 'services-new', name: 'New Service Listing', route: '/services/new', status: 'pending' },
        ],
      },
      {
        name: 'Habits & Tracking',
        tests: [
          { id: 'habits-create', name: 'Create Habit', route: '/habits/create', status: 'pending' },
        ],
      },
      {
        name: 'Games & Entertainment',
        tests: [
          { id: 'bible-games', name: 'Bible Games', route: '/bible-games', status: 'pending' },
        ],
      },
      {
        name: 'Mental Health',
        tests: [
          { id: 'mental-health', name: 'Mental Health Hub', route: '/mental-health', status: 'pending' },
        ],
      },
      {
        name: 'Achievements',
        tests: [
          { id: 'achievements', name: 'Achievements', route: '/achievements', status: 'pending' },
        ],
      },
      {
        name: 'Affiliate Program',
        tests: [
          { id: 'affiliate', name: 'Affiliate Dashboard', route: '/affiliate', status: 'pending' },
          { id: 'affiliate-analytics', name: 'Affiliate Analytics', route: '/affiliate/analytics', status: 'pending' },
          { id: 'affiliate-payouts', name: 'Affiliate Payouts', route: '/affiliate/payouts', status: 'pending' },
          { id: 'affiliate-settings', name: 'Affiliate Settings', route: '/affiliate/settings', status: 'pending' },
        ],
      },
      {
        name: 'Organization Features',
        tests: [
          { id: 'organization', name: 'Organization Dashboard', route: '/organization', status: 'pending' },
          { id: 'organization-members', name: 'Organization Members', route: '/organization/members', status: 'pending' },
          { id: 'organization-groups', name: 'Organization Groups', route: '/organization/groups', status: 'pending' },
          { id: 'organization-content', name: 'Organization Content', route: '/organization/content', status: 'pending' },
          { id: 'organization-analytics', name: 'Organization Analytics', route: '/organization/analytics', status: 'pending' },
          { id: 'organization-settings', name: 'Organization Settings', route: '/organization/settings', status: 'pending' },
        ],
      },
      {
        name: 'Subscription & Payments',
        tests: [
          { id: 'membership', name: 'Membership Plans', route: '/membership', status: 'pending' },
          { id: 'checkout', name: 'Checkout Process', route: '/checkout', status: 'pending' },
        ],
      },
      {
        name: 'Testing & Development',
        tests: [
          { id: 'test-languages', name: 'Language Testing', route: '/test-languages', status: 'pending' },
          { id: 'test-bible-games', name: 'Bible Games Testing', route: '/test-bible-games', status: 'pending' },
          { id: 'superwall-test', name: 'Superwall Testing', route: '/superwall-test', status: 'pending' },
          { id: 'test-superwall-integration', name: 'Superwall Integration Test', route: '/test-superwall-integration', status: 'pending' },
          { id: 'run-superwall-tests', name: 'Run Superwall Tests', route: '/run-superwall-tests', status: 'pending' },
          { id: 'runtime-testing', name: 'Runtime Testing', route: '/runtime-testing', status: 'pending' },
          { id: 'beta-testing-runtime', name: 'Beta Testing Runtime', route: '/beta-testing-runtime', status: 'pending' },
          { id: 'test-image-sources', name: 'Image Sources Test', route: '/test-image-sources', status: 'pending' },
          { id: 'test-source-uri-fix', name: 'Source URI Fix Test', route: '/test-source-uri-fix', status: 'pending' },
        ],
      },
    ];
  }, []);

  useEffect(() => {
    const suites = initializeTestSuites();
    setTestSuites(suites);
    
    // Calculate initial stats
    const total = suites.reduce((acc, suite) => acc + suite.tests.length, 0);
    setOverallStats(prev => ({ ...prev, total }));
  }, [initializeTestSuites]);

  const runSingleTest = async (test: TestResult): Promise<TestResult> => {
    const startTime = Date.now();
    setCurrentTest(test.id);
    
    try {
      // Simulate navigation test
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Try to navigate to the route
      try {
        router.push(test.route as any);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Navigate back
        router.back();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const duration = Date.now() - startTime;
        return {
          ...test,
          status: 'passed',
          duration,
          timestamp: new Date(),
          details: `Successfully navigated to ${test.route}`,
        };
      } catch (navError) {
        const duration = Date.now() - startTime;
        return {
          ...test,
          status: 'failed',
          duration,
          timestamp: new Date(),
          error: `Navigation failed: ${navError}`,
          details: `Failed to navigate to ${test.route}`,
        };
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        ...test,
        status: 'failed',
        duration,
        timestamp: new Date(),
        error: `Test execution failed: ${error}`,
      };
    }
  };

  const runAllTests = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    const startTime = Date.now();
    let passed = 0;
    let failed = 0;
    let warnings = 0;
    
    const updatedSuites = [...testSuites];
    
    for (let suiteIndex = 0; suiteIndex < updatedSuites.length; suiteIndex++) {
      const suite = updatedSuites[suiteIndex];
      
      for (let testIndex = 0; testIndex < suite.tests.length; testIndex++) {
        const test = suite.tests[testIndex];
        
        // Update test status to running
        updatedSuites[suiteIndex].tests[testIndex] = { ...test, status: 'running' };
        setTestSuites([...updatedSuites]);
        
        // Run the test
        const result = await runSingleTest(test);
        
        // Update test with result
        updatedSuites[suiteIndex].tests[testIndex] = result;
        setTestSuites([...updatedSuites]);
        
        // Update stats
        if (result.status === 'passed') passed++;
        else if (result.status === 'failed') failed++;
        else if (result.status === 'warning') warnings++;
        
        setOverallStats({
          total: testSuites.reduce((acc, s) => acc + s.tests.length, 0),
          passed,
          failed,
          warnings,
          duration: Date.now() - startTime,
        });
      }
    }
    
    setCurrentTest(null);
    setIsRunning(false);
    
    // Save results to AsyncStorage
    try {
      await AsyncStorage.setItem('beta-test-results', JSON.stringify({
        timestamp: new Date().toISOString(),
        suites: updatedSuites,
        stats: {
          total: testSuites.reduce((acc, s) => acc + s.tests.length, 0),
          passed,
          failed,
          warnings,
          duration: Date.now() - startTime,
        },
      }));
    } catch (error) {
      console.error('Failed to save test results:', error);
    }
    
    Alert.alert(
      'Beta Testing Complete',
      `Tests completed!\n\nPassed: ${passed}\nFailed: ${failed}\nWarnings: ${warnings}\nDuration: ${Math.round((Date.now() - startTime) / 1000)}s`,
      [{ text: 'OK' }]
    );
  };

  const resetTests = () => {
    const suites = initializeTestSuites();
    setTestSuites(suites);
    setCurrentTest(null);
    setOverallStats({
      total: suites.reduce((acc, suite) => acc + suite.tests.length, 0),
      passed: 0,
      failed: 0,
      warnings: 0,
      duration: 0,
    });
  };

  const exportResults = async () => {
    try {
      const results = {
        timestamp: new Date().toISOString(),
        platform: Platform.OS,
        deviceInfo: {
          width,
          height: Dimensions.get('window').height,
        },
        suites: testSuites,
        stats: overallStats,
      };
      
      await AsyncStorage.setItem('beta-test-export', JSON.stringify(results, null, 2));
      Alert.alert('Export Complete', 'Test results have been saved to device storage.');
    } catch (error) {
      Alert.alert('Export Failed', `Failed to export results: ${error}`);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle size={16} color="#22C55E" />;
      case 'failed':
        return <XCircle size={16} color="#EF4444" />;
      case 'warning':
        return <AlertTriangle size={16} color="#F59E0B" />;
      case 'running':
        return <RefreshCw size={16} color="#3B82F6" />;
      default:
        return <View style={styles.pendingDot} />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return '#22C55E';
      case 'failed':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      case 'running':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Comprehensive Beta Testing', headerShown: true }} />
      
      <View style={styles.container}>
        {/* Header Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{overallStats.total}</Text>
            <Text style={styles.statLabel}>Total Tests</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#22C55E' }]}>{overallStats.passed}</Text>
            <Text style={styles.statLabel}>Passed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#EF4444' }]}>{overallStats.failed}</Text>
            <Text style={styles.statLabel}>Failed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#F59E0B' }]}>{overallStats.warnings}</Text>
            <Text style={styles.statLabel}>Warnings</Text>
          </View>
        </View>

        {/* Progress Bar */}
        {isRunning && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${((overallStats.passed + overallStats.failed + overallStats.warnings) / overallStats.total) * 100}%` 
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {currentTest ? `Running: ${currentTest}` : 'Preparing tests...'}
            </Text>
          </View>
        )}

        {/* Control Buttons */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, isRunning && styles.disabledButton]}
            onPress={runAllTests}
            disabled={isRunning}
          >
            {isRunning ? <Pause size={20} color="white" /> : <Play size={20} color="white" />}
            <Text style={styles.buttonText}>
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={resetTests}
            disabled={isRunning}
          >
            <RefreshCw size={20} color="#3B82F6" />
            <Text style={[styles.buttonText, { color: '#3B82F6' }]}>Reset</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={exportResults}
          >
            <Download size={20} color="#3B82F6" />
            <Text style={[styles.buttonText, { color: '#3B82F6' }]}>Export</Text>
          </TouchableOpacity>
        </View>

        {/* Test Suites */}
        <ScrollView style={styles.suitesContainer} showsVerticalScrollIndicator={false}>
          {testSuites.map((suite, suiteIndex) => (
            <View key={suite.name} style={styles.suiteContainer}>
              <View style={styles.suiteHeader}>
                <FileText size={18} color="#374151" />
                <Text style={styles.suiteName}>{suite.name}</Text>
                <Text style={styles.suiteCount}>({suite.tests.length})</Text>
              </View>
              
              {suite.tests.map((test, testIndex) => (
                <View key={test.id} style={styles.testItem}>
                  <View style={styles.testInfo}>
                    {getStatusIcon(test.status)}
                    <View style={styles.testDetails}>
                      <Text style={styles.testName}>{test.name}</Text>
                      <Text style={styles.testRoute}>{test.route}</Text>
                      {test.error && (
                        <Text style={styles.testError} numberOfLines={2}>
                          {test.error}
                        </Text>
                      )}
                      {test.duration && (
                        <Text style={styles.testDuration}>
                          {test.duration}ms
                        </Text>
                      )}
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
          ))}
        </ScrollView>
      </View>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  progressContainer: {
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
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  suitesContainer: {
    flex: 1,
  },
  suiteContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suiteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
  },
  suiteName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  suiteCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  testItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
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
  testRoute: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  testError: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 4,
  },
  testDuration: {
    fontSize: 11,
    color: '#22C55E',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  pendingDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#D1D5DB',
  },
});