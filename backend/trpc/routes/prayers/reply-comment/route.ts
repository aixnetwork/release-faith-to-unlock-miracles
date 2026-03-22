import { z } from 'zod';
import { protectedProcedure } from '../../../trpc';
import { ENV } from '@/config/env';

export const replyCommentProcedure = protectedProcedure
  .input(
    z.object({
      prayerId: z.string(),
      commentId: z.string(),
      comment: z.string().min(1, 'Reply cannot be empty'),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      const { prayerId, commentId, comment } = input;
      
      console.log('=== Reply to Comment Request ===');
      console.log('Prayer ID:', prayerId);
      console.log('Comment ID:', commentId);
      console.log('User ID:', ctx.user?.id);
      console.log('Reply:', comment);
      
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
            comment_id: commentId,
            liked: 0,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Reply creation error:', response.status, errorText);
        throw new Error(`Failed to add reply: ${response.status}`);
      }

      const data = await response.json();
      console.log('Reply added successfully');
      
      return {
        success: true,
        comment: data.data,
      };
    } catch (error) {
      console.error('Error adding reply:', error);
      throw new Error('Failed to add reply');
    }
  });
