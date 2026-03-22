import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { BookOpen, Send, Copy, Share2 } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { llmService } from '@/lib/ai/llmService';
import { Colors } from '@/constants/Colors';
import { ShareModal } from '@/components/ShareModal';

export default function ScriptureInsightsScreen() {
  const router = useRouter();
  const [passage, setPassage] = useState('');
  const [insights, setInsights] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const generateInsights = async () => {
    if (!passage.trim() || isGenerating) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const generatedInsights = await llmService.generateScriptureInsight(passage);
      setInsights(generatedInsights);
    } catch (err) {
      console.error('Error generating insights:', err);
      setError('Failed to generate insights. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const copyToClipboard = async () => {
    if (!insights) return;
    
    await Clipboard.setStringAsync(insights);
    // You could add a toast notification here
  };
  
  const handleShare = () => {
    setShowShareModal(true);
  };

  const shareContent = {
    title: `Scripture Insights: ${passage}`,
    text: `Scripture Insights for ${passage}:

${insights}`,
    url: 'https://releasefaith.app/ai/scripture-insights',
    hashtags: ['scripture', 'bible', 'insights'],
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <Stack.Screen
        options={{
          title: 'Scripture Insights',
          headerRight: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Scripture Insights</Text>
        <Text style={styles.description}>
          Enter a Bible verse or passage to receive deeper understanding, historical context, and practical application.
        </Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={passage}
            onChangeText={setPassage}
            placeholder="Enter a Bible verse or passage (e.g., John 3:16 or Matthew 5:1-12)"
            placeholderTextColor="#999"
            multiline
          />
        </View>
        
        <TouchableOpacity
          style={[styles.generateButton, !passage.trim() && styles.disabledButton]}
          onPress={generateInsights}
          disabled={!passage.trim() || isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Send size={18} color="#fff" style={styles.generateIcon} />
              <Text style={styles.generateText}>Generate Insights</Text>
            </View>
          )}
        </TouchableOpacity>
        
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        
        {insights && (
          <View style={styles.insightsContainer}>
            <View style={styles.insightsHeader}>
              <BookOpen size={18} color={Colors.light.primary} />
              <Text style={styles.insightsTitle}>Scripture Insights</Text>
            </View>
            <Text style={styles.passageText}>{passage}</Text>
            <Text style={styles.insightsText}>{insights}</Text>
            <View style={styles.insightsActions}>
              <TouchableOpacity style={styles.insightsAction} onPress={copyToClipboard}>
                <Copy size={18} color="#666" />
                <Text style={styles.insightsActionText}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.insightsAction} onPress={handleShare}>
                <Share2 size={18} color="#666" />
                <Text style={styles.insightsActionText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      <ShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={shareContent.title}
        text={shareContent.text}
        url={shareContent.url}
        hashtags={shareContent.hashtags}
      />
    </KeyboardAvoidingView>
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
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  generateButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  disabledButton: {
    opacity: 0.6,
  },
  generateIcon: {
    marginRight: 8,
  },
  generateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
  },
  insightsContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  passageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontStyle: 'italic',
    marginBottom: 16,
    lineHeight: 24,
  },
  insightsText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 16,
  },
  insightsActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  insightsAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  insightsActionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  doneButton: {
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 16,
  },
});