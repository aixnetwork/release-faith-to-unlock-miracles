import { protectedProcedure } from '../../../trpc';

export const getAffiliateStatsProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    try {
      // Mock affiliate stats data
      // In a real implementation, you would fetch from database
      return {
        totalReferrals: 25,
        activeReferrals: 18,
        totalEarnings: 1250.00,
        pendingEarnings: 350.00,
        paidEarnings: 900.00,
        conversionRate: 0.72,
        clickThroughRate: 0.15,
        monthlyStats: [
          { month: 'Jan', referrals: 3, earnings: 150 },
          { month: 'Feb', referrals: 5, earnings: 250 },
          { month: 'Mar', referrals: 8, earnings: 400 },
          { month: 'Apr', referrals: 9, earnings: 450 },
        ],
        topPerformingContent: [
          { title: 'Prayer Plans', clicks: 120, conversions: 15 },
          { title: 'AI Assistant', clicks: 95, conversions: 12 },
          { title: 'Community Features', clicks: 80, conversions: 8 },
        ],
      };
    } catch (error) {
      console.error('Get affiliate stats error:', error);
      throw new Error('Failed to fetch affiliate stats');
    }
  });