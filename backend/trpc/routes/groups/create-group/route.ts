import { z } from 'zod';
import { protectedProcedure } from '../../../trpc';

const createGroupSchema = z.object({
  title: z.string().min(1).max(50),
  description: z.string().min(1).max(200),
  category: z.enum(['prayer', 'bible-study', 'youth', 'worship', 'fellowship', 'ministry']),
  isPrivate: z.boolean().default(false),
  tags: z.array(z.string()).max(5).default([]),
});

export const createGroupProcedure = protectedProcedure
  .input(createGroupSchema)
  .mutation(async ({ input, ctx }) => {
    const { user } = ctx;
    
    // Check if user has group access (church plans)
    // For now, allow all authenticated users to create groups
    // In production, you would check the user's actual plan from the database
    const hasGroupAccess = user !== null;
    
    if (!hasGroupAccess) {
      throw new Error('Authentication required to create groups');
    }

    // In a real implementation, you would:
    // 1. Create the group in the database
    // 2. Set the creator as admin
    // 3. Return the created group data

    const mockGroup = {
      id: `group_${Date.now()}`,
      title: input.title,
      description: input.description,
      category: input.category,
      isPrivate: input.isPrivate,
      tags: input.tags,
      creator: user.id,
      createdAt: new Date().toISOString(),
      memberCount: 1,
      messageCount: 0,
      isJoined: true,
      isActive: true,
    };

    return {
      success: true,
      group: mockGroup,
    };
  });