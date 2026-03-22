import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Heart, BookOpen, MessageSquare, Lightbulb } from 'lucide-react-native';
import AIFeatureCard from '@/components/AIFeatureCard';
import { Colors } from '@/constants/Colors';

export default function AIFeaturesScreen() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'AI Faith Tools',
        }}
      />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>AI-Powered Faith Tools</Text>
        <Text style={styles.description}>
          Use the power of AI to enhance your spiritual journey with these helpful tools.
        </Text>
        
        <AIFeatureCard
          title="Prayer Generator"
          description="Create personalized prayers for any situation or need in your life."
          icon={Heart}
          color="#e74c3c"
          onPress={() => router.push('/ai/prayer-generator')}
        />
        
        <AIFeatureCard
          title="Scripture Insights"
          description="Get deeper understanding of Bible passages with context and application."
          icon={BookOpen}
          color="#3498db"
          onPress={() => router.push('/ai/scripture-insights')}
        />
        
        <AIFeatureCard
          title="Daily Devotional"
          description="Generate thoughtful devotionals based on any Bible verse."
          icon={Lightbulb}
          color="#f39c12"
          onPress={() => router.push('/ai/devotional-generator')}
        />
        
        <AIFeatureCard
          title="Faith Assistant"
          description="Have a conversation about faith, ask questions, and get spiritual guidance."
          icon={MessageSquare}
          color={Colors.light.primary}
          onPress={() => router.push('/(tabs)/ai-assistant')}
        />
        
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>About AI-Generated Content</Text>
          <Text style={styles.disclaimerText}>
            These tools use artificial intelligence to generate content. While we have trained our AI to provide biblically sound responses, please use discernment and verify with Scripture. AI is a helpful tool, but not a replacement for personal study, prayer, or pastoral guidance.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  disclaimer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});