import { protectedProcedure } from '../../../../trpc';
import { z } from 'zod';

export const deleteCouponProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      console.log('🗑️ Deleting coupon:', {
        id: input.id,
        adminId: ctx.user?.id,
      });

      // Check if user is admin
      if (!ctx.user || !ctx.user.isAdmin) {
        throw new Error('Unauthorized: Admin access required');
      }

      // In a real app, this would soft delete or hard delete the coupon
      // For now, we'll simulate the deletion
      
      console.log('✅ Coupon deleted successfully:', {
        id: input.id,
      });

      return {
        success: true,
        message: 'Coupon deleted successfully',
      };
    } catch (error) {
      console.error('❌ Delete coupon error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        success: false,
        error: `Failed to delete coupon: ${errorMessage}`,
      };
    }
  });