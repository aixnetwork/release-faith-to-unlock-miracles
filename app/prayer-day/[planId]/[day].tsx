import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { CheckCircle, Book, Heart, ArrowLeft, ArrowRight, Calendar } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { usePrayerStore, PrayerPlan } from '@/store/prayerStore';
import { useUserStore } from '@/store/userStore';
import { ENV } from '@/config/env';
import { fetchWithAuth } from '@/utils/authUtils';

interface PrayerDay {
  id: string;
  day_number: number;
  title: string;
  prayer_context: string;
  scripture_reference: string;
  reflection_prompt: string;
}

export default function PrayerDayScreen() {
  const { planId, day } = useLocalSearchParams<{ planId: string; day: string }>();
  const { prayerPlans = [] } = usePrayerStore();
  const { 
    activePrayerPlans = [], 
    updatePrayerStreak,
    user
  } = useUserStore();
  
  const [plan, setPlan] = useState<PrayerPlan | null>(null);
  const [userPlan, setUserPlan] = useState<any>(null);
  const [currentPrayerDay, setCurrentPrayerDay] = useState<PrayerDay | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  const dayNumber = parseInt(day || '1', 10);

  useEffect(() => {
    fetchPrayerDayData();
  }, [planId, day]);

  const fetchPrayerDayData = async () => {
    try {
      setLoading(true);
      
      const foundPlan = prayerPlans.find(p => p && p.id === planId);
      if (foundPlan) {
        setPlan(foundPlan);
      }
      
      const foundUserPlan = activePrayerPlans.find(p => p && p.planId === planId);
      if (foundUserPlan) {
        setUserPlan(foundUserPlan);
      }

      const response = await fetchWithAuth(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayer_days?filter[prayer_plan_id][_eq]=${planId}&filter[day_number][_eq]=${dayNumber}&fields=*`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch prayer day');
      }

      const data = await response.json();
      if (data.data && data.data.length > 0) {
        setCurrentPrayerDay(data.data[0]);
      }

      if (foundUserPlan && user) {
        const completionResponse = await fetchWithAuth(
          `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/user_prayer_day_completions?filter[user_id][_eq]=${user.id}&filter[prayer_plan_id][_eq]=${planId}&filter[day_number][_eq]=${dayNumber}`
        );

        if (completionResponse.ok) {
          const completionData = await completionResponse.json();
          setIsCompleted(completionData.data && completionData.data.length > 0);
        }
      }
    } catch (error) {
      console.error('Error loading prayer day:', error);
      Alert.alert('Error', 'Failed to load prayer day. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePrayer = async () => {
    if (!plan || !userPlan || !currentPrayerDay || !user) return;

    try {
      if (isCompleted) {
        Alert.alert('Already Completed', 'You have already completed this day.');
        return;
      }

      const { updatePrayerPlanProgress } = useUserStore.getState();
      
      await updatePrayerPlanProgress(plan.id, dayNumber, true, currentPrayerDay.id, plan.duration);
      updatePrayerStreak();
      
      setIsCompleted(true);
      
      const nextDay = dayNumber + 1;
      const totalDays = plan.duration || 0;
      
      if (dayNumber >= totalDays) {
        Alert.alert(
          'Congratulations!',
          'You have completed this prayer plan!',
          [
            { 
              text: 'Done', 
              onPress: () => router.back()
            }
          ]
        );
      } else if (nextDay <= totalDays) {
        Alert.alert(
          'Great job!',
          `Day ${dayNumber} completed! Ready for Day ${nextDay}?`,
          [
            { text: 'Later', style: 'cancel', onPress: () => router.back() },
            { 
              text: 'Continue', 
              onPress: () => router.replace(`/prayer-day/${planId}/${nextDay}`)
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error completing prayer day:', error);
      Alert.alert('Error', 'Failed to complete prayer day. Please try again.');
    }
  };

  const navigateToDay = (newDay: number) => {
    if (plan && newDay >= 1 && newDay <= (plan.duration || 0)) {
      router.replace(`/prayer-day/${planId}/${newDay}`);
    }
  };

  const canNavigatePrevious = dayNumber > 1;
  const canNavigateNext = plan && dayNumber < (plan.duration || 0);

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Prayer Day' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading prayer day...</Text>
        </View>
      </View>
    );
  }

  if (!plan || !currentPrayerDay) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Prayer Day' }} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Prayer day not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: `Day ${dayNumber}`,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <ArrowLeft size={24} color={Colors.light.tint} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Compact Day Header */}
        <View style={styles.dayHeader}>
          <View style={styles.dayInfo}>
            <View style={styles.dayTitleRow}>
              <Text style={styles.dayNumber}>Day {dayNumber}</Text>
              <View style={styles.dayMeta}>
                <Calendar size={12} color={Colors.light.textMedium} />
                <Text style={styles.dayMetaText}>{plan.title}</Text>
              </View>
            </View>
            <Text style={styles.dayTitle}>{currentPrayerDay.title}</Text>
          </View>
          
          {isCompleted && (
            <View style={styles.completedBadge}>
              <CheckCircle size={20} color={Colors.light.success} />
              <Text style={styles.completedText}>Done</Text>
            </View>
          )}
        </View>

        {/* Scripture Section */}
        {currentPrayerDay.scripture_reference && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Book size={18} color={Colors.light.primary} />
              <Text style={styles.sectionTitle}>Scripture</Text>
            </View>
            <View style={styles.scriptureCard}>
              <Text style={styles.scriptureReference}>{currentPrayerDay.scripture_reference}</Text>
            </View>
          </View>
        )}

        {/* Prayer Section */}
        {currentPrayerDay.prayer_context && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Heart size={18} color={Colors.light.primary} />
              <Text style={styles.sectionTitle}>Prayer</Text>
            </View>
            <View style={styles.prayerCard}>
              <Text style={styles.prayerText}>{currentPrayerDay.prayer_context}</Text>
            </View>
          </View>
        )}

        {/* Reflection Section */}
        {currentPrayerDay.reflection_prompt && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Reflection</Text>
            </View>
            <View style={styles.reflectionCard}>
              <Text style={styles.reflectionText}>{currentPrayerDay.reflection_prompt}</Text>
            </View>
          </View>
        )}

        {/* Complete Button */}
        {!isCompleted && (
          <View style={styles.actionSection}>
            <TouchableOpacity style={styles.completeButton} onPress={handleCompletePrayer}>
              <CheckCircle size={18} color={Colors.light.white} />
              <Text style={styles.completeButtonText}>Mark as Complete</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Compact Navigation */}
        <View style={styles.navigationSection}>
          <TouchableOpacity
            style={[styles.navButton, !canNavigatePrevious && styles.navButtonDisabled]}
            onPress={() => canNavigatePrevious && navigateToDay(dayNumber - 1)}
            disabled={!canNavigatePrevious}
          >
            <ArrowLeft size={14} color={canNavigatePrevious ? Colors.light.primary : Colors.light.textLight} />
            <Text style={[styles.navButtonText, !canNavigatePrevious && styles.navButtonTextDisabled]}>
              Previous
            </Text>
          </TouchableOpacity>

          <View style={styles.dayIndicator}>
            <Text style={styles.dayIndicatorText}>{dayNumber} of {plan.duration}</Text>
          </View>

          <TouchableOpacity
            style={[styles.navButton, !canNavigateNext && styles.navButtonDisabled]}
            onPress={() => canNavigateNext && navigateToDay(dayNumber + 1)}
            disabled={!canNavigateNext}
          >
            <Text style={[styles.navButtonText, !canNavigateNext && styles.navButtonTextDisabled]}>
              Next
            </Text>
            <ArrowRight size={14} color={canNavigateNext ? Colors.light.primary : Colors.light.textLight} />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.light.textMedium,
    marginTop: theme.spacing.md,
  },
  backButton: {
    marginTop: theme.spacing.lg,
    backgroundColor: Colors.light.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.white,
  },
  headerButton: {
    padding: theme.spacing.xs,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  dayInfo: {
    flex: 1,
  },
  dayTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  dayMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dayMetaText: {
    fontSize: 11,
    color: Colors.light.textMedium,
    fontWeight: '500',
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.success + '15',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.success,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  scriptureCard: {
    backgroundColor: Colors.light.primary + '08',
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  scriptureReference: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
    fontStyle: 'italic',
  },
  prayerCard: {
    backgroundColor: Colors.light.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  prayerText: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.light.textPrimary,
  },
  reflectionCard: {
    backgroundColor: Colors.light.secondary + '08',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.secondary,
  },
  reflectionText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.light.textMedium,
    fontStyle: 'italic',
  },
  actionSection: {
    padding: theme.spacing.lg,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.success,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.white,
  },
  navigationSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    gap: theme.spacing.xs,
    minWidth: 80,
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.light.primary,
  },
  navButtonTextDisabled: {
    color: Colors.light.textLight,
  },
  dayIndicator: {
    backgroundColor: Colors.light.primary + '10',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  dayIndicatorText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  bottomSpacing: {
    height: 100,
  },
});