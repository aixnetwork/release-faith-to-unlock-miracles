import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Platform, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Heart, 
  Users, 
  BookOpen, 
  Calendar, 
  Sparkles, 
  TrendingUp, 
  Shield, 
  Zap,
  Star,
  Award,
  ChevronRight,
  MessageCircle,
  Target,
  Globe,
  ArrowRight,
  Gamepad2,
  CheckCircle2,
  Flame,
  Trophy,
  Activity,
  Brain,
  Music,
  PlusCircle,
  Store
} from 'lucide-react-native';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTranslation } from '@/utils/translations';
import { ENV } from '@/config/env';
import { fetchWithAuth } from '@/utils/authUtils';

const { width } = Dimensions.get('window');

// Scripture Banner Component with Rotation
const ScriptureBanner = () => {
  const scriptures = [
    {
      verse: "According to your faith let it be done to you.",
      reference: "Matthew 9:29"
    },
    {
      verse: "Without faith it is impossible to please God, because anyone who comes to him must believe that he exists and rewards those who earnestly seek him.",
      reference: "Hebrews 11:6"
    },
    {
      verse: "If you have faith as small as a mustard seed, you can say to this mountain, 'Move from here to there,' and it will move. Nothing will be impossible for you.",
      reference: "Matthew 17:20"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % scriptures.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [scriptures.length]);

  const currentScripture = scriptures[currentIndex];

  return (
    <View style={styles.scriptureSection}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 1)']}
        style={styles.scriptureGradient}
      >
        <View style={styles.scriptureContent}>
          <Text style={styles.scriptureVerse}>
            &ldquo;{currentScripture.verse}&rdquo;
          </Text>
          <Text style={styles.scriptureReference}>{currentScripture.reference}</Text>
          
          {/* Pagination Dots */}
          <View style={styles.paginationContainer}>
            {scriptures.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentIndex && styles.paginationDotActive
                ]}
              />
            ))}
          </View>
          
          <View style={styles.scriptureDivider} />
          <Text style={styles.scriptureMessage}>
            Your faith has the power to transform your life. God rewards those who earnestly seek Him.
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

// Enhanced Dove Logo Component for Landing Page
const LandingLogo = () => (
  <View style={styles.landingLogoContainer}>
    <LinearGradient
      colors={['#0066CC', '#004499', '#002266']}
      style={styles.landingLogoGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.landingLogoInner}>
        <Text style={styles.landingDoveIcon}>🕊️</Text>
      </View>
    </LinearGradient>
    <View style={styles.landingLogoTextContainer}>
      <Text style={styles.landingLogoTitle}>RELEASE</Text>
      <Text style={styles.landingLogoSubtitle}>FAITH</Text>
      <Text style={styles.landingLogoTagline}>Your Spiritual Companion</Text>
    </View>
  </View>
);

export default function HomeScreen() {
  const [homeStats, setHomeStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [loadingText, setLoadingText] = useState('Loading...');
  
  const userStore = useUserStore();
  const isLoggedIn = userStore?.isLoggedIn || false;
  const user = userStore?.user;
  const name = user?.first_name || user?.name || 'User';
  const plan = userStore?.plan || 'free';
  const settings = userStore?.settings || { language: 'en' };
  
  const { t } = useTranslation(settings.language);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Force stop loading after timeout
  useEffect(() => {
    if (isLoggedIn && (isLoadingStats || isLoadingActivity)) {
      const timeout = setTimeout(() => {
        if (isLoadingStats || isLoadingActivity) {
          console.log('Home page loading timed out, forcing display');
          setIsLoadingStats(false);
          setIsLoadingActivity(false);
        }
      }, 10000); // 10 seconds timeout

      const textTimeout = setTimeout(() => {
         setLoadingText('Still loading...');
      }, 5000);

      return () => {
        clearTimeout(timeout);
        clearTimeout(textTimeout);
      };
    }
  }, [isLoggedIn, isLoadingStats, isLoadingActivity]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchHomeData();
    } else {
      // Ensure loading states are false if not logged in
      setIsLoadingStats(false);
      setIsLoadingActivity(false);
    }
  }, [isLoggedIn]);

  const fetchHomeData = async () => {
    const userStore = useUserStore.getState();
    const userId = userStore.user?.id;
    const accessToken = userStore.user?.accessToken;
    
    if (!userId || !accessToken) {
      console.log('No user data available, skipping fetch');
      setIsLoadingStats(false);
      setIsLoadingActivity(false);
      return;
    }
    
    try {
      setIsLoadingStats(true);
      setIsLoadingActivity(true);
      
      const [stats, activity] = await Promise.all([
        fetchHomeStats().catch(() => null),
        fetchRecentActivity().catch(() => [])
      ]);
      
      if (stats) {
        setHomeStats(stats);
      }
      if (activity) {
        setRecentActivity(activity);
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setIsLoadingStats(false);
      setIsLoadingActivity(false);
    }
  };

  const fetchHomeStats = async () => {
    try {
      const userStore = useUserStore.getState();
      const userId = userStore.user?.id;
      const accessToken = userStore.user?.accessToken;
      
      if (!userId || !accessToken) {
        console.log('No user ID or access token, skipping stats fetch');
        return null;
      }

      const [prayersRes, streakRes, habitsRes, habitCompletionsRes, pointsRes] = await Promise.all([
        fetchWithAuth(`${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayers?filter[user_id][_eq]=${userId}&aggregate[count]=id`),
        fetchWithAuth(`${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/user_prayer_day_completions?filter[user_id][_eq]=${userId}&sort=-completed_date&limit=100`),
        fetchWithAuth(`${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/habits?filter[user_id][_eq]=${userId}&filter[is_active][_eq]=true`),
        fetchWithAuth(`${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/habit_completions?filter[user_id][_eq]=${userId}&sort=-completed_date&limit=100`),
        fetchWithAuth(`${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/user_achievements?filter[user_id][_eq]=${userId}&aggregate[sum]=points`),
      ]);

      const prayersData = await prayersRes.json();
      const streakData = await streakRes.json();
      const habitsData = await habitsRes.json();
      const habitCompletionsData = await habitCompletionsRes.json();
      const pointsData = await pointsRes.json();

      const totalPrayers = prayersData.data?.[0]?.count?.id || 0;

      const prayerCompletions = streakData.data || [];
      const habitCompletions = habitCompletionsData.data || [];
      const streak = calculateStreakFromHabits(habitCompletions);

      const habits = habitsData.data || [];
      const today = new Date().toISOString().split('T')[0];
      
      const habitIdsCompletedToday = new Set(
        habitCompletions
          .filter((c: any) => new Date(c.completed_date).toISOString().split('T')[0] === today)
          .map((c: any) => c.habit_id)
      );
      const completedToday = habitIdsCompletedToday.size;

      const totalPoints = pointsData.data?.[0]?.sum?.points || 0;

      const todayCompletions = habitCompletions.filter((c: any) => {
        const completedDate = new Date(c.completed_date).toISOString().split('T')[0];
        return completedDate === today;
      }).length;

      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const weekCompletions = habitCompletions.filter((c: any) => {
        const completedDate = new Date(c.completed_date);
        return completedDate >= weekStart;
      }).length;

      return {
        prayers: totalPrayers,
        streak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        dailyPracticeToday: completedToday,
        totalHabits: habits.length,
        points: totalPoints,
        todayProgress: todayCompletions,
        weeklyStreak: weekCompletions,
      };
    } catch (error) {
      console.error('Error fetching home stats:', error);
      return null;
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const userStore = useUserStore.getState();
      const userId = userStore.user?.id;
      const accessToken = userStore.user?.accessToken;
      
      if (!userId || !accessToken) {
        console.log('No user ID or access token, skipping activity fetch');
        return [];
      }

      const [prayersRes, habitsRes, achievementsRes] = await Promise.all([
        fetchWithAuth(`${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayers?filter[user_id][_eq]=${userId}&filter[is_answered][_eq]=true&sort=-updated_at&limit=5`),
        fetchWithAuth(`${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/habits?filter[user_id][_eq]=${userId}&filter[is_active][_eq]=true&sort=-last_completed_date&limit=5`),
        fetchWithAuth(`${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/user_achievements?filter[user_id][_eq]=${userId}&sort=-earned_date&limit=5`),
      ]);

      const prayersData = await prayersRes.json();
      const habitsData = await habitsRes.json();
      const achievementsData = await achievementsRes.json();

      const activities: any[] = [];

      (prayersData.data || []).forEach((prayer: any) => {
        activities.push({
          type: 'prayer_answered',
          title: 'Prayer answered',
          description: prayer.title,
          time: prayer.updated_at,
          icon: 'heart',
        });
      });

      (habitsData.data || []).forEach((habit: any) => {
        if (habit.last_completed_date) {
          activities.push({
            type: 'habit_completed',
            title: 'Habit completed',
            description: habit.name,
            time: habit.last_completed_date,
            icon: 'target',
          });
        }
      });

      (achievementsData.data || []).forEach((achievement: any) => {
        activities.push({
          type: 'achievement_unlocked',
          title: 'Achievement unlocked',
          description: achievement.achievement_name || 'New achievement',
          time: achievement.earned_date,
          icon: 'trophy',
        });
      });

      activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

      return activities.slice(0, 10);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  };

  const calculateStreakFromHabits = (completions: any[]): { currentStreak: number; longestStreak: number } => {
    if (!completions || completions.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    const sortedDates = completions
      .map((c: any) => new Date(c.completed_date).toISOString().split('T')[0])
      .filter((date, index, self) => self.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (sortedDates[0] === today || sortedDates[0] === yesterday) {
      currentStreak = 1;
      
      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000);
        
        if (diffDays === 1) {
          currentStreak++;
          tempStreak++;
        } else {
          break;
        }
      }
    }

    tempStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000);
      
      if (diffDays === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    longestStreak = Math.max(longestStreak, currentStreak, 1);

    return { currentStreak, longestStreak };
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return t('greeting.morning');
    if (hour < 17) return t('greeting.afternoon');
    return t('greeting.evening');
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleFeaturePress = (feature: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    switch (feature) {
      case 'prayers':
        router.push('/(tabs)/prayers');
        break;
      case 'prayer-plans':
        router.push('/(tabs)/prayer-plans');
        break;
      case 'community':
        router.push('/(tabs)/community');
        break;
      case 'ai':
        router.push('/(tabs)/ai-assistant');
        break;
      case 'meetings':
        router.push('/(tabs)/meetings');
        break;
      case 'content':
        router.push('/(tabs)/content');
        break;
      case 'testimonials':
        router.push('/(tabs)/testimonials');
        break;
      case 'songs':
        router.push('/(tabs)/songs');
        break;
      case 'inspiration':
        router.push('/(tabs)/inspiration');
        break;
      case 'membership':
        router.push('/membership');
        break;
      case 'affiliate':
        router.push('/affiliate');
        break;
      case 'bible-games':
        router.push('/bible-games');
        break;
      case 'habits':
        router.push('/(tabs)/habits');
        break;
      case 'mental-health':
        router.push('/mental-health');
        break;
      case 'achievements':
        router.push('/achievements');
        break;
      case 'services':
        router.push('/services');
        break;
      default:
        Alert.alert('Coming Soon', `${feature} feature is coming soon!`);
    }
  };

  const handleGetStarted = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (isLoggedIn) {
      router.push('/(tabs)/prayers');
    } else {
      router.push('/login');
    }
  };

  const handleUpgrade = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/membership');
  };

  if (isLoggedIn) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Welcome Header */}
        <LinearGradient
          colors={[Colors.light.primary, Colors.light.primaryDark, '#002266']}
          style={styles.welcomeHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.welcomeContent}>
            <Text style={styles.greeting}>{getGreeting()}, {name}!</Text>
            <Text style={styles.welcomeSubtext}>{t('home.continueJourney')}</Text>
            
            {(homeStats?.streak || 0) > 0 && (
              <View style={styles.streakContainer}>
                <Award size={16} color="#ffffff" />
                <Text style={styles.streakText}>
                  {homeStats?.streak || 0} {t('home.dayStreak')}
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Compact Stats Dashboard */}
        <View style={styles.statsContainer}>
          {isLoadingStats ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
              <Text style={styles.loadingText}>{loadingText}</Text>
            </View>
          ) : (
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Heart size={20} color={Colors.light.primary} />
                <Text style={styles.statNumber}>{homeStats?.prayers || 0}</Text>
                <Text style={styles.statLabel}>{t('home.prayers')}</Text>
              </View>
              
              <View style={styles.statCard}>
                <Flame size={20} color={Colors.light.error} />
                <Text style={styles.statNumber}>{homeStats?.streak || 0}</Text>
                <Text style={styles.statLabel}>{t('prayers.streak')}</Text>
              </View>
              
              <View style={styles.statCard}>
                <Target size={20} color={Colors.light.success} />
                <Text style={styles.statNumber}>{homeStats?.dailyPracticeToday || 0}/{homeStats?.totalHabits || 0}</Text>
                <Text style={styles.statLabel}>Today</Text>
              </View>
              
              <View style={styles.statCard}>
                <Trophy size={20} color={Colors.light.warning} />
                <Text style={styles.statNumber}>{homeStats?.points || 0}</Text>
                <Text style={styles.statLabel}>Points</Text>
              </View>
            </View>
          )}
        </View>
        
        {/* Today's Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today&apos;s Progress</Text>
          {isLoadingStats ? (
            <ActivityIndicator size="small" color={Colors.light.primary} />
          ) : (
            <View style={styles.progressGrid}>
              <View style={styles.progressCard}>
                <View style={styles.progressHeader}>
                  <CheckCircle2 size={20} color={Colors.light.primary} />
                  <Text style={styles.progressTitle}>Daily Goals</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${((homeStats?.dailyPracticeToday || 0) / Math.max(homeStats?.totalHabits || 1, 1)) * 100}%` }]} />
                </View>
                <Text style={styles.progressText}>
                  {homeStats?.dailyPracticeToday || 0} of {homeStats?.totalHabits || 0} completed
                </Text>
              </View>
              
              <View style={styles.progressCard}>
                <View style={styles.progressHeader}>
                  <Activity size={20} color={Colors.light.secondary} />
                  <Text style={styles.progressTitle}>Weekly Streak</Text>
                </View>
                <View style={styles.streakIndicator}>
                  <Text style={styles.streakNumber}>{homeStats?.weeklyStreak || 0}</Text>
                  <Text style={styles.streakLabel}>days</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Simplified Quick Actions - 2x2 Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('home.quickActions')}</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={[styles.quickActionCard, styles.primaryAction]}
              onPress={() => handleFeaturePress('prayers')}
            >
              <LinearGradient
                colors={[Colors.light.primary, Colors.light.primaryDark]}
                style={styles.quickActionGradient}
              >
                <PlusCircle size={32} color="#ffffff" />
                <Text style={styles.quickActionTextWhite}>Add Prayer</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => handleFeaturePress('ai')}
            >
              <Sparkles size={28} color={Colors.light.secondary} />
              <Text style={styles.quickActionText}>AI Assistant</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push('/(tabs)/devotional')}
            >
              <BookOpen size={28} color={Colors.light.success} />
              <Text style={styles.quickActionText}>Devotional</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => handleFeaturePress('habits')}
            >
              <Target size={28} color={Colors.light.error} />
              <Text style={styles.quickActionText}>Track Habit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity & Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {isLoadingActivity ? (
            <ActivityIndicator size="small" color={Colors.light.primary} />
          ) : recentActivity.length > 0 ? (
            <View style={styles.activityContainer}>
              {recentActivity.slice(0, 5).map((activity, index) => {
                const IconComponent = activity.icon === 'heart' ? Heart : activity.icon === 'target' ? Target : Trophy;
                const iconColor = activity.icon === 'heart' ? Colors.light.primary : activity.icon === 'target' ? Colors.light.success : Colors.light.warning;
                const timeAgo = getTimeAgo(activity.time);
                
                return (
                  <View key={index} style={styles.activityItem}>
                    <View style={styles.activityIcon}>
                      <IconComponent size={16} color={iconColor} />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityTitle}>{activity.title}</Text>
                      <Text style={styles.activityTime}>{timeAgo}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.activityContainer}>
              <Text style={styles.emptyActivityText}>No recent activity yet. Start your spiritual journey today!</Text>
            </View>
          )}
        </View>
        
        {/* Discover More - Simplified single section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Discover More</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/more')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.featuresGrid}>
            <TouchableOpacity 
              style={styles.featureCard}
              onPress={() => handleFeaturePress('community')}
            >
              <Users size={28} color={Colors.light.primary} />
              <Text style={styles.featureTitle}>{t('home.community')}</Text>
              <Text style={styles.featureDescription}>{t('home.connectBelievers')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.featureCard}
              onPress={() => handleFeaturePress('bible-games')}
            >
              <Gamepad2 size={28} color={Colors.light.warning} />
              <Text style={styles.featureTitle}>Bible Games</Text>
              <Text style={styles.featureDescription}>Learn through play</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.featureCard}
              onPress={() => handleFeaturePress('songs')}
            >
              <Music size={28} color={Colors.light.secondary} />
              <Text style={styles.featureTitle}>Worship</Text>
              <Text style={styles.featureDescription}>Songs & music</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.featureCard}
              onPress={() => handleFeaturePress('services')}
            >
              <Store size={28} color={Colors.light.success} />
              <Text style={styles.featureTitle}>Services</Text>
              <Text style={styles.featureDescription}>Faith-based services</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upgrade Section */}
        {plan === 'free' && (
          <View style={styles.section}>
            <LinearGradient
              colors={[Colors.light.secondary, Colors.light.secondaryDark, '#4C1D95']}
              style={styles.upgradeCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.upgradeContent}>
                <Zap size={32} color="#ffffff" style={styles.upgradeIcon} />
                <Text style={styles.upgradeTitle}>{t('home.unlockPremium')}</Text>
                <Text style={styles.upgradeDescription}>
                  {t('home.aiInsights')}
                </Text>
                
                <View style={styles.upgradeFeatures}>
                  <View style={styles.upgradeFeature}>
                    <Shield size={16} color="#ffffff" />
                    <Text style={styles.upgradeFeatureText}>{t('home.mentalHealthResources')}</Text>
                  </View>
                  <View style={styles.upgradeFeature}>
                    <TrendingUp size={16} color="#ffffff" />
                    <Text style={styles.upgradeFeatureText}>{t('home.advancedAI')}</Text>
                  </View>
                  <View style={styles.upgradeFeature}>
                    <Globe size={16} color="#ffffff" />
                    <Text style={styles.upgradeFeatureText}>{t('home.externalIntegrations')}</Text>
                  </View>
                </View>
                
                <Button
                  title={t('home.upgradeNow')}
                  onPress={handleUpgrade}
                  style={styles.upgradeButton}
                  variant="outline"
                />
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Affiliate Program */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.affiliateCard}
            onPress={() => handleFeaturePress('affiliate')}
          >
            <View style={styles.affiliateContent}>
              <Award size={24} color={Colors.light.primary} />
              <View style={styles.affiliateText}>
                <Text style={styles.affiliateTitle}>{t('home.affiliateProgram')}</Text>
                <Text style={styles.affiliateDescription}>
                  {t('home.shareEarn')}
                </Text>
              </View>
              <ChevronRight size={20} color={Colors.light.textLight} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Scripture Banner for Logged In Users */}
        <ScriptureBanner />
      </ScrollView>
    );
  }

  // Enhanced Landing page for non-logged in users
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section with Logo */}
      <LinearGradient
        colors={[Colors.light.primary, Colors.light.primaryDark, '#002266']}
        style={styles.heroSection}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.heroContent}>
          <LandingLogo />
          <Text style={styles.heroSubtitle}>
            {t('home.spiritualCompanion')}
          </Text>
          <Button
            title={t('home.getStartedFree')}
            onPress={handleGetStarted}
            style={styles.heroButton}
            variant="outline"
            leftIcon={<ArrowRight size={18} color={Colors.light.white} />}
          />
          <Text style={styles.heroNote}>{t('home.joinThousands')}</Text>
        </View>
      </LinearGradient>

      {/* Scripture Banner */}
      <ScriptureBanner />

      {/* Features Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('home.powerfulFeatures')}</Text>
        <Text style={styles.sectionDescription}>
          {t('home.everythingNeed')}
        </Text>
        
        <View style={styles.featuresGrid}>
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => handleFeaturePress('prayers')}
            accessibilityRole="button"
            accessibilityLabel={t('home.prayerJournal')}
            testID="feature-card-prayer-journal"
            activeOpacity={0.8}
          >
            <Heart size={32} color={Colors.light.primary} style={styles.featureIcon} />
            <Text style={styles.featureTitle}>{t('home.prayerJournal')}</Text>
            <Text style={styles.featureDescription}>
              {t('home.trackPrayers')}
            </Text>
            <ChevronRight size={16} color={Colors.light.textLight} style={styles.featureArrow} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => handleFeaturePress('prayer-plans')}
            accessibilityRole="button"
            accessibilityLabel={t('home.prayerPlans')}
            testID="feature-card-prayer-plans"
            activeOpacity={0.8}
          >
            <Target size={32} color={Colors.light.secondary} style={styles.featureIcon} />
            <Text style={styles.featureTitle}>{t('home.prayerPlans')}</Text>
            <Text style={styles.featureDescription}>
              {t('home.guidedJourneys')}
            </Text>
            <ChevronRight size={16} color={Colors.light.textLight} style={styles.featureArrow} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => handleFeaturePress('community')}
            accessibilityRole="button"
            accessibilityLabel={t('home.globalCommunity')}
            testID="feature-card-community"
            activeOpacity={0.8}
          >
            <Users size={32} color={Colors.light.success} style={styles.featureIcon} />
            <Text style={styles.featureTitle}>{t('home.globalCommunity')}</Text>
            <Text style={styles.featureDescription}>
              {t('home.connectWorldwide')}
            </Text>
            <ChevronRight size={16} color={Colors.light.textLight} style={styles.featureArrow} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => handleFeaturePress('ai')}
            accessibilityRole="button"
            accessibilityLabel={t('home.aiPrayerAssistant')}
            testID="feature-card-ai"
            activeOpacity={0.8}
          >
            <Sparkles size={32} color={Colors.light.warning} style={styles.featureIcon} />
            <Text style={styles.featureTitle}>{t('home.aiPrayerAssistant')}</Text>
            <Text style={styles.featureDescription}>
              {t('home.personalizedGuidance')}
            </Text>
            <ChevronRight size={16} color={Colors.light.textLight} style={styles.featureArrow} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => handleFeaturePress('meetings')}
            accessibilityRole="button"
            accessibilityLabel={t('home.virtualMeetings')}
            testID="feature-card-meetings"
            activeOpacity={0.8}
          >
            <Calendar size={32} color={Colors.light.primary} style={styles.featureIcon} />
            <Text style={styles.featureTitle}>{t('home.virtualMeetings')}</Text>
            <Text style={styles.featureDescription}>
              {t('home.joinFromAnywhere')}
            </Text>
            <ChevronRight size={16} color={Colors.light.textLight} style={styles.featureArrow} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.featureCard, styles.newFeatureCard]}
            onPress={() => handleFeaturePress('bible-games')}
            accessibilityRole="button"
            accessibilityLabel={t('home.bibleGames')}
            testID="feature-card-bible-games"
            activeOpacity={0.8}
          >
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
            <Gamepad2 size={32} color={Colors.light.warning} style={styles.featureIcon} />
            <Text style={styles.featureTitle}>{t('home.bibleGames')}</Text>
            <Text style={styles.featureDescription}>
              {t('home.learnThroughGames')}
            </Text>
            <ChevronRight size={16} color={Colors.light.textLight} style={styles.featureArrow} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.featureCard, styles.newFeatureCard]}
            onPress={() => handleFeaturePress('services')}
            accessibilityRole="button"
            accessibilityLabel="Services Marketplace"
            testID="feature-card-services"
            activeOpacity={0.8}
          >
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
            <Store size={32} color={Colors.light.error} style={styles.featureIcon} />
            <Text style={styles.featureTitle}>Services Marketplace</Text>
            <Text style={styles.featureDescription}>
              Connect with faith-based service providers
            </Text>
            <ChevronRight size={16} color={Colors.light.textLight} style={styles.featureArrow} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.featureCard, styles.newFeatureCard]}
            onPress={() => handleFeaturePress('habits')}
            accessibilityRole="button"
            accessibilityLabel="Daily Practice"
            testID="feature-card-habits"
            activeOpacity={0.8}
          >
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
            <Target size={32} color={Colors.light.success} style={styles.featureIcon} />
            <Text style={styles.featureTitle}>Daily Practice</Text>
            <Text style={styles.featureDescription}>
              Build spiritual habits with tracking
            </Text>
            <ChevronRight size={16} color={Colors.light.textLight} style={styles.featureArrow} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Benefits Section */}
      <View style={styles.benefitsSection}>
        <LinearGradient
          colors={[Colors.light.backgroundLight, Colors.light.background]}
          style={styles.benefitsGradient}
        >
          <Text style={styles.benefitsTitle}>{t('home.whyChoose')}</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Shield size={20} color={Colors.light.success} />
              <Text style={styles.benefitText}>{t('home.safeSecure')}</Text>
            </View>
            <View style={styles.benefitItem}>
              <Globe size={20} color={Colors.light.primary} />
              <Text style={styles.benefitText}>{t('home.availableWorldwide')}</Text>
            </View>
            <View style={styles.benefitItem}>
              <Heart size={20} color={Colors.light.error} />
              <Text style={styles.benefitText}>{t('home.builtByBelievers')}</Text>
            </View>
            <View style={styles.benefitItem}>
              <Star size={20} color={Colors.light.warning} />
              <Text style={styles.benefitText}>{t('home.trustedByThousands')}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* CTA Section */}
      <View style={styles.section}>
        <LinearGradient
          colors={[Colors.light.secondary, Colors.light.secondaryDark, '#4C1D95']}
          style={styles.ctaCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.ctaContent}>
            <Text style={styles.ctaTitle}>{t('home.startJourneyToday')}</Text>
            <Text style={styles.ctaDescription}>
              {t('home.joinBelievers')}
            </Text>
            <Button
              title={t('home.createFreeAccount')}
              onPress={() => router.push('/register')}
              style={styles.ctaButton}
              variant="outline"
              leftIcon={<ArrowRight size={18} color={Colors.light.white} />}
            />
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.loginLink}>{t('home.alreadyAccount')}</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  // Landing Logo Styles
  landingLogoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  landingLogoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.large,
  },
  landingLogoInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  landingDoveIcon: {
    fontSize: 32,
  },
  landingLogoTextContainer: {
    alignItems: 'center',
  },
  landingLogoTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
    lineHeight: 36,
  },
  landingLogoSubtitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 1,
    marginTop: -4,
  },
  landingLogoTagline: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.5,
    marginTop: theme.spacing.xs,
  },
  // Existing styles with improvements
  welcomeHeader: {
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
  },
  welcomeContent: {
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: theme.spacing.md,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.xs,
  },
  streakText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  statsContainer: {
    backgroundColor: Colors.light.card,
    marginHorizontal: theme.spacing.lg,
    marginTop: -theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.medium,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  loadingText: {
    fontSize: 12,
    color: Colors.light.textLight,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.light.textPrimary,
    marginTop: 6,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.light.textMedium,
    marginTop: 4,
    fontWeight: '500',
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.light.textLight,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
    lineHeight: 20,
  },
  progressGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  progressCard: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.light.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: theme.spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: Colors.light.textLight,
  },
  streakIndicator: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.light.secondary,
  },
  streakLabel: {
    fontSize: 12,
    color: Colors.light.textLight,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickActionCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
    flex: 1,
    flexBasis: '47%',
    ...theme.shadows.small,
  },
  primaryAction: {
    flexBasis: '47%',
    minHeight: 110,
  },
  quickActionGradient: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  quickActionTextWhite: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  activityContainer: {
    gap: theme.spacing.sm,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.small,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: Colors.light.textLight,
  },
  emptyActivityText: {
    fontSize: 14,
    color: Colors.light.textLight,
    textAlign: 'center',
    padding: theme.spacing.lg,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  featureCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: '48%',
    position: 'relative',
    ...theme.shadows.small,
  },
  featureArrow: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
  },
  featureIcon: {
    marginBottom: theme.spacing.sm,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  featureDescription: {
    fontSize: 12,
    color: Colors.light.textLight,
    lineHeight: 16,
  },
  upgradeCard: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    ...theme.shadows.large,
  },
  upgradeContent: {
    alignItems: 'center',
  },
  upgradeIcon: {
    marginBottom: theme.spacing.md,
  },
  upgradeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  upgradeDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  upgradeFeatures: {
    width: '100%',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  upgradeFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  upgradeFeatureText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  upgradeButton: {
    width: '100%',
  },
  affiliateCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
  },
  affiliateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  affiliateText: {
    flex: 1,
  },
  affiliateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: 2,
  },
  affiliateDescription: {
    fontSize: 12,
    color: Colors.light.textLight,
  },
  heroSection: {
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.xxl * 2,
    paddingBottom: theme.spacing.xxl,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
    paddingHorizontal: theme.spacing.md,
  },
  heroButton: {
    width: '80%',
    marginBottom: theme.spacing.md,
  },
  heroNote: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  benefitsSection: {
    marginVertical: theme.spacing.lg,
  },
  benefitsGradient: {
    padding: theme.spacing.xl,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  benefitsList: {
    gap: theme.spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  benefitText: {
    fontSize: 14,
    color: Colors.light.textMedium,
    flex: 1,
  },
  ctaCard: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    ...theme.shadows.large,
  },
  ctaContent: {
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  ctaDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 20,
  },
  ctaButton: {
    width: '80%',
    marginBottom: theme.spacing.md,
  },
  loginLink: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  bottomSpacing: {
    height: 120,
  },
  // Scripture Section Styles
  scriptureSection: {
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.xl,
  },
  scriptureGradient: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 204, 0.1)',
  },
  scriptureContent: {
    alignItems: 'center',
  },
  scriptureVerse: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.primary,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: theme.spacing.sm,
    fontStyle: 'italic',
  },
  scriptureReference: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primaryDark,
    marginBottom: theme.spacing.md,
    letterSpacing: 0.5,
  },
  scriptureDivider: {
    width: 40,
    height: 2,
    backgroundColor: Colors.light.primary,
    borderRadius: 1,
    marginBottom: theme.spacing.md,
  },
  scriptureMessage: {
    fontSize: 14,
    color: Colors.light.textMedium,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  // Pagination Dots Styles
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 102, 204, 0.3)',
  },
  paginationDotActive: {
    backgroundColor: Colors.light.primary,
    width: 12,
    height: 8,
    borderRadius: 4,
  },
  // New Feature Styles
  newFeatureCard: {
    borderWidth: 2,
    borderColor: Colors.light.primary + '30',
    backgroundColor: Colors.light.primary + '05',
  },
  newBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    zIndex: 1,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
});