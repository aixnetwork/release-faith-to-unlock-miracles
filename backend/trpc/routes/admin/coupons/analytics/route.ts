import { protectedProcedure } from '../../../../trpc';
import { z } from 'zod';

export const couponAnalyticsProcedure = protectedProcedure
  .input(
    z.object({
      period: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
      couponId: z.string().optional(),
    })
  )
  .query(async ({ input, ctx }) => {
    try {
      console.log('📊 Fetching coupon analytics:', {
        period: input.period,
        couponId: input.couponId,
        adminId: ctx.user?.id,
      });

      // Check if user is admin
      if (!ctx.user || !ctx.user.isAdmin) {
        throw new Error('Unauthorized: Admin access required');
      }

      // Mock analytics data - in a real app, this would come from database
      const mockAnalytics = {
        overview: {
          totalCoupons: 5,
          activeCoupons: 4,
          totalUses: 2091,
          totalSavings: 45678.50,
          conversionRate: 12.5,
        },
        topCoupons: [
          {
            id: 'coupon_4',
            code: 'WELCOME10',
            name: 'Welcome Discount',
            uses: 1234,
            savings: 15420.30,
            conversionRate: 18.2,
          },
          {
            id: 'coupon_3',
            code: 'SAVE20',
            name: 'Save $20',
            uses: 456,
            savings: 9120.00,
            conversionRate: 15.8,
          },
          {
            id: 'coupon_1',
            code: 'LAUNCH50',
            name: 'Launch Special',
            uses: 245,
            savings: 18234.75,
            conversionRate: 22.1,
          },
        ],
        usageOverTime: [
          { date: '2024-09-16', uses: 45, savings: 892.50 },
          { date: '2024-09-17', uses: 52, savings: 1045.20 },
          { date: '2024-09-18', uses: 38, savings: 756.80 },
          { date: '2024-09-19', uses: 61, savings: 1234.90 },
          { date: '2024-09-20', uses: 47, savings: 923.40 },
          { date: '2024-09-21', uses: 55, savings: 1089.75 },
          { date: '2024-09-22', uses: 49, savings: 967.30 },
          { date: '2024-09-23', uses: 58, savings: 1145.60 },
        ],
        planBreakdown: [
          { planId: 'premium', planName: 'Premium', uses: 856, percentage: 41.0 },
          { planId: 'lifetime', planName: 'Lifetime', uses: 634, percentage: 30.3 },
          { planId: 'org_small', planName: 'Small Church', uses: 345, percentage: 16.5 },
          { planId: 'org_medium', planName: 'Medium Church', uses: 156, percentage: 7.5 },
          { planId: 'org_large', planName: 'Large Church', uses: 100, percentage: 4.8 },
        ],
        userTypes: [
          { type: 'new_users', label: 'New Users', uses: 1456, percentage: 69.6 },
          { type: 'existing_users', label: 'Existing Users', uses: 635, percentage: 30.4 },
        ],
      };

      // If specific coupon requested, filter data
      if (input.couponId) {
        const specificCoupon = mockAnalytics.topCoupons.find(c => c.id === input.couponId);
        if (specificCoupon) {
          return {
            success: true,
            analytics: {
              ...mockAnalytics,
              overview: {
                ...mockAnalytics.overview,
                totalCoupons: 1,
                activeCoupons: 1,
                totalUses: specificCoupon.uses,
                totalSavings: specificCoupon.savings,
                conversionRate: specificCoupon.conversionRate,
              },
              topCoupons: [specificCoupon],
            },
          };
        }
      }

      console.log('✅ Coupon analytics fetched successfully:', {
        period: input.period,
        totalUses: mockAnalytics.overview.totalUses,
        totalSavings: mockAnalytics.overview.totalSavings,
      });

      return {
        success: true,
        analytics: mockAnalytics,
      };
    } catch (error) {
      console.error('❌ Coupon analytics error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        success: false,
        error: `Failed to fetch coupon analytics: ${errorMessage}`,
        analytics: null,
      };
    }
  });