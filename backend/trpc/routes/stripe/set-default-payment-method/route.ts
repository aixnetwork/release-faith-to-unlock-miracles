import { protectedProcedure } from '../../../trpc';
import { z } from 'zod';

// This is a mock implementation for demonstration purposes
// In a real app, you would integrate with the Stripe API

export const setDefaultPaymentMethodProcedure = protectedProcedure
  .input(
    z.object({
      paymentMethodId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    // In a real implementation, you would:
    // 1. Get the customer ID from the authenticated user
    // 2. Call Stripe API to set the default payment method
    
    // Mock implementation
    const { paymentMethodId } = input;
    console.log(`Setting default payment method ${paymentMethodId} for user`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true };
    
    /* 
    // Real implementation would look like this:
    
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    const customerId = ctx.user.stripeCustomerId;
    
    if (!customerId) {
      throw new Error('No customer found');
    }
    
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: input.paymentMethodId,
      },
    });
    
    return { success: true };
    */
  });