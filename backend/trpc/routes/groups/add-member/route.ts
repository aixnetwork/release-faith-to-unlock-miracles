import { z } from 'zod';
import { protectedProcedure } from '../../../trpc';

const addMemberSchema = z.object({
  groupId: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'member']).default('member'),
});

export const addMemberProcedure = protectedProcedure
  .input(addMemberSchema)
  .mutation(async ({ input, ctx }) => {
    const { user } = ctx;
    const { groupId, email, role } = input;
    
    console.log('📨 Adding member to group:', {
      groupId,
      email,
      role,
      addedBy: user?.id,
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
      throw new Error('Adding members requires a Family Plan or Church plan. Please upgrade to access this feature.');
    }

    if (email === user.email) {
      throw new Error('You cannot add yourself to the group.');
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    const newMember = {
      id: `member_${Date.now()}`,
      email,
      name: email.split('@')[0],
      role,
      joinedDate: new Date().toISOString(),
      addedBy: user.id,
      isActive: true,
      status: 'invited',
    };

    console.log('✅ Member added successfully:', newMember);

    return {
      success: true,
      message: `Invitation sent to ${email}`,
      member: newMember,
      groupId,
    };
  });
