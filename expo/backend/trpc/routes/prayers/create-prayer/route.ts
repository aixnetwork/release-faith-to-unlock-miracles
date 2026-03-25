import { z } from 'zod';
import { protectedProcedure } from '../../../trpc';
import { ENV } from '@/config/env';

export const createPrayerProcedure = protectedProcedure
  .input(
    z.object({
      title: z.string().min(1, 'Title is required'),
      content: z.string().min(1, 'Content is required'),
      category: z.string().optional(),
      shareOnWall: z.boolean().default(false),
      userId: z.string(),
      organizationId: z.number().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      const { title, content, category, shareOnWall, userId, organizationId } = input;
      
      const prayerData: any = {
        title,
        content,
        category: category || 'other',
        shareOnWall: shareOnWall ? 1 : 0,
        user_id: userId,
        answered: false,
        prayerCount: 0,
        hasPrayed: false,
        status: 'published',
      };
      
      if (organizationId) {
        prayerData.organization_id = organizationId;
      }

      console.log('Creating prayer with data:', JSON.stringify(prayerData, null, 2));
      console.log('API URL:', `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayers`);

      const response = await fetch(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayers`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(prayerData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Failed to create prayer: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Prayer created successfully:', JSON.stringify(data.data, null, 2));
      
      return {
        success: true,
        prayer: data.data,
      };
    } catch (error) {
      console.error('Error creating prayer:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create prayer');
    }
  });
