import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Clock, HelpCircle, CheckCircle, XCircle, Trophy, Star, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useBibleGameStore } from '@/store/bibleGameStore';
import { BibleGameQuestion, GameAnswer } from '@/types';
import { mockBibleGames } from '@/mocks/bibleGames';

const { width } = Dimensions.get('window');

export default function BibleGameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    games,
    currentGame,
    currentSession,
    isGameActive,
    currentQuestionIndex,
    timeRemaining,
    startGame,
    endGame,
    submitAnswer,
    nextQuestion,
    useHint,
    setTimeRemaining,
    resetGame,
    setGames
  } = useBibleGameStore();

  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  const currentQuestion = currentGame?.questions[currentQuestionIndex];

  useEffect(() => {
    console.log('Game effect triggered:', { id, gameStarted, gamesLength: games.length });
    
    if (id && !gameStarted && isInitializing) {
      // Ensure games are loaded before starting
      if (games.length === 0) {
        console.log('Loading mock games...');
        setGames(mockBibleGames);
        // Use a microtask to ensure state is updated
        Promise.resolve().then(() => {
          console.log('Starting game with ID:', id);
          startGame(id);
          setGameStarted(true);
          setIsInitializing(false);
        });
      } else {
        // Games already loaded, start immediately
        console.log('Starting game with ID:', id);
        startGame(id);
        setGameStarted(true);
        setIsInitializing(false);
      }
    }
  }, [id, startGame, gameStarted, games.length, setGames, isInitializing]);

  const handleTimeUp = useCallback(() => {
    if (currentQuestion) {
      const answer: GameAnswer = {
        questionId: currentQuestion.id,
        userAnswer: selectedAnswer || '',
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect: false,
        timeSpent: (currentGame?.timeLimit || 0) / currentGame!.questions.length,
        hintsUsed: hintsUsed,
        points: 0,
      };
      submitAnswer(answer);
      setShowExplanation(true);
    }
  }, [currentQuestion, selectedAnswer, hintsUsed, currentGame, submitAnswer]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isGameActive && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
    } else if (isGameActive && timeRemaining === 0) {
      handleTimeUp();
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isGameActive, timeRemaining, setTimeRemaining, handleTimeUp]);



  const handleAnswerSelect = (answer: string) => {
    if (showExplanation) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!currentQuestion || !selectedAnswer) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const points = isCorrect ? currentQuestion.points : Math.max(0, currentQuestion.points + (currentGame?.pointsPerIncorrect || 0));

    const answer: GameAnswer = {
      questionId: currentQuestion.id,
      userAnswer: selectedAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect,
      timeSpent: ((currentGame?.timeLimit || 0) / currentGame!.questions.length) - timeRemaining,
      hintsUsed: hintsUsed,
      points,
    };

    submitAnswer(answer);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    setSelectedAnswer('');
    setShowExplanation(false);
    setHintsUsed(0);
    setShowHint(false);
    nextQuestion();
  };

  const handleUseHint = () => {
    if (currentQuestion && currentQuestion.hints && currentQuestion.hints.length > hintsUsed) {
      useBibleGameStore.getState().useHint(currentQuestion.id);
      setHintsUsed(prev => prev + 1);
      setShowHint(true);
    }
  };

  const handleEndGame = () => {
    Alert.alert(
      'End Game',
      'Are you sure you want to end this game? Your progress will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End Game', 
          style: 'destructive',
          onPress: () => {
            endGame();
            router.push('/bible-games');
          }
        }
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnswerStyle = (answer: string) => {
    if (!showExplanation) {
      return [
        styles.answerOption,
        selectedAnswer === answer && styles.selectedAnswer
      ];
    }

    if (answer === currentQuestion?.correctAnswer) {
      return [styles.answerOption, styles.correctAnswer];
    } else if (selectedAnswer === answer && answer !== currentQuestion?.correctAnswer) {
      return [styles.answerOption, styles.incorrectAnswer];
    }

    return [styles.answerOption, styles.disabledAnswer];
  };

  const getAnswerIcon = (answer: string) => {
    if (!showExplanation) return null;

    if (answer === currentQuestion?.correctAnswer) {
      return <CheckCircle size={20} color={Colors.light.success} />;
    } else if (selectedAnswer === answer && answer !== currentQuestion?.correctAnswer) {
      return <XCircle size={20} color={Colors.light.error} />;
    }

    return null;
  };

  // Debug logging
  console.log('Render state:', {
    gameStarted,
    currentGame: !!currentGame,
    currentSession: !!currentSession,
    isGameActive,
    currentQuestionIndex,
    questionsLength: currentGame?.questions.length
  });

  // Show loading only during initialization or if essential data is missing after initialization
  if (isInitializing || (!gameStarted && !currentGame)) {
    console.log('Showing loading screen - isInitializing:', isInitializing, 'gameStarted:', gameStarted, 'currentGame:', !!currentGame);
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Loading Game...' }} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading game...</Text>
        </View>
      </View>
    );
  }

  // If game failed to start, show error
  if (gameStarted && !currentGame) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Game Error' }} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Game not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push('/bible-games')}
          >
            <Text style={styles.backText}>Back to Games</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!currentQuestion) {
    // Game completed
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Game Complete!' }} />
        <View style={styles.completionContainer}>
          <LinearGradient
            colors={[Colors.light.primary, '#2E86AB']}
            style={styles.completionGradient}
          >
            <Trophy size={64} color={Colors.light.white} />
            <Text style={styles.completionTitle}>Game Complete!</Text>
            <Text style={styles.completionScore}>
              Final Score: {currentSession ? currentSession.score : 0}/{currentSession ? currentSession.maxScore : 0}
            </Text>
            <Text style={styles.completionPercentage}>
              {currentSession ? Math.round((currentSession.score / currentSession.maxScore) * 100) : 0}%
            </Text>
            <Text style={styles.completionStats}>
              {currentSession ? currentSession.correctAnswers : 0}/{currentSession ? currentSession.totalQuestions : 0} correct answers
            </Text>
            
            <View style={styles.completionActions}>
              <TouchableOpacity
                style={styles.playAgainButton}
                onPress={() => {
                  resetGame();
                  startGame(id!);
                }}
              >
                <Text style={styles.playAgainText}>Play Again</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  resetGame();
                  router.replace('/bible-games');
                }}
              >
                <Text style={styles.backText}>Back to Games</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: currentGame.name,
          headerRight: () => (
            <TouchableOpacity onPress={handleEndGame}>
              <Text style={styles.endGameButton}>End</Text>
            </TouchableOpacity>
          ),
        }}
      />

      {/* Game Header */}
      <View style={styles.gameHeader}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentQuestionIndex + 1) / currentGame.questions.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {currentQuestionIndex + 1} of {currentGame.questions.length}
          </Text>
        </View>

        <View style={styles.gameStats}>
          {currentGame.timeLimit && (
            <View style={styles.statItem}>
              <Clock size={16} color={Colors.light.textMedium} />
              <Text style={styles.statText}>{formatTime(timeRemaining)}</Text>
            </View>
          )}
          <View style={styles.statItem}>
            <Star size={16} color={Colors.light.warning} />
            <Text style={styles.statText}>{currentSession ? currentSession.score : 0}</Text>
          </View>
        </View>
      </View>

      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
        
        {currentQuestion.scriptureReference && (
          <Text style={styles.scriptureReference}>
            {currentQuestion.scriptureReference}
          </Text>
        )}

        {showHint && currentQuestion.hints && hintsUsed > 0 && (
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>
              💡 {currentQuestion.hints[hintsUsed - 1]}
            </Text>
          </View>
        )}
      </View>

      {/* Answer Options */}
      <View style={styles.answersContainer}>
        {currentQuestion.options?.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={getAnswerStyle(option)}
            onPress={() => handleAnswerSelect(option)}
            disabled={showExplanation}
          >
            <Text style={[
              styles.answerText,
              selectedAnswer === option && !showExplanation && styles.selectedAnswerText,
              showExplanation && option === currentQuestion.correctAnswer && styles.correctAnswerText,
              showExplanation && selectedAnswer === option && option !== currentQuestion.correctAnswer && styles.incorrectAnswerText
            ]}>
              {option}
            </Text>
            {getAnswerIcon(option)}
          </TouchableOpacity>
        ))}
      </View>

      {/* Explanation */}
      {showExplanation && currentQuestion.explanation && (
        <View style={styles.explanationContainer}>
          <Text style={styles.explanationTitle}>Explanation</Text>
          <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {!showExplanation ? (
          <View style={styles.actionRow}>
            {currentQuestion.hints && hintsUsed < currentQuestion.hints.length && (
              <TouchableOpacity
                style={styles.hintButton}
                onPress={handleUseHint}
              >
                <HelpCircle size={20} color={Colors.light.primary} />
                <Text style={styles.hintButtonText}>Hint</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.submitButton, !selectedAnswer && styles.disabledButton]}
              onPress={handleSubmitAnswer}
              disabled={!selectedAnswer}
            >
              <Text style={[styles.submitButtonText, !selectedAnswer && styles.disabledButtonText]}>
                Submit Answer
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNextQuestion}
          >
            <Text style={styles.nextButtonText}>
              {currentQuestionIndex + 1 < currentGame.questions.length ? 'Next Question' : 'Finish Game'}
            </Text>
            <ArrowRight size={20} color={Colors.light.white} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: Colors.light.textMedium,
  },
  gameHeader: {
    padding: theme.spacing.lg,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  progressContainer: {
    marginBottom: theme.spacing.md,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.light.borderLight,
    borderRadius: 3,
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: Colors.light.textMedium,
    textAlign: 'center',
  },
  gameStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  questionContainer: {
    padding: theme.spacing.lg,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    lineHeight: 28,
    marginBottom: theme.spacing.md,
  },
  scriptureReference: {
    fontSize: 14,
    color: Colors.light.primary,
    fontStyle: 'italic',
    marginBottom: theme.spacing.md,
  },
  hintContainer: {
    backgroundColor: Colors.light.warning + '20',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.warning,
  },
  hintText: {
    fontSize: 14,
    color: Colors.light.textPrimary,
    lineHeight: 20,
  },
  answersContainer: {
    flex: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  answerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.light.borderLight,
    ...theme.shadows.small,
  },
  selectedAnswer: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary + '10',
  },
  correctAnswer: {
    borderColor: Colors.light.success,
    backgroundColor: Colors.light.success + '10',
  },
  incorrectAnswer: {
    borderColor: Colors.light.error,
    backgroundColor: Colors.light.error + '10',
  },
  disabledAnswer: {
    opacity: 0.6,
  },
  answerText: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.textPrimary,
    lineHeight: 22,
  },
  selectedAnswerText: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  correctAnswerText: {
    color: Colors.light.success,
    fontWeight: '600',
  },
  incorrectAnswerText: {
    color: Colors.light.error,
    fontWeight: '600',
  },
  explanationContainer: {
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: Colors.light.primary + '10',
    borderRadius: theme.borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
    marginBottom: theme.spacing.sm,
  },
  explanationText: {
    fontSize: 14,
    color: Colors.light.textPrimary,
    lineHeight: 20,
  },
  actionContainer: {
    padding: theme.spacing.lg,
  },
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    gap: theme.spacing.sm,
  },
  hintButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  submitButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    backgroundColor: Colors.light.primary,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: Colors.light.borderLight,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.white,
  },
  disabledButtonText: {
    color: Colors.light.textLight,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    backgroundColor: Colors.light.primary,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.white,
  },
  endGameButton: {
    fontSize: 16,
    color: Colors.light.white,
    fontWeight: '600',
  },
  completionContainer: {
    flex: 1,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },
  completionGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  completionTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.light.white,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  completionScore: {
    fontSize: 20,
    color: Colors.light.white,
    marginBottom: theme.spacing.sm,
  },
  completionPercentage: {
    fontSize: 48,
    fontWeight: '900',
    color: Colors.light.white,
    marginBottom: theme.spacing.md,
  },
  completionStats: {
    fontSize: 16,
    color: Colors.light.white,
    opacity: 0.9,
    marginBottom: theme.spacing.xl,
  },
  completionActions: {
    width: '100%',
    gap: theme.spacing.md,
  },
  playAgainButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: Colors.light.white,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  playAgainText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  backButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: 'transparent',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.light.white,
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.white,
  },
});