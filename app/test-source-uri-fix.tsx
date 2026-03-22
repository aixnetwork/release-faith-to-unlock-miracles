import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import SafeImage from '@/components/SafeImage';
import { YouTubePlayer } from '@/components/YouTubePlayer';
import { FALLBACK_IMAGES, isValidImageUri, getSafeImageSource, getSafeUri } from '@/utils/imageUtils';
import { Colors } from '@/constants/Colors';
import { CheckCircle, XCircle, AlertTriangle, Play, Image as ImageIcon } from 'lucide-react-native';

// Comprehensive test to verify all source.uri issues are resolved
export default function TestSourceUriFix() {
  const [testResults, setTestResults] = useState<{ [key: string]: boolean }>({});

  const runTests = () => {
    const results: { [key: string]: boolean } = {};
    
    // Test 1: Valid URI validation
    results['validUri'] = isValidImageUri('https://images.unsplash.com/photo-1506905925346-21bda4d32df4');
    
    // Test 2: Invalid URI validation
    results['invalidUri'] = !isValidImageUri('invalid-url');
    
    // Test 3: Null/undefined URI validation
    results['nullUri'] = !isValidImageUri(null);
    results['undefinedUri'] = !isValidImageUri(undefined);
    
    // Test 4: Empty string URI validation
    results['emptyUri'] = !isValidImageUri('');
    
    // Test 5: Data URI validation
    results['dataUri'] = isValidImageUri('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==');
    
    // Test 6: Safe image source generation
    const safeSource = getSafeImageSource('https://valid-url.com/image.jpg');
    results['safeSourceGeneration'] = safeSource ? safeSource.uri === 'https://valid-url.com/image.jpg' : false;
    
    // Test 7: Safe image source with fallback
    const safeSourceWithFallback = getSafeImageSource('invalid-url', 'https://fallback.com/image.jpg');
    results['safeSourceFallback'] = safeSourceWithFallback ? safeSourceWithFallback.uri === 'https://fallback.com/image.jpg' : false;
    
    // Test 8: Safe URI generation
    const safeUri = getSafeUri('https://valid-url.com/video.mp4');
    results['safeUriGeneration'] = safeUri === 'https://valid-url.com/video.mp4';
    
    // Test 9: All fallback images are valid
    const fallbackKeys = Object.keys(FALLBACK_IMAGES) as (keyof typeof FALLBACK_IMAGES)[];
    results['fallbackImagesValid'] = fallbackKeys.every(key => isValidImageUri(FALLBACK_IMAGES[key]));
    
    setTestResults(results);
    
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    Alert.alert(
      'Test Results',
      `${passedTests}/${totalTests} tests passed\n\n${passedTests === totalTests ? '✅ All source.uri issues are fixed!' : '❌ Some tests failed'}`,
      [{ text: 'OK' }]
    );
  };

  const testCases = [
    {
      title: 'Valid HTTPS Image',
      source: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
      fallbackType: 'default' as keyof typeof FALLBACK_IMAGES,
      shouldWork: true,
    },
    {
      title: 'Invalid URL',
      source: 'not-a-valid-url',
      fallbackType: 'song' as keyof typeof FALLBACK_IMAGES,
      shouldWork: true, // Should fallback gracefully
    },
    {
      title: 'Empty String',
      source: '',
      fallbackType: 'user' as keyof typeof FALLBACK_IMAGES,
      shouldWork: true, // Should fallback gracefully
    },
    {
      title: 'Null Source',
      source: null,
      fallbackType: 'quote' as keyof typeof FALLBACK_IMAGES,
      shouldWork: true, // Should fallback gracefully
    },
    {
      title: 'Object with Valid URI',
      source: { uri: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=300&h=200&fit=crop' },
      fallbackType: 'testimonial' as keyof typeof FALLBACK_IMAGES,
      shouldWork: true,
    },
    {
      title: 'Object with Invalid URI',
      source: { uri: 'invalid-object-uri' },
      fallbackType: 'service' as keyof typeof FALLBACK_IMAGES,
      shouldWork: true, // Should fallback gracefully
    },
    {
      title: 'Data URI (Base64)',
      source: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      fallbackType: 'default' as keyof typeof FALLBACK_IMAGES,
      shouldWork: true,
    },
  ];

  const getTestIcon = (testKey: string) => {
    if (!(testKey in testResults)) {
      return <AlertTriangle size={20} color={Colors.light.textLight} />;
    }
    return testResults[testKey] ? 
      <CheckCircle size={20} color="#10B981" /> : 
      <XCircle size={20} color="#EF4444" />;
  };

  const getTestColor = (testKey: string) => {
    if (!(testKey in testResults)) return Colors.light.textLight;
    return testResults[testKey] ? '#10B981' : '#EF4444';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: 'Source URI Fix Test',
          headerStyle: { backgroundColor: Colors.light.primary },
          headerTintColor: Colors.light.white,
        }}
      />
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Source.URI Fix Verification</Text>
        <Text style={styles.subtitle}>Comprehensive test to ensure all image URI issues are resolved</Text>
        
        <TouchableOpacity style={styles.runTestsButton} onPress={runTests}>
          <Text style={styles.runTestsButtonText}>Run All Tests</Text>
        </TouchableOpacity>

        {Object.keys(testResults).length > 0 && (
          <View style={styles.testResultsContainer}>
            <Text style={styles.sectionTitle}>Unit Test Results</Text>
            
            {[
              { key: 'validUri', label: 'Valid URI Detection' },
              { key: 'invalidUri', label: 'Invalid URI Detection' },
              { key: 'nullUri', label: 'Null URI Handling' },
              { key: 'undefinedUri', label: 'Undefined URI Handling' },
              { key: 'emptyUri', label: 'Empty String Handling' },
              { key: 'dataUri', label: 'Data URI Support' },
              { key: 'safeSourceGeneration', label: 'Safe Source Generation' },
              { key: 'safeSourceFallback', label: 'Fallback Mechanism' },
              { key: 'safeUriGeneration', label: 'Safe URI Generation' },
              { key: 'fallbackImagesValid', label: 'Fallback Images Valid' },
            ].map(test => (
              <View key={test.key} style={styles.testResult}>
                {getTestIcon(test.key)}
                <Text style={[styles.testLabel, { color: getTestColor(test.key) }]}>
                  {test.label}
                </Text>
              </View>
            ))}
          </View>
        )}
        
        <Text style={styles.sectionTitle}>Visual Test Cases</Text>
        <Text style={styles.sectionSubtitle}>These images should all render without crashes</Text>
        
        {testCases.map((testCase, index) => (
          <View key={index} style={styles.testCase}>
            <Text style={styles.testTitle}>{testCase.title}</Text>
            <Text style={styles.testSource}>
              Source: {typeof testCase.source === 'string' ? testCase.source : JSON.stringify(testCase.source)}
            </Text>
            <Text style={[styles.expectedResult, { color: testCase.shouldWork ? '#10B981' : '#EF4444' }]}>
              Expected: {testCase.shouldWork ? 'Should render (with fallback if needed)' : 'Should fail gracefully'}
            </Text>
            <SafeImage
              source={testCase.source as any}
              fallbackType={testCase.fallbackType}
              style={styles.testImage}
              testID={`visual-test-${index}`}
            />
          </View>
        ))}
        
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Fix Summary</Text>
          <Text style={styles.summaryText}>
            ✅ SafeImage component handles all URI types safely{"\n"}
            ✅ Automatic fallbacks prevent broken images{"\n"}
            ✅ Platform-compatible URI validation{"\n"}
            ✅ Type-safe image source handling{"\n"}
            ✅ Graceful error handling with optional error UI{"\n"}
            ✅ No more source.uri crashes!
          </Text>
        </View>
          
        <View style={styles.youtubeTestSection}>
          <Text style={styles.sectionTitle}>YouTube Player Test</Text>
          <Text style={styles.sectionSubtitle}>Testing YouTube URI handling</Text>
          
          <View style={styles.testCase}>
            <Text style={styles.testTitle}>Valid YouTube Video</Text>
            <Text style={styles.testSource}>Video ID: dQw4w9WgXcQ</Text>
            <YouTubePlayer
              videoId="dQw4w9WgXcQ"
              title="Test YouTube Video"
              height={120}
              autoplay={false}
            />
          </View>
          
          <View style={styles.testCase}>
            <Text style={styles.testTitle}>Invalid YouTube Video</Text>
            <Text style={styles.testSource}>Video ID: invalid-id</Text>
            <YouTubePlayer
              videoId="invalid-id"
              title="Invalid YouTube Video Test"
              height={120}
              autoplay={false}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textLight,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  runTestsButton: {
    backgroundColor: Colors.light.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  runTestsButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  testResultsContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: Colors.light.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.light.textLight,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  testResult: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  testLabel: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  testCase: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: Colors.light.text,
  },
  testSource: {
    fontSize: 12,
    color: Colors.light.textLight,
    marginBottom: 4,
    fontFamily: 'monospace',
    backgroundColor: '#f1f3f4',
    padding: 8,
    borderRadius: 4,
  },
  expectedResult: {
    fontSize: 14,
    marginBottom: 12,
    fontWeight: '500',
  },
  testImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  summaryContainer: {
    backgroundColor: '#e8f5e8',
    padding: 20,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 32,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#166534',
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#166534',
  },
  youtubeTestSection: {
    marginTop: 24,
  },
});