import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { useSuperwall } from '@/components/SuperwallProvider';
import { useUserStore } from '@/store/userStore';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { 
  CheckCircle, 
  XCircle, 
  Play, 
  RotateCcw,
  User,
  Crown,
  Gift,
  AlertTriangle
} from 'lucide-react-native';

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'passed' | 'failed';
  message?: string;
  timestamp?: Date;
}

export default function SuperwallIntegrationTestScreen() {
  const { 
    showSuperwall, 
    checkFeatureAccess, 
    triggerTrialEnding, 
    triggerOnboarding 
  } = useSuperwall();
  
  const { 
    isLoggedIn, 
    plan, 
    login, 
    logout, 
    updatePlan 
  } = useUserStore();

  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const initialTests: TestResult[] = [
    { id: 'provider-integration', name: 'Superwall Provider Integration', status: 'pending' },
    { id: 'user-store-integration', name: 'User Store Integration', status: 'pending' },
    { id: 'not-logged-in-access', name: 'Not Logged In - Feature Access', status: 'pending' },
    { id: 'free-user-access', name: 'Free User - Feature Access', status: 'pending' },
    { id: 'premium-user-access', name: 'Premium User - Feature Access', status: 'pending' },
    { id: 'lifetime-user-access', name: 'Lifetime User - Feature Access', status: 'pending' },
    { id: 'manual-superwall', name: 'Manual Superwall Trigger', status: 'pending' },
    { id: 'trial-ending-trigger', name: 'Trial Ending Trigger', status: 'pending' },
    { id: 'onboarding-trigger', name: 'Onboarding Trigger', status: 'pending' },
    { id: 'force-show-functionality', name: 'Force Show Functionality', status: 'pending' },
  ];

  useEffect(() => {
    setTestResults(initialTests);
  }, []);

  const updateTestResult = (id: string, status: 'passed' | 'failed', message?: string) => {
    setTestResults(prev => prev.map(test => 
      test.id === id 
        ? { ...test, status, message, timestamp: new Date() }
        : test
    ));
  };

  const runTest = async (testId: string): Promise<boolean> => {
    try {
      switch (testId) {
        case 'provider-integration':
          // Test if Superwall provider is properly integrated
          if (typeof showSuperwall === 'function' && typeof checkFeatureAccess === 'function') {
            updateTestResult(testId, 'passed', 'All Superwall functions are available');
            return true;
          } else {
            updateTestResult(testId, 'failed', 'Superwall functions not available');
            return false;
          }

        case 'user-store-integration':
          // Test if user store is properly integrated
          if (typeof isLoggedIn === 'boolean' && typeof plan === 'string') {
            updateTestResult(testId, 'passed', `User state: ${isLoggedIn ? 'logged in' : 'not logged in'}, Plan: ${plan}`);
            return true;
          } else {
            updateTestResult(testId, 'failed', 'User store not properly integrated');
            return false;
          }

        case 'not-logged-in-access':
          // Test feature access when not logged in
          if (isLoggedIn) logout();
          await new Promise(resolve => setTimeout(resolve, 100));
          const notLoggedInAccess = checkFeatureAccess('Test Feature');
          updateTestResult(testId, notLoggedInAccess ? 'failed' : 'passed', 
            notLoggedInAccess ? 'Should deny access when not logged in' : 'Correctly denied access when not logged in');
          return !notLoggedInAccess;

        case 'free-user-access':
          // Test feature access for free user
          if (!isLoggedIn) {
            login({ name: 'Test User', email: 'test@example.com', plan: 'free' });
          } else {
            updatePlan('free');
          }
          await new Promise(resolve => setTimeout(resolve, 100));
          const freeUserAccess = checkFeatureAccess('Premium Feature');
          updateTestResult(testId, freeUserAccess ? 'failed' : 'passed',
            freeUserAccess ? 'Should deny premium access to free user' : 'Correctly denied premium access to free user');
          return !freeUserAccess;

        case 'premium-user-access':
          // Test feature access for premium user
          updatePlan('premium');
          await new Promise(resolve => setTimeout(resolve, 100));
          const premiumUserAccess = checkFeatureAccess('Premium Feature');
          updateTestResult(testId, premiumUserAccess ? 'passed' : 'failed',
            premiumUserAccess ? 'Premium user has access to premium features' : 'Premium user should have access to premium features');
          return premiumUserAccess;

        case 'lifetime-user-access':
          // Test feature access for lifetime user
          updatePlan('lifetime');
          await new Promise(resolve => setTimeout(resolve, 100));
          const lifetimeUserAccess = checkFeatureAccess('Lifetime Feature', 'lifetime');
          updateTestResult(testId, lifetimeUserAccess ? 'passed' : 'failed',
            lifetimeUserAccess ? 'Lifetime user has access to lifetime features' : 'Lifetime user should have access to lifetime features');
          return lifetimeUserAccess;

        case 'manual-superwall':
          // Test manual superwall trigger
          const manualShown = showSuperwall({
            feature: 'Test Feature',
            context: 'upgrade_prompt',
            title: 'Test Superwall',
            description: 'This is a test of manual Superwall trigger',
            forceShow: true
          });
          updateTestResult(testId, manualShown ? 'passed' : 'failed',
            manualShown ? 'Manual Superwall triggered successfully' : 'Manual Superwall failed to trigger');
          return manualShown;

        case 'trial-ending-trigger':
          // Test trial ending trigger
          try {
            triggerTrialEnding();
            updateTestResult(testId, 'passed', 'Trial ending trigger executed without error');
            return true;
          } catch (error) {
            updateTestResult(testId, 'failed', `Trial ending trigger failed: ${error}`);
            return false;
          }

        case 'onboarding-trigger':
          // Test onboarding trigger
          try {
            triggerOnboarding();
            updateTestResult(testId, 'passed', 'Onboarding trigger executed without error');
            return true;
          } catch (error) {
            updateTestResult(testId, 'failed', `Onboarding trigger failed: ${error}`);
            return false;
          }

        case 'force-show-functionality':
          // Test force show functionality
          updatePlan('lifetime'); // Set to lifetime to test force show
          await new Promise(resolve => setTimeout(resolve, 100));
          const forceShown = showSuperwall({
            feature: 'Force Show Test',
            context: 'upgrade_prompt',
            title: 'Force Show Test',
            description: 'This should show even for lifetime users',
            forceShow: true
          });
          updateTestResult(testId, forceShown ? 'passed' : 'failed',
            forceShown ? 'Force show works correctly' : 'Force show failed');
          return forceShown;

        default:
          updateTestResult(testId, 'failed', 'Unknown test');
          return false;
      }
    } catch (error) {
      updateTestResult(testId, 'failed', `Test error: ${error}`);
      return false;
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    let passedCount = 0;
    
    for (const test of initialTests) {
      const passed = await runTest(test.id);
      if (passed) passedCount++;
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
    }
    
    setIsRunning(false);
    
    Alert.alert(
      'Test Results',
      `${passedCount}/${initialTests.length} tests passed`,
      [{ text: 'OK' }]
    );
  };

  const resetTests = () => {
    setTestResults(initialTests);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle size={20} color={Colors.light.success} />;
      case 'failed':
        return <XCircle size={20} color={Colors.light.error} />;
      default:
        return <View style={styles.pendingIcon} />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return Colors.light.success;
      case 'failed':
        return Colors.light.error;
      default:
        return Colors.light.textMedium;
    }
  };

  const passedTests = testResults.filter(t => t.status === 'passed').length;
  const failedTests = testResults.filter(t => t.status === 'failed').length;
  const pendingTests = testResults.filter(t => t.status === 'pending').length;

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Superwall Integration Test',
          headerShown: true,
          headerStyle: { backgroundColor: Colors.light.primary },
          headerTintColor: Colors.light.white,
          headerTitleStyle: { fontWeight: '600' }
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current State */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current State</Text>
          <View style={styles.stateCard}>
            <View style={styles.stateRow}>
              <User size={16} color={Colors.light.primary} />
              <Text style={styles.stateText}>
                {isLoggedIn ? '✅ Logged In' : '❌ Not Logged In'}
              </Text>
            </View>
            <View style={styles.stateRow}>
              <Crown size={16} color={Colors.light.warning} />
              <Text style={styles.stateText}>Plan: {plan.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Test Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <CheckCircle size={16} color={Colors.light.success} />
                <Text style={[styles.summaryText, { color: Colors.light.success }]}>
                  {passedTests} Passed
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <XCircle size={16} color={Colors.light.error} />
                <Text style={[styles.summaryText, { color: Colors.light.error }]}>
                  {failedTests} Failed
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <AlertTriangle size={16} color={Colors.light.textMedium} />
                <Text style={[styles.summaryText, { color: Colors.light.textMedium }]}>
                  {pendingTests} Pending
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Test Controls */}
        <View style={styles.section}>
          <View style={styles.controlsRow}>
            <TouchableOpacity 
              style={[styles.button, styles.runButton, isRunning && styles.buttonDisabled]} 
              onPress={runAllTests}
              disabled={isRunning}
            >
              <Play size={20} color={Colors.light.white} />
              <Text style={styles.buttonText}>
                {isRunning ? 'Running...' : 'Run All Tests'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.resetButton]} 
              onPress={resetTests}
            >
              <RotateCcw size={20} color={Colors.light.white} />
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Test Results */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Results</Text>
          <View style={styles.testsContainer}>
            {testResults.map((test) => (
              <View key={test.id} style={styles.testItem}>
                <View style={styles.testHeader}>
                  <View style={styles.testInfo}>
                    {getStatusIcon(test.status)}
                    <Text style={[styles.testName, { color: getStatusColor(test.status) }]}>
                      {test.name}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.runSingleButton}
                    onPress={() => runTest(test.id)}
                    disabled={isRunning}
                  >
                    <Play size={14} color={Colors.light.primary} />
                  </TouchableOpacity>
                </View>
                {test.message && (
                  <Text style={styles.testMessage}>{test.message}</Text>
                )}
                {test.timestamp && (
                  <Text style={styles.testTimestamp}>
                    {test.timestamp.toLocaleTimeString()}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Navigation to Test Screen */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.button, styles.navButton]}
            onPress={() => router.push('/superwall-test')}
          >
            <Gift size={20} color={Colors.light.white} />
            <Text style={styles.buttonText}>Open Manual Test Screen</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.md,
  },
  stateCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    ...theme.shadows.small,
  },
  stateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  stateText: {
    fontSize: 14,
    color: Colors.light.textPrimary,
    fontWeight: '500' as const,
  },
  summaryCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
    ...theme.shadows.small,
  },
  runButton: {
    backgroundColor: Colors.light.success,
    flex: 1,
  },
  resetButton: {
    backgroundColor: Colors.light.textMedium,
    flex: 1,
  },
  navButton: {
    backgroundColor: Colors.light.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.white,
  },
  testsContainer: {
    gap: theme.spacing.sm,
  },
  testItem: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  testInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  testName: {
    fontSize: 14,
    fontWeight: '500' as const,
    flex: 1,
  },
  runSingleButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: Colors.light.backgroundLight,
  },
  testMessage: {
    fontSize: 12,
    color: Colors.light.textMedium,
    marginBottom: theme.spacing.xs,
    fontStyle: 'italic',
  },
  testTimestamp: {
    fontSize: 10,
    color: Colors.light.textLight,
    alignSelf: 'flex-end',
  },
  pendingIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.light.border,
  },
});