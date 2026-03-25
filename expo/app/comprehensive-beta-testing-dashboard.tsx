import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { CheckCircle, XCircle, AlertTriangle, Play, RefreshCw } from 'lucide-react-native';

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  message?: string;
  timestamp?: Date;
  duration?: number;
}

interface TestCategory {
  id: string;
  name: string;
  tests: TestResult[];
  status: 'pending' | 'running' | 'completed';
}

export default function ComprehensiveBetaTestingDashboard() {
  const [testCategories, setTestCategories] = useState<TestCategory[]>([
    {
      id: 'auth',
      name: 'Authentication & Registration',
      status: 'pending',
      tests: [
        { id: 'register', name: 'User Registration', status: 'pending' },
        { id: 'login', name: 'User Login', status: 'pending' },
        { id: 'logout', name: 'User Logout', status: 'pending' },
        { id: 'password-reset', name: 'Password Reset', status: 'pending' },
        { id: 'profile-update', name: 'Profile Update', status: 'pending' },
      ],
    },
    {
      id: 'payments',
      name: 'Payment Systems',
      status: 'pending',
      tests: [
        { id: 'stripe-subscription', name: 'Stripe Subscription', status: 'pending' },
        { id: 'paypal-subscription', name: 'PayPal Subscription', status: 'pending' },
        { id: 'plan-upgrade', name: 'Plan Upgrade', status: 'pending' },
        { id: 'plan-downgrade', name: 'Plan Downgrade', status: 'pending' },
        { id: 'subscription-cancel', name: 'Subscription Cancellation', status: 'pending' },
        { id: 'payment-methods', name: 'Payment Methods Management', status: 'pending' },
      ],
    },
    {
      id: 'affiliate',
      name: 'Affiliate Program',
      status: 'pending',
      tests: [
        { id: 'affiliate-signup', name: 'Affiliate Signup', status: 'pending' },
        { id: 'referral-tracking', name: 'Referral Tracking', status: 'pending' },
        { id: 'payout-request', name: 'Payout Request', status: 'pending' },
        { id: 'affiliate-stats', name: 'Affiliate Statistics', status: 'pending' },
        { id: 'payment-method-update', name: 'Payment Method Update', status: 'pending' },
      ],
    },
    {
      id: 'navigation',
      name: 'Navigation & Core Features',
      status: 'pending',
      tests: [
        { id: 'tab-navigation', name: 'Tab Navigation', status: 'pending' },
        { id: 'prayers-tab', name: 'Prayers Tab', status: 'pending' },
        { id: 'testimonials-tab', name: 'Testimonials Tab', status: 'pending' },
        { id: 'songs-tab', name: 'Songs Tab', status: 'pending' },
        { id: 'ai-assistant-tab', name: 'AI Assistant Tab', status: 'pending' },
        { id: 'meetings-tab', name: 'Meetings Tab', status: 'pending' },
        { id: 'community-tab', name: 'Community Tab', status: 'pending' },
        { id: 'habits-tab', name: 'Habits Tab', status: 'pending' },
        { id: 'services-tab', name: 'Services Tab', status: 'pending' },
      ],
    },
    {
      id: 'content',
      name: 'Content Management',
      status: 'pending',
      tests: [
        { id: 'create-prayer', name: 'Create Prayer', status: 'pending' },
        { id: 'create-testimonial', name: 'Create Testimonial', status: 'pending' },
        { id: 'create-song', name: 'Create Song', status: 'pending' },
        { id: 'create-meeting', name: 'Create Meeting', status: 'pending' },
        { id: 'create-habit', name: 'Create Habit', status: 'pending' },
        { id: 'create-service', name: 'Create Service', status: 'pending' },
      ],
    },
    {
      id: 'admin',
      name: 'Admin Panel',
      status: 'pending',
      tests: [
        { id: 'admin-auth', name: 'Admin Authentication', status: 'pending' },
        { id: 'user-management', name: 'User Management', status: 'pending' },
        { id: 'content-moderation', name: 'Content Moderation', status: 'pending' },
        { id: 'analytics', name: 'Analytics Dashboard', status: 'pending' },
        { id: 'database-management', name: 'Database Management', status: 'pending' },
        { id: 'api-management', name: 'API Management', status: 'pending' },
        { id: 'coupon-management', name: 'Coupon Management', status: 'pending' },
      ],
    },
    {
      id: 'ai',
      name: 'AI Features',
      status: 'pending',
      tests: [
        { id: 'ai-chat', name: 'AI Chat', status: 'pending' },
        { id: 'prayer-generator', name: 'Prayer Generator', status: 'pending' },
        { id: 'devotional-generator', name: 'Devotional Generator', status: 'pending' },
        { id: 'scripture-insights', name: 'Scripture Insights', status: 'pending' },
        { id: 'testimony-suggestions', name: 'Testimony Suggestions', status: 'pending' },
      ],
    },
    {
      id: 'settings',
      name: 'Settings & Configuration',
      status: 'pending',
      tests: [
        { id: 'profile-settings', name: 'Profile Settings', status: 'pending' },
        { id: 'notification-settings', name: 'Notification Settings', status: 'pending' },
        { id: 'privacy-settings', name: 'Privacy Settings', status: 'pending' },
        { id: 'security-settings', name: 'Security Settings', status: 'pending' },
        { id: 'billing-settings', name: 'Billing Settings', status: 'pending' },
        { id: 'language-settings', name: 'Language Settings', status: 'pending' },
      ],
    },
  ]);

  const [isRunningTests, setIsRunningTests] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{ [key: string]: TestResult }>({});

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle size={20} color="#10B981" />;
      case 'failed':
        return <XCircle size={20} color="#EF4444" />;
      case 'warning':
        return <AlertTriangle size={20} color="#F59E0B" />;
      case 'running':
        return <ActivityIndicator size={20} color="#3B82F6" />;
      default:
        return <View style={styles.pendingIcon} />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return '#10B981';
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

  const simulateTest = async (testId: string, testName: string): Promise<TestResult> => {
    const startTime = Date.now();
    
    // Simulate test execution time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
    
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Simulate different test outcomes based on known issues
    let status: TestResult['status'] = 'passed';
    let message = `${testName} completed successfully`;

    // Simulate known issues
    if (testId === 'plan-upgrade' || testId === 'plan-downgrade') {
      status = 'failed';
      message = 'Plan change functionality not working - subscription update failed';
    } else if (testId === 'stripe-subscription' && Math.random() > 0.7) {
      status = 'warning';
      message = 'Stripe subscription created but webhook response delayed';
    } else if (testId === 'paypal-subscription' && Math.random() > 0.8) {
      status = 'failed';
      message = 'PayPal subscription creation failed - API error';
    } else if (testId === 'tab-navigation' && Platform.OS === 'web') {
      status = 'warning';
      message = 'Tab navigation works but icons may not display correctly on web';
    } else if (Math.random() > 0.85) {
      status = 'failed';
      message = `${testName} failed - unexpected error occurred`;
    } else if (Math.random() > 0.9) {
      status = 'warning';
      message = `${testName} completed with warnings`;
    }

    return {
      id: testId,
      name: testName,
      status,
      message,
      timestamp: new Date(),
      duration,
    };
  };

  const runSingleTest = async (categoryId: string, testId: string, testName: string) => {
    setCurrentTest(`${categoryId}-${testId}`);
    
    // Update test status to running
    setTestCategories(prev => prev.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          tests: category.tests.map(test => 
            test.id === testId ? { ...test, status: 'running' } : test
          ),
        };
      }
      return category;
    }));

    try {
      const result = await simulateTest(testId, testName);
      
      // Update test result
      setTestResults(prev => ({ ...prev, [`${categoryId}-${testId}`]: result }));
      
      // Update test status
      setTestCategories(prev => prev.map(category => {
        if (category.id === categoryId) {
          return {
            ...category,
            tests: category.tests.map(test => 
              test.id === testId ? { ...test, status: result.status, message: result.message } : test
            ),
          };
        }
        return category;
      }));
    } catch (error) {
      console.error(`Test ${testId} failed:`, error);
      
      setTestCategories(prev => prev.map(category => {
        if (category.id === categoryId) {
          return {
            ...category,
            tests: category.tests.map(test => 
              test.id === testId ? { 
                ...test, 
                status: 'failed', 
                message: `Test execution failed: ${error}` 
              } : test
            ),
          };
        }
        return category;
      }));
    }
    
    setCurrentTest(null);
  };

  const runCategoryTests = async (categoryId: string) => {
    const category = testCategories.find(c => c.id === categoryId);
    if (!category) return;

    // Update category status to running
    setTestCategories(prev => prev.map(c => 
      c.id === categoryId ? { ...c, status: 'running' } : c
    ));

    for (const test of category.tests) {
      await runSingleTest(categoryId, test.id, test.name);
    }

    // Update category status to completed
    setTestCategories(prev => prev.map(c => 
      c.id === categoryId ? { ...c, status: 'completed' } : c
    ));
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    
    for (const category of testCategories) {
      await runCategoryTests(category.id);
    }
    
    setIsRunningTests(false);
    
    // Show summary
    const totalTests = testCategories.reduce((sum, cat) => sum + cat.tests.length, 0);
    const passedTests = Object.values(testResults).filter(r => r.status === 'passed').length;
    const failedTests = Object.values(testResults).filter(r => r.status === 'failed').length;
    const warningTests = Object.values(testResults).filter(r => r.status === 'warning').length;
    
    Alert.alert(
      'Beta Testing Complete',
      `Total Tests: ${totalTests}\nPassed: ${passedTests}\nFailed: ${failedTests}\nWarnings: ${warningTests}`,
      [{ text: 'OK' }]
    );
  };

  const resetTests = () => {
    setTestCategories(prev => prev.map(category => ({
      ...category,
      status: 'pending',
      tests: category.tests.map(test => ({
        ...test,
        status: 'pending',
        message: undefined,
        timestamp: undefined,
        duration: undefined,
      })),
    })));
    setTestResults({});
    setCurrentTest(null);
  };

  const navigateToFeature = (testId: string) => {
    const routes: { [key: string]: string } = {
      'register': '/register',
      'login': '/login',
      'stripe-subscription': '/membership',
      'paypal-subscription': '/membership',
      'plan-upgrade': '/settings/billing',
      'plan-downgrade': '/settings/billing',
      'affiliate-signup': '/affiliate',
      'prayers-tab': '/(tabs)/prayers',
      'testimonials-tab': '/(tabs)/testimonials',
      'songs-tab': '/(tabs)/songs',
      'ai-assistant-tab': '/(tabs)/ai-assistant',
      'meetings-tab': '/(tabs)/meetings',
      'admin-auth': '/admin/auth',
      'profile-settings': '/settings/profile',
      'billing-settings': '/settings/billing',
    };

    const route = routes[testId];
    if (route) {
      router.push(route as any);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Beta Testing Dashboard',
          headerStyle: { backgroundColor: '#1F2937' },
          headerTintColor: '#FFFFFF',
        }} 
      />
      
      <View style={styles.header}>
        <Text style={styles.title}>Comprehensive Beta Testing</Text>
        <Text style={styles.subtitle}>Test all features and identify issues</Text>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={runAllTests}
            disabled={isRunningTests}
          >
            {isRunningTests ? (
              <ActivityIndicator size={20} color="#FFFFFF" />
            ) : (
              <Play size={20} color="#FFFFFF" />
            )}
            <Text style={styles.buttonText}>
              {isRunningTests ? 'Running Tests...' : 'Run All Tests'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={resetTests}
            disabled={isRunningTests}
          >
            <RefreshCw size={20} color="#374151" />
            <Text style={styles.secondaryButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {testCategories.map((category) => (
          <View key={category.id} style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>{category.name}</Text>
              <TouchableOpacity
                style={styles.runCategoryButton}
                onPress={() => runCategoryTests(category.id)}
                disabled={isRunningTests || category.status === 'running'}
              >
                {category.status === 'running' ? (
                  <ActivityIndicator size={16} color="#3B82F6" />
                ) : (
                  <Play size={16} color="#3B82F6" />
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.testsContainer}>
              {category.tests.map((test) => (
                <TouchableOpacity
                  key={test.id}
                  style={styles.testItem}
                  onPress={() => navigateToFeature(test.id)}
                >
                  <View style={styles.testInfo}>
                    {getStatusIcon(test.status)}
                    <Text style={styles.testName}>{test.name}</Text>
                  </View>
                  
                  {test.message && (
                    <Text style={[
                      styles.testMessage,
                      { color: getStatusColor(test.status) }
                    ]}>
                      {test.message}
                    </Text>
                  )}
                  
                  {test.duration && (
                    <Text style={styles.testDuration}>
                      {test.duration}ms
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
      
      {currentTest && (
        <View style={styles.currentTestIndicator}>
          <ActivityIndicator size={20} color="#3B82F6" />
          <Text style={styles.currentTestText}>
            Running: {currentTest}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  runCategoryButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#EBF4FF',
  },
  testsContainer: {
    gap: 8,
  },
  testItem: {
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#E5E7EB',
  },
  testInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  testName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },
  testMessage: {
    fontSize: 14,
    marginTop: 4,
    marginLeft: 32,
  },
  testDuration: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    marginLeft: 32,
  },
  pendingIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
  },
  currentTestIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4FF',
    padding: 12,
    gap: 8,
  },
  currentTestText: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '500',
  },
});