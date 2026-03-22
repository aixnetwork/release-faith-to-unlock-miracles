import { protectedProcedure } from '../../../trpc';
import { ENV } from '@/config/env';

export const getRecentActivityProcedure = protectedProcedure.query(async ({ ctx }) => {
  const userId = ctx.user?.id;
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ctx.user.accessToken}`,
    };

    const [prayersRes, habitsRes, achievementsRes] = await Promise.all([
      fetch(`${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayers?filter[user_id][_eq]=${userId}&filter[is_answered][_eq]=true&sort=-date_created&limit=5`, {
        headers,
      }),
      fetch(`${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/habits?filter[user_id][_eq]=${userId}&filter[is_active][_eq]=true&sort=-last_completed_date&limit=5`, {
        headers,
      }),
      fetch(`${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/user_achievements?filter[user_id][_eq]=${userId}&sort=-earned_date&limit=5`, {
        headers,
      }),
    ]);

    const prayersData = await prayersRes.json();
    const habitsData = await habitsRes.json();
    const achievementsData = await achievementsRes.json();

    const activities: any[] = [];

    (prayersData.data || []).forEach((prayer: any) => {
      activities.push({
        type: 'prayer_answered',
        title: 'Prayer answered',
        description: prayer.title,
        time: prayer.date_created,
        icon: 'heart',
      });
    });

    (habitsData.data || []).forEach((habit: any) => {
      if (habit.last_completed_date) {
        activities.push({
          type: 'habit_completed',
          title: 'Habit completed',
          description: habit.name,
          time: habit.last_completed_date,
          icon: 'target',
        });
      }
    });

    (achievementsData.data || []).forEach((achievement: any) => {
      activities.push({
        type: 'achievement_unlocked',
        title: 'Achievement unlocked',
        description: achievement.achievement_name || 'New achievement',
        time: achievement.earned_date,
        icon: 'trophy',
      });
    });

    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return activities.slice(0, 10);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
});
