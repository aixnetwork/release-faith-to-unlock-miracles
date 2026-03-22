import { protectedProcedure } from '@/backend/trpc/trpc';
import { z } from 'zod';

export const updatePaymentMethodProcedure = protectedProcedure
  .input(
    z.object({
      affiliateId: z.string(),
      method: z.enum(['bank_transfer', 'paypal', 'stripe']),
      details: z.object({
        accountName: z.string().optional(),
        accountNumber: z.string().optional(),
        routingNumber: z.string().optional(),
        email: z.string().email().optional(),
      }),
    })
  )
  .mutation(async ({ input }) => {
    // In a real app, you would update the payment method in your database
    
    // For demo purposes, we'll just return a mock response
    return {
      success: true,
      message: `Payment method updated to ${input.method}.`
    };
  });