import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import { router, useNavigation } from 'expo-router';
import { 
  BookOpen, 
  Calendar, 
  Heart, 
  Share2,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  CheckCircle,
  Clock,
  Sunrise,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { theme } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';
import BottomNavigation from '@/components/BottomNavigation';
import * as Haptics from 'expo-haptics';

interface Devotional {
  id: string;
  date: string;
  title: string;
  verse: string;
  verseReference: string;
  content: string;
  reflection: string;
  prayer: string;
  isCompleted: boolean;
  readingTime: number;
}

const SAMPLE_DEVOTIONALS: Devotional[] = [
  {
    id: '1',
    date: new Date().toISOString(),
    title: 'Walking in Faith',
    verse: 'Now faith is confidence in what we hope for and assurance about what we do not see.',
    verseReference: 'Hebrews 11:1',
    content: 'Faith is not just a feeling or a wish; it is a firm conviction that stands even when circumstances seem impossible. Today, we explore what it means to walk by faith and not by sight.\n\nIn our daily lives, we often face situations that challenge our trust in God. We may not see the path ahead, but faith calls us to take the next step, trusting that God will guide us. This kind of faith is built through relationship with God, through prayer, and through meditating on His Word.\n\nConsider Abraham, who was called to leave everything familiar and go to a land he did not know. His faith was not in his own understanding but in the faithfulness of God. Similarly, we are called to trust God even when the way forward is unclear.',
    reflection: 'What area of your life requires you to step out in faith today? Where do you need to trust God more deeply?',
    prayer: 'Heavenly Father, increase my faith. Help me to trust You completely, even when I cannot see the way forward. Strengthen my confidence in Your promises and Your faithfulness. In Jesus\' name, Amen.',
    isCompleted: false,
    readingTime: 5,
  },
  {
    id: '2',
    date: new Date(Date.now() - 86400000).toISOString(),
    title: 'The Power of Prayer',
    verse: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.',
    verseReference: 'Philippians 4:6',
    content: 'Prayer is our direct line of communication with God. It is not just a religious duty but an intimate conversation with our Creator. Today, we reflect on the transforming power of prayer in our lives.\n\nWhen we pray, we acknowledge our dependence on God. We bring our concerns, our joys, our fears, and our hopes before Him. Prayer changes us—it aligns our hearts with God\'s will and opens our eyes to His perspective.\n\nThe apostle Paul encourages us to pray about everything. No concern is too small or too big for God. As we develop a consistent prayer life, we grow in our relationship with Him and experience His peace that surpasses all understanding.',
    reflection: 'How consistent is your prayer life? What would it look like to bring everything to God in prayer today?',
    prayer: 'Lord, teach me to pray. Help me to bring everything to You—my worries, my dreams, my daily concerns. Thank You that You hear me and care about every detail of my life. Amen.',
    isCompleted: true,
    readingTime: 5,
  },
  {
    id: '3',
    date: new Date(Date.now() - 172800000).toISOString(),
    title: 'Living in Grace',
    verse: 'For by grace you have been saved through faith. And this is not your own doing; it is the gift of God.',
    verseReference: 'Ephesians 2:8',
    content: 'Grace is God\'s unmerited favor toward us. It is not something we can earn or deserve—it is freely given out of God\'s great love. Today, we meditate on the beauty of God\'s grace in our lives.\n\nMany people try to earn God\'s approval through good works or religious activities. But the gospel message is clear: salvation is a gift, not a wage. We are saved by grace through faith, and this gift transforms how we live.\n\nWhen we truly understand grace, it changes everything. We no longer live in fear of condemnation or striving to be good enough. Instead, we live in grateful response to God\'s love, empowered by His Spirit to reflect His character.',
    reflection: 'In what ways are you trying to earn God\'s approval? How can you live more fully in the freedom of His grace today?',
    prayer: 'Father, thank You for Your amazing grace. Help me to rest in Your love rather than striving to earn it. May my life be a reflection of Your grace to others. In Jesus\' name, Amen.',
    isCompleted: true,
    readingTime: 5,
  },
];

export default function DevotionalScreen() {
  const navigation = useNavigation();
  const { isLoggedIn } = useUserStore();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [devotionals, setDevotionals] = useState<Devotional[]>(SAMPLE_DEVOTIONALS);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/login');
      return;
    }

    navigation.setOptions({
      headerShown: true,
      title: 'Daily Devotional',
      headerStyle: { backgroundColor: Colors.light.background },
      headerTintColor: Colors.light.text,
    });
  }, [navigation, isLoggedIn]);

  const currentDevotional = devotionals[currentIndex];
  const hasNext = currentIndex < devotionals.length - 1;
  const hasPrevious = currentIndex > 0;

  const animateTransition = useCallback((direction: 'next' | 'prev') => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: direction === 'next' ? -30 : 30,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (direction === 'next') {
        setCurrentIndex(prev => prev + 1);
      } else {
        setCurrentIndex(prev => prev - 1);
      }
      slideAnim.setValue(direction === 'next' ? 30 : -30);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [fadeAnim, slideAnim]);

  const handlePrevious = () => {
    if (hasPrevious) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      animateTransition('prev');
    }
  };

  const handleNext = () => {
    if (hasNext) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      animateTransition('next');
    }
  };

  const handleComplete = async () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setIsLoading(true);
    try {
      const updatedDevotionals = [...devotionals];
      updatedDevotionals[currentIndex] = {
        ...updatedDevotionals[currentIndex],
        isCompleted: !updatedDevotionals[currentIndex].isCompleted,
      };
      setDevotionals(updatedDevotionals);
      
      if (!currentDevotional.isCompleted) {
        Alert.alert('Great job!', 'You\'ve completed today\'s devotional. Keep building your spiritual practice!');
      }
    } catch (error) {
      console.error('Error marking devotional as complete:', error);
      Alert.alert('Error', 'Failed to update devotional status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    Alert.alert(
      isBookmarked ? 'Bookmark removed' : 'Bookmark saved',
      isBookmarked 
        ? 'This devotional has been removed from your bookmarks' 
        : 'This devotional has been saved to your bookmarks'
    );
  };

  const handleShare = () => {
    Alert.alert('Share Devotional', 'Sharing feature coming soon!');
  };

  const getTimeOfDayIcon = () => {
    const hour = new Date().getHours();
    if (hour < 12) return <Sunrise size={20} color="#F59E0B" />;
    if (hour < 18) return <Sun size={20} color="#F59E0B" />;
    return <Moon size={20} color="#8B5CF6" />;
  };

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning Devotional';
    if (hour < 18) return 'Afternoon Reflection';
    return 'Evening Meditation';
  };

  if (!currentDevotional) {
    return (
      <>
        <View style={styles.container}>
          <View style={styles.emptyState}>
            <BookOpen size={64} color={Colors.light.textMedium} />
            <Text style={styles.emptyTitle}>No Devotionals Available</Text>
            <Text style={styles.emptyDescription}>
              Check back soon for daily devotional content
            </Text>
          </View>
        </View>
        <BottomNavigation />
      </>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={['#8B5CF6', '#6D28D9', '#5B21B6']}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.headerContent}>
              <View style={styles.timeOfDayBadge}>
                {getTimeOfDayIcon()}
                <Text style={styles.timeOfDayText}>{getTimeOfDayGreeting()}</Text>
              </View>
              
              <Text style={styles.devotionalTitle}>{currentDevotional.title}</Text>
              
              <View style={styles.metaInfo}>
                <View style={styles.metaItem}>
                  <Calendar size={16} color="rgba(255, 255, 255, 0.9)" />
                  <Text style={styles.metaText}>
                    {new Date(currentDevotional.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Clock size={16} color="rgba(255, 255, 255, 0.9)" />
                  <Text style={styles.metaText}>{currentDevotional.readingTime} min read</Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.actionBar}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleComplete}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={Colors.light.primary} />
              ) : (
                <>
                  <CheckCircle 
                    size={20} 
                    color={currentDevotional.isCompleted ? Colors.light.success : Colors.light.textMedium} 
                    fill={currentDevotional.isCompleted ? Colors.light.success : 'transparent'}
                  />
                  <Text style={[
                    styles.actionButtonText,
                    currentDevotional.isCompleted && styles.actionButtonTextActive
                  ]}>
                    {currentDevotional.isCompleted ? 'Completed' : 'Mark Complete'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={handleBookmark}>
              <Bookmark 
                size={20} 
                color={isBookmarked ? Colors.light.warning : Colors.light.textMedium}
                fill={isBookmarked ? Colors.light.warning : 'transparent'}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
              <Share2 size={20} color={Colors.light.textMedium} />
            </TouchableOpacity>
          </View>

          <Animated.View 
            style={[
              styles.content, 
              { 
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }]
              }
            ]}
          >
            <View style={styles.verseSection}>
              <View style={styles.verseSectionHeader}>
                <Sparkles size={20} color={Colors.light.primary} />
                <Text style={styles.sectionTitle}>Today&apos;s Verse</Text>
              </View>
              <Text style={styles.verse}>&ldquo;{currentDevotional.verse}&rdquo;</Text>
              <Text style={styles.verseReference}>{currentDevotional.verseReference}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Devotional</Text>
              <Text style={styles.text}>{currentDevotional.content}</Text>
            </View>

            <View style={styles.highlightBox}>
              <View style={styles.highlightHeader}>
                <Heart size={18} color={Colors.light.primary} />
                <Text style={styles.highlightTitle}>Reflection</Text>
              </View>
              <Text style={styles.highlightText}>{currentDevotional.reflection}</Text>
            </View>

            <View style={styles.prayerSection}>
              <Text style={styles.prayerTitle}>Prayer</Text>
              <Text style={styles.prayerText}>{currentDevotional.prayer}</Text>
            </View>
          </Animated.View>

          <View style={styles.navigation}>
            <TouchableOpacity
              style={[styles.navButton, !hasPrevious && styles.navButtonDisabled]}
              onPress={handlePrevious}
              disabled={!hasPrevious}
            >
              <ChevronLeft size={20} color={hasPrevious ? Colors.light.primary : Colors.light.textLight} />
              <Text style={[styles.navButtonText, !hasPrevious && styles.navButtonTextDisabled]}>
                Previous
              </Text>
            </TouchableOpacity>

            <View style={styles.indicator}>
              <Text style={styles.indicatorText}>
                {currentIndex + 1} / {devotionals.length}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.navButton, !hasNext && styles.navButtonDisabled]}
              onPress={handleNext}
              disabled={!hasNext}
            >
              <Text style={[styles.navButtonText, !hasNext && styles.navButtonTextDisabled]}>
                Next
              </Text>
              <ChevronRight size={20} color={hasNext ? Colors.light.primary : Colors.light.textLight} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
      <BottomNavigation />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  timeOfDayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  timeOfDayText: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 14,
    fontWeight: '600',
  },
  devotionalTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  metaInfo: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  metaText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    fontWeight: '500',
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.xs,
    flex: 1,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textMedium,
  },
  actionButtonTextActive: {
    color: Colors.light.success,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.backgroundLight,
    borderRadius: theme.borderRadius.lg,
    marginLeft: theme.spacing.xs,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  content: {
    padding: theme.spacing.lg,
  },
  verseSection: {
    backgroundColor: Colors.light.card,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.1)',
  },
  verseSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  verse: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    lineHeight: 30,
    fontStyle: 'italic',
    marginBottom: theme.spacing.sm,
  },
  verseReference: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.primary,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.borderLight,
    marginVertical: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.md,
  },
  text: {
    fontSize: 16,
    lineHeight: 26,
    color: Colors.light.textMedium,
  },
  highlightBox: {
    backgroundColor: '#F0ABFC15',
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.xl,
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  highlightText: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.light.textMedium,
    fontStyle: 'italic',
  },
  prayerSection: {
    backgroundColor: Colors.light.card,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.small,
  },
  prayerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.md,
  },
  prayerText: {
    fontSize: 16,
    lineHeight: 26,
    color: Colors.light.textMedium,
    fontStyle: 'italic',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.xs,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    ...theme.shadows.small,
  },
  navButtonDisabled: {
    backgroundColor: Colors.light.backgroundLight,
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  navButtonTextDisabled: {
    color: Colors.light.textLight,
  },
  indicator: {
    paddingHorizontal: theme.spacing.md,
  },
  indicatorText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textMedium,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptyDescription: {
    fontSize: 16,
    color: Colors.light.textMedium,
    textAlign: 'center',
    lineHeight: 24,
  },
});
