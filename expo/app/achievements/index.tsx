import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Stack, router } from 'expo-router';
import { Trophy, Star, Flame, Target, Users, BookOpen, Award, Lock, Gamepad2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';
import { Achievement, Badge } from '@/types';
import { bibleGameAchievements } from '@/mocks/bibleGames';
import BottomNavigation from '@/components/BottomNavigation';
import { BackButton } from '@/components/BackButton';

const { width } = Dimensions.get('window');

export default function AchievementsScreen() {
  const { 
    achievements, 
    badges, 
    prayerStreak, 
    totalPoints, 
    level,
    activePrayerPlans 
  } = useUserStore();
  const [activeTab, setActiveTab] = useState<'achievements' | 'badges' | 'stats'>('achievements');

  // Mock upcoming achievements
  const upcomingAchievements: Achievement[] = [
    {
      id: 'prayer_warrior',
      title: 'Prayer Warrior',
      description: 'Maintain a 30-day prayer streak',
      icon: '⚔️',
      category: 'prayer',
      points: 100,
      rarity: 'rare',
      requirements: [{
        type: 'streak_days',
        target: 30,
        current: prayerStreak.currentStreak
      }],
    },
    {
      id: 'community_helper',
      title: 'Community Helper',
      description: 'Pray for 50 community requests',
      icon: '🤝',
      category: 'community',
      points: 75,
      rarity: 'common',
      requirements: [{
        type: 'prayer_count',
        target: 50,
        current: 12
      }],
    },
    {
      id: 'plan_master',
      title: 'Plan Master',
      description: 'Complete 5 prayer plans',
      icon: '📋',
      category: 'prayer',
      points: 150,
      rarity: 'epic',
      requirements: [{
        type: 'prayer_count',
        target: 5,
        current: activePrayerPlans.length
      }],
    },
    ...bibleGameAchievements.map(achievement => ({
      ...achievement,
      points: 50,
      rarity: 'common' as const,
      requirements: [{
        type: 'bible_game_score' as const,
        target: achievement.requirement || 1,
        current: achievement.progress || 0
      }],
      progress: achievement.progress,
      maxProgress: achievement.requirement
    })),
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'prayer': return BookOpen;
      case 'community': return Users;
      case 'learning': return Star;
      case 'milestone': return Trophy;
      case 'bible-game': return Target;
      default: return Award;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      ...theme.gamification.achievementColors,
      'bible-game': Colors.light.success,
    };
    return colors[category as keyof typeof colors] || Colors.light.primary;
  };

  const AchievementCard = ({ achievement, isUnlocked = false }: { achievement: Achievement; isUnlocked?: boolean }) => {
    const CategoryIcon = getCategoryIcon(achievement.category);
    const categoryColor = getCategoryColor(achievement.category);
    const progress = achievement.progress || 0;
    const requirement = achievement.requirements?.[0]?.target || achievement.maxProgress || 1;
    const progressPercentage = Math.min((progress / requirement) * 100, 100);

    return (
      <View style={[styles.achievementCard, !isUnlocked && styles.lockedCard]}>
        <View style={styles.achievementHeader}>
          <View style={[styles.achievementIcon, { backgroundColor: categoryColor + '20' }]}>
            {isUnlocked ? (
              <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
            ) : (
              <Lock size={24} color={Colors.light.textLight} />
            )}
          </View>
          <View style={styles.achievementInfo}>
            <Text style={[styles.achievementTitle, !isUnlocked && styles.lockedText]}>
              {achievement.title}
            </Text>
            <Text style={[styles.achievementDescription, !isUnlocked && styles.lockedText]}>
              {achievement.description}
            </Text>
          </View>
          {isUnlocked && (
            <View style={styles.unlockedBadge}>
              <Trophy size={16} color={Colors.light.warning} />
            </View>
          )}
        </View>
        
        {!isUnlocked && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>
                {progress} / {requirement}
              </Text>
              <Text style={styles.progressPercentage}>
                {Math.round(progressPercentage)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${progressPercentage}%`, backgroundColor: categoryColor }]} 
              />
            </View>
          </View>
        )}
        
        {isUnlocked && achievement.unlockedAt && (
          <Text style={styles.unlockedDate}>
            Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
          </Text>
        )}
      </View>
    );
  };

  const BadgeCard = ({ badge, isEarned = false }: { badge: Badge; isEarned?: boolean }) => {
    return (
      <View style={[styles.badgeCard, !isEarned && styles.lockedBadgeCard]}>
        <LinearGradient
          colors={isEarned ? ['#FFD700', '#FFA500'] : ['#E5E5E5', '#CCCCCC']}
          style={styles.badgeGradient}
        >
          <Text style={styles.badgeEmoji}>{badge.icon}</Text>
        </LinearGradient>
        <Text style={[styles.badgeName, !isEarned && styles.lockedText]}>
          {badge.name}
        </Text>
        <Text style={[styles.badgeDescription, !isEarned && styles.lockedText]}>
          {badge.description}
        </Text>
        {isEarned && badge.earnedAt && (
          <Text style={styles.earnedDate}>
            {new Date(badge.earnedAt).toLocaleDateString()}
          </Text>
        )}
      </View>
    );
  };

  const StatsSection = () => (
    <View style={styles.statsContainer}>
      {/* Level Progress */}
      <View style={styles.levelCard}>
        <LinearGradient
          colors={[Colors.light.primary, '#2E86AB']}
          style={styles.levelGradient}
        >
          <View style={styles.levelContent}>
            <Text style={styles.levelNumber}>Level {level}</Text>
            <Text style={styles.levelPoints}>{totalPoints} points</Text>
          </View>
          <View style={styles.levelProgress}>
            <View style={styles.levelProgressBar}>
              <View 
                style={[
                  styles.levelProgressFill, 
                  { width: `${((totalPoints % 1000) / 1000) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.levelProgressText}>
              {1000 - (totalPoints % 1000)} points to level {level + 1}
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* Prayer Streak */}
      <View style={styles.streakCard}>
        <View style={styles.streakHeader}>
          <Flame size={24} color={theme.gamification.streakColors.fire} />
          <Text style={styles.streakTitle}>Prayer Streak</Text>
        </View>
        <Text style={styles.streakCurrent}>{prayerStreak.currentStreak} days</Text>
        <Text style={styles.streakLongest}>
          Longest streak: {prayerStreak.longestStreak} days
        </Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={styles.quickStat}>
          <Trophy size={20} color={Colors.light.warning} />
          <Text style={styles.quickStatNumber}>{achievements.length}</Text>
          <Text style={styles.quickStatLabel}>Achievements</Text>
        </View>
        <View style={styles.quickStat}>
          <Award size={20} color={Colors.light.success} />
          <Text style={styles.quickStatNumber}>{badges.length}</Text>
          <Text style={styles.quickStatLabel}>Badges</Text>
        </View>
        <View style={styles.quickStat}>
          <Target size={20} color={Colors.light.primary} />
          <Text style={styles.quickStatNumber}>{activePrayerPlans.length}</Text>
          <Text style={styles.quickStatLabel}>Active Plans</Text>
        </View>
        <TouchableOpacity 
          style={styles.quickStat}
          onPress={() => router.push('/bible-games')}
        >
          <Gamepad2 size={20} color={Colors.light.success} />
          <Text style={styles.quickStatNumber}>Play</Text>
          <Text style={styles.quickStatLabel}>Bible Games</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Achievements',
          headerLeft: () => <BackButton />,
        }}
      />

      <View style={styles.content}>
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'achievements' && styles.tabActive]}
            onPress={() => setActiveTab('achievements')}
          >
            <Trophy size={18} color={activeTab === 'achievements' ? Colors.light.white : Colors.light.textMedium} />
            <Text style={[styles.tabText, activeTab === 'achievements' && styles.tabTextActive]}>
              Achievements
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'badges' && styles.tabActive]}
            onPress={() => setActiveTab('badges')}
          >
            <Award size={18} color={activeTab === 'badges' ? Colors.light.white : Colors.light.textMedium} />
            <Text style={[styles.tabText, activeTab === 'badges' && styles.tabTextActive]}>
              Badges
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'stats' && styles.tabActive]}
            onPress={() => setActiveTab('stats')}
          >
            <Star size={18} color={activeTab === 'stats' ? Colors.light.white : Colors.light.textMedium} />
            <Text style={[styles.tabText, activeTab === 'stats' && styles.tabTextActive]}>
              Stats
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {activeTab === 'achievements' && (
            <View style={styles.achievementsContainer}>
              {achievements.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Unlocked Achievements</Text>
                  <View style={styles.achievementsList}>
                    {achievements.map((achievement) => (
                      <AchievementCard
                        key={achievement.id}
                        achievement={achievement}
                        isUnlocked={true}
                      />
                    ))}
                  </View>
                </>
              )}
              
              <Text style={styles.sectionTitle}>
                {achievements.length > 0 ? 'Upcoming Achievements' : 'Available Achievements'}
              </Text>
              <View style={styles.achievementsList}>
                {upcomingAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    isUnlocked={false}
                  />
                ))}
              </View>
            </View>
          )}

          {activeTab === 'badges' && (
            <View style={styles.badgesContainer}>
              {badges.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Earned Badges</Text>
                  <View style={styles.badgesGrid}>
                    {badges.map((badge) => (
                      <BadgeCard
                        key={badge.id}
                        badge={badge}
                        isEarned={true}
                      />
                    ))}
                  </View>
                </>
              )}
              
              <Text style={styles.sectionTitle}>
                {badges.length > 0 ? 'Available Badges' : 'Earn Your First Badge'}
              </Text>
              <View style={styles.badgesGrid}>
                {/* Mock upcoming badges */}
                <BadgeCard
                  badge={{
                    id: 'streak_7',
                    name: 'Week Warrior',
                    description: '7-day prayer streak',
                    icon: '🔥',
                    color: '#FF9500',
                    category: 'milestone',
                    isRare: false,
                  }}
                  isEarned={false}
                />
                <BadgeCard
                  badge={{
                    id: 'community_10',
                    name: 'Helper',
                    description: 'Prayed for 10 requests',
                    icon: '🤝',
                    color: '#4CAF50',
                    category: 'community',
                    isRare: false,
                  }}
                  isEarned={false}
                />
              </View>
            </View>
          )}

          {activeTab === 'stats' && <StatsSection />}

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
      <BottomNavigation />
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
  tabContainer: {
    flexDirection: 'row',
    margin: theme.spacing.lg,
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xs,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    gap: theme.spacing.xs,
  },
  tabActive: {
    backgroundColor: Colors.light.tint,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.textMedium,
  },
  tabTextActive: {
    color: Colors.light.white,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  achievementsContainer: {
    flex: 1,
  },
  achievementsList: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  achievementCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  lockedCard: {
    opacity: 0.7,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  achievementEmoji: {
    fontSize: 24,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  achievementDescription: {
    fontSize: 14,
    color: Colors.light.textMedium,
    lineHeight: 20,
  },
  lockedText: {
    color: Colors.light.textLight,
  },
  unlockedBadge: {
    padding: theme.spacing.xs,
  },
  progressContainer: {
    marginTop: theme.spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.textPrimary,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E5E5',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  unlockedDate: {
    fontSize: 12,
    color: Colors.light.textMedium,
    marginTop: theme.spacing.sm,
    fontStyle: 'italic',
  },
  badgesContainer: {
    flex: 1,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  badgeCard: {
    width: (width - theme.spacing.lg * 2 - theme.spacing.md) / 2,
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.small,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  lockedBadgeCard: {
    opacity: 0.6,
  },
  badgeGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  badgeEmoji: {
    fontSize: 28,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  badgeDescription: {
    fontSize: 12,
    color: Colors.light.textMedium,
    textAlign: 'center',
    lineHeight: 16,
  },
  earnedDate: {
    fontSize: 10,
    color: Colors.light.textLight,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  statsContainer: {
    gap: theme.spacing.lg,
  },
  levelCard: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  levelGradient: {
    padding: theme.spacing.lg,
  },
  levelContent: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  levelNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.light.white,
  },
  levelPoints: {
    fontSize: 16,
    color: Colors.light.white,
    opacity: 0.9,
  },
  levelProgress: {
    alignItems: 'center',
  },
  levelProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginBottom: theme.spacing.sm,
  },
  levelProgressFill: {
    height: '100%',
    backgroundColor: Colors.light.white,
    borderRadius: 4,
  },
  levelProgressText: {
    fontSize: 14,
    color: Colors.light.white,
    opacity: 0.9,
  },
  streakCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.small,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  streakCurrent: {
    fontSize: 36,
    fontWeight: '900',
    color: theme.gamification.streakColors.fire,
    marginBottom: theme.spacing.xs,
  },
  streakLongest: {
    fontSize: 14,
    color: Colors.light.textMedium,
  },
  quickStats: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  quickStat: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  quickStatNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginTop: theme.spacing.xs,
  },
  quickStatLabel: {
    fontSize: 12,
    color: Colors.light.textMedium,
    marginTop: 2,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 100,
  },
});