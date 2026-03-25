import { z } from 'zod';
import { protectedProcedure } from '../../../trpc';

const meetingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  platform: z.string().min(1, 'Platform is required'),
  link: z.string().optional(),
  location: z.string().optional(),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  isRecurring: z.boolean().default(false),
  recurringType: z.enum(['daily', 'weekly', 'monthly']).nullable().optional(),
  isPublic: z.boolean().default(true),
  host: z.string().min(1, 'Host is required'),
  invitees: z.array(z.string().email()).optional(),
  createdAt: z.string().optional(),
});

export const createMeetingProcedure = protectedProcedure
  .input(meetingSchema)
  .mutation(async ({ input, ctx }) => {
    try {
      // In a real implementation, this would save to a database
      // For now, we'll just return a mock response
      
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        meeting: {
          id: Math.random().toString(36).substring(2, 15),
          ...input,
          createdAt: input.createdAt || new Date().toISOString(),
        }
      };
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw new Error('Failed to create meeting');
    }
  });