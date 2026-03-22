import { protectedProcedure } from '@/backend/trpc/trpc';
import { z } from 'zod';

export const getPayoutsProcedure = protectedProcedure
  .input(
    z.object({
      affiliateId: z.string(),
      status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
      limit: z.number().optional(),
      offset: z.number().optional(),
    })
  )
  .query(async ({ input }) => {
    // In a real app, you would fetch this from your database
    // For demo purposes, we'll return mock data
    
    const mockPayouts = [
      {
        id: 'payout_1',
        affiliateId: input.affiliateId,
        amount: 25.99,
        status: 'completed',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        method: 'bank_transfer',
        reference: 'REF123456'
      },
      {
        id: 'payout_2',
        affiliateId: input.affiliateId,
        amount: 15.50,
        status: 'processing',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        method: 'paypal',
        reference: null
      },
      {
        id: 'payout_3',
        affiliateId: input.affiliateId,
        amount: 10.25,
        status: 'pending',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        method: 'stripe',
        reference: null
      },
      {
        id: 'payout_4',
        affiliateId: input.affiliateId,
        amount: 5.75,
        status: 'failed',
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
        method: 'bank_transfer',
        reference: 'REF789012'
      },
      {
        id: 'payout_5',
        affiliateId: input.affiliateId,
        amount: 30.00,
        status: 'completed',
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
        method: 'paypal',
        reference: 'REF345678'
      }
    ];
    
    // Filter by status if provided
    let filteredPayouts = input.status 
      ? mockPayouts.filter(p => p.status === input.status)
      : mockPayouts;
    
    // Apply pagination
    const limit = input.limit || 10;
    const offset = input.offset || 0;
    const paginatedPayouts = filteredPayouts.slice(offset, offset + limit);
    
    return {
      payouts: paginatedPayouts,
      total: filteredPayouts.length
    };
  });