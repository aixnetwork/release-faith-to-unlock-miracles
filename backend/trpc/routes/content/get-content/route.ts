import { z } from 'zod';
import { protectedProcedure } from '../../../trpc';
import { ENV } from '@/config/env';

export const getContentProcedure = protectedProcedure
  .input(
    z.object({
      organizationId: z.number(),
      contentType: z.string().optional(),
      status: z.enum(['published', 'draft', 'scheduled', 'all']).default('all'),
      limit: z.number().default(20),
      offset: z.number().default(0),
    })
  )
  .query(async ({ input, ctx }) => {
    try {
      console.log('📚 Fetching content:', input);

      let filter = `organization_id[_eq]=${input.organizationId}`;
      
      if (input.contentType) {
        filter += `&content_type[_eq]=${input.contentType}`;
      }

      if (input.status !== 'all') {
        filter += `&status[_eq]=${input.status}`;
      }

      const response = await fetch(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/organization_content?filter=${filter}&limit=${input.limit}&offset=${input.offset}&sort=-date_created`,
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
      console.log(`✅ Retrieved ${data.data?.length || 0} content items`);
      
      return {
        items: (data.data || []).map((item: any) => ({
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
        })),
        total: data.data?.length || 0,
      };
    } catch (error) {
      console.error('❌ Error fetching content:', error);
      return { items: [], total: 0 };
    }
  });
