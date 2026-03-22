import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Play, Pause, RotateCcw, Heart, Share, ArrowLeft, Volume2, VolumeX } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';

interface MentalHealthContent {
  id: string;
  title: string;
  description: string;
  type: 'meditation' | 'breathing' | 'prayer' | 'affirmation' | 'scripture';
  duration: number;
  audioUrl?: string;
  scriptureReferences?: string[];
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  content: {
    introduction: string;
    steps: string[];
    conclusion: string;
  };
}

// Mock data for mental health content
const mockContent: Record<string, MentalHealthContent> = {
  '1': {
    id: '1',
    title: 'Peace in the Storm',
    description: 'A guided meditation focusing on finding peace during difficult times through faith',
    type: 'meditation',
    duration: 10,
    scriptureReferences: ['Philippians 4:6-7', 'Matthew 11:28-30'],
    tags: ['anxiety', 'peace', 'stress'],
    difficulty: 'beginner',
    content: {
      introduction: 'Welcome to this guided meditation. Find a comfortable position and close your eyes. We will spend the next 10 minutes finding peace through God\'s presence.',
      steps: [
        'Take three deep breaths, inhaling God\'s peace and exhaling your worries',
        'Visualize yourself in a peaceful place where you feel God\'s presence',
        'Repeat silently: "Be still and know that I am God" (Psalm 46:10)',
        'Focus on your breathing, letting each breath remind you of God\'s love',
        'If your mind wanders, gently return to the phrase "God is with me"',
        'Feel the weight of your burdens lifting as you surrender them to God',
        'Rest in the knowledge that you are loved and protected',
      ],
      conclusion: 'Take a moment to thank God for this time of peace. When you\'re ready, slowly open your eyes, carrying this peace with you.',
    },
  },
  '2': {
    id: '2',
    title: 'Breathing with Scripture',
    description: 'A breathing exercise combined with scripture meditation for anxiety relief',
    type: 'breathing',
    duration: 5,
    scriptureReferences: ['Psalm 23:4', 'Isaiah 41:10'],
    tags: ['breathing', 'anxiety', 'scripture'],
    difficulty: 'beginner',
    content: {
      introduction: 'This breathing exercise will help calm your mind and body while meditating on God\'s promises.',
      steps: [
        'Sit comfortably with your feet flat on the floor',
        'Place one hand on your chest, one on your belly',
        'Breathe in slowly for 4 counts while thinking "The Lord is my shepherd"',
        'Hold your breath for 4 counts while thinking "I shall not want"',
        'Exhale slowly for 6 counts while thinking "He restores my soul"',
        'Repeat this cycle, focusing on different verses from Psalm 23',
        'Continue for 5 minutes, letting God\'s word calm your spirit',
      ],
      conclusion: 'End with a prayer of gratitude for God\'s presence and peace in your life.',
    },
  },
};

export default function MentalHealthContentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const content = id ? mockContent[id] : null;

  useEffect(() => {
    if (content) {
      setTimeRemaining(content.duration * 60); // Convert minutes to seconds
    }
  }, [content]);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [sound]);

  if (!content) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Content not found</Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          style={styles.backButton}
        />
      </View>
    );
  }

  const startSession = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsPlaying(true);
    setCurrentStep(0);
    setIsCompleted(false);

    // Start timer
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsPlaying(false);
          setIsCompleted(true);
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-advance steps
    const stepDuration = (content.duration * 60) / content.content.steps.length;
    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < content.content.steps.length - 1) {
          return prev + 1;
        }
        clearInterval(stepTimer);
        return prev;
      });
    }, stepDuration * 1000);

    // Load and play background audio if available
    if (content.audioUrl && !isMuted) {
      try {
        const { sound: audioSound } = await Audio.Sound.createAsync(
          { uri: content.audioUrl },
          { shouldPlay: true, isLooping: true, volume: 0.3 }
        );
        setSound(audioSound);
      } catch (error) {
        console.log('Error loading audio:', error);
      }
    }
  };

  const pauseSession = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (sound) {
      sound.pauseAsync();
    }
  };

  const resumeSession = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setIsPlaying(true);
    // Restart timer with remaining time
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsPlaying(false);
          setIsCompleted(true);
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    if (sound) {
      sound.playAsync();
    }
  };

  const resetSession = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsPlaying(false);
    setCurrentStep(0);
    setTimeRemaining(content.duration * 60);
    setIsCompleted(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (sound) {
      sound.stopAsync();
      sound.unloadAsync();
      setSound(null);
    }
  };

  const toggleMute = async () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }

    setIsMuted(!isMuted);
    if (sound) {
      await sound.setVolumeAsync(isMuted ? 0.3 : 0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return Colors.light.success;
      case 'intermediate': return Colors.light.warning;
      case 'advanced': return Colors.light.error;
      default: return Colors.light.textLight;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meditation': return '🧘';
      case 'breathing': return '🫁';
      case 'prayer': return '🙏';
      case 'affirmation': return '💭';
      case 'scripture': return '📖';
      default: return '✨';
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: content.title,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.light.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[Colors.light.secondary, Colors.light.primary]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <Text style={styles.typeEmoji}>{getTypeIcon(content.type)}</Text>
            <Text style={styles.title}>{content.title}</Text>
            <Text style={styles.description}>{content.description}</Text>
            
            <View style={styles.metaContainer}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Duration</Text>
                <Text style={styles.metaValue}>{content.duration} min</Text>
              </View>
              
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Difficulty</Text>
                <Text style={[styles.metaValue, { color: getDifficultyColor(content.difficulty) }]}>
                  {content.difficulty}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Timer and Controls */}
        <View style={styles.timerSection}>
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
            <Text style={styles.timerLabel}>
              {isCompleted ? 'Completed!' : isPlaying ? 'Remaining' : 'Duration'}
            </Text>
          </View>

          <View style={styles.controls}>
            {!isPlaying && !isCompleted ? (
              <TouchableOpacity style={styles.playButton} onPress={startSession}>
                <Play size={32} color={Colors.light.white} />
              </TouchableOpacity>
            ) : isPlaying ? (
              <TouchableOpacity style={styles.playButton} onPress={pauseSession}>
                <Pause size={32} color={Colors.light.white} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.playButton} onPress={resumeSession}>
                <Play size={32} color={Colors.light.white} />
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.controlButton} onPress={resetSession}>
              <RotateCcw size={24} color={Colors.light.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={toggleMute}>
              {isMuted ? (
                <VolumeX size={24} color={Colors.light.textPrimary} />
              ) : (
                <Volume2 size={24} color={Colors.light.textPrimary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress */}
        {isPlaying && (
          <View style={styles.progressSection}>
            <Text style={styles.progressTitle}>Current Step</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${((currentStep + 1) / content.content.steps.length) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {currentStep + 1} of {content.content.steps.length}
              </Text>
            </View>
            
            <View style={styles.currentStepContainer}>
              <Text style={styles.currentStepText}>
                {content.content.steps[currentStep]}
              </Text>
            </View>
          </View>
        )}

        {/* Content */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>Introduction</Text>
          <Text style={styles.contentText}>{content.content.introduction}</Text>

          <Text style={styles.sectionTitle}>Steps</Text>
          {content.content.steps.map((step, index) => (
            <View 
              key={index} 
              style={[
                styles.stepContainer,
                currentStep === index && isPlaying && styles.activeStep
              ]}
            >
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}

          <Text style={styles.sectionTitle}>Conclusion</Text>
          <Text style={styles.contentText}>{content.content.conclusion}</Text>
        </View>

        {/* Scripture References */}
        {content.scriptureReferences && content.scriptureReferences.length > 0 && (
          <View style={styles.scriptureSection}>
            <Text style={styles.sectionTitle}>Scripture References</Text>
            {content.scriptureReferences.map((reference, index) => (
              <View key={index} style={styles.scriptureItem}>
                <Text style={styles.scriptureText}>{reference}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Tags */}
        <View style={styles.tagsSection}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tagsContainer}>
            {content.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Completion Message */}
        {isCompleted && (
          <View style={styles.completionSection}>
            <LinearGradient
              colors={[Colors.light.success, Colors.light.primary]}
              style={styles.completionCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Heart size={32} color="#ffffff" style={styles.completionIcon} />
              <Text style={styles.completionTitle}>Session Complete!</Text>
              <Text style={styles.completionText}>
                You have successfully completed this {content.type} session. 
                Take a moment to reflect on your experience.
              </Text>
              
              <View style={styles.completionActions}>
                <Button
                  title="Start Again"
                  onPress={resetSession}
                  variant="outline"
                  style={styles.completionButton}
                />
                <Button
                  title="Share Experience"
                  onPress={() => Alert.alert('Share', 'Sharing feature coming soon!')}
                  variant="outline"
                  style={styles.completionButton}
                />
              </View>
            </LinearGradient>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    ...theme.typography.subtitle,
    color: Colors.light.error,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    width: 120,
  },
  header: {
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
  },
  headerContent: {
    alignItems: 'center',
  },
  typeEmoji: {
    fontSize: 48,
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 22,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: theme.spacing.xl,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'capitalize',
  },
  timerSection: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '900',
    color: Colors.light.primary,
  },
  timerLabel: {
    fontSize: 14,
    color: Colors.light.textLight,
    marginTop: theme.spacing.xs,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  playButton: {
    backgroundColor: Colors.light.primary,
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  controlButton: {
    backgroundColor: Colors.light.card,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.small,
  },
  progressSection: {
    padding: theme.spacing.lg,
    backgroundColor: Colors.light.card,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.small,
  },
  progressTitle: {
    ...theme.typography.subtitle,
    marginBottom: theme.spacing.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.light.border,
    borderRadius: 4,
    marginRight: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 4,
  },
  progressText: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
    minWidth: 60,
  },
  currentStepContainer: {
    backgroundColor: Colors.light.primary + '15',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.primary,
  },
  currentStepText: {
    ...theme.typography.body,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  contentSection: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.subtitle,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  contentText: {
    ...theme.typography.body,
    color: Colors.light.textMedium,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: Colors.light.card,
  },
  activeStep: {
    backgroundColor: Colors.light.primary + '15',
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.primary,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.white,
  },
  stepText: {
    ...theme.typography.body,
    flex: 1,
    lineHeight: 20,
  },
  scriptureSection: {
    padding: theme.spacing.lg,
    backgroundColor: Colors.light.success + '10',
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  scriptureItem: {
    backgroundColor: Colors.light.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  scriptureText: {
    ...theme.typography.body,
    color: Colors.light.success,
    fontWeight: '500',
  },
  tagsSection: {
    padding: theme.spacing.lg,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  tag: {
    backgroundColor: Colors.light.primary + '15',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  tagText: {
    ...theme.typography.caption,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  completionSection: {
    padding: theme.spacing.lg,
  },
  completionCard: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.large,
  },
  completionIcon: {
    marginBottom: theme.spacing.md,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: theme.spacing.sm,
  },
  completionText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 22,
  },
  completionActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  completionButton: {
    flex: 1,
  },
});