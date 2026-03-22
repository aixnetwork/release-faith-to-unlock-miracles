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
    user_id: {
      id: 'demo-user-family-custom',
      first_name: 'Prosper',
      last_name: 'Family'
    },
    date_created: new Date(Date.now() - 172800000).toISOString(),
    prayerCount: 3
  }
];

export async function mockFetch(url: string, options: RequestInit = {}): Promise<Response> {
  console.log('🛑 Intercepted by Mock API:', url);
  
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate latency

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

  // Prayers
  if (url.includes('/items/prayers')) {
    // PATCH (Update)
    if (options.method === 'PATCH') {
      return new Response(JSON.stringify({
        data: { id: url.split('/').pop(), ...JSON.parse(options.body as string || '{}') }
      }), { status: 200 });
    }
    
    // DELETE
    if (options.method === 'DELETE') {
      return new Response(null, { status: 204 });
    }
    
    // GET List
    const filter = url;
    let filteredPrayers = [...MOCK_PRAYERS];
    
    // Filter logic (simplified)
    if (filter.includes('answered][_eq]=1')) {
      filteredPrayers = filteredPrayers.filter(p => p.answered);
    } else if (filter.includes('answered][_eq]=false') || filter.includes('answered][_eq]=0')) {
      filteredPrayers = filteredPrayers.filter(p => !p.answered);
    }
    
    // Community filter
    if (filter.includes('shareOnWall][_eq]=1')) {
        // Just return all that are shared
        filteredPrayers = MOCK_PRAYERS.filter(p => p.shareOnWall);
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
        }), { status: 200 });
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
    }), { status: 200 });
  }

  // Groups
  if (url.includes('/items/groups')) {
    const isChurch = url.includes('organization_id][_eq]=900');
    
    return new Response(JSON.stringify({
      data: isChurch ? [
        {
          id: 10,
          name: 'Youth Group',
          description: 'Friday night youth ministry',
          memberCount: 45
        },
        {
          id: 11,
          name: 'Worship Team',
          description: 'Sunday worship leaders',
          memberCount: 12
        },
        {
          id: 12,
          name: 'Bible Study',
          description: 'Wednesday evening study',
          memberCount: 25
        }
      ] : [
        {
          id: 1,
          name: 'Family Group',
          description: 'Our family prayer group',
          memberCount: 4
        }
      ]
    }), { status: 200 });
  }

  // Testimonials
  if (url.includes('/items/testimonials')) {
    return new Response(JSON.stringify({
      data: []
    }), { status: 200 });
  }

  // Plans
  if (url.includes('/items/plans')) {
    const plansSuffix = url.split('/plans')[1] || '';
    const cleanSuffix = plansSuffix.split('?')[0];
    if (!cleanSuffix || cleanSuffix === '' || cleanSuffix === '/') {
      return new Response(JSON.stringify({
        data: [
          {
            id: 'small_church',
            name: 'Small Church',
            maxMembers: 250,
            description: 'Perfect for small congregations',
            features: {},
            period: 'month',
            price: 149
          },
          {
            id: 'large_church',
            name: 'Large Church',
            maxMembers: 10000,
            description: 'Complete church management solution',
            features: {},
            period: 'month',
            price: 499
          },
          {
            id: 'group_family',
            name: 'Family Plan',
            maxMembers: 10,
            description: 'Perfect for families',
            features: {},
            period: 'month',
            price: 9.99,
            status: 'published'
          }
        ]
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Mock check for different plans by ID
    if (url.includes('org_large') || url.includes('church') || url.includes('large_church')) {
        return new Response(JSON.stringify({
          data: {
            id: 'large_church',
            name: 'Large Church',
            maxMembers: 10000,
            description: 'Complete church management solution',
            features: {},
            period: 'monthly',
            price: 499
          }
        }), { status: 200 });
    }

    return new Response(JSON.stringify({
      data: {
        id: 'group_family',
        name: 'Family Plan',
        maxMembers: 10,
        description: 'Perfect for families',
        features: {},
        period: 'monthly',
        price: 9.99
      }
    }), { status: 200 });
  }

  // Comments
  if (url.includes('/items/prayer_comments')) {
    return new Response(JSON.stringify({
      data: {
        id: Math.random().toString(),
        ...JSON.parse(options.body as string || '{}'),
        date_created: new Date().toISOString()
      }
    }), { status: 200 });
  }

  // Default fallback for unhandled mock routes
  return new Response(JSON.stringify({ data: [] }), { status: 200 });
}
