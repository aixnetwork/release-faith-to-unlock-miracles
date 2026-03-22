import { z } from 'zod';
import { protectedProcedure } from '../../../trpc';

const sendMessageSchema = z.object({
  groupId: z.string(),
  content: z.string().min(1).max(500),
  type: z.enum(['text', 'prayer', 'announcement']).default('text'),
  replyTo: z.string().optional(),
});

export const sendMessageProcedure = protectedProcedure
  .input(sendMessageSchema)
  .mutation(async ({ input, ctx }) => {
    const { user } = ctx;
    
    // Check if user has group access
    // For now, allow all authenticated users to send messages
    // In production, you would check the user's actual plan from the database
    const hasGroupAccess = user !== null;
    
    if (!hasGroupAccess) {
      throw new Error('Authentication required to send messages');
    }

    // In a real implementation, you would:
    // 1. Verify user is a member of the group
    // 2. Save the message to the database
    // 3. Send real-time notifications to other members
    // 4. Return the created message

    const mockMessage = {
      id: `msg_${Date.now()}`,
      groupId: input.groupId,
      userId: user.id,
      userName: user.email.split('@')[0] || 'User',
      content: input.content,
      type: input.type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: [],
      isReply: !!input.replyTo,
      replyTo: input.replyTo,
      isPinned: false,
    };

    return {
      success: true,
      message: mockMessage,
    };
  });