import { z } from 'zod';
import { protectedProcedure } from '../../../trpc';
import { ENV } from '@/config/env';

export const getContentByIdProcedure = protectedProcedure
  .input(
    z.object({
      contentId: z.string(),
    })
  )
  .query(async ({ input, ctx }) => {
    try {
      console.log('📖 Fetching content by ID:', input.contentId);

      const response = await fetch(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/organization_content/${input.contentId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }

      const data = await response.json();
      console.log('✅ Content retrieved successfully');
      
      const item = data.data;
      return {
        id: item.id,
        contentType: item.content_type,
        title: item.title,
        description: item.description,
        content: item.content,
        tags: item.tags,
        isPublic: item.is_public,
        scheduledDate: item.scheduled_date,
        mediaUrls: item.media_urls,
        organizationId: item.organization_id,
        userId: item.user_created,
        createdAt: item.date_created,
        updatedAt: item.date_updated,
        status: item.status,
      };
    } catch (error) {
      console.error('❌ Error fetching content:', error);
      throw error;
    }
  });
