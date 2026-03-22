import { create } from 'zustand';
import { Habit, HabitEntry, HabitStats, HabitInsight, HabitGoal } from '@/types';
import { ENV } from '@/config/env';
import { useUserStore } from './userStore';

interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_date: string;
  completed_at: string;
  notes?: string;
}

interface HabitStore {
  habits: Habit[];
  entries: HabitEntry[];
  completions: Record<string, HabitCompletion[]>;
  stats: Record<string, HabitStats>;
  insights: HabitInsight[];
  goals: HabitGoal[];
  isLoading: boolean;
  
  // Habit management
  fetchHabits: () => Promise<void>;
  fetchCompletions: (habitId: string) => Promise<void>;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitActive: (id: string) => void;
  
  // Entry management
  completeHabit: (habitId: string, entry?: Partial<HabitEntry>) => void;
  uncompleteHabit: (habitId: string, date?: string) => void;
  updateEntry: (id: string, updates: Partial<HabitEntry>) => void;
  
  // Stats and insights
  generateInsights: (habitId: string) => Promise<void>;
  markInsightRead: (id: string) => void;
  
  // Goals
  addGoal: (goal: Omit<HabitGoal, 'id'>) => void;
  updateGoal: (id: string, updates: Partial<HabitGoal>) => void;
  deleteGoal: (id: string) => void;
  
  // Utilities
  getHabitStreak: (habitId: string) => number;
  getCompletionRate: (habitId: string, days?: number) => number;
  getTodaysHabits: () => Habit[];
  getHabitEntries: (habitId: string, days?: number) => HabitEntry[];
}

const HABIT_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

const HABIT_ICONS = [
  'target', 'heart', 'book', 'dumbbell', 'moon', 'sun',
  'coffee', 'music', 'camera', 'star', 'zap', 'leaf'
];

const generateId = () => Math.random().toString(36).substr(2, 9);

const formatDate = (date: Date = new Date()) => {
  return date.toISOString().split('T')[0];
};

const calculateHabitStats = (completions: any[]) => {
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

  const last7Days = 7;
  const completionsLast7 = completedDates.filter(date => {
    const diff = (todayDate.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff < last7Days;
  }).length;
  const completionRate = (completionsLast7 / last7Days) * 100;

  return { currentStreak, longestStreak, totalCompletions, completionRate };
};

const calculateStreak = (entries: HabitEntry[], habitId: string): number => {
  const habitEntries = entries
    .filter(e => e.habitId === habitId && e.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (habitEntries.length === 0) return 0;
  
  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < habitEntries.length; i++) {
    const entryDate = new Date(habitEntries[i].date);
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);
    
    if (entryDate.toDateString() === expectedDate.toDateString()) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

const generateAIInsights = async (habit: Habit, entries: HabitEntry[], stats: HabitStats): Promise<HabitInsight[]> => {
  const insights: HabitInsight[] = [];
  
  // Pattern recognition
  if (stats.bestDays.length > 0) {
    insights.push({
      id: generateId(),
      habitId: habit.id,
      type: 'pattern',
      title: 'Best Performance Days',
      description: `You perform best on ${stats.bestDays.join(', ')}. Consider scheduling this habit on these days.`,
      priority: 'medium',
      createdAt: new Date().toISOString(),
      isRead: false,
      actionable: true,
      actionText: 'Adjust Schedule',
      actionData: { suggestedDays: stats.bestDays }
    });
  }
  
  // Streak milestones
  if (stats.currentStreak > 0 && stats.currentStreak % 7 === 0) {
    insights.push({
      id: generateId(),
      habitId: habit.id,
      type: 'milestone',
      title: `${stats.currentStreak} Day Streak! 🔥`,
      description: `Amazing! You've maintained your ${habit.name} habit for ${stats.currentStreak} days straight.`,
      priority: 'high',
      createdAt: new Date().toISOString(),
      isRead: false,
      actionable: false
    });
  }
  
  // Low completion rate warning
  if (stats.completionRate < 50 && entries.length > 7) {
    insights.push({
      id: generateId(),
      habitId: habit.id,
      type: 'warning',
      title: 'Low Completion Rate',
      description: `Your completion rate is ${Math.round(stats.completionRate)}%. Consider adjusting your goal or schedule.`,
      priority: 'high',
      createdAt: new Date().toISOString(),
      isRead: false,
      actionable: true,
      actionText: 'Adjust Goal',
      actionData: { currentRate: stats.completionRate }
    });
  }
  
  // Encouragement for consistency
  if (stats.completionRate > 80 && entries.length > 14) {
    insights.push({
      id: generateId(),
      habitId: habit.id,
      type: 'encouragement',
      title: 'Excellent Consistency! 🌟',
      description: `You're crushing it with ${Math.round(stats.completionRate)}% completion rate. Keep up the great work!`,
      priority: 'medium',
      createdAt: new Date().toISOString(),
      isRead: false,
      actionable: false
    });
  }
  
  return insights;
};

const mapDirectusHabitToHabit = (directusHabit: any): Habit => {
  const frequency = directusHabit.target_frequency || 'daily';
  
  let scheduleDays: string[] = [];
  if (frequency === 'daily') {
    scheduleDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  } else if (frequency === 'weekdays') {
    scheduleDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  } else if (frequency === 'weekends') {
    scheduleDays = ['saturday', 'sunday'];
  } else if (frequency === 'custom' && directusHabit.custom_days) {
    try {
      scheduleDays = typeof directusHabit.custom_days === 'string' 
        ? JSON.parse(directusHabit.custom_days) 
        : directusHabit.custom_days;
    } catch (e) {
      console.error('Failed to parse custom_days:', e);
      scheduleDays = ['monday', 'wednesday', 'friday'];
    }
  } else {
    scheduleDays = ['monday', 'wednesday', 'friday'];
  }

  return {
    id: directusHabit.id,
    name: directusHabit.title || 'Untitled Habit',
    description: directusHabit.description || '',
    color: directusHabit.color || HABIT_COLORS[Math.floor(Math.random() * HABIT_COLORS.length)],
    icon: directusHabit.icon || HABIT_ICONS[Math.floor(Math.random() * HABIT_ICONS.length)] as any,
    frequency: (frequency === 'daily' ? 'daily' : frequency === 'weekly' ? 'weekly' : 'custom') as 'daily' | 'weekly' | 'custom',
    scheduleDays,
    isActive: directusHabit.is_active === 1 || directusHabit.is_active === true,
    reminderTime: null,
    category: (directusHabit.category || 'spiritual') as 'spiritual' | 'physical' | 'mental' | 'social' | 'personal' | 'other',
    difficulty: 'medium',
    targetValue: 1,
    unit: 'times',
    notes: '',
    streak: 0,
    longestStreak: 0,
    totalCompletions: 0,
    createdAt: directusHabit.date_created || new Date().toISOString(),
    updatedAt: directusHabit.date_updated || new Date().toISOString()
  };
};



export const useHabitStore = create<HabitStore>((set, get) => ({
  habits: [],
  entries: [],
  completions: {},
  stats: {},
  insights: [],
  goals: [],
  isLoading: false,
  
  fetchCompletions: async (habitId: string) => {
    try {
      const userState = useUserStore.getState();
      const token = userState.user?.accessToken;
      const userId = userState.user?.id;
      
      if (!token || !userId) {
        console.log('❌ No auth token or userId for fetching completions');
        return;
      }

      const url = `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/habit_completions?filter[habit_id][_eq]=${habitId}&filter[user_id][_eq]=${userId}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('❌ Failed to fetch completions for habit:', habitId);
        return;
      }

      const result = await response.json();
      const completions = result.data || [];
      
      set(state => ({
        completions: {
          ...state.completions,
          [habitId]: completions
        }
      }));
      
      const { habits } = get();
      const habit = habits.find(h => h.id === habitId);
      if (habit) {
        const stats = calculateHabitStats(completions);
        set(state => ({
          habits: state.habits.map(h => 
            h.id === habitId 
              ? { 
                  ...h, 
                  streak: stats.currentStreak,
                  longestStreak: stats.longestStreak,
                  totalCompletions: stats.totalCompletions
                }
              : h
          )
        }));
      }
    } catch (error) {
      console.error('❌ Error fetching completions:', error);
    }
  },
  
  fetchHabits: async () => {
    try {
      set({ isLoading: true });
      
      const userState = useUserStore.getState();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const token = userState.user?.accessToken;
      const userId = userState.user?.id;
      
      console.log('=== FETCHING HABITS ===');
      console.log('Token exists:', !!token);
      console.log('UserId:', userId);
      console.log('User logged in:', userState.isLoggedIn);
      console.log('User object:', JSON.stringify(userState.user, null, 2));
      console.log('Has hydrated:', userState._hasHydrated);
      
      if (!token || !userId) {
        console.log('❌ No auth token or userId found');
        set({ habits: [], isLoading: false });
        return;
      }

      const url = `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/habits?filter[user_id][_eq]=${userId}`;
      console.log('📡 Fetching from URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to fetch habits:', errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.errors?.[0]?.extensions?.code === 'TOKEN_EXPIRED') {
            console.log('🔄 Token expired, logging out...');
            userState.logout();
            if (typeof window !== 'undefined') {
              const { router } = await import('expo-router');
              router.replace('/login');
            }
          }
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        
        set({ habits: [], isLoading: false });
        return;
      }

      const result = await response.json();
      console.log('📦 Raw response:', JSON.stringify(result, null, 2));
      console.log('📦 Data array length:', result.data?.length || 0);
      
      if (!result.data || result.data.length === 0) {
        console.log('⚠️ No habits found in database');
        set({ habits: [], isLoading: false });
        return;
      }
      
      const habits = result.data.map(mapDirectusHabitToHabit);
      
      console.log('✅ Mapped habits count:', habits.length);
      console.log('✅ Mapped habits:', JSON.stringify(habits, null, 2));
      console.log('✅ Active habits:', habits.filter((h: Habit) => h.isActive).length);
      
      set({ habits, isLoading: false });
      
      for (const habit of habits) {
        await get().fetchCompletions(habit.id);
      }
    } catch (error) {
      console.error('❌ Error fetching habits:', error);
      set({ habits: [], isLoading: false });
    }
  },
  
  addHabit: (habitData) => {
    const newHabit: Habit = {
      ...habitData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      streak: 0,
      longestStreak: 0,
      totalCompletions: 0,
      color: habitData.color || HABIT_COLORS[Math.floor(Math.random() * HABIT_COLORS.length)],
      icon: habitData.icon || HABIT_ICONS[Math.floor(Math.random() * HABIT_ICONS.length)]
    };
    
    set(state => ({
      habits: [...state.habits, newHabit]
    }));
  },
  
  updateHabit: (id, updates) => {
    set(state => ({
      habits: state.habits.map(habit => 
        habit.id === id 
          ? { ...habit, ...updates, updatedAt: new Date().toISOString() }
          : habit
      )
    }));
  },
  
  deleteHabit: (id) => {
    set(state => ({
      habits: state.habits.filter(habit => habit.id !== id),
      entries: state.entries.filter(entry => entry.habitId !== id),
      insights: state.insights.filter(insight => insight.habitId !== id),
      goals: state.goals.filter(goal => goal.habitId !== id)
    }));
  },
  
  toggleHabitActive: (id) => {
    set(state => ({
      habits: state.habits.map(habit => 
        habit.id === id 
          ? { ...habit, isActive: !habit.isActive, updatedAt: new Date().toISOString() }
          : habit
      )
    }));
  },
  
  completeHabit: (habitId, entryData = {}) => {
    const today = formatDate();
    const { entries, habits } = get();
    
    // Check if already completed today
    const existingEntry = entries.find(e => e.habitId === habitId && e.date === today);
    if (existingEntry && existingEntry.completed) return;
    
    const newEntry: HabitEntry = {
      id: generateId(),
      habitId,
      date: today,
      completed: true,
      completedAt: new Date().toISOString(),
      ...entryData
    };
    
    // Update or create entry
    const updatedEntries = existingEntry
      ? entries.map(e => e.id === existingEntry.id ? { ...e, ...newEntry, id: e.id } : e)
      : [...entries, newEntry];
    
    // Update habit stats
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      const newStreak = calculateStreak(updatedEntries, habitId);
      const updatedHabit = {
        ...habit,
        streak: newStreak,
        longestStreak: Math.max(habit.longestStreak, newStreak),
        totalCompletions: habit.totalCompletions + (existingEntry ? 0 : 1),
        updatedAt: new Date().toISOString()
      };
      
      set(state => ({
        entries: updatedEntries,
        habits: state.habits.map(h => h.id === habitId ? updatedHabit : h)
      }));
    }
  },
  
  uncompleteHabit: (habitId, date = formatDate()) => {
    const { entries, habits } = get();
    
    const entryToUpdate = entries.find(e => e.habitId === habitId && e.date === date);
    if (!entryToUpdate || !entryToUpdate.completed) return;
    
    const updatedEntries = entries.map(e => 
      e.id === entryToUpdate.id 
        ? { ...e, completed: false, completedAt: undefined }
        : e
    );
    
    // Update habit stats
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      const newStreak = calculateStreak(updatedEntries, habitId);
      const updatedHabit = {
        ...habit,
        streak: newStreak,
        totalCompletions: Math.max(0, habit.totalCompletions - 1),
        updatedAt: new Date().toISOString()
      };
      
      set(state => ({
        entries: updatedEntries,
        habits: state.habits.map(h => h.id === habitId ? updatedHabit : h)
      }));
    }
  },
  
  updateEntry: (id, updates) => {
    set(state => ({
      entries: state.entries.map(entry => 
        entry.id === id ? { ...entry, ...updates } : entry
      )
    }));
  },
  
  generateInsights: async (habitId) => {
    const { habits, completions, insights } = get();
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    
    const habitCompletions = completions[habitId] || [];
    const habitEntries: HabitEntry[] = habitCompletions.map(c => ({
      id: c.id,
      habitId: c.habit_id,
      date: c.completed_date,
      completed: true,
      completedAt: c.completed_at,
      notes: c.notes
    }));
    
    const stats = get().stats[habitId] || {
      habitId,
      currentStreak: habit.streak,
      longestStreak: habit.longestStreak,
      totalCompletions: habit.totalCompletions,
      completionRate: get().getCompletionRate(habitId, 7),
      weeklyProgress: [],
      monthlyProgress: [],
      bestDays: [],
      commonTriggers: [],
      commonObstacles: [],
      insights: []
    };
    
    const newInsights = await generateAIInsights(habit, habitEntries, stats);
    
    set(state => ({
      insights: [...state.insights.filter(i => i.habitId !== habitId), ...newInsights]
    }));
  },
  
  markInsightRead: (id) => {
    set(state => ({
      insights: state.insights.map(insight => 
        insight.id === id ? { ...insight, isRead: true } : insight
      )
    }));
  },
  
  addGoal: (goalData) => {
    const newGoal: HabitGoal = {
      ...goalData,
      id: generateId(),
      progress: 0,
      isCompleted: false
    };
    
    set(state => ({
      goals: [...state.goals, newGoal]
    }));
  },
  
  updateGoal: (id, updates) => {
    set(state => ({
      goals: state.goals.map(goal => 
        goal.id === id ? { ...goal, ...updates } : goal
      )
    }));
  },
  
  deleteGoal: (id) => {
    set(state => ({
      goals: state.goals.filter(goal => goal.id !== id)
    }));
  },
  
  getHabitStreak: (habitId) => {
    const { habits } = get();
    const habit = habits.find(h => h.id === habitId);
    return habit?.streak || 0;
  },
  
  getCompletionRate: (habitId, days = 7) => {
    const { completions } = get();
    const habitCompletions = completions[habitId] || [];
    
    if (habitCompletions.length === 0) return 0;
    
    const todayDate = new Date();
    const completedDates = habitCompletions.map(c => c.completed_date);
    const completionsInPeriod = completedDates.filter(date => {
      const diff = (todayDate.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff < days;
    }).length;
    
    return (completionsInPeriod / days) * 100;
  },
  
  getTodaysHabits: () => {
    const { habits } = get();
    return habits.filter(habit => habit.isActive);
  },
  
  getHabitEntries: (habitId, days = 30) => {
    const { entries } = get();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return entries
      .filter(e => e.habitId === habitId && new Date(e.date) >= cutoffDate)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}));