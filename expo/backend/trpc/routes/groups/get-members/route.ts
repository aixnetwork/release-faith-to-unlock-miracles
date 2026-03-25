import { z } from 'zod';
import { protectedProcedure } from '../../../trpc';

const getMembersSchema = z.object({
  groupId: z.string(),
});

export const getMembersProcedure = protectedProcedure
  .input(getMembersSchema)
  .query(async ({ input, ctx }) => {
    const { user } = ctx;
    const { groupId } = input;
    
    console.log('👥 Fetching group members:', {
      groupId,
      requestedBy: user?.id,
    });
    
    const hasGroupAccess = user && user.plan && [
      'group_family',
      'small_church',
      'large_church',
      'org_small', 
      'org_medium', 
      'org_large'
    ].includes(user.plan);
    
    if (!hasGroupAccess) {
      throw new Error('Viewing members requires a Family Plan or Church plan.');
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    const mockMembers = [
      {
        id: user?.id || 'current-user',
        name: user?.name || 'You',
        email: user?.email || 'you@example.com',
        role: 'admin' as const,
        joinedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        status: 'active' as const,
      },
      {
        id: 'member_2',
        name: 'Sarah Johnson',
        email: 'sarah.j@example.com',
        role: 'member' as const,
        joinedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        status: 'active' as const,
      },
      {
        id: 'member_3',
        name: 'Michael Chen',
        email: 'michael.c@example.com',
        role: 'member' as const,
        joinedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        status: 'invited' as const,
      },
    ];

    console.log('✅ Members fetched:', mockMembers.length);

    return {
      success: true,
      members: mockMembers,
      total: mockMembers.length,
    };
  });
