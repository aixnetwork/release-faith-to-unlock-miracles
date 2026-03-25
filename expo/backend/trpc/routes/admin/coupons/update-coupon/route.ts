import { protectedProcedure } from '../../../../trpc';
import { z } from 'zod';

export const updateCouponProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().min(1).max(100).optional(),
      description: z.string().min(1).max(500).optional(),
      type: z.enum(['percentage', 'fixed']).optional(),
      discount: z.number().min(0).optional(),
      validFrom: z.string().datetime().optional(),
      validUntil: z.string().datetime().optional(),
      maxUses: z.number().min(1).optional(),
      maxUsesPerUser: z.number().min(1).optional(),
      minimumAmount: z.number().min(0).optional(),
      applicablePlans: z.array(z.string()).optional(),
      isActive: z.boolean().optional(),
      isFirstTimeOnly: z.boolean().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      console.log('✏️ Updating coupon:', {
        id: input.id,
        adminId: ctx.user?.id,
      });

      // Check if user is admin
      if (!ctx.user || !ctx.user.isAdmin) {
        throw new Error('Unauthorized: Admin access required');
      }

      // Validate dates if both are provided
      if (input.validFrom && input.validUntil) {
        const validFrom = new Date(input.validFrom);
        const validUntil = new Date(input.validUntil);
        
        if (validFrom >= validUntil) {
          throw new Error('Valid from date must be before valid until date');
        }
      }

      // Validate discount amount
      if (input.type === 'percentage' && input.discount && input.discount > 100) {
        throw new Error('Percentage discount cannot exceed 100%');
      }

      if (input.type === 'fixed' && input.discount && input.discount <= 0) {
        throw new Error('Fixed discount must be greater than 0');
      }

      // In a real app, this would update the database record
      const { id, ...updateData } = input;
      const updatedCoupon = {
        id,
        ...updateData,
        updatedAt: new Date().toISOString(),
        updatedBy: ctx.user.id,
      };

      console.log('✅ Coupon updated successfully:', {
        id: input.id,
        changes: Object.keys(input).filter(key => key !== 'id'),
      });

      return {
        success: true,
        coupon: updatedCoupon,
        message: 'Coupon updated successfully',
      };
    } catch (error) {
      console.error('❌ Update coupon error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        success: false,
        error: `Failed to update coupon: ${errorMessage}`,
      };
    }
  });