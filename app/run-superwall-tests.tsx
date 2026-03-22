import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { useSuperwall } from '@/components/SuperwallProvider';
import { useUserStore } from '@/store/userStore';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  User, 
  Crown, 
  Settings,
  TestTube
} from 'lucide-react-native';

export default function RunSuperwallTestsScreen() {
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

  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const runComprehensiveTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    addResult('🚀 Starting Superwall comprehensive test...');
    
    try {
      // Test 1: Provider Integration
      addResult('📋 Testing provider integration...');
      if (typeof showSuperwall === 'function' && typeof checkFeatureAccess === 'function') {
        addResult('✅ Superwall provider properly integrated');
      } else {
        addResult('❌ Superwall provider integration failed');
        setIsRunning(false);
        return;
      }

      // Test 2: User Store Integration
      addResult('📋 Testing user store integration...');
      if (typeof isLoggedIn === 'boolean' && typeof plan === 'string') {
        addResult(`✅ User store integrated - Logged in: ${isLoggedIn}, Plan: ${plan}`);
      } else {
        addResult('❌ User store integration failed');
      }

      // Test 3: Not Logged In State
      addResult('📋 Testing not logged in state...');
      if (isLoggedIn) logout();
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const notLoggedInAccess = checkFeatureAccess('Test Feature');
      if (!notLoggedInAccess) {
        addResult('✅ Correctly denied access when not logged in');
      } else {
        addResult('❌ Should deny access when not logged in');
      }

      // Test 4: Free User State
      addResult('📋 Testing free user access...');
      login({ name: 'Test User', email: 'test@example.com', plan: 'free' });
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const freeUserAccess = checkFeatureAccess('Premium Feature');
      if (!freeUserAccess) {
        addResult('✅ Correctly denied premium access to free user');
      } else {
        addResult('❌ Should deny premium access to free user');
      }

      // Test 5: Premium User State
      addResult('📋 Testing premium user access...');
      updatePlan('premium');
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const premiumUserAccess = checkFeatureAccess('Premium Feature');
      if (premiumUserAccess) {
        addResult('✅ Premium user has access to premium features');
      } else {
        addResult('❌ Premium user should have access to premium features');
      }

      // Test 6: Lifetime User State
      addResult('📋 Testing lifetime user access...');
      updatePlan('lifetime');
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const lifetimeUserAccess = checkFeatureAccess('Lifetime Feature', 'lifetime');
      if (lifetimeUserAccess) {
        addResult('✅ Lifetime user has access to lifetime features');
      } else {
        addResult('❌ Lifetime user should have access to lifetime features');
      }

      // Test 7: Manual Superwall Trigger
      addResult('📋 Testing manual Superwall trigger...');
      const manualShown = showSuperwall({
        feature: 'Test Feature',
        context: 'upgrade_prompt',
        title: 'Test Superwall',
        description: 'This is a test of manual Superwall trigger',
        forceShow: true
      });
      
      if (manualShown) {
        addResult('✅ Manual Superwall triggered successfully');
      } else {
        addResult('❌ Manual Superwall failed to trigger');
      }

      // Test 8: Trial Ending Trigger
      addResult('📋 Testing trial ending trigger...');
      try {
        triggerTrialEnding();
        addResult('✅ Trial ending trigger executed without error');
      } catch (error) {
        addResult(`❌ Trial ending trigger failed: ${error}`);
      }

      // Test 9: Onboarding Trigger
      addResult('📋 Testing onboarding trigger...');
      try {
        triggerOnboarding();
        addResult('✅ Onboarding trigger executed without error');
      } catch (error) {
        addResult(`❌ Onboarding trigger failed: ${error}`);
      }

      // Test 10: Force Show Functionality
      addResult('📋 Testing force show functionality...');
      const forceShown = showSuperwall({
        feature: 'Force Show Test',
        context: 'upgrade_prompt',
        title: 'Force Show Test',
        description: 'This should show even for lifetime users',
        forceShow: true
      });
      
      if (forceShown) {
        addResult('✅ Force show works correctly');
      } else {
        addResult('❌ Force show failed');
      }

      addResult('🎉 Comprehensive test completed!');
      
      // Count results
      const passedTests = testResults.filter(r => r.includes('✅')).length;
      const failedTests = testResults.filter(r => r.includes('❌')).length;
      
      Alert.alert(
        'Test Results',
        `Superwall tests completed!\n\n✅ Passed: ${passedTests}\n❌ Failed: ${failedTests}`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      addResult(`❌ Test suite error: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const quickFeatureTest = () => {
    // Quick test of current user's feature access
    const features = [
      'AI Prayer Assistant',
      'Premium Prayer Plans',
      'Advanced Analytics',
      'Community Features',
      'Music Library'
    ];

    features.forEach(feature => {
      const hasAccess = checkFeatureAccess(feature);
      addResult(hasAccess ? `✅ Access granted: ${feature}` : `🔒 Access denied: ${feature}`);
    });
  };

  const testSuperwallTriggers = () => {
    // Test different Superwall contexts
    const contexts = [
      { context: 'trial' as const, title: 'Trial Test', description: 'Testing trial context' },
      { context: 'feature_limit' as const, title: 'Feature Limit Test', description: 'Testing feature limit context' },
      { context: 'upgrade_prompt' as const, title: 'Upgrade Test', description: 'Testing upgrade prompt context' },
      { context: 'onboarding' as const, title: 'Onboarding Test', description: 'Testing onboarding context' }
    ];

    contexts.forEach(({ context, title, description }) => {
      const shown = showSuperwall({
        feature: `${context} test`,
        context,
        title,
        description,
        forceShow: true
      });
      addResult(shown ? `✅ ${context} Superwall shown` : `❌ ${context} Superwall failed`);
    });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Superwall Tests',
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

        {/* Test Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Controls</Text>
          <View style={styles.buttonGrid}>
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton, isRunning && styles.buttonDisabled]} 
              onPress={runComprehensiveTest}
              disabled={isRunning}
            >
              <TestTube size={20} color={Colors.light.white} />
              <Text style={styles.buttonText}>
                {isRunning ? 'Running...' : 'Run Full Test'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]} 
              onPress={quickFeatureTest}
            >
              <CheckCircle size={20} color={Colors.light.white} />
              <Text style={styles.buttonText}>Quick Feature Test</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.tertiaryButton]} 
              onPress={testSuperwallTriggers}
            >
              <Play size={20} color={Colors.light.white} />
              <Text style={styles.buttonText}>Test Triggers</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.navButton]} 
              onPress={() => router.push('/superwall-test')}
            >
              <Settings size={20} color={Colors.light.white} />
              <Text style={styles.buttonText}>Manual Test Screen</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Test Results */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Results</Text>
          <View style={styles.resultsContainer}>
            {testResults.length === 0 ? (
              <Text style={styles.noResults}>No test results yet. Run a test to see results!</Text>
            ) : (
              testResults.map((result, index) => (
                <Text key={index} style={styles.resultText}>{result}</Text>
              ))
            )}
          </View>
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
  buttonGrid: {
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
  primaryButton: {
    backgroundColor: Colors.light.success,
  },
  secondaryButton: {
    backgroundColor: Colors.light.primary,
  },
  tertiaryButton: {
    backgroundColor: Colors.light.warning,
  },
  navButton: {
    backgroundColor: Colors.light.textMedium,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.white,
  },
  resultsContainer: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    minHeight: 200,
    ...theme.shadows.small,
  },
  noResults: {
    fontSize: 14,
    color: Colors.light.textMedium,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  resultText: {
    fontSize: 12,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.xs,
    fontFamily: 'monospace',
  },
});