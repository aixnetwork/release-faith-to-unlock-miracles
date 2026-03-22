import { z } from 'zod';
import { protectedProcedure } from '../../../trpc';
import { ENV } from '@/config/env';

export const deletePrayerProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      const { id } = input;
      
      const response = await fetch(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayers/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete prayer');
      }
      
      return {
        success: true,
      };
    } catch (error) {
      console.error('Error deleting prayer:', error);
      throw new Error('Failed to delete prayer');
    }
  });
