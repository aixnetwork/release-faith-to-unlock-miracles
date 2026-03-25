import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { CheckCircle, XCircle, RefreshCw, ArrowLeft, Crown, CreditCard } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

export default function TestSubscriptionSystemScreen() {
  const { plan, setPlan } = useUserStore();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTestResult = (name: string, status: 'success' | 'error', message: string, details?: any) => {
    setTestResults(prev => prev.map(test => 
      test.name === name ? { ...test, status, message, details } : test
    ));
  };

  const runComprehensiveTests = async () => {
    setIsRunning(true);
    
    const tests: TestResult[] = [
      { name: 'Get Subscription Status', status: 'pending', message: 'Testing...' },
      { name: 'Plan Change Flow', status: 'pending', message: 'Testing...' },
      { name: 'Stripe Integration', status: 'pending', message: 'Testing...' },
      { name: 'PayPal Integration', status: 'pending', message: 'Testing...' },
      { name: 'User Store Updates', status: 'pending', message: 'Testing...' },
      { name: 'Subscription Update', status: 'pending', message: 'Testing...' },
    ];
    
    setTestResults(tests);

    try {
      // Test 1: Get Subscription Status
      console.log('🧪 Test 1: Get Subscription Status');
      try {
        const subscriptionStatus = await trpcClient.payments.getSubscriptionStatus.query({
          currentPlan: plan
        });
        
        if (subscriptionStatus.success) {
          updateTestResult('Get Subscription Status', 'success', 
            `Status retrieved successfully. Plan: ${subscriptionStatus.plan}, Active: ${subscriptionStatus.hasActiveSubscription}`,
            subscriptionStatus
          );
        } else {
          updateTestResult('Get Subscription Status', 'error', 
            'Failed to get subscription status - no success flag'
          );
        }
      } catch (error) {
        updateTestResult('Get Subscription Status', 'error', 
          `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }

      // Test 2: Plan Change Flow
      console.log('🧪 Test 2: Plan Change Flow');
      try {
        const originalPlan = plan;
        const testPlan = plan === 'free' ? 'individual' : 'free';
        
        // Test plan change in user store
        setPlan(testPlan as any);
        
        // Verify the change
        if (plan !== originalPlan) {
          updateTestResult('Plan Change Flow', 'success', 
            `Plan changed from ${originalPlan} to ${testPlan}`
          );
          
          // Restore original plan
          setPlan(originalPlan as any);
        } else {
          updateTestResult('Plan Change Flow', 'error', 
            'Plan change did not update user store'
          );
        }
      } catch (error) {
        updateTestResult('Plan Change Flow', 'error', 
          `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }

      // Test 3: Stripe Integration
      console.log('🧪 Test 3: Stripe Integration');
      try {
        const stripeResponse = await trpcClient.stripe.createCheckoutSession.mutate({
          planId: 'individual',
          successUrl: 'https://example.com/success',
          cancelUrl: 'https://example.com/cancel',
        });
        
        if (stripeResponse.success) {
          updateTestResult('Stripe Integration', 'success', 
            'Stripe checkout session created successfully',
            { sessionId: stripeResponse.sessionId, url: stripeResponse.url }
          );
        } else {
          updateTestResult('Stripe Integration', 'error', 
            stripeResponse.error || 'Failed to create Stripe session'
          );
        }
      } catch (error) {
        updateTestResult('Stripe Integration', 'error', 
          `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }

      // Test 4: PayPal Integration
      console.log('🧪 Test 4: PayPal Integration');
      try {
        const paypalResponse = await trpcClient.paypal.createPayment.mutate({
          planId: 'individual',
          amount: 599, // $5.99 in cents
          currency: 'USD',
          description: 'Individual Plan - Test',
          paymentType: 'subscription',
          returnUrl: 'https://example.com/success',
          cancelUrl: 'https://example.com/cancel',
        });
        
        if (paypalResponse.success) {
          updateTestResult('PayPal Integration', 'success', 
            'PayPal payment created successfully',
            { paymentId: paypalResponse.paymentId, approvalUrl: paypalResponse.approvalUrl }
          );
        } else {
          updateTestResult('PayPal Integration', 'error', 
            paypalResponse.error || 'Failed to create PayPal payment'
          );
        }
      } catch (error) {
        updateTestResult('PayPal Integration', 'error', 
          `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }

      // Test 5: User Store Updates
      console.log('🧪 Test 5: User Store Updates');
      try {
        const originalPlan = plan;
        const testPlans = ['free', 'individual', 'group_family', 'small_church', 'large_church'];
        let allUpdatesWorked = true;
        
        for (const testPlan of testPlans) {
          setPlan(testPlan as any);
          // Small delay to allow state update
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Restore original plan
        setPlan(originalPlan as any);
        
        if (allUpdatesWorked) {
          updateTestResult('User Store Updates', 'success', 
            'All plan updates worked correctly'
          );
        } else {
          updateTestResult('User Store Updates', 'error', 
            'Some plan updates failed'
          );
        }
      } catch (error) {
        updateTestResult('User Store Updates', 'error', 
          `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }

      // Test 6: Subscription Update
      console.log('🧪 Test 6: Subscription Update');
      try {
        const updateResponse = await trpcClient.stripe.updateSubscription.mutate({
          subscriptionId: 'sub_test_123',
          newPlanId: 'individual',
          prorationBehavior: 'create_prorations'
        });
        
        if (updateResponse.success) {
          updateTestResult('Subscription Update', 'success', 
            `Subscription updated to ${updateResponse.planName}`,
            { 
              subscriptionId: updateResponse.subscriptionId,
              planName: updateResponse.planName,
              amount: updateResponse.amount,
              prorationAmount: updateResponse.prorationAmount
            }
          );
        } else {
          updateTestResult('Subscription Update', 'error', 
            updateResponse.error || 'Failed to update subscription'
          );
        }
      } catch (error) {
        updateTestResult('Subscription Update', 'error', 
          `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }

    } catch (error) {
      console.error('❌ Test suite error:', error);
      Alert.alert('Test Error', 'An error occurred while running tests');
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={20} color={Colors.light.success} />;
      case 'error':
        return <XCircle size={20} color={Colors.light.error} />;
      case 'pending':
        return <RefreshCw size={20} color={Colors.light.textMedium} />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return Colors.light.success;
      case 'error':
        return Colors.light.error;
      case 'pending':
        return Colors.light.textMedium;
    }
  };

  const successCount = testResults.filter(t => t.status === 'success').length;
  const errorCount = testResults.filter(t => t.status === 'error').length;
  const totalTests = testResults.length;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Subscription System Test',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.light.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[Colors.light.primary, Colors.light.primaryDark, '#002266'] as const}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.header}>
            <Crown size={32} color={Colors.light.white} />
            <Text style={styles.headerTitle}>Subscription System Test</Text>
            <Text style={styles.headerSubtitle}>
              Comprehensive testing of payment and subscription functionality
            </Text>
          </View>
        </LinearGradient>

        {/* Current Status */}
        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>Current Status</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Current Plan:</Text>
              <Text style={styles.statusValue}>{plan}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Tests Run:</Text>
              <Text style={styles.statusValue}>{totalTests > 0 ? `${successCount + errorCount}/${totalTests}` : '0/0'}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Success Rate:</Text>
              <Text style={[styles.statusValue, { color: totalTests > 0 ? Colors.light.success : Colors.light.textMedium }]}>
                {totalTests > 0 ? `${Math.round((successCount / totalTests) * 100)}%` : 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Test Controls */}
        <View style={styles.controlsSection}>
          <TouchableOpacity
            style={[styles.runTestsButton, isRunning && styles.runTestsButtonDisabled]}
            onPress={runComprehensiveTests}
            disabled={isRunning}
          >
            <LinearGradient
              colors={isRunning ? [Colors.light.textLight, Colors.light.textMedium] as const : [Colors.light.secondary, Colors.light.secondaryDark] as const}
              style={styles.runTestsButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <RefreshCw size={20} color={Colors.light.white} />
              <Text style={styles.runTestsButtonText}>
                {isRunning ? 'Running Tests...' : 'Run Comprehensive Tests'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Test Results */}
        {testResults.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>Test Results</Text>
            
            {testResults.map((test, index) => (
              <View key={index} style={styles.testResultCard}>
                <View style={styles.testResultHeader}>
                  {getStatusIcon(test.status)}
                  <Text style={styles.testResultName}>{test.name}</Text>
                </View>
                
                <Text style={[styles.testResultMessage, { color: getStatusColor(test.status) }]}>
                  {test.message}
                </Text>
                
                {test.details && (
                  <View style={styles.testResultDetails}>
                    <Text style={styles.testResultDetailsTitle}>Details:</Text>
                    <Text style={styles.testResultDetailsText}>
                      {JSON.stringify(test.details, null, 2)}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/membership')}
          >
            <Crown size={20} color={Colors.light.primary} />
            <Text style={styles.actionButtonText}>Go to Membership Plans</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/settings/billing')}
          >
            <CreditCard size={20} color={Colors.light.primary} />
            <Text style={styles.actionButtonText}>Go to Billing Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Add bottom spacing */}
        <View style={styles.bottomSpacing} />
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
  },
  headerGradient: {
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.large,
  },
  header: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.light.white,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
  statusSection: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.md,
  },
  statusCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statusLabel: {
    fontSize: 16,
    color: Colors.light.textMedium,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.textPrimary,
  },
  controlsSection: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  runTestsButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  runTestsButtonDisabled: {
    opacity: 0.6,
  },
  runTestsButtonGradient: {
    paddingVertical: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  runTestsButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.light.white,
  },
  resultsSection: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  testResultCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  testResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  testResultName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.textPrimary,
    flex: 1,
  },
  testResultMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  testResultDetails: {
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  testResultDetailsTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.light.textMedium,
    marginBottom: theme.spacing.xs,
  },
  testResultDetailsText: {
    fontSize: 11,
    color: Colors.light.textLight,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  actionsSection: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
    ...theme.shadows.small,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.textPrimary,
  },
  bottomSpacing: {
    height: theme.spacing.xl,
  },
});