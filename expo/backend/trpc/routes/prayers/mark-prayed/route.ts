import { z } from 'zod';
import { protectedProcedure } from '../../../trpc';
import { ENV } from '@/config/env';

export const markPrayedProcedure = protectedProcedure
  .input(
    z.object({
      prayerId: z.string(),
      comment: z.string().min(1, 'Comment cannot be empty'),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log('🙏 BACKEND: markPrayedProcedure STARTED');
    console.log('📤 Input:', JSON.stringify(input, null, 2));
    console.log('👤 Context user:', JSON.stringify(ctx.user, null, 2));
    
    try {
      const { prayerId, comment } = input;
      
      const getPrayerResponse = await fetch(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayers/${prayerId}?fields=prayerCount`,
        {
          headers: {
            'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!getPrayerResponse.ok) {
        throw new Error('Prayer not found');
      }

      const prayerData = await getPrayerResponse.json();
      const currentCount = prayerData.data.prayerCount || 0;
      
      const addCommentResponse = await fetch(
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

      if (!addCommentResponse.ok) {
        const errorText = await addCommentResponse.text();
        console.error('❌ Comment creation failed:', addCommentResponse.status, errorText);
        throw new Error('Failed to add comment');
      }
      
      const updateResponse = await fetch(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayers/${prayerId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prayerCount: currentCount + 1,
          }),
        }
      );

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error('❌ Update failed:', updateResponse.status, errorText);
        throw new Error('Failed to update prayer count');
      }

      const data = await updateResponse.json();
      console.log('✅ Prayer marked as prayed successfully');
      
      return {
        success: true,
        prayerCount: data.data.prayerCount,
      };

    } catch (error) {
      console.error('💥 BACKEND: Error in markPrayedProcedure:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to mark as prayed');
    }
  });
