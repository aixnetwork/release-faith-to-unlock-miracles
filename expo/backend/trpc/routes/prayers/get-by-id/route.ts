import { z } from 'zod';
import { protectedProcedure } from '../../../trpc';
import { ENV } from '@/config/env';

export const getPrayerByIdProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .query(async ({ input, ctx }) => {
    try {
      const { id } = input;
      
      console.log('=== Get Prayer By ID Request ===');
      console.log('Prayer ID:', id);
      
      const response = await fetch(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayers/${id}?fields=*,user.id,user.first_name,user.last_name`,
        {
          headers: {
            'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Prayer fetch error:', response.status, errorText);
        throw new Error(`Failed to fetch prayer: ${response.status}`);
      }

      const data = await response.json();
      console.log('Prayer fetched successfully');
      
      return {
        success: true,
        prayer: data.data,
      };
    } catch (error) {
      console.error('Error fetching prayer:', error);
      throw new Error('Failed to fetch prayer');
    }
  });
