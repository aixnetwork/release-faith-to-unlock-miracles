import { z } from 'zod';
import { protectedProcedure } from '../../../trpc';
import { ENV } from '@/config/env';

const contentTypeSchema = z.enum([
  'sermons',
  'bible-studies', 
  'worship-songs',
  'events',
  'articles',
  'videos',
]);

export const createContentProcedure = protectedProcedure
  .input(
    z.object({
      contentType: contentTypeSchema,
      title: z.string().min(1, 'Title is required'),
      description: z.string().min(1, 'Description is required'),
      content: z.string().optional(),
      tags: z.array(z.string()).optional(),
      isPublic: z.boolean().default(true),
      scheduledDate: z.string().optional(),
      mediaUrls: z.array(z.string()).optional(),
      organizationId: z.number(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      console.log('📝 Creating content:', input);

      const response = await fetch(`${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/organization_content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
        },
        body: JSON.stringify({
          content_type: input.contentType,
          title: input.title,
          description: input.description,
          content: input.content || '',
          tags: input.tags || [],
          is_public: input.isPublic,
          scheduled_date: input.scheduledDate,
          media_urls: input.mediaUrls || [],
          organization_id: input.organizationId,
          user_created: ctx.user?.id,
          status: 'published',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create content');
      }

      const data = await response.json();
      console.log('✅ Content created successfully');
      return data;
    } catch (error) {
      console.error('❌ Error creating content:', error);
      throw error;
    }
  });
