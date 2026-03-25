import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, Alert, Platform, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useTestimonialStore } from '@/store/testimonialStore';
import { useUserStore } from '@/store/userStore';
import * as Haptics from 'expo-haptics';
import { Send, Heart, BookOpen, Music, Sparkles, RefreshCw, FileText, Youtube } from 'lucide-react-native';
import type { AISuggestion } from '@/types';
import { YouTubePlayer, extractYouTubeVideoId } from '@/components/YouTubePlayer';
import BottomNavigation from '@/components/BottomNavigation';
import { ENV } from '@/config/env';
import { fetchWithAuth } from '@/utils/authUtils';
import { BackButton } from '@/components/BackButton';

const TESTIMONIAL_CATEGORIES = [
  { id: 'healing', name: 'Healing', description: 'Physical, emotional, or spiritual healing' },
  { id: 'provision', name: 'Provision', description: 'Financial blessings and provision' },
  { id: 'guidance', name: 'Guidance', description: 'Direction and wisdom from God' },
  { id: 'salvation', name: 'Salvation', description: 'Coming to faith in Christ' },
  { id: 'protection', name: 'Protection', description: 'Divine protection and safety' },
  { id: 'breakthrough', name: 'Breakthrough', description: 'Overcoming obstacles and challenges' }
];

export default function NewTestimonialScreen() {
  const { addTestimonial } = useTestimonialStore();
  const { isLoggedIn, name } = useUserStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [testimonialType, setTestimonialType] = useState<'text' | 'video'>('text');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeVideoId, setYoutubeVideoId] = useState('');

  const handleYouTubeUrlChange = (url: string) => {
    setYoutubeUrl(url);
    const videoId = extractYouTubeVideoId(url);
    setYoutubeVideoId(videoId);
  };

  React.useEffect(() => {
    if (!isLoggedIn) {
      Alert.alert(
        "Login Required",
        "Please log in to share your testimony.",
        [
          { text: "Cancel", style: "cancel", onPress: () => handleGoBack() },
          { text: "Login", onPress: () => {
            try {
              router.push('/login');
            } catch (error) {
              console.error('Navigation to login failed:', error);
            }
          }}
        ]
      );
    }
  }, [isLoggedIn]);

  const generateAISuggestions = async () => {
    console.log('generateAISuggestions called', { title, selectedCategory, testimonialType });
    
    if (!title.trim()) {
      Alert.alert("Info", "Please add a title first to get AI suggestions.");
      return;
    }

    if (!selectedCategory) {
      Alert.alert("Info", "Please select a category first to get AI suggestions.");
      return;
    }

    console.log('Starting AI suggestions generation:', { 
      contentLength: testimonialType === 'text' ? content.length : 0,
      testimonialType,
      selectedCategory,
      categoryName: TESTIMONIAL_CATEGORIES.find(cat => cat.id === selectedCategory)?.name
    });

    setIsLoadingSuggestions(true);
    
    try {
      const categoryName = TESTIMONIAL_CATEGORIES.find(cat => cat.id === selectedCategory)?.name || selectedCategory;
      
      console.log('Calling OpenAI API for AI suggestions');
      
      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ENV.EXPO_PUBLIC_OPENAI_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful Christian assistant that provides relevant scripture verses and worship songs based on testimonies. Provide specific verse references and song titles.'
            },
            {
              role: 'user',
              content: `Based on this testimony titled "${title.trim()}" in the category "${categoryName}"${testimonialType === 'text' && content.trim() ? `, with the story: "${content.trim()}"` : ''}, suggest:\n1. A relevant Bible verse (include reference and text)\n2. A worship song that relates to this testimony\n3. A brief explanation of why these suggestions fit\n\nFormat your response as JSON with keys: scripture, song, explanation`
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!openAIResponse.ok) {
        throw new Error(`OpenAI API error: ${openAIResponse.status}`);
      }

      const openAIData = await openAIResponse.json();
      const aiContent = openAIData.choices[0]?.message?.content;
      
      if (!aiContent) {
        throw new Error('No content received from OpenAI');
      }

      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      const parsedSuggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(aiContent);
      
      const validSuggestions: AISuggestion = {
        scripture: parsedSuggestions.scripture || "Psalm 23:1 - 'The Lord is my shepherd; I shall not want.'",
        song: parsedSuggestions.song || "Amazing Grace - Traditional",
        explanation: parsedSuggestions.explanation || "These suggestions relate to your testimony category."
      };
      
      console.log('Setting AI suggestions:', validSuggestions);
      setAiSuggestions(validSuggestions);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      Alert.alert(
        "Success!", 
        "AI suggestions generated successfully! Check the suggestions below."
      );
      
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
      
      Alert.alert(
        "AI Service Issue", 
        `The AI suggestion service is currently experiencing issues. We've provided fallback suggestions based on your category instead.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      
      const fallbackSuggestions: AISuggestion = {
        scripture: "Psalm 23:1 - 'The Lord is my shepherd; I shall not want.'",
        song: "Amazing Grace - Traditional",
        explanation: "These are default suggestions. The AI service is currently unavailable, but you can still share your testimony."
      };
      console.log('Setting fallback suggestions:', fallbackSuggestions);
      setAiSuggestions(fallbackSuggestions);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleGoBack = () => {
    try {
      // Try to go back first
      if (router.canGoBack && router.canGoBack()) {
        router.back();
      } else {
        // If can't go back, navigate to testimonials tab
        router.replace('/(tabs)/testimonials');
      }
    } catch (error) {
      console.error('Navigation error on go back:', error);
      // Fallback navigation
      try {
        router.replace('/(tabs)/testimonials');
      } catch (fallbackError) {
        console.error('Fallback navigation error:', fallbackError);
        // Last resort - go to home
        router.replace('/');
      }
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title for your testimony.");
      return;
    }

    if (testimonialType === 'text' && !content.trim()) {
      Alert.alert("Error", "Please share your testimony story.");
      return;
    }

    if (testimonialType === 'video' && !youtubeUrl.trim()) {
      Alert.alert("Error", "Please provide a YouTube URL for your video testimony.");
      return;
    }

    if (testimonialType === 'video' && !youtubeVideoId) {
      Alert.alert("Error", "Please provide a valid YouTube URL.");
      return;
    }

    if (!selectedCategory) {
      Alert.alert("Error", "Please select a category for your testimony.");
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsSubmitting(true);

    try {
      const currentUser = useUserStore.getState().user;
      
      if (!currentUser || !currentUser.id) {
        Alert.alert("Error", "You must be logged in to submit a testimony.");
        setIsSubmitting(false);
        return;
      }

      const testimonyData = {
        title: title.trim(),
        story: testimonialType === 'text' ? content.trim() : `Watch my video testimony: ${title.trim()}`,
        type: testimonialType,
        category: selectedCategory,
        youtube_url: testimonialType === 'video' ? youtubeUrl.trim() : null,
        user_id: currentUser.id,
        organization_id: currentUser.organizationId || null,
        status: 'published',
        date_created: new Date().toISOString(),
      };

      console.log('Submitting testimony to Directus:', testimonyData);

      const response = await fetchWithAuth(`${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/testimonials`, {
        method: 'POST',
        body: JSON.stringify(testimonyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to submit testimony:', errorData);
        throw new Error(errorData.errors?.[0]?.message || 'Failed to submit testimony');
      }

      const result = await response.json();
      console.log('Testimony submitted successfully:', result);

      addTestimonial({
        title: title.trim(),
        content: testimonialType === 'text' ? content.trim() : `Watch my video testimony: ${title.trim()}`,
        category: selectedCategory as 'healing' | 'provision' | 'guidance' | 'salvation' | 'breakthrough' | 'protection',
        author: name || 'Anonymous',
        suggestedScripture: aiSuggestions?.scripture,
        suggestedSong: aiSuggestions?.song,
        youtubeUrl: testimonialType === 'video' ? youtubeUrl.trim() : undefined,
        type: testimonialType,
      });

      Alert.alert(
        "Success!",
        "Your testimony has been shared. Thank you for encouraging others with your story!",
        [
          { text: "OK", onPress: () => handleGoBack() }
        ]
      );
    } catch (error) {
      console.error('Error submitting testimony:', error);
      Alert.alert(
        "Error", 
        error instanceof Error ? error.message : "Failed to share your testimony. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: "Share Your Testimony",
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: Colors.light.text,
          headerLeft: () => <BackButton />,
        }} 
      />
      
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Heart size={32} color={Colors.light.primary} />
          <Text style={styles.headerTitle}>Share Your Story</Text>
          <Text style={styles.headerSubtitle}>
            Your testimony can encourage and inspire others in their faith journey
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Give your testimony a meaningful title"
              placeholderTextColor={Colors.light.inputPlaceholder}
              maxLength={100}
            />
            <Text style={styles.characterCount}>{title.length}/100</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Testimony Type *</Text>
            <Text style={styles.inputDescription}>
              Choose how you&apos;d like to share your testimony
            </Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeOption,
                  testimonialType === 'text' && styles.typeOptionSelected
                ]}
                onPress={() => setTestimonialType('text')}
              >
                <FileText 
                  size={24} 
                  color={testimonialType === 'text' ? Colors.light.white : Colors.light.primary} 
                />
                <Text style={[
                  styles.typeOptionText,
                  testimonialType === 'text' && styles.typeOptionTextSelected
                ]}>
                  Written Story
                </Text>
                <Text style={[
                  styles.typeOptionDescription,
                  testimonialType === 'text' && styles.typeOptionDescriptionSelected
                ]}>
                  Share your testimony in text
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeOption,
                  testimonialType === 'video' && styles.typeOptionSelected
                ]}
                onPress={() => setTestimonialType('video')}
              >
                <Youtube 
                  size={24} 
                  color={testimonialType === 'video' ? Colors.light.white : Colors.light.error} 
                />
                <Text style={[
                  styles.typeOptionText,
                  testimonialType === 'video' && styles.typeOptionTextSelected
                ]}>
                  YouTube Video
                </Text>
                <Text style={[
                  styles.typeOptionDescription,
                  testimonialType === 'video' && styles.typeOptionDescriptionSelected
                ]}>
                  Share a YouTube video testimony
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category *</Text>
            <Text style={styles.inputDescription}>
              Choose the category that best describes your testimony
            </Text>
            <View style={styles.categoryGrid}>
              {TESTIMONIAL_CATEGORIES.map((category) => (
                <View key={category.id} style={styles.categoryOption}>
                  <Button
                    title={category.name}
                    onPress={() => setSelectedCategory(category.id)}
                    variant={selectedCategory === category.id ? 'primary' : 'outline'}
                    style={styles.categoryButton}
                  />
                  <Text style={styles.categoryDescription}>{category.description}</Text>
                </View>
              ))}
            </View>
          </View>

          {testimonialType === 'text' ? (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Your Story *</Text>
              <Text style={styles.inputDescription}>
                Share the details of how God worked in your life. Be specific about what happened and how it impacted you.
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={content}
                onChangeText={setContent}
                placeholder="Tell your story here... What was your situation? How did God intervene? What was the outcome?"
                placeholderTextColor={Colors.light.inputPlaceholder}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
                maxLength={2000}
              />
              <Text style={styles.characterCount}>{content.length}/2000</Text>
            </View>
          ) : (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>YouTube Video URL *</Text>
              <Text style={styles.inputDescription}>
                Paste the YouTube URL of your video testimony. Make sure your video is public or unlisted.
              </Text>
              <TextInput
                style={styles.input}
                value={youtubeUrl}
                onChangeText={handleYouTubeUrlChange}
                placeholder="https://www.youtube.com/watch?v=..."
                placeholderTextColor={Colors.light.inputPlaceholder}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
              />
              
              {youtubeVideoId && (
                <View style={styles.videoPreview}>
                  <Text style={styles.previewLabel}>Video Preview:</Text>
                  <YouTubePlayer
                    videoId={youtubeVideoId}
                    title={title || "Your Testimony Video"}
                    height={180}
                    autoplay={false}
                    showControls={true}
                  />
                </View>
              )}
              
              <View style={styles.videoTips}>
                <Text style={styles.videoTipsTitle}>Video Tips:</Text>
                <Text style={styles.videoTipsText}>
                  • Keep your video between 2-10 minutes{"\n"}• Speak clearly and from the heart{"\n"}• Share specific details about God&apos;s work{"\n"}• Ensure good lighting and audio quality{"\n"}• Make your video public or unlisted on YouTube
                </Text>
              </View>
            </View>
          )}

          {/* AI Suggestions Section */}
          <View style={styles.aiSection}>
            <View style={styles.aiHeader}>
              <Sparkles size={24} color={Colors.light.primary} />
              <Text style={styles.aiTitle}>AI Scripture & Song Suggestions</Text>
            </View>
            <Text style={styles.aiDescription}>
              Get personalized scripture verses and worship songs that relate to your testimony
            </Text>
            
            <Button
              title={isLoadingSuggestions ? "Generating..." : "Get AI Suggestions"}
              onPress={generateAISuggestions}
              loading={isLoadingSuggestions}
              disabled={!title.trim() || !selectedCategory || isLoadingSuggestions}
              icon={<RefreshCw size={18} color={Colors.light.white} />}
              variant="secondary"
              style={styles.aiButton}
              testID="ai-suggestions-button"
            />

            {aiSuggestions && (
              <View style={styles.suggestionsContainer}>
                <View style={styles.suggestionCard}>
                  <View style={styles.suggestionHeader}>
                    <BookOpen size={20} color={Colors.light.primary} />
                    <Text style={styles.suggestionTitle}>Suggested Scripture</Text>
                  </View>
                  <Text style={styles.suggestionContent}>{aiSuggestions.scripture}</Text>
                </View>

                <View style={styles.suggestionCard}>
                  <View style={styles.suggestionHeader}>
                    <Music size={20} color={Colors.light.secondary} />
                    <Text style={styles.suggestionTitle}>Suggested Song</Text>
                  </View>
                  <Text style={styles.suggestionContent}>{aiSuggestions.song}</Text>
                </View>

                <View style={styles.explanationCard}>
                  <Text style={styles.explanationTitle}>Why these suggestions?</Text>
                  <Text style={styles.explanationContent}>{aiSuggestions.explanation}</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.guidelines}>
            <Text style={styles.guidelinesTitle}>Guidelines for Sharing</Text>
            <Text style={styles.guidelinesText}>
              • Be honest and authentic in your testimony{"\n"}• Focus on how God worked in your situation{"\n"}• Keep your story encouraging and uplifting{"\n"}• Respect others&apos; privacy if mentioning them{"\n"}• Remember that your story can inspire others
            </Text>
          </View>

          <Button
            title="Share Testimony"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={
              !title.trim() || 
              !selectedCategory || 
              (testimonialType === 'text' && !content.trim()) ||
              (testimonialType === 'video' && !youtubeVideoId)
            }
            icon={<Send size={18} color={Colors.light.white} />}
            style={styles.submitButton}
            testID="save-testimony-button"
          />
        </View>
      </ScrollView>
      <BottomNavigation />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 250,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  headerTitle: {
    ...theme.typography.title,
    fontSize: 24,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    color: Colors.light.textPrimary,
  },
  headerSubtitle: {
    ...theme.typography.body,
    textAlign: 'center',
    color: Colors.light.textMedium,
    lineHeight: 22,
  },
  form: {
    gap: theme.spacing.xl,
  },
  inputGroup: {
    gap: theme.spacing.sm,
  },
  inputLabel: {
    ...theme.typography.inputLabel,
    color: Colors.light.textPrimary,
    fontWeight: '600',
  },
  inputDescription: {
    ...theme.typography.caption,
    color: Colors.light.textMedium,
    lineHeight: 18,
  },
  input: {
    backgroundColor: Colors.light.inputBackground,
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: Colors.light.inputText,
  },
  textArea: {
    minHeight: 120,
    maxHeight: 200,
  },
  characterCount: {
    ...theme.typography.caption,
    color: Colors.light.textMedium,
    textAlign: 'right',
  },
  categoryGrid: {
    gap: theme.spacing.md,
  },
  categoryOption: {
    gap: theme.spacing.xs,
  },
  categoryButton: {
    alignSelf: 'flex-start',
  },
  categoryDescription: {
    ...theme.typography.caption,
    color: Colors.light.textMedium,
    fontStyle: 'italic',
  },
  aiSection: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  aiTitle: {
    ...theme.typography.subtitle,
    marginLeft: theme.spacing.sm,
    color: Colors.light.textPrimary,
    fontWeight: '600',
  },
  aiDescription: {
    ...theme.typography.body,
    color: Colors.light.textMedium,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  aiButton: {
    marginBottom: theme.spacing.md,
  },
  suggestionsContainer: {
    gap: theme.spacing.md,
  },
  suggestionCard: {
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  suggestionTitle: {
    ...theme.typography.subtitle,
    marginLeft: theme.spacing.sm,
    fontWeight: '600',
  },
  suggestionContent: {
    ...theme.typography.body,
    color: Colors.light.textMedium,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  explanationCard: {
    backgroundColor: Colors.light.primaryLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.primary,
  },
  explanationTitle: {
    ...theme.typography.subtitle,
    color: Colors.light.primary,
    marginBottom: theme.spacing.xs,
    fontWeight: '600',
  },
  explanationContent: {
    ...theme.typography.body,
    color: Colors.light.textMedium,
    lineHeight: 20,
  },
  guidelines: {
    backgroundColor: Colors.light.primaryLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
  },
  guidelinesTitle: {
    ...theme.typography.subtitle,
    color: Colors.light.primary,
    marginBottom: theme.spacing.sm,
    fontWeight: '600',
  },
  guidelinesText: {
    ...theme.typography.body,
    color: Colors.light.textMedium,
    lineHeight: 20,
  },
  submitButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xxl,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  typeOption: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderWidth: 2,
    borderColor: Colors.light.borderLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  typeOptionSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary,
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    textAlign: 'center',
  },
  typeOptionTextSelected: {
    color: Colors.light.white,
  },
  typeOptionDescription: {
    fontSize: 12,
    color: Colors.light.textMedium,
    textAlign: 'center',
    lineHeight: 16,
  },
  typeOptionDescriptionSelected: {
    color: Colors.light.white + 'CC',
  },
  videoPreview: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  videoTips: {
    backgroundColor: Colors.light.secondaryLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.secondary,
  },
  videoTipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.secondary,
    marginBottom: theme.spacing.xs,
  },
  videoTipsText: {
    fontSize: 13,
    color: Colors.light.textMedium,
    lineHeight: 18,
  },
});