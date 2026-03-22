import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect, useNavigation } from 'expo-router';
import { 
  Plus, 
  Target, 
  TrendingUp, 
  Calendar, 
  Zap,
  CheckCircle2,
  Circle,
  BarChart3,
  Lightbulb,
  Trophy,
  Heart,
  Book,
  Dumbbell,
  Moon,
  Sun,
  Coffee,
  Music,
  Camera,
  Star,
  Leaf
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { theme } from '@/constants/theme';
import { useHabitStore } from '@/store/habitStore';
import { useUserStore } from '@/store/userStore';
import { Habit, HabitInsight } from '@/types';
import BottomNavigation from '@/components/BottomNavigation';
import { ENV } from '@/config/env';

const { width } = Dimensions.get('window');

const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    target: Target,
    heart: Heart,
    book: Book,
    dumbbell: Dumbbell,
    moon: Moon,
    sun: Sun,
    coffee: Coffee,
    music: Music,
    camera: Camera,
    star: Star,
    zap: Zap,
    leaf: Leaf,
  };
  return iconMap[iconName] || Target;
};

interface HabitCardProps {
  habit: Habit;
  onComplete: () => Promise<void>;
  onPress: () => void;
  isCompleted: boolean;
  isLoading?: boolean;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onComplete, onPress, isCompleted, isLoading }) => {
  const completionRate = useHabitStore(state => state.getCompletionRate(habit.id, 7));
  const IconComponent = getIconComponent(habit.icon);
  
  return (
    <TouchableOpacity style={styles.habitCard} onPress={onPress}>
      <View style={styles.habitHeader}>
        <View style={[styles.habitIcon, { backgroundColor: habit.color + '20' }]}>
          <IconComponent size={20} color={habit.color} />
        </View>
        <View style={styles.habitInfo}>
          <Text style={styles.habitName}>{habit.name}</Text>
          <Text style={styles.habitDescription}>{habit.description}</Text>
        </View>
        <TouchableOpacity
          style={[styles.checkButton, isCompleted && styles.checkButtonCompleted]}
          onPress={onComplete}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={isCompleted ? "#fff" : Colors.light.primary} />
          ) : isCompleted ? (
            <CheckCircle2 size={24} color="#fff" />
          ) : (
            <Circle size={24} color={Colors.light.textMedium} />
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.habitStats}>
        <View style={styles.statItem}>
          <Zap size={16} color={habit.color} />
          <Text style={styles.statText}>{habit.streak} day streak</Text>
        </View>
        <View style={styles.statItem}>
          <TrendingUp size={16} color={habit.color} />
          <Text style={styles.statText}>{Math.round(completionRate)}% this week</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

interface InsightCardProps {
  insight: HabitInsight;
  onPress: () => void;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight, onPress }) => {
  const getInsightIcon = () => {
    switch (insight.type) {
      case 'milestone': return <Trophy size={20} color="#F59E0B" />;
      case 'warning': return <Lightbulb size={20} color="#EF4444" />;
      case 'encouragement': return <Zap size={20} color="#10B981" />;
      default: return <BarChart3 size={20} color="#3B82F6" />;
    }
  };

  const getInsightColor = () => {
    switch (insight.type) {
      case 'milestone': return '#F59E0B';
      case 'warning': return '#EF4444';
      case 'encouragement': return '#10B981';
      default: return '#3B82F6';
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.insightCard, { borderLeftColor: getInsightColor() }]} 
      onPress={onPress}
    >
      <View style={styles.insightHeader}>
        {getInsightIcon()}
        <Text style={styles.insightTitle}>{insight.title}</Text>
      </View>
      <Text style={styles.insightDescription}>{insight.description}</Text>
      {insight.actionable && (
        <Text style={[styles.insightAction, { color: getInsightColor() }]}>
          {insight.actionText}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default function HabitsScreen() {
  const {
    habits,
    completions,
    insights,
    isLoading,
    fetchHabits,
    fetchCompletions,
    getTodaysHabits,
    generateInsights,
    markInsightRead
  } = useHabitStore();
  
  const { _hasHydrated, user, isLoggedIn } = useUserStore();
  const navigation = useNavigation();

  const [selectedTab, setSelectedTab] = useState<'today' | 'insights' | 'stats'>('today');
  const [completingHabitId, setCompletingHabitId] = useState<string | null>(null);
  
  const todaysHabits = getTodaysHabits();
  const unreadInsights = insights.filter(i => !i.isRead);
  
  const today = new Date().toISOString().split('T')[0];
  const completedHabitIds = new Set<string>();
  
  todaysHabits.forEach(habit => {
    const habitCompletions = completions[habit.id] || [];
    const isCompletedToday = habitCompletions.some(c => c.completed_date === today);
    if (isCompletedToday) {
      completedHabitIds.add(habit.id);
    }
  });

  useFocusEffect(
    useCallback(() => {
      if (!isLoggedIn) {
        router.replace('/login');
        return;
      }

      navigation.setOptions({
        headerShown: true,
        title: 'Daily Practice',
        headerStyle: { backgroundColor: Colors.light.background },
        headerTintColor: Colors.light.text,
        headerRight: () => (
          <TouchableOpacity onPress={handleCreateHabit} style={styles.headerButton}>
            <Plus size={24} color={Colors.light.primary} />
          </TouchableOpacity>
        ),
      });
    }, [navigation, isLoggedIn])
  );

  useEffect(() => {
    if (_hasHydrated && user?.accessToken && user?.id) {
      fetchHabits();
    }
  }, [_hasHydrated, user?.accessToken, user?.id]);

  useEffect(() => {
    if (habits.length > 0) {
      habits.forEach(habit => {
        const habitCompletions = completions[habit.id] || [];
        if (habitCompletions.length >= 7) {
          generateInsights(habit.id);
        }
      });
    }
  }, [habits, completions]);

  const handleCompleteHabit = async (habitId: string) => {
    if (!user?.accessToken || !user?.id || completingHabitId) return;

    setCompletingHabitId(habitId);
    const isCompleted = completedHabitIds.has(habitId);

    try {
      if (isCompleted) {
        const habitCompletions = completions[habitId] || [];
        const todayCompletion = habitCompletions.find(c => c.completed_date === today);
        
        if (todayCompletion) {
          const url = `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/habit_completions/${todayCompletion.id}`;
          const response = await fetch(url, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${user.accessToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            await fetchCompletions(habitId);
          } else {
            Alert.alert('Error', 'Failed to unmark habit');
          }
        }
      } else {
        const url = `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/habit_completions`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            habit_id: habitId,
            user_id: user.id,
            completed_date: today,
            completed_at: new Date().toISOString(),
          }),
        });

        if (response.ok) {
          await fetchCompletions(habitId);
        } else {
          Alert.alert('Error', 'Failed to mark habit as complete');
        }
      }
    } catch (error) {
      console.error('Error toggling completion:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setCompletingHabitId(null);
    }
  };

  const handleCreateHabit = () => {
    router.push('/habits/create');
  };

  const handleHabitPress = (habitId: string) => {
    router.push(`/habits/${habitId}`);
  };

  const handleInsightPress = (insight: HabitInsight) => {
    markInsightRead(insight.id);
    if (insight.actionable) {
      // Handle actionable insights
      Alert.alert(
        insight.title,
        insight.description,
        [
          { text: 'Dismiss', style: 'cancel' },
          { 
            text: insight.actionText || 'Take Action', 
            onPress: () => {
              // Navigate to habit details
              router.push(`/habits/${insight.habitId}`);
            }
          }
        ]
      );
    }
  };

  const renderTodayTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressTitle}>Today&apos;s Progress</Text>
        <Text style={styles.progressSubtitle}>
          {completedHabitIds.size} of {todaysHabits.length} completed
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${todaysHabits.length > 0 ? (completedHabitIds.size / todaysHabits.length) * 100 : 0}%` 
              }
            ]} 
          />
        </View>
      </View>

      {todaysHabits.length === 0 ? (
        <View style={styles.emptyState}>
          <Target size={48} color={Colors.light.textMedium} />
          <Text style={styles.emptyTitle}>No habits yet</Text>
          <Text style={styles.emptyDescription}>
            Create your first habit to start building positive routines
          </Text>
          <TouchableOpacity style={styles.createButton} onPress={handleCreateHabit}>
            <Plus size={20} color="#fff" />
            <Text style={styles.createButtonText}>Create Habit</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.habitsList} showsVerticalScrollIndicator={false}>
          {todaysHabits.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              isCompleted={completedHabitIds.has(habit.id)}
              isLoading={completingHabitId === habit.id}
              onComplete={() => handleCompleteHabit(habit.id)}
              onPress={() => handleHabitPress(habit.id)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderInsightsTab = () => (
    <View style={styles.tabContent}>
      {unreadInsights.length === 0 ? (
        <View style={styles.emptyState}>
          <Lightbulb size={48} color={Colors.light.textMedium} />
          <Text style={styles.emptyTitle}>No new insights</Text>
          <Text style={styles.emptyDescription}>
            Keep tracking your habits to get personalized insights
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.insightsList} showsVerticalScrollIndicator={false}>
          {unreadInsights.map(insight => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onPress={() => handleInsightPress(insight)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderStatsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{habits.length}</Text>
          <Text style={styles.statLabel}>Active Daily Practices</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {Math.max(...habits.map(h => h.streak), 0)}
          </Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {habits.reduce((sum, h) => sum + h.totalCompletions, 0)}
          </Text>
          <Text style={styles.statLabel}>Total Completions</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{unreadInsights.length}</Text>
          <Text style={styles.statLabel}>New Insights</Text>
        </View>
      </View>
    </View>
  );

  return (
    <>
      <View style={styles.container}>

        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'today' && styles.activeTab]}
            onPress={() => setSelectedTab('today')}
          >
            <Calendar size={20} color={selectedTab === 'today' ? Colors.light.primary : Colors.light.textMedium} />
            <Text style={[styles.tabText, selectedTab === 'today' && styles.activeTabText]}>
              Today
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'insights' && styles.activeTab]}
            onPress={() => setSelectedTab('insights')}
          >
            <Lightbulb size={20} color={selectedTab === 'insights' ? Colors.light.primary : Colors.light.textMedium} />
            <Text style={[styles.tabText, selectedTab === 'insights' && styles.activeTabText]}>
              Insights
            </Text>
            {unreadInsights.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadInsights.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'stats' && styles.activeTab]}
            onPress={() => setSelectedTab('stats')}
          >
            <BarChart3 size={20} color={selectedTab === 'stats' ? Colors.light.primary : Colors.light.textMedium} />
            <Text style={[styles.tabText, selectedTab === 'stats' && styles.activeTabText]}>
              Stats
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.loadingText}>Loading habits...</Text>
          </View>
        ) : (
          <>
            {selectedTab === 'today' && renderTodayTab()}
            {selectedTab === 'insights' && renderInsightsTab()}
            {selectedTab === 'stats' && renderStatsTab()}
          </>
        )}
      </View>
      <BottomNavigation />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingBottom: 80,
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.light.card,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: Colors.light.primary + '10',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textMedium,
    marginLeft: 6,
  },
  activeTabText: {
    color: Colors.light.primary,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.light.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  progressHeader: {
    marginBottom: theme.spacing.lg,
  },
  progressTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 16,
    color: Colors.light.textMedium,
    marginBottom: theme.spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.light.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 4,
  },
  habitsList: {
    flex: 1,
  },
  habitCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  habitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  habitDescription: {
    fontSize: 14,
    color: Colors.light.textMedium,
  },
  checkButton: {
    padding: 8,
  },
  checkButtonCompleted: {
    backgroundColor: Colors.light.primary,
    borderRadius: 20,
  },
  habitStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: Colors.light.textMedium,
    marginLeft: 6,
  },
  insightsList: {
    flex: 1,
  },
  insightCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    ...theme.shadows.small,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginLeft: theme.spacing.sm,
  },
  insightDescription: {
    fontSize: 14,
    color: Colors.light.textMedium,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  insightAction: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: (width - theme.spacing.lg * 3) / 2,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.light.textMedium,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptyDescription: {
    fontSize: 16,
    color: Colors.light.textMedium,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: Colors.light.textMedium,
  },
});