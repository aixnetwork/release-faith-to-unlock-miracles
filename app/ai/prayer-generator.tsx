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
import { Heart, Send, Copy, Share2, Brain, Target } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { llmService } from '@/lib/ai/llmService';
import { Colors } from '@/constants/Colors';
import { theme } from '@/constants/theme';
import { ShareModal } from '@/components/ShareModal';

export default function PrayerGeneratorScreen() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [prayerType, setPrayerType] = useState<'general' | 'mental-health' | 'healing' | 'guidance'>('general');
  const [prayer, setPrayer] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const generatePrayer = async () => {
    if (!topic.trim() || isGenerating) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      let prompt = `Generate a ${length} ${prayerType} prayer about: ${topic}`;
      
      if (prayerType === 'mental-health') {
        prompt += '. Focus on comfort, peace, and God\'s presence during difficult times. Include relevant scripture references.';
      } else if (prayerType === 'healing') {
        prompt += '. Focus on physical, emotional, and spiritual healing. Include hope and faith.';
      } else if (prayerType === 'guidance') {
        prompt += '. Focus on seeking God\'s wisdom and direction. Include trust and surrender.';
      }
      
      const generatedPrayer = await llmService.generateText(prompt);
      setPrayer(generatedPrayer);
    } catch (err) {
      console.error('Error generating prayer:', err);
      setError('Failed to generate prayer. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const copyToClipboard = async () => {
    if (!prayer) return;
    
    await Clipboard.setStringAsync(prayer);
    // You could add a toast notification here
  };
  
  const handleShare = () => {
    setShowShareModal(true);
  };

  const prayerTypes = [
    { id: 'general', label: 'General', icon: Heart },
    { id: 'mental-health', label: 'Mental Health', icon: Brain },
    { id: 'healing', label: 'Healing', icon: Heart },
    { id: 'guidance', label: 'Guidance', icon: Target },
  ];

  const shareContent = {
    title: `Prayer about ${topic}`,
    text: prayer,
    url: 'https://releasefaith.app/ai/prayer-generator',
    hashtags: ['prayer', 'faith', 'ai'],
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <Stack.Screen
        options={{
          title: 'Prayer Generator',
          headerRight: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Generate a Prayer</Text>
        <Text style={styles.description}>
          Enter a topic, person, or situation you would like to pray about, and our AI will help craft a meaningful prayer.
        </Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={topic}
            onChangeText={setTopic}
            placeholder="What would you like to pray about?"
            placeholderTextColor="#999"
            multiline
          />
        </View>

        <Text style={styles.sectionLabel}>Prayer Type</Text>
        <View style={styles.typeOptions}>
          {prayerTypes.map((type) => {
            const Icon = type.icon;
            return (
              <TouchableOpacity
                key={type.id}
                style={[styles.typeOption, prayerType === type.id && styles.selectedTypeOption]}
                onPress={() => setPrayerType(type.id as any)}
              >
                <Icon 
                  size={16} 
                  color={prayerType === type.id ? Colors.light.white : Colors.light.primary} 
                />
                <Text
                  style={[styles.typeText, prayerType === type.id && styles.selectedTypeText]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        
        <Text style={styles.lengthLabel}>Prayer Length</Text>
        <View style={styles.lengthOptions}>
          <TouchableOpacity
            style={[styles.lengthOption, length === 'short' && styles.selectedLengthOption]}
            onPress={() => setLength('short')}
          >
            <Text
              style={[styles.lengthText, length === 'short' && styles.selectedLengthText]}
            >
              Short
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.lengthOption, length === 'medium' && styles.selectedLengthOption]}
            onPress={() => setLength('medium')}
          >
            <Text
              style={[styles.lengthText, length === 'medium' && styles.selectedLengthText]}
            >
              Medium
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.lengthOption, length === 'long' && styles.selectedLengthOption]}
            onPress={() => setLength('long')}
          >
            <Text
              style={[styles.lengthText, length === 'long' && styles.selectedLengthText]}
            >
              Long
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={[styles.generateButton, !topic.trim() && styles.disabledButton]}
          onPress={generatePrayer}
          disabled={!topic.trim() || isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Send size={18} color="#fff" style={styles.generateIcon} />
              <Text style={styles.generateText}>Generate Prayer</Text>
            </>
          )}
        </TouchableOpacity>
        
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        
        {prayer && (
          <View style={styles.prayerContainer}>
            <View style={styles.prayerHeader}>
              <Heart size={18} color={Colors.light.primary} />
              <Text style={styles.prayerTitle}>Your Prayer</Text>
            </View>
            <Text style={styles.prayerText}>{prayer}</Text>
            <View style={styles.prayerActions}>
              <TouchableOpacity style={styles.prayerAction} onPress={copyToClipboard}>
                <Copy size={18} color="#666" />
                <Text style={styles.prayerActionText}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.prayerAction} onPress={handleShare}>
                <Share2 size={18} color="#666" />
                <Text style={styles.prayerActionText}>Share</Text>
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
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },
  title: {
    ...theme.typography.title,
    marginBottom: theme.spacing.xs,
  },
  description: {
    ...theme.typography.body,
    color: Colors.light.textMedium,
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: theme.spacing.xl,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    fontSize: 16,
    color: Colors.light.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  sectionLabel: {
    ...theme.typography.subtitle,
    fontSize: 16,
    marginBottom: theme.spacing.md,
  },
  typeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  selectedTypeOption: {
    backgroundColor: Colors.light.primary,
  },
  typeText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  selectedTypeText: {
    color: Colors.light.white,
    fontWeight: '600',
  },
  lengthLabel: {
    ...theme.typography.subtitle,
    fontSize: 16,
    marginBottom: theme.spacing.md,
  },
  lengthOptions: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  lengthOption: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
  },
  selectedLengthOption: {
    backgroundColor: `${Colors.light.primary}20`,
  },
  lengthText: {
    fontSize: 14,
    color: Colors.light.textMedium,
    fontWeight: '500',
  },
  selectedLengthText: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  generateButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  disabledButton: {
    opacity: 0.6,
  },
  generateIcon: {
    marginRight: theme.spacing.sm,
  },
  generateText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#F44336',
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  prayerContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  prayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  prayerTitle: {
    ...theme.typography.subtitle,
    fontSize: 16,
    marginLeft: theme.spacing.sm,
  },
  prayerText: {
    ...theme.typography.body,
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  prayerActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: theme.spacing.md,
    gap: theme.spacing.xl,
  },
  prayerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  prayerActionText: {
    fontSize: 14,
    color: Colors.light.textMedium,
  },
  doneButton: {
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: theme.spacing.lg,
  },
});