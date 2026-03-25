import { protectedProcedure } from '@/backend/trpc/trpc';
import { z } from 'zod';

export const requestPayoutProcedure = protectedProcedure
  .input(
    z.object({
      affiliateId: z.string(),
      amount: z.number().positive(),
      method: z.enum(['bank_transfer', 'paypal', 'stripe']),
    })
  )
  .mutation(async ({ input }) => {
    // In a real app, you would create a payout record in your database
    // and potentially trigger a payment process
    
    // For demo purposes, we'll just return a mock response
    const payoutId = `payout_${Date.now()}`;
    
    return {
      success: true,
      payoutId,
      status: 'pending',
      message: `Payout request for $${input.amount.toFixed(2)} has been submitted.`
    };
  });