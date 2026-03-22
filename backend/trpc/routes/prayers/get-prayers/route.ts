import { z } from 'zod';
import { protectedProcedure, publicProcedure } from '../../../trpc';
import { ENV } from '@/config/env';

export const getPrayersProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string().optional(),
      organizationId: z.union([z.string(), z.number()]).optional(),
      status: z.enum(['active', 'answered', 'all']).optional().default('all'),
      type: z.enum(['personal', 'community', 'all']).optional().default('all'),
    })
  )
  .query(async ({ input, ctx }) => {
    try {
      const { userId, organizationId, status, type } = input;
      const currentUserId = ctx.user?.id || userId;
      
      console.log('=== Get Prayers Request ===');
      console.log('Input:', { userId, organizationId, status, type });
      console.log('Current User ID:', currentUserId);
      
      let filter: any = {};
      
      if (type === 'personal' && currentUserId) {
        console.log('Filtering for personal prayers by user:', currentUserId);
        filter.user_id = { _eq: currentUserId };
      } else if (type === 'community') {
        console.log('Filtering for community prayers');
        if (organizationId) {
          // Handle both string and number organizationId
          let orgId: number | undefined;
          
          if (typeof organizationId === 'number') {
            orgId = organizationId;
          } else if (typeof organizationId === 'string') {
             const parsed = parseInt(organizationId, 10);
             if (!isNaN(parsed)) {
               orgId = parsed;
             }
          }

          // Only add if valid number and not 0 (unless 0 is a valid ID)
          if (orgId !== undefined) {
             filter.organization_id = { _eq: orgId };
          }
        }
        filter.shareOnWall = { _eq: 1 };
        // We usually want published prayers on the wall
        // But if we are debugging, maybe we want all? keeping it strict for now
        filter.status = { _eq: 'published' };
      }
      
      if (status === 'active') {
        filter.answered = { _eq: false };
      } else if (status === 'answered') {
        filter.answered = { _eq: true };
      }
      
      console.log('Final filter:', JSON.stringify(filter, null, 2));
      
      const filterString = Object.keys(filter).length > 0 ? JSON.stringify(filter) : '{}';
      
      const params = new URLSearchParams({
        filter: filterString,
        sort: '-date_created',
        fields: '*,user_id.id,user_id.first_name,user_id.last_name',
      });
      
      const baseUrl = ENV.EXPO_PUBLIC_RORK_API_BASE_URL || 'https://rfdb.aixnetwork.net';
      const url = `${baseUrl}/items/prayers?${params.toString()}`;
      
      console.log('Fetching prayers from URL:', url);
      
      let response;
      try {
        response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (fetchError) {
        console.error('Network fetch failed:', fetchError);
        // Return empty list instead of crashing
        return {
          success: true,
          prayers: [],
          error: 'Network error fetching prayers',
        };
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Prayer fetch error:', response.status, errorText);
        // Instead of throwing, return empty list to prevent client crash
        return {
           success: false,
           prayers: [],
           error: `API Error: ${response.status}`,
        };
      }

      // Check for HTML response
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        console.error('Received HTML response from Directus');
        return {
          success: false,
          prayers: [],
          error: 'API returned HTML instead of JSON',
        };
      }

      const data = await response.json();
      const prayers = data.data || [];
      console.log('Prayers fetched successfully:', prayers.length);
      
      // Enhance prayers with hasPrayed status
      // If we have a current user, check if they have prayed for these requests
      let enhancedPrayers = prayers;
      
      if (currentUserId && prayers.length > 0) {
        try {
          const prayerIds = prayers.map((p: any) => p.id);
          
          // Fetch comments by this user for these prayers
          const commentsFilter = {
            prayer_id: { _in: prayerIds },
            user_id: { _eq: currentUserId }
          };
          
          const commentsUrl = `${baseUrl}/items/prayer_comments?filter=${JSON.stringify(commentsFilter)}&fields=prayer_id`;
          
          const commentsResponse = await fetch(commentsUrl, {
             headers: {
              'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (commentsResponse.ok) {
            const commentsData = await commentsResponse.json();
            const userCommentedPrayerIds = new Set(commentsData.data.map((c: any) => c.prayer_id));
            
            enhancedPrayers = prayers.map((prayer: any) => ({
              ...prayer,
              hasPrayed: userCommentedPrayerIds.has(prayer.id),
              prayerCount: prayer.prayerCount || 0
            }));
          }
        } catch (commentsError) {
          console.warn('Failed to fetch prayer comments:', commentsError);
          // Fallback to basic prayers if comments fetch fails
          enhancedPrayers = prayers.map((prayer: any) => ({
              ...prayer,
              hasPrayed: false,
              prayerCount: prayer.prayerCount || 0
            }));
        }
      } else {
         enhancedPrayers = prayers.map((prayer: any) => ({
            ...prayer,
            hasPrayed: false,
            prayerCount: prayer.prayerCount || 0
          }));
      }

      return {
        success: true,
        prayers: enhancedPrayers,
      };
    } catch (error) {
      console.error('Error fetching prayers:', error);
      // Always return a valid structure to avoid client crash
      return {
        success: false,
        prayers: [],
        error: String(error),
      };
    }
  });
