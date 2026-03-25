import { z } from 'zod';
import { protectedProcedure } from '../../../trpc';
import { ENV } from '@/config/env';

export const addCommentProcedure = protectedProcedure
  .input(
    z.object({
      prayerId: z.string(),
      comment: z.string().min(1, 'Comment cannot be empty'),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      const { prayerId, comment } = input;
      
      console.log('=== Add Prayer Comment Request ===');
      console.log('Prayer ID:', prayerId);
      console.log('User ID:', ctx.user?.id);
      console.log('Comment:', comment);
      
      const response = await fetch(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayer_comments`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prayer_id: prayerId,
            user_id: ctx.user?.id,
            comments: comment,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Comment creation error:', response.status, errorText);
        throw new Error(`Failed to add comment: ${response.status}`);
      }

      const data = await response.json();
      console.log('Comment added successfully');
      
      return {
        success: true,
        comment: data.data,
      };
    } catch (error) {
      console.error('Error adding comment:', error);
      throw new Error('Failed to add comment');
    }
  });
