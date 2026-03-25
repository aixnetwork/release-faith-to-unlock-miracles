import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { CheckCircle, Circle, Calendar, Users, Play, ChevronRight, Book, Star } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { usePrayerStore } from '@/store/prayerStore';
import { useUserStore } from '@/store/userStore';
import { PrayerPlan, PrayerPlanDay } from '@/types';
import { ENV } from '@/config/env';
import { fetchWithAuth } from '@/utils/authUtils';

export default function PrayerPlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { prayerPlans = [] } = usePrayerStore();
  const { 
    activePrayerPlans = [], 
    joinPrayerPlan, 
    leavePrayerPlan,
    user
  } = useUserStore();
  
  const [plan, setPlan] = useState<any>(null);
  const [userPlan, setUserPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completedDaysFromDB, setCompletedDaysFromDB] = useState<number[]>([]);

  useEffect(() => {
    fetchPlanData();
  }, [id]);

  const fetchPlanData = async () => {
    try {
      setLoading(true);
      const foundPlan = prayerPlans.find(p => p && p.id === id);
      if (foundPlan) {
        setPlan(foundPlan);
      }
      
      const foundUserPlan = activePrayerPlans.find(p => p && p.planId === id);
      if (foundUserPlan) {
        setUserPlan(foundUserPlan);

        if (user) {
          const completionsResponse = await fetchWithAuth(
            `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/user_prayer_day_completions?filter[user_id][_eq]=${user.id}&filter[prayer_plan_id][_eq]=${id}&fields=day_number`
          );

          if (completionsResponse.ok) {
            const completionsData = await completionsResponse.json();
            const completedDays = (completionsData.data || []).map((c: any) => c.day_number);
            setCompletedDaysFromDB(completedDays);
          }
        }
      }
    } catch (error) {
      console.error('Error finding plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinPlan = async () => {
    if (plan && joinPrayerPlan) {
      try {
        await joinPrayerPlan(plan.id);
        Alert.alert('Success', 'You have joined this prayer plan!');
        await fetchPlanData();
      } catch (error) {
        console.error('Error joining plan:', error);
        Alert.alert('Error', 'Failed to join prayer plan. Please try again.');
      }
    }
  };

  const handleLeavePlan = () => {
    Alert.alert(
      'Leave Prayer Plan',
      'Are you sure you want to leave this prayer plan?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Leave', 
          style: 'destructive',
          onPress: () => {
            if (plan && leavePrayerPlan) {
              try {
                leavePrayerPlan(plan.id);
                router.back();
              } catch (error) {
                console.error('Error leaving plan:', error);
                Alert.alert('Error', 'Failed to leave prayer plan. Please try again.');
              }
            }
          }
        }
      ]
    );
  };

  const PrayerDayCard = ({ prayerDay, dayNumber }: { prayerDay: PrayerPlanDay; dayNumber: number }) => {
    if (!prayerDay) return null;
    
    const isCompleted = completedDaysFromDB.includes(dayNumber);
    const isCurrent = userPlan?.currentDay === dayNumber;
    const isAvailable = !userPlan || dayNumber <= (userPlan.currentDay || 1);

    return (
      <TouchableOpacity
        style={[
          styles.dayCard,
          isCompleted && styles.dayCardCompleted,
          isCurrent && styles.dayCardCurrent,
          !isAvailable && styles.dayCardDisabled
        ]}
        onPress={() => {
          if (isAvailable && plan) {
            try {
              router.push(`/prayer-day/${plan.id}/${dayNumber}`);
            } catch (error) {
              console.error('Error navigating to prayer day:', error);
            }
          }
        }}
        disabled={!isAvailable}
        activeOpacity={0.7}
      >
        <View style={styles.dayIcon}>
          {isCompleted ? (
            <CheckCircle size={18} color={Colors.light.success} />
          ) : (
            <Circle size={18} color={isAvailable ? Colors.light.primary : Colors.light.textLight} />
          )}
        </View>
        
        <View style={styles.dayInfo}>
          <View style={styles.dayHeader}>
            <Text style={[
              styles.dayNumber,
              isCompleted && styles.dayNumberCompleted,
              !isAvailable && styles.dayNumberDisabled
            ]}>
              Day {dayNumber}
            </Text>
            {isCurrent && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>Current</Text>
              </View>
            )}
          </View>
          
          <Text style={[
            styles.dayTitle,
            !isAvailable && styles.dayTitleDisabled
          ]} numberOfLines={1}>
            {prayerDay.title || `Day ${dayNumber}`}
          </Text>
          
          {prayerDay.scripture && (
            <View style={styles.scriptureRow}>
              <Book size={10} color={Colors.light.textLight} />
              <Text style={styles.scriptureText} numberOfLines={1}>{prayerDay.scripture}</Text>
            </View>
          )}
        </View>
        
        {isAvailable && (
          <ChevronRight size={14} color={Colors.light.textMedium} />
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Prayer Plan' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Prayer Plan' }} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Prayer plan not found</Text>
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

  const isJoined = !!userPlan;
  const completionPercentage = userPlan && plan.duration
    ? Math.round((completedDaysFromDB.length || 0) / plan.duration * 100)
    : 0;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: plan.title || 'Prayer Plan',
          headerRight: () => isJoined ? (
            <TouchableOpacity onPress={handleLeavePlan} style={styles.headerButton}>
              <Text style={styles.leaveButtonText}>Leave</Text>
            </TouchableOpacity>
          ) : null,
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Compact Plan Overview */}
        <View style={styles.planOverview}>
          <View style={styles.planHeader}>
            <View style={styles.planTitleSection}>
              <Text style={styles.planTitle}>{plan.title || 'Untitled Plan'}</Text>
              <View style={styles.planMeta}>
                <View style={styles.metaItem}>
                  <Calendar size={12} color={Colors.light.primary} />
                  <Text style={styles.metaText}>{plan.duration || 0} days</Text>
                </View>
                <View style={styles.metaItem}>
                  <Users size={12} color={Colors.light.primary} />
                  <Text style={styles.metaText}>{plan.participants || 0}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Star size={12} color={Colors.light.warning} />
                  <Text style={styles.metaText}>{plan.category || 'General'}</Text>
                </View>
              </View>
            </View>
          </View>
          
          <Text style={styles.planDescription}>{plan.description || 'No description available'}</Text>
        </View>

        {/* Compact Progress Section */}
        {isJoined && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Your Progress</Text>
              <Text style={styles.progressPercentage}>{completionPercentage}%</Text>
            </View>
            
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${completionPercentage}%` }]} 
              />
            </View>
            
            <View style={styles.progressStats}>
              <Text style={styles.progressText}>
                {completedDaysFromDB.length || 0} of {plan.duration || 0} completed
              </Text>
              <Text style={styles.currentDayText}>
                Day {userPlan.currentDay || 1}
              </Text>
            </View>
          </View>
        )}

        {/* Compact Action Button */}
        <View style={styles.actionSection}>
          {!isJoined ? (
            <TouchableOpacity style={styles.joinButton} onPress={handleJoinPlan}>
              <Play size={16} color={Colors.light.white} />
              <Text style={styles.joinButtonText}>Start Prayer Plan</Text>
            </TouchableOpacity>
          ) : completionPercentage >= 100 ? (
            <View style={styles.completedContainer}>
              <CheckCircle size={24} color={Colors.light.success} />
              <Text style={styles.completedTitle}>Prayer Plan Completed!</Text>
              <Text style={styles.completedSubtitle}>Congratulations on completing this journey</Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.continueButton}
              onPress={() => {
                if (plan && userPlan) {
                  try {
                    router.push(`/prayer-day/${plan.id}/${userPlan.currentDay || 1}`);
                  } catch (error) {
                    console.error('Error navigating to current day:', error);
                  }
                }
              }}
            >
              <Play size={16} color={Colors.light.white} />
              <Text style={styles.continueButtonText}>
                Continue Day {userPlan.currentDay || 1}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Prayer Days List */}
        <View style={styles.daysSection}>
          <View style={styles.daysSectionHeader}>
            <Text style={styles.daysSectionTitle}>
              Prayer Days
            </Text>
            <Text style={styles.daysCount}>
              {plan.prayers?.length || 0} days
            </Text>
          </View>
          <View style={styles.daysList}>
            {plan.prayers?.map((prayerDay: any, index: number) => (
              <PrayerDayCard
                key={index}
                prayerDay={prayerDay}
                dayNumber={index + 1}
              />
            )) || (
              <Text style={styles.noDaysText}>No prayer days available</Text>
            )}
          </View>
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
    paddingHorizontal: theme.spacing.md,
  },
  leaveButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
  },
  planOverview: {
    padding: theme.spacing.lg,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  planHeader: {
    marginBottom: theme.spacing.md,
  },
  planTitleSection: {
    flex: 1,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  planMeta: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  metaText: {
    fontSize: 12,
    color: Colors.light.textMedium,
    fontWeight: '500',
  },
  planDescription: {
    fontSize: 14,
    color: Colors.light.textMedium,
    lineHeight: 20,
  },
  progressSection: {
    padding: theme.spacing.lg,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E5E5',
    borderRadius: 3,
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 3,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    color: Colors.light.textMedium,
  },
  currentDayText: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  actionSection: {
    padding: theme.spacing.lg,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.white,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.success,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.white,
  },
  completedContainer: {
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: Colors.light.success + '10',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.light.success,
  },
  completedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.success,
    marginTop: theme.spacing.sm,
  },
  completedSubtitle: {
    fontSize: 14,
    color: Colors.light.textMedium,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  daysSection: {
    padding: theme.spacing.lg,
  },
  daysSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  daysSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  daysCount: {
    fontSize: 12,
    color: Colors.light.textMedium,
    fontWeight: '500',
  },
  daysList: {
    gap: theme.spacing.xs,
  },
  noDaysText: {
    fontSize: 14,
    color: Colors.light.textMedium,
    textAlign: 'center',
    padding: theme.spacing.lg,
  },
  dayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    gap: theme.spacing.md,
  },
  dayCardCompleted: {
    borderColor: Colors.light.success,
    backgroundColor: Colors.light.success + '08',
  },
  dayCardCurrent: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary + '08',
  },
  dayCardDisabled: {
    opacity: 0.5,
  },
  dayIcon: {
    width: 18,
    alignItems: 'center',
  },
  dayInfo: {
    flex: 1,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: 2,
  },
  dayNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  dayNumberCompleted: {
    color: Colors.light.success,
  },
  dayNumberDisabled: {
    color: Colors.light.textLight,
  },
  currentBadge: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 1,
    borderRadius: theme.borderRadius.sm,
  },
  currentBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.light.white,
  },
  dayTitle: {
    fontSize: 13,
    color: Colors.light.textMedium,
    marginBottom: 2,
  },
  dayTitleDisabled: {
    color: Colors.light.textLight,
  },
  scriptureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scriptureText: {
    fontSize: 10,
    color: Colors.light.textLight,
    fontStyle: 'italic',
  },
  bottomSpacing: {
    height: 100,
  },
});