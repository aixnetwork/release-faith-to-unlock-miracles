import { ENV } from '@/config/env';

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0];
const threeDaysAgo = new Date(Date.now() - 259200000).toISOString().split('T')[0];
const fourDaysAgo = new Date(Date.now() - 345600000).toISOString().split('T')[0];
const fiveDaysAgo = new Date(Date.now() - 432000000).toISOString().split('T')[0];
const sixDaysAgo = new Date(Date.now() - 518400000).toISOString().split('T')[0];

export const MOCK_PRAYERS = [
  {
    id: '1',
    title: 'Prayer for healing',
    content: 'Please pray for my recovery from surgery. The doctors say the procedure went well, but I need strength during recovery.',
    answered: false,
    category: 'health',
    shareOnWall: true,
    status: 'published',
    organization_id: 888,
    user_id: {
      id: 'demo-user-family-001',
      first_name: 'Sarah',
      last_name: 'Johnson'
    },
    date_created: new Date().toISOString(),
    prayerCount: 5
  },
  {
    id: '2',
    title: 'Job interview success',
    content: 'I had a big interview and got the job! God is faithful. Thank you all for your prayers and support during this time.',
    answered: true,
    category: 'work',
    shareOnWall: true,
    status: 'published',
    organization_id: 888,
    user_id: {
      id: 'member_2',
      first_name: 'John',
      last_name: 'Doe'
    },
    date_created: new Date(Date.now() - 86400000).toISOString(),
    date_updated: new Date().toISOString(),
    prayerCount: 12
  },
  {
    id: '3',
    title: 'Family protection',
    content: 'Praying for God\'s protection over my family as we travel for the holidays. Keep us safe on the road.',
    answered: false,
    category: 'family',
    shareOnWall: true,
    status: 'published',
    organization_id: 889,
    user_id: {
      id: 'demo-user-family-custom',
      first_name: 'Prosper',
      last_name: 'Family'
    },
    date_created: new Date(Date.now() - 172800000).toISOString(),
    prayerCount: 3
  },
  {
    id: '4',
    title: 'Guidance for my children',
    content: 'Lord, guide my children in their studies and friendships. Help them make wise decisions and stay close to You.',
    answered: false,
    category: 'family',
    shareOnWall: true,
    status: 'published',
    organization_id: 999,
    user_id: {
      id: 'demo-user-church-001',
      first_name: 'Pastor',
      last_name: 'Michael'
    },
    date_created: new Date(Date.now() - 259200000).toISOString(),
    prayerCount: 8
  },
  {
    id: '5',
    title: 'Strength during trials',
    content: 'Going through a difficult season at work. Pray for perseverance and wisdom as I navigate these challenges.',
    answered: false,
    category: 'spiritual',
    shareOnWall: true,
    status: 'published',
    organization_id: null,
    user_id: {
      id: 'demo-user-individual-001',
      first_name: 'John',
      last_name: 'Doe'
    },
    date_created: new Date(Date.now() - 43200000).toISOString(),
    prayerCount: 2
  },
  {
    id: '6',
    title: 'Thankful for community',
    content: 'God answered my prayer for finding a supportive faith community. So grateful for this group!',
    answered: true,
    category: 'spiritual',
    shareOnWall: true,
    status: 'published',
    organization_id: null,
    user_id: {
      id: 'demo-user-individual-001',
      first_name: 'John',
      last_name: 'Doe'
    },
    date_created: new Date(Date.now() - 432000000).toISOString(),
    date_updated: new Date(Date.now() - 86400000).toISOString(),
    prayerCount: 15
  },
  {
    id: '7',
    title: 'New baby on the way',
    content: 'We are expecting our third child! Please pray for a healthy pregnancy and delivery.',
    answered: false,
    category: 'family',
    shareOnWall: true,
    status: 'published',
    organization_id: 888,
    user_id: {
      id: 'member_3',
      first_name: 'Emily',
      last_name: 'Grace'
    },
    date_created: new Date(Date.now() - 345600000).toISOString(),
    prayerCount: 22
  },
];

const MOCK_COMMENTS: Record<string, any[]> = {
  '1': [
    {
      id: 'comment-1',
      prayer_id: '1',
      comments: 'Praying for your recovery! God is faithful.',
      date_created: new Date(Date.now() - 3600000).toISOString(),
      user_id: { id: 'member_2', first_name: 'John', last_name: 'Doe', email: 'john@example.com' },
      liked: 1,
      comment_id: null,
    },
    {
      id: 'comment-2',
      prayer_id: '1',
      comments: 'Lifting you up in prayer today.',
      date_created: new Date(Date.now() - 7200000).toISOString(),
      user_id: { id: 'demo-user-family-custom', first_name: 'Prosper', last_name: 'Family', email: 'family@gmail.com' },
      liked: 0,
      comment_id: null,
    },
    {
      id: 'comment-2a',
      prayer_id: '1',
      comments: 'Thank you so much for the prayers!',
      date_created: new Date(Date.now() - 1800000).toISOString(),
      user_id: { id: 'demo-user-family-001', first_name: 'Sarah', last_name: 'Johnson', email: 'sarah@example.com' },
      liked: 1,
      comment_id: 'comment-1',
    },
  ],
  '2': [
    {
      id: 'comment-3',
      prayer_id: '2',
      comments: 'Congratulations on the answered prayer! God is good!',
      date_created: new Date(Date.now() - 86400000).toISOString(),
      user_id: { id: 'demo-user-family-001', first_name: 'Sarah', last_name: 'Johnson', email: 'sarah@example.com' },
      liked: 1,
      comment_id: null,
    },
    {
      id: 'comment-4',
      prayer_id: '2',
      comments: 'So happy for you! What a blessing.',
      date_created: new Date(Date.now() - 43200000).toISOString(),
      user_id: { id: 'member_3', first_name: 'Emily', last_name: 'Grace', email: 'emily@example.com' },
      liked: 1,
      comment_id: null,
    },
  ],
  '3': [
    {
      id: 'comment-5',
      prayer_id: '3',
      comments: 'Safe travels! Praying for protection over your family.',
      date_created: new Date(Date.now() - 86400000).toISOString(),
      user_id: { id: 'demo-user-family-001', first_name: 'Sarah', last_name: 'Johnson', email: 'sarah@example.com' },
      liked: 0,
      comment_id: null,
    },
  ],
  '4': [
    {
      id: 'comment-6',
      prayer_id: '4',
      comments: 'Amen! Praying for wisdom for your children.',
      date_created: new Date(Date.now() - 172800000).toISOString(),
      user_id: { id: 'member_2', first_name: 'John', last_name: 'Doe', email: 'john@example.com' },
      liked: 1,
      comment_id: null,
    },
  ],
  '5': [],
  '6': [
    {
      id: 'comment-7',
      prayer_id: '6',
      comments: 'Praise God! So glad you found your community.',
      date_created: new Date(Date.now() - 259200000).toISOString(),
      user_id: { id: 'member_3', first_name: 'Emily', last_name: 'Grace', email: 'emily@example.com' },
      liked: 1,
      comment_id: null,
    },
  ],
  '7': [
    {
      id: 'comment-8',
      prayer_id: '7',
      comments: 'Congratulations! Praying for a healthy pregnancy!',
      date_created: new Date(Date.now() - 259200000).toISOString(),
      user_id: { id: 'demo-user-church-001', first_name: 'Pastor', last_name: 'Michael', email: 'pastor@gracechurch.com' },
      liked: 1,
      comment_id: null,
    },
    {
      id: 'comment-9',
      prayer_id: '7',
      comments: 'What wonderful news! God bless your growing family.',
      date_created: new Date(Date.now() - 172800000).toISOString(),
      user_id: { id: 'demo-user-family-001', first_name: 'Sarah', last_name: 'Johnson', email: 'sarah@example.com' },
      liked: 0,
      comment_id: null,
    },
  ],
};

const MOCK_HABITS = [
  {
    id: 'habit-1',
    name: 'Morning Prayer',
    description: 'Start each day with 10 minutes of prayer',
    user_id: 'demo-user-individual-001',
    is_active: true,
    frequency: 'daily',
    icon: 'heart',
    color: '#3B82F6',
    streak: 7,
    last_completed_date: new Date().toISOString(),
    date_created: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'habit-2',
    name: 'Bible Reading',
    description: 'Read at least one chapter daily',
    user_id: 'demo-user-individual-001',
    is_active: true,
    frequency: 'daily',
    icon: 'book',
    color: '#8B5CF6',
    streak: 5,
    last_completed_date: new Date().toISOString(),
    date_created: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
  {
    id: 'habit-3',
    name: 'Gratitude Journal',
    description: 'Write 3 things I\'m grateful for',
    user_id: 'demo-user-individual-001',
    is_active: true,
    frequency: 'daily',
    icon: 'star',
    color: '#F59E0B',
    streak: 3,
    last_completed_date: yesterday,
    date_created: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 'habit-4',
    name: 'Evening Meditation',
    description: 'End the day with peaceful reflection',
    user_id: 'demo-user-individual-001',
    is_active: true,
    frequency: 'daily',
    icon: 'moon',
    color: '#6366F1',
    streak: 2,
    last_completed_date: null,
    date_created: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
];

function generateHabitCompletions(): any[] {
  const completions: any[] = [];
  const habits = MOCK_HABITS;
  const dates = [today, yesterday, twoDaysAgo, threeDaysAgo, fourDaysAgo, fiveDaysAgo, sixDaysAgo];

  habits.forEach((habit) => {
    const completionCount = habit.id === 'habit-1' ? 7 : habit.id === 'habit-2' ? 5 : habit.id === 'habit-3' ? 3 : 2;
    for (let i = 0; i < Math.min(completionCount, dates.length); i++) {
      completions.push({
        id: `completion-${habit.id}-${i}`,
        habit_id: habit.id,
        user_id: habit.user_id,
        completed_date: new Date(`${dates[i]}T${10 + i}:00:00.000Z`).toISOString(),
      });
    }
  });

  return completions;
}

const MOCK_HABIT_COMPLETIONS = generateHabitCompletions();

const MOCK_ACHIEVEMENTS = [
  {
    id: 'ach-1',
    user_id: 'demo-user-individual-001',
    achievement_name: 'Prayer Warrior',
    description: 'Prayed for 7 consecutive days',
    points: 50,
    earned_date: new Date(Date.now() - 86400000).toISOString(),
    icon: 'shield',
  },
  {
    id: 'ach-2',
    user_id: 'demo-user-individual-001',
    achievement_name: 'First Steps',
    description: 'Completed your first prayer request',
    points: 25,
    earned_date: new Date(Date.now() - 604800000).toISOString(),
    icon: 'star',
  },
  {
    id: 'ach-3',
    user_id: 'demo-user-individual-001',
    achievement_name: 'Community Builder',
    description: 'Shared 5 prayers on the prayer wall',
    points: 75,
    earned_date: new Date(Date.now() - 172800000).toISOString(),
    icon: 'users',
  },
];

function extractPrayerIdFromUrl(url: string): string | null {
  const prayersPath = url.split('/items/prayers/')[1];
  if (!prayersPath) return null;
  const id = prayersPath.split('?')[0];
  return id && id.length > 0 && !id.includes('&') ? id : null;
}

function extractCommentPrayerIdFilter(url: string): string | null {
  const match = url.match(/filter\[prayer_id\]\[_eq\]=(\w+)/);
  return match ? match[1] : null;
}

function extractUserIdFilter(url: string): string | null {
  const match = url.match(/filter\[user_id\]\[_eq\]=([^&]+)/);
  return match ? match[1] : null;
}

function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function mockFetch(url: string, options: RequestInit = {}): Promise<Response> {
  console.log('🛑 Intercepted by Mock API:', url, options.method || 'GET');

  await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));

  const method = (options.method || 'GET').toUpperCase();

  if (url.includes('/items/organization_users')) {
    const isOrganizer = url.includes('filter[user_id][_eq]=demo-user-family') || url.includes('filter[user_id][_eq]=demo-user-church');

    return jsonResponse({
      data: isOrganizer ? [{
        role_id: ENV.EXPO_PUBLIC_DIRECTUS_ORGANIZER_ROLE_ID
      }] : []
    });
  }

  if (url.includes('/items/prayer_comments')) {
    if (method === 'POST') {
      const body = JSON.parse(options.body as string || '{}');
      const newComment = {
        id: `comment-${Date.now()}`,
        ...body,
        date_created: new Date().toISOString(),
        user_id: body.user_id ? {
          id: body.user_id,
          first_name: 'Demo',
          last_name: 'User',
          email: 'demo@example.com',
        } : null,
      };
      const prayerId = body.prayer_id;
      if (prayerId && MOCK_COMMENTS[prayerId]) {
        MOCK_COMMENTS[prayerId].push(newComment);
      } else if (prayerId) {
        MOCK_COMMENTS[prayerId] = [newComment];
      }
      return jsonResponse({ data: newComment });
    }

    if (method === 'PATCH') {
      const commentId = url.split('/prayer_comments/')[1]?.split('?')[0];
      const body = JSON.parse(options.body as string || '{}');
      return jsonResponse({ data: { id: commentId, ...body } });
    }

    if (url.includes('aggregate[count]')) {
      const prayerId = extractCommentPrayerIdFilter(url);
      const comments = prayerId ? (MOCK_COMMENTS[prayerId] || []) : [];
      return jsonResponse({ data: [{ count: { id: comments.length } }] });
    }

    const prayerId = extractCommentPrayerIdFilter(url);
    if (prayerId) {
      const comments = MOCK_COMMENTS[prayerId] || [];
      return jsonResponse({ data: comments });
    }

    return jsonResponse({ data: [] });
  }

  if (url.includes('/items/prayers')) {
    if (method === 'PATCH') {
      const prayerId = extractPrayerIdFromUrl(url);
      const body = JSON.parse(options.body as string || '{}');
      const prayer = MOCK_PRAYERS.find(p => p.id === prayerId);
      if (prayer) {
        Object.assign(prayer, body);
      }
      return jsonResponse({ data: { id: prayerId, ...body } });
    }

    if (method === 'POST') {
      const body = JSON.parse(options.body as string || '{}');
      const newPrayer = {
        id: `prayer-${Date.now()}`,
        ...body,
        date_created: new Date().toISOString(),
        prayerCount: 0,
        user_id: {
          id: body.user_id,
          first_name: 'Demo',
          last_name: 'User',
        },
      };
      MOCK_PRAYERS.push(newPrayer as any);
      return jsonResponse({ data: newPrayer });
    }

    if (method === 'DELETE') {
      const prayerId = extractPrayerIdFromUrl(url);
      const idx = MOCK_PRAYERS.findIndex(p => p.id === prayerId);
      if (idx >= 0) MOCK_PRAYERS.splice(idx, 1);
      return new Response(null, { status: 204 });
    }

    if (url.includes('aggregate[count]')) {
      const userId = extractUserIdFilter(url);
      const filtered = userId ? MOCK_PRAYERS.filter(p => {
        const pUserId = typeof p.user_id === 'string' ? p.user_id : p.user_id?.id;
        return pUserId === userId;
      }) : MOCK_PRAYERS;
      return jsonResponse({ data: [{ count: { id: filtered.length } }] });
    }

    const singlePrayerId = extractPrayerIdFromUrl(url);
    if (singlePrayerId) {
      const prayer = MOCK_PRAYERS.find(p => p.id === singlePrayerId);
      if (prayer) {
        return jsonResponse({ data: prayer });
      }
      return jsonResponse({ data: null }, 404);
    }

    let filteredPrayers = [...MOCK_PRAYERS];
    const userId = extractUserIdFilter(url);

    if (url.includes('answered][_eq]=1') || url.includes('is_answered][_eq]=true')) {
      filteredPrayers = filteredPrayers.filter(p => p.answered);
    } else if (url.includes('answered][_eq]=false') || url.includes('answered][_eq]=0')) {
      filteredPrayers = filteredPrayers.filter(p => !p.answered);
    }

    if (url.includes('shareOnWall][_eq]=1')) {
      filteredPrayers = filteredPrayers.filter(p => p.shareOnWall);
    }

    if (userId && !url.includes('shareOnWall][_eq]=1')) {
      filteredPrayers = filteredPrayers.filter(p => {
        const pUserId = typeof p.user_id === 'string' ? p.user_id : p.user_id?.id;
        return pUserId === userId;
      });
    }

    return jsonResponse({ data: filteredPrayers });
  }

  if (url.includes('/items/organizations')) {
    if (url.includes('/900') || url.includes('demo-user-church-custom')) {
      return jsonResponse({
        data: [{
          id: 900,
          name: 'Prosper Church',
          city: 'Austin',
          status: 'active',
          organizer_id: 'demo-user-church-custom',
          plan: 'org_large',
          maxMembers: 500,
          date_created: new Date().toISOString()
        }]
      });
    }
    if (url.includes('/999') || url.includes('demo-user-church-001')) {
      return jsonResponse({
        data: [{
          id: 999,
          name: 'Grace Community Church',
          city: 'Austin',
          status: 'active',
          organizer_id: 'demo-user-church-001',
          plan: 'large_church',
          maxMembers: 999999,
          date_created: new Date().toISOString()
        }]
      });
    }

    return jsonResponse({
      data: [{
        id: 889,
        name: 'Johnson Family',
        city: 'Austin',
        status: 'active',
        organizer_id: 'demo-user-family-001',
        plan: 'group_family',
        maxMembers: 10,
        date_created: new Date().toISOString()
      }]
    });
  }

  if (url.includes('/items/groups')) {
    const isChurch = url.includes('organization_id][_eq]=900') || url.includes('organization_id][_eq]=999');

    return jsonResponse({
      data: isChurch ? [
        { id: 10, name: 'Youth Group', description: 'Friday night youth ministry', memberCount: 45 },
        { id: 11, name: 'Worship Team', description: 'Sunday worship leaders', memberCount: 12 },
        { id: 12, name: 'Bible Study', description: 'Wednesday evening study', memberCount: 25 },
        { id: 13, name: 'Prayer Warriors', description: 'Dedicated intercessory prayer team', memberCount: 18 },
      ] : [
        { id: 1, name: 'Family Group', description: 'Our family prayer group', memberCount: 4 },
        { id: 2, name: 'Extended Family', description: 'Grandparents and extended family', memberCount: 8 },
      ]
    });
  }

  if (url.includes('/items/testimonials')) {
    if (method === 'POST') {
      const body = JSON.parse(options.body as string || '{}');
      return jsonResponse({
        data: { id: `testimonial-${Date.now()}`, ...body, date_created: new Date().toISOString() }
      });
    }
    return jsonResponse({
      data: [
        {
          id: 'test-1',
          title: 'God healed my marriage',
          content: 'After months of prayer and counseling, my spouse and I reconciled. God is so faithful!',
          user_id: { id: 'member_2', first_name: 'John', last_name: 'Doe' },
          category: 'healing',
          date_created: new Date(Date.now() - 259200000).toISOString(),
          likes: 24,
        },
        {
          id: 'test-2',
          title: 'Financial breakthrough',
          content: 'I was struggling to pay my bills, and God opened an unexpected door. A new job with better pay came through just in time.',
          user_id: { id: 'member_3', first_name: 'Emily', last_name: 'Grace' },
          category: 'provision',
          date_created: new Date(Date.now() - 518400000).toISOString(),
          likes: 18,
        },
      ]
    });
  }

  if (url.includes('/items/plans')) {
    const plansSuffix = url.split('/plans')[1] || '';
    const cleanSuffix = plansSuffix.split('?')[0];
    if (!cleanSuffix || cleanSuffix === '' || cleanSuffix === '/') {
      return jsonResponse({
        data: [
          { id: 'individual', name: 'Individual', maxMembers: 1, description: 'Personal spiritual growth tools', features: {}, period: 'month', price: 4.99, status: 'published' },
          { id: 'group_family', name: 'Family Plan', maxMembers: 10, description: 'Perfect for families', features: {}, period: 'month', price: 9.99, status: 'published' },
          { id: 'small_church', name: 'Small Church', maxMembers: 250, description: 'Perfect for small congregations', features: {}, period: 'month', price: 149, status: 'published' },
          { id: 'large_church', name: 'Large Church', maxMembers: 10000, description: 'Complete church management solution', features: {}, period: 'month', price: 499, status: 'published' },
        ]
      });
    }

    if (url.includes('org_large') || url.includes('church') || url.includes('large_church')) {
      return jsonResponse({
        data: { id: 'large_church', name: 'Large Church', maxMembers: 10000, description: 'Complete church management solution', features: {}, period: 'monthly', price: 499 }
      });
    }

    return jsonResponse({
      data: { id: 'group_family', name: 'Family Plan', maxMembers: 10, description: 'Perfect for families', features: {}, period: 'monthly', price: 9.99 }
    });
  }

  if (url.includes('/items/habits')) {
    if (method === 'POST') {
      const body = JSON.parse(options.body as string || '{}');
      const newHabit = {
        id: `habit-${Date.now()}`,
        ...body,
        is_active: true,
        streak: 0,
        last_completed_date: null,
        date_created: new Date().toISOString(),
      };
      MOCK_HABITS.push(newHabit);
      return jsonResponse({ data: newHabit });
    }
    if (method === 'PATCH') {
      const body = JSON.parse(options.body as string || '{}');
      const habitId = url.split('/habits/')[1]?.split('?')[0];
      const habit = MOCK_HABITS.find(h => h.id === habitId);
      if (habit) Object.assign(habit, body);
      return jsonResponse({ data: { id: habitId, ...body } });
    }
    if (method === 'DELETE') {
      return new Response(null, { status: 204 });
    }

    const userId = extractUserIdFilter(url);
    let habits = [...MOCK_HABITS];
    if (userId) {
      habits = habits.filter(h => h.user_id === userId);
    }
    if (url.includes('is_active][_eq]=true')) {
      habits = habits.filter(h => h.is_active);
    }
    return jsonResponse({ data: habits });
  }

  if (url.includes('/items/habit_completions')) {
    if (method === 'POST') {
      const body = JSON.parse(options.body as string || '{}');
      const newCompletion = {
        id: `completion-${Date.now()}`,
        ...body,
        completed_date: body.completed_date || new Date().toISOString(),
      };
      MOCK_HABIT_COMPLETIONS.push(newCompletion);
      return jsonResponse({ data: newCompletion });
    }
    if (method === 'DELETE') {
      return new Response(null, { status: 204 });
    }

    const userId = extractUserIdFilter(url);
    let completions = [...MOCK_HABIT_COMPLETIONS];
    if (userId) {
      completions = completions.filter(c => c.user_id === userId);
    }
    completions.sort((a, b) => new Date(b.completed_date).getTime() - new Date(a.completed_date).getTime());
    return jsonResponse({ data: completions });
  }

  if (url.includes('/items/user_achievements')) {
    if (url.includes('aggregate[sum]')) {
      return jsonResponse({
        data: [{ sum: { points: 450 } }]
      });
    }

    const userId = extractUserIdFilter(url);
    let achievements = [...MOCK_ACHIEVEMENTS];
    if (userId) {
      achievements = achievements.filter(a => a.user_id === userId);
    }
    achievements.sort((a, b) => new Date(b.earned_date).getTime() - new Date(a.earned_date).getTime());
    return jsonResponse({ data: achievements });
  }

  if (url.includes('/items/user_prayer_day_completions')) {
    if (method === 'POST') {
      const body = JSON.parse(options.body as string || '{}');
      return jsonResponse({ data: { id: `pdc-${Date.now()}`, ...body } });
    }

    const completions = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(Date.now() - i * 86400000);
      completions.push({
        id: `pdc-${i}`,
        user_id: 'demo-user-individual-001',
        completed_date: d.toISOString(),
        prayer_plan_id: 'plan-1',
        day_number: 7 - i,
      });
    }
    return jsonResponse({ data: completions });
  }

  if (url.includes('/items/user_prayer_plan_progress')) {
    if (method === 'POST') {
      const body = JSON.parse(options.body as string || '{}');
      return jsonResponse({ data: { id: `progress-${Date.now()}`, ...body } });
    }
    if (method === 'PATCH') {
      const body = JSON.parse(options.body as string || '{}');
      return jsonResponse({ data: { id: url.split('/').pop()?.split('?')[0], ...body } });
    }
    return jsonResponse({ data: [] });
  }

  if (url.includes('/items/prayer_plans')) {
    if (method === 'POST') {
      const body = JSON.parse(options.body as string || '{}');
      return jsonResponse({ data: { id: `plan-${Date.now()}`, ...body, date_created: new Date().toISOString() } });
    }
    return jsonResponse({
      data: [
        {
          id: 'plan-1',
          title: '7 Days of Gratitude',
          description: 'A week-long journey exploring thankfulness and praise',
          total_days: 7,
          category: 'gratitude',
          difficulty: 'beginner',
          image_url: null,
          date_created: new Date(Date.now() - 30 * 86400000).toISOString(),
          status: 'published',
        },
        {
          id: 'plan-2',
          title: '21 Days of Faith',
          description: 'Strengthen your faith through daily scripture meditation',
          total_days: 21,
          category: 'faith',
          difficulty: 'intermediate',
          image_url: null,
          date_created: new Date(Date.now() - 60 * 86400000).toISOString(),
          status: 'published',
        },
        {
          id: 'plan-3',
          title: '30 Days of Prayer',
          description: 'Deepen your prayer life with guided daily prayers',
          total_days: 30,
          category: 'prayer',
          difficulty: 'advanced',
          image_url: null,
          date_created: new Date(Date.now() - 90 * 86400000).toISOString(),
          status: 'published',
        },
      ]
    });
  }

  if (url.includes('/items/prayer_days')) {
    if (method === 'POST') {
      const body = JSON.parse(options.body as string || '{}');
      return jsonResponse({ data: { id: `day-${Date.now()}`, ...body } });
    }
    return jsonResponse({
      data: [
        { id: 'day-1', prayer_plan_id: 'plan-1', day_number: 1, title: 'The Gift of Today', scripture: 'Psalm 118:24', content: 'This is the day the Lord has made; let us rejoice and be glad in it.', prayer_prompt: 'Thank God for the gift of this new day.' },
        { id: 'day-2', prayer_plan_id: 'plan-1', day_number: 2, title: 'Grateful Heart', scripture: '1 Thessalonians 5:18', content: 'Give thanks in all circumstances; for this is God\'s will for you in Christ Jesus.', prayer_prompt: 'List 5 things you are grateful for today.' },
        { id: 'day-3', prayer_plan_id: 'plan-1', day_number: 3, title: 'Counting Blessings', scripture: 'James 1:17', content: 'Every good and perfect gift is from above, coming down from the Father of the heavenly lights.', prayer_prompt: 'Reflect on the blessings God has given you this week.' },
      ]
    });
  }

  if (url.includes('/items/services')) {
    if (method === 'POST') {
      const body = JSON.parse(options.body as string || '{}');
      return jsonResponse({ data: { id: `service-${Date.now()}`, ...body, date_created: new Date().toISOString() } });
    }
    if (method === 'PATCH') {
      const body = JSON.parse(options.body as string || '{}');
      return jsonResponse({ data: { id: url.split('/').pop()?.split('?')[0], ...body } });
    }
    return jsonResponse({
      data: [
        {
          id: 'svc-1',
          title: 'Marriage Counseling',
          description: 'Faith-based marriage counseling with certified professionals',
          provider_name: 'Grace Counseling Center',
          service_type: 1,
          price: 75,
          rating: 4.8,
          reviews_count: 24,
          status: 'published',
          date_created: new Date(Date.now() - 30 * 86400000).toISOString(),
        },
        {
          id: 'svc-2',
          title: 'Worship Music Lessons',
          description: 'Learn guitar, piano, and vocals for worship leading',
          provider_name: 'Harmony Music Academy',
          service_type: 2,
          price: 45,
          rating: 4.9,
          reviews_count: 31,
          status: 'published',
          date_created: new Date(Date.now() - 45 * 86400000).toISOString(),
        },
        {
          id: 'svc-3',
          title: 'Bible Study Leadership Training',
          description: 'Learn to lead effective and engaging Bible study groups',
          provider_name: 'Discipleship Institute',
          service_type: 3,
          price: 120,
          rating: 4.7,
          reviews_count: 15,
          status: 'published',
          date_created: new Date(Date.now() - 60 * 86400000).toISOString(),
        },
      ]
    });
  }

  if (url.includes('/items/service_types')) {
    return jsonResponse({
      data: [
        { id: 1, name: 'Counseling', icon: 'heart', sort: 1 },
        { id: 2, name: 'Music', icon: 'music', sort: 2 },
        { id: 3, name: 'Teaching', icon: 'book', sort: 3 },
        { id: 4, name: 'Youth Ministry', icon: 'users', sort: 4 },
      ]
    });
  }

  if (url.includes('/users')) {
    if (url.includes('aggregate[countDistinct]')) {
      return jsonResponse({ data: [{ countDistinct: { id: 147 } }] });
    }
    return jsonResponse({ data: [] });
  }

  if (url.includes('/items/meetings')) {
    if (method === 'POST') {
      const body = JSON.parse(options.body as string || '{}');
      return jsonResponse({ data: { id: `meeting-${Date.now()}`, ...body, date_created: new Date().toISOString() } });
    }
    return jsonResponse({
      data: [
        {
          id: 'meeting-1',
          title: 'Sunday Morning Worship',
          description: 'Weekly worship service with praise, prayer and teaching',
          date: new Date(Date.now() + 3 * 86400000).toISOString(),
          location: 'Main Sanctuary',
          organizer_id: 'demo-user-church-001',
          status: 'scheduled',
          attendees_count: 85,
        },
        {
          id: 'meeting-2',
          title: 'Wednesday Bible Study',
          description: 'Midweek study through the book of Psalms',
          date: new Date(Date.now() + 5 * 86400000).toISOString(),
          location: 'Fellowship Hall',
          organizer_id: 'demo-user-church-001',
          status: 'scheduled',
          attendees_count: 32,
        },
      ]
    });
  }

  if (url.includes('/items/content')) {
    return jsonResponse({
      data: [
        {
          id: 'content-1',
          title: 'Understanding Grace',
          body: 'An in-depth look at what grace means for believers today...',
          category: 'theology',
          author: 'Pastor Michael',
          date_created: new Date(Date.now() - 86400000).toISOString(),
          status: 'published',
        },
        {
          id: 'content-2',
          title: 'The Power of Worship',
          body: 'How worship transforms our perspective and draws us closer to God...',
          category: 'worship',
          author: 'Sarah Johnson',
          date_created: new Date(Date.now() - 259200000).toISOString(),
          status: 'published',
        },
      ]
    });
  }

  if (url.includes('/auth/login') || url.includes('/auth/refresh')) {
    return jsonResponse({
      data: {
        access_token: `demo-token-${Date.now()}`,
        refresh_token: `demo-refresh-${Date.now()}`,
        expires: 900000,
      }
    });
  }

  console.log('Mock API - Unhandled route:', url);
  return jsonResponse({ data: [] });
}
