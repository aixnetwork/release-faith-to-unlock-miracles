import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { trpcClient } from '@/lib/trpc';
import { Colors } from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle, XCircle, Loader } from 'lucide-react-native';

export default function TestTRPCBackend() {
  const [testResults, setTestResults] = useState<{
    name: string;
    status: 'pending' | 'success' | 'error';
    message: string;
  }[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [email, setEmail] = useState('john.doe@example.com');
  const [password, setPassword] = useState('demo123');

  const addTestResult = (name: string, status: 'pending' | 'success' | 'error', message: string) => {
    setTestResults(prev => [...prev, { name, status, message }]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Test 1: Demo Login
    addTestResult('Demo Login', 'pending', 'Testing authentication...');
    try {
      const loginResult = await trpcClient.auth.demoLogin.mutate({
        email,
        password,
      });
      
      if (loginResult?.success) {
        addTestResult('Demo Login', 'success', `✅ Logged in as: ${loginResult.data.user.email}`);
        console.log('Login successful:', loginResult);
      } else {
        addTestResult('Demo Login', 'error', '❌ Login failed - no success flag');
      }
    } catch (error) {
      addTestResult('Demo Login', 'error', `❌ ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Login error:', error);
    }

    // Test 2: Example Hi
    addTestResult('Example Hi', 'pending', 'Testing example endpoint...');
    try {
      const hiResult = await trpcClient.example.hi.query();
      if (hiResult && typeof hiResult === 'object' && 'message' in hiResult) {
        addTestResult('Example Hi', 'success', `✅ Response: ${(hiResult as any).message}`);
      } else {
        addTestResult('Example Hi', 'error', '❌ No message received');
      }
    } catch (error) {
      addTestResult('Example Hi', 'error', `❌ ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 3: Get Home Stats
    addTestResult('Home Stats', 'pending', 'Testing home stats endpoint...');
    try {
      const statsResult = await trpcClient.home.getStats.query();
      if (statsResult) {
        addTestResult('Home Stats', 'success', `✅ Stats received: ${JSON.stringify(statsResult)}`);
      } else {
        addTestResult('Home Stats', 'error', '❌ No stats received');
      }
    } catch (error) {
      addTestResult('Home Stats', 'error', `❌ ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 4: Get Prayers List
    addTestResult('Prayers List', 'pending', 'Testing prayers endpoint...');
    try {
      const prayersResult = await trpcClient.prayers.list.query({});
      if (Array.isArray(prayersResult)) {
        addTestResult('Prayers List', 'success', `✅ Received ${prayersResult.length} prayers`);
      } else {
        addTestResult('Prayers List', 'error', '❌ Invalid response format');
      }
    } catch (error) {
      addTestResult('Prayers List', 'error', `❌ ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 5: Get Meetings List
    addTestResult('Meetings List', 'pending', 'Testing meetings endpoint...');
    try {
      const meetingsResult = await trpcClient.meetings.list.query();
      if (Array.isArray(meetingsResult)) {
        addTestResult('Meetings List', 'success', `✅ Received ${meetingsResult.length} meetings`);
      } else {
        addTestResult('Meetings List', 'error', '❌ Invalid response format');
      }
    } catch (error) {
      addTestResult('Meetings List', 'error', `❌ ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    setIsRunning(false);
    
    // Show summary
    const successCount = testResults.filter(r => r.status === 'success').length + 1; // +1 for last test
    const errorCount = testResults.filter(r => r.status === 'error').length;
    
    Alert.alert(
      'Test Complete',
      `✅ Passed: ${successCount}\n❌ Failed: ${errorCount}\n\nThe mock backend is ${errorCount === 0 ? 'working correctly!' : 'experiencing issues.'}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>tRPC Backend Integration Test</Text>
        <Text style={styles.subtitle}>Testing mock backend responses</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Test Email:</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <Text style={styles.label}>Test Password:</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.button, isRunning && styles.buttonDisabled]}
          onPress={runTests}
          disabled={isRunning}
        >
          {isRunning ? (
            <>
              <Loader size={20} color="white" />
              <Text style={styles.buttonText}>Running Tests...</Text>
            </>
          ) : (
            <Text style={styles.buttonText}>Run All Tests</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resultsContainer}>
          {testResults.map((result, index) => (
            <View key={index} style={styles.resultItem}>
              {result.status === 'success' && <CheckCircle size={20} color={Colors.light.success} />}
              {result.status === 'error' && <XCircle size={20} color={Colors.light.error} />}
              {result.status === 'pending' && <Loader size={20} color={Colors.light.primary} />}
              <View style={styles.resultText}>
                <Text style={styles.resultName}>{result.name}</Text>
                <Text style={[
                  styles.resultMessage,
                  result.status === 'error' && styles.errorText,
                  result.status === 'success' && styles.successText,
                ]}>
                  {result.message}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>ℹ️ Mock Backend Info</Text>
          <Text style={styles.infoText}>
            This app uses a mock backend that simulates tRPC responses.
            No actual backend server is required.
          </Text>
          <Text style={styles.infoText}>
            Demo accounts available:{'\n'}
            • john.doe@example.com (Individual){'\n'}
            • family.leader@example.com (Family){'\n'}
            • admin@gracechurch.com (Church){'\n'}
            Password for all: demo123
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textDark,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: Colors.light.primary,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    marginBottom: 24,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  resultText: {
    flex: 1,
  },
  resultName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  resultMessage: {
    fontSize: 12,
    color: Colors.light.textDark,
  },
  errorText: {
    color: Colors.light.error,
  },
  successText: {
    color: Colors.light.success,
  },
  infoBox: {
    backgroundColor: Colors.light.primaryLight + '20',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.primary + '30',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.textDark,
    marginBottom: 8,
    lineHeight: 20,
  },
});