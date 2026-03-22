import { ENV } from '@/config/env';

export const MOCK_PRAYERS = [
  {
    id: '1',
    title: 'Prayer for healing',
    content: 'Please pray for my recovery from surgery.',
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
    title: 'Job interview',
    content: 'I have a big interview tomorrow. Pray for wisdom.',
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
    prayerCount: 12
  },
  {
    id: '3',
    title: 'Family protection',
    content: 'Praying for God\'s protection over my family.',
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
  }
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
  ],
  '2': [
    {
      id: 'comment-3',
      prayer_id: '2',
      comments: 'Congratulations on the answered prayer!',
      date_created: new Date(Date.now() - 86400000).toISOString(),
      user_id: { id: 'demo-user-family-001', first_name: 'Sarah', last_name: 'Johnson', email: 'sarah@example.com' },
      liked: 1,
      comment_id: null,
    },
  ],
  '3': [],
};

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

export async function mockFetch(url: string, options: RequestInit = {}): Promise<Response> {
  console.log('🛑 Intercepted by Mock API:', url, options.method || 'GET');
  
  await new Promise(resolve => setTimeout(resolve, 300));

  const method = (options.method || 'GET').toUpperCase();

  // Organization Users / Roles
  if (url.includes('/items/organization_users')) {
    const isOrganizer = url.includes('filter[user_id][_eq]=demo-user-family') || url.includes('filter[user_id][_eq]=demo-user-church');
    
    return new Response(JSON.stringify({
      data: isOrganizer ? [{
        role_id: ENV.EXPO_PUBLIC_DIRECTUS_ORGANIZER_ROLE_ID
      }] : []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Prayer Comments - must be checked BEFORE prayers to avoid /items/prayers matching
  if (url.includes('/items/prayer_comments')) {
    // POST - Create comment
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
      return new Response(JSON.stringify({ data: newComment }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // PATCH - Update comment (like/unlike)
    if (method === 'PATCH') {
      const commentId = url.split('/prayer_comments/')[1]?.split('?')[0];
      const body = JSON.parse(options.body as string || '{}');
      return new Response(JSON.stringify({
        data: { id: commentId, ...body }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // GET - Aggregate count
    if (url.includes('aggregate[count]')) {
      const prayerId = extractCommentPrayerIdFilter(url);
      const comments = prayerId ? (MOCK_COMMENTS[prayerId] || []) : [];
      return new Response(JSON.stringify({
        data: [{ count: { id: comments.length } }]
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // GET - List comments for a prayer
    const prayerId = extractCommentPrayerIdFilter(url);
    if (prayerId) {
      const comments = MOCK_COMMENTS[prayerId] || [];
      return new Response(JSON.stringify({ data: comments }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ data: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Prayers
  if (url.includes('/items/prayers')) {
    // PATCH (Update)
    if (method === 'PATCH') {
      const prayerId = extractPrayerIdFromUrl(url);
      const body = JSON.parse(options.body as string || '{}');
      const prayer = MOCK_PRAYERS.find(p => p.id === prayerId);
      if (prayer) {
        Object.assign(prayer, body);
      }
      return new Response(JSON.stringify({
        data: { id: prayerId, ...body }
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    
    // POST (Create)
    if (method === 'POST') {
      const body = JSON.parse(options.body as string || '{}');
      const newPrayer = {
        id: `prayer-${Date.now()}`,
        ...body,
        date_created: new Date().toISOString(),
        prayerCount: 0,
      };
      MOCK_PRAYERS.push(newPrayer as any);
      return new Response(JSON.stringify({ data: newPrayer }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // DELETE
    if (method === 'DELETE') {
      return new Response(null, { status: 204 });
    }

    // GET - Aggregate count
    if (url.includes('aggregate[count]')) {
      return new Response(JSON.stringify({
        data: [{ count: { id: MOCK_PRAYERS.length } }]
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    
    // GET - Single prayer by ID
    const singlePrayerId = extractPrayerIdFromUrl(url);
    if (singlePrayerId) {
      const prayer = MOCK_PRAYERS.find(p => p.id === singlePrayerId);
      if (prayer) {
        return new Response(JSON.stringify({ data: prayer }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({ data: null }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // GET - List with filters
    let filteredPrayers = [...MOCK_PRAYERS];
    
    if (url.includes('answered][_eq]=1')) {
      filteredPrayers = filteredPrayers.filter(p => p.answered);
    } else if (url.includes('answered][_eq]=false') || url.includes('answered][_eq]=0')) {
      filteredPrayers = filteredPrayers.filter(p => !p.answered);
    }
    
    if (url.includes('shareOnWall][_eq]=1')) {
      filteredPrayers = MOCK_PRAYERS.filter(p => p.shareOnWall);
    }

    if (url.includes('is_answered][_eq]=true')) {
      filteredPrayers = filteredPrayers.filter(p => p.answered);
    }

    return new Response(JSON.stringify({
      data: filteredPrayers
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Organizations
  if (url.includes('/items/organizations')) {
    if (url.includes('/900') || url.includes('demo-user-church-custom')) {
      return new Response(JSON.stringify({
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
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({
      data: [{
        id: 889,
        name: 'Prosper Family',
        city: 'Austin',
        status: 'active',
        organizer_id: 'demo-user-family-custom',
        plan: 'group_family',
        maxMembers: 10,
        date_created: new Date().toISOString()
      }]
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  // Groups
  if (url.includes('/items/groups')) {
    const isChurch = url.includes('organization_id][_eq]=900');
    
    return new Response(JSON.stringify({
      data: isChurch ? [
        { id: 10, name: 'Youth Group', description: 'Friday night youth ministry', memberCount: 45 },
        { id: 11, name: 'Worship Team', description: 'Sunday worship leaders', memberCount: 12 },
        { id: 12, name: 'Bible Study', description: 'Wednesday evening study', memberCount: 25 }
      ] : [
        { id: 1, name: 'Family Group', description: 'Our family prayer group', memberCount: 4 }
      ]
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  // Testimonials
  if (url.includes('/items/testimonials')) {
    if (method === 'POST') {
      const body = JSON.parse(options.body as string || '{}');
      return new Response(JSON.stringify({
        data: { id: `testimonial-${Date.now()}`, ...body, date_created: new Date().toISOString() }
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ data: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Plans
  if (url.includes('/items/plans')) {
    const plansSuffix = url.split('/plans')[1] || '';
    const cleanSuffix = plansSuffix.split('?')[0];
    if (!cleanSuffix || cleanSuffix === '' || cleanSuffix === '/') {
      return new Response(JSON.stringify({
        data: [
          { id: 'small_church', name: 'Small Church', maxMembers: 250, description: 'Perfect for small congregations', features: {}, period: 'month', price: 149, status: 'published' },
          { id: 'large_church', name: 'Large Church', maxMembers: 10000, description: 'Complete church management solution', features: {}, period: 'month', price: 499, status: 'published' },
          { id: 'group_family', name: 'Family Plan', maxMembers: 10, description: 'Perfect for families', features: {}, period: 'month', price: 9.99, status: 'published' }
        ]
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    if (url.includes('org_large') || url.includes('church') || url.includes('large_church')) {
      return new Response(JSON.stringify({
        data: { id: 'large_church', name: 'Large Church', maxMembers: 10000, description: 'Complete church management solution', features: {}, period: 'monthly', price: 499 }
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({
      data: { id: 'group_family', name: 'Family Plan', maxMembers: 10, description: 'Perfect for families', features: {}, period: 'monthly', price: 9.99 }
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  // Habits
  if (url.includes('/items/habits')) {
    if (method === 'POST') {
      const body = JSON.parse(options.body as string || '{}');
      return new Response(JSON.stringify({
        data: { id: `habit-${Date.now()}`, ...body, date_created: new Date().toISOString() }
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (method === 'PATCH') {
      const body = JSON.parse(options.body as string || '{}');
      return new Response(JSON.stringify({
        data: { id: url.split('/').pop()?.split('?')[0], ...body }
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (method === 'DELETE') {
      return new Response(null, { status: 204 });
    }
    return new Response(JSON.stringify({ data: [] }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  }

  // Habit Completions
  if (url.includes('/items/habit_completions')) {
    if (method === 'POST') {
      const body = JSON.parse(options.body as string || '{}');
      return new Response(JSON.stringify({
        data: { id: `completion-${Date.now()}`, ...body }
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (method === 'DELETE') {
      return new Response(null, { status: 204 });
    }
    return new Response(JSON.stringify({ data: [] }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  }

  // User achievements / points
  if (url.includes('/items/user_achievements')) {
    if (url.includes('aggregate[sum]')) {
      return new Response(JSON.stringify({
        data: [{ sum: { points: 150 } }]
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ data: [] }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  }

  // Prayer day completions
  if (url.includes('/items/user_prayer_day_completions')) {
    if (method === 'POST') {
      const body = JSON.parse(options.body as string || '{}');
      return new Response(JSON.stringify({
        data: { id: `pdc-${Date.now()}`, ...body }
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ data: [] }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  }

  // Prayer plan progress
  if (url.includes('/items/user_prayer_plan_progress')) {
    if (method === 'POST') {
      const body = JSON.parse(options.body as string || '{}');
      return new Response(JSON.stringify({
        data: { id: `progress-${Date.now()}`, ...body }
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (method === 'PATCH') {
      const body = JSON.parse(options.body as string || '{}');
      return new Response(JSON.stringify({
        data: { id: url.split('/').pop()?.split('?')[0], ...body }
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ data: [] }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  }

  // Prayer plans
  if (url.includes('/items/prayer_plans')) {
    if (method === 'POST') {
      const body = JSON.parse(options.body as string || '{}');
      return new Response(JSON.stringify({
        data: { id: `plan-${Date.now()}`, ...body, date_created: new Date().toISOString() }
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ data: [] }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  }

  // Prayer days
  if (url.includes('/items/prayer_days')) {
    if (method === 'POST') {
      const body = JSON.parse(options.body as string || '{}');
      return new Response(JSON.stringify({
        data: { id: `day-${Date.now()}`, ...body }
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ data: [] }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  }

  // Services
  if (url.includes('/items/services')) {
    if (method === 'POST') {
      const body = JSON.parse(options.body as string || '{}');
      return new Response(JSON.stringify({
        data: { id: `service-${Date.now()}`, ...body, date_created: new Date().toISOString() }
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (method === 'PATCH') {
      const body = JSON.parse(options.body as string || '{}');
      return new Response(JSON.stringify({
        data: { id: url.split('/').pop()?.split('?')[0], ...body }
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ data: [] }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  }

  // Service types
  if (url.includes('/items/service_types')) {
    return new Response(JSON.stringify({
      data: [
        { id: 1, name: 'Counseling', icon: 'heart', sort: 1 },
        { id: 2, name: 'Music', icon: 'music', sort: 2 },
        { id: 3, name: 'Teaching', icon: 'book', sort: 3 },
      ]
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  // Users endpoint
  if (url.includes('/users')) {
    if (url.includes('aggregate[countDistinct]')) {
      return new Response(JSON.stringify({
        data: [{ countDistinct: { id: 25 } }]
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ data: [] }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  }

  // Default fallback for unhandled mock routes
  console.log('⚠️ Unhandled mock route:', url);
  return new Response(JSON.stringify({ data: [] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
