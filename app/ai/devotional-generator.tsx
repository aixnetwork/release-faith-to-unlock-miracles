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

export default function DevotionalGeneratorScreen() {
  const router = useRouter();
  const [verse, setVerse] = useState('');
  const [devotional, setDevotional] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const generateDevotional = async () => {
    if (!verse.trim() || isGenerating) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const generatedDevotional = await llmService.generateDevotional(verse);
      setDevotional(generatedDevotional);
    } catch (err) {
      console.error('Error generating devotional:', err);
      setError('Failed to generate devotional. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const copyToClipboard = async () => {
    if (!devotional) return;
    
    await Clipboard.setStringAsync(devotional);
    // You could add a toast notification here
  };
  
  const handleShare = () => {
    setShowShareModal(true);
  };

  const shareContent = {
    title: `Daily Devotional: ${verse}`,
    text: `Daily Devotional based on ${verse}:\n\n${devotional}`,
    url: 'https://releasefaith.app/ai/devotional-generator',
    hashtags: ['devotional', 'faith', 'bible'],
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <Stack.Screen
        options={{
          title: 'Devotional Generator',
          headerRight: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Daily Devotional</Text>
        <Text style={styles.description}>
          Enter a Bible verse to generate a thoughtful daily devotional with reflection and application.
        </Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={verse}
            onChangeText={setVerse}
            placeholder="Enter a Bible verse (e.g., John 3:16 or Psalm 23:1)"
            placeholderTextColor="#999"
            multiline
          />
        </View>
        
        <TouchableOpacity
          style={[styles.generateButton, !verse.trim() && styles.disabledButton]}
          onPress={generateDevotional}
          disabled={!verse.trim() || isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Send size={18} color="#fff" style={styles.generateIcon} />
              <Text style={styles.generateText}>Generate Devotional</Text>
            </>
          )}
        </TouchableOpacity>
        
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        
        {devotional && (
          <View style={styles.devotionalContainer}>
            <View style={styles.devotionalHeader}>
              <BookOpen size={18} color={Colors.light.primary} />
              <Text style={styles.devotionalTitle}>Daily Devotional</Text>
            </View>
            <Text style={styles.verseText}>{verse}</Text>
            <Text style={styles.devotionalText}>{devotional}</Text>
            <View style={styles.devotionalActions}>
              <TouchableOpacity style={styles.devotionalAction} onPress={copyToClipboard}>
                <Copy size={18} color="#666" />
                <Text style={styles.devotionalActionText}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.devotionalAction} onPress={handleShare}>
                <Share2 size={18} color="#666" />
                <Text style={styles.devotionalActionText}>Share</Text>
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
  devotionalContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  devotionalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  devotionalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  verseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontStyle: 'italic',
    marginBottom: 16,
    lineHeight: 24,
  },
  devotionalText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 16,
  },
  devotionalActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  devotionalAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  devotionalActionText: {
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