import { protectedProcedure } from '../../../trpc';
import { z } from 'zod';

// This is a mock implementation for demonstration purposes
// In a real app, you would integrate with the Stripe API

export const removePaymentMethodProcedure = protectedProcedure
  .input(
    z.object({
      paymentMethodId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    // In a real implementation, you would:
    // 1. Verify that the payment method belongs to the authenticated user
    // 2. Call Stripe API to detach the payment method
    
    // Mock implementation
    const { paymentMethodId } = input;
    console.log(`Removing payment method ${paymentMethodId} for user`);
    
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
    
    // Verify the payment method belongs to this customer
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    
    const paymentMethodBelongsToCustomer = paymentMethods.data.some(
      method => method.id === input.paymentMethodId
    );
    
    if (!paymentMethodBelongsToCustomer) {
      throw new Error('Payment method does not belong to this customer');
    }
    
    // Detach the payment method
    await stripe.paymentMethods.detach(input.paymentMethodId);
    
    return { success: true };
    */
  });