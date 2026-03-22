import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { theme } from '@/constants/theme';
import { trpcClient, getBaseUrl } from '@/lib/trpc';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  duration?: number;
}

export default function TestTRPCAPI() {
  const insets = useSafeAreaInsets();
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Health Check (Root)', status: 'pending' },
    { name: 'Health Check (/api/health)', status: 'pending' },
    { name: 'Test tRPC Connection', status: 'pending' },
    { name: 'Demo Login tRPC', status: 'pending' },
    { name: 'Example Hi tRPC', status: 'pending' },
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTest = (index: number, update: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) => i === index ? { ...test, ...update } : test));
  };

  const runAllTests = async () => {
    setIsRunning(true);

    const baseUrl = getBaseUrl();
    console.log('🔵 Testing with base URL:', baseUrl);

    // Test 1: Root Health Check
    try {
      updateTest(0, { status: 'running' });
      const startTime = Date.now();
      const response = await fetch(`${baseUrl}/`);
      // Just check connectivity, ignore content
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        updateTest(0, { 
          status: 'success', 
          message: `Server reachable (${duration}ms)`,
          duration 
        });
      } else {
        updateTest(0, { 
          status: 'error', 
          message: `Server returned ${response.status}` 
        });
      }
    } catch (error) {
      updateTest(0, { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    }

    // Test 2: API Health Check
    try {
      updateTest(1, { status: 'running' });
      const startTime = Date.now();
      const response = await fetch(`${baseUrl}/api/health`);
      const text = await response.text();
      const duration = Date.now() - startTime;
      
      try {
        const data = JSON.parse(text);
        if (response.ok && data.status === 'ok') {
          updateTest(1, { 
            status: 'success', 
            message: `Backend API is working (${duration}ms)`,
            duration 
          });
        } else {
          updateTest(1, { 
            status: 'error', 
            message: `Unexpected response: ${text.substring(0, 100)}` 
          });
        }
      } catch {
        updateTest(1, { 
          status: 'error', 
          message: `Invalid JSON: ${text.substring(0, 100)}` 
        });
      }
    } catch (error) {
      updateTest(1, { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    }

    // Test 3: Test tRPC Connection
    try {
      updateTest(2, { status: 'running' });
      const startTime = Date.now();
      const response = await fetch(`${baseUrl}/test-trpc`);
      const text = await response.text();
      const duration = Date.now() - startTime;
      
      try {
        const data = JSON.parse(text);
        if (response.ok && data.status === 'ok') {
          updateTest(2, { 
            status: 'success', 
            message: `tRPC endpoint accessible (${duration}ms)`,
            duration 
          });
        } else {
          updateTest(2, { 
            status: 'error', 
            message: `Unexpected response: ${text.substring(0, 100)}` 
          });
        }
      } catch {
        updateTest(2, { 
          status: 'error', 
          message: `Invalid JSON: ${text.substring(0, 100)}` 
        });
      }
    } catch (error) {
      updateTest(2, { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    }

    // Test 4: Demo Login via tRPC
    try {
      updateTest(3, { status: 'running' });
      const startTime = Date.now();
      
      const result = await trpcClient.auth.demoLogin.mutate({
        email: 'john.doe@example.com',
        password: 'demo123',
      });
      
      const duration = Date.now() - startTime;
      
      if (result.success) {
        updateTest(3, { 
          status: 'success', 
          message: `Logged in as ${result.data.user.first_name} (${duration}ms)`,
          duration 
        });
      } else {
        updateTest(3, { 
          status: 'error', 
          message: 'Login failed' 
        });
      }
    } catch (error) {
      updateTest(3, { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    }

    // Test 5: Example Hi tRPC
    try {
      updateTest(4, { status: 'running' });
      const startTime = Date.now();
      
      const result = await trpcClient.example.hi.query();
      const duration = Date.now() - startTime;
      
      if (result) {
        updateTest(4, { 
          status: 'success', 
          message: `Response: "${result.greeting}" (${duration}ms)`,
          duration 
        });
      } else {
        updateTest(4, { 
          status: 'error', 
          message: 'No response' 
        });
      }
    } catch (error) {
      updateTest(4, { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={20} color={Colors.light.success} />;
      case 'error':
        return <XCircle size={20} color={Colors.light.error} />;
      case 'running':
        return <ActivityIndicator size="small" color={Colors.light.primary} />;
      default:
        return <AlertCircle size={20} color={Colors.light.textLight} />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return Colors.light.success;
      case 'error':
        return Colors.light.error;
      case 'running':
        return Colors.light.primary;
      default:
        return Colors.light.textLight;
    }
  };

  const successCount = tests.filter(t => t.status === 'success').length;
  const errorCount = tests.filter(t => t.status === 'error').length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ title: 'tRPC API Test' }} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>API & tRPC Test Suite</Text>
          <Text style={styles.subtitle}>
            Verify backend connectivity and endpoints
          </Text>
        </View>

        {/* Stats */}
        {(successCount > 0 || errorCount > 0) && (
          <View style={styles.stats}>
            <View style={styles.statCard}>
              <CheckCircle size={24} color={Colors.light.success} />
              <Text style={styles.statValue}>{successCount}</Text>
              <Text style={styles.statLabel}>Passed</Text>
            </View>
            <View style={styles.statCard}>
              <XCircle size={24} color={Colors.light.error} />
              <Text style={styles.statValue}>{errorCount}</Text>
              <Text style={styles.statLabel}>Failed</Text>
            </View>
          </View>
        )}

        {/* Test Results */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Results</Text>
          {tests.map((test, index) => (
            <View key={index} style={styles.testCard}>
              <View style={styles.testHeader}>
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
            </View>
          ))}
        </View>

        {/* Run Button */}
        <TouchableOpacity
          style={[styles.runButton, isRunning && styles.runButtonDisabled]}
          onPress={runAllTests}
          disabled={isRunning}
        >
          <Text style={styles.runButtonText}>
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Text>
        </TouchableOpacity>

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
  header: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textMedium,
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.xs,
    ...theme.shadows.small,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.light.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textMedium,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.md,
  },
  testCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.textPrimary,
    flex: 1,
  },
  testMessage: {
    fontSize: 14,
    marginTop: theme.spacing.xs,
    marginLeft: 28,
  },
  runButton: {
    marginHorizontal: theme.spacing.lg,
    backgroundColor: Colors.light.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  runButtonDisabled: {
    opacity: 0.6,
  },
  runButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.white,
  },
  bottomSpacing: {
    height: theme.spacing.xl,
  },
});
