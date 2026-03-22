import { z } from 'zod';
import { protectedProcedure } from '../../../trpc';
import { ENV } from '@/config/env';

export const likeCommentProcedure = protectedProcedure
  .input(
    z.object({
      commentId: z.string(),
      liked: z.boolean(),
      prayerId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      const { commentId, liked, prayerId } = input;
      
      console.log('=== Like Comment Request ===');
      console.log('Comment ID:', commentId);
      console.log('Liked:', liked);
      console.log('User ID:', ctx.user?.id);
      console.log('Prayer ID:', prayerId);
      
      const prayerResponse = await fetch(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayers/${prayerId}?fields=user,organization_id`,
        {
          headers: {
            'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!prayerResponse.ok) {
        throw new Error('Failed to fetch prayer');
      }

      const prayerData = await prayerResponse.json();
      const prayer = prayerData.data;
      const prayerUserId = typeof prayer.user === 'string' ? prayer.user : prayer.user?.id;
      const isOwner = prayerUserId === ctx.user?.id;
      
      let isOrganizer = false;
      if (prayer.organization_id) {
        const orgResponse = await fetch(
          `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/organization_users?filter[user_id][_eq]=${ctx.user?.id}&filter[organization_id][_eq]=${prayer.organization_id}&fields=role_id`,
          {
            headers: {
              'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (orgResponse.ok) {
          const orgData = await orgResponse.json();
          if (orgData.data && orgData.data.length > 0) {
            const roleId = orgData.data[0].role_id;
            isOrganizer = roleId === ENV.EXPO_PUBLIC_DIRECTUS_ORGANIZER_ROLE_ID;
          }
        }
      }

      const commentResponse = await fetch(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayer_comments/${commentId}?fields=user_id`,
        {
          headers: {
            'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!commentResponse.ok) {
        throw new Error('Failed to fetch comment');
      }

      const commentData = await commentResponse.json();
      const comment = commentData.data;
      const commentUserId = typeof comment.user_id === 'string' ? comment.user_id : comment.user_id?.id;
      const isCommentOwner = commentUserId === ctx.user?.id;

      if (!isOwner && !isOrganizer && !isCommentOwner) {
        throw new Error('You do not have permission to like this comment');
      }
      
      const likedValue = liked ? 1 : 0;
      console.log('Updating liked field to:', likedValue);
      
      const response = await fetch(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayer_comments/${commentId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            liked: likedValue,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Like comment error:', response.status, errorText);
        throw new Error(`Failed to like comment: ${response.status}`);
      }

      const data = await response.json();
      console.log('Comment liked successfully. Updated comment:', JSON.stringify(data.data, null, 2));
      
      return {
        success: true,
        comment: data.data,
        liked: likedValue,
      };
    } catch (error) {
      console.error('Error liking comment:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to like comment');
    }
  });
