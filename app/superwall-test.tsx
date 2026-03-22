import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { useSuperwall } from '@/components/SuperwallProvider';
import { useUserStore } from '@/store/userStore';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { 
  TestTube, 
  User, 
  Crown, 
  Gift, 
  Zap, 
  Shield, 
  Settings,
  LogOut,
  LogIn,
  UserPlus,
  Star,
  Heart,
  MessageSquare,
  Music,
  BookOpen,
  Calendar,
  Users
} from 'lucide-react-native';

export default function SuperwallTestScreen() {
  const { 
    showSuperwall, 
    checkFeatureAccess, 
    triggerTrialEnding, 
    triggerOnboarding 
  } = useSuperwall();
  
  const { 
    isLoggedIn, 
    plan, 
    name, 
    email,
    login, 
    logout, 
    updatePlan 
  } = useUserStore();

  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  // Test user state changes
  const testLogin = () => {
    login({
      name: 'Test User',
      email: 'test@example.com',
      plan: 'free'
    });
    addTestResult('✅ User logged in as free user');
  };

  const testLogout = () => {
    logout();
    addTestResult('✅ User logged out');
  };

  const testUpgradeToPremium = () => {
    updatePlan('premium');
    addTestResult('✅ User upgraded to premium');
  };

  const testUpgradeToLifetime = () => {
    updatePlan('lifetime');
    addTestResult('✅ User upgraded to lifetime');
  };

  const testDowngradeToFree = () => {
    updatePlan('free');
    addTestResult('✅ User downgraded to free');
  };

  // Test Superwall triggers
  const testManualSuperwall = () => {
    const shown = showSuperwall({
      feature: 'Manual Test Feature',
      context: 'upgrade_prompt',
      title: 'Manual Test',
      description: 'This is a manual test of the Superwall.',
      forceShow: true
    });
    addTestResult(shown ? '✅ Manual Superwall shown' : '❌ Manual Superwall not shown');
  };

  const testFeatureAccess = (feature: string, requiredPlan?: 'premium' | 'lifetime') => {
    const hasAccess = checkFeatureAccess(feature, requiredPlan);
    addTestResult(
      hasAccess 
        ? `✅ Access granted to ${feature}` 
        : `🔒 Access denied to ${feature} - Superwall should show`
    );
  };

  const testTrialEnding = () => {
    triggerTrialEnding();
    addTestResult('✅ Trial ending Superwall triggered');
  };

  const testOnboarding = () => {
    triggerOnboarding();
    addTestResult('✅ Onboarding Superwall triggered');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const runFullTest = async () => {
    clearResults();
    addTestResult('🚀 Starting comprehensive Superwall test...');
    
    // Test 1: Not logged in state
    if (isLoggedIn) logout();
    await new Promise(resolve => setTimeout(resolve, 100));
    testFeatureAccess('Premium Prayer Plans');
    
    // Test 2: Free user state
    testLogin();
    await new Promise(resolve => setTimeout(resolve, 100));
    testFeatureAccess('AI Prayer Assistant');
    testFeatureAccess('Advanced Analytics');
    testFeatureAccess('Lifetime Features', 'lifetime');
    
    // Test 3: Premium user state
    testUpgradeToPremium();
    await new Promise(resolve => setTimeout(resolve, 100));
    testFeatureAccess('AI Prayer Assistant');
    testFeatureAccess('Lifetime Features', 'lifetime');
    
    // Test 4: Lifetime user state
    testUpgradeToLifetime();
    await new Promise(resolve => setTimeout(resolve, 100));
    testFeatureAccess('AI Prayer Assistant');
    testFeatureAccess('Lifetime Features', 'lifetime');
    
    addTestResult('✅ Comprehensive test completed!');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Superwall Test',
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
              <User size={20} color={Colors.light.primary} />
              <Text style={styles.stateText}>
                Logged In: {isLoggedIn ? '✅ Yes' : '❌ No'}
              </Text>
            </View>
            {isLoggedIn && (
              <>
                <View style={styles.stateRow}>
                  <Text style={styles.stateLabel}>Name:</Text>
                  <Text style={styles.stateValue}>{name}</Text>
                </View>
                <View style={styles.stateRow}>
                  <Text style={styles.stateLabel}>Email:</Text>
                  <Text style={styles.stateValue}>{email}</Text>
                </View>
              </>
            )}
            <View style={styles.stateRow}>
              <Crown size={20} color={Colors.light.warning} />
              <Text style={styles.stateText}>Plan: {plan.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* User State Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User State Controls</Text>
          <View style={styles.buttonGrid}>
            <TouchableOpacity style={styles.button} onPress={testLogin}>
              <LogIn size={20} color={Colors.light.white} />
              <Text style={styles.buttonText}>Login as Free</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button} onPress={testLogout}>
              <LogOut size={20} color={Colors.light.white} />
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.button, styles.premiumButton]} onPress={testUpgradeToPremium}>
              <Zap size={20} color={Colors.light.white} />
              <Text style={styles.buttonText}>Upgrade Premium</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.button, styles.lifetimeButton]} onPress={testUpgradeToLifetime}>
              <Gift size={20} color={Colors.light.white} />
              <Text style={styles.buttonText}>Upgrade Lifetime</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button} onPress={testDowngradeToFree}>
              <UserPlus size={20} color={Colors.light.white} />
              <Text style={styles.buttonText}>Downgrade Free</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Superwall Tests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Superwall Tests</Text>
          <View style={styles.buttonGrid}>
            <TouchableOpacity style={[styles.button, styles.testButton]} onPress={testManualSuperwall}>
              <TestTube size={20} color={Colors.light.white} />
              <Text style={styles.buttonText}>Manual Superwall</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.button, styles.testButton]} onPress={testTrialEnding}>
              <Calendar size={20} color={Colors.light.white} />
              <Text style={styles.buttonText}>Trial Ending</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.button, styles.testButton]} onPress={testOnboarding}>
              <Star size={20} color={Colors.light.white} />
              <Text style={styles.buttonText}>Onboarding</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Feature Access Tests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feature Access Tests</Text>
          <View style={styles.buttonGrid}>
            <TouchableOpacity 
              style={[styles.button, styles.featureButton]} 
              onPress={() => testFeatureAccess('AI Prayer Assistant')}
            >
              <Heart size={20} color={Colors.light.white} />
              <Text style={styles.buttonText}>AI Assistant</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.featureButton]} 
              onPress={() => testFeatureAccess('Premium Prayer Plans')}
            >
              <BookOpen size={20} color={Colors.light.white} />
              <Text style={styles.buttonText}>Prayer Plans</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.featureButton]} 
              onPress={() => testFeatureAccess('Advanced Analytics')}
            >
              <Settings size={20} color={Colors.light.white} />
              <Text style={styles.buttonText}>Analytics</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.featureButton]} 
              onPress={() => testFeatureAccess('Community Features')}
            >
              <Users size={20} color={Colors.light.white} />
              <Text style={styles.buttonText}>Community</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.featureButton]} 
              onPress={() => testFeatureAccess('Music Library')}
            >
              <Music size={20} color={Colors.light.white} />
              <Text style={styles.buttonText}>Music</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.featureButton]} 
              onPress={() => testFeatureAccess('Lifetime Features', 'lifetime')}
            >
              <Shield size={20} color={Colors.light.white} />
              <Text style={styles.buttonText}>Lifetime Only</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Comprehensive Test */}
        <View style={styles.section}>
          <TouchableOpacity style={[styles.button, styles.fullTestButton]} onPress={runFullTest}>
            <TestTube size={24} color={Colors.light.white} />
            <Text style={[styles.buttonText, { fontSize: 18 }]}>Run Full Test Suite</Text>
          </TouchableOpacity>
        </View>

        {/* Test Results */}
        <View style={styles.section}>
          <View style={styles.resultsHeader}>
            <Text style={styles.sectionTitle}>Test Results</Text>
            <TouchableOpacity style={styles.clearButton} onPress={clearResults}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.resultsContainer}>
            {testResults.length === 0 ? (
              <Text style={styles.noResults}>No test results yet. Run some tests!</Text>
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
    fontSize: 20,
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
    fontSize: 16,
    color: Colors.light.textPrimary,
    fontWeight: '500' as const,
  },
  stateLabel: {
    fontSize: 14,
    color: Colors.light.textMedium,
    fontWeight: '500' as const,
    minWidth: 50,
  },
  stateValue: {
    fontSize: 14,
    color: Colors.light.textPrimary,
    flex: 1,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  button: {
    backgroundColor: Colors.light.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    minWidth: '45%',
    justifyContent: 'center',
    ...theme.shadows.small,
  },
  premiumButton: {
    backgroundColor: Colors.light.warning,
  },
  lifetimeButton: {
    backgroundColor: Colors.light.error,
  },
  testButton: {
    backgroundColor: Colors.light.success,
  },
  featureButton: {
    backgroundColor: Colors.light.primaryDark,
  },
  fullTestButton: {
    backgroundColor: Colors.light.primary,
    width: '100%',
    paddingVertical: theme.spacing.lg,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.white,
    textAlign: 'center',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  clearButton: {
    backgroundColor: Colors.light.textMedium,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  clearButtonText: {
    fontSize: 12,
    color: Colors.light.white,
    fontWeight: '600' as const,
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