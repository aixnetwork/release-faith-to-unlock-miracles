import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { trpcClient, getBaseUrl } from '@/lib/trpc';
import { Colors } from '@/constants/Colors';

export default function TestTRPCSimple() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const testSimpleCall = async () => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      // Log the base URL being used
      const baseUrl = getBaseUrl();
      console.log('🔵 Testing tRPC with base URL:', baseUrl);
      console.log('🔵 Full tRPC URL:', `${baseUrl}/api/trpc`);
      
      // Try to make a simple tRPC call
      const response = await trpcClient.example.hi.query();
      console.log('✅ tRPC Response:', response);
      
      setResult(JSON.stringify(response, null, 2));
    } catch (err: any) {
      console.error('❌ tRPC Error:', err);
      setError(err?.message || 'Unknown error occurred');
      
      // Log more details about the error
      if (err?.data) {
        console.error('❌ Error data:', err.data);
      }
      if (err?.shape) {
        console.error('❌ Error shape:', err.shape);
      }
    } finally {
      setLoading(false);
    }
  };

  const testFetch = async () => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      const baseUrl = getBaseUrl();
      const healthUrl = `${baseUrl}/api/health`;
      
      console.log('🔵 Testing direct fetch to:', healthUrl);
      
      const response = await fetch(healthUrl);
      const text = await response.text();
      
      console.log('✅ Response status:', response.status);
      console.log('✅ Response text:', text);
      
      try {
        const json = JSON.parse(text);
        setResult(JSON.stringify(json, null, 2));
      } catch {
        setResult(text);
      }
    } catch (err: any) {
      console.error('❌ Fetch Error:', err);
      setError(err?.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Simple tRPC Test', headerShown: true }} />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>tRPC Connection Test</Text>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Current Base URL:</Text>
            <Text style={styles.infoValue}>{getBaseUrl()}</Text>
            <Text style={styles.infoLabel}>tRPC Endpoint:</Text>
            <Text style={styles.infoValue}>{getBaseUrl()}/api/trpc</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={testSimpleCall}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Testing...' : 'Test tRPC Call'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton, loading && styles.buttonDisabled]}
              onPress={testFetch}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Testing...' : 'Test Health Endpoint'}
              </Text>
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>Error:</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {result ? (
            <View style={styles.resultBox}>
              <Text style={styles.resultTitle}>Result:</Text>
              <Text style={styles.resultText}>{result}</Text>
            </View>
          ) : null}

          <View style={styles.noteBox}>
            <Text style={styles.noteTitle}>Note:</Text>
            <Text style={styles.noteText}>
              This test verifies the tRPC backend connection. The backend should be running on the Rork infrastructure at the URL shown above.
            </Text>
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
    marginBottom: 20,
    color: Colors.light.text,
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
  secondaryButton: {
    backgroundColor: '#6B7280',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#7F1D1D',
  },
  resultBox: {
    backgroundColor: '#D1FAE5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 4,
  },
  resultText: {
    fontSize: 12,
    color: '#064E3B',
    fontFamily: 'monospace',
  },
  noteBox: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#78350F',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: '#451A03',
  },
});