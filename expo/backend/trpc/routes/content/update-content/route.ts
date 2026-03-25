import { z } from 'zod';
import { protectedProcedure } from '../../../trpc';
import { ENV } from '@/config/env';

export const updateContentProcedure = protectedProcedure
  .input(
    z.object({
      contentId: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      content: z.string().optional(),
      tags: z.array(z.string()).optional(),
      isPublic: z.boolean().optional(),
      scheduledDate: z.string().optional(),
      mediaUrls: z.array(z.string()).optional(),
      status: z.enum(['published', 'draft', 'scheduled']).optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      console.log('✏️ Updating content:', input.contentId);

      const { contentId, ...updateData } = input;

      const bodyData: any = {};
      if (updateData.title) bodyData.title = updateData.title;
      if (updateData.description) bodyData.description = updateData.description;
      if (updateData.content !== undefined) bodyData.content = updateData.content;
      if (updateData.tags !== undefined) bodyData.tags = updateData.tags;
      if (updateData.isPublic !== undefined) bodyData.is_public = updateData.isPublic;
      if (updateData.scheduledDate !== undefined) bodyData.scheduled_date = updateData.scheduledDate;
      if (updateData.mediaUrls !== undefined) bodyData.media_urls = updateData.mediaUrls;
      if (updateData.status) bodyData.status = updateData.status;

      const response = await fetch(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/organization_content/${contentId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
          },
          body: JSON.stringify(bodyData),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update content');
      }

      const data = await response.json();
      console.log('✅ Content updated successfully');
      return data;
    } catch (error) {
      console.error('❌ Error updating content:', error);
      throw error;
    }
  });
