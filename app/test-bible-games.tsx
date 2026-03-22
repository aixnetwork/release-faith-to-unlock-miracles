import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { Gamepad2, Trophy, Target, Clock, Star, Play, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useBibleGameStore } from '@/store/bibleGameStore';
import { mockBibleGames, mockGameStats } from '@/mocks/bibleGames';
import { BibleGame } from '@/types';

export default function TestBibleGamesScreen() {
  const { 
    games, 
    gameStats, 
    setGames, 
    setGameStats 
  } = useBibleGameStore();
  
  const [selectedGame, setSelectedGame] = useState<BibleGame | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    setGames(mockBibleGames);
    setGameStats(mockGameStats);
  }, [setGames, setGameStats]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return Colors.light.success;
      case 'medium': return Colors.light.warning;
      case 'hard': return Colors.light.error;
      default: return Colors.light.textMedium;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'old-testament': return '📜';
      case 'new-testament': return '✝️';
      case 'psalms': return '🎵';
      case 'proverbs': return '💡';
      default: return '📖';
    }
  };

  const startGame = (game: BibleGame) => {
    setSelectedGame(game);
    setCurrentQuestionIndex(0);
    setScore(0);
    setGameStarted(true);
    setGameCompleted(false);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer || !selectedGame) return;
    
    setSelectedAnswer(answer);
    const currentQuestion = selectedGame.questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(score + currentQuestion.points);
    }
    
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (!selectedGame) return;
    
    if (currentQuestionIndex < selectedGame.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setGameCompleted(true);
    }
  };

  const resetGame = () => {
    setSelectedGame(null);
    setCurrentQuestionIndex(0);
    setScore(0);
    setGameStarted(false);
    setGameCompleted(false);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  const GameCard = ({ game }: { game: BibleGame }) => (
    <TouchableOpacity
      style={styles.gameCard}
      onPress={() => startGame(game)}
      testID={`game-card-${game.id}`}
    >
      <View style={styles.gameHeader}>
        <View style={styles.gameIconContainer}>
          <Text style={styles.gameIcon}>{getCategoryIcon(game.category)}</Text>
        </View>
        <View style={styles.gameInfo}>
          <Text style={styles.gameTitle}>{game.name}</Text>
          <Text style={styles.gameDescription}>{game.description}</Text>
        </View>
        <TouchableOpacity 
          style={styles.playButton}
          onPress={() => startGame(game)}
        >
          <Play size={16} color={Colors.light.white} />
        </TouchableOpacity>
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
    </TouchableOpacity>
  );

  const renderGameScreen = () => {
    if (!selectedGame || !gameStarted) return null;

    if (gameCompleted) {
      const percentage = Math.round((score / (selectedGame.questions.length * 10)) * 100);
      const passed = percentage >= selectedGame.minScore;
      
      return (
        <View style={styles.gameCompletedContainer}>
          <LinearGradient
            colors={passed ? [Colors.light.success, '#4CAF50'] : [Colors.light.error, '#F44336']}
            style={styles.completedCard}
          >
            <Trophy size={48} color={Colors.light.white} />
            <Text style={styles.completedTitle}>
              {passed ? 'Congratulations!' : 'Good Try!'}
            </Text>
            <Text style={styles.completedScore}>Score: {score} points</Text>
            <Text style={styles.completedPercentage}>{percentage}%</Text>
            <Text style={styles.completedMessage}>
              {passed 
                ? `You passed with ${percentage}%! Well done on your Bible knowledge.`
                : `You need ${selectedGame.minScore}% to pass. Keep studying and try again!`
              }
            </Text>
            
            <View style={styles.completedActions}>
              <TouchableOpacity style={styles.playAgainButton} onPress={() => startGame(selectedGame)}>
                <Text style={styles.playAgainText}>Play Again</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.backButton} onPress={resetGame}>
                <Text style={styles.backButtonText}>Back to Games</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      );
    }

    const currentQuestion = selectedGame.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / selectedGame.questions.length) * 100;

    return (
      <View style={styles.gameScreen}>
        <View style={styles.gameProgress}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            Question {currentQuestionIndex + 1} of {selectedGame.questions.length}
          </Text>
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
          
          <View style={styles.optionsContainer}>
            {currentQuestion.options?.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === currentQuestion.correctAnswer;
              const showResult = showExplanation;
              
              let buttonStyle = styles.optionButton;
              let textStyle = styles.optionText;
              
              if (showResult) {
                if (isCorrect) {
                  buttonStyle = { ...styles.optionButton, ...styles.correctOption };
                  textStyle = { ...styles.optionText, ...styles.correctOptionText };
                } else if (isSelected && !isCorrect) {
                  buttonStyle = { ...styles.optionButton, ...styles.incorrectOption };
                  textStyle = { ...styles.optionText, ...styles.incorrectOptionText };
                }
              } else if (isSelected) {
                buttonStyle = { ...styles.optionButton, ...styles.selectedOption };
                textStyle = { ...styles.optionText, ...styles.selectedOptionText };
              }
              
              return (
                <TouchableOpacity
                  key={index}
                  style={buttonStyle}
                  onPress={() => handleAnswerSelect(option)}
                  disabled={showExplanation}
                >
                  <Text style={textStyle}>{option}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {showExplanation && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationTitle}>Explanation:</Text>
              <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
              {currentQuestion.scriptureReference && (
                <Text style={styles.scriptureReference}>
                  📖 {currentQuestion.scriptureReference}
                </Text>
              )}
              
              <TouchableOpacity style={styles.nextButton} onPress={nextQuestion}>
                <Text style={styles.nextButtonText}>
                  {currentQuestionIndex < selectedGame.questions.length - 1 ? 'Next Question' : 'Finish Game'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.gameFooter}>
          <TouchableOpacity style={styles.quitButton} onPress={resetGame}>
            <ArrowLeft size={16} color={Colors.light.textMedium} />
            <Text style={styles.quitButtonText}>Quit Game</Text>
          </TouchableOpacity>
          <Text style={styles.scoreText}>Score: {score}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Bible Games Test',
          headerStyle: { backgroundColor: Colors.light.primary },
          headerTintColor: Colors.light.white,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />

      {!gameStarted ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <LinearGradient
              colors={[Colors.light.primary, Colors.light.primaryDark]}
              style={styles.headerGradient}
            >
              <Gamepad2 size={48} color={Colors.light.white} />
              <Text style={styles.headerTitle}>Bible Games</Text>
              <Text style={styles.headerSubtitle}>Test your Bible knowledge with interactive games</Text>
            </LinearGradient>
          </View>

          {gameStats && (
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>Your Progress</Text>
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
              </View>
            </View>
          )}

          <View style={styles.gamesSection}>
            <Text style={styles.sectionTitle}>Available Games</Text>
            <View style={styles.gamesList}>
              {games.filter(game => game.isUnlocked).map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </View>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      ) : (
        renderGameScreen()
      )}
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
  header: {
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.light.white,
    marginTop: theme.spacing.md,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  statsCard: {
    backgroundColor: Colors.light.card,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textMedium,
    marginTop: theme.spacing.xs,
  },
  gamesSection: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.lg,
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
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  gameIconContainer: {
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
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
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
  gameScreen: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  gameProgress: {
    marginBottom: theme.spacing.xl,
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
  },
  progressText: {
    fontSize: 14,
    color: Colors.light.textMedium,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  questionContainer: {
    flex: 1,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.xl,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: theme.spacing.md,
  },
  optionButton: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: Colors.light.borderLight,
  },
  selectedOption: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary + '10',
  },
  correctOption: {
    borderColor: Colors.light.success,
    backgroundColor: Colors.light.success + '20',
  },
  incorrectOption: {
    borderColor: Colors.light.error,
    backgroundColor: Colors.light.error + '20',
  },
  optionText: {
    fontSize: 16,
    color: Colors.light.textPrimary,
    textAlign: 'center',
  },
  selectedOptionText: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  correctOptionText: {
    color: Colors.light.success,
    fontWeight: '600',
  },
  incorrectOptionText: {
    color: Colors.light.error,
    fontWeight: '600',
  },
  explanationContainer: {
    marginTop: theme.spacing.xl,
    backgroundColor: Colors.light.backgroundLight,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  explanationText: {
    fontSize: 14,
    color: Colors.light.textMedium,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  scriptureReference: {
    fontSize: 12,
    color: Colors.light.primary,
    fontStyle: 'italic',
    marginBottom: theme.spacing.lg,
  },
  nextButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.white,
  },
  gameFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  quitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  quitButtonText: {
    fontSize: 14,
    color: Colors.light.textMedium,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  gameCompletedContainer: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  completedCard: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.large,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.light.white,
    marginTop: theme.spacing.lg,
  },
  completedScore: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: theme.spacing.sm,
  },
  completedPercentage: {
    fontSize: 48,
    fontWeight: '900',
    color: Colors.light.white,
    marginTop: theme.spacing.md,
  },
  completedMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    lineHeight: 20,
  },
  completedActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  playAgainButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  playAgainText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.white,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.white,
  },
  bottomSpacing: {
    height: 100,
  },
});