import React, { useState, useEffect } from 'react';
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
import Toast from 'react-native-toast-message';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  Zap,
  Settings,
  Trash2,
  Edit3,
  BarChart3,
  CheckCircle2,
  Circle,
  ArrowLeft,
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
import { Habit, HabitEntry } from '@/types';
import BottomNavigation from '@/components/BottomNavigation';
import { ENV } from '@/config/env';
import { useUserStore } from '@/store/userStore';

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

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Icon size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );
};

interface WeeklyProgressProps {
  completedDates: Set<string>;
  habitColor: string;
}

const WeeklyProgress: React.FC<WeeklyProgressProps> = ({ completedDates, habitColor }) => {
  const getDaysOfWeek = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      days.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        dayNumber: date.getDate()
      });
    }
    
    return days;
  };

  const days = getDaysOfWeek();

  return (
    <View style={styles.weeklyProgress}>
      <Text style={styles.sectionTitle}>This Week</Text>
      <View style={styles.weekGrid}>
        {days.map((day, index) => {
          const isCompleted = completedDates.has(day.date);
          const isToday = day.date === new Date().toISOString().split('T')[0];
          
          return (
            <View key={day.date} style={styles.dayContainer}>
              <Text style={[styles.dayLabel, isToday && styles.todayLabel]}>
                {day.day}
              </Text>
              <View style={[
                styles.dayCircle,
                isCompleted && { backgroundColor: habitColor },
                isToday && !isCompleted && styles.todayCircle
              ]}>
                {isCompleted && <CheckCircle2 size={16} color="white" />}
                {!isCompleted && <Text style={styles.dayNumber}>{day.dayNumber}</Text>}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_date: string;
  completed_at: string;
  notes?: string;
}

export default function HabitDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { habits } = useHabitStore();
  const { user } = useUserStore();

  const [habit, setHabit] = useState<Habit | null>(null);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCompletingToday, setIsCompletingToday] = useState<boolean>(false);

  const fetchCompletions = async () => {
    if (!id || !user?.accessToken || !user?.id) return;

    try {
      const url = `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/habit_completions?filter[habit_id][_eq]=${id}&filter[user_id][_eq]=${user.id}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch completions:', response.status);
        return;
      }

      const result = await response.json();
      setCompletions(result.data || []);
    } catch (error) {
      console.error('Error fetching completions:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        const foundHabit = habits.find(h => h.id === id);
        if (foundHabit) {
          setHabit(foundHabit);
          await fetchCompletions();
        } else {
          Alert.alert('Error', 'Habit not found', [
            { text: 'OK', onPress: () => router.back() }
          ]);
        }
      }
      setIsLoading(false);
    };

    loadData();
  }, [id, habits]);

  if (isLoading || !habit) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Habit Details',
            headerStyle: { backgroundColor: Colors.light.background },
            headerTintColor: Colors.light.text,
          }}
        />
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </View>
      </>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const isCompletedToday = completions.some(c => c.completed_date === today);

  const calculateStats = () => {
    const completedDates = completions.map(c => c.completed_date).sort();
    const totalCompletions = completedDates.length;

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const todayDate = new Date();
    for (let i = 0; i <= 365; i++) {
      const checkDate = new Date(todayDate);
      checkDate.setDate(todayDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      if (completedDates.includes(dateStr)) {
        tempStreak++;
        if (i === 0 || currentStreak > 0) {
          currentStreak = tempStreak;
        }
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        if (i === 0) {
          currentStreak = 0;
        }
        tempStreak = 0;
      }
    }

    const last30Days = 30;
    const completionsLast30 = completedDates.filter(date => {
      const diff = (todayDate.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff < last30Days;
    }).length;
    const completionRate = (completionsLast30 / last30Days) * 100;

    return { currentStreak, longestStreak, totalCompletions, completionRate };
  };

  const stats = calculateStats();
  const completedDatesSet = new Set(completions.map(c => c.completed_date));

  const handleToggleComplete = async () => {
    if (!user?.accessToken || !user?.id || isCompletingToday) return;

    setIsCompletingToday(true);

    try {
      if (isCompletedToday) {
        const todayCompletion = completions.find(c => c.completed_date === today);
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
            await fetchCompletions();
            Toast.show({
              type: 'success',
              text1: 'Success',
              text2: 'Habit unmarked for today',
            });
          } else {
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'Failed to unmark habit',
            });
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
            habit_id: habit.id,
            user_id: user.id,
            completed_date: today,
            completed_at: new Date().toISOString(),
          }),
        });

        if (response.ok) {
          await fetchCompletions();
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Habit completed for today! 🎉',
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to mark habit as complete',
          });
        }
      }
    } catch (error) {
      console.error('Error toggling completion:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong',
      });
    } finally {
      setIsCompletingToday(false);
    }
  };

  const handleDeleteHabit = async () => {
    if (!user?.accessToken) return;

    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const url = `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/habits/${habit.id}`;
              const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${user.accessToken}`,
                  'Content-Type': 'application/json',
                },
              });

              if (response.ok) {
                Toast.show({
                  type: 'success',
                  text1: 'Success',
                  text2: 'Habit deleted successfully',
                });
                setTimeout(() => router.back(), 500);
              } else {
                Toast.show({
                  type: 'error',
                  text1: 'Error',
                  text2: 'Failed to delete habit',
                });
              }
            } catch (error) {
              console.error('Error deleting habit:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Something went wrong',
              });
            }
          }
        }
      ]
    );
  };

  const handleToggleActive = async () => {
    if (!user?.accessToken) return;

    try {
      const url = `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/habits/${habit.id}`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: !habit.isActive,
        }),
      });

      if (response.ok) {
        setHabit({ ...habit, isActive: !habit.isActive });
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: `Habit ${habit.isActive ? 'paused' : 'activated'} successfully.`,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to update habit status',
        });
      }
    } catch (error) {
      console.error('Error toggling habit active:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong',
      });
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: habit.name,
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: Colors.light.text,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color={Colors.light.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleDeleteHabit} style={styles.headerButton}>
              <Trash2 size={24} color={Colors.light.error} />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.container}>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Habit Header */}
            <View style={styles.habitHeader}>
              <View style={[styles.habitIcon, { backgroundColor: habit.color + '20' }]}>
                {(() => {
                  const IconComponent = getIconComponent(habit.icon);
                  return <IconComponent size={32} color={habit.color} />;
                })()}
              </View>
              <View style={styles.habitInfo}>
                <Text style={styles.habitName}>{habit.name}</Text>
                {habit.description && (
                  <Text style={styles.habitDescription}>{habit.description}</Text>
                )}
                <View style={styles.habitMeta}>
                  <Text style={[styles.habitStatus, { color: habit.isActive ? '#10B981' : '#EF4444' }]}>
                    {habit.isActive ? 'Active' : 'Paused'}
                  </Text>
                  <Text style={styles.habitFrequency}>
                    {habit.frequency === 'daily' ? 'Daily' : 
                     habit.frequency === 'weekly' ? 'Weekly' : 'Custom'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Today's Action */}
            <TouchableOpacity 
              style={[
                styles.todayAction,
                isCompletedToday && { backgroundColor: habit.color + '10', borderColor: habit.color }
              ]}
              onPress={handleToggleComplete}
            >
              <View style={styles.todayActionContent}>
                <View style={styles.todayActionLeft}>
                  {isCompletedToday ? (
                    <CheckCircle2 size={24} color={habit.color} />
                  ) : (
                    <Circle size={24} color={Colors.light.textMedium} />
                  )}
                  <Text style={[
                    styles.todayActionText,
                    isCompletedToday && { color: habit.color }
                  ]}>
                    {isCompletedToday ? 'Completed today!' : 'Mark as complete'}
                  </Text>
                </View>
                <Text style={[
                  styles.todayActionButton,
                  isCompletedToday && { color: habit.color }
                ]}>
                  {isCompletedToday ? 'Undo' : 'Complete'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <StatCard
                title="Current Streak"
                value={`${stats.currentStreak} days`}
                icon={Zap}
                color={habit.color}
              />
              <StatCard
                title="Best Streak"
                value={`${stats.longestStreak} days`}
                icon={TrendingUp}
                color="#F59E0B"
              />
              <StatCard
                title="Completion Rate"
                value={`${Math.round(stats.completionRate)}%`}
                icon={BarChart3}
                color="#10B981"
              />
              <StatCard
                title="Total Completions"
                value={stats.totalCompletions}
                icon={Target}
                color="#8B5CF6"
              />
            </View>

            {/* Weekly Progress */}
            <WeeklyProgress completedDates={completedDatesSet} habitColor={habit.color} />

            {/* Actions */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.primaryAction]}
                onPress={handleToggleActive}
              >
                <Settings size={20} color="white" />
                <Text style={styles.actionButtonText}>
                  {habit.isActive ? 'Pause Habit' : 'Activate Habit'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.secondaryAction]}
                onPress={() => router.push(`/habits/edit/${habit.id}`)}
              >
                <Edit3 size={20} color={Colors.light.primary} />
                <Text style={[styles.actionButtonText, { color: Colors.light.primary }]}>
                  Edit Habit
                </Text>
              </TouchableOpacity>
            </View>
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
  headerButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.light.textMedium,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.small,
  },
  habitIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  habitDescription: {
    fontSize: 16,
    color: Colors.light.textMedium,
    marginBottom: theme.spacing.sm,
    lineHeight: 22,
  },
  habitMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitStatus: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: theme.spacing.md,
  },
  habitFrequency: {
    fontSize: 14,
    color: Colors.light.textMedium,
  },
  todayAction: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 2,
    borderColor: Colors.light.borderLight,
    ...theme.shadows.small,
  },
  todayActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  todayActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  todayActionText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginLeft: theme.spacing.md,
  },
  todayActionButton: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    width: (width - theme.spacing.lg * 3) / 2,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 12,
    color: Colors.light.textMedium,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: theme.spacing.md,
  },
  weeklyProgress: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.small,
  },
  weekGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayContainer: {
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 12,
    color: Colors.light.textMedium,
    marginBottom: theme.spacing.xs,
    fontWeight: '600',
  },
  todayLabel: {
    color: Colors.light.primary,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.light.borderLight,
  },
  todayCircle: {
    borderColor: Colors.light.primary,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textMedium,
  },
  actionsContainer: {
    gap: theme.spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
  },
  primaryAction: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  secondaryAction: {
    backgroundColor: 'transparent',
    borderColor: Colors.light.primary,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: theme.spacing.sm,
  },
});