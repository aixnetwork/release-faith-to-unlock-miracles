import { protectedProcedure } from '../../../../trpc';
import { z } from 'zod';

export const validateCouponProcedure = protectedProcedure
  .input(
    z.object({
      code: z.string().min(1),
      planId: z.string().optional(),
      userId: z.string().optional(),
      amount: z.number().min(0).optional(),
    })
  )
  .query(async ({ input, ctx }) => {
    try {
      console.log('🔍 Validating coupon:', {
        code: input.code,
        planId: input.planId,
        userId: input.userId || ctx.user?.id,
        amount: input.amount,
      });

      const userId = input.userId || ctx.user?.id;
      const upperCode = input.code.toUpperCase();

      // Enhanced coupon database with more validation rules
      const validCoupons: Record<string, {
        id: string;
        code: string;
        name: string;
        description: string;
        type: 'percentage' | 'fixed';
        discount: number;
        validFrom: string;
        validUntil: string;
        maxUses?: number;
        maxUsesPerUser?: number;
        currentUses: number;
        userUses: Record<string, number>;
        minimumAmount?: number;
        applicablePlans?: string[];
        isActive: boolean;
        isFirstTimeOnly: boolean;
      }> = {
        'LAUNCH50': {
          id: 'coupon_1',
          code: 'LAUNCH50',
          name: 'Launch Special',
          description: '50% off launch special',
          type: 'percentage',
          discount: 50,
          validFrom: '2024-01-01T00:00:00Z',
          validUntil: '2025-12-31T23:59:59Z',
          maxUses: 1000,
          maxUsesPerUser: 1,
          currentUses: 245,
          userUses: { 'user_1': 1, 'user_2': 1 },
          minimumAmount: 0,
          applicablePlans: ['premium', 'lifetime'],
          isActive: true,
          isFirstTimeOnly: true,
        },
        'LIFETIME25': {
          id: 'coupon_2',
          code: 'LIFETIME25',
          name: 'Lifetime Discount',
          description: '25% off lifetime plan',
          type: 'percentage',
          discount: 25,
          validFrom: '2024-06-01T00:00:00Z',
          validUntil: '2025-08-31T23:59:59Z',
          maxUses: 500,
          maxUsesPerUser: 1,
          currentUses: 89,
          userUses: { 'user_3': 1 },
          minimumAmount: 0,
          applicablePlans: ['lifetime'],
          isActive: true,
          isFirstTimeOnly: false,
        },
        'SAVE20': {
          id: 'coupon_3',
          code: 'SAVE20',
          name: 'Save $20',
          description: '$20 off any plan',
          type: 'fixed',
          discount: 20,
          validFrom: '2024-07-01T00:00:00Z',
          validUntil: '2025-09-30T23:59:59Z',
          maxUses: 2000,
          maxUsesPerUser: 2,
          currentUses: 456,
          userUses: { 'user_1': 1, 'user_4': 2 },
          minimumAmount: 50,
          applicablePlans: undefined,
          isActive: true,
          isFirstTimeOnly: false,
        },
        'WELCOME10': {
          id: 'coupon_4',
          code: 'WELCOME10',
          name: 'Welcome Discount',
          description: '10% off for first-time users',
          type: 'percentage',
          discount: 10,
          validFrom: '2024-01-01T00:00:00Z',
          validUntil: '2024-12-31T23:59:59Z',
          maxUses: undefined,
          maxUsesPerUser: 1,
          currentUses: 1234,
          userUses: { 'user_5': 1 },
          minimumAmount: 0,
          applicablePlans: undefined,
          isActive: false,
          isFirstTimeOnly: true,
        },
        'STUDENT15': {
          id: 'coupon_5',
          code: 'STUDENT15',
          name: 'Student Discount',
          description: '15% off for students',
          type: 'percentage',
          discount: 15,
          validFrom: '2024-09-01T00:00:00Z',
          validUntil: '2025-06-30T23:59:59Z',
          maxUses: undefined,
          maxUsesPerUser: 1,
          currentUses: 67,
          userUses: {},
          minimumAmount: 0,
          applicablePlans: ['premium'],
          isActive: true,
          isFirstTimeOnly: false,
        },
      };

      const coupon = validCoupons[upperCode];
      
      if (!coupon) {
        return {
          success: false,
          valid: false,
          error: 'Coupon code not found',
          code: upperCode,
        };
      }

      // Validation checks
      const now = new Date();
      const validFrom = new Date(coupon.validFrom);
      const validUntil = new Date(coupon.validUntil);
      const userUsageCount = userId ? (coupon.userUses[userId] || 0) : 0;

      // Check if coupon is active
      if (!coupon.isActive) {
        return {
          success: false,
          valid: false,
          error: 'This coupon is currently inactive',
          code: upperCode,
        };
      }

      // Check date validity
      if (now < validFrom) {
        return {
          success: false,
          valid: false,
          error: 'This coupon is not yet valid',
          code: upperCode,
          validFrom: coupon.validFrom,
        };
      }

      if (now > validUntil) {
        return {
          success: false,
          valid: false,
          error: 'This coupon has expired',
          code: upperCode,
          validUntil: coupon.validUntil,
        };
      }

      // Check maximum uses
      if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
        return {
          success: false,
          valid: false,
          error: 'This coupon has reached its usage limit',
          code: upperCode,
        };
      }

      // Check per-user usage limit
      if (userId && coupon.maxUsesPerUser && userUsageCount >= coupon.maxUsesPerUser) {
        return {
          success: false,
          valid: false,
          error: 'You have already used this coupon the maximum number of times',
          code: upperCode,
        };
      }

      // Check minimum amount
      if (input.amount && coupon.minimumAmount && input.amount < coupon.minimumAmount) {
        return {
          success: false,
          valid: false,
          error: `This coupon requires a minimum purchase of $${coupon.minimumAmount}`,
          code: upperCode,
          minimumAmount: coupon.minimumAmount,
        };
      }

      // Check plan restrictions
      if (input.planId && coupon.applicablePlans && !coupon.applicablePlans.includes(input.planId)) {
        const planNames = {
          premium: 'Premium',
          lifetime: 'Lifetime',
          org_small: 'Small Church',
          org_medium: 'Medium Church',
          org_large: 'Large Church',
        };
        
        const applicablePlanNames = coupon.applicablePlans.map(p => planNames[p as keyof typeof planNames] || p).join(', ');
        
        return {
          success: false,
          valid: false,
          error: `This coupon is only valid for: ${applicablePlanNames}`,
          code: upperCode,
          applicablePlans: coupon.applicablePlans,
        };
      }

      // Check first-time user restriction
      if (coupon.isFirstTimeOnly && userId) {
        // In a real app, check if user has any previous purchases
        const hasExistingPurchases = false; // Mock check
        
        if (hasExistingPurchases) {
          return {
            success: false,
            valid: false,
            error: 'This coupon is only valid for first-time users',
            code: upperCode,
          };
        }
      }

      // Calculate discount
      let discountAmount = 0;
      let finalAmount = input.amount || 0;
      
      if (input.amount) {
        if (coupon.type === 'percentage') {
          discountAmount = Math.round(input.amount * (coupon.discount / 100));
        } else {
          discountAmount = Math.min(coupon.discount, input.amount);
        }
        finalAmount = Math.max(0, input.amount - discountAmount);
      }

      console.log('✅ Coupon validation successful:', {
        code: upperCode,
        valid: true,
        discount: coupon.discount,
        type: coupon.type,
        discountAmount,
        finalAmount,
      });

      return {
        success: true,
        valid: true,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          name: coupon.name,
          description: coupon.description,
          type: coupon.type,
          discount: coupon.discount,
          validUntil: coupon.validUntil,
          discountAmount,
          finalAmount,
          remainingUses: coupon.maxUses ? coupon.maxUses - coupon.currentUses : undefined,
          userRemainingUses: coupon.maxUsesPerUser ? coupon.maxUsesPerUser - userUsageCount : undefined,
        },
      };
    } catch (error) {
      console.error('❌ Coupon validation error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        success: false,
        valid: false,
        error: `Failed to validate coupon: ${errorMessage}`,
        code: input.code,
      };
    }
  });