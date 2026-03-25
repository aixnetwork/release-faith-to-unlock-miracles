import { z } from 'zod';
import { protectedProcedure } from '../../../trpc';
import { ENV } from '@/config/env';

export const updatePrayerProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      title: z.string().optional(),
      content: z.string().optional(),
      category: z.string().optional(),
      shareOnWall: z.boolean().optional(),
      answered: z.boolean().optional(),
      prayerCount: z.number().optional(),
      hasPrayed: z.boolean().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log('🎯 BACKEND: updatePrayerProcedure STARTED');
    console.log('📤 Input:', JSON.stringify(input, null, 2));
    console.log('👤 Context user:', JSON.stringify(ctx.user, null, 2));
    
    try {
      const { id, ...updateData } = input;
      
      // Step 1: Fetch the prayer data
      console.log('\n🔍 Step 1: Fetching prayer data...');
      const getPrayerResponse = await fetch(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayers/${id}?fields=*,user.*,organization_id`,
        {
          headers: {
            'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('📡 Prayer fetch status:', getPrayerResponse.status);
      
      if (!getPrayerResponse.ok) {
        const errorText = await getPrayerResponse.text();
        console.error('❌ Failed to fetch prayer:', errorText);
        throw new Error('Prayer not found');
      }

      const prayerData = await getPrayerResponse.json();
      const prayer = prayerData.data;
      
      console.log('✅ Prayer data fetched:', JSON.stringify(prayer, null, 2));

      // Step 2: User ID comparison
      console.log('\n🔍 Step 2: User ID comparison...');
      console.log('prayer.user:', prayer.user);
      console.log('prayer.user type:', typeof prayer.user);
      
      let prayerUserId: string | null = null;
      
      // Handle different user field formats
      if (typeof prayer.user === 'string') {
        prayerUserId = prayer.user;
        console.log('📝 User is direct string ID');
      } else if (typeof prayer.user === 'object' && prayer.user !== null) {
        prayerUserId = prayer.user.id;
        console.log('📝 User is object with id:', prayer.user.id);
      } else if (typeof prayer.user === 'number') {
        prayerUserId = prayer.user.toString();
        console.log('📝 User is number ID converted to string');
      }
      
      console.log('📝 Extracted prayerUserId:', prayerUserId);
      console.log('📝 Context user ID:', ctx.user?.id);
      console.log('📝 Context user ID type:', typeof ctx.user?.id);

      // Normalize both IDs to strings for comparison
      const normalizedPrayerUserId = prayerUserId?.toString();
      const normalizedContextUserId = ctx.user?.id?.toString();
      
      console.log('🔄 Normalized prayerUserId:', normalizedPrayerUserId);
      console.log('🔄 Normalized contextUserId:', normalizedContextUserId);
      
      const isOwner = normalizedPrayerUserId === normalizedContextUserId;
      console.log('✅ Is owner:', isOwner);

      // Step 3: Organizer check (if organization exists)
      let isOrganizer = false;
      if (prayer.organization_id) {
        console.log('\n🔍 Step 3: Checking organizer role...');
        console.log('🏢 Organization ID:', prayer.organization_id);
        
        const orgUserUrl = `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/organization_users?filter[user_id][_eq]=${ctx.user?.id}&filter[organization_id][_eq]=${prayer.organization_id}&fields=role_id`;
        
        console.log('📡 Org user query URL:', orgUserUrl);
        
        const orgUserResponse = await fetch(orgUserUrl, {
          headers: {
            'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        });
        
        console.log('📡 Org user response status:', orgUserResponse.status);
        
        if (orgUserResponse.ok) {
          const orgUserData = await orgUserResponse.json();
          console.log('👥 Org user data:', JSON.stringify(orgUserData, null, 2));
          
          if (orgUserData.data && orgUserData.data.length > 0) {
            const roleId = orgUserData.data[0].role_id;
            console.log('🎭 User role_id:', roleId);
            console.log('🎭 Expected organizer role_id:', ENV.EXPO_PUBLIC_DIRECTUS_ORGANIZER_ROLE_ID);
            
            // Normalize role IDs
            const normalizedRoleId = roleId?.toString();
            const normalizedOrganizerRoleId = ENV.EXPO_PUBLIC_DIRECTUS_ORGANIZER_ROLE_ID?.toString();
            
            isOrganizer = normalizedRoleId === normalizedOrganizerRoleId;
            console.log('✅ Is organizer:', isOrganizer);
          } else {
            console.log('❌ No organization_users record found');
          }
        } else {
          console.log('❌ Org user response not OK');
        }
      } else {
        console.log('ℹ️ No organization_id on prayer');
      }

      // Step 4: Permission check
      console.log('\n🔍 Step 4: Permission check...');
      console.log('📊 Is owner:', isOwner);
      console.log('📊 Is organizer:', isOrganizer);
      console.log('📊 Update data keys:', Object.keys(updateData));
      console.log('📊 Update data:', JSON.stringify(updateData, null, 2));
      
      const isAnsweredOnlyUpdate = updateData.answered !== undefined && Object.keys(updateData).length === 1;
      console.log('🎯 Is answered-only update:', isAnsweredOnlyUpdate);

      if (isAnsweredOnlyUpdate) {
        console.log('🔒 Checking answered-only update permissions...');
        if (!isOrganizer) {
          console.error('❌ REJECTED: Only organizers can mark as answered');
          throw new Error('Only organizers can mark prayers as answered');
        }
        console.log('✅ ALLOWED: Organizer marking prayer as answered');
      } else {
        console.log('🔒 Checking regular edit permissions...');
        if (!isOwner && !isOrganizer) {
          console.error('❌ REJECTED: Not owner and not organizer');
          throw new Error('You do not have permission to edit this prayer');
        }
        console.log('✅ ALLOWED: User has edit permissions');
      }

      // Step 5: Perform the update
      console.log('\n🔍 Step 5: Performing update...');
      const response = await fetch(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayers/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        }
      );

      console.log('📡 Update response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Update failed:', response.status, errorText);
        throw new Error('Failed to update prayer');
      }

      const data = await response.json();
      console.log('✅ Prayer updated successfully:', JSON.stringify(data, null, 2));
      
      return {
        success: true,
        prayer: data.data,
      };

    } catch (error) {
      console.error('💥 BACKEND: Error in updatePrayerProcedure:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update prayer');
    }
  });