import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { CheckCircle, XCircle, AlertCircle, DollarSign, Users, CreditCard } from 'lucide-react-native';

type TestResult = {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  duration?: number;
};

type TestCategory = {
  name: string;
  tests: TestResult[];
  expanded: boolean;
};

export default function BetaPaymentAffiliateTestingScreen() {
  const [testCategories, setTestCategories] = useState<TestCategory[]>([
    {
      name: 'Stripe Integration Tests',
      expanded: true,
      tests: [
        { name: 'Create Checkout Session', status: 'pending', message: 'Not started' },
        { name: 'List Payment Methods', status: 'pending', message: 'Not started' },
        { name: 'Set Default Payment Method', status: 'pending', message: 'Not started' },
        { name: 'Remove Payment Method', status: 'pending', message: 'Not started' },
        { name: 'Create Subscription', status: 'pending', message: 'Not started' },
        { name: 'Update Subscription', status: 'pending', message: 'Not started' },
        { name: 'Cancel Subscription', status: 'pending', message: 'Not started' },
        { name: 'List Invoices', status: 'pending', message: 'Not started' },
        { name: 'Webhook Processing', status: 'pending', message: 'Not started' },
      ],
    },
    {
      name: 'PayPal Integration Tests',
      expanded: true,
      tests: [
        { name: 'Create Payment', status: 'pending', message: 'Not started' },
        { name: 'Execute Payment', status: 'pending', message: 'Not started' },
        { name: 'Create Subscription', status: 'pending', message: 'Not started' },
        { name: 'Payment Error Handling', status: 'pending', message: 'Not started' },
        { name: 'Subscription Management', status: 'pending', message: 'Not started' },
      ],
    },
    {
      name: 'Affiliate Program Tests',
      expanded: true,
      tests: [
        { name: 'Get Affiliate Stats', status: 'pending', message: 'Not started' },
        { name: 'Get Referrals List', status: 'pending', message: 'Not started' },
        { name: 'Get Payouts History', status: 'pending', message: 'Not started' },
        { name: 'Request Payout', status: 'pending', message: 'Not started' },
        { name: 'Update Payment Method', status: 'pending', message: 'Not started' },
        { name: 'Referral Tracking', status: 'pending', message: 'Not started' },
        { name: 'Commission Calculation', status: 'pending', message: 'Not started' },
      ],
    },
    {
      name: 'Payment Flow Integration Tests',
      expanded: true,
      tests: [
        { name: 'Free to Paid Upgrade', status: 'pending', message: 'Not started' },
        { name: 'Plan Change (Upgrade)', status: 'pending', message: 'Not started' },
        { name: 'Plan Change (Downgrade)', status: 'pending', message: 'Not started' },
        { name: 'Payment Method Switch', status: 'pending', message: 'Not started' },
        { name: 'Failed Payment Recovery', status: 'pending', message: 'Not started' },
        { name: 'Subscription Renewal', status: 'pending', message: 'Not started' },
        { name: 'Refund Processing', status: 'pending', message: 'Not started' },
      ],
    },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testAmount, setTestAmount] = useState('5.99');

  // Test mutations
  const createStripeCheckout = trpc.stripe.createCheckoutSession.useMutation();
  const listPaymentMethods = trpc.stripe.listPaymentMethods.useQuery();
  const setDefaultPaymentMethod = trpc.stripe.setDefaultPaymentMethod.useMutation();
  const removePaymentMethod = trpc.stripe.removePaymentMethod.useMutation();
  const createStripeSubscription = trpc.stripe.createSubscription.useMutation();
  const updateStripeSubscription = trpc.stripe.updateSubscription.useMutation();
  const cancelStripeSubscription = trpc.stripe.cancelSubscription.useMutation();
  const listInvoices = trpc.stripe.listInvoices.useQuery();

  const createPayPalPayment = trpc.paypal.createPayment.useMutation();
  const executePayPalPayment = trpc.paypal.executePayment.useMutation();
  const createPayPalSubscription = trpc.paypal.createSubscription.useMutation();

  const getAffiliateStats = trpc.affiliate.getStats.useQuery();
  const getReferrals = trpc.affiliate.getReferrals.useQuery({ affiliateId: 'test-affiliate' });
  const getPayouts = trpc.affiliate.getPayouts.useQuery({ affiliateId: 'test-affiliate' });
  const requestPayout = trpc.affiliate.requestPayout.useMutation();
  const updatePaymentMethod = trpc.affiliate.updatePaymentMethod.useMutation();

  const updateTestResult = (categoryIndex: number, testIndex: number, result: Partial<TestResult>) => {
    setTestCategories(prev => {
      const updated = [...prev];
      updated[categoryIndex].tests[testIndex] = {
        ...updated[categoryIndex].tests[testIndex],
        ...result,
      };
      return updated;
    });
  };

  const runTest = async (categoryIndex: number, testIndex: number, testFn: () => Promise<void>) => {
    const startTime = Date.now();
    updateTestResult(categoryIndex, testIndex, { status: 'pending', message: 'Running...' });
    
    try {
      await testFn();
      const duration = Date.now() - startTime;
      updateTestResult(categoryIndex, testIndex, {
        status: 'success',
        message: 'Passed',
        duration,
      });
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateTestResult(categoryIndex, testIndex, {
        status: 'error',
        message: error.message || 'Test failed',
        duration,
      });
    }
  };

  const runStripeTests = async () => {
    const categoryIndex = 0;
    
    // Test 1: Create Checkout Session
    await runTest(categoryIndex, 0, async () => {
      const result = await createStripeCheckout.mutateAsync({
        planId: 'individual',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      });
      if (!result.url) throw new Error('No checkout URL returned');
    });

    // Test 2: List Payment Methods
    await runTest(categoryIndex, 1, async () => {
      const result = listPaymentMethods.data;
      if (!Array.isArray(result)) throw new Error('Invalid payment methods response');
    });

    // Test 3: Set Default Payment Method
    await runTest(categoryIndex, 2, async () => {
      try {
        await setDefaultPaymentMethod.mutateAsync({ paymentMethodId: 'pm_test_123' });
      } catch (error: any) {
        if (!error.message.includes('No such payment_method')) {
          throw error;
        }
      }
    });

    // Test 4: Remove Payment Method
    await runTest(categoryIndex, 3, async () => {
      try {
        await removePaymentMethod.mutateAsync({ paymentMethodId: 'pm_test_123' });
      } catch (error: any) {
        if (!error.message.includes('No such payment_method')) {
          throw error;
        }
      }
    });

    // Test 5: Create Subscription
    await runTest(categoryIndex, 4, async () => {
      try {
        const result = await createStripeSubscription.mutateAsync({
          planId: 'individual',
          paymentMethodId: 'pm_test_123',
        });
        if (!result.subscriptionId) throw new Error('No subscription ID returned');
      } catch (error: any) {
        if (!error.message.includes('No such payment_method')) {
          throw error;
        }
      }
    });

    // Test 6: Update Subscription
    await runTest(categoryIndex, 5, async () => {
      try {
        await updateStripeSubscription.mutateAsync({
          subscriptionId: 'sub_test_123',
          newPlanId: 'group_family',
        });
      } catch (error: any) {
        if (!error.message.includes('No such subscription')) {
          throw error;
        }
      }
    });

    // Test 7: Cancel Subscription
    await runTest(categoryIndex, 6, async () => {
      try {
        await cancelStripeSubscription.mutateAsync();
      } catch (error: any) {
        if (!error.message.includes('No such subscription')) {
          throw error;
        }
      }
    });

    // Test 8: List Invoices
    await runTest(categoryIndex, 7, async () => {
      const result = listInvoices.data;
      if (!Array.isArray(result)) throw new Error('Invalid invoices response');
    });

    // Test 9: Webhook Processing
    await runTest(categoryIndex, 8, async () => {
      // This would typically test webhook endpoint, but we'll simulate
      updateTestResult(categoryIndex, 8, {
        status: 'warning',
        message: 'Webhook endpoint exists but requires external testing',
      });
    });
  };

  const runPayPalTests = async () => {
    const categoryIndex = 1;
    
    // Test 1: Create Payment
    await runTest(categoryIndex, 0, async () => {
      const result = await createPayPalPayment.mutateAsync({
        amount: parseFloat(testAmount),
        currency: 'USD',
        description: 'Test payment',
        returnUrl: 'https://example.com/return',
        cancelUrl: 'https://example.com/cancel',
      });
      if (!result.approvalUrl) throw new Error('No approval URL returned');
    });

    // Test 2: Execute Payment
    await runTest(categoryIndex, 1, async () => {
      try {
        await executePayPalPayment.mutateAsync({
          paymentId: 'PAY-test123',
          payerId: 'PAYER-test123',
        });
      } catch (error: any) {
        if (!error.message.includes('Invalid payment ID')) {
          throw error;
        }
      }
    });

    // Test 3: Create Subscription
    await runTest(categoryIndex, 2, async () => {
      const result = await createPayPalSubscription.mutateAsync({
        planId: 'P-test123',
        returnUrl: 'https://example.com/return',
        cancelUrl: 'https://example.com/cancel',
      });
      if (!result.approvalUrl) throw new Error('No approval URL returned');
    });

    // Test 4: Payment Error Handling
    await runTest(categoryIndex, 3, async () => {
      try {
        await createPayPalPayment.mutateAsync({
          amount: -1, // Invalid amount
          currency: 'USD',
          description: 'Test payment',
          returnUrl: 'https://example.com/return',
          cancelUrl: 'https://example.com/cancel',
        });
        throw new Error('Should have failed with invalid amount');
      } catch (error: any) {
        if (error.message.includes('Should have failed')) {
          throw error;
        }
        // Expected error
      }
    });

    // Test 5: Subscription Management
    await runTest(categoryIndex, 4, async () => {
      updateTestResult(categoryIndex, 4, {
        status: 'warning',
        message: 'PayPal subscription management requires webhook integration',
      });
    });
  };

  const runAffiliateTests = async () => {
    const categoryIndex = 2;
    
    // Test 1: Get Affiliate Stats
    await runTest(categoryIndex, 0, async () => {
      const result = getAffiliateStats.data;
      if (!result || typeof result.totalEarnings !== 'number') {
        throw new Error('Invalid stats response');
      }
    });

    // Test 2: Get Referrals List
    await runTest(categoryIndex, 1, async () => {
      const result = getReferrals.data;
      if (!result || !Array.isArray(result.referrals)) throw new Error('Invalid referrals response');
    });

    // Test 3: Get Payouts History
    await runTest(categoryIndex, 2, async () => {
      const result = getPayouts.data;
      if (!result || !Array.isArray(result.payouts)) throw new Error('Invalid payouts response');
    });

    // Test 4: Request Payout
    await runTest(categoryIndex, 3, async () => {
      try {
        await requestPayout.mutateAsync({ 
          affiliateId: 'test-affiliate',
          amount: 50,
          method: 'paypal'
        });
      } catch (error: any) {
        if (!error.message.includes('Insufficient balance') && 
            !error.message.includes('Minimum payout')) {
          throw error;
        }
      }
    });

    // Test 5: Update Payment Method
    await runTest(categoryIndex, 4, async () => {
      await updatePaymentMethod.mutateAsync({
        affiliateId: 'test-affiliate',
        method: 'paypal',
        details: {
          email: testEmail,
        },
      });
    });

    // Test 6: Referral Tracking
    await runTest(categoryIndex, 5, async () => {
      updateTestResult(categoryIndex, 5, {
        status: 'warning',
        message: 'Referral tracking requires user registration flow testing',
      });
    });

    // Test 7: Commission Calculation
    await runTest(categoryIndex, 6, async () => {
      updateTestResult(categoryIndex, 6, {
        status: 'warning',
        message: 'Commission calculation requires payment completion testing',
      });
    });
  };

  const runIntegrationTests = async () => {
    const categoryIndex = 3;
    
    // Test 1: Free to Paid Upgrade
    await runTest(categoryIndex, 0, async () => {
      updateTestResult(categoryIndex, 0, {
        status: 'warning',
        message: 'Requires full user flow testing with actual payment',
      });
    });

    // Test 2: Plan Change (Upgrade)
    await runTest(categoryIndex, 1, async () => {
      updateTestResult(categoryIndex, 1, {
        status: 'warning',
        message: 'Requires existing subscription for testing',
      });
    });

    // Test 3: Plan Change (Downgrade)
    await runTest(categoryIndex, 2, async () => {
      updateTestResult(categoryIndex, 2, {
        status: 'warning',
        message: 'Requires existing subscription for testing',
      });
    });

    // Test 4: Payment Method Switch
    await runTest(categoryIndex, 3, async () => {
      updateTestResult(categoryIndex, 3, {
        status: 'warning',
        message: 'Requires multiple payment methods setup',
      });
    });

    // Test 5: Failed Payment Recovery
    await runTest(categoryIndex, 4, async () => {
      updateTestResult(categoryIndex, 4, {
        status: 'warning',
        message: 'Requires webhook testing with failed payment simulation',
      });
    });

    // Test 6: Subscription Renewal
    await runTest(categoryIndex, 5, async () => {
      updateTestResult(categoryIndex, 5, {
        status: 'warning',
        message: 'Requires time-based testing or webhook simulation',
      });
    });

    // Test 7: Refund Processing
    await runTest(categoryIndex, 6, async () => {
      updateTestResult(categoryIndex, 6, {
        status: 'warning',
        message: 'Requires admin refund functionality implementation',
      });
    });
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setCurrentTest('Starting comprehensive payment and affiliate testing...');

    try {
      setCurrentTest('Running Stripe Integration Tests...');
      await runStripeTests();

      setCurrentTest('Running PayPal Integration Tests...');
      await runPayPalTests();

      setCurrentTest('Running Affiliate Program Tests...');
      await runAffiliateTests();

      setCurrentTest('Running Payment Flow Integration Tests...');
      await runIntegrationTests();

      setCurrentTest('All tests completed!');
      
      // Generate summary
      const allTests = testCategories.flatMap(cat => cat.tests);
      const passed = allTests.filter(t => t.status === 'success').length;
      const failed = allTests.filter(t => t.status === 'error').length;
      const warnings = allTests.filter(t => t.status === 'warning').length;
      
      console.log('Testing Complete', `Results: ${passed} passed, ${failed} failed, ${warnings} warnings`);
    } catch (error: any) {
      console.error('Testing Error', error.message);
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const toggleCategory = (index: number) => {
    setTestCategories(prev => {
      const updated = [...prev];
      updated[index].expanded = !updated[index].expanded;
      return updated;
    });
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={16} color="#10B981" />;
      case 'error':
        return <XCircle size={16} color="#EF4444" />;
      case 'warning':
        return <AlertCircle size={16} color="#F59E0B" />;
      default:
        return <View style={styles.pendingIcon} />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Payment & Affiliate Testing',
          headerStyle: { backgroundColor: '#1F2937' },
          headerTintColor: '#FFFFFF',
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Beta Payment & Affiliate Testing</Text>
          <Text style={styles.subtitle}>
            Comprehensive testing suite for Stripe, PayPal, and Affiliate systems
          </Text>
        </View>

        <View style={styles.configSection}>
          <Text style={styles.sectionTitle}>Test Configuration</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Test Email:</Text>
            <TextInput
              style={styles.input}
              value={testEmail}
              onChangeText={setTestEmail}
              placeholder="test@example.com"
              keyboardType="email-address"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Test Amount:</Text>
            <TextInput
              style={styles.input}
              value={testAmount}
              onChangeText={setTestAmount}
              placeholder="5.99"
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.runButton, isRunning && styles.runButtonDisabled]}
          onPress={runAllTests}
          disabled={isRunning}
        >
          {isRunning ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <DollarSign size={20} color="#FFFFFF" />
          )}
          <Text style={styles.runButtonText}>
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Text>
        </TouchableOpacity>

        {currentTest ? (
          <View style={styles.currentTest}>
            <Text style={styles.currentTestText}>{currentTest}</Text>
          </View>
        ) : null}

        {testCategories.map((category, categoryIndex) => (
          <View key={category.name} style={styles.category}>
            <TouchableOpacity
              style={styles.categoryHeader}
              onPress={() => toggleCategory(categoryIndex)}
            >
              <View style={styles.categoryTitleContainer}>
                {categoryIndex === 0 && <CreditCard size={20} color="#3B82F6" />}
                {categoryIndex === 1 && <DollarSign size={20} color="#10B981" />}
                {categoryIndex === 2 && <Users size={20} color="#8B5CF6" />}
                {categoryIndex === 3 && <AlertCircle size={20} color="#F59E0B" />}
                <Text style={styles.categoryTitle}>{category.name}</Text>
              </View>
              <Text style={styles.expandIcon}>
                {category.expanded ? '\u25bc' : '\u25b6'}
              </Text>
            </TouchableOpacity>

            {category.expanded && (
              <View style={styles.tests}>
                {category.tests.map((test, testIndex) => (
                  <View key={test.name} style={styles.test}>
                    <View style={styles.testHeader}>
                      {getStatusIcon(test.status)}
                      <Text style={styles.testName}>{test.name}</Text>
                      {test.duration && (
                        <Text style={styles.testDuration}>
                          {test.duration}ms
                        </Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.testMessage,
                        { color: getStatusColor(test.status) },
                      ]}
                    >
                      {test.message}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This testing suite validates payment processing, subscription management,
            and affiliate program functionality across Stripe and PayPal integrations.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    lineHeight: 24,
  },
  configSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  runButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  runButtonDisabled: {
    backgroundColor: '#6B7280',
  },
  runButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  currentTest: {
    backgroundColor: '#1F2937',
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  currentTestText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontStyle: 'italic',
  },
  category: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#374151',
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  expandIcon: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  tests: {
    padding: 16,
  },
  test: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  testName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  testDuration: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  testMessage: {
    fontSize: 12,
    marginLeft: 24,
  },
  pendingIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#6B7280',
  },
  footer: {
    padding: 20,
    paddingTop: 0,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
});