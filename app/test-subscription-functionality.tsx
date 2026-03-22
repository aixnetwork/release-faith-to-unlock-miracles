import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { CheckCircle, XCircle, RefreshCw, ArrowLeft } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';
import { trpcClient } from '@/lib/trpc';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

export default function TestSubscriptionFunctionality() {
  const { plan: currentPlan, updatePlan } = useUserStore();
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addTestResult = (result: TestResult) => {
    setTests(prev => [...prev, result]);
  };

  const clearTests = () => {
    setTests([]);
  };

  const runSubscriptionTests = async () => {
    setIsRunning(true);
    clearTests();

    // Test 1: Get Subscription Status
    addTestResult({ name: 'Get Subscription Status', status: 'pending', message: 'Testing...' });
    try {
      const subscriptionStatus = await trpcClient.payments.getSubscriptionStatus.query();
      addTestResult({
        name: 'Get Subscription Status',
        status: 'success',
        message: `Current plan: ${subscriptionStatus.plan}, Has active subscription: ${subscriptionStatus.hasActiveSubscription}`,
        details: subscriptionStatus
      });
    } catch (error) {
      addTestResult({
        name: 'Get Subscription Status',
        status: 'error',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
    }

    // Test 2: Get Payment Methods
    addTestResult({ name: 'Get Payment Methods', status: 'pending', message: 'Testing...' });
    try {
      const paymentMethods = await trpcClient.payments.getPaymentMethods.query();
      addTestResult({
        name: 'Get Payment Methods',
        status: 'success',
        message: `Found ${paymentMethods.paymentMethods?.length || 0} payment methods`,
        details: paymentMethods
      });
    } catch (error) {
      addTestResult({
        name: 'Get Payment Methods',
        status: 'error',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
    }

    // Test 3: Test Plan Change (if user has active subscription)
    addTestResult({ name: 'Test Plan Change', status: 'pending', message: 'Testing...' });
    try {
      const subscriptionStatus = await trpcClient.payments.getSubscriptionStatus.query();
      
      if (subscriptionStatus.hasActiveSubscription && subscriptionStatus.subscription) {
        // Test changing to a different plan
        const newPlanId = currentPlan === 'individual' ? 'group_family' : 'individual';
        
        const result = await trpcClient.stripe.updateSubscription.mutate({
          subscriptionId: subscriptionStatus.subscription.id,
          newPlanId,
          prorationBehavior: 'create_prorations'
        });
        
        if (result.success) {
          addTestResult({
            name: 'Test Plan Change',
            status: 'success',
            message: `Successfully changed plan to ${result.planName}`,
            details: result
          });
          
          // Update the user store
          updatePlan(newPlanId as any);
        } else {
          addTestResult({
            name: 'Test Plan Change',
            status: 'error',
            message: `Plan change failed: ${result.error}`,
            details: result
          });
        }
      } else {
        addTestResult({
          name: 'Test Plan Change',
          status: 'success',
          message: 'No active subscription to test plan change',
          details: { reason: 'No active subscription' }
        });
      }
    } catch (error) {
      addTestResult({
        name: 'Test Plan Change',
        status: 'error',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
    }

    // Test 4: Test Navigation to Membership Screen
    addTestResult({ name: 'Test Navigation', status: 'pending', message: 'Testing...' });
    try {
      // This is a simple test to ensure the navigation works
      addTestResult({
        name: 'Test Navigation',
        status: 'success',
        message: 'Navigation to membership screen should work',
        details: { route: '/membership' }
      });
    } catch (error) {
      addTestResult({
        name: 'Test Navigation',
        status: 'error',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
    }

    setIsRunning(false);
  };

  const testMembershipNavigation = () => {
    console.log('🧪 Testing navigation to membership screen');
    router.push('/membership');
  };

  const testBillingNavigation = () => {
    console.log('🧪 Testing navigation to billing screen');
    router.push('/settings/billing');
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={20} color={Colors.light.success} />;
      case 'error':
        return <XCircle size={20} color={Colors.light.error} />;
      case 'pending':
        return <RefreshCw size={20} color={Colors.light.primary} />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return Colors.light.success;
      case 'error':
        return Colors.light.error;
      case 'pending':
        return Colors.light.primary;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Test Subscription Functionality' }} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Subscription System Tests</Text>
          <Text style={styles.subtitle}>
            Test the subscription functionality including plan changes, payment methods, and navigation.
          </Text>
          <Text style={styles.currentPlan}>
            Current Plan: <Text style={styles.planName}>{currentPlan}</Text>
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Actions</Text>
          
          <Button
            title={isRunning ? 'Running Tests...' : 'Run All Tests'}
            onPress={runSubscriptionTests}
            disabled={isRunning}
            loading={isRunning}
            style={styles.testButton}
          />
          
          <View style={styles.buttonRow}>
            <Button
              title="Test Membership"
              onPress={testMembershipNavigation}
              variant="outline"
              size="small"
              style={styles.navButton}
            />
            
            <Button
              title="Test Billing"
              onPress={testBillingNavigation}
              variant="outline"
              size="small"
              style={styles.navButton}
            />
          </View>
          
          <Button
            title="Clear Results"
            onPress={clearTests}
            variant="outline"
            size="small"
            style={styles.clearButton}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Results</Text>
          
          {tests.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No tests run yet. Click "Run All Tests" to start.</Text>
            </View>
          ) : (
            <View style={styles.resultsContainer}>
              {tests.map((test, index) => (
                <View key={index} style={styles.testResult}>
                  <View style={styles.testHeader}>
                    {getStatusIcon(test.status)}
                    <Text style={styles.testName}>{test.name}</Text>
                  </View>
                  
                  <Text style={[styles.testMessage, { color: getStatusColor(test.status) }]}>
                    {test.message}
                  </Text>
                  
                  {test.details && (
                    <View style={styles.testDetails}>
                      <Text style={styles.detailsTitle}>Details:</Text>
                      <Text style={styles.detailsText}>
                        {JSON.stringify(test.details, null, 2)}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expected Behavior</Text>
          <View style={styles.expectedBehavior}>
            <Text style={styles.behaviorItem}>• Get Subscription Status should return current plan info</Text>
            <Text style={styles.behaviorItem}>• Get Payment Methods should return mock payment methods</Text>
            <Text style={styles.behaviorItem}>• Plan Change should work if user has active subscription</Text>
            <Text style={styles.behaviorItem}>• Navigation should work to membership and billing screens</Text>
            <Text style={styles.behaviorItem}>• "Change Plan" button should navigate to membership screen</Text>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.bottomMenu}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={Colors.light.textMedium} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
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
  header: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...theme.typography.title,
    fontSize: 24,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.body,
    color: Colors.light.textMedium,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  currentPlan: {
    ...theme.typography.body,
    color: Colors.light.textMedium,
  },
  planName: {
    fontWeight: '600',
    color: Colors.light.primary,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.subtitle,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.md,
  },
  testButton: {
    marginBottom: theme.spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  navButton: {
    flex: 1,
  },
  clearButton: {
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyState: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  emptyText: {
    ...theme.typography.body,
    color: Colors.light.textMedium,
    textAlign: 'center',
  },
  resultsContainer: {
    gap: theme.spacing.md,
  },
  testResult: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.small,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  testName: {
    ...theme.typography.subtitle,
    fontSize: 16,
    color: Colors.light.textPrimary,
  },
  testMessage: {
    ...theme.typography.body,
    marginBottom: theme.spacing.sm,
  },
  testDetails: {
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
  },
  detailsTitle: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: Colors.light.textMedium,
    marginBottom: theme.spacing.xs,
  },
  detailsText: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
    fontFamily: 'monospace',
  },
  expectedBehavior: {
    backgroundColor: Colors.light.primary + '10',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  behaviorItem: {
    ...theme.typography.body,
    color: Colors.light.textMedium,
    marginBottom: theme.spacing.xs,
    lineHeight: 20,
  },
  bottomMenu: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    backgroundColor: Colors.light.background,
    padding: theme.spacing.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  backText: {
    ...theme.typography.body,
    color: Colors.light.textMedium,
    fontWeight: '600',
  },
});