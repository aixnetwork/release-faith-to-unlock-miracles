import { protectedProcedure } from '../../../../trpc';
import { z } from 'zod';

export const getCouponsProcedure = protectedProcedure
  .input(
    z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      search: z.string().optional(),
      status: z.enum(['all', 'active', 'inactive', 'expired']).default('all'),
      sortBy: z.enum(['createdAt', 'code', 'discount', 'uses']).default('createdAt'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    })
  )
  .query(async ({ input, ctx }) => {
    try {
      console.log('📋 Fetching coupons:', {
        page: input.page,
        limit: input.limit,
        search: input.search,
        status: input.status,
        adminId: ctx.user?.id,
      });

      // Check if user is admin
      if (!ctx.user || !ctx.user.isAdmin) {
        throw new Error('Unauthorized: Admin access required');
      }

      // Mock coupon data - in a real app, this would come from database
      const mockCoupons = [
        {
          id: 'coupon_1',
          code: 'LAUNCH50',
          name: 'Launch Special',
          description: '50% off launch special for new users',
          type: 'percentage' as const,
          discount: 50,
          validFrom: '2024-01-01T00:00:00Z',
          validUntil: '2025-12-31T23:59:59Z',
          maxUses: 1000,
          maxUsesPerUser: 1,
          currentUses: 245,
          minimumAmount: 0,
          applicablePlans: ['premium', 'lifetime'],
          isActive: true,
          isFirstTimeOnly: true,
          createdAt: '2024-01-01T00:00:00Z',
          createdBy: 'admin_1',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'coupon_2',
          code: 'LIFETIME25',
          name: 'Lifetime Discount',
          description: '25% off lifetime plan only',
          type: 'percentage' as const,
          discount: 25,
          validFrom: '2024-06-01T00:00:00Z',
          validUntil: '2025-08-31T23:59:59Z',
          maxUses: 500,
          maxUsesPerUser: 1,
          currentUses: 89,
          minimumAmount: 0,
          applicablePlans: ['lifetime'],
          isActive: true,
          isFirstTimeOnly: false,
          createdAt: '2024-06-01T00:00:00Z',
          createdBy: 'admin_1',
          updatedAt: '2024-06-01T00:00:00Z',
        },
        {
          id: 'coupon_3',
          code: 'SAVE20',
          name: 'Save $20',
          description: '$20 off any plan',
          type: 'fixed' as const,
          discount: 20,
          validFrom: '2024-07-01T00:00:00Z',
          validUntil: '2025-09-30T23:59:59Z',
          maxUses: 2000,
          maxUsesPerUser: 2,
          currentUses: 456,
          minimumAmount: 50,
          applicablePlans: undefined,
          isActive: true,
          isFirstTimeOnly: false,
          createdAt: '2024-07-01T00:00:00Z',
          createdBy: 'admin_1',
          updatedAt: '2024-07-01T00:00:00Z',
        },
        {
          id: 'coupon_4',
          code: 'WELCOME10',
          name: 'Welcome Discount',
          description: '10% off for first-time users',
          type: 'percentage' as const,
          discount: 10,
          validFrom: '2024-01-01T00:00:00Z',
          validUntil: '2024-12-31T23:59:59Z',
          maxUses: undefined,
          maxUsesPerUser: 1,
          currentUses: 1234,
          minimumAmount: 0,
          applicablePlans: undefined,
          isActive: false,
          isFirstTimeOnly: true,
          createdAt: '2024-01-01T00:00:00Z',
          createdBy: 'admin_1',
          updatedAt: '2024-08-01T00:00:00Z',
        },
      ];

      // Filter coupons based on search and status
      let filteredCoupons = mockCoupons;
      
      if (input.search) {
        const searchLower = input.search.toLowerCase();
        filteredCoupons = filteredCoupons.filter(coupon => 
          coupon.code.toLowerCase().includes(searchLower) ||
          coupon.name.toLowerCase().includes(searchLower) ||
          coupon.description.toLowerCase().includes(searchLower)
        );
      }

      if (input.status !== 'all') {
        const now = new Date();
        filteredCoupons = filteredCoupons.filter(coupon => {
          const isExpired = new Date(coupon.validUntil) < now;
          const isMaxedOut = coupon.maxUses && coupon.currentUses >= coupon.maxUses;
          
          switch (input.status) {
            case 'active':
              return coupon.isActive && !isExpired && !isMaxedOut;
            case 'inactive':
              return !coupon.isActive;
            case 'expired':
              return isExpired || isMaxedOut;
            default:
              return true;
          }
        });
      }

      // Sort coupons
      filteredCoupons.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (input.sortBy) {
          case 'code':
            aValue = a.code;
            bValue = b.code;
            break;
          case 'discount':
            aValue = a.discount;
            bValue = b.discount;
            break;
          case 'uses':
            aValue = a.currentUses;
            bValue = b.currentUses;
            break;
          default:
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
        }
        
        if (input.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      // Paginate results
      const startIndex = (input.page - 1) * input.limit;
      const endIndex = startIndex + input.limit;
      const paginatedCoupons = filteredCoupons.slice(startIndex, endIndex);

      // Calculate statistics
      const stats = {
        total: mockCoupons.length,
        active: mockCoupons.filter(c => c.isActive && new Date(c.validUntil) > new Date()).length,
        expired: mockCoupons.filter(c => new Date(c.validUntil) < new Date()).length,
        totalUses: mockCoupons.reduce((sum, c) => sum + c.currentUses, 0),
      };

      console.log('✅ Coupons fetched successfully:', {
        total: filteredCoupons.length,
        page: input.page,
        returned: paginatedCoupons.length,
      });

      return {
        success: true,
        coupons: paginatedCoupons,
        pagination: {
          page: input.page,
          limit: input.limit,
          total: filteredCoupons.length,
          pages: Math.ceil(filteredCoupons.length / input.limit),
        },
        stats,
      };
    } catch (error) {
      console.error('❌ Get coupons error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        success: false,
        error: `Failed to fetch coupons: ${errorMessage}`,
        coupons: [],
        pagination: {
          page: input.page,
          limit: input.limit,
          total: 0,
          pages: 0,
        },
        stats: {
          total: 0,
          active: 0,
          expired: 0,
          totalUses: 0,
        },
      };
    }
  });