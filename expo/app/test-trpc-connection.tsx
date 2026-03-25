import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { trpc, trpcClient, getBaseUrl } from '@/lib/trpc';
import { Colors } from '@/constants/Colors';

export default function TestTRPCConnection() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string) => {
    console.log(message);
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testBasicFetch = async () => {
    setLoading(true);
    addLog('🔍 Testing basic fetch to API health endpoint...');
    
    try {
      const baseUrl = getBaseUrl();
      const healthUrl = `${baseUrl}/api/health`;
      addLog(`📡 Fetching: ${healthUrl}`);
      
      const response = await fetch(healthUrl);
      addLog(`✅ Response status: ${response.status}`);
      addLog(`✅ Content-Type: ${response.headers.get('content-type')}`);
      
      const text = await response.text();
      addLog(`✅ Response text (first 200 chars): ${text.substring(0, 200)}`);
      
      try {
        const json = JSON.parse(text);
        addLog(`✅ JSON parsed successfully: ${JSON.stringify(json)}`);
      } catch (e) {
        addLog(`❌ Failed to parse JSON: ${e}`);
      }
    } catch (error) {
      addLog(`❌ Fetch error: ${error}`);
    }
    
    setLoading(false);
  };

  const testTRPCEndpoint = async () => {
    setLoading(true);
    addLog('🔍 Testing tRPC endpoint directly...');
    
    try {
      const baseUrl = getBaseUrl();
      const trpcUrl = `${baseUrl}/api/trpc/example.hi`;
      addLog(`📡 Fetching: ${trpcUrl}`);
      
      const response = await fetch(trpcUrl, {
        method: 'GET',
      });
      
      addLog(`✅ Response status: ${response.status}`);
      addLog(`✅ Content-Type: ${response.headers.get('content-type')}`);
      
      const text = await response.text();
      addLog(`✅ Response text (first 200 chars): ${text.substring(0, 200)}`);
    } catch (error) {
      addLog(`❌ Fetch error: ${error}`);
    }
    
    setLoading(false);
  };

  const testTRPCClient = async () => {
    setLoading(true);
    addLog('🔍 Testing tRPC client (example.hi)...');
    
    try {
      addLog('📡 Calling trpcClient.example.hi.query()...');
      // Use trpcClient for imperative calls, not the hook creator
      const result = await trpcClient.example.hi.query();
      addLog(`✅ Result: ${JSON.stringify(result)}`);
    } catch (error: any) {
      addLog(`❌ tRPC error: ${error?.message || error}`);
      if (error?.data) {
        addLog(`❌ Error data: ${JSON.stringify(error.data)}`);
      }
    }
    
    setLoading(false);
  };

  const testDemoLogin = async () => {
    setLoading(true);
    addLog('🔍 Testing demo login via tRPC...');
    
    try {
      addLog('📡 Calling trpcClient.auth.demoLogin.mutate()...');
      const result = await trpcClient.auth.demoLogin.mutate({
        email: 'john.doe@example.com',
        password: 'demo123',
      });
      addLog(`✅ Login successful: ${JSON.stringify(result, null, 2)}`);
    } catch (error: any) {
      addLog(`❌ Login error: ${error?.message || error}`);
      if (error?.data) {
        addLog(`❌ Error data: ${JSON.stringify(error.data)}`);
      }
    }
    
    setLoading(false);
  };

  const clearLogs = () => {
    setTestResults([]);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Test tRPC Connection', headerShown: true }} />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>tRPC Connection Tester</Text>
          <Text style={styles.subtitle}>Debug backend integration issues</Text>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Base URL:</Text>
            <Text style={styles.infoValue}>{getBaseUrl()}</Text>
            <Text style={styles.infoLabel}>tRPC URL:</Text>
            <Text style={styles.infoValue}>{getBaseUrl()}/api/trpc</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={testBasicFetch}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Test API Health</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={testTRPCEndpoint}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Test tRPC Endpoint</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={testTRPCClient}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Test tRPC Client</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={testDemoLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Test Demo Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.clearButton]}
              onPress={clearLogs}
            >
              <Text style={styles.buttonText}>Clear Logs</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.logsContainer}>
            <Text style={styles.logsTitle}>Test Results:</Text>
            {testResults.length === 0 ? (
              <Text style={styles.noLogs}>No tests run yet. Click a button above to test.</Text>
            ) : (
              testResults.map((result, index) => (
                <Text key={index} style={styles.logItem}>
                  {result}
                </Text>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.icon,
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.tint,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.icon,
    marginTop: 8,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 20,
  },
  button: {
    backgroundColor: Colors.light.tint,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  clearButton: {
    backgroundColor: '#6B7280',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logsContainer: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 8,
    minHeight: 200,
  },
  logsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  noLogs: {
    color: '#9CA3AF',
    fontSize: 14,
    fontStyle: 'italic',
  },
  logItem: {
    color: '#D1D5DB',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
});
