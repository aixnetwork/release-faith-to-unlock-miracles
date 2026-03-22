import { z } from 'zod';
import { publicProcedure } from '../../../trpc';

const getGroupsSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(50).default(20),
  offset: z.number().min(0).default(0),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

// Helper to calculate distance in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export const getGroupsProcedure = publicProcedure
  .input(getGroupsSchema)
  .query(async ({ input }) => {
    
    // Mock groups data with locations
    // Locations are scattered around major US cities for demo
    const mockGroups = [
      {
        id: '1',
        title: 'Daily Prayer Circle',
        description: 'Join us for daily prayer and spiritual encouragement',
        memberCount: 45,
        messageCount: 234,
        lastActivity: '2 minutes ago',
        isPrivate: false,
        category: 'prayer',
        tags: ['prayer', 'daily', 'community'],
        creator: 'Pastor John',
        isJoined: true,
        isActive: true,
        location: { lat: 40.7128, lng: -74.0060, address: 'New York, NY' },
      },
      {
        id: '2',
        title: 'Youth Bible Study',
        description: 'Weekly Bible study for young adults and teens',
        memberCount: 28,
        messageCount: 156,
        lastActivity: '15 minutes ago',
        isPrivate: false,
        category: 'youth',
        tags: ['youth', 'bible-study', 'teens'],
        creator: 'Sarah M.',
        isJoined: false,
        isActive: true,
        location: { lat: 34.0522, lng: -118.2437, address: 'Los Angeles, CA' },
      },
      {
        id: '3',
        title: 'Worship Team Discussion',
        description: 'Private group for worship team coordination',
        memberCount: 12,
        messageCount: 89,
        lastActivity: '1 hour ago',
        isPrivate: true,
        category: 'worship',
        tags: ['worship', 'music', 'team'],
        creator: 'David L.',
        isJoined: true,
        isActive: true,
        location: { lat: 41.8781, lng: -87.6298, address: 'Chicago, IL' },
      },
      {
        id: '4',
        title: 'Marriage & Family Support',
        description: 'Support group for married couples and families',
        memberCount: 67,
        messageCount: 445,
        lastActivity: '3 hours ago',
        isPrivate: false,
        category: 'fellowship',
        tags: ['marriage', 'family', 'support'],
        creator: 'Pastor Mike',
        isJoined: false,
        isActive: true,
        location: { lat: 29.7604, lng: -95.3698, address: 'Houston, TX' },
      },
      {
        id: '5',
        title: 'Book of Romans Study',
        description: 'Deep dive into Paul\'s letter to the Romans',
        memberCount: 34,
        messageCount: 178,
        lastActivity: '5 hours ago',
        isPrivate: false,
        category: 'bible-study',
        tags: ['romans', 'paul', 'theology'],
        creator: 'Dr. Elizabeth',
        isJoined: true,
        isActive: true,
        location: { lat: 33.4484, lng: -112.0740, address: 'Phoenix, AZ' },
      },
      {
        id: '6',
        title: 'Grace Community Church',
        description: 'Official group for Grace Community Church members',
        memberCount: 150,
        messageCount: 500,
        lastActivity: '10 minutes ago',
        isPrivate: false,
        category: 'fellowship',
        tags: ['church', 'community'],
        creator: 'Admin',
        isJoined: false,
        isActive: true,
        location: { lat: 39.9526, lng: -75.1652, address: 'Philadelphia, PA' },
      },
      {
         id: '7',
         title: 'Local Missions',
         description: 'Serving our city together',
         memberCount: 25,
         messageCount: 120,
         lastActivity: '1 day ago',
         isPrivate: false,
         category: 'outreach',
         tags: ['missions', 'service'],
         creator: 'Tom H.',
         isJoined: false,
         isActive: true,
         location: { lat: 29.4241, lng: -98.4936, address: 'San Antonio, TX' }
      }
    ];

    // Filter groups based on input
    let filteredGroups = mockGroups.map(group => ({
      ...group,
      distance: input.latitude && input.longitude && group.location
        ? calculateDistance(input.latitude, input.longitude, group.location.lat, group.location.lng)
        : null
    }));

    if (input.category && input.category !== 'all') {
      filteredGroups = filteredGroups.filter(group => group.category === input.category);
    }

    if (input.search) {
      const searchLower = input.search.toLowerCase();
      filteredGroups = filteredGroups.filter(group =>
        group.title.toLowerCase().includes(searchLower) ||
        group.description.toLowerCase().includes(searchLower) ||
        group.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Sort by distance if location provided, otherwise by activity (mocked as preserving order or random)
    if (input.latitude && input.longitude) {
      filteredGroups.sort((a, b) => {
        if (a.distance !== null && b.distance !== null) {
          return a.distance - b.distance;
        }
        return 0;
      });
    }

    // Apply pagination
    const paginatedGroups = filteredGroups.slice(input.offset, input.offset + input.limit);

    return {
      groups: paginatedGroups,
      total: filteredGroups.length,
      hasMore: input.offset + input.limit < filteredGroups.length,
    };
  });
