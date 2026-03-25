import { protectedProcedure } from '../../../../trpc';
import { z } from 'zod';

export const createCouponProcedure = protectedProcedure
  .input(
    z.object({
      code: z.string().min(3).max(20).regex(/^[A-Z0-9]+$/, 'Code must contain only uppercase letters and numbers'),
      name: z.string().min(1).max(100),
      description: z.string().min(1).max(500),
      type: z.enum(['percentage', 'fixed']),
      discount: z.number().min(0),
      validFrom: z.string().datetime(),
      validUntil: z.string().datetime(),
      maxUses: z.number().min(1).optional(),
      maxUsesPerUser: z.number().min(1).optional(),
      minimumAmount: z.number().min(0).optional(),
      applicablePlans: z.array(z.string()).optional(),
      isActive: z.boolean().default(true),
      isFirstTimeOnly: z.boolean().default(false),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      console.log('🎫 Creating coupon:', {
        code: input.code,
        type: input.type,
        discount: input.discount,
        adminId: ctx.user?.id,
      });

      // Check if user is admin
      if (!ctx.user || !ctx.user.isAdmin) {
        throw new Error('Unauthorized: Admin access required');
      }

      // Validate dates
      const validFrom = new Date(input.validFrom);
      const validUntil = new Date(input.validUntil);
      
      if (validFrom >= validUntil) {
        throw new Error('Valid from date must be before valid until date');
      }

      // Validate discount amount
      if (input.type === 'percentage' && input.discount > 100) {
        throw new Error('Percentage discount cannot exceed 100%');
      }

      if (input.type === 'fixed' && input.discount <= 0) {
        throw new Error('Fixed discount must be greater than 0');
      }

      // Generate coupon ID
      const couponId = `coupon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      // In a real app, this would save to database
      const coupon = {
        id: couponId,
        ...input,
        currentUses: 0,
        createdAt: new Date().toISOString(),
        createdBy: ctx.user.id,
        updatedAt: new Date().toISOString(),
      };

      console.log('✅ Coupon created successfully:', {
        id: couponId,
        code: input.code,
        type: input.type,
        discount: input.discount,
      });

      return {
        success: true,
        coupon,
        message: `Coupon ${input.code} created successfully`,
      };
    } catch (error) {
      console.error('❌ Create coupon error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        success: false,
        error: `Failed to create coupon: ${errorMessage}`,
      };
    }
  });