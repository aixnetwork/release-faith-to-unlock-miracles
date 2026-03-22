import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Stack, router } from 'expo-router';
import { BookOpen, Trophy, Target, Clock, Star, Lock, Play, Users, TrendingUp, Award } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useBibleGameStore } from '@/store/bibleGameStore';
import { mockBibleGames, mockGameStats, mockLeaderboard } from '@/mocks/bibleGames';
import { BibleGame } from '@/types';
import BottomNavigation from '@/components/BottomNavigation';

const { width } = Dimensions.get('window');

export default function BibleGamesScreen() {
  const { 
    games, 
    gameStats, 
    leaderboard,
    setGames, 
    setGameStats, 
    setLeaderboard 
  } = useBibleGameStore();
  
  const [activeTab, setActiveTab] = useState<'games' | 'stats' | 'leaderboard'>('games');

  useEffect(() => {
    setGames(mockBibleGames);
    setGameStats(mockGameStats);
    setLeaderboard(mockLeaderboard);
  }, [setGames, setGameStats, setLeaderboard]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return Colors.light.success;
      case 'medium': return Colors.light.warning;
      case 'hard': return Colors.light.error;
      case 'expert': return '#8B5CF6';
      default: return Colors.light.textMedium;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'old-testament': return '📜';
      case 'new-testament': return '✝️';
      case 'psalms': return '🎵';
      case 'proverbs': return '💡';
      case 'gospels': return '❤️';
      case 'epistles': return '✉️';
      case 'prophets': return '🔮';
      default: return '📖';
    }
  };

  const GameCard = ({ game }: { game: BibleGame }) => (
    <TouchableOpacity
      style={[styles.gameCard, !game.isUnlocked && styles.lockedCard]}
      onPress={() => game.isUnlocked ? router.push(`/bible-game/${game.id}`) : null}
      testID={`game-card-${game.id}`}
    >
      <View style={styles.gameHeader}>
        <View style={styles.gameIconContainer}>
          <Text style={styles.gameIcon}>{getCategoryIcon(game.category)}</Text>
          {!game.isUnlocked && (
            <View style={styles.lockOverlay}>
              <Lock size={16} color={Colors.light.white} />
            </View>
          )}
        </View>
        <View style={styles.gameInfo}>
          <Text style={[styles.gameTitle, !game.isUnlocked && styles.lockedText]}>
            {game.name}
          </Text>
          <Text style={[styles.gameDescription, !game.isUnlocked && styles.lockedText]}>
            {game.description}
          </Text>
        </View>
        <View style={styles.gameActions}>
          {game.isUnlocked ? (
            <TouchableOpacity 
              style={styles.playButton}
              onPress={() => router.push(`/bible-game/${game.id}`)}
            >
              <Play size={16} color={Colors.light.white} />
            </TouchableOpacity>
          ) : (
            <View style={styles.lockedButton}>
              <Lock size={16} color={Colors.light.textLight} />
            </View>
          )}
        </View>
      </View>

      <View style={styles.gameDetails}>
        <View style={styles.gameDetail}>
          <Target size={14} color={Colors.light.textMedium} />
          <Text style={styles.gameDetailText}>{game.questions.length} questions</Text>
        </View>
        <View style={styles.gameDetail}>
          <Clock size={14} color={Colors.light.textMedium} />
          <Text style={styles.gameDetailText}>
            {game.timeLimit ? `${Math.floor(game.timeLimit / 60)}min` : 'No limit'}
          </Text>
        </View>
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(game.difficulty) + '20' }]}>
          <Text style={[styles.difficultyText, { color: getDifficultyColor(game.difficulty) }]}>
            {game.difficulty.toUpperCase()}
          </Text>
        </View>
      </View>

      {game.prerequisiteGames && game.prerequisiteGames.length > 0 && !game.isUnlocked && (
        <View style={styles.prerequisiteContainer}>
          <Text style={styles.prerequisiteText}>
            Complete other games to unlock
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const StatsSection = () => (
    <View style={styles.statsContainer}>
      {gameStats && (
        <>
          {/* Overall Stats */}
          <View style={styles.statsCard}>
            <LinearGradient
              colors={[Colors.light.primary, '#2E86AB']}
              style={styles.statsGradient}
            >
              <View style={styles.statsHeader}>
                <Trophy size={24} color={Colors.light.white} />
                <Text style={styles.statsTitle}>Your Progress</Text>
              </View>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{gameStats.totalGamesPlayed}</Text>
                  <Text style={styles.statLabel}>Games Played</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{gameStats.averageScore.toFixed(1)}%</Text>
                  <Text style={styles.statLabel}>Avg Score</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{gameStats.currentStreak}</Text>
                  <Text style={styles.statLabel}>Current Streak</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{gameStats.perfectGames}</Text>
                  <Text style={styles.statLabel}>Perfect Games</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Difficulty Breakdown */}
          <View style={styles.difficultyCard}>
            <Text style={styles.sectionTitle}>Difficulty Breakdown</Text>
            {Object.entries(gameStats.difficulty).map(([difficulty, stats]) => (
              <View key={difficulty} style={styles.difficultyRow}>
                <View style={styles.difficultyInfo}>
                  <View style={[styles.difficultyDot, { backgroundColor: getDifficultyColor(difficulty) }]} />
                  <Text style={styles.difficultyName}>{difficulty.toUpperCase()}</Text>
                </View>
                <View style={styles.difficultyStats}>
                  <Text style={styles.difficultyStatText}>
                    {stats.won}/{stats.played} ({stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0}%)
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Category Performance */}
          <View style={styles.categoryCard}>
            <Text style={styles.sectionTitle}>Category Performance</Text>
            {Object.entries(gameStats.categoryStats).map(([category, stats]) => (
              <View key={category} style={styles.categoryRow}>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryIcon}>{getCategoryIcon(category)}</Text>
                  <Text style={styles.categoryName}>{category.replace('-', ' ').toUpperCase()}</Text>
                </View>
                <View style={styles.categoryStats}>
                  <Text style={styles.categoryScore}>{stats.bestScore}%</Text>
                  <Text style={styles.categoryGames}>{stats.played} games</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );

  const LeaderboardSection = () => (
    <View style={styles.leaderboardContainer}>
      {leaderboard && (
        <>
          <View style={styles.leaderboardHeader}>
            <Text style={styles.sectionTitle}>Weekly Leaderboard</Text>
            <Text style={styles.leaderboardSubtitle}>
              Updated {new Date(leaderboard.lastUpdated).toLocaleDateString()}
            </Text>
          </View>
          
          {leaderboard.entries.map((entry, index) => (
            <View 
              key={entry.userId} 
              style={[
                styles.leaderboardEntry,
                entry.isCurrentUser && styles.currentUserEntry,
                index < 3 && styles.topThreeEntry
              ]}
            >
              <View style={styles.rankContainer}>
                <Text style={[
                  styles.rankText,
                  index < 3 && styles.topRankText,
                  entry.isCurrentUser && styles.currentUserText
                ]}>
                  {entry.rank}
                </Text>
                {index < 3 && (
                  <Text style={styles.rankEmoji}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </Text>
                )}
              </View>
              
              <View style={styles.userInfo}>
                <Text style={[
                  styles.userName,
                  entry.isCurrentUser && styles.currentUserText
                ]}>
                  {entry.userName}
                </Text>
                <Text style={styles.userStats}>
                  {entry.gamesPlayed} games • {entry.averageScore.toFixed(1)}% avg
                </Text>
              </View>
              
              <View style={styles.scoreContainer}>
                <Text style={[
                  styles.scoreText,
                  entry.isCurrentUser && styles.currentUserText
                ]}>
                  {entry.score}
                </Text>
                <View style={styles.badgesContainer}>
                  {entry.badges.slice(0, 3).map((badge, badgeIndex) => (
                    <View key={badgeIndex} style={styles.badgeDot} />
                  ))}
                  {entry.badges.length > 3 && (
                    <Text style={styles.moreBadges}>+{entry.badges.length - 3}</Text>
                  )}
                </View>
              </View>
            </View>
          ))}
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Bible Games',
          headerStyle: { backgroundColor: Colors.light.primary },
          headerTintColor: Colors.light.white,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />

      <View style={styles.content}>
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'games' && styles.tabActive]}
            onPress={() => setActiveTab('games')}
          >
            <BookOpen size={18} color={activeTab === 'games' ? Colors.light.white : Colors.light.textMedium} />
            <Text style={[styles.tabText, activeTab === 'games' && styles.tabTextActive]}>
              Games
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'stats' && styles.tabActive]}
            onPress={() => setActiveTab('stats')}
          >
            <TrendingUp size={18} color={activeTab === 'stats' ? Colors.light.white : Colors.light.textMedium} />
            <Text style={[styles.tabText, activeTab === 'stats' && styles.tabTextActive]}>
              Stats
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'leaderboard' && styles.tabActive]}
            onPress={() => setActiveTab('leaderboard')}
          >
            <Users size={18} color={activeTab === 'leaderboard' ? Colors.light.white : Colors.light.textMedium} />
            <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.tabTextActive]}>
              Leaderboard
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {activeTab === 'games' && (
            <View style={styles.gamesContainer}>
              <Text style={styles.sectionTitle}>Available Games</Text>
              <View style={styles.gamesList}>
                {games.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </View>
            </View>
          )}

          {activeTab === 'stats' && <StatsSection />}

          {activeTab === 'leaderboard' && <LeaderboardSection />}

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
  gamesContainer: {
    flex: 1,
  },
  gamesList: {
    gap: theme.spacing.md,
  },
  gameCard: {
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
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  gameIconContainer: {
    position: 'relative',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  gameIcon: {
    fontSize: 24,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  gameDescription: {
    fontSize: 14,
    color: Colors.light.textMedium,
    lineHeight: 20,
  },
  lockedText: {
    color: Colors.light.textLight,
  },
  gameActions: {
    marginLeft: theme.spacing.sm,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  gameDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  gameDetailText: {
    fontSize: 12,
    color: Colors.light.textMedium,
  },
  difficultyBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginLeft: 'auto',
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
  },
  prerequisiteContainer: {
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: Colors.light.warning + '20',
    borderRadius: theme.borderRadius.sm,
  },
  prerequisiteText: {
    fontSize: 12,
    color: Colors.light.warning,
    textAlign: 'center',
  },
  statsContainer: {
    gap: theme.spacing.lg,
  },
  statsCard: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  statsGradient: {
    padding: theme.spacing.lg,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.white,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.lg,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.light.white,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.white,
    opacity: 0.9,
    marginTop: theme.spacing.xs,
  },
  difficultyCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  difficultyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  difficultyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  difficultyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  difficultyName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.textPrimary,
  },
  difficultyStats: {
    alignItems: 'flex-end',
  },
  difficultyStatText: {
    fontSize: 14,
    color: Colors.light.textMedium,
  },
  categoryCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.textPrimary,
  },
  categoryStats: {
    alignItems: 'flex-end',
  },
  categoryScore: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  categoryGames: {
    fontSize: 12,
    color: Colors.light.textMedium,
  },
  leaderboardContainer: {
    gap: theme.spacing.md,
  },
  leaderboardHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  leaderboardSubtitle: {
    fontSize: 12,
    color: Colors.light.textMedium,
    marginTop: theme.spacing.xs,
  },
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  currentUserEntry: {
    borderColor: Colors.light.primary,
    borderWidth: 2,
  },
  topThreeEntry: {
    backgroundColor: Colors.light.warning + '10',
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  topRankText: {
    color: Colors.light.warning,
  },
  currentUserText: {
    color: Colors.light.primary,
  },
  rankEmoji: {
    fontSize: 12,
    marginTop: 2,
  },
  userInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  userStats: {
    fontSize: 12,
    color: Colors.light.textMedium,
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    gap: 2,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.warning,
  },
  moreBadges: {
    fontSize: 10,
    color: Colors.light.textMedium,
    marginLeft: theme.spacing.xs,
  },
  bottomSpacing: {
    height: 100,
  },
});