import { z } from 'zod';
import { protectedProcedure } from '../../../trpc';
import { ENV } from '@/config/env';

export const deleteContentProcedure = protectedProcedure
  .input(
    z.object({
      contentId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      console.log('🗑️ Deleting content:', input.contentId);

      const response = await fetch(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/organization_content/${input.contentId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete content');
      }

      console.log('✅ Content deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting content:', error);
      throw error;
    }
  });
