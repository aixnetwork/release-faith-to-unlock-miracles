import React from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import SafeImage from '@/components/SafeImage';
import { FALLBACK_IMAGES } from '@/utils/imageUtils';

// Test component to verify all source.uri issues are resolved
export const ImageTestScreen = () => {
  const testCases = [
    {
      title: 'Valid HTTPS URL',
      source: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center',
      fallbackType: 'default' as keyof typeof FALLBACK_IMAGES,
    },
    {
      title: 'Invalid URL',
      source: 'invalid-url',
      fallbackType: 'song' as keyof typeof FALLBACK_IMAGES,
    },
    {
      title: 'Empty String',
      source: '',
      fallbackType: 'user' as keyof typeof FALLBACK_IMAGES,
    },
    {
      title: 'Null Source',
      source: null,
      fallbackType: 'quote' as keyof typeof FALLBACK_IMAGES,
    },
    {
      title: 'Undefined Source',
      source: undefined,
      fallbackType: 'promise' as keyof typeof FALLBACK_IMAGES,
    },
    {
      title: 'Object with URI',
      source: { uri: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=400&h=300&fit=crop&crop=center' },
      fallbackType: 'testimonial' as keyof typeof FALLBACK_IMAGES,
    },
    {
      title: 'Object with Invalid URI',
      source: { uri: 'invalid-uri' },
      fallbackType: 'service' as keyof typeof FALLBACK_IMAGES,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Image Source URI Test Cases</Text>
      <Text style={styles.subtitle}>Testing SafeImage component with various source types</Text>
      
      {testCases.map((testCase, index) => (
        <View key={index} style={styles.testCase}>
          <Text style={styles.testTitle}>{testCase.title}</Text>
          <Text style={styles.testSource}>
            Source: {typeof testCase.source === 'string' ? testCase.source : JSON.stringify(testCase.source)}
          </Text>
          <SafeImage
            source={testCase.source as any}
            fallbackType={testCase.fallbackType}
            style={styles.testImage}
            testID={`test-image-${index}`}
          />
        </View>
      ))}
      
      <View style={styles.testCase}>
        <Text style={styles.testTitle}>Error State Test</Text>
        <Text style={styles.testSource}>Source: Broken URL with error state enabled</Text>
        <SafeImage
          source="https://broken-url-that-will-fail.com/image.jpg"
          fallbackType="default"
          style={styles.testImage}
          testID="error-test-image"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  testCase: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  testSource: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  testImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
});

export default ImageTestScreen;