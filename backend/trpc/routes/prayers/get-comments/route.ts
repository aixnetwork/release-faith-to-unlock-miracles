import { z } from 'zod';
import { protectedProcedure } from '../../../trpc';
import { ENV } from '@/config/env';

export const getCommentsProcedure = protectedProcedure
  .input(
    z.object({
      prayerId: z.string(),
    })
  )
  .query(async ({ input, ctx }) => {
    try {
      const { prayerId } = input;
      
      console.log('=== Get Prayer Comments Request ===');
      console.log('Prayer ID:', prayerId);
      
      const response = await fetch(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayer_comments?filter[prayer_id][_eq]=${prayerId}&sort=date_created&fields=*,user_id.id,user_id.first_name,user_id.last_name`,
        {
          headers: {
            'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Comments fetch error:', response.status, errorText);
        throw new Error(`Failed to fetch comments: ${response.status}`);
      }

      const data = await response.json();
      console.log('Comments fetched successfully:', data.data?.length || 0);
      
      if (data.data && data.data.length > 0) {
        console.log('Sample comment liked values:', data.data.slice(0, 3).map((c: any) => ({
          id: c.id,
          liked: c.liked,
          comments: c.comments?.substring(0, 30)
        })));
      }
      
      return {
        success: true,
        comments: data.data || [],
      };
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw new Error('Failed to fetch comments');
    }
  });
