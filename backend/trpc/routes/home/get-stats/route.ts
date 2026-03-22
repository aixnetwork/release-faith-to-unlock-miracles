import { protectedProcedure } from '../../../trpc';
import { ENV } from '@/config/env';

export const getHomeStatsProcedure = protectedProcedure.query(async ({ ctx }) => {
  const userId = ctx.user?.id;
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ctx.user.accessToken}`,
    };

    const [prayersRes, streakRes, habitsRes, habitCompletionsRes, pointsRes] = await Promise.all([
      fetch(`${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayers?filter[user_id][_eq]=${userId}&aggregate[count]=*`, {
        headers,
      }),
      fetch(`${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/user_prayer_day_completions?filter[user_id][_eq]=${userId}&sort=-completed_date&limit=100`, {
        headers,
      }),
      fetch(`${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/habits?filter[user_id][_eq]=${userId}&filter[is_active][_eq]=true`, {
        headers,
      }),
      fetch(`${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/habit_completions?filter[user_id][_eq]=${userId}&sort=-completed_date&limit=100`, {
        headers,
      }),
      fetch(`${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/user_achievements?filter[user_id][_eq]=${userId}&aggregate[sum]=points`, {
        headers,
      }),
    ]);

    const prayersData = await prayersRes.json();
    const streakData = await streakRes.json();
    const habitsData = await habitsRes.json();
    const habitCompletionsData = await habitCompletionsRes.json();
    const pointsData = await pointsRes.json();

    const totalPrayers = prayersData.data?.[0]?.count || 0;

    const prayerCompletions = streakData.data || [];
    const habitCompletions = habitCompletionsData.data || [];
    const streak = calculateStreakFromHabits(habitCompletions);

    const habits = habitsData.data || [];
    const today = new Date().toISOString().split('T')[0];
    
    const habitIdsCompletedToday = new Set(
      habitCompletions
        .filter((c: any) => new Date(c.completed_date).toISOString().split('T')[0] === today)
        .map((c: any) => c.habit_id)
    );
    const completedToday = habitIdsCompletedToday.size;

    const totalPoints = pointsData.data?.[0]?.sum?.points || 0;

    const todayCompletions = habitCompletions.filter((c: any) => {
      const completedDate = new Date(c.completed_date).toISOString().split('T')[0];
      return completedDate === today;
    }).length;

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekCompletions = habitCompletions.filter((c: any) => {
      const completedDate = new Date(c.completed_date);
      return completedDate >= weekStart;
    }).length;

    return {
      prayers: totalPrayers,
      streak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      dailyPracticeToday: completedToday,
      totalHabits: habits.length,
      points: totalPoints,
      todayProgress: todayCompletions,
      weeklyStreak: weekCompletions,
    };
  } catch (error) {
    console.error('Error fetching home stats:', error);
    throw new Error('Failed to fetch home statistics');
  }
});

function calculateStreakFromHabits(completions: any[]): { currentStreak: number; longestStreak: number } {
  if (!completions || completions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const sortedDates = completions
    .map((c: any) => new Date(c.completed_date).toISOString().split('T')[0])
    .filter((date, index, self) => self.indexOf(date) === index)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (sortedDates[0] === today || sortedDates[0] === yesterday) {
    currentStreak = 1;
    
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000);
      
      if (diffDays === 1) {
        currentStreak++;
        tempStreak++;
      } else {
        break;
      }
    }
  }

  tempStreak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000);
    
    if (diffDays === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak, 1);

  return { currentStreak, longestStreak };
}
