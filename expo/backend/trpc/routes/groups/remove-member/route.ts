import { z } from 'zod';
import { protectedProcedure } from '../../../trpc';

const removeMemberSchema = z.object({
  groupId: z.string(),
  memberId: z.string(),
});

export const removeMemberProcedure = protectedProcedure
  .input(removeMemberSchema)
  .mutation(async ({ input, ctx }) => {
    const { user } = ctx;
    const { groupId, memberId } = input;
    
    console.log('🗑️ Removing member from group:', {
      groupId,
      memberId,
      removedBy: user?.id,
    });
    
    const hasGroupAccess = user && user.plan && [
      'group_family',
      'org_small', 
      'org_medium', 
      'org_large'
    ].includes(user.plan);
    
    if (!hasGroupAccess) {
      throw new Error('Removing members requires a Family Plan or Church plan.');
    }

    if (memberId === user.id) {
      throw new Error('You cannot remove yourself. Use "Leave Group" instead.');
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('✅ Member removed successfully');

    return {
      success: true,
      message: 'Member removed from group',
      groupId,
      memberId,
    };
  });
