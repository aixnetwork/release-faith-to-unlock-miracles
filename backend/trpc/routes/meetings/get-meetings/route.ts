import { z } from 'zod';
import { protectedProcedure } from '../../../trpc';

export const getMeetingsProcedure = protectedProcedure
  .input(
    z.object({
      userId: z.string().optional(),
      filter: z.enum(['upcoming', 'past', 'all']).optional().default('all'),
    }).optional()
  )
  .query(async ({ input, ctx }) => {
    try {
      // In a real implementation, this would fetch from a database
      // For now, we'll just return mock data
      
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock meetings data
      const mockMeetings = [
        {
          id: '1',
          title: 'Weekly Prayer Meeting',
          description: 'Join us for our weekly prayer session where we share prayer requests and pray together.',
          platform: 'zoom',
          link: 'https://zoom.us/j/123456789',
          startTime: new Date(Date.now() + 86400000).toISOString(), // tomorrow
          endTime: new Date(Date.now() + 86400000 + 3600000).toISOString(), // tomorrow + 1 hour
          isRecurring: true,
          recurringType: 'weekly',
          isPublic: true,
          host: 'John Doe',
          invitees: ['member1@example.com', 'member2@example.com'],
          createdAt: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
        },
        {
          id: '2',
          title: 'Bible Study Group',
          description: 'We will be studying the Book of Romans, chapter 8.',
          platform: 'google_meet',
          link: 'https://meet.google.com/abc-defg-hij',
          startTime: new Date(Date.now() + 172800000).toISOString(), // day after tomorrow
          endTime: new Date(Date.now() + 172800000 + 5400000).toISOString(), // day after tomorrow + 1.5 hours
          isRecurring: false,
          isPublic: true,
          host: 'Jane Smith',
          createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        },
        {
          id: '3',
          title: 'Youth Group Meeting',
          description: 'Monthly gathering for all youth members.',
          platform: 'in_person',
          location: 'Church Hall, 123 Main Street',
          startTime: new Date(Date.now() + 432000000).toISOString(), // 5 days from now
          endTime: new Date(Date.now() + 432000000 + 7200000).toISOString(), // 5 days from now + 2 hours
          isRecurring: true,
          recurringType: 'monthly',
          isPublic: true,
          host: 'Pastor Mike',
          createdAt: new Date(Date.now() - 1209600000).toISOString(), // 2 weeks ago
        },
        {
          id: '4',
          title: 'Leadership Team Sync',
          description: 'Monthly sync for all ministry leaders.',
          platform: 'ms_teams',
          link: 'https://teams.microsoft.com/l/meetup-join/abc123',
          startTime: new Date(Date.now() - 86400000).toISOString(), // yesterday
          endTime: new Date(Date.now() - 86400000 + 3600000).toISOString(), // yesterday + 1 hour
          isRecurring: true,
          recurringType: 'monthly',
          isPublic: false,
          host: 'Pastor John',
          invitees: ['leader1@example.com', 'leader2@example.com', 'leader3@example.com'],
          createdAt: new Date(Date.now() - 2592000000).toISOString(), // 30 days ago
        },
        {
          id: '5',
          title: 'Worship Team Practice',
          description: 'Rehearsal for Sunday service.',
          platform: 'whatsapp',
          link: 'https://chat.whatsapp.com/abcdefghijklmn',
          startTime: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          endTime: new Date(Date.now() - 172800000 + 7200000).toISOString(), // 2 days ago + 2 hours
          isRecurring: true,
          recurringType: 'weekly',
          isPublic: false,
          host: 'Sarah Johnson',
          invitees: ['musician1@example.com', 'musician2@example.com'],
          createdAt: new Date(Date.now() - 1814400000).toISOString(), // 3 weeks ago
        },
        {
          id: '6',
          title: 'Community Outreach Planning',
          description: 'Planning session for our upcoming community service event.',
          platform: 'custom',
          link: 'https://jitsi.org/abcdef',
          startTime: new Date(Date.now() + 30 * 60000).toISOString(), // 30 minutes from now
          endTime: new Date(Date.now() + 30 * 60000 + 3600000).toISOString(), // 30 minutes from now + 1 hour
          isRecurring: false,
          isPublic: true,
          host: 'David Wilson',
          createdAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
        },
      ];
      
      // Filter meetings based on input
      let filteredMeetings = mockMeetings;
      
      if (input?.filter) {
        const now = new Date();
        
        if (input.filter === 'upcoming') {
          filteredMeetings = mockMeetings.filter(meeting => 
            new Date(meeting.startTime) > now
          );
        } else if (input.filter === 'past') {
          filteredMeetings = mockMeetings.filter(meeting => 
            new Date(meeting.endTime) < now
          );
        }
      }
      
      return {
        meetings: filteredMeetings
      };
    } catch (error) {
      console.error('Error fetching meetings:', error);
      throw new Error('Failed to fetch meetings');
    }
  });