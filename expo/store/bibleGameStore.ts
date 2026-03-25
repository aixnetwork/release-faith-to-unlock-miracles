import { create } from 'zustand';
import { BibleGame, GameSession, BibleGameStats, BibleGameLeaderboard, GameAnswer } from '@/types';

interface BibleGameStore {
  // Games
  games: BibleGame[];
  currentGame: BibleGame | null;
  
  // Game Session
  currentSession: GameSession | null;
  isGameActive: boolean;
  currentQuestionIndex: number;
  timeRemaining: number;
  
  // Stats
  gameStats: BibleGameStats | null;
  leaderboard: BibleGameLeaderboard | null;
  
  // Actions
  setGames: (games: BibleGame[]) => void;
  setCurrentGame: (game: BibleGame | null) => void;
  startGame: (gameId: string) => void;
  endGame: () => void;
  submitAnswer: (answer: GameAnswer) => void;
  nextQuestion: () => void;
  useHint: (questionId: string) => void;
  setTimeRemaining: (time: number) => void;
  setGameStats: (stats: BibleGameStats) => void;
  setLeaderboard: (leaderboard: BibleGameLeaderboard) => void;
  resetGame: () => void;
}

export const useBibleGameStore = create<BibleGameStore>((set, get) => ({
  // Initial state
  games: [],
  currentGame: null,
  currentSession: null,
  isGameActive: false,
  currentQuestionIndex: 0,
  timeRemaining: 0,
  gameStats: null,
  leaderboard: null,
  
  // Actions
  setGames: (games) => set({ games }),
  
  setCurrentGame: (game) => set({ currentGame: game }),
  
  startGame: (gameId) => {
    const { games } = get();
    const game = games.find(g => g.id === gameId);
    if (!game) {
      console.log('Game not found:', gameId, 'Available games:', games.map(g => g.id));
      return;
    }
    
    console.log('Starting game:', game.name);
    
    const session: GameSession = {
      id: Date.now().toString(),
      gameId,
      userId: 'current-user', // This would come from auth
      startTime: new Date().toISOString(),
      score: 0,
      maxScore: game.questions.reduce((sum, q) => sum + q.points, 0),
      correctAnswers: 0,
      totalQuestions: game.questions.length,
      timeSpent: 0,
      answers: [],
      status: 'in-progress',
      difficulty: game.difficulty,
      hintsUsed: 0,
      streakCount: 0,
      achievements: [],
    };
    
    // Set all state synchronously to avoid loading states
    set({
      currentGame: game,
      currentSession: session,
      isGameActive: true,
      currentQuestionIndex: 0,
      timeRemaining: game.timeLimit || 0,
    });
    
    console.log('Game started successfully:', {
      gameId,
      gameName: game.name,
      questionsCount: game.questions.length,
      timeLimit: game.timeLimit,
      sessionCreated: !!session,
      gameActive: true
    });
  },
  
  endGame: () => {
    const { currentSession } = get();
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        endTime: new Date().toISOString(),
        status: 'completed' as const,
      };
      
      set({
        currentSession: updatedSession,
        isGameActive: false,
      });
    }
  },
  
  submitAnswer: (answer) => {
    const { currentSession } = get();
    if (!currentSession) return;
    
    const updatedAnswers = [...currentSession.answers, answer];
    const newScore = currentSession.score + answer.points;
    const newCorrectAnswers = currentSession.correctAnswers + (answer.isCorrect ? 1 : 0);
    
    set({
      currentSession: {
        ...currentSession,
        answers: updatedAnswers,
        score: newScore,
        correctAnswers: newCorrectAnswers,
      },
    });
  },
  
  nextQuestion: () => {
    const { currentQuestionIndex, currentGame } = get();
    if (!currentGame) return;
    
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex >= currentGame.questions.length) {
      get().endGame();
    } else {
      set({ currentQuestionIndex: nextIndex });
    }
  },
  
  useHint: (questionId) => {
    const { currentSession } = get();
    if (!currentSession) return;
    
    set({
      currentSession: {
        ...currentSession,
        hintsUsed: currentSession.hintsUsed + 1,
      },
    });
  },
  
  setTimeRemaining: (time) => set({ timeRemaining: time }),
  
  setGameStats: (stats) => set({ gameStats: stats }),
  
  setLeaderboard: (leaderboard) => set({ leaderboard }),
  
  resetGame: () => set({
    currentGame: null,
    currentSession: null,
    isGameActive: false,
    currentQuestionIndex: 0,
    timeRemaining: 0,
  }),
}));