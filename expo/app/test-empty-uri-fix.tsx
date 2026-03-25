import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Stack } from 'expo-router';
import SafeImage from '@/components/SafeImage';
import { CheckCircle, XCircle } from 'lucide-react-native';

export default function TestEmptyUriFix() {
  const testCases = [
    {
      id: 'empty-string',
      name: 'Empty String',
      source: '',
      shouldWork: true,
    },
    {
      id: 'whitespace',
      name: 'Whitespace Only',
      source: '   ',
      shouldWork: true,
    },
    {
      id: 'null',
      name: 'Null Value',
      source: null,
      shouldWork: true,
    },
    {
      id: 'undefined',
      name: 'Undefined Value',
      source: undefined,
      shouldWork: true,
    },
    {
      id: 'empty-object',
      name: 'Empty URI Object',
      source: { uri: '' },
      shouldWork: true,
    },
    {
      id: 'whitespace-object',
      name: 'Whitespace URI Object',
      source: { uri: '   ' },
      shouldWork: true,
    },
    {
      id: 'valid-url',
      name: 'Valid URL',
      source: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200',
      shouldWork: true,
    },
    {
      id: 'valid-object',
      name: 'Valid URI Object',
      source: { uri: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=200&h=200' },
      shouldWork: true,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Empty URI Fix Test',
          headerStyle: { backgroundColor: '#1F2937' },
          headerTintColor: '#FFFFFF',
        }} 
      />
      
      <View style={styles.header}>
        <Text style={styles.title}>Empty URI Fix Verification</Text>
        <Text style={styles.subtitle}>
          Testing that no empty strings are passed to Image source.uri
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What This Tests:</Text>
          <Text style={styles.infoText}>
            • Empty strings are replaced with fallback images{'\n'}
            • Whitespace-only strings are handled{'\n'}
            • Null and undefined values are handled{'\n'}
            • Empty URI objects are handled{'\n'}
            • Valid URLs still work correctly
          </Text>
        </View>

        {testCases.map((testCase) => (
          <View key={testCase.id} style={styles.testCard}>
            <View style={styles.testHeader}>
              <View style={styles.testInfo}>
                {testCase.shouldWork ? (
                  <CheckCircle size={20} color="#10B981" />
                ) : (
                  <XCircle size={20} color="#EF4444" />
                )}
                <Text style={styles.testName}>{testCase.name}</Text>
              </View>
            </View>

            <View style={styles.testContent}>
              <View style={styles.sourceInfo}>
                <Text style={styles.sourceLabel}>Source:</Text>
                <Text style={styles.sourceValue}>
                  {testCase.source === null 
                    ? 'null' 
                    : testCase.source === undefined 
                    ? 'undefined' 
                    : typeof testCase.source === 'object'
                    ? JSON.stringify(testCase.source)
                    : `'${testCase.source}'`
                  }
                </Text>
              </View>

              <View style={styles.imageContainer}>
                <SafeImage
                  source={testCase.source as any}
                  style={styles.testImage}
                  fallbackType="default"
                  resizeMode="cover"
                />
              </View>

              <View style={styles.resultInfo}>
                <Text style={styles.resultLabel}>Expected Result:</Text>
                <Text style={styles.resultText}>
                  {testCase.shouldWork 
                    ? 'Should display fallback image without errors' 
                    : 'Should handle gracefully'
                  }
                </Text>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <Text style={styles.summaryText}>
            All test cases should display images without any &quot;source.uri should not be an empty string&quot; errors.
            {'\n\n'}
            The SafeImage component automatically:
            {'\n'}• Validates all URI inputs
            {'\n'}• Replaces empty/invalid URIs with fallbacks
            {'\n'}• Handles errors gracefully
            {'\n'}• Prevents crashes from bad image sources
          </Text>
        </View>

        <View style={styles.usageCard}>
          <Text style={styles.usageTitle}>How to Use SafeImage:</Text>
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>
              {`import SafeImage from '@/components/SafeImage';

// Basic usage
<SafeImage 
  source={imageUri} 
  style={styles.image}
/>

// With fallback type
<SafeImage 
  source={user.avatar}
  fallbackType="user"
  style={styles.avatar}
/>

// With custom fallback
<SafeImage 
  source={song.coverUrl}
  fallbackUri="https://..."
  style={styles.cover}
/>`}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#EBF4FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 22,
  },
  testCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testHeader: {
    marginBottom: 12,
  },
  testInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  testName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#111827',
  },
  testContent: {
    gap: 12,
  },
  sourceInfo: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  sourceLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#6B7280',
    marginBottom: 4,
  },
  sourceValue: {
    fontSize: 14,
    color: '#111827',
    fontFamily: 'monospace',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
  },
  testImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  resultInfo: {
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#15803D',
    marginBottom: 4,
  },
  resultText: {
    fontSize: 14,
    color: '#15803D',
  },
  summaryCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#15803D',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#15803D',
    lineHeight: 22,
  },
  usageCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  usageTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  codeBlock: {
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 12,
  },
  codeText: {
    fontSize: 12,
    color: '#10B981',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
});
