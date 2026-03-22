import { protectedProcedure } from '@/backend/trpc/trpc';
import { z } from 'zod';

export const getReferralsProcedure = protectedProcedure
  .input(
    z.object({
      affiliateId: z.string(),
      status: z.enum(['pending', 'registered', 'subscribed', 'expired']).optional(),
      limit: z.number().optional(),
      offset: z.number().optional(),
    })
  )
  .query(async ({ input }) => {
    // In a real app, you would fetch this from your database
    // For demo purposes, we'll return mock data
    
    const mockReferrals = [
      {
        id: 'ref_1',
        affiliateId: input.affiliateId,
        referredEmail: 'john.doe@example.com',
        referredName: 'John Doe',
        status: 'subscribed',
        plan: 'premium',
        commission: 4.99 * 0.2,
        date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(), // 40 days ago
        paidOut: true
      },
      {
        id: 'ref_2',
        affiliateId: input.affiliateId,
        referredEmail: 'jane.smith@example.com',
        referredName: 'Jane Smith',
        status: 'registered',
        plan: null,
        commission: 0,
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        paidOut: false
      },
      {
        id: 'ref_3',
        affiliateId: input.affiliateId,
        referredEmail: 'mike.johnson@example.com',
        referredName: 'Mike Johnson',
        status: 'subscribed',
        plan: 'pro',
        commission: 9.99 * 0.2,
        date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
        paidOut: false
      },
      {
        id: 'ref_4',
        affiliateId: input.affiliateId,
        referredEmail: 'sarah.williams@example.com',
        referredName: 'Sarah Williams',
        status: 'expired',
        plan: 'premium',
        commission: 0,
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
        paidOut: false
      },
      {
        id: 'ref_5',
        affiliateId: input.affiliateId,
        referredEmail: 'david.brown@example.com',
        referredName: 'David Brown',
        status: 'pending',
        plan: null,
        commission: 0,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        paidOut: false
      }
    ];
    
    // Filter by status if provided
    let filteredReferrals = input.status 
      ? mockReferrals.filter(r => r.status === input.status)
      : mockReferrals;
    
    // Apply pagination
    const limit = input.limit || 10;
    const offset = input.offset || 0;
    const paginatedReferrals = filteredReferrals.slice(offset, offset + limit);
    
    return {
      referrals: paginatedReferrals,
      total: filteredReferrals.length
    };
  });